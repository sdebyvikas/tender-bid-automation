import express from 'express';
import { recalculateGoNoGo } from '../controllers/analysisController.js';

const router = express.Router();
router.post('/gonogo/:tenderId', recalculateGoNoGo);

export default router;
