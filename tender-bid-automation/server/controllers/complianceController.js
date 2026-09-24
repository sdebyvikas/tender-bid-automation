import { v4 as uuidv4 } from 'uuid';
import { readDB, writeDB } from '../config/db.js';
import { generateComplianceMatrix } from '../services/complianceEngine.js';

export async function getComplianceItems(req, res) {
  try {
    const db = readDB();
    const tender = db.tenders.find(t => t.id === req.params.tenderId);
    if (!tender) return res.status(404).json({ success: false, error: 'Tender not found' });
    res.json({ success: true, complianceItems: tender.complianceItems || [] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function addComplianceItem(req, res) {
  try {
    const db = readDB();
    const tender = db.tenders.find(t => t.id === req.params.tenderId);
    if (!tender) return res.status(404).json({ success: false, error: 'Tender not found' });

    const newItem = {
      id: `comp_${uuidv4().slice(0, 8)}`,
      clauseNo: req.body.clauseNo || 'Clause X',
      requirement: req.body.requirement || 'Requirement description',
      category: req.body.category || 'Technical',
      isMandatory: req.body.isMandatory !== undefined ? req.body.isMandatory : true,
      status: req.body.status || 'Complied',
      justification: req.body.justification || 'Complied as per specifications',
      deviationRemarks: req.body.deviationRemarks || 'None',
      evidenceDoc: req.body.evidenceDoc || 'Technical Document'
    };

    if (!tender.complianceItems) tender.complianceItems = [];
    tender.complianceItems.push(newItem);
    tender.updatedAt = new Date().toISOString();

    writeDB(db);
    res.status(201).json({ success: true, item: newItem, complianceItems: tender.complianceItems });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function updateComplianceItem(req, res) {
  try {
    const db = readDB();
    const tender = db.tenders.find(t => t.id === req.params.tenderId);
    if (!tender) return res.status(404).json({ success: false, error: 'Tender not found' });

    const idx = (tender.complianceItems || []).findIndex(i => i.id === req.params.itemId);
    if (idx === -1) return res.status(404).json({ success: false, error: 'Compliance item not found' });

    tender.complianceItems[idx] = {
      ...tender.complianceItems[idx],
      ...req.body
    };
    tender.updatedAt = new Date().toISOString();

    writeDB(db);
    res.json({ success: true, item: tender.complianceItems[idx], complianceItems: tender.complianceItems });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function deleteComplianceItem(req, res) {
  try {
    const db = readDB();
    const tender = db.tenders.find(t => t.id === req.params.tenderId);
    if (!tender) return res.status(404).json({ success: false, error: 'Tender not found' });

    tender.complianceItems = (tender.complianceItems || []).filter(i => i.id !== req.params.itemId);
    tender.updatedAt = new Date().toISOString();

    writeDB(db);
    res.json({ success: true, message: 'Item deleted', complianceItems: tender.complianceItems });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function autoGenerateCompliance(req, res) {
  try {
    const db = readDB();
    const tender = db.tenders.find(t => t.id === req.params.tenderId);
    if (!tender) return res.status(404).json({ success: false, error: 'Tender not found' });

    const sourceText = tender.rawTextSnippet || tender.scopeSummary || `${tender.title} ${tender.organization}`;
    const generated = await generateComplianceMatrix(sourceText, tender.title, db.companyProfile);

    tender.complianceItems = generated;
    tender.updatedAt = new Date().toISOString();

    writeDB(db);
    res.json({ success: true, message: 'Compliance Matrix automatically generated with AI!', complianceItems: generated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}
