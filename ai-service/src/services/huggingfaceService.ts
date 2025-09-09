
import type { AxiosResponse } from "axios";
import { env } from "../config/env";
import axios from "axios";
import type { HuggingFaceResponse } from "../types/ai";

export class HuggingFaceService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = env.HUGGINGFACE_API_KEY;
    this.baseUrl = env.HUGGINGFACE_BASE_URL;
  }

  private async makeRequest(model: string, payload: any): Promise<HuggingFaceResponse> {
    try {
      const response: AxiosResponse = await axios.post(
        `${this.baseUrl}/${model}`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000, // 30 second timeout
        }
      );

      return response.data;
    } catch (error: any) {
      console.error(`HuggingFace API error for model ${model}:`, error.response?.data || error.message);
      throw new Error(`HuggingFace API request failed: ${error.response?.data?.error || error.message}`);
    }
  }

  async summarizeText(text: string, maxLength: number = 150): Promise<string> {
    const payload = {
      inputs: text,
      parameters: {
        max_length: maxLength,
        min_length: 30,
        do_sample: false
      }
    };

    const result = await this.makeRequest(env.MODELS.SUMMARIZE, payload);
    
    if (Array.isArray(result) && result[0]?.summary_text) {
      return result[0].summary_text;
    }
    
    throw new Error('Failed to get summary from HuggingFace');
  }

  async rewriteText(text: string, style: string = 'professional'): Promise<string> {
    const prompt = this.buildRewritePrompt(text, style);
    
    const payload = {
      inputs: prompt,
      parameters: {
        max_length: Math.min(text.length * 2, 500),
        temperature: 0.7,
        do_sample: true
      }
    };

    const result = await this.makeRequest(env.MODELS.REWRITE, payload);
    
    if (Array.isArray(result) && result[0]?.generated_text) {
      return this.extractRewrittenText(result[0].generated_text, prompt);
    }
    
    throw new Error('Failed to rewrite text');
  }

  async translateText(text: string, targetLang: string = 'fr'): Promise<string> {
    // Use appropriate translation model based on target language
    const model = this.getTranslationModel(targetLang);
    
    const payload = {
      inputs: text
    };

    const result = await this.makeRequest(model, payload);
    
    if (Array.isArray(result) && result[0]?.translation_text) {
      return result[0].translation_text;
    }
    
    throw new Error('Failed to translate text');
  }

  private buildRewritePrompt(text: string, style: string): string {
    const prompts = {
      formal: `Rewrite the following text in a formal, professional tone: "${text}"`,
      casual: `Rewrite the following text in a casual, friendly tone: "${text}"`,
      professional: `Rewrite the following text in a clear, professional manner: "${text}"`,
      creative: `Rewrite the following text in a creative, engaging way: "${text}"`
    };

    return prompts[style as keyof typeof prompts] || prompts.professional;
  }

  private extractRewrittenText(generated: string, prompt: string): string {
    // Remove the prompt from the generated text
    const cleanText = generated.replace(prompt, '').trim();
    
    // Remove quotes if they wrap the entire response
    if (cleanText.startsWith('"') && cleanText.endsWith('"')) {
      return cleanText.slice(1, -1);
    }
    
    return cleanText;
  }

  private getTranslationModel(targetLang: string): string {
    const models = {
      'fr': 'Helsinki-NLP/opus-mt-en-fr',
      'es': 'Helsinki-NLP/opus-mt-en-es', 
      'de': 'Helsinki-NLP/opus-mt-en-de',
      'bn': 'Helsinki-NLP/opus-mt-en-bn', // Bengali
      'hi': 'Helsinki-NLP/opus-mt-en-hi'  // Hindi
    };

    return models[targetLang as keyof typeof models] || models.fr;
  }
}