// src/middleware/validation.ts
import { Request, Response, NextFunction } from 'express';

// Validate document creation/update
export const validateDocument = (req: Request, res: Response, next: NextFunction): void => {
  const { title, content, isPublic } = req.body;

  // Title validation
  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    res.status(400).json({
      success: false,
      message: 'Document title is required and must be a non-empty string'
    });
    return;
  }

  if (title.trim().length > 200) {
    res.status(400).json({
      success: false,
      message: 'Document title cannot exceed 200 characters'
    });
    return;
  }

  // Content validation (optional)
  if (content !== undefined && typeof content !== 'string') {
    res.status(400).json({
      success: false,
      message: 'Document content must be a string'
    });
    return;
  }

  if (content && content.length > 1000000) {
    res.status(400).json({
      success: false,
      message: 'Document content is too large (max 1MB)'
    });
    return;
  }

  // isPublic validation (optional)
  if (isPublic !== undefined && typeof isPublic !== 'boolean') {
    res.status(400).json({
      success: false,
      message: 'isPublic must be a boolean value'
    });
    return;
  }

  next();
};

// Validate collaborator addition
export const validateCollaborator = (req: Request, res: Response, next: NextFunction): void => {
  const { userId, userName, userEmail, role } = req.body;

  // Required fields
  if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
    res.status(400).json({
      success: false,
      message: 'Collaborator userId is required'
    });
    return;
  }

  if (!userName || typeof userName !== 'string' || userName.trim().length === 0) {
    res.status(400).json({
      success: false,
      message: 'Collaborator userName is required'
    });
    return;
  }

  if (!userEmail || typeof userEmail !== 'string' || userEmail.trim().length === 0) {
    res.status(400).json({
      success: false,
      message: 'Collaborator userEmail is required'
    });
    return;
  }

  // Email format validation (basic)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(userEmail)) {
    res.status(400).json({
      success: false,
      message: 'Invalid email format'
    });
    return;
  }

  // Role validation (optional)
  if (role !== undefined) {
    const validRoles = ['owner', 'editor', 'viewer'];
    if (!validRoles.includes(role)) {
      res.status(400).json({
        success: false,
        message: 'Invalid role. Must be one of: owner, editor, viewer'
      });
      return;
    }
  }

  next();
};

// Validate MongoDB ObjectId format
export const validateObjectId = (req: Request, res: Response, next: NextFunction): void => {
  const { id } = req.params;

  if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
    res.status(400).json({
      success: false,
      message: 'Invalid document ID format'
    });
    return;
  }

  next();
};