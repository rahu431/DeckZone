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
  "translatedMeaning": "Translation of the corrected English back to ${sourceLanguage} for cross-verification",
  "toneVariations": {
    "professional": {
      "text": "Formal, businesslike version suitable for client meetings and official communications",
      "explanation": "Why this tone is appropriate for professional settings",
      "translation": "Translation of the professional version back to ${sourceLanguage}"
    },
    "friendly": {
      "text": "Warm, approachable version suitable for team collaboration and casual interactions",
      "explanation": "Why this tone works well for friendly communication",
      "translation": "Translation of the friendly version back to ${sourceLanguage}"
    },
    "direct": {
      "text": "Clear, concise version suitable for urgent communications and quick responses",
      "explanation": "Why this tone is effective for direct communication",
      "translation": "Translation of the direct version back to ${sourceLanguage}"
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
7. IMPORTANT: For translatedMeaning, translate the professional tone suggestion back to the original language (${sourceLanguage}) so the user can verify the meaning is correct
8. IMPORTANT: For each tone variation, provide a translation field that translates the English suggestion back to ${sourceLanguage} so users can understand what each tone means in their native language

EXAMPLES:

Input: "can you help me with this problem"
Professional: "Could you please assist me with this issue?"
Friendly: "Hey, would you mind helping me out with this?"
Direct: "Need help with this problem."

Input: "server lo problem undi" (Telugu)
Professional: "We are experiencing a server issue that requires immediate attention."
Translation: "మేము సర్వర్ సమస్యను ఎదుర్కొంటున్నాము, దీనికి తక్షణ దృష్టి అవసరం."
Friendly: "There seems to be a problem with our server that we need to look into."
Translation: "మా సర్వర్‌లో ఏదో సమస్య ఉన్నట్లు అనిపిస్తుంది, దానిని చూసుకోవాలి."
Direct: "Server problem needs fixing."
Translation: "సర్వర్ సమస్యను పరిష్కరించాలి."

Input: "எப்படி கேட்கலாம், meeting schedule" (Tamil)
Professional: "Could you please provide information about the meeting schedule?"
Translation: "மீட்டிங் அட்டவணை பற்றிய தகவலை தயவுசெய்து வழங்க முடியுமா?"
Friendly: "Hey, could you let me know about the meeting schedule?"
Translation: "ஏய், மீட்டிங் அட்டவணை பற்றி சொல்ல முடியுமா?"
Direct: "Meeting schedule?"
Translation: "மீட்டிங் அட்டவணை?"

IMPORTANT: 
- Always provide all three tone variations
- Ensure each tone is distinct and appropriate for its context
- Focus on clarity and professional communication
- Provide helpful explanations for each tone choice

Respond ONLY with the JSON object.`;
  }
}