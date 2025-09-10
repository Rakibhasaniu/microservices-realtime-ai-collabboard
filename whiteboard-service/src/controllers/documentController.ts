// src/controllers/documentController.ts
import { Request, Response } from 'express';
import { DocumentService } from '../services/documentService';
import { AuthenticatedRequest } from '../middleware/auth';

export class DocumentController {
  private documentService: DocumentService;

  constructor() {
    this.documentService = new DocumentService();
  }

  // POST /documents - Create new document
  createDocument = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { title, content, isPublic } = req.body;
      const userId = req.user?.userId;
      const userName = req.user?.userName;

      if (!userId || !userName) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      if (!title || title.trim().length === 0) {
        res.status(400).json({
          success: false,
          message: 'Document title is required'
        });
        return;
      }

      const result = await this.documentService.createDocument({
        title: title.trim(),
        content: content || '',
        ownerId: userId,
        ownerName: userName,
        isPublic: isPublic || false
      });

      if (result.success) {
        res.status(201).json(result);
      } else {
        res.status(400).json(result);
      }

    } catch (error) {
      console.error('Create document error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };

  // GET /documents/:id - Get document by ID
  getDocument = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      const result = await this.documentService.getDocument(id, userId);

      if (result.success) {
        res.status(200).json(result);
      } else {
        const statusCode = result.message === 'Document not found' ? 404 : 403;
        res.status(statusCode).json(result);
      }

    } catch (error) {
      console.error('Get document error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };

  // GET /documents - Get user's documents
  getUserDocuments = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      const result = await this.documentService.getUserDocuments(userId);

      res.status(200).json(result);

    } catch (error) {
      console.error('Get user documents error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };

  // PUT /documents/:id - Update document
  updateDocument = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { title, content, isPublic } = req.body;
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      const updates: any = {};
      if (title !== undefined) updates.title = title.trim();
      if (content !== undefined) updates.content = content;
      if (isPublic !== undefined) updates.isPublic = isPublic;

      const result = await this.documentService.updateDocument(id, userId, updates);

      if (result.success) {
        res.status(200).json(result);
      } else {
        const statusCode = result.message === 'Document not found' ? 404 : 
                          result.message.includes('permission') ? 403 : 400;
        res.status(statusCode).json(result);
      }

    } catch (error) {
      console.error('Update document error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };

  // DELETE /documents/:id - Delete document
  deleteDocument = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      const result = await this.documentService.deleteDocument(id, userId);

      if (result.success) {
        res.status(200).json(result);
      } else {
        const statusCode = result.message === 'Document not found' ? 404 : 403;
        res.status(statusCode).json(result);
      }

    } catch (error) {
      console.error('Delete document error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };

  // POST /documents/:id/collaborators - Add collaborator
  addCollaborator = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { userId: collaboratorId, userName, userEmail, role } = req.body;
      const ownerId = req.user?.userId;

      if (!ownerId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      if (!collaboratorId || !userName || !userEmail) {
        res.status(400).json({
          success: false,
          message: 'Collaborator userId, userName, and userEmail are required'
        });
        return;
      }

      const result = await this.documentService.addCollaborator(id, ownerId, {
        userId: collaboratorId,
        userName,
        userEmail,
        role: role || 'editor'
      });

      if (result.success) {
        res.status(200).json(result);
      } else {
        const statusCode = result.message === 'Document not found' ? 404 : 403;
        res.status(statusCode).json(result);
      }

    } catch (error) {
      console.error('Add collaborator error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };

  // Health check
  healthCheck = async (req: Request, res: Response): Promise<void> => {
    res.status(200).json({
      service: 'whiteboard-service',
      status: 'healthy',
      timestamp: new Date().toISOString(),
      features: [
        'Document CRUD',
        'Real-time collaboration',
        'Socket.io integration',
        'Redis pub/sub ready'
      ]
    });
  };
}