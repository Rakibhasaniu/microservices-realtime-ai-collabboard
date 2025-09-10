// src/routes/routes.ts
import { createProxyMiddleware } from 'http-proxy-middleware';
import { env } from '../config/env';
import { authenticateToken, optionalAuth } from '../middleware/auth';
import { Router } from 'express';

const router = Router();

// Auth Service Routes (no auth required)
export const authProxy = createProxyMiddleware({
  target: env.AUTH_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/auth': '', 
  },
  on: {
    proxyReq: (proxyReq, req, res) => {
      console.log(`[AUTH] ${req.method} ${req.url} -> ${env.AUTH_SERVICE_URL}${req.url}`);
    },
  },
});


// Whiteboard Service Routes (auth required)
export const whiteboardProxy = createProxyMiddleware({
  target: env.WHITEBOARD_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/whiteboard': '', // Remove /whiteboard prefix
  },
  on:{

    proxyReq: (proxyReq, req, res) => {
      console.log(`[WHITEBOARD] ${req.method} ${req.url} -> ${env.WHITEBOARD_SERVICE_URL}${req.url}`);
      
      // Forward user info to whiteboard service
      if ((req as any).user) {
        proxyReq.setHeader('X-User-ID', (req as any).user.userId);
        proxyReq.setHeader('X-User-Name', (req as any).user.username);
        proxyReq.setHeader('X-User-Email', (req as any).user.email);
      }
    }
  }
});

// AI Service Routes (auth required)
export const aiProxy = createProxyMiddleware({
  target: env.AI_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/ai': '', // Remove /ai prefix
  },
  on:{

    proxyReq: (proxyReq, req, res) => {
      console.log(`[AI] ${req.method} ${req.url} -> ${env.AI_SERVICE_URL}${req.url}`);
      
      // Forward user info to AI service
      if ((req as any).user) {
        proxyReq.setHeader('X-User-ID', (req as any).user.userId);
        proxyReq.setHeader('X-User-Name', (req as any).user.username);
      }
    }
  }
});

export { router };