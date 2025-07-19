import express from 'express';
import bcrypt from 'bcrypt';
import { Database } from '../database';
import { generateToken } from '../middleware/auth';

const router = express.Router();

export function createAuthRoutes(db: Database) {
  // Register new user
  router.post('/register', async (req, res) => {
    try {
      const { username, email, password } = req.body;

      // Validate input
      if (!username || !email || !password) {
        return res.status(400).json({ error: 'Username, email, and password are required' });
      }

      // Validate password complexity
      if (password.length < 8) {
        return res.status(400).json({ error: 'Password must be at least 8 characters' });
      }
      
      const hasUpperCase = /[A-Z]/.test(password);
      const hasLowerCase = /[a-z]/.test(password);
      const hasNumbers = /\d/.test(password);
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
      
      if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
        return res.status(400).json({ 
          error: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character' 
        });
      }

      // Check if user already exists
      const existingUser = await db.get(
        'SELECT id FROM users WHERE username = ? OR email = ?',
        [username, email]
      );

      if (existingUser) {
        return res.status(400).json({ error: 'Account already exists' });
      }

      // Hash password
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // Create user
      const result = await db.run(
        'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
        [username, email, passwordHash]
      );

      // Generate token
      const token = generateToken(result.lastID);

      // Set httpOnly cookie for security
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      res.status(201).json({
        message: 'User created successfully',
        user: {
          id: result.lastID,
          username,
          email
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Login user
  router.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      // Find user
      const user = await db.get(
        'SELECT id, username, email, password_hash FROM users WHERE email = ?',
        [email]
      );

      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);

      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Generate token
      const token = generateToken(user.id);

      // Set httpOnly cookie for security
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      res.json({
        message: 'Login successful',
        user: {
          id: user.id,
          username: user.username,
          email: user.email
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Get current user
  router.get('/me', async (req, res) => {
    try {
      // Try to get token from httpOnly cookie first, then fallback to Authorization header
      const token = req.cookies.token || (req.headers['authorization']?.split(' ')[1]);

      if (!token) {
        return res.status(401).json({ error: 'Access token required' });
      }

      // This would normally use the auth middleware, but for simplicity:
      const jwt = require('jsonwebtoken');
      const JWT_SECRET = process.env.JWT_SECRET;
      
      if (!JWT_SECRET) {
        return res.status(500).json({ error: 'Server configuration error' });
      }
      
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        
        const user = await db.get(
          'SELECT id, username, email, created_at FROM users WHERE id = ?',
          [decoded.userId]
        );

        if (!user) {
          return res.status(401).json({ error: 'Invalid token' });
        }

        res.json({ user });
      } catch (jwtError) {
        return res.status(401).json({ error: 'Invalid token' });
      }
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Logout user
  router.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logged out successfully' });
  });

  return router;
}