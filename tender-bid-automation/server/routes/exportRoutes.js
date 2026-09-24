import express from 'express';
import { exportBidPackage } from '../controllers/exportController.js';

const router = express.Router();
router.post('/:tenderId', exportBidPackage);

export default router;
