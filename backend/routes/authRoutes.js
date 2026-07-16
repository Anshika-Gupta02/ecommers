import express from 'express';
import { register, login, getMe, googleLogin, getGoogleConfig } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google-login', googleLogin);
router.get('/config', getGoogleConfig);
router.get('/me', authenticateToken, getMe);

export default router;
