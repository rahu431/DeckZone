import React, { useState, useEffect, useMemo } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Info, X } from 'lucide-react';
import { SpeechRecognitionService, SpeechRecognitionResult } from '@/services/speechRecognitionService';
import { AzureSpeechService } from '@/services/azureSpeechService';
import { GeminiService } from '@/services/geminiService';
import { VoicePromptManager } from '@/services/voicePromptManager';
import { PromptManager } from '@/services/promptManager';
import { VoiceService } from '@/services/voiceService';
import { cn } from '@/utils/cn';

interface ToneVariation {
  text: string;
  explanation: string;
  translation: string; // Translation back to input language
}

interface VoiceResponse {
  originalText: string;
  sourceLanguage: string;
  translatedMeaning: string; // Added for cross-check translation
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
  const [showPromptPopup, setShowPromptPopup] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState<string>('');
  const [isCorrectingInput, setIsCorrectingInput] = useState(false);
  const [recordingTimer, setRecordingTimer] = useState<number>(0);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);
  const [maxRecordingTime] = useState<number>(60); // 60 seconds maximum listening time
  const [activeSpeechService, setActiveSpeechService] = useState<'web' | 'azure'>('web');
  const [silenceTimeout, setSilenceTimeout] = useState<NodeJS.Timeout | null>(null);

  const speechService = SpeechRecognitionService.getInstance();
  const azureSpeechService = AzureSpeechService.getInstance();
  const geminiService = GeminiService.getInstance();
  const voicePromptManager = VoicePromptManager.getInstance();
  const promptManager = PromptManager.getInstance();
  const voiceService = VoiceService.getInstance();

  const isMobile = useMemo(() => /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent), []);

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
      if (silenceTimeout) {
        clearTimeout(silenceTimeout);
      }
      speechService.stopListening();
      azureSpeechService.stopListening();
    };
  }, [timerInterval, speechService, azureSpeechService, silenceTimeout]);

  // Timer management functions
  const startRecordingTimer = () => {
    setRecordingTimer(0);
    const interval = setInterval(() => {
      setRecordingTimer(prev => {
        if (prev >= maxRecordingTime) {
          stopRecordingTimer();
          if (activeSpeechService === 'web') {
            speechService.stopListening();
          } else {
            azureSpeechService.stopListening();
          }
          setIsListening(false);
          setIsCorrectingInput(false);
          setError('Recording time limit reached. Please try again.');
          return prev;
        }
        return prev + 1;
      });
    }, 1000);
    setTimerInterval(interval);
  };

  const stopRecordingTimer = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
    setRecordingTimer(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Language options for dropdown
  const languageOptions = [
    { value: 'en', label: 'English', flag: '🇺🇸' },
    { value: 'ta', label: 'Tamil', flag: '🇮🇳' },
    { value: 'te', label: 'Telugu', flag: '🇮🇳' },
    { value: 'hi', label: 'Hindi', flag: '🇮🇳' },
  ];

  const getLanguageCode = (lang: string) => {
    const codes: { [key: string]: string } = {
      en: 'en-US',
      ta: 'ta-IN',
      te: 'te-IN',
      hi: 'hi-IN',
    };
    return codes[lang] || 'en-US';
  };

  const isLanguageSupported = (lang: string) => {
    if (isMobile && lang !== 'en') {
      return azureSpeechService.isConfigured();
    }
    return speechService.isSupported() && SpeechRecognitionService.isLanguageSupported(lang);
  };

  const handleMicrophonePress = async () => {
    if (isListening) {
      if (silenceTimeout) {
        clearTimeout(silenceTimeout);
        setSilenceTimeout(null);
      }
      if (activeSpeechService === 'web') {
        speechService.stopListening();
      } else {
        azureSpeechService.stopListening();
      }
      voiceService.stop();
      setIsListening(false);
      setVoiceResponse(null);
      setError(null);
      setIsSpeaking(false);
      stopRecordingTimer();
      return;
    }

    if (!speechService.isSupported() && !azureSpeechService.isConfigured()) {
      setError('Voice input not supported in this browser and Azure is not configured.');
      return;
    }

    const useAzure = (isMobile && selectedLanguage !== 'en') || !SpeechRecognitionService.isLanguageSupported(selectedLanguage);
    setActiveSpeechService(useAzure ? 'azure' : 'web');

    if (useAzure && !azureSpeechService.isConfigured()) {
      setError('This language is not supported on your device. Please use a desktop browser or switch to English.');
      return;
    }

    setVoiceResponse(null);
    setError(null);
    setIsProcessing(false);
    setIsSpeaking(false);

    try {
      setIsListening(true);
      startRecordingTimer();

      if (silenceTimeout) clearTimeout(silenceTimeout);
      const newSilenceTimeout = setTimeout(() => {
        console.log('No speech detected for 5 seconds, stopping listening.');
        if (activeSpeechService === 'web') {
          speechService.stopListening();
        } else {
          azureSpeechService.stopListening();
        }
      }, 5000);
      setSilenceTimeout(newSilenceTimeout);

      const languageCode = getLanguageCode(selectedLanguage);
      console.log(`Starting voice input with ${useAzure ? 'Azure Speech' : 'Web Speech'} for language: ${languageCode}`);

      const handleResult = async (result: SpeechRecognitionResult) => {
        if (silenceTimeout) {
          clearTimeout(silenceTimeout);
          setSilenceTimeout(null);
        }

        if (!result.isFinal) return;
        const transcript = result.transcript.trim();
        if (!transcript) return;

        console.log('Final voice input received:', transcript);
        setIsListening(false);
        setIsProcessing(true);
        stopRecordingTimer();

        try {
          if (!geminiService.isConfigured()) throw new Error('Gemini AI not configured');

          const prompt = voicePromptManager.getVoiceCorrectionPrompt(transcript, selectedLanguage);
          const correctionPrompt = promptManager.getCorrectionPrompt(transcript, selectedLanguage, 'professional');
          setCurrentPrompt(correctionPrompt);

          const geminiResult = await geminiService.modelInstance.generateContent(prompt);
          const response = await geminiResult.response;
          const responseText = response.text();
          console.log('Gemini AI response:', responseText);

          const jsonMatch = responseText.match(/\{[\s\S]*\}/);
          if (!jsonMatch) throw new Error('Invalid response format');

          const aiResponse: VoiceResponse = JSON.parse(jsonMatch[0]);
          setVoiceResponse(aiResponse);

          try {
            setIsSpeaking(true);
            setCurrentlyPlaying('professional');
            await voiceService.speak(aiResponse.toneVariations.professional.text, 'en-US');
          } catch (voiceError) {
            console.log('Voice playback error (non-fatal):', voiceError);
          } finally {
            setIsSpeaking(false);
            setCurrentlyPlaying(null);
          }
        } catch (error) {
          console.error('Processing error:', error);
          setError('Error processing your speech. Please try again.');
        } finally {
          setIsProcessing(false);
        }
      };

      const handleError = (error: string) => {
        if (silenceTimeout) {
          clearTimeout(silenceTimeout);
          setSilenceTimeout(null);
        }
        console.error('Voice input error:', error);
        setIsListening(false);
        setIsProcessing(false);
        stopRecordingTimer();
        setError('Voice input error. Please try again.');
      };

      if (useAzure) {
        await azureSpeechService.startListening(handleResult, handleError, { language: languageCode });
      } else {
        await speechService.startListening(handleResult, handleError, {
          language: languageCode,
          continuous: true,
          interimResults: true,
          maxAlternatives: 1,
        });
      }
    } catch (error) {
      console.error('Failed to start voice input:', error);
      setIsListening(false);
      stopRecordingTimer();
      setError('Failed to start voice input. Please check your microphone permissions.');
    }
  };

  const handleInputCorrection = async () => {
    if (isCorrectingInput) {
      if (silenceTimeout) {
        clearTimeout(silenceTimeout);
        setSilenceTimeout(null);
      }
      if (activeSpeechService === 'web') {
        speechService.stopListening();
      } else {
        azureSpeechService.stopListening();
      }
      setIsCorrectingInput(false);
      return;
    }

    const useAzure = (isMobile && selectedLanguage !== 'en') || !SpeechRecognitionService.isLanguageSupported(selectedLanguage);
    setActiveSpeechService(useAzure ? 'azure' : 'web');

    if (useAzure && !azureSpeechService.isConfigured()) {
      setError('This language is not supported on your device. Please use a desktop browser or switch to English.');
      return;
    }

    try {
      setIsCorrectingInput(true);
      setError(null);
      startRecordingTimer();

      if (silenceTimeout) clearTimeout(silenceTimeout);
      const newSilenceTimeout = setTimeout(() => {
        console.log('No speech detected for 5 seconds, stopping listening for correction.');
        if (activeSpeechService === 'web') {
          speechService.stopListening();
        } else {
          azureSpeechService.stopListening();
        }
      }, 5000);
      setSilenceTimeout(newSilenceTimeout);

      const languageCode = getLanguageCode(selectedLanguage);

      const handleResult = async (result: SpeechRecognitionResult) => {
        if (silenceTimeout) {
          clearTimeout(silenceTimeout);
          setSilenceTimeout(null);
        }

        if (!result.isFinal) return;
        const transcript = result.transcript.trim();
        if (!transcript) return;

        console.log('Input correction received:', transcript);
        setIsCorrectingInput(false);
        setIsProcessing(true);
        stopRecordingTimer();

        try {
          const prompt = voicePromptManager.getVoiceCorrectionPrompt(transcript, selectedLanguage);
          const correctionPrompt = promptManager.getCorrectionPrompt(transcript, selectedLanguage, 'professional');
          setCurrentPrompt(correctionPrompt);

          const geminiResult = await geminiService.modelInstance.generateContent(prompt);
          const response = await geminiResult.response;
          const responseText = response.text();

          const jsonMatch = responseText.match(/\{[\s\S]*\}/);
          if (!jsonMatch) throw new Error('Invalid response format');

          const aiResponse: VoiceResponse = JSON.parse(jsonMatch[0]);
          setVoiceResponse(aiResponse);

          try {
            setIsSpeaking(true);
            setCurrentlyPlaying('professional');
            await voiceService.speak(aiResponse.toneVariations.professional.text, 'en-US');
          } catch (voiceError) {
            console.log('Voice playback error (non-fatal):', voiceError);
          } finally {
            setIsSpeaking(false);
            setCurrentlyPlaying(null);
          }
        } catch (error) {
          console.error('Input correction processing error:', error);
          setError('Error processing corrected input. Please try again.');
        } finally {
          setIsProcessing(false);
        }
      };

      const handleError = (error: string) => {
        if (silenceTimeout) {
          clearTimeout(silenceTimeout);
          setSilenceTimeout(null);
        }
        console.error('Input correction voice error:', error);
        setIsCorrectingInput(false);
        stopRecordingTimer();
        setError('Voice correction error. Please try again.');
      };

      if (useAzure) {
        await azureSpeechService.startListening(handleResult, handleError, { language: languageCode });
      } else {
        await speechService.startListening(handleResult, handleError, {
          language: languageCode,
          continuous: true,
          interimResults: true,
          maxAlternatives: 1,
        });
      }
    } catch (error) {
      console.error('Failed to start input correction:', error);
      setIsCorrectingInput(false);
      stopRecordingTimer();
      setError('Failed to start correction. Please check your microphone permissions.');
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
    } catch (error) {
      console.log('Voice playback error (non-fatal):', error);
      // Don't show error to user for voice issues
    } finally {
      setIsSpeaking(false);
      setCurrentlyPlaying(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-primary-50 to-secondary-50 flex flex-col items-center justify-center p-8 overflow-hidden">
      {/* Header */}
      <div className="absolute top-8 left-8 right-8 flex justify-between items-center z-10">
        <div className="flex items-center space-x-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1">
          <h1 className="text-2xl font-bold text-gray-800">Speaking Coach</h1>

          {/* AI Prompt Info Button */}
          <button
            onClick={() => setShowPromptPopup(true)}
            disabled={!currentPrompt}
            className={cn(
              "p-2 rounded-full transition-colors",
              currentPrompt ? "bg-blue-500 hover:bg-blue-600 text-white" : "bg-gray-300 text-gray-500 cursor-not-allowed"
            )}
            title="View AI Agent Prompt"
          >
            <Info className="w-5 h-5" />
          </button>
        </div>

        {/* Language Selector */}
        <div className="flex items-center space-x-3 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1">
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

          {/* Status indicator and Timer */}
          {isListening && (
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-black-500 text-xs font-small">
              Listening...
            </div>
          )}

          {isCorrectingInput && (
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-yellow-600 text-xs font-small">
              Correcting...
            </div>
          )}

          {isProcessing && (
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-blue-500 text-sm font-medium">
              Processing...
            </div>
          )}

          {/* Recording Timer */}
          {(isListening || isCorrectingInput) && (
            <div className={cn(
              "absolute -top-16 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-lg text-lg font-mono",
              recordingTimer > maxRecordingTime - 10
                ? "bg-red-600 bg-opacity-90 text-white animate-pulse"
                : "bg-black bg-opacity-75 text-white"
            )}>
              <div className="flex items-center space-x-2">
                <div className={cn(
                  "w-2 h-2 rounded-full animate-pulse",
                  recordingTimer > maxRecordingTime - 10 ? "bg-yellow-300" : "bg-red-500"
                )}></div>
                <span className={cn(
                  recordingTimer > maxRecordingTime - 10 ? "font-bold text-xs" : "text-xs"
                )}>
                  {formatTime(recordingTimer)}
                </span>
              </div>

              {recordingTimer > maxRecordingTime - 10 && (
                <div className="text-xs text-center mt-1">
                  Time limit approaching!
                </div>
              )}
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
            {!isLanguageSupported(selectedLanguage) && (
              <p className="text-sm text-amber-600 mt-2">
                ⚠️ This language may not be supported on your browser. For best results, use a modern desktop browser.
              </p>
            )}
            <p className="text-sm">Speak naturally and wait for processing after completion</p>
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
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-4xl w-full max-h-[70vh] overflow-y-auto" style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#d1d5db #f3f4f6'
          }}>
            {/* Header */}
            <div className="mb-6 text-center">
              <h3 className="text-xl font-bold text-gray-800 mb-2">Communication Options</h3>
              <p className="text-sm text-gray-600">
                From {voiceResponse.sourceLanguage} → Professional English
              </p>
            </div>

            {/* Translation Cross-Check */}
            {voiceResponse.translatedMeaning && (
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center mb-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></div>
                  <h4 className="font-semibold text-yellow-800">Cross-Check Translation</h4>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">What AI understood:</span>
                  </p>

                  {/* Correction Microphone */}
                  <button
                    onClick={handleInputCorrection}
                    disabled={isProcessing}
                    className={cn(
                      "p-2 rounded-full transition-colors",
                      isCorrectingInput ? "bg-red-500 hover:bg-red-600 text-white animate-pulse" : "bg-yellow-500 hover:bg-yellow-600 text-white",
                      isProcessing && "opacity-50 cursor-not-allowed"
                    )}
                    title={isCorrectingInput ? "Stop correction" : "Correct what AI understood"}
                  >
                    <Mic className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-gray-900 text-sm italic bg-white p-3 rounded border">
                  "{voiceResponse.translatedMeaning}"
                </p>
                <p className="text-xs text-yellow-700 mt-2">
                  ✓ Verify this matches your intended meaning in {voiceResponse.sourceLanguage}
                  {!isCorrectingInput && (
                    <span className="ml-2">• Click 🎤 to correct AI understanding</span>
                  )}
                  {isCorrectingInput && (
                    <span className="ml-2">• Listening... Speak your correction</span>
                  )}
                </p>
              </div>
            )}

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

                {/* Translation in Input Language */}
                {voiceResponse.toneVariations.professional.translation && selectedLanguage !== 'en' && (
                  <div className="mb-3 p-2 bg-blue-100 rounded border-l-4 border-blue-400">
                    <p className="text-xs text-blue-700 font-medium mb-1">
                      {voiceResponse.sourceLanguage} Translation:
                    </p>
                    <p className="text-sm text-blue-800 italic">
                      "{voiceResponse.toneVariations.professional.translation}"
                    </p>
                  </div>
                )}

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

                {/* Translation in Input Language */}
                {voiceResponse.toneVariations.friendly.translation && selectedLanguage !== 'en' && (
                  <div className="mb-3 p-2 bg-green-100 rounded border-l-4 border-green-400">
                    <p className="text-xs text-green-700 font-medium mb-1">
                      {voiceResponse.sourceLanguage} Translation:
                    </p>
                    <p className="text-sm text-green-800 italic">
                      "{voiceResponse.toneVariations.friendly.translation}"
                    </p>
                  </div>
                )}

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

                {/* Translation in Input Language */}
                {voiceResponse.toneVariations.direct.translation && selectedLanguage !== 'en' && (
                  <div className="mb-3 p-2 bg-orange-100 rounded border-l-4 border-orange-400">
                    <p className="text-xs text-orange-700 font-medium mb-1">
                      {voiceResponse.sourceLanguage} Translation:
                    </p>
                    <p className="text-sm text-orange-800 italic">
                      "{voiceResponse.toneVariations.direct.translation}"
                    </p>
                  </div>
                )}

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

      {/* AI Prompt Popup */}
      {showPromptPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">AI Agent Prompt</h2>
              <button
                onClick={() => setShowPromptPopup(false)}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-4">
                  This is the exact prompt used to instruct the AI agent for processing your speech:
                </p>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono leading-relaxed">
                  {currentPrompt}
                </pre>
              </div>

              <div className="mt-4 text-xs text-gray-500">
                <p>
                  💡 This prompt guides the AI to provide professional English corrections in three different tones:
                  Professional, Friendly, and Direct.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end p-6 border-t border-gray-200">
              <button
                onClick={() => setShowPromptPopup(false)}
                className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceOnlyScreen;