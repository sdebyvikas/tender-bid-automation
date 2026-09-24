import { readDB, writeDB } from "../config/db.js";
import { calculateGoNoGoScore } from "../services/goNoGoEngine.js";

export async function getCompanyProfile(req, res) {
  try {
    const db = readDB();
    res.json({ success: true, companyProfile: db.companyProfile });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function updateCompanyProfile(req, res) {
  try {
    const db = readDB();
    db.companyProfile = {
      ...db.companyProfile,
      ...req.body,
    };

    // Recalculate average turnover if updated
    if (db.companyProfile.annualTurnover?.length > 0) {
      const sum = db.companyProfile.annualTurnover.reduce(
        (acc, curr) => acc + (Number(curr.amountINR) || 0),
        0,
      );
      db.companyProfile.averageTurnoverINR = Math.round(
        sum / db.companyProfile.annualTurnover.length,
      );
    }

    // Automatically recalculate Go/No-Go score across all existing tenders with updated profile
    db.tenders.forEach((tender) => {
      tender.goNoGoAnalysis = calculateGoNoGoScore(tender, db.companyProfile);
    });

    writeDB(db);
    res.json({
      success: true,
      message: "Company Profile updated and all tender scores re-evaluated!",
      companyProfile: db.companyProfile,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function uploadVaultDocument(req, res) {
  try {
    const db = readDB();
    if (!db.companyProfile.statutoryDocuments) {
      db.companyProfile.statutoryDocuments = [];
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

    // If renewed ISO 27001 is uploaded, update company certifications
    if (nameLower.includes("iso 27001") && tag === "Verified") {
      db.companyProfile.certifications = db.companyProfile.certifications.map(
        (c) =>
          c.includes("ISO 27001")
            ? "ISO 27001:2022 (Information Security Management) - Verified Active"
            : c,
      );
    }

    db.companyProfile.statutoryDocuments.unshift(newDoc);

    // Calculate readiness score (verified count / total count)
    const verifiedCount = db.companyProfile.statutoryDocuments.filter(
      (d) => d.tag === "Verified",
    ).length;
    const totalCount = db.companyProfile.statutoryDocuments.length;
    db.companyProfile.readinessScore = Math.min(
      100,
      Math.round((verifiedCount / totalCount) * 100),
    );

    // Recalculate all tender scores
    db.tenders.forEach((tender) => {
      tender.goNoGoAnalysis = calculateGoNoGoScore(tender, db.companyProfile);
    });

    writeDB(db);

    res.json({
      success: true,
      message: `Document "${name}" added to Company Vault successfully!`,
      document: newDoc,
      companyProfile: db.companyProfile,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function deleteVaultDocument(req, res) {
  try {
    const { docId } = req.params;
    const db = readDB();

    if (!db.companyProfile.statutoryDocuments) {
      return res
        .status(404)
        .json({ success: false, error: "No documents found" });
    }

    db.companyProfile.statutoryDocuments =
      db.companyProfile.statutoryDocuments.filter((d) => d.id !== docId);

    // Recalculate readiness score
    const verifiedCount = db.companyProfile.statutoryDocuments.filter(
      (d) => d.tag === "Verified",
    ).length;
    const totalCount = db.companyProfile.statutoryDocuments.length || 1;
    db.companyProfile.readinessScore = Math.min(
      100,
      Math.round((verifiedCount / totalCount) * 100),
    );

    // Recalculate all tender scores
    db.tenders.forEach((tender) => {
      tender.goNoGoAnalysis = calculateGoNoGoScore(tender, db.companyProfile);
    });

    writeDB(db);

    res.json({
      success: true,
      message: "Document removed from Company Vault",
      companyProfile: db.companyProfile,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}
