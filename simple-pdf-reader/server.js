import express from "express";
import multer from "multer";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import pdfParse from "pdf-parse";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Multer Memory Storage (File ko disk par save karne ki bhi zaroorat nahi, direct RAM buffer se padhenge)
const upload = multer({ storage: multer.memoryStorage() });

// =========================================================================
// 🎯 PURE NON-AI PDF EXTRACTION API
// =========================================================================
app.post("/api/extract", upload.single("pdfFile"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: "Kripya ek PDF file select karein!" });
    }

    const startTime = Date.now();
    const fileBuffer = req.file.buffer; // RAM me byte buffer

    // 1. pdf-parse chala kar text decode karein (No AI needed)
    const pdfData = await pdfParse(fileBuffer);
    const text = pdfData.text || "";
    const executionTimeMs = Date.now() - startTime;

    // 2. Pure Regex Patterns se key information extract karein (Without AI)
    const extractedPatterns = {
      tenderNumbers: text.match(/(?:Tender|NIT|Ref|RFP|Reference)(?:\s*(?:No|Number|Ref|ID|Notice))?[\s:]+([A-Za-z0-9\/\-_.]+)/gi) || [],
      dates: text.match(/\b\d{1,2}[\/\-\.](?:\d{1,2}|[A-Za-z]{3,9})[\/\-\.]\d{2,4}\b/g) || [],
      amounts: text.match(/(?:Rs\.?|INR|₹)\s*[\d,]+(?:\.\d{2})?(?:\s*(?:Cr|Lakh|Crore|Lakhs|Million))?/gi) || [],
      emails: text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [],
      phoneNumbers: text.match(/(?:\+91[\-\s]?)?[6-9]\d{9}/g) || []
    };

    // Remove duplicates from matches
    for (const key in extractedPatterns) {
      extractedPatterns[key] = [...new Set(extractedPatterns[key])];
    }

    // Response bhejein
    res.json({
      success: true,
      fileName: req.file.originalname,
      fileSizeBytes: req.file.size,
      totalPages: pdfData.numpages,
      executionTimeMs,
      characterCount: text.length,
      wordCount: text.trim().split(/\s+/).filter(Boolean).length,
      patternsFound: extractedPatterns,
      rawText: text
    });

  } catch (err) {
    console.error("PDF Parsing Error:", err);
    res.status(500).json({
      success: false,
      error: "PDF read karne me error aayi: " + err.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 Simple PDF Reader App running at: http://localhost:${PORT}`);
  console.log(`====================================================`);
});
