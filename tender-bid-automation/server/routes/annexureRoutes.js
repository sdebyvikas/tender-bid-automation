import express from 'express';
import { getAnnexuresForTender } from '../controllers/annexureController.js';

const router = express.Router();
router.get('/:tenderId', getAnnexuresForTender);

export default router;
