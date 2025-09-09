// src/middleware/validation.ts
import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

export const validateSummarizeRequest = (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    text: Joi.string().required().min(10).max(5000),
    maxLength: Joi.number().optional().min(50).max(500)
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message
    });
  }
  next();
};

export const validateRewriteRequest = (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    text: Joi.string().required().min(1).max(2000),
    style: Joi.string().valid('formal', 'casual', 'professional', 'creative').optional()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message
    });
  }
  next();
};

export const validateTranslateRequest = (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    text: Joi.string().required().min(1).max(1000),
    targetLanguage: Joi.string().required().valid('fr', 'es', 'de', 'bn', 'hi'),
    sourceLanguage: Joi.string().optional().default('en')
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message
    });
  }
  next();
};

export const validateDiagramRequest = (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    description: Joi.string().required().min(5).max(500),
    type: Joi.string().valid('flowchart', 'sequence', 'class', 'gantt').optional()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message
    });
  }
  next();
};