import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView,
  KeyboardAvoidingView, Platform, Alert, ActivityIndicator, Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { fonts } from '../../context/typography';

export default function RegistroScreen() {
  const { colors } = useTheme();
  const { registrar } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleRegistro = async () => {
    if (!username || !password || !confirm) {
      Alert.alert('Faltan datos', 'Rellena todos los campos');
      return;
    }
    if (username.length < 3) {
      Alert.alert('Usuario muy corto', 'Debe tener al menos 3 caracteres');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Contraseña muy corta', 'Debe tener al menos 6 caracteres');
      return;
    }
    if (password !== confirm) {
      Alert.alert('Contraseñas no coinciden', 'Verifica tu contraseña');
      return;
    }

    setCargando(true);
    try {
      await registrar(username, password);
      router.replace('/');
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        Alert.alert('Usuario en uso', 'Ese nombre de usuario ya está registrado');
      } else {
        Alert.alert('Error', 'No se pudo crear la cuenta. Intenta de nuevo.');
      }
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
            Crear cuenta
          </Text>
          <Text style={[styles.subtitle, { color: colors.subtext, fontFamily: fonts.regular }]}>
            Solo necesitas un nombre y contraseña
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
              placeholder="Contraseña (mín. 6 caracteres)"
              placeholderTextColor={colors.subtext}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={[styles.input, { color: colors.text, fontFamily: fonts.regular }]}
            />
          </View>

          <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="lock-closed-outline" size={20} color={colors.subtext} />
            <TextInput
              placeholder="Confirmar contraseña"
              placeholderTextColor={colors.subtext}
              value={confirm}
              onChangeText={setConfirm}
              secureTextEntry
              style={[styles.input, { color: colors.text, fontFamily: fonts.regular }]}
            />
          </View>

          <TouchableOpacity
            style={[styles.mainButton, { backgroundColor: colors.primary }]}
            onPress={handleRegistro}
            disabled={cargando}
          >
            {cargando ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={[styles.mainButtonText, { fontFamily: fonts.semiBold }]}>
                Crear cuenta
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={handleRecuperar} style={styles.linkButton}>
            <Text style={[styles.linkText, { color: colors.subtext, fontFamily: fonts.regular }]}>
              ¿Olvidaste tu contraseña?
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.back()} style={styles.linkButton}>
            <Text style={[styles.linkText, { color: colors.primary, fontFamily: fonts.semiBold }]}>
              Ya tengo cuenta. Iniciar sesión
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
    width: 120,
    height: 120,
    borderRadius: 60,
    alignSelf: 'center',
    marginBottom: 16,
    borderWidth: 4,
    borderColor: '#E91E63',
  },
  title: { fontSize: 28, textAlign: 'center', marginBottom: 4 },
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
  linkButton: { marginTop: 16, alignItems: 'center' },
  linkText: { fontSize: 15 },
});