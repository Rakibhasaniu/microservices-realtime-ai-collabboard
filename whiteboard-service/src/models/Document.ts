import mongoose, { Document, Schema } from "mongoose";



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
  operation: 'insert' | 'delete' | 'retain'; // Types of text operations
  position: number; // Where in document
  content?: string; // What was inserted (for insert operations)
  length?: number; // How many characters (for delete operations)
  timestamp: Date;
}

export interface ICollaboratoe {
  userId: string;
  userName: string;
  userEmail: string;
  role: 'owner' | 'editor' | 'viewer';
  joinedAt: Date;
  lastActive: Date;
}

export interface IDocument extends Document {
  title: string;
  content: string;
  ownerId: string;
  ownerName: string;

  collaborators: ICollaboratoe[];
  activeUsers: string[];

  cursor: ICursor[];
  recentChanges: IDocumentChange[];

  isPublic: boolean;
  allowComments: boolean;
  maxCollaborators: number;

  lastModified: Date;
  createdAt: Date;
  updatedAt: Date;
  version: number;
}

const DocumentSchema: Schema = new Schema({
  title: {
    type: String,
    required: [true, 'Document is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  content: {
    type: String,
    default: '',
    maxlength: [1000000, 'Document  too large']
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
    userId: {
      type: String,
      required: true
    },
    userName: {
      type: String,
      required: true
    },
    userEmail: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ['owner', 'editor', 'viewer'],
      default: 'editor'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    lastActive: {
      type: Date,
      default: Date.now
    }
  }],
  activeUsers: [{
    type: String
  }],
  cursors: [{
    userId: {
      type: String,
      required: true
    },
    userName: {
      type: String,
      required: true
    },
    position: {
      type: Number,
      required: true,
      min: 0
    },
    color: {
      type: String,
      required: true,
      default: '#007bff' // Default blue color
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  }],
  recentChanges: [{
    userId: {
      type: String,
      required: true
    },
    userName: {
      type: String,
      required: true
    },
    operation: {
      type: String,
      enum: ['insert', 'delete', 'retain'],
      required: true
    },
    position: {
      type: Number,
      required: true,
      min: 0
    },
    content: {
      type: String // For insert operations
    },
    length: {
      type: Number // For delete operations
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  isPublic: {
    type: Boolean,
    default: false
  },

  allowComments: {
    type: Boolean,
    default: true
  },

  maxCollaborators: {
    type: Number,
    default: 50,
    min: 1,
    max: 100
  },

  lastModified: {
    type: Date,
    default: Date.now
  },

  version: {
    type: Number,
    default: 1
  },

},
  {
    timestamps: true
  });

DocumentSchema.index({ ownerId: 1 }); // Find documents by owner
DocumentSchema.index({ 'collaborators.userId': 1 }); // Find documents user can access
DocumentSchema.index({ isPublic: 1 }); // Find public documents
DocumentSchema.index({ lastModified: -1 }); // Sort by recent activity
DocumentSchema.index({ createdAt: -1 }); // Sort by creation date


DocumentSchema.methods.addCollaborator = function(userId: string, userEmail: string, userName: string, role?: string) {
  const collaboratorRole = role || 'editor';
  const existingCollaborator = this.collaborators.find((c : ICollaboratoe) => c.userId === userId)
  if(!existingCollaborator){
    this.collaborators.push({
      userId,
      userName,
      userEmail,
      role,
      joinedAt: new Date(),
      lastActive: new Date()

    })
  }
  return this.save();
  
}

DocumentSchema.methods.removeCollaborator = function(userId: string) {
  this.collaborators = this.collaborators.filter((c: ICollaboratoe) => c.userId !== userId);
  return this.save();
};

DocumentSchema.methods.updateUserActivity = function(userId: string){
    const collaborator = this.collaborators.find((c: ICollaboratoe) => c.userId === userId)
    if(collaborator){
      collaborator.lastActive = new Date();
      return this.save();
    }
}

DocumentSchema.methods.canUserEdit = function(userId: string): boolean {
  if(this.ownerId === userId) return true;
   const collaborator = this.collaborators.find((c: ICollaboratoe) => c.userId === userId);
  return collaborator && (collaborator.role === 'editor' || collaborator.role === 'owner');
}
DocumentSchema.methods.canUserView = function(userId: string): boolean {
  if (this.isPublic) return true;
  if (this.ownerId === userId) return true;
  
  const collaborator = this.collaborators.find((c: ICollaboratoe) => c.userId === userId);
  return !!collaborator;
};
DocumentSchema.methods.cleanOldData = function() {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  
  // Remove old cursors (older than 1 hour)
  this.cursors = this.cursors.filter((cursor: ICursor) => cursor.lastUpdated > oneHourAgo);
  
  // Keep only recent changes (last 24 hours or last 100 changes)
  this.recentChanges = this.recentChanges
    .filter((change: IDocumentChange) => change.timestamp > oneDayAgo)
    .slice(-100); // Keep last 100 changes
  
  return this.save();
};
export default mongoose.model<IDocument>('Document',DocumentSchema)