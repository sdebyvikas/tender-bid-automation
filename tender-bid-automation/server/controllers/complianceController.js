import { v4 as uuidv4 } from "uuid";
import Tender from "../models/Tender.js";
import CompanyProfile from "../models/CompanyProfile.js";
import { readDB, writeDB } from "../config/db.js";
import { generateComplianceMatrix } from "../services/complianceEngine.js";

export async function getComplianceItems(req, res) {
  try {
    const tender = await Tender.findOne({ id: req.params.tenderId }).lean();
    if (tender) {
      return res.json({
        success: true,
        source: "MongoDB",
        complianceItems: tender.complianceItems || [],
      });
    }

    const db = readDB();
    const localTender = db.tenders.find((t) => t.id === req.params.tenderId);
    if (!localTender)
      return res.status(404).json({ success: false, error: "Tender not found" });
    res.json({
      success: true,
      source: "Local",
      complianceItems: localTender.complianceItems || [],
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function addComplianceItem(req, res) {
  try {
    const newItem = {
      id: `comp_${uuidv4().slice(0, 8)}`,
      clauseNo: req.body.clauseNo || "Clause X",
      requirement: req.body.requirement || "Requirement description",
      category: req.body.category || "Technical",
      isMandatory:
        req.body.isMandatory !== undefined ? req.body.isMandatory : true,
      status: req.body.status || "Complied",
      justification:
        req.body.justification || "Complied as per specifications",
      deviationRemarks: req.body.deviationRemarks || "None",
      evidenceDoc: req.body.evidenceDoc || "Technical Document",
    };

    const tender = await Tender.findOneAndUpdate(
      { id: req.params.tenderId },
      {
        $push: { complianceItems: newItem },
        $set: { updatedAt: new Date().toISOString() },
      },
      { new: true }
    ).lean();

    const db = readDB();
    const localTender = db.tenders.find((t) => t.id === req.params.tenderId);
    if (localTender) {
      if (!localTender.complianceItems) localTender.complianceItems = [];
      localTender.complianceItems.push(newItem);
      localTender.updatedAt = new Date().toISOString();
      writeDB(db);
    }

    res.status(201).json({
      success: true,
      source: "MongoDB",
      item: newItem,
      complianceItems: tender ? tender.complianceItems : localTender?.complianceItems || [newItem],
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function updateComplianceItem(req, res) {
  try {
    const { tenderId, itemId } = req.params;

    const tender = await Tender.findOne({ id: tenderId });
    if (tender) {
      const idx = (tender.complianceItems || []).findIndex(
        (i) => i.id === itemId
      );
      if (idx !== -1) {
        tender.complianceItems[idx] = {
          ...tender.complianceItems[idx].toObject(),
          ...req.body,
        };
        tender.updatedAt = new Date().toISOString();
        await tender.save();
      }
    }

    const db = readDB();
    const localTender = db.tenders.find((t) => t.id === tenderId);
    if (localTender) {
      const idx = (localTender.complianceItems || []).findIndex(
        (i) => i.id === itemId
      );
      if (idx !== -1) {
        localTender.complianceItems[idx] = {
          ...localTender.complianceItems[idx],
          ...req.body,
        };
        localTender.updatedAt = new Date().toISOString();
        writeDB(db);
      }
    }

    res.json({
      success: true,
      source: "MongoDB",
      complianceItems: tender ? tender.complianceItems : localTender?.complianceItems || [],
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function deleteComplianceItem(req, res) {
  try {
    const { tenderId, itemId } = req.params;

    const tender = await Tender.findOneAndUpdate(
      { id: tenderId },
      {
        $pull: { complianceItems: { id: itemId } },
        $set: { updatedAt: new Date().toISOString() },
      },
      { new: true }
    ).lean();

    const db = readDB();
    const localTender = db.tenders.find((t) => t.id === tenderId);
    if (localTender) {
      localTender.complianceItems = (localTender.complianceItems || []).filter(
        (i) => i.id !== itemId
      );
      localTender.updatedAt = new Date().toISOString();
      writeDB(db);
    }

    res.json({
      success: true,
      source: "MongoDB",
      message: "Item deleted",
      complianceItems: tender ? tender.complianceItems : localTender?.complianceItems || [],
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function autoGenerateCompliance(req, res) {
  try {
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

    const sourceText =
      tender.rawTextSnippet ||
      tender.scopeSummary ||
      `${tender.title} ${tender.organization}`;
    const generated = await generateComplianceMatrix(
      sourceText,
      tender.title,
      companyProfile
    );

    await Tender.findOneAndUpdate(
      { id: req.params.tenderId },
      {
        $set: {
          complianceItems: generated,
          updatedAt: new Date().toISOString(),
        },
      }
    );

    const localTender = db.tenders.find((t) => t.id === req.params.tenderId);
    if (localTender) {
      localTender.complianceItems = generated;
      localTender.updatedAt = new Date().toISOString();
      writeDB(db);
    }

    res.json({
      success: true,
      source: "MongoDB",
      message: "Compliance Matrix automatically generated with AI!",
      complianceItems: generated,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}
