import express from 'express';
import { chatWithTender } from '../controllers/chatController.js';

const router = express.Router();
router.post('/:tenderId', chatWithTender);

export default router;
