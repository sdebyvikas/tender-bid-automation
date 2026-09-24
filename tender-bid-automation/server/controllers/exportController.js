import path from 'path';
import fs from 'fs';
import { readDB, DATA_DIR } from '../config/db.js';
import { generateBidPDF, generateBidDOCX } from '../services/exportService.js';

export async function exportBidPackage(req, res) {
  try {
    const { format = 'pdf', selectedSections = ['executiveSummary', 'technicalApproach', 'complianceMatrix', 'boq', 'annexures'] } = req.body;
    const db = readDB();
    const tender = db.tenders.find(t => t.id === req.params.tenderId);
    if (!tender) return res.status(404).json({ success: false, error: 'Tender not found' });

    const safeTenderNo = (tender.tenderNumber || 'Tender').replace(/[^a-zA-Z0-9_-]/g, '_');
    const timestamp = Date.now();

    if (format === 'docx') {
      const fileName = `Bid_Proposal_${safeTenderNo}_${timestamp}.docx`;
      const outputPath = path.join(DATA_DIR, fileName);
      await generateBidDOCX({
        tender,
        companyProfile: db.companyProfile,
        selectedSections,
        outputPath
      });

      res.download(outputPath, fileName, () => {
        try { fs.unlinkSync(outputPath); } catch (_) {}
      });
    } else {
      // Default PDF
      const fileName = `Bid_Package_${safeTenderNo}_${timestamp}.pdf`;
      const outputPath = path.join(DATA_DIR, fileName);
      await generateBidPDF({
        tender,
        companyProfile: db.companyProfile,
        selectedSections,
        outputPath
      });

      res.download(outputPath, fileName, () => {
        try { fs.unlinkSync(outputPath); } catch (_) {}
      });
    }
  } catch (err) {
    console.error('Error generating bid package export:', err);
    res.status(500).json({ success: false, error: err.message });
  }
}
