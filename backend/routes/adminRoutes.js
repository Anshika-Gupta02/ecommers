import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
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

// Resolve __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure disk storage for Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(dir)){
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

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
    // Return relative URL path
    const relativeUrl = `/uploads/${req.file.filename}`;
    res.json({
      message: 'Image uploaded successfully.',
      url: relativeUrl
    });
  });
});

export default router;
