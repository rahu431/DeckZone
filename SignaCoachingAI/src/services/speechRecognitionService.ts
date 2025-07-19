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
  micSensitivity?: number; // Optional: microphone sensitivity (0-100)
}

export class SpeechRecognitionService {
  private static instance: SpeechRecognitionService;
  private recognition: any | null = null;
  private isListening: boolean = false;
  private currentLanguage: string = 'en-US';
  private timeoutId: NodeJS.Timeout | null = null;
  private silenceTimeoutId: NodeJS.Timeout | null = null;
  private readonly LISTENING_TIMEOUT = 30000; // 30 seconds timeout
  private readonly SILENCE_TIMEOUT = 3000; // 3 seconds of silence before stopping
  private lastTranscript: string = '';
  private silenceDetected: boolean = false;

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
    this.recognition.continuous = true; // Enable continuous listening
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

    // Clear any existing timeouts and reset state
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    if (this.silenceTimeoutId) {
      clearTimeout(this.silenceTimeoutId);
      this.silenceTimeoutId = null;
    }
    this.lastTranscript = '';
    this.silenceDetected = false;

    // Store callbacks for use in event handlers
    const resultCallback = onResult;
    const errorCallback = onError;

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
        
        // Set up timeout to automatically stop listening
        this.timeoutId = setTimeout(() => {
          console.log('Speech recognition timeout reached');
          this.stopListening();
          onError('Listening timeout - please try again');
        }, this.LISTENING_TIMEOUT);
        
        resolve();
      };

      this.recognition.onresult = (event: any) => {
        const result = event.results[event.results.length - 1];
        const transcript = result[0].transcript;
        const confidence = result[0].confidence;

        console.log('Speech recognition result:', { transcript, confidence, isFinal: result.isFinal });

        // Update last transcript for tracking
        this.lastTranscript = transcript;

        // Send result
        resultCallback({
          transcript,
          confidence,
          isFinal: result.isFinal,
        });

        // If it's a final result, start silence detection to wait for more speech
        if (result.isFinal && transcript.trim()) {
          console.log('Final result received, starting silence detection');
          this.silenceTimeoutId = setTimeout(() => {
            console.log('Silence timeout reached, stopping recognition');
            this.silenceDetected = true;
            this.stopListening();
          }, this.SILENCE_TIMEOUT);
        }
      };

      this.recognition.onerror = (event: any) => {
        this.isListening = false;
        
        // Clear timeouts on error
        if (this.timeoutId) {
          clearTimeout(this.timeoutId);
          this.timeoutId = null;
        }
        if (this.silenceTimeoutId) {
          clearTimeout(this.silenceTimeoutId);
          this.silenceTimeoutId = null;
        }
        
        console.error('Speech recognition error:', event.error);
        
        let errorMessage = `Speech recognition error: ${event.error}`;
        
        // Provide more helpful error messages
        switch (event.error) {
          case 'no-speech':
            // Don't treat no-speech as an error for continuous recognition
            console.log('No speech detected, continuing to listen...');
            return; // Don't call error callback
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
          case 'aborted':
            // Don't treat aborted as an error - user likely stopped intentionally
            console.log('Speech recognition aborted');
            return; // Don't call error callback
          default:
            errorMessage = `Speech recognition error: ${event.error}`;
        }
        
        errorCallback(errorMessage);
        reject(event.error);
      };

      this.recognition.onend = () => {
        console.log('Speech recognition ended naturally');
        
        // Only process if we haven't already detected silence
        if (this.isListening && !this.silenceDetected && this.lastTranscript.trim()) {
          console.log('Recognition ended with content, restarting...');
          // Try to restart recognition to maintain continuous listening
          try {
            this.recognition.start();
          } catch (error) {
            console.log('Could not restart recognition, ending session');
            this.isListening = false;
            
            // Send final result if we have content
            if (this.lastTranscript.trim()) {
              resultCallback({
                transcript: this.lastTranscript,
                confidence: 0.8,
                isFinal: true,
              });
            }
          }
        } else {
          this.isListening = false;
        }
        
        // Clear timeouts when recognition ends
        if (this.timeoutId) {
          clearTimeout(this.timeoutId);
          this.timeoutId = null;
        }
        if (this.silenceTimeoutId) {
          clearTimeout(this.silenceTimeoutId);
          this.silenceTimeoutId = null;
        }
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
    
    // Clear timeouts when manually stopping
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    if (this.silenceTimeoutId) {
      clearTimeout(this.silenceTimeoutId);
      this.silenceTimeoutId = null;
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
    // On mobile, most browsers only support English reliably
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      // On mobile, only English is reliably supported
      return language === 'en';
    }
    
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