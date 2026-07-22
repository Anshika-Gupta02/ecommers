import User from '../models/User.js';

export async function isAdmin(req, res, next) {
  try {
    if (!req.user || !req.user.id) {
      return res.status(403).json({ message: 'Access denied. Admin authorization required.' });
    }

    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin authorization required.' });
    }

    next();
  } catch (error) {
    console.error('isAdmin middleware error:', error);
    res.status(500).json({ message: 'Server error during authorization verification.' });
  }
}
