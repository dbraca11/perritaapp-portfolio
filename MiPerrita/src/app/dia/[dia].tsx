import React, { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView,
  ActivityIndicator, Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { collection, doc, setDoc, onSnapshot, query, where, serverTimestamp } from 'firebase/firestore';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../context/ThemeContext';
import { useAuth } from '../../../context/AuthContext';
import { db } from '../../../context/firebase';
import { fonts } from '../../../context/typography';
import { enviarNotificacionAOtros } from '../../../context/notifications';

const COMIDAS = [
  { key: 'desayuno', label: 'Desayuno', icono: 'sunny-outline', notif: 'La perrita ya desayunó' },
  { key: 'almuerzo', label: 'Almuerzo', icono: 'restaurant-outline', notif: 'La perrita ya almorzó' },
  { key: 'cena', label: 'Cena', icono: 'moon-outline', notif: 'La perrita ya cenó' },
];

export default function DiaScreen() {
  const { dia } = useLocalSearchParams<{ dia: string }>();
  const { colors } = useTheme();
  const { user, username } = useAuth();
  const router = useRouter();
  const [estados, setEstados] = useState<Record<string, boolean>>({});
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState<string | null>(null);

  useEffect(() => {
    if (!dia) return;

    const q = query(
      collection(db, 'comidas'),
      where('dia', '==', dia)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const datos: Record<string, boolean> = {};
      snapshot.forEach((doc) => {
        const d = doc.data();
        datos[d.comida] = d.comio;
      });
      setEstados(datos);
      setCargando(false);
    });

    return () => unsubscribe();
  }, [dia]);

  const registrar = async (comidaKey: string, comio: boolean) => {
    if (!user || enviando) return;

    // Evitar doble tap: no hacer nada si el estado ya es el mismo
    if (estados[comidaKey] === comio) return;

    setEnviando(comidaKey);

    if (comio) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }

    setEstados((prev) => ({ ...prev, [comidaKey]: comio }));

    try {
      const docId = `${dia}_${comidaKey}`;
      await setDoc(doc(db, 'comidas', docId), {
        dia,
        comida: comidaKey,
        comio,
        registradoPor: username || user.uid,
        timestamp: serverTimestamp(),
      });

      const comida = COMIDAS.find((c) => c.key === comidaKey);
      if (comio && comida && username) {
        Alert.alert('✅ Registrado', comida.notif);
        await enviarNotificacionAOtros(username, '🐶 PerritaApp', comida.notif);
      }
    } catch (error) {
      console.error('Error al guardar:', error);
      Alert.alert('Error', 'No se pudo guardar. Revisa tu conexión.');
      setEstados((prev) => ({ ...prev, [comidaKey]: !comio }));
    } finally {
      setEnviando(null);
    }
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
          {String(dia).charAt(0).toUpperCase() + String(dia).slice(1)}
        </Text>

        {cargando ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
        ) : (
          COMIDAS.map((comida) => {
            const estado = estados[comida.key];
            const estaEnviando = enviando === comida.key;

            return (
              <View
                key={comida.key}
                style={[styles.mealCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <View style={styles.mealHeader}>
                  <Ionicons name={comida.icono as any} size={26} color={colors.primary} />
                  <Text style={[styles.mealTitle, { color: colors.text, fontFamily: fonts.semiBold }]}>
                    {comida.label}
                  </Text>
                  {estaEnviando && (
                    <ActivityIndicator size="small" color={colors.primary} style={{ marginLeft: 'auto' }} />
                  )}
                </View>

                <View style={styles.buttonsRow}>
                  <TouchableOpacity
                    style={[
                      styles.checkButton,
                      {
                        backgroundColor: estado === true ? '#4CAF50' : colors.background,
                        borderColor: colors.border,
                      },
                    ]}
                    onPress={() => registrar(comida.key, true)}
                    disabled={estaEnviando}
                  >
                    <Ionicons
                      name="checkmark-circle"
                      size={28}
                      color={estado === true ? '#FFF' : colors.subtext}
                    />
                    <Text
                      style={[
                        styles.buttonLabel,
                        { color: estado === true ? '#FFF' : colors.text, fontFamily: fonts.semiBold },
                      ]}
                    >
                      Comió
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.checkButton,
                      {
                        backgroundColor: estado === false ? '#E53935' : colors.background,
                        borderColor: colors.border,
                      },
                    ]}
                    onPress={() => registrar(comida.key, false)}
                    disabled={estaEnviando}
                  >
                    <Ionicons
                      name="close-circle"
                      size={28}
                      color={estado === false ? '#FFF' : colors.subtext}
                    />
                    <Text
                      style={[
                        styles.buttonLabel,
                        { color: estado === false ? '#FFF' : colors.text, fontFamily: fonts.semiBold },
                      ]}
                    >
                      No comió
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 20 },
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
  mealCard: {
    padding: 18,
    borderRadius: 15,
    borderWidth: 1,
    marginBottom: 16,
    elevation: 2,
  },
  mealHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  mealTitle: { fontSize: 20 },
  buttonsRow: { flexDirection: 'row', gap: 12 },
  checkButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    gap: 4,
  },
  buttonLabel: { fontSize: 14 },
});S