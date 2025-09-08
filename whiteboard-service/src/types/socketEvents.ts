// Real-time event types for Socket.io

// User data for socket connections
export interface SocketUser {
  userId: string;
  userName: string;
  userEmail: string;
  socketId: string;
}

// Text editing operations
export interface TextOperation {
  type: 'insert' | 'delete' | 'retain';
  position: number;
  content?: string; // for insert operations
  length?: number;  // for delete operations
  userId: string;
  userName: string;
  timestamp: number;
}

// Cursor position updates
export interface CursorUpdate {
  userId: string;
  userName: string;
  position: number;
  color: string;
}

// User presence (online/offline)
export interface UserPresence {
  userId: string;
  userName: string;
  status: 'online' | 'offline' | 'typing' | 'idle';
  lastActivity: number;
}

// Document room info
export interface DocumentRoom {
  documentId: string;
  users: SocketUser[];
}

// Events from client to server
export interface ClientToServerEvents {
  // Document operations
  'join-document': (documentId: string, callback: (response: { success: boolean; message: string; document?: any }) => void) => void;
  'leave-document': (documentId: string) => void;
  
  // Text editing
  'text-operation': (documentId: string, operation: TextOperation) => void;
  'cursor-update': (documentId: string, cursor: CursorUpdate) => void;
  
  // User presence
  'user-typing': (documentId: string) => void;
  'user-stopped-typing': (documentId: string) => void;
  
  // Authentication
  'authenticate': (token: string, callback: (response: { success: boolean; user?: SocketUser }) => void) => void;
}

// Events from server to client
export interface ServerToClientEvents {
  // Document updates
  'document-updated': (operation: TextOperation) => void;
  'cursor-moved': (cursor: CursorUpdate) => void;
  
  // User presence updates
  'user-joined': (user: SocketUser) => void;
  'user-left': (userId: string) => void;
  'user-typing': (userId: string, userName: string) => void;
  'user-stopped-typing': (userId: string) => void;
  'users-online': (users: SocketUser[]) => void;
  
  // Errors
  'error': (message: string) => void;
  'permission-denied': (message: string) => void;
}

// Inter-server events (for Redis pub/sub)
export interface InterServerEvents {
  // These events are sent between server instances via Redis
  'document-operation': (documentId: string, operation: TextOperation) => void;
  'cursor-update': (documentId: string, cursor: CursorUpdate) => void;
  'user-presence': (documentId: string, presence: UserPresence) => void;
}

// Socket data stored on each connection
export interface SocketData {
  userId?: string;
  userName?: string;
  userEmail?: string;
  currentDocument?: string;
  authenticated: boolean;
}