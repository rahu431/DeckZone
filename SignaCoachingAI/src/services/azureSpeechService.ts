import * as SpeechSDK from 'microsoft-cognitiveservices-speech-sdk';
import { SpeechRecognitionResult } from '@/services/speechRecognitionService';

export class AzureSpeechService {
  private static instance: AzureSpeechService;
  private speechConfig: SpeechSDK.SpeechConfig | null = null;
  private recognizer: SpeechSDK.SpeechRecognizer | null = null;

  private constructor() {
    const speechKey = import.meta.env.VITE_AZURE_SPEECH_KEY;
    const speechRegion = import.meta.env.VITE_AZURE_SPEECH_REGION;

    if (speechKey && speechRegion) {
      this.speechConfig = SpeechSDK.SpeechConfig.fromSubscription(speechKey, speechRegion);
      this.speechConfig.speechRecognitionLanguage = "en-US"; // Default language
      
      this.speechConfig.setProperty(SpeechSDK.PropertyId.SpeechServiceConnection_InitialSilenceTimeoutMs, "5000"); // Wait 5s for speech to start
      this.speechConfig.setProperty(SpeechSDK.PropertyId.SpeechServiceConnection_EndSilenceTimeoutMs, "2000"); // End recognition after 2s of silence
    } else {
      console.warn('Azure Speech credentials not found in environment variables.');
    }
  }

  public static getInstance(): AzureSpeechService {
    if (!AzureSpeechService.instance) {
      AzureSpeechService.instance = new AzureSpeechService();
    }
    return AzureSpeechService.instance;
  }

  public isConfigured(): boolean {
    return !!this.speechConfig;
  }

  public async startListening(
    onResult: (result: SpeechRecognitionResult) => void,
    onError: (error: string) => void,
    options: { language: string; micSensitivity?: number }
  ): Promise<void> {
    if (!this.speechConfig) {
      onError('Azure Speech Service is not configured.');
      return;
    }

    // Adjust timeouts based on sensitivity (0-100)
    // Higher sensitivity means shorter timeouts (less tolerant to silence)
    const sensitivity = options.micSensitivity ?? 50; // Default to 50 if not provided
    const endSilenceTimeout = 3000 - (sensitivity * 20); // Range: 3000ms (0) to 1000ms (100)
    const initialSilenceTimeout = 6000 - (sensitivity * 40); // Range: 6000ms (0) to 2000ms (100)

    this.speechConfig.setProperty(SpeechSDK.PropertyId.SpeechServiceConnection_InitialSilenceTimeoutMs, initialSilenceTimeout.toString());
    this.speechConfig.setProperty(SpeechSDK.PropertyId.SpeechServiceConnection_EndSilenceTimeoutMs, endSilenceTimeout.toString());

    this.speechConfig.speechRecognitionLanguage = options.language;
    const audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
    this.recognizer = new SpeechSDK.SpeechRecognizer(this.speechConfig, audioConfig);

    this.recognizer.recognized = (_, e) => {
      if (e.result.reason === SpeechSDK.ResultReason.RecognizedSpeech) {
        const result: SpeechRecognitionResult = {
          transcript: e.result.text,
          isFinal: true,
          confidence: e.result.properties.getProperty(SpeechSDK.PropertyId.SpeechServiceResponse_JsonResult)
            ? JSON.parse(e.result.properties.getProperty(SpeechSDK.PropertyId.SpeechServiceResponse_JsonResult)).Confidence
            : 0,
        };
        onResult(result);
      }
    };

    this.recognizer.canceled = (_, e) => {
      let errorMessage = `Canceled: ${e.reason}`;
      if (e.reason === SpeechSDK.CancellationReason.Error) {
        errorMessage += ` - ${e.errorDetails}`;
      }
      onError(errorMessage);
      this.stopListening();
    };
    
    this.recognizer.sessionStopped = () => {
        this.stopListening();
    };

    this.recognizer.startContinuousRecognitionAsync(
        () => {},
        (err: string) => {
            onError(err);
        }
    );
  }



  public stopListening(): void {
    if (this.recognizer) {
      this.recognizer.stopContinuousRecognitionAsync(
        () => {
          this.recognizer?.close();
          this.recognizer = null;
        },
        (err: string) => {
          console.error('Error stopping recognition:', err);
          this.recognizer?.close();
          this.recognizer = null;
        }
      );
    }
  }
}
