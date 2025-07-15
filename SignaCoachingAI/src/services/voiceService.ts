import { VoicePlayback } from '@/types';

export class VoiceService {
  private static instance: VoiceService;
  private synthesis: SpeechSynthesis;
  // currentUtterance removed since it's not used

  constructor() {
    this.synthesis = window.speechSynthesis;
  }

  static getInstance(): VoiceService {
    if (!VoiceService.instance) {
      VoiceService.instance = new VoiceService();
    }
    return VoiceService.instance;
  }

  async speak(text: string, language: string = 'en-US'): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.synthesis) {
        reject(new Error('Speech synthesis not supported'));
        return;
      }

      // Stop any current speech
      this.stop();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language;
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;

      utterance.onend = () => {
        resolve();
      };

      utterance.onerror = (event) => {
        reject(new Error(`Speech synthesis error: ${event.error}`));
      };
      this.synthesis.speak(utterance);
    });
  }

  stop(): void {
    if (this.synthesis && this.synthesis.speaking) {
      this.synthesis.cancel();
    }
  }

  pause(): void {
    if (this.synthesis && this.synthesis.speaking) {
      this.synthesis.pause();
    }
  }

  resume(): void {
    if (this.synthesis && this.synthesis.paused) {
      this.synthesis.resume();
    }
  }

  isPlaying(): boolean {
    return this.synthesis ? this.synthesis.speaking : false;
  }

  getAvailableVoices(): SpeechSynthesisVoice[] {
    return this.synthesis ? this.synthesis.getVoices() : [];
  }

  async getVoiceForLanguage(language: string): Promise<SpeechSynthesisVoice | null> {
    const voices = this.getAvailableVoices();
    return voices.find(voice => voice.lang.startsWith(language.split('-')[0])) || null;
  }

  async createVoicePlayback(text: string, language: string): Promise<VoicePlayback> {
    return {
      text,
      language,
      isPlaying: false,
    };
  }
}