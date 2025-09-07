import Document, { IDocument, IDocumentChange } from '../models/Document';

// 📝 Input types for document operations
export interface CreateDocumentInput {
  title: string;
  ownerId: string;
  ownerName: string;
  content?: string;
  isPublic?: boolean;
}

export interface UpdateDocumentInput {
  title?: string;
  content?: string;
  isPublic?: boolean;
}

// 📤 Response types
export interface DocumentResponse {
  success: boolean;
  message: string;
  document?: IDocument;
  documents?: IDocument[];
}

export class DocumentService {
  
  // 📝 Create a new document
  async createDocument(data: CreateDocumentInput): Promise<DocumentResponse> {
    try {
      const document = new Document({
        title: data.title,
        content: data.content || '',
        ownerId: data.ownerId,
        ownerName: data.ownerName,
        isPublic: data.isPublic || false,
        collaborators: [{
          userId: data.ownerId,
          userName: data.ownerName,
          userEmail: '', // Will be filled from auth service
          role: 'owner',
          joinedAt: new Date(),
          lastActive: new Date()
        }],
        lastModified: new Date()
      });

      const savedDocument = await document.save();

      return {
        success: true,
        message: 'Document created successfully',
        document: savedDocument
      };

    } catch (error) {
      return {
        success: false,
        message: 'Failed to create document'
      };
    }
  }

  // 📖 Get document by ID
  async getDocument(documentId: string, userId: string): Promise<DocumentResponse> {
    try {
      const document = await Document.findById(documentId);

      if (!document) {
        return {
          success: false,
          message: 'Document not found'
        };
      }

      // Check if user can view this document
      if (!document.canUserView(userId)) {
        return {
          success: false,
          message: 'Access denied'
        };
      }

      // Update user activity
      await document.updateUserActivity(userId);

      return {
        success: true,
        message: 'Document retrieved successfully',
        document
      };

    } catch (error) {
      return {
        success: false,
        message: 'Failed to retrieve document'
      };
    }
  }

  // 📚 Get user's documents
  async getUserDocuments(userId: string): Promise<DocumentResponse> {
    try {
      // Find documents where user is owner or collaborator
      const documents = await Document.find({
        $or: [
          { ownerId: userId },
          { 'collaborators.userId': userId }
        ]
      })
      .sort({ lastModified: -1 }) // Most recently modified first
      .select('title ownerId ownerName lastModified createdAt isPublic collaborators activeUsers')
      .limit(50); // Limit to 50 documents

      return {
        success: true,
        message: 'Documents retrieved successfully',
        documents
      };

    } catch (error) {
      return {
        success: false,
        message: 'Failed to retrieve documents'
      };
    }
  }

  // ✏️ Update document content and metadata
  async updateDocument(documentId: string, userId: string, updates: UpdateDocumentInput): Promise<DocumentResponse> {
    try {
      const document = await Document.findById(documentId);

      if (!document) {
        return {
          success: false,
          message: 'Document not found'
        };
      }

      // Check if user can edit
      if (!document.canUserEdit(userId)) {
        return {
          success: false,
          message: 'You do not have permission to edit this document'
        };
      }

      // Update fields
      if (updates.title) document.title = updates.title;
      if (updates.content !== undefined) document.content = updates.content;
      if (updates.isPublic !== undefined) document.isPublic = updates.isPublic;

      document.lastModified = new Date();
      document.version += 1;

      const updatedDocument = await document.save();

      return {
        success: true,
        message: 'Document updated successfully',
        document: updatedDocument
      };

    } catch (error) {
      return {
        success: false,
        message: 'Failed to update document'
      };
    }
  }

  // 🗑️ Delete document
  async deleteDocument(documentId: string, userId: string): Promise<DocumentResponse> {
    try {
      const document = await Document.findById(documentId);

      if (!document) {
        return {
          success: false,
          message: 'Document not found'
        };
      }

      // Only owner can delete
      if (document.ownerId !== userId) {
        return {
          success: false,
          message: 'Only the owner can delete this document'
        };
      }

      await Document.findByIdAndDelete(documentId);

      return {
        success: true,
        message: 'Document deleted successfully'
      };

    } catch (error) {
      return {
        success: false,
        message: 'Failed to delete document'
      };
    }
  }

  // 👥 Add collaborator to document
  async addCollaborator(documentId: string, ownerId: string, collaboratorData: {
    userId: string;
    userName: string;
    userEmail: string;
    role?: string;
  }): Promise<DocumentResponse> {
    try {
      const document = await Document.findById(documentId);

      if (!document) {
        return {
          success: false,
          message: 'Document not found'
        };
      }

      // Only owner can add collaborators
      if (document.ownerId !== ownerId) {
        return {
          success: false,
          message: 'Only the owner can add collaborators'
        };
      }

      await document.addCollaborator(
        collaboratorData.userId,
        collaboratorData.userName,
        collaboratorData.userEmail,
        collaboratorData.role || 'editor'
      );

      return {
        success: true,
        message: 'Collaborator added successfully',
        document
      };

    } catch (error) {
      return {
        success: false,
        message: 'Failed to add collaborator'
      };
    }
  }

  // 🚪 Join/Leave document (for real-time presence)
  async joinDocument(documentId: string, userId: string): Promise<DocumentResponse> {
    try {
      const document = await Document.findById(documentId);

      if (!document) {
        return {
          success: false,
          message: 'Document not found'
        };
      }

      // Add user to active users if not already there
      if (!document.activeUsers.includes(userId)) {
        document.activeUsers.push(userId);
        await document.save();
      }

      return {
        success: true,
        message: 'Joined document successfully',
        document
      };

    } catch (error) {
      return {
        success: false,
        message: 'Failed to join document'
      };
    }
  }

  async leaveDocument(documentId: string, userId: string): Promise<DocumentResponse> {
    try {
      const document = await Document.findById(documentId);

      if (!document) {
        return {
          success: false,
          message: 'Document not found'
        };
      }

      // Remove user from active users and cursors
      document.activeUsers = document.activeUsers.filter(id => id !== userId);
      document.cursors = document.cursors.filter(cursor => cursor.userId !== userId);
      
      await document.save();

      return {
        success: true,
        message: 'Left document successfully'
      };

    } catch (error) {
      return {
        success: false,
        message: 'Failed to leave document'
      };
    }
  }
}