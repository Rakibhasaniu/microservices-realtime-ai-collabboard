import mongoose, { Document as MongoDocument, Schema, Model } from 'mongoose';

export interface ICursor {
  userId: string;
  userName: string;
  position: number;
  color: string;
  lastUpdated: Date;
}

export interface IDocumentChange {
  userId: string;
  userName: string;
  operation: 'insert' | 'delete' | 'retain';
  position: number;
  content?: string;
  length?: number;
  timestamp: Date;
}

export interface ICollaborator {
  userId: string;
  userName: string;
  userEmail: string;
  role: 'owner' | 'editor' | 'viewer';
  joinedAt: Date;
  lastActive: Date;
}

export interface IDocument extends MongoDocument {
  
  title: string;
  content: string;
  ownerId: string;
  ownerName: string;
  
  // Collaboration features
  collaborators: ICollaborator[];
  activeUsers: string[];
  
  // Real-time data
  cursors: ICursor[];
  recentChanges: IDocumentChange[];
  
  // Document settings
  isPublic: boolean;
  allowComments: boolean;
  maxCollaborators: number;
  
  // Metadata
  lastModified: Date;
  createdAt: Date;
  updatedAt: Date;
  version: number;

  //  CUSTOM METHODS 
  addCollaborator(userId: string, userName: string, userEmail: string, role?: string): Promise<IDocument>;
  removeCollaborator(userId: string): Promise<IDocument>;
  updateUserActivity(userId: string): Promise<IDocument | null>;
  canUserEdit(userId: string): boolean;
  canUserView(userId: string): boolean;
  cleanOldData(): Promise<IDocument>;
}

export interface IDocumentModel extends Model<IDocument> {
  // Add any static methods here if needed
}

const DocumentSchema: Schema<IDocument> = new Schema({
  title: {
    type: String,
    required: [true, 'Document title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  
  content: {
    type: String,
    default: '',
    maxlength: [1000000, 'Document too large']
  },
  
  ownerId: {
    type: String,
    required: [true, 'Owner ID is required'],
    index: true
  },
  
  ownerName: {
    type: String,
    required: [true, 'Owner name is required']
  },
  
  collaborators: [{
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    userEmail: { type: String, required: true },
    role: { type: String, enum: ['owner', 'editor', 'viewer'], default: 'editor' },
    joinedAt: { type: Date, default: Date.now },
    lastActive: { type: Date, default: Date.now }
  }],
  
  activeUsers: [{ type: String }],
  
  cursors: [{
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    position: { type: Number, required: true, min: 0 },
    color: { type: String, required: true, default: '#007bff' },
    lastUpdated: { type: Date, default: Date.now }
  }],
  
  recentChanges: [{
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    operation: { type: String, enum: ['insert', 'delete', 'retain'], required: true },
    position: { type: Number, required: true, min: 0 },
    content: { type: String },
    length: { type: Number },
    timestamp: { type: Date, default: Date.now }
  }],
  
  isPublic: { type: Boolean, default: false },
  allowComments: { type: Boolean, default: true },
  maxCollaborators: { type: Number, default: 50, min: 1, max: 100 },
  lastModified: { type: Date, default: Date.now },
  version: { type: Number, default: 1 }
}, {
  timestamps: true
});

// 🔍 Indexes for fast queries
DocumentSchema.index({ ownerId: 1 });
DocumentSchema.index({ 'collaborators.userId': 1 });
DocumentSchema.index({ isPublic: 1 });
DocumentSchema.index({ lastModified: -1 });
DocumentSchema.index({ createdAt: -1 });

// 🔧 Instance Methods Implementation
DocumentSchema.methods.addCollaborator = function(
  userId: string, 
  userName: string, 
  userEmail: string, 
  role: string = 'editor'
): Promise<IDocument> {
  const existingCollaborator = this.collaborators.find((c: ICollaborator) => c.userId === userId);
  
  if (!existingCollaborator) {
    this.collaborators.push({
      userId,
      userName,
      userEmail,
      role: role as 'owner' | 'editor' | 'viewer',
      joinedAt: new Date(),
      lastActive: new Date()
    });
  }
  
  return this.save();
};

DocumentSchema.methods.removeCollaborator = function(userId: string): Promise<IDocument> {
  this.collaborators = this.collaborators.filter((c: ICollaborator) => c.userId !== userId);
  return this.save();
};

DocumentSchema.methods.updateUserActivity = function(userId: string): Promise<IDocument | null> {
  const collaborator = this.collaborators.find((c: ICollaborator) => c.userId === userId);
  if (collaborator) {
    collaborator.lastActive = new Date();
    return this.save();
  }
  return Promise.resolve(null);
};

DocumentSchema.methods.canUserEdit = function(userId: string): boolean {
  if (this.ownerId === userId) return true;
  
  const collaborator = this.collaborators.find((c: ICollaborator) => c.userId === userId);
  return collaborator && (collaborator.role === 'editor' || collaborator.role === 'owner');
};

DocumentSchema.methods.canUserView = function(userId: string): boolean {
  if (this.isPublic) return true;
  if (this.ownerId === userId) return true;
  
  const collaborator = this.collaborators.find((c: ICollaborator) => c.userId === userId);
  return !!collaborator;
};

DocumentSchema.methods.cleanOldData = function(): Promise<IDocument> {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  
  // Remove old cursors (older than 1 hour)
  this.cursors = this.cursors.filter((cursor: ICursor) => cursor.lastUpdated > oneHourAgo);
  
  // Keep only recent changes (last 24 hours or last 100 changes)
  this.recentChanges = this.recentChanges
    .filter((change: IDocumentChange) => change.timestamp > oneDayAgo)
    .slice(-100);
  
  return this.save();
};

// 📦 Export the model with proper typing
export default mongoose.model<IDocument, IDocumentModel>('Document', DocumentSchema);