import { Router } from "express";
import { AuthController } from "../controller/authController";

import jwt from 'jsonwebtoken';
import app from "../app";


const router = Router();
const authController = new AuthController(); // create instance

router.post('/register',authController.register)
router.post('/login',authController.login)
router.get('/debug-token', (req, res) => {
  const testPayload = {
    userId: 'test123',
    email: 'test@example.com', 
    name: 'Test User'
  };
  
  console.log('Creating test token with:');
  console.log('Current time:', new Date().toISOString());
  console.log('Unix timestamp:', Math.floor(Date.now() / 1000));
  
  const token = jwt.sign(testPayload, process.env.JWT_SECRET!, { 
    expiresIn: '1h'
  });
  
  // Decode to verify
  const decoded = jwt.decode(token) as any;
  console.log('Token iat:', decoded.iat);
  console.log('Token exp:', decoded.exp);
  console.log('Difference (seconds):', decoded.exp - decoded.iat);
  
  res.json({ 
    token,
    decoded,
    currentTime: Math.floor(Date.now() / 1000),
    timeDifference: decoded.exp - decoded.iat
  });
});
export default router;