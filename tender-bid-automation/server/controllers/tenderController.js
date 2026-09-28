import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { readDB, writeDB, UPLOADS_DIR } from "../config/db.js";
import {
  parseTenderDocument,
  validateTenderDocument,
} from "../services/documentParser.js";
import { analyzeTenderWithAI } from "../services/aiService.js";
import { calculateGoNoGoScore } from "../services/goNoGoEngine.js";
import { generateComplianceMatrix } from "../services/complianceEngine.js";

export async function getAllTenders(req, res) {
  try {
    const db = readDB();
    res.json({ success: true, count: db.tenders.length, tenders: db.tenders });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function getTenderById(req, res) {
  try {
    const db = readDB();
    const tender = db.tenders.find((t) => t.id === req.params.id);
    if (!tender) {
      return res
        .status(404)
        .json({ success: false, error: "Tender not found" });
    }
    res.json({ success: true, tender });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function uploadAndCreateTender(req, res) {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, error: "No document file uploaded" });
    }

    const filePath = req.file.path;
    const originalName = req.file.originalname;

    // 1. Parse document (Detects text layer & flags scanned/image PDFs)
    const { text, metadata, isScanned, fileBase64 } = await parseTenderDocument(
      filePath,
      originalName,
    );

    // =========================================================================
    // (Validation):
    // =========================================================================
    if (!isScanned) {
      const validation = validateTenderDocument(text);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          error: `Invalid Document: "${originalName}" does not appear to be a valid Tender or RFP notice. Please upload an authentic procurement document (NIT/RFP).`,
        });
      }
    }
    // =========================================================================

    const db = readDB();
    const companyProfile = db.companyProfile;

    // 2. AI Ingestion & Parameter Extraction (Passes direct PDF buffer & Company Profile for 100% accurate matching)
    const extractedData = await analyzeTenderWithAI(text, originalName, {
      isScanned,
      fileBase64,
      companyProfile,
    });

    // 3. Compute Go/No-Go Decision Matrix
    const goNoGo = calculateGoNoGoScore(extractedData, companyProfile);

    // 4. Generate / Use Compliance Items (Direct from PDF AI extraction or fallback)
    let complianceItems = [];
    if (
      extractedData.complianceItems &&
      Array.isArray(extractedData.complianceItems) &&
      extractedData.complianceItems.length > 0
    ) {
      complianceItems = extractedData.complianceItems.map((item) => ({
        id: `comp_${uuidv4().slice(0, 8)}`,
        clauseNo: item.clauseNo || "Sec 1.0",
        requirement: item.requirement || "Requirement specification",
        category: item.category || "Eligibility",
        isMandatory: item.isMandatory !== undefined ? item.isMandatory : true,
        status: item.status || "Complied (Pass)",
        justification:
          item.justification ||
          `Complied with ${companyProfile?.name || "Company Vault"} records.`,
        deviationRemarks: item.deviationRemarks || "None",
        evidenceDoc: item.evidenceDoc || "Supporting Credentials in Vault",
      }));
    } else {
      complianceItems = await generateComplianceMatrix(
        text,
        extractedData.title,
        companyProfile,
      );
    }

    // 5. Domain-Aware Initial Proposal Stubs
    const isConsultancy = `${extractedData.title || ""} ${extractedData.category || ""} ${extractedData.scopeSummary || ""}`
      .toLowerCase()
      .match(/consultan|advisory|planning|strategy|public relation|media|dipr|research|communication/);

    const proposals = {
      executiveSummary: `${companyProfile?.name || "Bidder Entity"} is pleased to submit this comprehensive proposal in response to RFP ${extractedData.tenderNumber || ""} for "${extractedData.title}".`,
      technicalApproach: isConsultancy
        ? `Our proposed methodology centers on structured research, strategic advisory, multi-stakeholder communication planning, and measurable impact tracking tailored to ${extractedData.organization || "the Department"}.`
        : `Our technical approach utilizes modular, standards-compliant architecture designed for high availability, security, and SLA excellence.`,
      implementationPlan: isConsultancy
        ? `Phase 1: Inception & Stakeholder Mapping (Weeks 1-3)\nPhase 2: Strategy Formulation & Advisory Roadmap (Weeks 4-8)\nPhase 3: Campaign Execution & Media Rollout (Months 3-6)\nPhase 4: Impact Evaluation & Deliverable Review (Ongoing)`
        : `Phase 1: Mobilization & System Requirements (Weeks 1-3)\nPhase 2: Deployment & Configuration (Weeks 4-12)\nPhase 3: Integration & Testing (Weeks 13-16)\nPhase 4: Go-Live & SLA Handover (Weeks 17-20)`,
    };

    // 6. Authentic BOQ Items (No hardcoded dummy items; only use if authentic items were parsed from document)
    const boqItems =
      Array.isArray(extractedData.boqItems) && extractedData.boqItems.length > 0
        ? extractedData.boqItems.map((item) => ({
            id: item.id || `boq_${uuidv4().slice(0, 6)}`,
            item: item.item || "Line Item",
            unit: item.unit || "Unit",
            quantity: Number(item.quantity) || 1,
            unitPrice: Number(item.unitPrice) || 0,
            total: (Number(item.quantity) || 1) * (Number(item.unitPrice) || 0),
            category: item.category || "Services",
          }))
        : [];

    const newTender = {
      id: `tender_${uuidv4()}`,
      ...extractedData,
      hasBOQ: boqItems.length > 0,
      boqType: boqItems.length > 0 ? "Itemized BOQ" : "Milestone / Retainer Based (No Itemized BOQ)",
      rawTextSnippet: text.slice(0, 20000), // store reference excerpt
      documentMeta: metadata,
      uploadedFileName: originalName,
      status:
        goNoGo.decision === "NO-GO" ? "Disqualified / No-Go" : "In Analysis",
      priority: goNoGo.winProbability > 75 ? "High" : "Medium",
      goNoGoAnalysis: goNoGo,
      complianceItems,
      boqItems,
      proposals,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.tenders.unshift(newTender);
    writeDB(db);

    res.status(201).json({
      success: true,
      message:
        "Tender document successfully uploaded, parsed, and analyzed with AI!",
      tender: newTender,
    });
  } catch (err) {
    console.error("Error processing tender document upload:", err);
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function createTenderManual(req, res) {
  try {
    const db = readDB();
    const tenderData = req.body;
    const companyProfile = db.companyProfile;

    const goNoGo = calculateGoNoGoScore(tenderData, companyProfile);

    const newTender = {
      id: `tender_${uuidv4()}`,
      tenderNumber:
        tenderData.tenderNumber || `NIT-${Date.now().toString().slice(-6)}`,
      title: tenderData.title || "New Tender Bid",
      organization: tenderData.organization || "Procuring Authority",
      category: tenderData.category || "General IT Services",
      portal: tenderData.portal || "GeM Portal",
      estimatedValueINR: Number(tenderData.estimatedValueINR) || 10000000,
      estimatedValueDisplay:
        tenderData.estimatedValueDisplay ||
        `₹${(Number(tenderData.estimatedValueINR || 10000000) / 10000000).toFixed(2)} Cr`,
      emdAmountINR: Number(tenderData.emdAmountINR) || 200000,
      emdDisplay:
        tenderData.emdDisplay ||
        `₹${(Number(tenderData.emdAmountINR || 200000) / 100000).toFixed(2)} Lakhs`,
      tenderFeeINR: Number(tenderData.tenderFeeINR) || 2000,
      publishDate:
        tenderData.publishDate || new Date().toISOString().split("T")[0],
      submissionDeadline:
        tenderData.submissionDeadline ||
        new Date(Date.now() + 15 * 86400000).toISOString(),
      preBidMeetingDate:
        tenderData.preBidMeetingDate ||
        new Date(Date.now() + 5 * 86400000).toISOString(),
      status: "In Analysis",
      priority: "Medium",
      scopeSummary:
        tenderData.scopeSummary || "Turnkey implementation and support.",
      eligibilityCriteria: tenderData.eligibilityCriteria || {
        minAnnualTurnoverINR: 10000000,
        minExperienceYears: 3,
        requiredCertifications: ["ISO 9001"],
      },
      goNoGoAnalysis: goNoGo,
      complianceItems: [],
      boqItems: [],
      proposals: {
        executiveSummary: `Executive summary for ${tenderData.title || "Tender Bid"}`,
        technicalApproach: "Technical methodology overview.",
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.tenders.unshift(newTender);
    writeDB(db);
    res.status(201).json({ success: true, tender: newTender });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function updateTender(req, res) {
  try {
    const db = readDB();
    const idx = db.tenders.findIndex((t) => t.id === req.params.id);
    if (idx === -1) {
      return res
        .status(404)
        .json({ success: false, error: "Tender not found" });
    }

    db.tenders[idx] = {
      ...db.tenders[idx],
      ...req.body,
      updatedAt: new Date().toISOString(),
    };

    writeDB(db);
    res.json({ success: true, tender: db.tenders[idx] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function deleteTender(req, res) {
  try {
    const db = readDB();
    const idx = db.tenders.findIndex((t) => t.id === req.params.id);
    if (idx === -1) {
      return res
        .status(404)
        .json({ success: false, error: "Tender not found" });
    }

    const deleted = db.tenders.splice(idx, 1)[0];
    writeDB(db);
    res.json({ success: true, message: "Tender deleted", tender: deleted });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}
