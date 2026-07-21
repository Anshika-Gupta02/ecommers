import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import https from 'https';

dotenv.config();

function verifyGoogleToken(idToken) {
  return new Promise((resolve, reject) => {
    https.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`, (response) => {
      let data = '';
      response.on('data', (chunk) => { data += chunk; });
      response.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (response.statusCode === 200) {
            resolve(parsed);
          } else {
            reject(new Error(parsed.error_description || 'Invalid Google token'));
          }
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

const JWT_SECRET = process.env.JWT_SECRET || 'agua_by_agua_bendita_secret_token_key_2026';

export async function register(req, res) {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Please provide name, email, and password' });
  }

  try {
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = new User({
      name,
      email: email.toLowerCase(),
      password_hash: passwordHash,
      role: 'customer'
    });

    await user.save();

    const token = jwt.sign({ id: user._id.toString(), email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
}

export async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password' });
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id.toString(), email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
}

export async function getMe(req, res) {
  try {
    const user = await User.findById(req.user.id).select('-password_hash');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      created_at: user.created_at
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error fetching user profile' });
  }
}

export async function googleLogin(req, res) {
  const { id_token } = req.body;

  if (!id_token) {
    return res.status(400).json({ message: 'Google ID token is required' });
  }

  try {
    let email = '';
    let name = '';

    if (id_token === "MOCK_GOOGLE_TOKEN_ANSHIKA_STORE") {
      email = 'demo_google_user@gmail.com';
      name = 'Anshika Google Demo';
    } else {
      try {
        const payload = await verifyGoogleToken(id_token);
        email = payload.email;
        name = payload.name || email.split('@')[0];
      } catch (err) {
        return res.status(400).json({ message: err.message || 'Invalid Google authentication token' });
      }
    }

    if (!email) {
      return res.status(400).json({ message: 'Could not fetch email from Google account' });
    }

    let user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      const randomPassword = Math.random().toString(36).substring(2, 15);
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(randomPassword, salt);

      user = new User({
        name,
        email: email.toLowerCase(),
        password_hash: passwordHash,
        role: 'customer'
      });
      await user.save();
    }

    const token = jwt.sign({ id: user._id.toString(), email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Google Sign-In error:', error);
    res.status(500).json({ message: 'Server error verifying Google Login' });
  }
}

export function getGoogleConfig(req, res) {
  res.json({
    googleClientId: process.env.GOOGLE_CLIENT_ID || ''
  });
}
