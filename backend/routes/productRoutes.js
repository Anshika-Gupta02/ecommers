import express from 'express';
import { 
  getCategories, 
  getProducts, 
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} from '../controllers/productController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { isAdmin } from '../middleware/adminMiddleware.js';

const router = express.Router();

router.get('/categories', getCategories);
router.get('/products', getProducts);
router.get('/products/:id', getProductById);

// Admin CRUD Routes
router.post('/products', authenticateToken, isAdmin, createProduct);
router.put('/products/:id', authenticateToken, isAdmin, updateProduct);
router.delete('/products/:id', authenticateToken, isAdmin, deleteProduct);

export default router;
