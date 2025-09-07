import jwt from 'jsonwebtoken';
import { env } from '../config/index';

// 🎫 What we store inside the JWT token
export interface JWTPayload {
  userId: string;
  email: string;
  name: string;
}

export const jwtUtils = {
  
  
  generateToken(payload: JWTPayload): string {
    
    return jwt.sign(
      payload,
      env.JWT_SECRET as string,
      {
        expiresIn: '24',
        issuer: 'collabboard-auth-service',
        audience: 'collabboard-users'
      }
    );
  },

  // ✅ Verify and decode a JWT token
  verifyToken(token: string): JWTPayload | null {
    try {
      
      const decoded = jwt.verify(
        token,
        env.JWT_SECRET,
        {
          issuer: 'collabboard-auth-service',
          audience: 'collabboard-users'
        }
      ) as JWTPayload;
      
      // console.log('✅ JWT token valid for user:', decoded.email);
      return decoded;
      
    } catch (error) {
      console.error('❌ JWT verification failed:', error);
      return null;
    }
  },

  // 📤 Extract token from Authorization header
  extractTokenFromHeader(authHeader: string): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('⚠️ Invalid authorization header format');
      return null;
    }
    
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    // console.log('📤 Token extracted from header');
    return token;
  },

  // 🔄 Refresh token (generate new one with same payload)
  refreshToken(oldToken: string): string | null {
    const payload = this.verifyToken(oldToken);
    if (!payload) {
      return null;
    }
    
    console.log('🔄 Refreshing token for user:', payload.email);
    return this.generateToken(payload);
  }
};