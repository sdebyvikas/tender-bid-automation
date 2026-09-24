import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import tenderRoutes from "./routes/tenderRoutes.js";
import analysisRoutes from "./routes/analysisRoutes.js";
import complianceRoutes from "./routes/complianceRoutes.js";
import proposalRoutes from "./routes/proposalRoutes.js";
import boqRoutes from "./routes/boqRoutes.js";
import annexureRoutes from "./routes/annexureRoutes.js";
import companyProfileRoutes from "./routes/companyProfileRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import exportRoutes from "./routes/exportRoutes.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Static uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// API Routes
app.use("/api/tenders", tenderRoutes);
app.use("/api/analysis", analysisRoutes);
app.use("/api/compliance", complianceRoutes);
app.use("/api/proposals", proposalRoutes);
app.use("/api/boq", boqRoutes);
app.use("/api/annexures", annexureRoutes);
app.use("/api/company-profile", companyProfileRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/export", exportRoutes);

// Healthcheck & Stats
app.get("/api/health", (req, res) => {
  res.json({
    status: "online",
    service: "Tender & Bid Automation AI Core",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Unhandled API Error:", err);
  res.status(500).json({
    success: false,
    error: err.message || "Internal Server Error",
  });
});

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 Tender Bid Automation AI Backend running on port ${PORT}`);
  console.log(`📡 Healthcheck: http://localhost:${PORT}/api/health`);
  console.log(`====================================================`);
});
