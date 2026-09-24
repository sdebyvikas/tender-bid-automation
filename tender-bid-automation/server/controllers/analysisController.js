import { readDB, writeDB } from '../config/db.js';
import { calculateGoNoGoScore } from '../services/goNoGoEngine.js';

export async function recalculateGoNoGo(req, res) {
  try {
    const db = readDB();
    const tender = db.tenders.find(t => t.id === req.params.tenderId);
    if (!tender) return res.status(404).json({ success: false, error: 'Tender not found' });

    const newAnalysis = calculateGoNoGoScore(tender, db.companyProfile);
    tender.goNoGoAnalysis = newAnalysis;
    tender.updatedAt = new Date().toISOString();

    writeDB(db);
    res.json({ success: true, goNoGoAnalysis: newAnalysis });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}
