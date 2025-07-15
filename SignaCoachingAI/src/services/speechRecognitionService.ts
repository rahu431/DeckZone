export interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
}

export interface SpeechRecognitionConfig {
  language: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
}

export class SpeechRecognitionService {
  private static instance: SpeechRecognitionService;
  private recognition: any | null = null;
  private isListening: boolean = false;
  private currentLanguage: string = 'en-US';

  constructor() {
    this.initializeRecognition();
  }

  static getInstance(): SpeechRecognitionService {
    if (!SpeechRecognitionService.instance) {
      SpeechRecognitionService.instance = new SpeechRecognitionService();
    }
    return SpeechRecognitionService.instance;
  }

  private initializeRecognition(): void {
    // Check for browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.warn('Speech recognition not supported in this browser');
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = false;
    this.recognition.interimResults = true;
    this.recognition.lang = this.currentLanguage;
    this.recognition.maxAlternatives = 1;
  }

  isSupported(): boolean {
    return this.recognition !== null;
  }

  async startListening(
    onResult: (result: SpeechRecognitionResult) => void,
    onError: (error: string) => void,
    config?: Partial<SpeechRecognitionConfig>
  ): Promise<void> {
    if (!this.recognition) {
      onError('Speech recognition not supported');
      return;
    }

    if (this.isListening) {
      this.stopListening();
    }

    // Apply configuration
    if (config) {
      if (config.language) {
        console.log('Setting speech recognition language to:', config.language);
        this.recognition.lang = config.language;
        this.currentLanguage = config.language;
      }
      if (config.continuous !== undefined) {
        this.recognition.continuous = config.continuous;
      }
      if (config.interimResults !== undefined) {
        this.recognition.interimResults = config.interimResults;
      }
      if (config.maxAlternatives !== undefined) {
        this.recognition.maxAlternatives = config.maxAlternatives;
      }
    }

    return new Promise((resolve, reject) => {
      if (!this.recognition) {
        reject('Speech recognition not available');
        return;
      }

      this.recognition.onstart = () => {
        this.isListening = true;
        console.log('Speech recognition started for language:', this.currentLanguage);
        resolve();
      };

      this.recognition.onresult = (event: any) => {
        const result = event.results[event.results.length - 1];
        const transcript = result[0].transcript;
        const confidence = result[0].confidence;

        console.log('Speech recognition result:', { transcript, confidence, isFinal: result.isFinal });

        onResult({
          transcript,
          confidence,
          isFinal: result.isFinal,
        });
      };

      this.recognition.onerror = (event: any) => {
        this.isListening = false;
        console.error('Speech recognition error:', event.error);
        
        let errorMessage = `Speech recognition error: ${event.error}`;
        
        // Provide more helpful error messages
        switch (event.error) {
          case 'no-speech':
            errorMessage = 'No speech detected. Please try again.';
            break;
          case 'audio-capture':
            errorMessage = 'Microphone not available. Please check your microphone.';
            break;
          case 'not-allowed':
            errorMessage = 'Microphone access denied. Please allow microphone access.';
            break;
          case 'network':
            errorMessage = 'Network error. Please check your internet connection.';
            break;
          case 'language-not-supported':
            errorMessage = `Language ${this.currentLanguage} not supported. Try switching to English.`;
            break;
          default:
            errorMessage = `Speech recognition error: ${event.error}`;
        }
        
        onError(errorMessage);
        reject(event.error);
      };

      this.recognition.onend = () => {
        this.isListening = false;
        console.log('Speech recognition ended');
      };

      try {
        this.recognition.start();
      } catch (error) {
        this.isListening = false;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Failed to start speech recognition:', errorMessage);
        onError(`Failed to start speech recognition: ${errorMessage}`);
        reject(error);
      }
    });
  }

  stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  isCurrentlyListening(): boolean {
    return this.isListening;
  }

  setLanguage(language: string): void {
    this.currentLanguage = language;
    if (this.recognition) {
      this.recognition.lang = language;
    }
  }

  getLanguage(): string {
    return this.currentLanguage;
  }

  // Helper method to get language code from our app's language selection
  static getLanguageCode(language: string): string {
    const languageMap: { [key: string]: string } = {
      'en': 'en-US',
      'te': 'te-IN',      // Telugu (India)
      'ta': 'ta-IN',      // Tamil (India)
      'hi': 'hi-IN',      // Hindi (India)
      'es': 'es-ES',      // Spanish (Spain)
      'fr': 'fr-FR',      // French (France)
      'de': 'de-DE',      // German (Germany)
      'it': 'it-IT',      // Italian (Italy)
      'pt': 'pt-BR',      // Portuguese (Brazil)
      'ja': 'ja-JP',      // Japanese (Japan)
      'ko': 'ko-KR',      // Korean (South Korea)
      'zh': 'zh-CN',      // Chinese (China)
      'ar': 'ar-SA',      // Arabic (Saudi Arabia)
    };

    console.log('Getting language code for:', language, '->', languageMap[language] || 'en-US');
    return languageMap[language] || 'en-US';
  }

  // Get multi-language configuration for auto-detection
  static getMultiLanguageConfig(): string {
    // For auto-detection, we start with English but the system can adapt
    return 'en-US';
  }

  // Check if a language is supported for speech recognition
  static isLanguageSupported(language: string): boolean {
    const supportedLanguages = [
      'en-US', 'te-IN', 'ta-IN', 'hi-IN', 'es-ES', 'fr-FR', 
      'de-DE', 'it-IT', 'pt-BR', 'ja-JP', 'ko-KR', 'zh-CN', 'ar-SA'
    ];
    
    const languageCode = this.getLanguageCode(language);
    return supportedLanguages.includes(languageCode);
  }
}

// Extend the Window interface to include speech recognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
  
  interface SpeechRecognitionEvent extends Event {
    results: SpeechRecognitionResultList;
  }
  
  interface SpeechRecognitionErrorEvent extends Event {
    error: string;
  }
  
  interface SpeechRecognitionResultList {
    readonly length: number;
    item(index: number): SpeechRecognitionResult;
    [index: number]: SpeechRecognitionResult;
  }
  
  interface SpeechRecognitionResult {
    readonly isFinal: boolean;
    readonly length: number;
    item(index: number): SpeechRecognitionAlternative;
    [index: number]: SpeechRecognitionAlternative;
  }
  
  interface SpeechRecognitionAlternative {
    readonly transcript: string;
    readonly confidence: number;
  }
}