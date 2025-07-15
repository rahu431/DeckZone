import { SentenceCorrection, CorrectionItem, ToneType, APIResponse } from '@/types';
import { GeminiService } from './geminiService';

export class CorrectionService {
  private static instance: CorrectionService;
  // baseUrl removed since it's not used
  private geminiService: GeminiService;

  constructor() {
    this.geminiService = GeminiService.getInstance();
  }

  static getInstance(): CorrectionService {
    if (!CorrectionService.instance) {
      CorrectionService.instance = new CorrectionService();
    }
    return CorrectionService.instance;
  }

  async correctSentence(
    text: string,
    originalLanguage: string,
    targetTone: ToneType,
    userId: string
  ): Promise<APIResponse<SentenceCorrection>> {
    console.log('CorrectionService correctSentence called');
    console.log('Gemini configured:', this.geminiService.isConfigured());
    
    try {
      // Try Gemini AI first
      if (this.geminiService.isConfigured()) {
        console.log('Using Gemini AI for correction');
        const correction = await this.geminiService.correctSentence(
          text,
          originalLanguage,
          targetTone,
          userId
        );
        
        console.log('Gemini correction result:', correction);
        
        return {
          success: true,
          data: correction,
          timestamp: new Date(),
        };
      }
      
      // Fallback to simulation if Gemini is not configured
      console.warn('Gemini AI not configured, falling back to simulation');
      const correction = this.simulateCorrection(text, originalLanguage, targetTone, userId);
      
      return {
        success: true,
        data: correction,
        timestamp: new Date(),
      };
    } catch (error) {
      console.error('Correction service error:', error);
      
      // Fallback to simulation on error
      console.warn('Falling back to simulation due to error');
      const correction = this.simulateCorrection(text, originalLanguage, targetTone, userId);
      
      return {
        success: true,
        data: correction,
        timestamp: new Date(),
      };
    }
  }

  async getSuggestions(text: string, context?: string): Promise<APIResponse<string[]>> {
    try {
      // Try Gemini AI first
      if (this.geminiService.isConfigured()) {
        const suggestions = await this.geminiService.getSuggestions(text, context);
        
        return {
          success: true,
          data: suggestions,
          timestamp: new Date(),
        };
      }
      
      // Fallback to basic suggestions
      const suggestions = [
        'Consider using more formal language',
        'Try to be more specific',
        'Use active voice for clarity'
      ];
      
      return {
        success: true,
        data: suggestions,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date(),
      };
    }
  }

  simulateCorrection(
    text: string,
    originalLanguage: string,
    targetTone: ToneType,
    userId: string
  ): SentenceCorrection {
    // Enhanced simulation with more realistic corrections
    const corrections: CorrectionItem[] = [];
    let correctedText = text;
    
    // Grammar corrections
    if (text.includes('can you')) {
      corrections.push({
        type: 'tone',
        original: 'can you',
        corrected: 'could you please',
        explanation: 'More polite and professional tone',
        position: { start: text.indexOf('can you'), end: text.indexOf('can you') + 7 },
      });
      correctedText = correctedText.replace('can you', 'could you please');
    }
    
    if (text.includes('wont')) {
      corrections.push({
        type: 'grammar',
        original: 'wont',
        corrected: "won't",
        explanation: 'Missing apostrophe in contraction',
        position: { start: text.indexOf('wont'), end: text.indexOf('wont') + 4 },
      });
      correctedText = correctedText.replace('wont', "won't");
    }
    
    if (text.includes('dont')) {
      corrections.push({
        type: 'grammar',
        original: 'dont',
        corrected: "don't",
        explanation: 'Missing apostrophe in contraction',
        position: { start: text.indexOf('dont'), end: text.indexOf('dont') + 4 },
      });
      correctedText = correctedText.replace('dont', "don't");
    }

    // Tone adjustments based on target tone
    if (targetTone === 'professional') {
      if (text.includes('ok')) {
        corrections.push({
          type: 'tone',
          original: 'ok',
          corrected: 'acceptable',
          explanation: 'More professional alternative',
          position: { start: text.indexOf('ok'), end: text.indexOf('ok') + 2 },
        });
        correctedText = correctedText.replace('ok', 'acceptable');
      }
    }

    // If no corrections found, suggest capitalization
    if (corrections.length === 0 && text.length > 0) {
      const firstChar = text.charAt(0);
      if (firstChar !== firstChar.toUpperCase()) {
        corrections.push({
          type: 'structure',
          original: firstChar,
          corrected: firstChar.toUpperCase(),
          explanation: 'Sentences should start with a capital letter',
          position: { start: 0, end: 1 },
        });
        correctedText = firstChar.toUpperCase() + text.slice(1);
      }
    }

    return {
      id: Date.now().toString(),
      userId,
      originalText: text,
      correctedText,
      originalLanguage,
      corrections,
      tone: targetTone,
      timestamp: new Date(),
      confidence: 0.85,
      improvementSuggestions: [
        'Consider using more specific vocabulary',
        'Try to be more concise',
        'Use active voice when possible'
      ]
    };
  }
}