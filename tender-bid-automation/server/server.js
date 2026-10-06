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
import companyProfileRoutes from "./modules/company-profile/company-profile.routes.js";
import signatoryRoutes from "./modules/signatories/authorized-signatory.routes.js";
import chatRoutes from "./routes/chatRoutes.js";
import exportRoutes from "./routes/exportRoutes.js";
import { connectDB } from "./config/mongo.js";

dotenv.config();

// Connect to MongoDB
connectDB();

process.on("uncaughtException", (err) => {
  console.error("FATAL UNCAUGHT EXCEPTION:", err);
});
process.on("unhandledRejection", (reason, promise) => {
  console.error("UNHANDLED REJECTION:", reason);
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use((req, res, next) => {
  console.log(`[HTTP ${req.method}] ${req.url}`);
  next();
});
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
app.use("/api/company-profile", companyProfileRoutes); // Company Profile MongoDB API
app.use("/api/signatories", signatoryRoutes); // Dedicated Authorized Signatories MongoDB API
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
  console.log(`🍃 Database: MongoDB`);
  console.log(`====================================================`);
});
