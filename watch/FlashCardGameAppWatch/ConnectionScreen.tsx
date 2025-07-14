import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, ActivityIndicator } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
  Connection: undefined;
  VoiceInput: undefined;
};

type ConnectionScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Connection'
>;

type Props = {
  navigation: ConnectionScreenNavigationProp;
};

const ConnectionScreen: React.FC<Props> = ({ navigation }) => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleConnect = () => {
    setIsConnecting(true);
    // Simulate a connection delay
    setTimeout(() => {
      setIsConnecting(false);
      if (isConnected) {
        navigation.navigate('VoiceInput');
      } else {
        alert('No internet connection. Please check your network settings.');
      }
    }, 2000);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Device Connection</Text>
      {isConnected === null ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <Text style={styles.status}>
          Status: {isConnected ? 'Connected' : 'Disconnected'}
        </Text>
      )}
      <Button
        title={isConnecting ? 'Connecting...' : 'Connect to Device'}
        onPress={handleConnect}
        disabled={isConnecting || !isConnected}
      />
      {isConnecting && <ActivityIndicator size="small" color="#0000ff" style={styles.spinner} />}
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
  status: {
    fontSize: 18,
    marginBottom: 20,
  },
  spinner: {
    marginTop: 10,
  },
});

export default ConnectionScreen;
