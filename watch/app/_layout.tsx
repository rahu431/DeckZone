import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import { useColorScheme } from '@/hooks/useColorScheme';
import ConnectionScreen from './ConnectionScreen';
import VoiceInputScreen from './VoiceInputScreen';

const Stack = createStackNavigator();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <NavigationContainer independent={true}>
        <Stack.Navigator initialRouteName="Connection">
          <Stack.Screen name="Connection" component={ConnectionScreen} options={{ headerShown: false }} />
          <Stack.Screen name="VoiceInput" component={VoiceInputScreen} options={{ title: 'Voice Input' }} />
        </Stack.Navigator>
      </NavigationContainer>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}