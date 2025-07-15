import React, { useState } from 'react';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { SpeechRecognitionService, SpeechRecognitionResult } from '@/services/speechRecognitionService';
import { GeminiService } from '@/services/geminiService';
import { VoicePromptManager } from '@/services/voicePromptManager';
import { VoiceService } from '@/services/voiceService';
import { cn } from '@/utils/cn';

interface ToneVariation {
  text: string;
  explanation: string;
}

interface VoiceResponse {
  originalText: string;
  sourceLanguage: string;
  toneVariations: {
    professional: ToneVariation;
    friendly: ToneVariation;
    direct: ToneVariation;
  };
  confidence: number;
  generalExplanation: string;
}

const VoiceOnlyScreen: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [voiceResponse, setVoiceResponse] = useState<VoiceResponse | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);

  const speechService = SpeechRecognitionService.getInstance();
  const geminiService = GeminiService.getInstance();
  const voicePromptManager = VoicePromptManager.getInstance();
  const voiceService = VoiceService.getInstance();

  // Language options for dropdown
  const languageOptions = [
    { value: 'en', label: 'English', flag: '🇺🇸' },
    { value: 'ta', label: 'Tamil', flag: '🇮🇳' },
    { value: 'te', label: 'Telugu', flag: '🇮🇳' },
    { value: 'hi', label: 'Hindi', flag: '🇮🇳' },
  ];

  const handleMicrophonePress = async () => {
    if (isListening) {
      // Stop listening and clear session
      speechService.stopListening();
      voiceService.stop();
      setIsListening(false);
      setVoiceResponse(null);
      setError(null);
      setIsSpeaking(false);
      return;
    }

    if (!speechService.isSupported()) {
      setError('Voice input not supported in this browser');
      return;
    }

    // Clear previous session
    setVoiceResponse(null);
    setError(null);
    setIsProcessing(false);
    setIsSpeaking(false);

    try {
      setIsListening(true);
      
      // Get language code for speech recognition
      const languageCode = SpeechRecognitionService.getLanguageCode(selectedLanguage);
      console.log('Starting voice input with selected language:', selectedLanguage, '->', languageCode);
      
      await speechService.startListening(
        async (result: SpeechRecognitionResult) => {
          if (result.isFinal) {
            const transcript = result.transcript.trim();
            if (!transcript) return;

            console.log('Voice input received:', transcript);
            console.log('Selected language:', selectedLanguage);

            setIsListening(false);
            setIsProcessing(true);

            try {
              // Process with AI to get all three tone variations
              if (!geminiService.isConfigured()) {
                throw new Error('Gemini AI not configured');
              }

              const prompt = voicePromptManager.getVoiceCorrectionPrompt(transcript, selectedLanguage);
              
              const result = await geminiService.modelInstance.generateContent(prompt);
              const response = await result.response;
              const responseText = response.text();
              
              console.log('Gemini AI response:', responseText);

              // Parse the JSON response
              const jsonMatch = responseText.match(/\{[\s\S]*\}/);
              if (!jsonMatch) {
                throw new Error('Invalid response format');
              }

              const aiResponse: VoiceResponse = JSON.parse(jsonMatch[0]);
              setVoiceResponse(aiResponse);
              
              // Automatically speak the professional version
              setIsSpeaking(true);
              setCurrentlyPlaying('professional');
              await voiceService.speak(aiResponse.toneVariations.professional.text, 'en-US');
              setIsSpeaking(false);
              setCurrentlyPlaying(null);
            } catch (error) {
              console.error('Processing error:', error);
              setError('Error processing your speech. Please try again.');
            } finally {
              setIsProcessing(false);
            }
          }
        },
        (error: string) => {
          console.error('Voice input error:', error);
          setIsListening(false);
          setIsProcessing(false);
          setError('Voice input error. Please try again.');
        },
        {
          language: languageCode,
          continuous: false,
          interimResults: false,
          maxAlternatives: 1,
        }
      );
    } catch (error) {
      console.error('Failed to start voice input:', error);
      setIsListening(false);
      setError('Failed to start voice input. Please check your microphone permissions.');
    }
  };

  const playTone = async (toneType: 'professional' | 'friendly' | 'direct') => {
    if (!voiceResponse) return;
    
    if (currentlyPlaying === toneType) {
      // Stop current playback
      voiceService.stop();
      setIsSpeaking(false);
      setCurrentlyPlaying(null);
      return;
    }
    
    // Stop any current playback
    voiceService.stop();
    
    try {
      setIsSpeaking(true);
      setCurrentlyPlaying(toneType);
      await voiceService.speak(voiceResponse.toneVariations[toneType].text, 'en-US');
      setIsSpeaking(false);
      setCurrentlyPlaying(null);
    } catch (error) {
      console.error('Voice playback error:', error);
      setIsSpeaking(false);
      setCurrentlyPlaying(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-primary-50 to-secondary-50 flex flex-col items-center justify-center p-8 overflow-hidden">
      {/* Header */}
      <div className="absolute top-8 left-8 right-8 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Voice Coach</h1>
        
        {/* Language Selector */}
        <div className="flex items-center space-x-3">
          <label className="text-sm font-medium text-gray-700">Input Language:</label>
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            disabled={isListening || isProcessing}
            className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {languageOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.flag} {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-4xl w-full">
        {/* Microphone Button */}
        <div className="relative mb-12">
          <button
            onClick={handleMicrophonePress}
            disabled={isProcessing}
            className={cn(
              "w-32 h-32 rounded-full shadow-2xl transition-all duration-300 flex items-center justify-center",
              isListening ? "bg-red-500 hover:bg-red-600 animate-pulse" : "bg-primary-500 hover:bg-primary-600",
              isProcessing && "opacity-50 cursor-not-allowed",
              "active:scale-95"
            )}
          >
            {isListening ? (
              <MicOff className="w-12 h-12 text-white" />
            ) : (
              <Mic className="w-12 h-12 text-white" />
            )}
          </button>
          
          {/* Status indicator */}
          {isListening && (
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-red-500 text-sm font-medium">
              Listening...
            </div>
          )}
          
          {isProcessing && (
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-blue-500 text-sm font-medium">
              Processing...
            </div>
          )}
        </div>

        {/* Instructions */}
        {!voiceResponse && !error && (
          <div className="text-center text-gray-600 mb-8">
            <p className="text-lg mb-2">Press the microphone to speak</p>
            <p className="text-sm">
              Speaking in: {languageOptions.find(lang => lang.value === selectedLanguage)?.flag} {languageOptions.find(lang => lang.value === selectedLanguage)?.label}
            </p>
            <p className="text-sm">Get instant professional English responses</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8 max-w-md text-center">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Voice Response */}
        {voiceResponse && (
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-4xl w-full">
            {/* Header */}
            <div className="mb-6 text-center">
              <h3 className="text-xl font-bold text-gray-800 mb-2">Communication Options</h3>
              <p className="text-sm text-gray-600">
                From {voiceResponse.sourceLanguage} → Professional English
              </p>
            </div>

            {/* Three Tone Variations */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              
              {/* Professional Tone */}
              <div className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-blue-800 flex items-center">
                    👔 Professional
                  </h4>
                  <button
                    onClick={() => playTone('professional')}
                    className={cn(
                      "p-2 rounded-full transition-colors",
                      currentlyPlaying === 'professional' ? "bg-blue-200" : "hover:bg-blue-100"
                    )}
                  >
                    {currentlyPlaying === 'professional' ? (
                      <VolumeX className="w-4 h-4 text-blue-600" />
                    ) : (
                      <Volume2 className="w-4 h-4 text-blue-600" />
                    )}
                  </button>
                </div>
                <p className="text-gray-900 text-sm leading-relaxed mb-3">
                  {voiceResponse.toneVariations.professional.text}
                </p>
                <p className="text-xs text-blue-600">
                  {voiceResponse.toneVariations.professional.explanation}
                </p>
              </div>

              {/* Friendly Tone */}
              <div className="border-2 border-green-200 rounded-lg p-4 bg-green-50">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-green-800 flex items-center">
                    😊 Friendly
                  </h4>
                  <button
                    onClick={() => playTone('friendly')}
                    className={cn(
                      "p-2 rounded-full transition-colors",
                      currentlyPlaying === 'friendly' ? "bg-green-200" : "hover:bg-green-100"
                    )}
                  >
                    {currentlyPlaying === 'friendly' ? (
                      <VolumeX className="w-4 h-4 text-green-600" />
                    ) : (
                      <Volume2 className="w-4 h-4 text-green-600" />
                    )}
                  </button>
                </div>
                <p className="text-gray-900 text-sm leading-relaxed mb-3">
                  {voiceResponse.toneVariations.friendly.text}
                </p>
                <p className="text-xs text-green-600">
                  {voiceResponse.toneVariations.friendly.explanation}
                </p>
              </div>

              {/* Direct Tone */}
              <div className="border-2 border-orange-200 rounded-lg p-4 bg-orange-50">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-orange-800 flex items-center">
                    ⚡ Direct
                  </h4>
                  <button
                    onClick={() => playTone('direct')}
                    className={cn(
                      "p-2 rounded-full transition-colors",
                      currentlyPlaying === 'direct' ? "bg-orange-200" : "hover:bg-orange-100"
                    )}
                  >
                    {currentlyPlaying === 'direct' ? (
                      <VolumeX className="w-4 h-4 text-orange-600" />
                    ) : (
                      <Volume2 className="w-4 h-4 text-orange-600" />
                    )}
                  </button>
                </div>
                <p className="text-gray-900 text-sm leading-relaxed mb-3">
                  {voiceResponse.toneVariations.direct.text}
                </p>
                <p className="text-xs text-orange-600">
                  {voiceResponse.toneVariations.direct.explanation}
                </p>
              </div>
            </div>

            {/* General Information */}
            <div className="text-center border-t pt-4">
              <p className="text-sm text-gray-600 mb-2">
                {voiceResponse.generalExplanation}
              </p>
              <div className="text-xs text-gray-500">
                <span className="inline-block bg-gray-100 px-2 py-1 rounded-full">
                  Confidence: {Math.round(voiceResponse.confidence * 100)}%
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Instructions */}
      <div className="absolute bottom-8 left-8 right-8 text-center text-sm text-gray-500">
        {voiceResponse ? (
          <p>Press the microphone again to start a new session</p>
        ) : (
          <p>Select your input language above, then speak naturally</p>
        )}
      </div>
    </div>
  );
};

export default VoiceOnlyScreen;