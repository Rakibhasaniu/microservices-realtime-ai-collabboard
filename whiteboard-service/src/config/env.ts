import dotenv from 'dotenv';

dotenv.config();

interface EnvConfig {
  PORT: number;
  NODE_ENV: string;
  MONGODB_URI: string;
  REDIS_URL: string;
  JWT_SECRET: string;
  SERVICE_NAME: string;
  AUTH_SERVICE_URL: string;
  CORS_ORIGINS: string[];
}

const validateEnv = (): EnvConfig => {
  const requiredVars = ['MONGODB_URI', 'REDIS_URL', 'JWT_SECRET', 'AUTH_SERVICE_URL'];
  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing);
    process.exit(1);
  }

  const jwtSecret = process.env.JWT_SECRET!;
  if (jwtSecret.length < 32) {
    console.error('❌ JWT_SECRET must be at least 32 characters long');
    process.exit(1);
  }
  
  // Parse CORS origins
  const corsOrigins = process.env.CORS_ORIGINS 
    ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
    : ['http://localhost:3000'];
  
  return {
    PORT: parseInt(process.env.PORT || '3002', 10),
    NODE_ENV: process.env.NODE_ENV || 'development',
    MONGODB_URI: process.env.MONGODB_URI!,
    REDIS_URL: process.env.REDIS_URL!,
    JWT_SECRET: jwtSecret,
    SERVICE_NAME: process.env.SERVICE_NAME || 'whiteboard-service',
    AUTH_SERVICE_URL: process.env.AUTH_SERVICE_URL!,
    CORS_ORIGINS: corsOrigins
  };
};

export const env = validateEnv();