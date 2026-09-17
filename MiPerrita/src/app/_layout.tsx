import { Stack, useRouter, useSegments } from 'expo-router';
import { ThemeProvider, useTheme } from '../../context/ThemeContext';
import { AuthProvider, useAuth } from '../../context/AuthContext';
import { useFonts, Poppins_400Regular, Poppins_600SemiBold, Poppins_700Bold } from '@expo-google-fonts/poppins';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { View } from 'react-native';

SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { isReady, colors } = useTheme();
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading || !isReady) return;

    const enAuthGroup = segments[0] === 'login' || segments[0] === 'registro';

    if (!user && !enAuthGroup) {
      router.replace('/login');
    } else if (user && enAuthGroup) {
      router.replace('/');
    }
  }, [user, loading, isReady, segments]);

  if (!isReady || loading) {
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    />
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({
    Poppins_400Regular,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

  return (
    <ThemeProvider>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </ThemeProvider>
  );
}