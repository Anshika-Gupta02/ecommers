import express from 'express';
import { getCart, addToCart, updateCartItemQuantity, removeFromCart } from '../controllers/cartController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protect all cart routes with JWT verification
router.use(authenticateToken);

router.get('/', getCart);
router.post('/', addToCart);
router.put('/:id', updateCartItemQuantity);
router.delete('/:id', removeFromCart);

export default router;
