import express from 'express';
import multer from 'multer';
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
  validatePromoCode,
  getStoreSettings,
  updateStoreSettings
} from '../controllers/adminController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { isAdmin } from '../middleware/adminMiddleware.js';

// Store uploads in memory so the same code works in local dev and Vercel.
const storage = multer.memoryStorage();

// Configure upload middleware with limits and file filters
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images (jpeg, jpg, png, webp, gif) are allowed!'));
    }
  }
});

const router = express.Router();

// Public / Client Accessible endpoints
router.get('/settings', getStoreSettings);

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

// Store Settings update
router.put('/settings', updateStoreSettings);

// Image Upload Endpoint (admin only)
router.post('/upload', (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload an image file.' });
    }

    const mimeType = req.file.mimetype || 'image/jpeg';
    const base64Image = req.file.buffer.toString('base64');
    const dataUrl = `data:${mimeType};base64,${base64Image}`;
    res.json({
      message: 'Image uploaded successfully.',
      url: dataUrl
    });
  });
});

export default router;
