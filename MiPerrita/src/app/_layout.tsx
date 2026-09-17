import { Stack, useRouter, useSegments } from 'expo-router';
import { ThemeProvider, useTheme } from '../../context/ThemeContext';
import { AuthProvider, useAuth } from '../../context/AuthContext';
import { useFonts, Poppins_400Regular, Poppins_600SemiBold, Poppins_700Bold } from '@expo-google-fonts/poppins';
import * as SplashScreen from 'expo-splash-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { suscribirBienvenida } from '../../context/bienvenida';

SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { isReady, colors } = useTheme();
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const [bienvenidaVista, setBienvenidaVista] = useState<boolean | null>(null);

  const cargarBienvenida = async () => {
    const value = await AsyncStorage.getItem('bienvenida_vista');
    setBienvenidaVista(value === 'true');
  };

  useEffect(() => {
    cargarBienvenida();

    // Escuchar cuando el usuario marque la bienvenida como vista
    const unsubscribe = suscribirBienvenida(() => {
      setBienvenidaVista(true);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (loading || !isReady || bienvenidaVista === null) return;

    const enAuthGroup = segments[0] === 'login' || segments[0] === 'registro';
    const enBienvenida = segments[0] === 'bienvenida';

    if (!bienvenidaVista && !enBienvenida) {
      router.replace('/bienvenida');
      return;
    }

    if (enBienvenida) return;

    if (!user && !enAuthGroup) {
      router.replace('/login');
    } else if (user && enAuthGroup) {
      router.replace('/');
    }
  }, [user, loading, isReady, segments, bienvenidaVista]);

  if (!isReady || loading || bienvenidaVista === null) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
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