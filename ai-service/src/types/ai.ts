export interface SummarizeRequest{
  text: string;
  maxLength: number;
  model?: string;
}

export interface RewriteRequest {
  text: string;
  style?: 'formal' | 'casual' | 'professional' |'creative';
  model?: string;
}

export interface TranslateRequest {
  text: string;
  targetLanguage: string;
  sourceLanguage?: string;
}

export interface GenerateDiagramRequest {
  description: string;
  type?: 'flowchart' | 'sequence' | 'class' | 'gantt';
}

export interface AIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  processingTime?: number;
  model?: string;
}
export interface HuggingFaceResponse {
  generated_text?: string;
  summary_text?: string;
  translation_text?: string;
  error?: string;
}