// src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface AuthenticatedUser {
  userId: string;
  userName: string;
  userEmail: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Access token required'
      });
      return;
    }

    jwt.verify(token, env.JWT_SECRET, (err, decoded) => {
      if (err) {
        console.error('JWT verification error:', err.message);
        res.status(403).json({
          success: false,
          message: 'Invalid or expired token'
        });
        return;
      }

      // Extract user data from token
      const payload = decoded as any;
      req.user = {
        userId: payload.userId || payload.id,
        userName: payload.userName || payload.username || payload.name,
        userEmail: payload.userEmail || payload.email
      };

      next();
    });

  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication error'
    });
  }
};