import { readDB, writeDB } from '../config/db.js';
import { generateProposalSection } from '../services/aiService.js';

export async function getProposals(req, res) {
  try {
    const db = readDB();
    const tender = db.tenders.find(t => t.id === req.params.tenderId);
    if (!tender) return res.status(404).json({ success: false, error: 'Tender not found' });
    res.json({ success: true, proposals: tender.proposals || {} });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function updateProposals(req, res) {
  try {
    const db = readDB();
    const tender = db.tenders.find(t => t.id === req.params.tenderId);
    if (!tender) return res.status(404).json({ success: false, error: 'Tender not found' });

    tender.proposals = {
      ...tender.proposals,
      ...req.body
    };
    tender.updatedAt = new Date().toISOString();

    writeDB(db);
    res.json({ success: true, proposals: tender.proposals });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function generateSection(req, res) {
  try {
    const { sectionName, customInstructions } = req.body;
    const db = readDB();
    const tender = db.tenders.find(t => t.id === req.params.tenderId);
    if (!tender) return res.status(404).json({ success: false, error: 'Tender not found' });

    const content = await generateProposalSection({
      sectionName,
      tender,
      companyProfile: db.companyProfile,
      customInstructions
    });

    if (!tender.proposals) tender.proposals = {};
    tender.proposals[sectionName] = content;
    tender.updatedAt = new Date().toISOString();

    writeDB(db);
    res.json({ success: true, sectionName, content, proposals: tender.proposals });
  } catch (err) {
    console.error('Error in generateSection:', err);
    res.status(500).json({ success: false, error: err.message });
  }
}
