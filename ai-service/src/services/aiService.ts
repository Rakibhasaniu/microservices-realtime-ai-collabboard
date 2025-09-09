// src/services/aiService.ts

import type { AIResponse, GenerateDiagramRequest, RewriteRequest, SummarizeRequest, TranslateRequest } from "../types/ai";
import { DiagramService } from "./diagramService";
import { HuggingFaceService } from "./huggingfaceService";

export class AIService {
  private huggingFace: HuggingFaceService;
  private diagramService: DiagramService;

  constructor() {
    this.huggingFace = new HuggingFaceService();
    this.diagramService = new DiagramService();
  }

  async summarizeText(request: SummarizeRequest): Promise<AIResponse<string>> {
    const startTime = Date.now();
    
    try {
      if (!request.text || request.text.trim().length === 0) {
        return { success: false, error: 'Text is required' };
      }

      if (request.text.length > 5000) {
        return { success: false, error: 'Text too long. Maximum 5000 characters.' };
      }

      const summary = await this.huggingFace.summarizeText(
        request.text, 
        request.maxLength || 150
      );

      return {
        success: true,
        data: summary,
        processingTime: Date.now() - startTime,
        model: 'facebook/bart-large-cnn'
      };

    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        processingTime: Date.now() - startTime
      };
    }
  }

  async rewriteText(request: RewriteRequest): Promise<AIResponse<string>> {
    const startTime = Date.now();
    
    try {
      if (!request.text || request.text.trim().length === 0) {
        return { success: false, error: 'Text is required' };
      }

      const rewritten = await this.huggingFace.rewriteText(
        request.text,
        request.style || 'professional'
      );

      return {
        success: true,
        data: rewritten,
        processingTime: Date.now() - startTime,
        model: 'google/flan-t5-base'
      };

    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        processingTime: Date.now() - startTime
      };
    }
  }

  async translateText(request: TranslateRequest): Promise<AIResponse<string>> {
    const startTime = Date.now();
    
    try {
      if (!request.text || request.text.trim().length === 0) {
        return { success: false, error: 'Text is required' };
      }

      const translated = await this.huggingFace.translateText(
        request.text,
        request.targetLanguage || 'fr'
      );

      return {
        success: true,
        data: translated,
        processingTime: Date.now() - startTime,
        model: `Helsinki-NLP/opus-mt-en-${request.targetLanguage}`
      };

    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        processingTime: Date.now() - startTime
      };
    }
  }

  async generateDiagram(request: GenerateDiagramRequest): Promise<AIResponse<string>> {
    const startTime = Date.now();
    
    try {
      if (!request.description || request.description.trim().length === 0) {
        return { success: false, error: 'Description is required' };
      }

      const mermaidCode = await this.diagramService.generateMermaidDiagram(
        request.description,
        request.type || 'flowchart'
      );

      return {
        success: true,
        data: mermaidCode,
        processingTime: Date.now() - startTime,
        model: 'mermaid-generator'
      };

    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        processingTime: Date.now() - startTime
      };
    }
  }
}

