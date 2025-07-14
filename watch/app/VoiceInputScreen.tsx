import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, TextInput, ScrollView, ActivityIndicator } from 'react-native';
import Voice from 'react-native-voice';

const VoiceInputScreen: React.FC = () => {
  const [recognizedText, setRecognizedText] = useState<string>('');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [forwardedText, setForwardedText] = useState<string>('');
  const [isForwarding, setIsForwarding] = useState<boolean>(false);

  useEffect(() => {
    Voice.onSpeechResults = (e: any) => {
      if (e.value && e.value.length > 0) {
        setRecognizedText(e.value[0]);
      }
    };
    Voice.onSpeechEnd = () => {
      setIsRecording(false);
    };
    Voice.onSpeechError = (e: any) => {
      console.error('Speech error:', e);
      setIsRecording(false);
    };

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const startRecognizing = async () => {
    setRecognizedText('');
    setForwardedText('');
    try {
      await Voice.start('en-US');
      setIsRecording(true);
    } catch (e) {
      console.error(e);
    }
  };

  const stopRecognizing = async () => {
    try {
      await Voice.stop();
      setIsRecording(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleForwardText = () => {
    setIsForwarding(true);
    // Simulate forwarding delay
    setTimeout(() => {
      setForwardedText(recognizedText);
      setIsForwarding(false);
      alert('Text forwarded successfully!');
    }, 1500);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Voice Input</Text>
      <Button
        title={isRecording ? 'Stop Recording' : 'Start Recording'}
        onPress={isRecording ? stopRecognizing : startRecognizing}
        color={isRecording ? 'red' : 'green'}
      />
      {isRecording && <ActivityIndicator size="small" color="#0000ff" style={styles.spinner} />}

      <ScrollView style={styles.textContainer}>
        <Text style={styles.recognizedTextLabel}>Recognized Text:</Text>
        <TextInput
          style={styles.textInput}
          multiline
          value={recognizedText}
          onChangeText={setRecognizedText}
          placeholder="Speak now..."
        />
      </ScrollView>

      <Button
        title={isForwarding ? 'Forwarding...' : 'Forward Text'}
        onPress={handleForwardText}
        disabled={!recognizedText || isForwarding}
      />
      {isForwarding && <ActivityIndicator size="small" color="#0000ff" style={styles.spinner} />}

      {forwardedText ? (
        <View style={styles.forwardedContainer}>
          <Text style={styles.forwardedTextLabel}>Forwarded Text:</Text>
          <Text style={styles.forwardedText}>{forwardedText}</Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  textContainer: {
    flex: 1,
    width: '100%',
    marginVertical: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
  },
  recognizedTextLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  textInput: {
    minHeight: 100,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  forwardedContainer: {
    marginTop: 20,
    width: '100%',
    borderWidth: 1,
    borderColor: '#007bff',
    padding: 10,
    borderRadius: 5,
  },
  forwardedTextLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#007bff',
  },
  forwardedText: {
    fontSize: 16,
    color: '#333',
  },
  spinner: {
    marginTop: 10,
  },
});

export default VoiceInputScreen;
