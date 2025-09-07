import dotenv from 'dotenv';

// Load .env file first
dotenv.config();

// What our app needs to work
interface EnvConfig {
  PORT: number;
  NODE_ENV: string;
  MONGODB_URI: string;
  REDIS_URL: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  SERVICE_NAME: string;
}

// Check if all required variables exist
const validateEnv = (): EnvConfig => {
  
  const requiredVars = ['MONGODB_URI', 'REDIS_URL', 'JWT_SECRET'];
  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing);
    console.error('💡 Please check your .env file');
    process.exit(1);
  }

  const jwtSecret = process.env.JWT_SECRET!;
  if (jwtSecret.length < 32) {
    console.error('❌ JWT_SECRET must be at least 32 characters long for security');
    console.error('💡 Current length:', jwtSecret.length);
    process.exit(1);
  }
  
  return {
    PORT: parseInt(process.env.PORT || '3001', 10),
    NODE_ENV: process.env.NODE_ENV || 'development',
    MONGODB_URI: process.env.MONGODB_URI!,
    REDIS_URL: process.env.REDIS_URL!,
    JWT_SECRET: jwtSecret,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
    SERVICE_NAME: process.env.SERVICE_NAME || 'auth-service'
  };
};

export const env = validateEnv();