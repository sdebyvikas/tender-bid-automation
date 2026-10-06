import express from "express";
import multer from "multer";
import { AuthorizedSignatoryController } from "./authorized-signatory.controller.js";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

router.get("/", AuthorizedSignatoryController.getAll);
router.post("/", upload.single("signatureFile"), AuthorizedSignatoryController.create);
router.put("/:id", upload.single("signatureFile"), AuthorizedSignatoryController.update);
router.delete("/:id", AuthorizedSignatoryController.delete);
router.put("/:id/primary", AuthorizedSignatoryController.setPrimary);

export default router;
