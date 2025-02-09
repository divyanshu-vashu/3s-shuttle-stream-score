import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen 
          name="index" 
          options={{ 
            title: 'Badminton Score',
            headerStyle: {
              backgroundColor: '#25292e',
            },
            headerTintColor: '#fff',
          }} 
        />
        <Stack.Screen 
          name="score" 
          options={{ 
            title: 'Score',
            headerStyle: {
              backgroundColor: '#25292e',
            },
            headerTintColor: '#fff',
            headerShown: false,
          }} 
        />
        <Stack.Screen 
          name="toss" 
          options={{ 
            title: 'Toss',
            headerStyle: {
              backgroundColor: '#25292e',
            },
            headerTintColor: '#fff',
          }} 
        />
        <Stack.Screen 
          name="create-room" 
          options={{ 
            title: 'Create Room',
            headerStyle: {
              backgroundColor: '#25292e',
            },
            headerTintColor: '#fff',
          }} 
        />
        <Stack.Screen 
          name="join-room" 
          options={{ 
            title: 'Join Room',
            headerStyle: {
              backgroundColor: '#25292e',
            },
            headerTintColor: '#fff',
          }} 
        />
        <Stack.Screen 
          name="join-score" 
          options={{ 
            title: 'Live Score',
            headerStyle: {
              backgroundColor: '#25292e',
            },
            headerTintColor: '#fff',
            headerShown: false,
          }} 
        />
        <Stack.Screen name="+not-found" options={{ title: 'Oops!' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}