// src/routes/aiRoutes.ts
import { Router } from 'express';
import { validateDiagramRequest, validateRewriteRequest, validateSummarizeRequest, validateTranslateRequest } from '../middleware/validation';
import { AIController } from '../controllers/aiController';


const router = Router();
const aiController = new AIController();

// AI processing routes with validation
router.post('/summarize', validateSummarizeRequest, aiController.summarize);
router.post('/rewrite', validateRewriteRequest, aiController.rewrite);
router.post('/translate', validateTranslateRequest, aiController.translate);
router.post('/diagram', validateDiagramRequest, aiController.generateDiagram);

// Service health
router.get('/health', aiController.health);

export { router as aiRoutes };