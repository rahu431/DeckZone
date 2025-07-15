import { ToneType } from '@/types';

export interface PromptTemplate {
  template: string;
  variables: string[];
}

export class PromptManager {
  private static instance: PromptManager;

  static getInstance(): PromptManager {
    if (!PromptManager.instance) {
      PromptManager.instance = new PromptManager();
    }
    return PromptManager.instance;
  }

  private getToneDescription(tone: ToneType): string {
    const descriptions = {
      'professional': 'formal, businesslike, suitable for client meetings and official communications',
      'friendly': 'warm, approachable, suitable for team collaboration and casual interactions',
      'direct': 'clear, concise, straight to the point, suitable for urgent communications',
      'casual': 'relaxed, informal, suitable for everyday conversations'
    };
    return descriptions[tone];
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

  getCorrectionPrompt(text: string, originalLanguage: string, targetTone: ToneType): string {
    const sourceLanguage = this.getLanguageName(originalLanguage);
    const toneDescription = this.getToneDescription(targetTone);

    return `You are an AI English communication coach helping technical professionals improve their English communication skills.

INPUT TEXT: "${text}"
SOURCE LANGUAGE: ${sourceLanguage}
TARGET TONE: ${targetTone} (${toneDescription})

Task:
1. If the input contains partial non-English phrases (e.g., Tamil or Telugu), identify only the uncertain phrase (e.g., 'ఎలాగా అడగాలి', 'எப்படி கேட்கலாம்')
2. Translate and interpret ONLY that uncertain/question part into natural English phrasing
3. Offer 2–3 improved English versions tagged with tone (Professional, Friendly, Direct)
4. Use this strict JSON response format:

{
  "correctedText": "Cleanest and most accurate version in English",
  "toneSuggestions": [
    {"tone": "Professional", "text": "..."},
    {"tone": "Friendly", "text": "..."},
    {"tone": "Direct", "text": "..."}
  ],
  "confidence": 0.9,
  "explanation": "Translated partial phrase, preserved intent, improved tone"
}

Guidelines:
- If the user input is already in English but unpolished, apply corrections
- If mixed-language (e.g., 'how to say this - నేను బిజీగా ఉన్నాను'), translate the Telugu part only
- Do NOT translate or modify input unless uncertain/incorrect
- Always return grammatically clean, context-friendly English options
- Focus on improving clarity and confidence for the user

Examples:
1. Input: "ఎలాగా అడగాలి, are you free now?"
   → Translated phrase: "how to ask - are you free now?"
   → Responses:
      - Professional: "Would you be available to talk now?"
      - Friendly: "Do you have a moment now?"
      - Direct: "Free now?"

2. Input: "எப்படி கேட்கலாம், where is the restroom"
   → Translated phrase: "how to ask - where is the restroom"
   → Responses:
      - Professional: "Could you please direct me to the restroom?"
      - Friendly: "Can you tell me where the restroom is?"
      - Direct: "Where's the restroom?"

3. Input: "can you help me"
   → Tone application:
      - Professional: "Could you please help me with this?"
      - Friendly: "Hey, can you help me out here?"
      - Direct: "Need your help."

Respond ONLY with the JSON object.`;
  }

  getSuggestionsPrompt(text: string, context?: string): string {
    return `You are an AI English communication coach. Given the following text, provide 3-5 alternative ways to express the same idea, focusing on different styles and tones suitable for technical professionals.

TEXT: "${text}"
CONTEXT: ${context || 'General technical communication'}

Provide responses in JSON format:
{
  "suggestions": [
    "Alternative expression 1",
    "Alternative expression 2",
    "Alternative expression 3"
  ]
}

GUIDELINES:
1. Maintain the original meaning
2. Provide options for different formality levels (casual, professional, formal)
3. Include variations for different audiences (clients, team members, management)
4. Focus on practical, usable alternatives
5. Ensure all suggestions are grammatically correct
6. Consider technical communication best practices

EXAMPLE OUTPUT:
For "The server is down":
{
  "suggestions": [
    "We are experiencing a server outage",
    "The server is currently unavailable",
    "We have identified a server connectivity issue",
    "The system is temporarily offline",
    "We are working to restore server functionality"
  ]
}

Respond ONLY with the JSON object.`;
  }

  // Example sentences for different scenarios
  getTechnicalExamples(): { [key: string]: string[] } {
    return {
      'issue_reporting': [
        "We have identified a critical system issue affecting user authentication.",
        "The database connection is experiencing intermittent failures.",
        "We are investigating reports of slow response times on the application."
      ],
      'status_updates': [
        "We have completed 75% of the implementation and expect to finish by Friday.",
        "The testing phase is in progress, with 80% of test cases passing.",
        "We are currently deploying the fix to the production environment."
      ],
      'client_communication': [
        "We understand the urgency of this issue and have assigned our senior team to resolve it.",
        "We will provide hourly updates on the progress of this resolution.",
        "The issue has been resolved, and all systems are now functioning normally."
      ],
      'meeting_requests': [
        "Could we schedule a meeting to discuss the project requirements?",
        "I would like to arrange a technical review session for tomorrow.",
        "We need to coordinate with the client team regarding the deployment schedule."
      ]
    };
  }

  // Common patterns to correct
  getCommonPatterns(): { [key: string]: { wrong: string; correct: string; explanation: string } } {
    return {
      'server_issues': {
        wrong: "Server lo problem undi",
        correct: "There is a problem with the server",
        explanation: "Clear English translation with proper structure"
      },
      'politeness': {
        wrong: "can you help me",
        correct: "could you please help me",
        explanation: "More polite and professional tone"
      },
      'issue_identification': {
        wrong: "some issue is there",
        correct: "we have identified an issue",
        explanation: "More professional and active voice"
      },
      'commitment': {
        wrong: "will try to fix",
        correct: "we will resolve this issue",
        explanation: "Shows confidence and commitment"
      },
      'status_clarity': {
        wrong: "work is going on",
        correct: "work is in progress",
        explanation: "More professional and clear"
      }
    };
  }

  // Tone-specific guidelines
  getToneGuidelines(tone: ToneType): string[] {
    const guidelines = {
      'professional': [
        "Use formal language and complete sentences",
        "Avoid contractions and casual expressions",
        "Include clear timelines and expectations",
        "Use 'we' instead of 'I' for team communications"
      ],
      'friendly': [
        "Use warm, approachable language",
        "Include courtesy markers like 'please' and 'thank you'",
        "Use collaborative language",
        "Show empathy and understanding"
      ],
      'direct': [
        "Get straight to the point",
        "Use clear, concise sentences",
        "Focus on actions and outcomes",
        "Avoid unnecessary explanations"
      ],
      'casual': [
        "Use conversational language",
        "Contractions are acceptable",
        "Informal expressions are OK",
        "Focus on clarity over formality"
      ]
    };
    return guidelines[tone];
  }
}