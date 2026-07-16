import express from 'express';
import { 
  getAllOrders, 
  updateOrderStatus, 
  getStats,
  getAllUsers,
  toggleUserRole,
  deleteUser,
  getAllInquiries,
  deleteInquiry,
  getAllPromoCodes,
  createPromoCode,
  togglePromoCodeStatus,
  deletePromoCode,
  validatePromoCode
} from '../controllers/adminController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { isAdmin } from '../middleware/adminMiddleware.js';

const router = express.Router();

// Authenticated checkout customer paths
router.get('/validate-promo/:code', authenticateToken, validatePromoCode);

// Guard all admin API endpoints (requires admin status)
router.use(authenticateToken);
router.use(isAdmin);

router.get('/orders', getAllOrders);
router.put('/orders/:id', updateOrderStatus);
router.get('/stats', getStats);

// User Management
router.get('/users', getAllUsers);
router.put('/users/:id/toggle-role', toggleUserRole);
router.delete('/users/:id', deleteUser);

// Contact Inquiries
router.get('/inquiries', getAllInquiries);
router.delete('/inquiries/:id', deleteInquiry);

// Promo Codes
router.get('/promo-codes', getAllPromoCodes);
router.post('/promo-codes', createPromoCode);
router.put('/promo-codes/:id/toggle-status', togglePromoCodeStatus);
router.delete('/promo-codes/:id', deletePromoCode);

export default router;
