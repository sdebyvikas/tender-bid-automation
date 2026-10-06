import express from "express";
import multer from "multer";
import path from "path";
import { UPLOADS_DIR } from "../../config/db.js";
import { CompanyProfileController } from "./company-profile.controller.js";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

router.get("/", CompanyProfileController.getProfile);
router.put("/", CompanyProfileController.updateProfile);

// Vault document routes
router.post("/documents", upload.single("document"), CompanyProfileController.uploadDocument);
router.post("/vault/documents", upload.single("document"), CompanyProfileController.uploadDocument);

router.put("/documents/:docId", upload.single("document"), CompanyProfileController.updateDocument);
router.put("/vault/documents/:docId", upload.single("document"), CompanyProfileController.updateDocument);

router.delete("/documents/:docId", CompanyProfileController.deleteDocument);
router.delete("/vault/documents/:docId", CompanyProfileController.deleteDocument);

// Authorized Signatories routes (with PDF/Image Specimen Signature Upload)
router.get("/signatories", CompanyProfileController.getSignatories);
router.post("/signatories", upload.single("signatureFile"), CompanyProfileController.addSignatory);
router.put("/signatories/:id", upload.single("signatureFile"), CompanyProfileController.updateSignatory);
router.delete("/signatories/:id", CompanyProfileController.deleteSignatory);
router.put("/signatories/:id/primary", CompanyProfileController.setPrimarySignatory);

export default router;
