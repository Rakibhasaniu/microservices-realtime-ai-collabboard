// src/index.ts
import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import { aiProxy, authProxy, whiteboardProxy } from './routes/routes';
import { authenticateToken } from './middleware/auth';

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003'],
  credentials: true
}));
app.use(express.json());

// Health check
app.get('/health', (req:Request, res:Response) => {
  res.json({
    service: 'api-gateway',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      auth: env.AUTH_SERVICE_URL,
      whiteboard: env.WHITEBOARD_SERVICE_URL,
      ai: env.AI_SERVICE_URL
    }
  });
});

// Service routing
app.use('/auth', authProxy); 
app.use('/whiteboard', authenticateToken, whiteboardProxy); 
app.use('/ai', authenticateToken, aiProxy);

// Root route
app.get('/', (req:Request, res:Response) => {
  res.json({
    message: 'CollabBoard API Gateway',
    version: '1.0.0',
    endpoints: {
      auth: '/auth/*',
      whiteboard: '/whiteboard/* (requires auth)',
      ai: '/ai/* (requires auth)'
    }
  });
});

// 404 handler
app.use((req:Request, res:Response) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    availableRoutes: ['/auth/*', '/whiteboard/*', '/ai/*', '/health']
  });
});

// Start server
app.listen(env.PORT, () => {
  console.log(`API Gateway running on port ${env.PORT}`);
  console.log(`Health: http://localhost:${env.PORT}/health`);
  console.log('Service routes:');
  console.log(`  Auth: http://localhost:${env.PORT}/auth -> ${env.AUTH_SERVICE_URL}`);
  console.log(`  Whiteboard: http://localhost:${env.PORT}/whiteboard -> ${env.WHITEBOARD_SERVICE_URL}`);
  console.log(`  AI: http://localhost:${env.PORT}/ai -> ${env.AI_SERVICE_URL}`);
});