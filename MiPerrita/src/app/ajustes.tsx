import React, { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView,
  ScrollView, Switch, Alert, Modal, TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { fonts } from '../../context/typography';

export default function AjustesScreen() {
  const { colors, isDark, toggleTheme } = useTheme();
  const { username, logout } = useAuth();
  const router = useRouter();

  const [biometriaDisponible, setBiometriaDisponible] = useState(false);
  const [biometriaActiva, setBiometriaActiva] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [passwordTemp, setPasswordTemp] = useState('');

  useEffect(() => {
    (async () => {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolado = await LocalAuthentication.isEnrolledAsync();
      setBiometriaDisponible(compatible && enrolado);

      const activa = await AsyncStorage.getItem('biometria_activa');
      setBiometriaActiva(activa === 'true');
    })();
  }, []);

  const toggleBiometria = async (valor: boolean) => {
    if (valor) {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Confirma tu identidad para activar la huella',
        fallbackLabel: 'Usar contraseña',
        cancelLabel: 'Cancelar',
      });
      if (!result.success) return;

      setPasswordTemp('');
      setModalVisible(true);
    } else {
      await SecureStore.deleteItemAsync('biometria_password');
      await SecureStore.deleteItemAsync('biometria_username');
      await AsyncStorage.setItem('biometria_activa', 'false');
      setBiometriaActiva(false);
      Alert.alert('Huella desactivada', 'Ya no se te pedirá huella al abrir la app.');
    }
  };

  const confirmarPassword = async () => {
    if (!passwordTemp) {
      Alert.alert('Error', 'Necesitas escribir tu contraseña');
      return;
    }

    await SecureStore.setItemAsync('biometria_password', passwordTemp);
    await SecureStore.setItemAsync('biometria_username', username || '');
    await AsyncStorage.setItem('biometria_activa', 'true');
    setBiometriaActiva(true);
    setModalVisible(false);
    setPasswordTemp('');

    Alert.alert(
      '✅ Huella activada',
      'La próxima vez que abras la app podrás entrar con tu huella.'
    );
  };

  const cancelarModal = () => {
    setModalVisible(false);
    setPasswordTemp('');
  };

  const cerrarSesion = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Seguro que quieres salir? Tu huella seguirá activada.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Salir',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backButton, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }]}
        >
          <Ionicons name="chevron-back" size={22} color={colors.primary} />
          <Text style={[styles.backText, { color: colors.primary, fontFamily: fonts.semiBold }]}>
            Volver
          </Text>
        </TouchableOpacity>

        <Text style={[styles.title, { color: colors.primary, fontFamily: fonts.bold }]}>
          Ajustes
        </Text>

        <Text style={[styles.sectionLabel, { color: colors.subtext, fontFamily: fonts.regular }]}>
          Cuenta
        </Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.row}>
            <Ionicons name="person-circle-outline" size={24} color={colors.primary} />
            <Text style={[styles.rowLabel, { color: colors.text, fontFamily: fonts.regular }]}>
              Usuario: {username}
            </Text>
          </View>
        </View>

        <Text style={[styles.sectionLabel, { color: colors.subtext, fontFamily: fonts.regular }]}>
          Apariencia
        </Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.row}>
            <Ionicons name={isDark ? 'moon' : 'sunny'} size={24} color={colors.primary} />
            <Text style={[styles.rowLabel, { color: colors.text, fontFamily: fonts.regular }]}>
              Modo oscuro
            </Text>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor={isDark ? colors.primary : '#FFF'}
            />
          </View>
        </View>

        <Text style={[styles.sectionLabel, { color: colors.subtext, fontFamily: fonts.regular }]}>
          Seguridad
        </Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.row}>
            <Ionicons name="finger-print" size={24} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.rowLabel, { color: colors.text, fontFamily: fonts.regular }]}>
                Huella / Face ID
              </Text>
              {!biometriaDisponible && (
                <Text style={[styles.rowSub, { color: colors.subtext, fontFamily: fonts.regular }]}>
                  No disponible en este dispositivo
                </Text>
              )}
              {biometriaDisponible && !biometriaActiva && (
                <Text style={[styles.rowSub, { color: colors.subtext, fontFamily: fonts.regular }]}>
                  Actívala para entrar sin contraseña
                </Text>
              )}
              {biometriaDisponible && biometriaActiva && (
                <Text style={[styles.rowSub, { color: colors.primary, fontFamily: fonts.regular }]}>
                  Activada ✅
                </Text>
              )}
            </View>
            <Switch
              value={biometriaActiva}
              onValueChange={toggleBiometria}
              disabled={!biometriaDisponible}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor={biometriaActiva ? colors.primary : '#FFF'}
            />
          </View>
        </View>

        <Text style={[styles.sectionLabel, { color: colors.subtext, fontFamily: fonts.regular }]}>
          Acerca de
        </Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.row}>
            <Ionicons name="information-circle-outline" size={24} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.rowLabel, { color: colors.text, fontFamily: fonts.regular }]}>
                PerritaApp v1.0.0
              </Text>
              <Text style={[styles.rowSub, { color: colors.subtext, fontFamily: fonts.regular }]}>
                Desarrollada por Darwin Braca usando React Native, Expo, Firebase y EAS Build. Con cariño para nuestra perrita. 💕
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.logoutButton, { borderColor: '#E53935' }]}
          onPress={cerrarSesion}
        >
          <Ionicons name="log-out-outline" size={22} color="#E53935" />
          <Text style={[styles.logoutText, { fontFamily: fonts.semiBold }]}>
            Cerrar sesión
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal para pedir la contraseña */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={cancelarModal}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text, fontFamily: fonts.bold }]}>
              Confirma tu contraseña
            </Text>
            <Text style={[styles.modalSubtitle, { color: colors.subtext, fontFamily: fonts.regular }]}>
              Para activar la huella, escribe tu contraseña. Se guardará cifrada en tu teléfono.
            </Text>

            <TextInput
              placeholder="Contraseña"
              placeholderTextColor={colors.subtext}
              value={passwordTemp}
              onChangeText={setPasswordTemp}
              secureTextEntry
              autoFocus
              style={[
                styles.modalInput,
                { color: colors.text, backgroundColor: colors.background, borderColor: colors.border, fontFamily: fonts.regular },
              ]}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { borderColor: colors.border }]}
                onPress={cancelarModal}
              >
                <Text style={[styles.modalButtonText, { color: colors.text, fontFamily: fonts.semiBold }]}>
                  Cancelar
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.primary, borderColor: colors.primary }]}
                onPress={confirmarPassword}
              >
                <Text style={[styles.modalButtonText, { color: '#FFF', fontFamily: fonts.semiBold }]}>
                  Activar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 20, maxWidth: 600, alignSelf: 'center', width: '100%' },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
    gap: 4,
  },
  backText: { fontSize: 16 },
  title: { fontSize: 28, marginBottom: 20 },
  sectionLabel: { fontSize: 13, marginTop: 10, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 },
  card: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowLabel: { fontSize: 16 },
  rowSub: { fontSize: 12, marginTop: 2, lineHeight: 16 },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    marginTop: 30,
  },
  logoutText: { color: '#E53935', fontSize: 16 },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 500,
    borderRadius: 20,
    padding: 24,
    elevation: 10,
  },
  modalTitle: { fontSize: 20, marginBottom: 8 },
  modalSubtitle: { fontSize: 14, marginBottom: 20 },
  modalInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  modalButtonText: { fontSize: 16 },
});