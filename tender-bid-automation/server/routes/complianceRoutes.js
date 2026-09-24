import express from 'express';
import {
  getComplianceItems,
  addComplianceItem,
  updateComplianceItem,
  deleteComplianceItem,
  autoGenerateCompliance
} from '../controllers/complianceController.js';

const router = express.Router();

router.get('/:tenderId', getComplianceItems);
router.post('/:tenderId', addComplianceItem);
router.post('/:tenderId/auto-generate', autoGenerateCompliance);
router.put('/:tenderId/items/:itemId', updateComplianceItem);
router.delete('/:tenderId/items/:itemId', deleteComplianceItem);

export default router;
