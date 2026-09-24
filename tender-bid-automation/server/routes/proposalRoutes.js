import express from 'express';
import {
  getProposals,
  updateProposals,
  generateSection
} from '../controllers/proposalController.js';

const router = express.Router();

router.get('/:tenderId', getProposals);
router.put('/:tenderId', updateProposals);
router.post('/:tenderId/generate', generateSection);

export default router;
