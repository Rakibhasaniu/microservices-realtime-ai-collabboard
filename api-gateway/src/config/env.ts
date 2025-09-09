import dotenv from 'dotenv'

dotenv.config();

export const env = {
  PORT: parseInt(process.env.PORT || '3000'),
  NODE_ENV: process.env.NODE_ENV || 'development',
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key',

  AUTH_SERVICE_URL: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
  WHITEBOARD_SERVICE_URL: process.env.WHITEBOARD_SERVICE_URL || 'http://localhost:3002',
  AI_SERVICE_URL: process.env.AI_SERVICE_URL || 'http://localhost:3003',
  
  SERVICE_NAME: 'api-gateway'
}