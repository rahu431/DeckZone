import { GoogleGenerativeAI } from '@google/generative-ai';
import { SentenceCorrection, CorrectionItem, ToneType } from '@/types';
import { PromptManager } from './promptManager';

export class GeminiService {
  private static instance: GeminiService;
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;
  
  get modelInstance() {
    return this.model;
  }
  private promptManager: PromptManager;

  constructor() {
    this.promptManager = PromptManager.getInstance();
    this.initializeGemini();
  }

  static getInstance(): GeminiService {
    if (!GeminiService.instance) {
      GeminiService.instance = new GeminiService();
    }
    return GeminiService.instance;
  }

  private initializeGemini(): void {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    
    console.log('Gemini API Key check:', apiKey ? 'Found' : 'Not found');
    
    if (!apiKey) {
      console.warn('Gemini API key not found. Please set VITE_GEMINI_API_KEY in your .env file');
      return;
    }

    try {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      console.log('Gemini AI initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Gemini AI:', error);
    }
  }

  isConfigured(): boolean {
    return this.genAI !== null && this.model !== null;
  }

  async correctSentence(
    text: string,
    originalLanguage: string,
    targetTone: ToneType,
    userId: string
  ): Promise<SentenceCorrection> {
    console.log('Gemini correctSentence called with:', { text, originalLanguage, targetTone });
    
    if (!this.isConfigured()) {
      console.error('Gemini AI not configured. API key:', import.meta.env.VITE_GEMINI_API_KEY ? 'Present' : 'Missing');
      throw new Error('Gemini AI not configured. Please set VITE_GEMINI_API_KEY in your .env file');
    }

    const prompt = this.promptManager.getCorrectionPrompt(text, originalLanguage, targetTone);
    console.log('Generated prompt:', prompt);

    try {
      console.log('Calling Gemini API...');
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text();
      
      console.log('Gemini API response:', responseText);

      return this.parseGeminiResponse(responseText, text, originalLanguage, targetTone, userId);
    } catch (error) {
      console.error('Gemini API error:', error);
      throw new Error(`Failed to get correction from Gemini: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }


  private parseGeminiResponse(
    responseText: string,
    originalText: string,
    originalLanguage: string,
    targetTone: ToneType,
    userId: string
  ): SentenceCorrection {
    try {
      // Clean the response to extract JSON
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const jsonResponse = JSON.parse(jsonMatch[0]);

      const corrections: CorrectionItem[] = (jsonResponse.corrections || []).map((correction: any) => ({
        type: correction.type || 'grammar',
        original: correction.original || '',
        corrected: correction.corrected || '',
        explanation: correction.explanation || '',
        position: correction.position || { start: 0, end: 0 }
      }));

      return {
        id: Date.now().toString(),
        userId,
        originalText,
        correctedText: jsonResponse.correctedText || originalText,
        originalLanguage,
        corrections,
        tone: targetTone,
        timestamp: new Date(),
        confidence: jsonResponse.confidence || 0.8,
        improvementSuggestions: jsonResponse.improvementSuggestions || []
      };
    } catch (error) {
      console.error('Failed to parse Gemini response:', error);
      
      // Fallback: create a basic correction
      return {
        id: Date.now().toString(),
        userId,
        originalText,
        correctedText: originalText,
        originalLanguage,
        corrections: [{
          type: 'grammar',
          original: originalText,
          corrected: originalText,
          explanation: 'Unable to process correction at this time. Please try again.',
          position: { start: 0, end: originalText.length }
        }],
        tone: targetTone,
        timestamp: new Date(),
        confidence: 0.5,
        improvementSuggestions: []
      };
    }
  }

  async getSuggestions(text: string, context?: string): Promise<string[]> {
    if (!this.isConfigured()) {
      throw new Error('Gemini AI not configured');
    }

    const prompt = this.promptManager.getSuggestionsPrompt(text, context);

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text();

      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return ['Unable to generate suggestions at this time.'];
      }

      const jsonResponse = JSON.parse(jsonMatch[0]);
      return jsonResponse.suggestions || [];
    } catch (error) {
      console.error('Failed to get suggestions from Gemini:', error);
      return ['Unable to generate suggestions at this time.'];
    }
  }
}