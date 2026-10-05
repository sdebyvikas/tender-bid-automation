import Tender from "../models/Tender.js";
import CompanyProfile from "../models/CompanyProfile.js";
import { readDB, writeDB } from "../config/db.js";
import { generateProposalSection } from "../services/aiService.js";

export async function getProposals(req, res) {
  try {
    const tender = await Tender.findOne({ id: req.params.tenderId }).lean();
    if (tender) {
      return res.json({
        success: true,
        source: "MongoDB",
        proposals: tender.proposals || {},
      });
    }

    const db = readDB();
    const localTender = db.tenders.find((t) => t.id === req.params.tenderId);
    if (!localTender)
      return res.status(404).json({ success: false, error: "Tender not found" });
    res.json({
      success: true,
      source: "Local",
      proposals: localTender.proposals || {},
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function updateProposals(req, res) {
  try {
    const tender = await Tender.findOne({ id: req.params.tenderId });
    if (tender) {
      tender.proposals = {
        ...(tender.proposals || {}),
        ...req.body,
      };
      tender.updatedAt = new Date().toISOString();
      await tender.save();
    }

    const db = readDB();
    const localTender = db.tenders.find((t) => t.id === req.params.tenderId);
    if (localTender) {
      localTender.proposals = {
        ...localTender.proposals,
        ...req.body,
      };
      localTender.updatedAt = new Date().toISOString();
      writeDB(db);
    }

    res.json({
      success: true,
      source: "MongoDB",
      proposals: tender ? tender.proposals : localTender?.proposals || {},
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function generateSection(req, res) {
  try {
    const { sectionName, customInstructions } = req.body;

    let tender = await Tender.findOne({ id: req.params.tenderId }).lean();
    const db = readDB();
    if (!tender) {
      tender = db.tenders.find((t) => t.id === req.params.tenderId);
    }
    if (!tender)
      return res.status(404).json({ success: false, error: "Tender not found" });

    let companyProfile = await CompanyProfile.findOne().lean();
    if (!companyProfile) {
      companyProfile = db.companyProfile;
    }

    const content = await generateProposalSection({
      sectionName,
      tender,
      companyProfile,
      customInstructions,
    });

    const tenderDoc = await Tender.findOne({ id: req.params.tenderId });
    if (tenderDoc) {
      if (!tenderDoc.proposals) tenderDoc.proposals = {};
      tenderDoc.proposals[sectionName] = content;
      tenderDoc.markModified("proposals");
      tenderDoc.updatedAt = new Date().toISOString();
      await tenderDoc.save();
    }

    const localTender = db.tenders.find((t) => t.id === req.params.tenderId);
    if (localTender) {
      if (!localTender.proposals) localTender.proposals = {};
      localTender.proposals[sectionName] = content;
      localTender.updatedAt = new Date().toISOString();
      writeDB(db);
    }

    res.json({
      success: true,
      source: "MongoDB",
      sectionName,
      content,
      proposals: tenderDoc ? tenderDoc.proposals : localTender?.proposals,
    });
  } catch (err) {
    console.error("Error in generateSection:", err);
    res.status(500).json({ success: false, error: err.message });
  }
}
