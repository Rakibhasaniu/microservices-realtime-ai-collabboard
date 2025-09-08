import { Socket } from 'socket.io';
import { SocketData } from '../types/socketEvents';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';



interface JWTPayload {
  userId: string;
  email: string;
  name: string;
}

export const authenticateSocket = (socket: Socket<any,any,any,SocketData>,next:(err?: Error) => void) => {
  try {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) {
      return next(new Error('Authentication token required'));
    }
    const decoded = jwt.verify(token as string, env.JWT_SECRET) as JWTPayload;

    // Store user data in socket
    socket.data.userId = decoded.userId;
    socket.data.userName = decoded.name;
    socket.data.userEmail = decoded.email;
    socket.data.authenticated = true;

    next();
  } catch (error) {
    next(new Error('Invalid authentication token'));
  }
}