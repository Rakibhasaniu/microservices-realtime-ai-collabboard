// src/config/env.ts
import dotenv from 'dotenv';

dotenv.config();

export const env = {
  PORT: parseInt(process.env.PORT || '3003'),
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // HuggingFace Configuration
  HUGGINGFACE_API_KEY: process.env.HUGGINGFACE_API_KEY || '',
  HUGGINGFACE_BASE_URL: process.env.HUGGINGFACE_BASE_URL || 'https://api-inference.huggingface.co/models',
  
  // Service Configuration
  SERVICE_NAME: process.env.SERVICE_NAME || 'ai-service',
  SERVICE_VERSION: process.env.SERVICE_VERSION || '1.0.0',
  
  // Rate Limiting
  MAX_REQUESTS_PER_MINUTE: parseInt(process.env.MAX_REQUESTS_PER_MINUTE || '60'),
  MAX_TEXT_LENGTH: parseInt(process.env.MAX_TEXT_LENGTH || '10000'),
  
  // Models
  MODELS: {
    SUMMARIZE: 'facebook/bart-large-cnn',
    TRANSLATE: 'Helsinki-NLP/opus-mt-en-fr', // Default to English-French
    REWRITE: 'google/flan-t5-base',
    TEXT_GENERATION: 'gpt2'
  }
};