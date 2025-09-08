import { Socket, Server } from 'socket.io';
import { DocumentService } from '../services/documentService';
import { 
  ClientToServerEvents, 
  ServerToClientEvents, 
  SocketData, 
  TextOperation, 
  CursorUpdate,
  SocketUser 
} from '../types/socketEvents';

type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents, any, SocketData>;
type TypedServer = Server<ClientToServerEvents, ServerToClientEvents, any, SocketData>;

export class DocumentSocketHandlers {
  private documentService: DocumentService;
  private io: TypedServer;

  constructor(io: TypedServer) {
    this.io = io;
    this.documentService = new DocumentService();
  }

  // Handle user joining a document
  handleJoinDocument = (socket: TypedSocket) => {
    socket.on('join-document', async (documentId: string, callback) => {
      try {
        const userId = socket.data.userId!;
        const userName = socket.data.userName!;
        
        // Check if user can access document
        const documentResult = await this.documentService.getDocument(documentId, userId);
        
        if (!documentResult.success) {
          callback({ success: false, message: documentResult.message });
          return;
        }

        // Join document room
        await socket.join(`document:${documentId}`);
        socket.data.currentDocument = documentId;

        // Create socket user object
        const socketUser: SocketUser = {
          userId,
          userName,
          userEmail: socket.data.userEmail!,
          socketId: socket.id
        };

        // Notify other users in the document
        socket.to(`document:${documentId}`).emit('user-joined', socketUser);

        // Send current users list to the joining user
        const socketsInRoom = await this.io.in(`document:${documentId}`).fetchSockets();
        const onlineUsers: SocketUser[] = socketsInRoom.map(s => ({
          userId: s.data.userId!,
          userName: s.data.userName!,
          userEmail: s.data.userEmail!,
          socketId: s.id
        }));

        socket.emit('users-online', onlineUsers);

        callback({ 
          success: true, 
          message: 'Joined document successfully',
          document: documentResult.document
        });

      } catch (error) {
        callback({ success: false, message: 'Failed to join document' });
      }
    });
  };

  // Handle user leaving a document
  handleLeaveDocument = (socket: TypedSocket) => {
    socket.on('leave-document', async (documentId: string) => {
      try {
        const userId = socket.data.userId!;

        // Leave document room
        await socket.leave(`document:${documentId}`);
        socket.data.currentDocument = undefined;

        // Remove user from active users in database
        await this.documentService.leaveDocument(documentId, userId);

        // Notify other users
        socket.to(`document:${documentId}`).emit('user-left', userId);

      } catch (error) {
        socket.emit('error', 'Failed to leave document');
      }
    });
  };

  // Handle text operations (insert, delete, etc.)
  handleTextOperation = (socket: TypedSocket) => {
    socket.on('text-operation', async (documentId: string, operation: TextOperation) => {
      try {
        const userId = socket.data.userId!;

        // Verify user can edit this document
        const documentResult = await this.documentService.getDocument(documentId, userId);
        if (!documentResult.success || !documentResult.document?.canUserEdit(userId)) {
          socket.emit('permission-denied', 'You do not have permission to edit this document');
          return;
        }

        // Apply operation to document in database
        let newContent = documentResult.document.content;
        
        switch (operation.type) {
          case 'insert':
            newContent = newContent.slice(0, operation.position) + 
                        (operation.content || '') + 
                        newContent.slice(operation.position);
            break;
          case 'delete':
            newContent = newContent.slice(0, operation.position) + 
                        newContent.slice(operation.position + (operation.length || 0));
            break;
        }

        // Update document in database
        await this.documentService.updateDocument(documentId, userId, { content: newContent });

        // Broadcast operation to all other users in the document
        socket.to(`document:${documentId}`).emit('document-updated', operation);

        // TODO: Later we'll add this to Redis pub/sub for multi-server scaling

      } catch (error) {
        socket.emit('error', 'Failed to apply text operation');
      }
    });
  };

  // Handle cursor position updates
  handleCursorUpdate = (socket: TypedSocket) => {
    socket.on('cursor-update', async (documentId: string, cursor: CursorUpdate) => {
      try {
        // Broadcast cursor position to other users (don't save to DB, it's real-time only)
        socket.to(`document:${documentId}`).emit('cursor-moved', cursor);

      } catch (error) {
        socket.emit('error', 'Failed to update cursor');
      }
    });
  };

  // Handle typing indicators
  handleTypingIndicators = (socket: TypedSocket) => {
    socket.on('user-typing', (documentId: string) => {
      const userId = socket.data.userId!;
      const userName = socket.data.userName!;
      
      socket.to(`document:${documentId}`).emit('user-typing', userId, userName);
    });

    socket.on('user-stopped-typing', (documentId: string) => {
      const userId = socket.data.userId!;
      
      socket.to(`document:${documentId}`).emit('user-stopped-typing', userId);
    });
  };

  // Handle socket disconnection
  handleDisconnect = (socket: TypedSocket) => {
    socket.on('disconnect', async () => {
      try {
        const userId = socket.data.userId;
        const currentDocument = socket.data.currentDocument;

        if (userId && currentDocument) {
          // Remove user from active users
          await this.documentService.leaveDocument(currentDocument, userId);
          
          // Notify other users
          socket.to(`document:${currentDocument}`).emit('user-left', userId);
        }

      } catch (error) {
        console.error('Error handling disconnect:', error);
      }
    });
  };

  // Register all handlers for a socket
  registerHandlers(socket: TypedSocket) {
    this.handleJoinDocument(socket);
    this.handleLeaveDocument(socket);
    this.handleTextOperation(socket);
    this.handleCursorUpdate(socket);
    this.handleTypingIndicators(socket);
    this.handleDisconnect(socket);
  }
}