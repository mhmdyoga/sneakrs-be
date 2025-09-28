import express from 'express';
import { verifyToken } from '../middleware/token-verify.js';
import { totalSales, totalSalesByMonth } from '../controllers/sales.controller.js';

const router = express.Router();

router.get('/total-sales', verifyToken, totalSales);
router.get('/total/month', verifyToken, totalSalesByMonth);

export default router;