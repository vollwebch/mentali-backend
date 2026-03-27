import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { ThemeProvider } from '../ThemeContext';

import { useColorScheme } from '../hooks/useColorScheme';
import { ThoughtsProvider } from '../components/ThoughtsContext';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  // Solo cargamos SpaceMono, que sí existe. Si quieres otra fuente, añádela en assets/fonts y aquí.
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <ThemeProvider>
      <ThoughtsProvider>
        <NavigationThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack screenOptions={{ headerShown: false, header: () => null }}>
            <Stack.Screen name="welcome" options={{ headerShown: false, header: () => null }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false, header: () => null }} />
            <Stack.Screen name="compose" options={{ headerShown: false, header: () => null }} />
            <Stack.Screen name="+not-found" />
            <Stack.Screen name="emotional-map" options={{ headerShown: false, header: () => null }} />
            <Stack.Screen name="profile" options={{ headerShown: false, header: () => null }} />
          </Stack>
          <StatusBar style="auto" />
        </NavigationThemeProvider>
      </ThoughtsProvider>
    </ThemeProvider>
  );
}
