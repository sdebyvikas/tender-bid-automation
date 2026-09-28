import fs from "fs";
import path from "path";
import pdfParse from "pdf-parse";
import mammoth from "mammoth";
import * as xlsx from "xlsx";

/**
 * Extract raw text and structural snippets from uploaded tender files
 */
export async function parseTenderDocument(filePath, originalFilename) {
  const ext = path.extname(originalFilename || filePath).toLowerCase();

  let extractedText = "";

  let metadata = {
    fileName: path.basename(filePath),
    fileType: ext,
    fileSizeBytes: 0,
    pageCount: 1,
    isScanned: false,
    detectedSections: [],
  };

  try {
    const stats = fs.statSync(filePath);
    metadata.fileSizeBytes = stats.size;
    let fileBase64 = null;

    if (ext === ".pdf") {
      const dataBuffer = fs.readFileSync(filePath);
      fileBase64 = dataBuffer.toString("base64");
      const pdfData = await pdfParse(dataBuffer);
      extractedText = pdfData.text || "";
      metadata.pageCount = pdfData.numpages || 1;

      // Scanned Document Detector: If PDF has pages but little/no selectable text layer
      if (extractedText.trim().length < 100) {
        metadata.isScanned = true;
        console.log(
          `📸 Scanned / Image-only PDF detected for "${path.basename(filePath)}". Multimodal Vision OCR will be utilized.`,
        );
      }
    } else if (ext === ".docx" || ext === ".doc") {
      const docBuffer = fs.readFileSync(filePath);
      const result = await mammoth.extractRawText({ buffer: docBuffer });
      extractedText = result.value || "";
    } else if (ext === ".xlsx" || ext === ".xls" || ext === ".csv") {
      const workbook = xlsx.readFile(filePath);
      const sheetNames = workbook.SheetNames;
      let allSheetsText = [];
      sheetNames.forEach((sheetName) => {
        const sheet = workbook.Sheets[sheetName];
        const csvData = xlsx.utils.sheet_to_csv(sheet);
        allSheetsText.push(`--- Sheet: ${sheetName} ---\n${csvData}`);
      });
      extractedText = allSheetsText.join("\n\n");
    } else {
      // Plain text or markdown
      extractedText = fs.readFileSync(filePath, "utf-8");
    }

    // Heuristic section detector
    const lower = extractedText.toLowerCase();
    const sectionKeywords = [
      { key: "eligibility", name: "Eligibility Criteria" },
      { key: "scope of work", name: "Scope of Work" },
      { key: "terms and conditions", name: "Terms and Conditions" },
      { key: "penalty", name: "Liquidated Damages & Penalties" },
      { key: "payment", name: "Payment Milestones" },
      { key: "earnest money", name: "EMD & Bid Security" },
      { key: "bill of quantities", name: "BOQ / Financial Schedule" },
      { key: "submission", name: "Submission Guidelines" },
      { key: "annexure", name: "Annexures & Undertakings" },
      { key: "undertaking", name: "Mandatory Declarations" },
    ];

    sectionKeywords.forEach((sec) => {
      if (lower.includes(sec.key)) {
        metadata.detectedSections.push(sec.name);
      }
    });

    return {
      text: extractedText,
      metadata,
      isScanned: metadata.isScanned,
      fileBase64,
    };
  } catch (err) {
    console.error(`Error parsing document ${filePath}:`, err);
    throw new Error(`Failed to parse document: ${err.message}`);
  }
}

const MONTH_MAP = {
  jan: 1,
  january: 1,
  feb: 2,
  february: 2,
  mar: 3,
  march: 3,
  apr: 4,
  april: 4,
  may: 5,
  jun: 6,
  june: 6,
  jul: 7,
  july: 7,
  aug: 8,
  august: 8,
  sep: 9,
  sept: 9,
  september: 9,
  oct: 10,
  october: 10,
  nov: 11,
  november: 11,
  dec: 12,
  december: 12,
};

/**
 * Converts RFP date string and optional time string to ISO 8601 (IST -> UTC)
 */
export function parseDateAndTimeToISO(dateStr, timeStr = "") {
  if (!dateStr) return null;

  let day, month, year;
  const cleanDate = dateStr.trim();

  // Format 1: DD-MM-YYYY, DD/MM/YYYY, YYYY-MM-DD, YYYY/MM/DD
  const numParts = cleanDate.match(
    /^(\d{1,4})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})$/,
  );
  if (numParts) {
    if (numParts[1].length === 4) {
      // YYYY-MM-DD
      year = parseInt(numParts[1], 10);
      month = parseInt(numParts[2], 10);
      day = parseInt(numParts[3], 10);
    } else {
      // DD-MM-YYYY or DD/MM/YY
      day = parseInt(numParts[1], 10);
      month = parseInt(numParts[2], 10);
      year = parseInt(
        numParts[3].length === 2 ? `20${numParts[3]}` : numParts[3],
        10,
      );
    }
  } else {
    // Format 2: DD-MMM-YYYY or DD MMM YYYY (e.g. 31-May-2025, 21 Aug 2024, 10th May 2025)
    const textParts = cleanDate.match(
      /^(\d{1,2})(?:st|nd|rd|th)?[\s\-\/\.]([A-Za-z]+)[\s\-\/\.](\d{2,4})$/,
    );
    if (textParts) {
      day = parseInt(textParts[1], 10);
      const mName = textParts[2].toLowerCase();
      month = MONTH_MAP[mName] || 1;
      year = parseInt(
        textParts[3].length === 2 ? `20${textParts[3]}` : textParts[3],
        10,
      );
    }
  }

  if (!day || !month || !year || isNaN(day) || isNaN(month) || isNaN(year)) {
    return null;
  }

  // Parse time
  let hours = 17; // default 17:00 (5 PM) if not specified
  let minutes = 0;

  if (timeStr) {
    const tClean = timeStr.trim().toUpperCase().replace(/\s+/g, " ");
    if (tClean.includes("NOON")) {
      hours = 12;
      minutes = 0;
    } else if (tClean.includes("MIDNIGHT")) {
      hours = 0;
      minutes = 0;
    } else {
      const tm = tClean.match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM|HOURS|HRS)?/i);
      if (tm) {
        let h = parseInt(tm[1], 10);
        let m = tm[2] ? parseInt(tm[2], 10) : 0;
        const meridian = (tm[3] || "").toUpperCase();

        if (meridian === "PM" && h < 12) {
          h += 12;
        } else if (meridian === "AM" && h === 12) {
          h = 0;
        }
        hours = h;
        minutes = m;
      }
    }
  }

  // Convert IST (UTC+5:30) to UTC ISO
  const istDateMs =
    Date.UTC(year, month - 1, day, hours, minutes) - 5.5 * 60 * 60 * 1000;
  const d = new Date(istDateMs);
  return d.toISOString();
}

/**
 * Extracts authentic tender parameters from document text using strict pattern matching.
 * NO FAKE/RANDOM FALLBACK VALUES: if a field is not found in the document, returns empty/null.
 */
/**
 * Helper to convert Indian currency phrases (numbers or words) to numeric INR
 */
export function parseIndianCurrencyWords(phrase) {
  if (!phrase) return null;
  const clean = phrase
    .toLowerCase()
    .replace(/[^\w\s\.]/g, " ")
    .trim();

  // Check digit + unit e.g. "15.32 Crore", "20 Lakhs", "50 Thousand"
  const numUnit = clean.match(
    /([0-9]+(?:\.[0-9]+)?)\s*(crores?|cr|lakhs?|lacs?|lac|thousands?|k)/i,
  );
  if (numUnit) {
    const val = parseFloat(numUnit[1]);
    const unit = numUnit[2].toLowerCase();
    if (unit.startsWith("cr")) return Math.round(val * 10000000);
    if (unit.startsWith("la")) return Math.round(val * 100000);
    if (unit.startsWith("th") || unit === "k") return Math.round(val * 1000);
  }

  // Check pure number e.g. "306269928" or "2000000"
  const pureNum = clean.replace(/[\s,]/g, "");
  if (/^[0-9]+(?:\.[0-9]+)?$/.test(pureNum)) {
    const val = parseFloat(pureNum);
    if (!isNaN(val) && val > 0) return Math.round(val);
  }

  // Check words e.g. "twenty lakh", "fifty thousand", "one crore"
  const wordToNum = {
    one: 1,
    two: 2,
    three: 3,
    four: 4,
    five: 5,
    six: 6,
    seven: 7,
    eight: 8,
    nine: 9,
    ten: 10,
    eleven: 11,
    twelve: 12,
    thirteen: 13,
    fourteen: 14,
    fifteen: 15,
    sixteen: 16,
    seventeen: 17,
    eighteen: 18,
    nineteen: 19,
    twenty: 20,
    thirty: 30,
    forty: 40,
    fifty: 50,
    sixty: 60,
    seventy: 70,
    eighty: 80,
    ninety: 90,
    hundred: 100,
  };

  let total = 0;
  let currentGroup = 0;
  const words = clean.split(/\s+/);
  for (const w of words) {
    if (wordToNum[w]) {
      currentGroup += wordToNum[w];
    } else if (w.startsWith("crore") || w === "cr") {
      total += (currentGroup || 1) * 10000000;
      currentGroup = 0;
    } else if (w.startsWith("lakh") || w.startsWith("lac")) {
      total += (currentGroup || 1) * 100000;
      currentGroup = 0;
    } else if (w.startsWith("thousand") || w === "k") {
      total += (currentGroup || 1) * 1000;
      currentGroup = 0;
    } else if (w === "hundred") {
      currentGroup *= 100;
    }
  }
  total += currentGroup;
  return total > 0 ? total : null;
}

export function formatINRDisplay(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) return "";
  if (amount === 0) return "NIL / Exempted";
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)} Crore`;
  }
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)} Lakhs`;
  }
  return `₹${amount.toLocaleString("en-IN")}`;
}

export function cleanOrganizationName(orgName, text = "") {
  if (!orgName) return "";
  let clean = orgName
    .replace(/\s+/g, " ")
    .replace(/\s*CIN\s*-[A-Za-z0-9]+/gi, "")
    .replace(/Page\s+\d+/gi, "")
    .trim();

  // Correct OCR mistranscriptions (e.g. "Public Rights" -> "Public Relations")
  if (/public\s+rights/i.test(clean)) {
    clean = clean.replace(/public\s+rights/gi, "PUBLIC RELATIONS");
  }

  if (
    /(?:DIPR|Directorate\s+of\s+Information|Information\s*&\s*Public)/i.test(text) &&
    /information/i.test(clean) &&
    !/relations/i.test(clean)
  ) {
    clean = "DEPARTMENT OF INFORMATION & PUBLIC RELATIONS (DIPR)";
  }

  return clean;
}

/**
 * Extracts authentic tender parameters from document text using strict pattern matching.
 * NO FAKE/RANDOM FALLBACK VALUES: if a field is not found in the document, returns empty/null.
 */
export function extractFallbackTenderData(text, fileName = "Tender_Doc") {
  if (!text || typeof text !== "string") {
    return {
      tenderNumber: "",
      title: fileName.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " "),
      organization: "",
      category: "Procurement / Services",
      portal: "",
      estimatedValueINR: null,
      estimatedValueDisplay: "",
      emdAmountINR: null,
      emdDisplay: "",
      tenderFeeINR: null,
      publishDate: null,
      submissionDeadline: null,
      preBidMeetingDate: null,
      due: "",
      scopeSummary: "",
      eligibilityCriteria: {
        minAnnualTurnoverINR: null,
        minTurnoverDisplay: "",
        minExperienceYears: null,
        requiredCertifications: [],
        pastProjectRequirement: "",
      },
    };
  }

  // 1. Title Extraction
  let title = "";
  const openTenderMatch = text.match(
    /(?:OPEN\s*(?:E-)?TENDER\s+FOR|E-TENDER\s+FOR|TENDER\s+FOR|REQUEST\s+FOR\s+PROPOSAL\s*(?:\(RFP\))?\s*FOR|NOTICE\s+INVITING\s+(?:E-)?TENDER\s+FOR|NAME\s+OF\s+WORK\s*[:\-]|SUBJECT\s*[:\-]|PURPOSE\s*[:\-])\s*([^\n\r]{15,250})/i,
  );
  if (openTenderMatch) {
    title = openTenderMatch[1]
      .replace(/\s*Page\s+\d+\s*/gi, " ")
      .replace(/\s*CIN\s*-[A-Za-z0-9]+/gi, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  if (!title || title.length < 10) {
    const subMatch = text.match(
      /(?:Sub\s*[:\-]|Selection\s+of\s+(?:Consulting\s+Agency|Service\s+Provider|Vendor)\s+for)\s*([^\n\r]{15,250})/i,
    );
    if (subMatch) {
      title = subMatch[1].replace(/\s+/g, " ").trim();
    }
  }

  if (!title || title.length < 10) {
    title = fileName.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");
  }

  // 2. Organization / Authority Extraction (Universal across all Indian Govt / PSUs / Depts)
  let organization = "";
  const orgNameMatch = text.match(
    /([A-Z0-9\s,\.\-&()]{4,90}?(?:CORPORATION\s+(?:LIMITED|LTD\.?)|MINISTRY\s+OF\s+[A-Z\s]+|DEPARTMENT\s+OF\s+[A-Z\s]+|DIRECTORATE\s+OF\s+[A-Z\s]+|AUTHORITY\s+OF\s+INDIA|DEVELOPMENT\s+AUTHORITY|BOARD|NIGAM\s+LIMITED|NIGAM\s+LTD\.?|SAMITI|PARISHAD|COMMISSION|COUNCIL|UNIVERSITY|INSTITUTE\s+OF\s+[A-Z\s]+|MUNICIPAL\s+CORPORATION|SMART\s+CITY\s+(?:LIMITED|LTD\.?)))/i,
  );
  if (orgNameMatch) {
    organization = cleanOrganizationName(orgNameMatch[1], text);
  }

  if (!organization || organization.length < 4) {
    const orgIssuedMatch = text.match(
      /(?:Issued\s*by|Client|Purchaser|Procuring\s*Entity|Authority|Employer)[\s:\.\-]*([A-Za-z0-9\s,\.\-&()]{4,80})/i,
    );
    if (orgIssuedMatch) {
      organization = cleanOrganizationName(orgIssuedMatch[1], text);
    }
  }

  // 3. Tender / NIT / RFP Reference Number
  let tenderNo = "";
  const tenderNoMatch = text.match(
    /(?:Open\s*E-Tender\s*No\.?|NIT\s*No\.?|RFP\s*No\.?|Tender\s*No\.?|Reference\s*No\.?|Ref\s*No\.?|Tender\s*Notice\s*No\.?|Bid\s*No\.?|Tender\s*ID)\s*[:\-]?\s*([A-Za-z0-9\/\-_. ]{4,60})/i,
  );
  if (tenderNoMatch && !tenderNoMatch[1].includes("____")) {
    tenderNo = tenderNoMatch[1].replace(/\s*Page\s+\d+/gi, "").trim();
  } else {
    const fallbackNo = text.match(
      /(?:Contract\s*No[\s:\.]*)([A-Z0-9\/\-_]{4,35})/i,
    );
    if (fallbackNo && !fallbackNo[1].includes("____")) {
      tenderNo = fallbackNo[1].trim();
    }
  }

  // 4. Estimated Total Contract Value (Universal parsing)
  let estimatedValueINR = null;
  let estimatedValueDisplay = "";

  const exactValueMatch = text.match(
    /(?:Estimated\s*Total\s*Contract\s*Value|Estimated\s*(?:Cost|Value|Budget)|Tender\s*Value|Contract\s*Value|Approximate\s*(?:Value|Cost))\s*(?:\(in\s*Rs\.?\))?[\s:\.\-]*([RsINR₹\s0-9,\.]+(?:Crore|Cr|Lakhs?|Lacs?|Lac|Thousands?|K)?)/i,
  );
  if (exactValueMatch) {
    const parsedVal = parseIndianCurrencyWords(exactValueMatch[1]);
    if (parsedVal && parsedVal > 0) {
      estimatedValueINR = parsedVal;
      estimatedValueDisplay = formatINRDisplay(parsedVal);
    }
  }

  // 5. EMD (Earnest Money Deposit) (Universal parsing)
  let emdAmountINR = null;
  let emdDisplay = "";

  if (text.match(/EMD\s*[:\-]?\s*(?:NIL|N\.A\.|EXEMPT(?:ED)?|ZERO)/i)) {
    emdAmountINR = 0;
    emdDisplay = "NIL / Exempted";
  } else {
    const emdMatch = text.match(
      /(?:EMD|Earnest\s*Money\s*(?:Deposit)?)\s*(?:\(EMD\))?\s*[:\-]?\s*(?:Rs\.?|INR|₹)?\s*([RsINR₹\s0-9,\.]+(?:Crore|Cr|Lakhs?|Lacs?|Lac|Thousands?|K|[A-Za-z\s]+Lakh|[A-Za-z\s]+Thousand)?)/i,
    );
    if (emdMatch) {
      const parsedEmd = parseIndianCurrencyWords(emdMatch[1]);
      if (parsedEmd !== null && parsedEmd > 0) {
        emdAmountINR = parsedEmd;
        emdDisplay = formatINRDisplay(parsedEmd);
      }
    }
  }

  // 6. Tender Form Fee
  let tenderFeeINR = null;
  const feeMatch = text.match(
    /(?:E-tender\s*Form\s*Price|Tender\s*(?:Form\s*)?Fee|Cost\s*of\s*Tender|Document\s*Fee|BOQ\s*Cost)\s*[:\-]?\s*(?:Rs\.?|INR|₹)?\s*([0-9,]+|NIL|N\.A\.)/i,
  );
  if (feeMatch) {
    if (
      feeMatch[1].toUpperCase() === "NIL" ||
      feeMatch[1].toUpperCase() === "N.A."
    ) {
      tenderFeeINR = 0;
    } else {
      const rawFee = parseInt(feeMatch[1].replace(/,/g, ""), 10);
      if (!isNaN(rawFee)) {
        tenderFeeINR = rawFee;
      }
    }
  }

  // 7. Dates (Submission, Pre-bid, Publish) - Authentic parsing only
  let submissionDeadline = null;
  const deadlineMatch = text.match(
    /(?:Last\s*date\s*and\s*Time\s*of\s*Submission\s*of\s*bids|Bid\s*Submission\s*End\s*Date|Bid\s*Due\s*Date|Last\s*Date\s*for\s*Submission|Submission\s*Deadline)[\s:\.\-\n\r]*(?:Date\s*[:\-]?\s*)?([0-9]{1,2}[\/\-\.][0-9]{1,2}[\/\-\.][0-9]{2,4}|[0-9]{1,2}(?:st|nd|rd|th)?[\s\-\/\.][A-Za-z]+[\s\-\/\.][0-9]{2,4})(?:[\s,\n\r]+(?:Time\s*[:\-]?\s*)?(?:at|by)?\s*([0-9]{1,2}(?::[0-9]{2})?\s*(?:AM|PM|NOON|MIDNIGHT|Hours|Hrs)?))?/i,
  );
  if (deadlineMatch) {
    submissionDeadline = parseDateAndTimeToISO(
      deadlineMatch[1],
      deadlineMatch[2] || "",
    );
  }

  let preBidMeetingDate = null;
  const preBidMatch = text.match(
    /(?:Pre\s*[-\s]?\s*Bid\s*Meeting(?:\s*\([^\)]*\))?|Pre-Bid\s*Queries)[\s:\.\-\n\r]*(?:Date\s*[:\-]?\s*)?([0-9]{1,2}[\/\-\.][0-9]{1,2}[\/\-\.][0-9]{2,4}|[0-9]{1,2}(?:st|nd|rd|th)?[\s\-\/\.][A-Za-z]+[\s\-\/\.][0-9]{2,4})(?:[\s,\n\r]+(?:Time\s*[:\-]?\s*)?(?:at|by)?\s*([0-9]{1,2}(?::[0-9]{2})?\s*(?:AM|PM|NOON|MIDNIGHT|Hours|Hrs)?))?/i,
  );
  if (preBidMatch) {
    preBidMeetingDate = parseDateAndTimeToISO(
      preBidMatch[1],
      preBidMatch[2] || "",
    );
  }

  let publishDate = null;
  const pubMatch = text.match(
    /(?:Date\s*of\s*Publishing|Date\s*of\s*Publication|Publication\s*Date|Publish\s*Date|NIT\s*Date|Bid\s*submission\s*Start\s*Date)\s*[:\-]?\s*([0-9]{1,2}[\/\-\.][0-9]{1,2}[\/\-\.][0-9]{2,4})/i,
  );
  if (pubMatch) {
    const parsedPub = parseDateAndTimeToISO(pubMatch[1], "09:00 AM");
    if (parsedPub) {
      publishDate = parsedPub.split("T")[0];
    }
  }

  const dueFormatted = submissionDeadline
    ? new Date(submissionDeadline).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  // 8. Scope of Work Extraction (Universal lookahead)
  let scopeSummary = "";
  const briefScopeMatch = text.match(
    /(?:Brief\s*Scope\s*of\s*Work|Scope\s*of\s*Work|Terms\s*of\s*Reference|Detailed\s*Scope)[\s\S]{0,100}?([\s\S]{100,2000}?)(?=\n\s*(?:NOTICE\s*INVITING|Section\s*IV|Eligibility\s*Criteria|General\s*Conditions|Special\s*Conditions|\d+\.\s*Responsibilities|\d+\.\s*Period))/i,
  );
  if (briefScopeMatch) {
    scopeSummary = briefScopeMatch[1]
      .replace(/Open\s*E-Tender\s*No\.?[^\n\r]*Page\s*\d+/gi, "")
      .replace(/CIN\s*-[A-Za-z0-9]+/gi, "")
      .replace(/\s+/g, " ")
      .trim();
  } else {
    const scopeClauseMatch = text.match(
      /(?:The\s*bidder\s*will\s*be\s*responsible\s*for[\s\S]{100,1200}?)(?=\n\s*\d+\.|\n\s*[A-Z]\.|\n\s*Section)/i,
    );
    if (scopeClauseMatch) {
      scopeSummary = scopeClauseMatch[0]
        .replace(/Open\s*E-Tender\s*No\.?[^\n\r]*Page\s*\d+/gi, "")
        .replace(/\s+/g, " ")
        .trim();
    }
  }

  // 9. Authentic Eligibility Extraction (Turnover, Experience, Net Worth)
  let minTurnoverDisplay = "";
  let minAnnualTurnoverINR = null;
  const turnoverMatch = text.match(
    /(?:Annual\s*turnover\s*from\s*[^\n\r]{0,60}?|Average\s*Annual\s*Turnover|Turnover\s*requirement)[\s:\.\-]*Rs\.?\s*([0-9,]+(?:\.[0-9]{1,2})?\s*(?:Cr(?:ore)?|Lakhs?|Lacs?))/i,
  );
  if (turnoverMatch) {
    minTurnoverDisplay = `₹${turnoverMatch[1].trim()}`;
    const parsedTurnover = parseIndianCurrencyWords(turnoverMatch[1]);
    if (parsedTurnover) minAnnualTurnoverINR = parsedTurnover;
  }

  let minExperienceYears = null;
  const expMatch = text.match(
    /(?:minimum\s*([0-9]+)\s*[- ]year\s*experience|([0-9]+)\s*years?\s*experience)/i,
  );
  if (expMatch) {
    minExperienceYears = parseInt(expMatch[1] || expMatch[2], 10);
  }

  // 10. Portal Detection (Dynamic extraction from URLs in document)
  let portal = "";
  const portalUrlMatch = text.match(
    /(?:https?:\/\/)?([a-zA-Z0-9.-]+\.(?:gov\.in|nic\.in|tenderwizard\.com|gem\.gov\.in|eprocure\.gov\.in)(?:\/[a-zA-Z0-9_.-]+)?)/i,
  );
  if (portalUrlMatch) {
    portal = portalUrlMatch[1].trim();
  }

  return {
    tenderNumber: tenderNo,
    title,
    organization,
    category: "Procurement / Services",
    portal: portal || "e-Procurement Portal",
    estimatedValueINR,
    estimatedValueDisplay,
    emdAmountINR,
    emdDisplay,
    tenderFeeINR,
    publishDate,
    submissionDeadline,
    preBidMeetingDate,
    due: dueFormatted,
    scopeSummary,
    eligibilityCriteria: {
      minAnnualTurnoverINR,
      minTurnoverDisplay,
      minExperienceYears,
      requiredCertifications: [],
      pastProjectRequirement: "",
    },
  };
}

/**
 * Bina AI ke check karta hai ki kya document ek valid Tender/RFP hai
 */
export function validateTenderDocument(text) {
  if (!text || text.trim().length < 50) {
    return {
      isValid: false,
      score: 0,
      matchedKeywords: [],
      reason: "Document me koi readable text nahi mila ya document empty hai.",
    };
  }

  const lowerText = text.toLowerCase();

  // 1. High Weightage Keywords (Ye milte hain to 100% tender hi hota hai)
  const strongKeywords = [
    "notice inviting tender",
    "request for proposal",
    "nit no",
    "rfp no",
    "earnest money deposit",
    "emd",
    "bid submission end date",
    "submission deadline",
    "eligibility criteria",
    "bill of quantities",
    "pre-qualification",
    "corrigendum",
  ];

  // 2. Medium Weightage Keywords
  const secondaryKeywords = [
    "tender",
    "procurement",
    "bidding",
    "scope of work",
    "tender fee",
    "liquidated damages",
    "techno-commercial",
    "work order",
    "contract value",
  ];

  const matched = [];
  let score = 0;

  // Strong keywords check (Har match par 2 points)
  strongKeywords.forEach((kw) => {
    if (lowerText.includes(kw)) {
      matched.push(kw);
      score += 2;
    }
  });

  // Secondary keywords check (Har match par 1 point)
  secondaryKeywords.forEach((kw) => {
    if (lowerText.includes(kw)) {
      matched.push(kw);
      score += 1;
    }
  });

  // Rule: Kam se kam score 3 hona chahiye (i.e. at least 1-2 strong keywords ya 3 secondary keywords)
  const isValid = score >= 3;

  return {
    isValid,
    score,
    matchedKeywords: matched,
    reason: isValid
      ? "Valid Tender Document"
      : "Document me zaroori Tender/RFP keywords (NIT, EMD, Scope, etc.) nahi mile.",
  };
}
