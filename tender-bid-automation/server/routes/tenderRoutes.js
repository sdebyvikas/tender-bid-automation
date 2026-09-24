import express from 'express';
import multer from 'multer';
import path from 'path';
import { UPLOADS_DIR } from '../config/db.js';
import {
  getAllTenders,
  getTenderById,
  uploadAndCreateTender,
  createTenderManual,
  updateTender,
  deleteTender
} from '../controllers/tenderController.js';

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});

router.get('/', getAllTenders);
router.get('/:id', getTenderById);
router.post('/upload', upload.single('document'), uploadAndCreateTender);
router.post('/manual', createTenderManual);
router.put('/:id', updateTender);
router.delete('/:id', deleteTender);

export default router;
