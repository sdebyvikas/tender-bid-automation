import { readDB } from '../config/db.js';
import { queryTenderAssistant } from '../services/aiService.js';

export async function chatWithTender(req, res) {
  try {
    const { query, chatHistory } = req.body;
    if (!query) return res.status(400).json({ success: false, error: 'Query is required' });

    const db = readDB();
    const tender = db.tenders.find(t => t.id === req.params.tenderId);
    if (!tender) return res.status(404).json({ success: false, error: 'Tender not found' });

    const answer = await queryTenderAssistant({
      query,
      tender,
      companyProfile: db.companyProfile,
      chatHistory: chatHistory || []
    });

    res.json({
      success: true,
      answer,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('Error in chatWithTender:', err);
    res.status(500).json({ success: false, error: err.message });
  }
}
