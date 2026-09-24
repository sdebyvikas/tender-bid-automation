import express from 'express';
import {
  getBOQItems,
  saveBOQItems,
  addBOQItem,
  deleteBOQItem
} from '../controllers/boqController.js';

const router = express.Router();

router.get('/:tenderId', getBOQItems);
router.post('/:tenderId/batch', saveBOQItems);
router.post('/:tenderId/items', addBOQItem);
router.delete('/:tenderId/items/:itemId', deleteBOQItem);

export default router;
