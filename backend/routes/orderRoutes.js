import express from 'express';
import { createOrder, getOrders } from '../controllers/orderController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Secure all order routes with JWT verification
router.use(authenticateToken);

router.post('/', createOrder);
router.get('/', getOrders);

export default router;
