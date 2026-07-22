import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './db.js';

// Resolve directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import routes
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { submitInquiry, getStoreSettings } from './controllers/adminController.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Serve static uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ensure Database Connection on Serverless Executions
app.use(async (req, res, next) => {
  try {
    await connectDB();
  } catch (err) {
    console.error('DB Connection Middleware Error:', err);
  }
  next();
});

// Routes Mount
app.use('/api/auth', authRoutes);
app.use('/api', productRoutes); // Includes /products and /categories
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.get('/api/settings', getStoreSettings);
app.post('/api/contact', submitInquiry);

// Base route
app.get('/', (req, res) => {
  res.json({ message: ' E-commerce API is running with MongoDB Atlas...' });
});

app.get('/api', (req, res) => {
  res.json({ message: ' API is active.' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || 'Internal server error occurred!' });
});

// Start Server locally if not running on Vercel Serverless
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
  });
}

export default app;
