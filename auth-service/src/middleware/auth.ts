
import { Request, Response, NextFunction } from 'express';
import { jwtUtils } from '../utils/jwt';
import { sessionUtils } from '../utils/redis';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      email? : string;
      userName?: string;
    }
  }
}

export const authMiddleware = async(req:Request,res:Response,next:NextFunction):Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if(!authHeader){
      console.log("No authorization header")
      res.status(401).json({
        success:false,
        error:'Authorization header required'
      })
      return;
    }
    const token = jwtUtils.extractTokenFromHeader(authHeader);
     if(!token){
      console.log("Invalid token format")
      res.status(401).json({
        success:false,
        error:'Invalid token format'
      })
      return;
    }
    const payload = jwtUtils.verifyToken(token);
      if (!payload) {
      console.log('❌ Invalid or expired token');
      res.status(401).json({
        success: false,
        error: 'Invalid or expired token'
      });
      return;
    }
    console.log("payload",payload)
    const sessionExists =await sessionUtils.sessionExists(payload.userId)
        if (!sessionExists) {
      console.log('❌ Session not found in Redis');
      res.status(401).json({
        success: false,
        error: 'Session expired. Please login again.'
      });
      return;
    }
    req.userId=payload.userId;
    req.email=payload.email;
    req.userName=payload.name;
    next();
  } catch(error) {
    console.log("Auth middleware error",error)
     res.status(500).json({
      success: false,
      error: 'Authentication service error'
    });
  }
}

export const requestLogger = (req:Request,res:Response,next:NextFunction): void => {
  const timeStamp= new Date().toISOString();
  console.log(`📝 ${timeStamp}-${req.method}-${req.path}`)

   if (req.body && Object.keys(req.body).length > 0) {
    console.log('📋 Request body keys:', Object.keys(req.body));
  }
  next();
}

export const corsMiddleware = (req:Request,res:Response,next:NextFunction):void => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
   if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  
  next();
}