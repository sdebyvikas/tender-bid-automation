import Tender from "../models/Tender.js";
import CompanyProfile from "../models/CompanyProfile.js";
import { readDB } from "../config/db.js";
import { queryTenderAssistant } from "../services/aiService.js";

export async function chatWithTender(req, res) {
  try {
    const { query, chatHistory } = req.body;
    if (!query)
      return res.status(400).json({ success: false, error: "Query is required" });

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

    const answer = await queryTenderAssistant({
      query,
      tender,
      companyProfile,
      chatHistory: chatHistory || [],
    });

    res.json({
      success: true,
      source: "MongoDB",
      answer,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Error in chatWithTender:", err);
    res.status(500).json({ success: false, error: err.message });
  }
}
