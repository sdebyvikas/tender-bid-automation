import express from 'express';
import multer from 'multer';
import { UPLOADS_DIR } from '../config/db.js';
import {
  getCompanyProfile,
  updateCompanyProfile,
  uploadVaultDocument,
  deleteVaultDocument
} from '../controllers/companyProfileController.js';

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'vault-' + uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});

router.get('/', getCompanyProfile);
router.put('/', updateCompanyProfile);
router.post('/documents', upload.single('document'), uploadVaultDocument);
router.delete('/documents/:docId', deleteVaultDocument);

export default router;
