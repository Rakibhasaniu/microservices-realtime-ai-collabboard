// src/index.ts
import  express from 'express';
import  cors from 'cors';
import  helmet from 'helmet';
import { env } from './config/env';

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Simple health check route
app.get('/health', (req, res) => {
  res.json({
    service: env.SERVICE_NAME,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    port: env.PORT
  });
});

// Start server
app.listen(env.PORT, () => {
  console.log(`AI Service running on port ${env.PORT}`);
  console.log(`Health check: http://localhost:${env.PORT}/health`);
  console.log(`HuggingFace API: ${env.HUGGINGFACE_API_KEY ? 'Configured' : 'Missing'}`);
});