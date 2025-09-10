// src/index.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import RedisConfig from './config/redis';
import documentRoutes from './routes/documentRoutes';
import { env } from './config/env';
import connectDB from './config/database';
import { createSocketServer } from './sockets/socketServer';

async function startServer() {
  try {
    console.log('🚀 Starting Whiteboard Service...');

    // Initialize Redis connections
    console.log('📡 Connecting to Redis...');
    const redisConfig = RedisConfig.getInstance();
    await redisConfig.connect();

    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    await connectDB();

    // Create Express app and Socket.io server
    const { app, httpServer, io } = createSocketServer();

    // Middleware
    app.use(helmet());
    app.use(cors({
      origin: env.CORS_ORIGINS,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    }));
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true }));

    // Routes
    app.use('/documents', documentRoutes);

    // Root endpoint
    app.get('/', (req, res) => {
      res.json({
        service: 'CollabBoard Whiteboard Service',
        version: '1.0.0',
        status: 'running',
        features: {
          'Document Management': '/documents',
          'Real-time Collaboration': 'Socket.io',
          'User Authentication': 'JWT',
          'Data Storage': 'MongoDB',
          'Caching & Pub/Sub': 'Redis'
        },
        endpoints: {
          'GET /': 'Service information',
          'GET /documents/health': 'Health check',
          'POST /documents': 'Create document',
          'GET /documents': 'Get user documents',
          'GET /documents/:id': 'Get document by ID',
          'PUT /documents/:id': 'Update document',
          'DELETE /documents/:id': 'Delete document',
          'POST /documents/:id/collaborators': 'Add collaborator'
        },
        socketEvents: {
          'join-document': 'Join document room',
          'leave-document': 'Leave document room',
          'text-operation': 'Apply text changes',
          'cursor-update': 'Update cursor position',
          'user-typing': 'Typing indicators'
        }
      });
    });

   

    // Error handler
    app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
      console.error('❌ Unhandled error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        ...(env.NODE_ENV === 'development' && { error: error.message })
      });
    });

    // Start server
    httpServer.listen(env.PORT, () => {
      console.log('\n🎉 Whiteboard Service Started Successfully!');
      console.log(`📍 HTTP Server: http://localhost:${env.PORT}`);
      console.log(`🔌 Socket.io Server: ws://localhost:${env.PORT}`);
      console.log(`🌍 Environment: ${env.NODE_ENV}`);
      console.log(`📊 MongoDB: Connected`);
      console.log(`⚡ Redis: Connected`);
      console.log('\n📋 Available Endpoints:');
      console.log(`  🏥 Health: GET http://localhost:${env.PORT}/documents/health`);
      console.log(`  📄 Documents: POST/GET/PUT/DELETE http://localhost:${env.PORT}/documents`);
      console.log(`  🤝 Collaboration: Socket.io events`);
      console.log('\n✅ Service ready for requests!');
    });

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      console.log('\n📴 Received SIGTERM, shutting down gracefully...');
      httpServer.close(() => {
        console.log('🔌 HTTP server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', async () => {
      console.log('\n📴 Received SIGINT, shutting down gracefully...');
      httpServer.close(() => {
        console.log('🔌 HTTP server closed');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('❌ Failed to start Whiteboard Service:', error);
    process.exit(1);
  }
}

// Start the server
startServer();