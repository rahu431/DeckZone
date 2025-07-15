export interface User {
  id: string;
  email: string;
  displayName: string;
  nativeLanguage: string;
  communicationProfile: CommunicationProfile;
  createdAt: Date;
  lastLoginAt: Date;
}

export interface CommunicationProfile {
  type: 'gps' | 'barista' | 'dance';
  preferences: {
    formalityLevel: 'casual' | 'professional' | 'formal';
    responseSpeed: 'slow' | 'medium' | 'fast';
    detailLevel: 'brief' | 'moderate' | 'detailed';
  };
}

export interface SentenceCorrection {
  id: string;
  userId: string;
  originalText: string;
  correctedText: string;
  originalLanguage: string;
  corrections: CorrectionItem[];
  tone: ToneType;
  timestamp: Date;
  confidence: number;
  improvementSuggestions?: string[];
}

export interface CorrectionItem {
  type: 'grammar' | 'vocabulary' | 'tone' | 'structure';
  original: string;
  corrected: string;
  explanation: string;
  position: {
    start: number;
    end: number;
  };
}

export type ToneType = 'professional' | 'friendly' | 'direct' | 'casual';

export interface VoicePlayback {
  text: string;
  language: string;
  audioUrl?: string;
  isPlaying: boolean;
}

export interface ProgressData {
  userId: string;
  date: Date;
  correctionsCount: number;
  improvementScore: number;
  commonMistakes: string[];
  achievedGoals: string[];
}

export interface PracticeSession {
  id: string;
  userId: string;
  type: 'escalation' | 'daily-drill' | 'conversation';
  scenario: string;
  userResponse: string;
  feedback: string;
  score: number;
  timestamp: Date;
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: Date;
}