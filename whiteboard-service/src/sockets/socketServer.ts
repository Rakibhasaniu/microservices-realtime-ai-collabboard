import { Server } from 'socket.io';
import { createServer } from 'http';
import express from 'express';
import { authenticateSocket } from '../middleware/socketAuth';
import { DocumentSocketHandlers } from './documentHandlers';
import { 
  ClientToServerEvents, 
  ServerToClientEvents, 
  InterServerEvents, 
  SocketData 
} from '../types/socketEvents';
import { env } from '../config/env';

export function createSocketServer() {
  const app = express();
  const httpServer = createServer(app);

  const io = new Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >(httpServer, {
    cors: {
      origin: env.CORS_ORIGINS,
      methods: ["GET", "POST"],
      credentials: true
    },
    pingTimeout: 60000,
    pingInterval: 25000
  });

  io.use(authenticateSocket);

  const documentHandlers = new DocumentSocketHandlers(io);

  io.on('connection', (socket) => {
    console.log('User connected:', socket.data.userName, '(', socket.id, ')');

    // Register all document-related event handlers
    documentHandlers.registerHandlers(socket);

    socket.on('disconnect', (reason) => {
      console.log('User disconnected:', socket.data.userName, 'Reason:', reason);
    });

    socket.emit('users-online', []);
  });

  return { app, httpServer, io };
}