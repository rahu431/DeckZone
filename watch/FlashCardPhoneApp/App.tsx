import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import ConnectionScreen from './ConnectionScreen';
import VoiceInputScreen from './VoiceInputScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Connection">
        <Stack.Screen name="Connection" component={ConnectionScreen} options={{ headerShown: false }} />
        <Stack.Screen name="VoiceInput" component={VoiceInputScreen} options={{ title: 'Voice Input' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
