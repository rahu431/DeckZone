import React, { useState, useEffect } from 'react';
import { Play, Volume2, RotateCcw, CheckCircle, Mic, MicOff } from 'lucide-react';
import { SentenceCorrection, ToneType } from '@/types';
import { CorrectionService } from '@/services/correctionService';
import { VoiceService } from '@/services/voiceService';
import { SpeechRecognitionService, SpeechRecognitionResult } from '@/services/speechRecognitionService';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { cn } from '@/utils/cn';

interface SentenceCorrectorProps {
  userId: string;
  onCorrectionComplete?: (correction: SentenceCorrection) => void;
}

const SentenceCorrector: React.FC<SentenceCorrectorProps> = ({
  userId,
  onCorrectionComplete,
}) => {
  const [inputText, setInputText] = useState('');
  const [originalLanguage, setOriginalLanguage] = useState('en');
  const [targetTone, setTargetTone] = useState<ToneType>('professional');
  const [correction, setCorrection] = useState<SentenceCorrection | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [voiceInputSupported, setVoiceInputSupported] = useState(false);

  const correctionService = CorrectionService.getInstance();
  const voiceService = VoiceService.getInstance();
  const speechService = SpeechRecognitionService.getInstance();

  useEffect(() => {
    setVoiceInputSupported(speechService.isSupported());
  }, []);

  const handleVoiceInput = async () => {
    if (!voiceInputSupported) {
      console.warn('Voice input not supported in this browser');
      return;
    }

    if (isListening) {
      speechService.stopListening();
      setIsListening(false);
      setInterimTranscript('');
      return;
    }

    try {
      setIsListening(true);
      setInterimTranscript('');

      const languageCode = SpeechRecognitionService.getLanguageCode(originalLanguage);
      console.log('Starting voice input with language:', originalLanguage, '->', languageCode);
      
      // Check if the language is supported
      if (!SpeechRecognitionService.isLanguageSupported(originalLanguage)) {
        console.warn(`Language ${originalLanguage} may not be fully supported for voice recognition`);
      }
      
      await speechService.startListening(
        (result: SpeechRecognitionResult) => {
          console.log('Voice recognition result:', result);
          if (result.isFinal) {
            const finalText = result.transcript;
            console.log('Final voice input:', finalText);
            
            // Add space before appending if there's existing text
            setInputText(prev => prev + (prev ? ' ' : '') + finalText);
            setInterimTranscript('');
            setIsListening(false);
          } else {
            setInterimTranscript(result.transcript);
          }
        },
        (error: string) => {
          console.error('Voice input error:', error);
          setIsListening(false);
          setInterimTranscript('');
          
          // Show user-friendly error message
          if (error.includes('language-not-supported')) {
            alert(`Voice recognition for ${originalLanguage} may not be supported in your browser. Try switching to English or check your microphone permissions.`);
          } else if (error.includes('not-allowed')) {
            alert('Microphone access denied. Please allow microphone access and try again.');
          }
        },
        {
          language: languageCode,
          continuous: false,
          interimResults: true,
          maxAlternatives: 1,
        }
      );
    } catch (error) {
      console.error('Failed to start voice input:', error);
      setIsListening(false);
      setInterimTranscript('');
    }
  };

  const handleCorrect = async () => {
    if (!inputText.trim()) return;

    setIsLoading(true);
    try {
      const result = await correctionService.correctSentence(
        inputText,
        originalLanguage,
        targetTone,
        userId
      );
      
      if (result.success && result.data) {
        setCorrection(result.data);
        onCorrectionComplete?.(result.data);
      } else {
        console.error('Correction failed:', result.error);
      }
    } catch (error) {
      console.error('Correction failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayback = async (text: string) => {
    if (isPlaying) {
      voiceService.stop();
      setIsPlaying(false);
      return;
    }

    try {
      setIsPlaying(true);
      await voiceService.speak(text, 'en-US');
      setIsPlaying(false);
    } catch (error) {
      console.error('Voice playback failed:', error);
      setIsPlaying(false);
    }
  };

  const handleReset = () => {
    setInputText('');
    setCorrection(null);
    setInterimTranscript('');
    voiceService.stop();
    speechService.stopListening();
    setIsPlaying(false);
    setIsListening(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="space-y-4">
          {!import.meta.env.VITE_GEMINI_API_KEY && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <span className="text-yellow-600">⚠️</span>
                <div>
                  <p className="text-sm text-yellow-800 font-medium">
                    Gemini AI not configured
                  </p>
                  <p className="text-xs text-yellow-600">
                    Add VITE_GEMINI_API_KEY to your .env file for AI-powered corrections. 
                    <br />Get your free API key at: <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline">Google AI Studio</a>
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter your sentence
            </label>
            <div className="relative">
              <textarea
                value={inputText + interimTranscript}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type your sentence here or use voice input..."
                className={cn(
                  "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none",
                  isListening && "ring-2 ring-red-500 border-red-500"
                )}
                rows={3}
                disabled={isListening}
              />
              {interimTranscript && (
                <div className="absolute top-2 left-3 text-gray-400 italic">
                  {interimTranscript}
                </div>
              )}
              <div className="absolute bottom-2 right-2 flex items-center space-x-2">
                <span className="text-xs text-gray-400">
                  {(inputText + interimTranscript).length}/500
                </span>
                {voiceInputSupported && (
                  <Button
                    onClick={handleVoiceInput}
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "p-1 h-6 w-6",
                      isListening && "text-red-500 animate-pulse"
                    )}
                    disabled={isLoading}
                  >
                    {isListening ? (
                      <MicOff className="h-4 w-4" />
                    ) : (
                      <Mic className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="flex space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Original Language
              </label>
              <select
                value={originalLanguage}
                onChange={(e) => setOriginalLanguage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="en">English</option>
                <option value="te">Telugu</option>
                <option value="ta">Tamil</option>
                <option value="hi">Hindi</option>
              </select>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target Tone
              </label>
              <select
                value={targetTone}
                onChange={(e) => setTargetTone(e.target.value as ToneType)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="professional">Professional</option>
                <option value="friendly">Friendly</option>
                <option value="direct">Direct</option>
                <option value="casual">Casual</option>
              </select>
            </div>
          </div>

          <div className="flex space-x-3">
            <Button
              onClick={handleCorrect}
              loading={isLoading}
              disabled={!inputText.trim() || isListening}
              className="flex-1"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Correct Sentence
            </Button>
            <Button
              onClick={handleReset}
              variant="outline"
              disabled={isLoading || isListening}
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
          
          {isListening && (
            <div className="flex items-center justify-center space-x-2 text-red-500">
              <Mic className="w-4 h-4 animate-pulse" />
              <span className="text-sm">
                Listening in {originalLanguage === 'ta' ? 'Tamil' : originalLanguage === 'te' ? 'Telugu' : originalLanguage === 'hi' ? 'Hindi' : 'English'}... Speak now
              </span>
            </div>
          )}
          
          {voiceInputSupported && (
            <div className="text-xs text-gray-500 text-center">
              💡 Click the microphone button to use voice input in {originalLanguage === 'ta' ? 'Tamil' : originalLanguage === 'te' ? 'Telugu' : originalLanguage === 'hi' ? 'Hindi' : 'English'}
            </div>
          )}
        </div>
      </Card>

      {correction && (
        <Card className="border-green-200 bg-green-50">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-green-800">
                Corrected Sentence
              </h3>
              <div className="flex items-center text-sm text-green-600">
                <CheckCircle className="w-4 h-4 mr-1" />
                {Math.round(correction.confidence * 100)}% confidence
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-white rounded-lg border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Original:</span>
                  <Button
                    onClick={() => handlePlayback(correction.originalText)}
                    variant="ghost"
                    size="sm"
                  >
                    {isPlaying ? <Volume2 className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                </div>
                <p className="text-gray-800">{correction.originalText}</p>
              </div>

              <div className="p-3 bg-white rounded-lg border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-green-600">Corrected:</span>
                  <Button
                    onClick={() => handlePlayback(correction.correctedText)}
                    variant="ghost"
                    size="sm"
                  >
                    {isPlaying ? <Volume2 className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                </div>
                <p className="text-gray-800 font-medium">{correction.correctedText}</p>
              </div>
            </div>

            {correction.corrections.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-green-700">Corrections Made:</h4>
                {correction.corrections.map((item, index) => (
                  <div key={index} className="p-2 bg-white rounded border border-green-200">
                    <div className="flex items-center justify-between">
                      <span className={cn(
                        "text-xs px-2 py-1 rounded-full",
                        item.type === 'grammar' && "bg-blue-100 text-blue-700",
                        item.type === 'vocabulary' && "bg-purple-100 text-purple-700",
                        item.type === 'tone' && "bg-orange-100 text-orange-700",
                        item.type === 'structure' && "bg-green-100 text-green-700"
                      )}>
                        {item.type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{item.explanation}</p>
                  </div>
                ))}
              </div>
            )}

            {correction.improvementSuggestions && correction.improvementSuggestions.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-green-700">Improvement Suggestions:</h4>
                <ul className="space-y-1">
                  {correction.improvementSuggestions.map((suggestion, index) => (
                    <li key={index} className="text-sm text-green-600 flex items-start">
                      <span className="text-green-400 mr-2">•</span>
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

export default SentenceCorrector;