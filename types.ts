
export interface Language {
  code: string;
  name: string;
}

export enum SessionStatus {
  DISCONNECTED = 'DISCONNECTED',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  PAUSED = 'PAUSED',
  ERROR = 'ERROR',
}

export interface TranscriptionEntry {
  speaker: 'user' | 'model';
  text: string;
}

export interface AIConfig {
  emotionalTone: 'warm' | 'professional' | 'casual' | 'energetic';
  culturalContext: 'formal' | 'informal' | 'respectful' | 'friendly';
  translationStyle: 'literal' | 'contextual' | 'cultural' | 'creative';
  voicePersonality: 'gentle' | 'confident' | 'caring' | 'authoritative';
}

export interface EmotionAnalysis {
  emotion: string;
  intensity: number;
  markers: string[];
}

export interface TranslationResult {
  text: string;
  confidence: number;
  source: string;
  emotion?: EmotionAnalysis;
}