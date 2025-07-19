import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Database } from '../database';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

export interface AuthRequest extends Request {
  user?: {
    id: number;
    username: string;
    email: string;
  };
}

export const authenticateToken = (db: Database) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    // Try to get token from httpOnly cookie first, then fallback to Authorization header
    const token = req.cookies.token || (req.headers['authorization']?.split(' ')[1]);

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      
      // Verify user still exists and session is valid
      const user = await db.get(
        'SELECT id, username, email FROM users WHERE id = ?',
        [decoded.userId]
      );

      if (!user) {
        return res.status(401).json({ error: 'Invalid token' });
      }

      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  };
};

export const generateToken = (userId: number): string => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
};