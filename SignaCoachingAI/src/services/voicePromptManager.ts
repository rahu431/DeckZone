// ToneType removed since it's not used in this file

export class VoicePromptManager {
  private static instance: VoicePromptManager;

  static getInstance(): VoicePromptManager {
    if (!VoicePromptManager.instance) {
      VoicePromptManager.instance = new VoicePromptManager();
    }
    return VoicePromptManager.instance;
  }

  private getLanguageName(languageCode: string): string {
    const languageMap: { [key: string]: string } = {
      'en': 'English',
      'te': 'Telugu',
      'ta': 'Tamil',
      'hi': 'Hindi',
      'es': 'Spanish',
      'fr': 'French',
      'de': 'German',
      'it': 'Italian',
      'pt': 'Portuguese',
      'ja': 'Japanese',
      'ko': 'Korean',
      'zh': 'Chinese',
      'ar': 'Arabic',
    };
    return languageMap[languageCode] || 'English';
  }

  getVoiceCorrectionPrompt(text: string, originalLanguage: string): string {
    const sourceLanguage = this.getLanguageName(originalLanguage);

    return `You are an AI English communication coach helping technical professionals improve their English communication skills.

INPUT TEXT: "${text}"
SOURCE LANGUAGE: ${sourceLanguage}

Your task is to provide the same message in three different tones suitable for professional communication. Always maintain the core meaning while adapting the tone.

Provide your response in this EXACT JSON format:

{
  "originalText": "${text}",
  "sourceLanguage": "${sourceLanguage}",
  "toneVariations": {
    "professional": {
      "text": "Formal, businesslike version suitable for client meetings and official communications",
      "explanation": "Why this tone is appropriate for professional settings"
    },
    "friendly": {
      "text": "Warm, approachable version suitable for team collaboration and casual interactions",
      "explanation": "Why this tone works well for friendly communication"
    },
    "direct": {
      "text": "Clear, concise version suitable for urgent communications and quick responses",
      "explanation": "Why this tone is effective for direct communication"
    }
  },
  "confidence": 0.95,
  "generalExplanation": "Brief explanation of the overall improvements made"
}

GUIDELINES:
1. If input is not in English, translate it to English while preserving the intended meaning
2. All three versions should be grammatically correct and contextually appropriate
3. Maintain the same core message across all tones
4. Focus on practical improvements for technical professionals
5. Consider scenarios like client calls, team meetings, and urgent communications
6. Be supportive and encouraging in explanations

EXAMPLES:

Input: "can you help me with this problem"
Professional: "Could you please assist me with this issue?"
Friendly: "Hey, would you mind helping me out with this?"
Direct: "Need help with this problem."

Input: "server lo problem undi" (Telugu)
Professional: "We are experiencing a server issue that requires immediate attention."
Friendly: "There seems to be a problem with our server that we need to look into."
Direct: "Server problem needs fixing."

Input: "எப்படி கேட்கலாம், meeting schedule" (Tamil)
Professional: "Could you please provide information about the meeting schedule?"
Friendly: "Hey, could you let me know about the meeting schedule?"
Direct: "Meeting schedule?"

IMPORTANT: 
- Always provide all three tone variations
- Ensure each tone is distinct and appropriate for its context
- Focus on clarity and professional communication
- Provide helpful explanations for each tone choice

Respond ONLY with the JSON object.`;
  }
}