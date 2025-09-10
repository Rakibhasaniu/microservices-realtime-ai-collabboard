// src/routes/documentRoutes.ts
import { Router } from 'express';
import { DocumentController } from '../controllers/documentController';
import { authenticateToken } from '../middleware/auth';
import { validateCollaborator, validateDocument } from '../middleware/validation';

const router = Router();
const documentController = new DocumentController();

// Public routes
router.get('/health', documentController.healthCheck);

// Protected routes (require authentication)
router.use(authenticateToken); // Apply auth middleware to all routes below

// Document CRUD operations
router.post('/', validateDocument, documentController.createDocument);
router.get('/', documentController.getUserDocuments);
router.get('/:id', documentController.getDocument);
router.put('/:id', documentController.updateDocument);
router.delete('/:id', documentController.deleteDocument);

// Collaboration management
router.post('/:id/collaborators', validateCollaborator, documentController.addCollaborator);

export default router;