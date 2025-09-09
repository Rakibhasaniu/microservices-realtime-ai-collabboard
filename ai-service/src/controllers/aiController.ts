// src/controllers/aiController.ts
import type { Request, Response } from 'express';
import type { GenerateDiagramRequest, RewriteRequest, SummarizeRequest, TranslateRequest } from '../types/ai';
import { AIService } from '../services/aiService';

export class AIController {
  private aiService: AIService;

  constructor() {
    this.aiService = new AIService();
  }

  summarize = async (req: Request, res: Response) => {
    try {
      const request: SummarizeRequest = req.body;
      const result = await this.aiService.summarizeText(request);
      
      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  };

  rewrite = async (req: Request, res: Response) => {
    try {
      const request: RewriteRequest = req.body;
      const result = await this.aiService.rewriteText(request);
      
      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  };

  translate = async (req: Request, res: Response) => {
    try {
      const request: TranslateRequest = req.body;
      const result = await this.aiService.translateText(request);
      
      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  };

  generateDiagram = async (req: Request, res: Response) => {
    try {
      const request: GenerateDiagramRequest = req.body;
      const result = await this.aiService.generateDiagram(request);
      
      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  };

  health = async (req: Request, res: Response) => {
    res.json({
      service: 'ai-service',
      status: 'healthy',
      timestamp: new Date().toISOString(),
      features: ['summarize', 'rewrite', 'translate', 'diagrams']
    });
  };
}