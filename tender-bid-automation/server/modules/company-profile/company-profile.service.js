import fs from "fs";
import path from "path";
import pdfParse from "pdf-parse";
import Tesseract from "tesseract.js";
import { UPLOADS_DIR } from "../../config/db.js";
import { CompanyProfileRepository } from "./company-profile.repository.js";
import { calculateReadinessScore } from "./company-profile.validation.js";

/**
 * Normalizes and fixes OCR noise in Indian PAN card numbers (5 letters + 4 digits + 1 letter)
 */
function normalizePAN(text) {
  if (!text) return null;

  // 1. Direct exact PAN regex (e.g. AXDPR2606K, AAVFB2670G)
  const exactMatch = text.match(/\b([A-Z]{5}[0-9]{4}[A-Z])\b/i);
  if (exactMatch) return exactMatch[1].toUpperCase();

  // 2. Keyword context search (Permanent Account Number / PAN)
  const keywordMatch = text.match(
    /(?:Permanent\s*Account|PAN|Account\s*Number)[\s\S]{0,50}?([A-Z0-9]{10})/i
  );
  if (keywordMatch) {
    const fixed = fixOcrPan(keywordMatch[1].toUpperCase());
    if (fixed) return fixed;
  }

  // 3. Scan all 10-char alphanumeric tokens with OCR character correction
  const tokens = text.match(/[A-Za-z0-9]{8,12}/g) || [];
  for (const token of tokens) {
    if (token.length === 10) {
      const fixed = fixOcrPan(token);
      if (fixed) return fixed;
    }
  }

  return null;
}

function fixOcrPan(clean) {
  if (!clean || clean.length !== 10) return null;
  let lettersPart = clean
    .slice(0, 5)
    .replace(/0/g, "O")
    .replace(/1/g, "I")
    .replace(/5/g, "S")
    .replace(/8/g, "B")
    .replace(/2/g, "Z");

  let digitsPart = clean
    .slice(5, 9)
    .replace(/O/g, "0")
    .replace(/o/g, "0")
    .replace(/I/g, "1")
    .replace(/l/g, "1")
    .replace(/S/g, "5")
    .replace(/s/g, "5")
    .replace(/B/g, "8")
    .replace(/Z/g, "2");

  let lastLetter = clean
    .slice(9, 10)
    .replace(/0/g, "O")
    .replace(/1/g, "I")
    .replace(/5/g, "S")
    .replace(/8/g, "B")
    .replace(/2/g, "Z");

  const normalized = `${lettersPart}${digitsPart}${lastLetter}`.toUpperCase();
  if (/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(normalized)) {
    return normalized;
  }
  return null;
}

export class CompanyProfileService {
  /**
   * Fetches current company master profile
   */
  static async getProfile() {
    return await CompanyProfileRepository.getProfile();
  }

  /**
   * Updates company profile fields & recalculates averages
   */
  static async updateProfile(updateData) {
    if (
      updateData.annualTurnover &&
      Array.isArray(updateData.annualTurnover) &&
      updateData.annualTurnover.length > 0
    ) {
      const sum = updateData.annualTurnover.reduce(
        (acc, curr) => acc + (Number(curr.amountINR) || 0),
        0
      );
      updateData.averageTurnoverINR = Math.round(
        sum / updateData.annualTurnover.length
      );
      updateData.averageTurnoverDisplay =
        updateData.averageTurnoverINR >= 10000000
          ? `₹${(updateData.averageTurnoverINR / 10000000).toFixed(2)} Cr`
          : `₹${(updateData.averageTurnoverINR / 100000).toFixed(2)} Lakhs`;
    }

    return await CompanyProfileRepository.saveProfile(updateData);
  }

  /**
   * Auto-extracts metadata & credentials from uploaded statutory PDFs or Images (OCR)
   */
  static async autoExtractDocumentCredentials(filePathOrBuffer, originalName = "", mimeType = "") {
    const result = {
      extracted: false,
      name: null,
      pan: null,
      gstin: null,
      cin: null,
      headquarters: null,
      annualTurnover: null,
      averageTurnoverINR: null,
      averageTurnoverDisplay: null,
      netWorthINR: null,
      detectedCategory: null,
      udin: null,
    };

    if (!filePathOrBuffer) return result;

    try {
      let text = "";
      const isBuffer = Buffer.isBuffer(filePathOrBuffer);
      const ext = path.extname(originalName || (typeof filePathOrBuffer === "string" ? filePathOrBuffer : "")).toLowerCase();
      const isImage =
        mimeType.startsWith("image/") ||
        [".jpg", ".jpeg", ".png", ".webp", ".bmp", ".tiff"].includes(ext);

      if (isImage) {
        try {
          const input = isBuffer ? filePathOrBuffer : filePathOrBuffer;
          const ocrResult = await Tesseract.recognize(input, "eng");
          text = ocrResult?.data?.text || "";
        } catch (ocrErr) {
          console.warn("OCR recognition note:", ocrErr.message);
        }
      } else if (ext === ".pdf" || mimeType === "application/pdf") {
        try {
          const dataBuffer = isBuffer ? filePathOrBuffer : fs.readFileSync(filePathOrBuffer);
          const pdfData = await pdfParse(dataBuffer);
          text = pdfData?.text || "";
        } catch (pdfErr) {
          console.warn("PDF parse note:", pdfErr.message);
        }
      }

      if (!text || text.trim().length < 5) return result;

      result.extracted = true;

      // 1. Check for PAN (exact & fuzzy OCR correction)
      const detectedPan = normalizePAN(text);
      if (detectedPan) {
        result.pan = detectedPan;
        result.detectedCategory = "Tax";
      }

      // 2. Check for GSTIN
      const gstMatch = text.match(
        /\b([0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][0-9A-Z]Z[0-9A-Z])\b/i
      );
      if (gstMatch) {
        result.gstin = gstMatch[1].toUpperCase();
        result.detectedCategory = "Tax";
        if (!result.pan) {
          result.pan = result.gstin.substring(2, 12);
        }
      }

      // 3. Check for CIN (Corporate Identification Number)
      const cinMatch = text.match(
        /\b([LUu][0-9]{5}[A-Za-z]{2}[0-9]{4}[A-Za-z]{3}[0-9]{6})\b/i
      );
      if (cinMatch) {
        result.cin = cinMatch[1].toUpperCase();
      }

      // 4. Check for Entity / Company Name
      const nameMatch = text.match(
        /(?:works\s+of|M\/s\.?|Name\s*of\s*the\s*assessee|Trading,\s*Profit\s*&\s*Loss\s*Account\s*for[^\n\r]*\n)\s*[:\-]?\s*([A-Za-z0-9\s,\.\-&]{4,60}?)(?=\s*\(FIRM\)|\s*having\s*PAN|\s*Address|\n)/i
      );
      if (nameMatch && nameMatch[1].trim().length > 3) {
        const clean = nameMatch[1].trim().replace(/\s+/g, " ");
        if (!clean.toLowerCase().includes("chartered")) {
          result.name = clean;
        }
      } else if (isImage && !result.name) {
        // Look for name line on PAN card
        const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
        const skipWords = [
          "INCOME",
          "TAX",
          "DEPARTMENT",
          "GOVT",
          "INDIA",
          "PERMANENT",
          "ACCOUNT",
          "NUMBER",
          "FATHER",
          "SIGNATURE",
          "DATE",
          "BIRTH",
        ];
        for (const line of lines) {
          const upper = line.toUpperCase();
          const isSkip = skipWords.some((w) => upper.includes(w));
          if (
            !isSkip &&
            upper.length >= 4 &&
            upper.length <= 40 &&
            /^[A-Z\s\.\-&]+$/i.test(line)
          ) {
            result.name = line;
            break;
          }
        }
      }

      // 5. Check for CA UDIN
      const udinMatch = text.match(/UDIN\s*[:\-]?\s*([0-9]{18}[A-Z0-9]{0,4})/i);
      if (udinMatch) {
        result.udin = udinMatch[1].toUpperCase();
      }

      // 6. Check for Location / Address
      const locMatch = text.match(
        /(?:JAMNAGAR|AHMEDABAD|MUMBAI|DELHI|BANGALORE|HYDERABAD|KOLKATA|CHENNAI|PUNE|GUWAHATI)[^\n\r]{0,35}/i
      );
      if (locMatch) {
        result.headquarters = `${locMatch[0].trim()}, India`;
      }

      // 7. Check for Annual Turnover in Lakhs/Crores
      const turnoverEntries = [];
      const lines = text.split("\n");
      lines.forEach((line) => {
        const match = line.match(
          /(20\d{2}[-–]\d{2,4})\s*(?:\([^\)]*\))?\s*(?:Rs\.?|INR)?\s*([0-9\.]+|NIL)\s*(?:Lakhs?|Cr)?/i
        );
        if (match) {
          const year = match[1];
          const valStr = match[2].toUpperCase();
          let amountINR = 0;
          let amountDisplay = "NIL";
          if (valStr !== "NIL") {
            const num = parseFloat(valStr);
            if (!isNaN(num) && num > 0) {
              amountINR = Math.round(num * 100000);
              amountDisplay =
                num >= 100
                  ? `₹${(num / 100).toFixed(2)} Cr`
                  : `₹${num.toFixed(2)} Lakhs`;
            }
          }
          if (!turnoverEntries.some((t) => t.year.startsWith(year.slice(0, 4)))) {
            turnoverEntries.push({ year, amountINR, amountDisplay });
          }
        }
      });

      if (turnoverEntries.length > 0) {
        result.annualTurnover = turnoverEntries;
        result.detectedCategory = "Financial";
        const total = turnoverEntries.reduce((acc, curr) => acc + curr.amountINR, 0);
        result.averageTurnoverINR = Math.round(total / (turnoverEntries.length || 1));
        result.averageTurnoverDisplay =
          result.averageTurnoverINR >= 10000000
            ? `₹${(result.averageTurnoverINR / 10000000).toFixed(2)} Cr`
            : `₹${(result.averageTurnoverINR / 100000).toFixed(2)} Lakhs`;
      }

      // 8. Net Worth / Partner Capital
      const capitalMatch = text.match(
        /(?:Proprietor\/partner\s*Capital|Partner's\s*Capital\s*Account|Total\s*of\s*Proprietor\/Partner\s*Capital)[\s\S]{0,40}?([0-9,]+(?:\.[0-9]{2})?)/i
      );
      if (capitalMatch) {
        const rawCap = parseFloat(capitalMatch[1].replace(/,/g, ""));
        if (!isNaN(rawCap) && rawCap > 0) {
          result.netWorthINR = Math.round(rawCap);
        }
      }
    } catch (err) {
      console.warn("Auto-extraction parser note:", err.message);
    }

    return result;
  }

  /**
   * Uploads a document to Vault & auto-syncs Master Profile
   */
  static async uploadVaultDocument(file, bodyData) {
    const { profile } = await CompanyProfileRepository.getProfile();
    const currentDocs = profile.statutoryDocuments || [];

    let name = bodyData.name || file?.originalname || "Statutory Document";
    let category = bodyData.category || "Statutory";
    const expiryDate = bodyData.expiryDate || null;

    let tag = bodyData.tag || "Verified";
    if (expiryDate) {
      const exp = new Date(expiryDate);
      const diffDays = Math.ceil((exp - new Date()) / (1000 * 60 * 60 * 24));
      if (diffDays < 0) tag = "Expired";
      else if (diffDays <= 60) tag = "Expiring";
      else tag = "Verified";
    }

    const nameLower = name.toLowerCase();
    let icon = "FileText";
    if (nameLower.includes("iso") || nameLower.includes("security") || nameLower.includes("gst")) {
      icon = "ShieldCheck";
    } else if (nameLower.includes("turnover") || nameLower.includes("financial") || nameLower.includes("balance") || nameLower.includes("pan")) {
      icon = "CircleDollarSign";
    } else if (nameLower.includes("incorporation") || nameLower.includes("certificate") || nameLower.includes("msme")) {
      icon = "FileCheck2";
    }

    const fileSizeStr = file
      ? file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${(file.size / 1024).toFixed(0)} KB`
      : "500 KB";

    const dateStr = new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    let savedFileName = file?.filename || null;
    let savedFileUrl = file?.filename ? `/uploads/${file.filename}` : null;

    // If file came as a Buffer via memoryStorage, persist it safely
    if (file && file.buffer) {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const safeName = (file.originalname || "document").replace(/[^a-zA-Z0-9.-]/g, "_");
      savedFileName = `vault-${uniqueSuffix}-${safeName}`;
      savedFileUrl = `/uploads/${savedFileName}`;
      try {
        fs.writeFileSync(path.join(UPLOADS_DIR, savedFileName), file.buffer);
      } catch (writeErr) {
        console.warn("Could not save physical file to uploads dir:", writeErr.message);
      }
    }

    const updatePayload = {};

    // Auto-extract credentials from uploaded PDF or Image (OCR)
    if (file && (file.buffer || file.path)) {
      const extracted = await this.autoExtractDocumentCredentials(
        file.buffer || file.path,
        file.originalname || "",
        file.mimetype || ""
      );
      if (extracted.extracted) {
        if (extracted.pan) {
          updatePayload.pan = extracted.pan;
          if (name.toLowerCase() === "pan card" || name.toLowerCase() === "images") {
            name = `PAN Card - ${extracted.pan}`;
          }
        }
        if (extracted.gstin) {
          updatePayload.gstin = extracted.gstin;
        }
        if (extracted.cin) {
          updatePayload.cin = extracted.cin;
        }
        if (extracted.name && (profile.name === "Tech Solutions Pvt Ltd" || !profile.name)) {
          updatePayload.name = extracted.name;
        }
        if (extracted.headquarters) {
          updatePayload.headquarters = extracted.headquarters;
        }
        if (extracted.annualTurnover && extracted.annualTurnover.length > 0) {
          updatePayload.annualTurnover = extracted.annualTurnover;
          updatePayload.averageTurnoverINR = extracted.averageTurnoverINR;
          updatePayload.averageTurnoverDisplay = extracted.averageTurnoverDisplay;
        }
        if (extracted.netWorthINR) {
          updatePayload.netWorthINR = extracted.netWorthINR;
        }
        if (extracted.detectedCategory) {
          category = extracted.detectedCategory;
        }
      }
    }

    const newDoc = {
      id: `doc_${Date.now()}`,
      name,
      meta: `Uploaded ${dateStr} · ${fileSizeStr}${expiryDate ? ` · Exp: ${expiryDate}` : ""}`,
      tag,
      category,
      icon,
      fileName: savedFileName,
      fileUrl: savedFileUrl,
      fileType: file?.mimetype || (file?.originalname ? path.extname(file.originalname) : "document"),
      originalName: file?.originalname || null,
      expiryDate,
      uploadedAt: new Date().toISOString(),
    };

    updatePayload.statutoryDocuments = [newDoc, ...currentDocs];
    updatePayload.readinessScore = calculateReadinessScore(updatePayload.statutoryDocuments);

    const saved = await CompanyProfileRepository.saveProfile({
      ...profile,
      ...updatePayload,
    });

    return { document: newDoc, profile: saved.profile };
  }

  /**
   * Updates an existing document in Vault
   */
  static async updateVaultDocument(docId, file, bodyData) {
    const { profile } = await CompanyProfileRepository.getProfile();
    const currentDocs = [...(profile.statutoryDocuments || [])];
    const docIndex = currentDocs.findIndex((d) => d.id === docId);

    if (docIndex === -1) {
      throw new Error("Document not found in Vault");
    }

    const existingDoc = currentDocs[docIndex];
    const name = bodyData.name || existingDoc.name;
    const category = bodyData.category || existingDoc.category || "Statutory";
    const expiryDate =
      bodyData.expiryDate !== undefined
        ? bodyData.expiryDate
        : existingDoc.expiryDate;

    let tag = bodyData.tag || existingDoc.tag || "Verified";
    if (expiryDate) {
      const exp = new Date(expiryDate);
      const diffDays = Math.ceil((exp - new Date()) / (1000 * 60 * 60 * 24));
      if (diffDays < 0) tag = "Expired";
      else if (diffDays <= 60) tag = "Expiring";
      else tag = "Verified";
    }

    let meta = existingDoc.meta;
    let fileName = existingDoc.fileName;
    let fileUrl = existingDoc.fileUrl;
    let fileType = existingDoc.fileType;
    let originalName = existingDoc.originalName;

    if (file) {
      if (file.buffer) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const safeName = (file.originalname || "document").replace(/[^a-zA-Z0-9.-]/g, "_");
        fileName = `vault-${uniqueSuffix}-${safeName}`;
        fileUrl = `/uploads/${fileName}`;
        try {
          fs.writeFileSync(path.join(UPLOADS_DIR, fileName), file.buffer);
        } catch (writeErr) {
          console.warn("Could not save physical file:", writeErr.message);
        }
      } else {
        fileName = file.filename;
        fileUrl = `/uploads/${file.filename}`;
      }
      fileType = file.mimetype || path.extname(file.originalname || file.filename) || "document";
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
    }

    const updatedDoc = {
      ...existingDoc,
      name,
      category,
      tag,
      expiryDate,
      meta,
      fileName,
      fileUrl,
      fileType,
      originalName,
      updatedAt: new Date().toISOString(),
    };

    currentDocs[docIndex] = updatedDoc;

    const updatedProfile = {
      ...profile,
      statutoryDocuments: currentDocs,
      readinessScore: calculateReadinessScore(currentDocs),
    };

    return await CompanyProfileRepository.saveProfile(updatedProfile);
  }

  /**
   * Deletes a document from Vault & updates readiness score
   */
  static async deleteVaultDocument(docId) {
    const { profile } = await CompanyProfileRepository.getProfile();
    const docToDelete = (profile.statutoryDocuments || []).find(
      (d) => d.id === docId
    );

    if (docToDelete && docToDelete.fileName) {
      const filePath = path.join(UPLOADS_DIR, docToDelete.fileName);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (e) {
          console.warn("Could not delete physical file:", e.message);
        }
      }
    }

    const updatedDocs = (profile.statutoryDocuments || []).filter(
      (d) => d.id !== docId
    );

    const updatedProfile = {
      ...profile,
      statutoryDocuments: updatedDocs,
      readinessScore: calculateReadinessScore(updatedDocs),
    };

    return await CompanyProfileRepository.saveProfile(updatedProfile);
  }
}
