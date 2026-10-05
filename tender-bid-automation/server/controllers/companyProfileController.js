import path from "path";
import CompanyProfile from "../models/CompanyProfile.js";
import { readDB, writeDB } from "../config/db.js";
import { calculateGoNoGoScore } from "../services/goNoGoEngine.js";

// Helper to get or initialize company profile from MongoDB
async function getMongoProfile() {
  let profile = await CompanyProfile.findOne();
  if (!profile) {
    const db = readDB();
    const initial = db.companyProfile || {
      id: "comp_techsolutions",
      name: "Tech Solutions Pvt Ltd",
    };
    profile = await CompanyProfile.create(initial);
  }
  return profile;
}

export async function getCompanyProfile(req, res) {
  try {
    let profile = await CompanyProfile.findOne().lean();
    if (!profile) {
      profile = await getMongoProfile();
      profile = profile.toObject ? profile.toObject() : profile;
    }

    // Sync in-memory/file DB for any other service reading readDB()
    const db = readDB();
    db.companyProfile = profile;
    writeDB(db);

    res.json({
      success: true,
      source: "MongoDB",
      companyProfile: profile,
    });
  } catch (err) {
    console.warn("MongoDB getCompanyProfile fallback to JSON:", err.message);
    const db = readDB();
    res.json({
      success: true,
      source: "Local Store",
      companyProfile: db.companyProfile,
    });
  }
}

export async function updateCompanyProfile(req, res) {
  try {
    const updateData = { ...req.body };

    // Recalculate average turnover if updated
    if (
      updateData.annualTurnover &&
      Array.isArray(updateData.annualTurnover) &&
      updateData.annualTurnover.length > 0
    ) {
      const sum = updateData.annualTurnover.reduce(
        (acc, curr) => acc + (Number(curr.amountINR) || 0),
        0,
      );
      updateData.averageTurnoverINR = Math.round(
        sum / updateData.annualTurnover.length,
      );
    }

    let updated = await CompanyProfile.findOneAndUpdate({}, updateData, {
      new: true,
      upsert: true,
      runValidators: true,
    }).lean();

    // Sync with local DB file & recalculate Go/No-Go score across all tenders
    const db = readDB();
    db.companyProfile = updated;
    if (db.tenders && Array.isArray(db.tenders)) {
      db.tenders.forEach((tender) => {
        tender.goNoGoAnalysis = calculateGoNoGoScore(tender, db.companyProfile);
      });
    }
    writeDB(db);

    res.json({
      success: true,
      message:
        "Company Vault updated in MongoDB & all tender scores re-evaluated!",
      source: "MongoDB",
      companyProfile: updated,
    });
  } catch (err) {
    console.error("Error updating company profile in MongoDB:", err);
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function uploadVaultDocument(req, res) {
  try {
    let profile = await CompanyProfile.findOne();
    if (!profile) {
      profile = await getMongoProfile();
    }

    const file = req.file;
    const name = req.body.name || file?.originalname || "Statutory Document";
    const category = req.body.category || "Statutory";
    const expiryDate = req.body.expiryDate || null;

    let tag = req.body.tag || "Verified";
    if (expiryDate) {
      const exp = new Date(expiryDate);
      const now = new Date();
      const diffDays = Math.ceil((exp - now) / (1000 * 60 * 60 * 24));
      if (diffDays < 0) {
        tag = "Expired";
      } else if (diffDays <= 60) {
        tag = "Expiring";
      } else {
        tag = "Verified";
      }
    }

    // Determine icon
    let icon = "FileText";
    const nameLower = name.toLowerCase();
    if (
      nameLower.includes("iso") ||
      nameLower.includes("security") ||
      nameLower.includes("gst")
    ) {
      icon = "ShieldCheck";
    } else if (
      nameLower.includes("turnover") ||
      nameLower.includes("financial") ||
      nameLower.includes("balance") ||
      nameLower.includes("solvency")
    ) {
      icon = "CircleDollarSign";
    } else if (
      nameLower.includes("cv") ||
      nameLower.includes("personnel") ||
      nameLower.includes("team")
    ) {
      icon = "Users";
    } else if (
      nameLower.includes("incorporation") ||
      nameLower.includes("certificate") ||
      nameLower.includes("msme") ||
      nameLower.includes("udyam")
    ) {
      icon = "FileCheck2";
    }

    const fileSizeStr = file
      ? file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${(file.size / 1024).toFixed(0)} KB`
      : "450 KB";
    const dateStr = new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    const newDoc = {
      id: `doc_${Date.now()}`,
      name,
      meta: `Uploaded ${dateStr} · ${fileSizeStr}${expiryDate ? ` · Exp: ${expiryDate}` : ""}`,
      tag,
      category,
      icon,
      fileName: file?.filename || null,
      fileUrl: file?.filename ? `/uploads/${file.filename}` : null,
      fileType:
        file?.mimetype ||
        (file?.filename ? path.extname(file.filename) : "document"),
      originalName: file?.originalname || null,
      expiryDate,
      uploadedAt: new Date().toISOString(),
    };

    if (!profile.statutoryDocuments) {
      profile.statutoryDocuments = [];
    }

    // If renewed ISO 27001 is uploaded, update company certifications
    if (nameLower.includes("iso 27001") && tag === "Verified") {
      profile.certifications = (profile.certifications || []).map((c) =>
        c.includes("ISO 27001")
          ? "ISO 27001:2022 (Information Security Management) - Verified Active"
          : c,
      );
    }

    profile.statutoryDocuments.unshift(newDoc);

    // Calculate readiness score
    const verifiedCount = profile.statutoryDocuments.filter(
      (d) => d.tag === "Verified",
    ).length;
    const totalCount = profile.statutoryDocuments.length || 1;
    profile.readinessScore = Math.min(
      100,
      Math.round((verifiedCount / totalCount) * 100),
    );

    await profile.save();

    // Sync with local DB file and update tender scores
    const plainProfile = profile.toObject();
    const db = readDB();
    db.companyProfile = plainProfile;
    if (db.tenders && Array.isArray(db.tenders)) {
      db.tenders.forEach((tender) => {
        tender.goNoGoAnalysis = calculateGoNoGoScore(tender, db.companyProfile);
      });
    }
    writeDB(db);

    res.json({
      success: true,
      message: `Document "${name}" saved to MongoDB Company Vault!`,
      source: "MongoDB",
      document: newDoc,
      companyProfile: plainProfile,
    });
  } catch (err) {
    console.error("Error uploading vault doc to MongoDB:", err);
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function deleteVaultDocument(req, res) {
  try {
    const { docId } = req.params;
    let profile = await CompanyProfile.findOne();
    if (!profile) {
      return res
        .status(404)
        .json({ success: false, error: "Company profile not found" });
    }

    profile.statutoryDocuments = (profile.statutoryDocuments || []).filter(
      (d) => d.id !== docId,
    );

    // Recalculate readiness score
    const verifiedCount = profile.statutoryDocuments.filter(
      (d) => d.tag === "Verified",
    ).length;
    const totalCount = profile.statutoryDocuments.length || 1;
    profile.readinessScore = Math.min(
      100,
      Math.round((verifiedCount / totalCount) * 100),
    );

    await profile.save();

    const plainProfile = profile.toObject();
    const db = readDB();
    db.companyProfile = plainProfile;
    if (db.tenders && Array.isArray(db.tenders)) {
      db.tenders.forEach((tender) => {
        tender.goNoGoAnalysis = calculateGoNoGoScore(tender, db.companyProfile);
      });
    }
    writeDB(db);

    res.json({
      success: true,
      message: "Document deleted from MongoDB Company Vault",
      source: "MongoDB",
      companyProfile: plainProfile,
    });
  } catch (err) {
    console.error("Error deleting vault doc from MongoDB:", err);
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function updateVaultDocument(req, res) {
  try {
    const { docId } = req.params;
    let profile = await CompanyProfile.findOne();
    if (!profile) {
      return res
        .status(404)
        .json({ success: false, error: "Company profile not found" });
    }

    if (!profile.statutoryDocuments) {
      profile.statutoryDocuments = [];
    }

    const docIndex = profile.statutoryDocuments.findIndex(
      (d) => d.id === docId,
    );
    if (docIndex === -1) {
      return res
        .status(404)
        .json({ success: false, error: "Document not found in vault" });
    }

    const existingDoc = profile.statutoryDocuments[docIndex];
    const file = req.file;

    const name = req.body.name || existingDoc.name;
    const category = req.body.category || existingDoc.category || "Statutory";
    const expiryDate =
      req.body.expiryDate !== undefined
        ? req.body.expiryDate
        : existingDoc.expiryDate;

    let tag = req.body.tag || existingDoc.tag || "Verified";
    if (expiryDate) {
      const exp = new Date(expiryDate);
      const now = new Date();
      const diffDays = Math.ceil((exp - now) / (1000 * 60 * 60 * 24));
      if (diffDays < 0) {
        tag = "Expired";
      } else if (diffDays <= 60) {
        tag = "Expiring";
      } else {
        tag = "Verified";
      }
    }

    // Determine icon
    let icon = existingDoc.icon || "FileText";
    const nameLower = name.toLowerCase();
    if (
      nameLower.includes("iso") ||
      nameLower.includes("security") ||
      nameLower.includes("gst")
    ) {
      icon = "ShieldCheck";
    } else if (
      nameLower.includes("turnover") ||
      nameLower.includes("financial") ||
      nameLower.includes("balance") ||
      nameLower.includes("solvency")
    ) {
      icon = "CircleDollarSign";
    } else if (
      nameLower.includes("cv") ||
      nameLower.includes("personnel") ||
      nameLower.includes("team")
    ) {
      icon = "Users";
    } else if (
      nameLower.includes("incorporation") ||
      nameLower.includes("certificate") ||
      nameLower.includes("msme") ||
      nameLower.includes("udyam")
    ) {
      icon = "FileCheck2";
    }

    let meta = existingDoc.meta;
    let fileName = existingDoc.fileName;
    let fileUrl = existingDoc.fileUrl;
    let fileType = existingDoc.fileType;
    let originalName = existingDoc.originalName;

    // If replacement file uploaded
    if (file) {
      fileName = file.filename;
      fileUrl = `/uploads/${file.filename}`;
      fileType = file.mimetype || path.extname(file.filename) || "document";
      originalName = file.originalname;

      const fileSizeStr =
        file.size > 1024 * 1024
          ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
          : `${(file.size / 1024).toFixed(0)} KB`;
      const dateStr = new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
      meta = `Updated ${dateStr} · ${fileSizeStr}${expiryDate ? ` · Exp: ${expiryDate}` : ""}`;
    } else if (expiryDate && existingDoc.meta) {
      meta =
        existingDoc.meta.replace(/· Exp:.*$/, "").trim() +
        ` · Exp: ${expiryDate}`;
    }

    const updatedDoc = {
      id: existingDoc.id,
      name,
      meta,
      tag,
      category,
      icon,
      fileName,
      fileUrl,
      fileType,
      originalName,
      expiryDate,
      uploadedAt: existingDoc.uploadedAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    profile.statutoryDocuments[docIndex] = updatedDoc;

    // Recalculate readiness score
    const verifiedCount = profile.statutoryDocuments.filter(
      (d) => d.tag === "Verified",
    ).length;
    const totalCount = profile.statutoryDocuments.length || 1;
    profile.readinessScore = Math.min(
      100,
      Math.round((verifiedCount / totalCount) * 100),
    );

    await profile.save();

    // Sync with local DB file and update tender scores
    const plainProfile = profile.toObject();
    const db = readDB();
    db.companyProfile = plainProfile;
    if (db.tenders && Array.isArray(db.tenders)) {
      db.tenders.forEach((tender) => {
        tender.goNoGoAnalysis = calculateGoNoGoScore(tender, db.companyProfile);
      });
    }
    writeDB(db);

    res.json({
      success: true,
      message: `Document "${name}" updated in MongoDB Company Vault!`,
      source: "MongoDB",
      document: updatedDoc,
      companyProfile: plainProfile,
    });
  } catch (err) {
    console.error("Error updating vault document in MongoDB:", err);
    res.status(500).json({ success: false, error: err.message });
  }
}
