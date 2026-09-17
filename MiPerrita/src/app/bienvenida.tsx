import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { fonts } from '../../context/typography';
import { marcarBienvenidaVista } from '../../context/bienvenida';

const PASOS = [
  {
    icono: 'paw',
    titulo: 'Bienvenido a PerritaApp',
    descripcion: 'La app para que entre todos cuidemos a nuestra perrita. 🐶',
  },
  {
    icono: 'checkmark-circle',
    titulo: 'Registra las comidas',
    descripcion: 'Marca si desayunó, almorzó o cenó. Todos lo verán en tiempo real. ✅',
  },
  {
    icono: 'notifications',
    titulo: 'Recibe notificaciones',
    descripcion: 'Cuando alguien registre una comida, te llegará una notificación al teléfono. 🔔',
  },
];

export default function BienvenidaScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [paso, setPaso] = useState(0);

  const siguiente = async () => {
    if (paso < PASOS.length - 1) {
      setPaso(paso + 1);
    } else {
      await marcarBienvenidaVista();
      router.replace('/');
    }
  };

  const saltar = async () => {
    await marcarBienvenidaVista();
    router.replace('/');
  };

  const actual = PASOS[paso];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Image
          source={require('../../assets/images/pelua.jpg')}
          style={styles.logoImage}
          resizeMode="cover"
        />

        <View style={[styles.iconContainer, { backgroundColor: colors.primaryLight }]}>
          <Ionicons name={actual.icono as any} size={48} color={colors.primary} />
        </View>

        <Text style={[styles.titulo, { color: colors.text, fontFamily: fonts.bold }]}>
          {actual.titulo}
        </Text>
        <Text style={[styles.descripcion, { color: colors.subtext, fontFamily: fonts.regular }]}>
          {actual.descripcion}
        </Text>

        <View style={styles.dotsRow}>
          {PASOS.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  backgroundColor: i === paso ? colors.primary : colors.border,
                  width: i === paso ? 24 : 8,
                },
              ]}
            />
          ))}
        </View>

        <TouchableOpacity
          style={[styles.mainButton, { backgroundColor: colors.primary }]}
          onPress={siguiente}
        >
          <Text style={[styles.mainButtonText, { fontFamily: fonts.semiBold }]}>
            {paso === PASOS.length - 1 ? 'Empezar' : 'Siguiente'}
          </Text>
        </TouchableOpacity>

        {paso < PASOS.length - 1 && (
          <TouchableOpacity onPress={saltar} style={styles.skipButton}>
            <Text style={[styles.skipText, { color: colors.subtext, fontFamily: fonts.regular }]}>
              Saltar
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  logoImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 24,
    borderWidth: 4,
    borderColor: '#E91E63',
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  titulo: { fontSize: 26, textAlign: 'center', marginBottom: 12 },
  descripcion: { fontSize: 16, textAlign: 'center', lineHeight: 22, marginBottom: 40 },
  dotsRow: { flexDirection: 'row', gap: 8, marginBottom: 32 },
  dot: { height: 8, borderRadius: 4 },
  mainButton: {
    paddingVertical: 16,
    paddingHorizontal: 60,
    borderRadius: 14,
    elevation: 3,
  },
  mainButtonText: { color: '#FFF', fontSize: 17 },
  skipButton: { marginTop: 16 },
  skipText: { fontSize: 15 },
});