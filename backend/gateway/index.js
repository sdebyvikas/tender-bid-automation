import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { proxyWithUser, createServiceProxy } from "./utils/proxyWithHeaders.js";
import { protect } from "./middlewares/auth.middleware.js";
import { getCurrentUser } from "./controllers/user.controller.js";
import cookieParser from "cookie-parser";

dotenv.config();
const app = express();
const port = process.env.PORT || 8000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(morgan("dev"));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", createServiceProxy(process.env.AUTH_SERVICE, "/api/auth"));
app.use("/api/me", protect, getCurrentUser);
app.use("/api/chat", protect, proxyWithUser(process.env.CHAT_SERVICE, "/api/chat"));
app.use("/api/agent", protect, proxyWithUser(process.env.AGENT_SERVICE, "/api/agent"));
app.use("/api/billing", protect, proxyWithUser(process.env.BILLING_SERVICE, "/api/billing"));

app.get("/", (req, res) => {
  res.status(200).json({
    service: "gateway",
    status: "ok"
  });
});

app.listen(port, () => {
  console.log(`Gateway running on ${port}`);
});
