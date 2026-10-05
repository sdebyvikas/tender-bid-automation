import express from "express";
import multer from "multer";
import path from "path";
import { UPLOADS_DIR } from "../config/db.js";
import {
  getAllTenders,
  getTenderById,
  uploadAndCreateTender,
  createTenderManual,
  updateTender,
  deleteTender,
} from "../controllers/tenderController.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max limit
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== ".pdf") {
      return cb(
        new Error("Only PDF documents (.pdf) are allowed for tender upload."),
        false,
      );
    }
    cb(null, true);
  },
});

// Middleware to handle multer upload errors cleanly
const handleUpload = (req, res, next) => {
  upload.single("document")(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          success: false,
          error: "File size too large! Maximum allowed document size is 50MB.",
        });
      }
      return res
        .status(400)
        .json({ success: false, error: `Upload error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ success: false, error: err.message });
    }
    next();
  });
};

router.get("/", getAllTenders);
router.get("/:id", getTenderById);
router.post("/upload", handleUpload, uploadAndCreateTender);
router.post("/manual", createTenderManual);
router.put("/:id", updateTender);
router.delete("/:id", deleteTender);

export default router;
