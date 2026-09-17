import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView,
  KeyboardAvoidingView, Platform, Alert, ActivityIndicator, Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { fonts } from '../../context/typography';

export default function LoginScreen() {
  const { colors } = useTheme();
  const { login, user, loading } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);
  const [verPassword, setVerPassword] = useState(false);
  const [biometriaDisponible, setBiometriaDisponible] = useState(false);
  const [biometriaActiva, setBiometriaActiva] = useState(false);

  useEffect(() => {
    (async () => {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolado = await LocalAuthentication.isEnrolledAsync();
      const activa = await AsyncStorage.getItem('biometria_activa');

      setBiometriaDisponible(compatible && enrolado);
      setBiometriaActiva(activa === 'true');
    })();
  }, []);

  useEffect(() => {
    if (!loading && user) {
      router.replace('/');
    }
  }, [user, loading]);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Faltan datos', 'Escribe tu usuario y contraseña');
      return;
    }
    setCargando(true);
    try {
      await login(username, password);
      router.replace('/');
    } catch (error: any) {
      Alert.alert('Error', 'Usuario o contraseña incorrectos');
      console.log(error);
    } finally {
      setCargando(false);
    }
  };

  const handleHuella = async () => {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Autentícate para entrar',
      fallbackLabel: 'Usar contraseña',
      cancelLabel: 'Cancelar',
    });

    if (!result.success) return;

    const savedUsername = await SecureStore.getItemAsync('biometria_username');
    const savedPassword = await SecureStore.getItemAsync('biometria_password');

    if (!savedUsername || !savedPassword) {
      Alert.alert(
        'Error',
        'No se encontraron credenciales. Vuelve a activar la huella en Ajustes.'
      );
      return;
    }

    setCargando(true);
    try {
      await login(savedUsername, savedPassword);
      router.replace('/');
    } catch (error) {
      Alert.alert('Error', 'No se pudo iniciar sesión con huella. Usa tu contraseña.');
      console.log(error);
    } finally {
      setCargando(false);
    }
  };

  const handleRecuperar = () => {
    Alert.alert(
      'Recuperar contraseña',
      'Por seguridad, pídele al administrador de la app que resetee tu contraseña. Solo se puede hacer desde la consola de Firebase.',
      [{ text: 'Entendido' }]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboard}
      >
        <View style={styles.content}>
          <Image
            source={require('../../assets/images/pelua.jpg')}
            style={styles.logoImage}
            resizeMode="cover"
          />
          <Text style={[styles.title, { color: colors.primary, fontFamily: fonts.bold }]}>
            PerritaApp
          </Text>
          <Text style={[styles.subtitle, { color: colors.subtext, fontFamily: fonts.regular }]}>
            Inicia sesión para continuar
          </Text>

          <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="person-outline" size={20} color={colors.subtext} />
            <TextInput
              placeholder="Nombre de usuario"
              placeholderTextColor={colors.subtext}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              style={[styles.input, { color: colors.text, fontFamily: fonts.regular }]}
            />
          </View>

          <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="lock-closed-outline" size={20} color={colors.subtext} />
            <TextInput
              placeholder="Contraseña"
              placeholderTextColor={colors.subtext}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!verPassword}
              style={[styles.input, { color: colors.text, fontFamily: fonts.regular }]}
            />
            <TouchableOpacity onPress={() => setVerPassword(!verPassword)}>
              <Ionicons
                name={verPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color={colors.subtext}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.mainButton, { backgroundColor: colors.primary }]}
            onPress={handleLogin}
            disabled={cargando}
          >
            {cargando ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={[styles.mainButtonText, { fontFamily: fonts.semiBold }]}>
                Entrar
              </Text>
            )}
          </TouchableOpacity>

          {biometriaDisponible && biometriaActiva && (
            <TouchableOpacity
              style={[styles.bioButton, { borderColor: colors.primary }]}
              onPress={handleHuella}
              disabled={cargando}
            >
              <Ionicons name="finger-print" size={24} color={colors.primary} />
              <Text style={[styles.bioText, { color: colors.primary, fontFamily: fonts.semiBold }]}>
                Entrar con huella
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity onPress={handleRecuperar} style={styles.linkButton}>
            <Text style={[styles.linkText, { color: colors.subtext, fontFamily: fonts.regular }]}>
              ¿Olvidaste tu contraseña?
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/registro')} style={styles.linkButton}>
            <Text style={[styles.linkText, { color: colors.primary, fontFamily: fonts.semiBold }]}>
              ¿No tienes cuenta? Crear una
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboard: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', padding: 24, maxWidth: 500, alignSelf: 'center', width: '100%' },
  logoImage: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignSelf: 'center',
    marginBottom: 16,
    borderWidth: 4,
    borderColor: '#E91E63',
  },
  title: { fontSize: 32, textAlign: 'center', marginBottom: 4 },
  subtitle: { fontSize: 15, textAlign: 'center', marginBottom: 32 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 14,
    gap: 10,
  },
  input: { flex: 1, paddingVertical: 14, fontSize: 16 },
  mainButton: {
    padding: 18,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 10,
    elevation: 3,
  },
  mainButtonText: { color: '#FFF', fontSize: 17 },
  bioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    marginTop: 14,
  },
  bioText: { fontSize: 16 },
  linkButton: { marginTop: 16, alignItems: 'center' },
  linkText: { fontSize: 15 },
});