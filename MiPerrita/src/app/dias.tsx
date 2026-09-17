import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { fonts } from '../../context/typography';

const DIAS = [
  { key: 'lunes', label: 'Lunes' },
  { key: 'martes', label: 'Martes' },
  { key: 'miercoles', label: 'Miércoles' },
  { key: 'jueves', label: 'Jueves' },
  { key: 'viernes', label: 'Viernes' },
  { key: 'sabado', label: 'Sábado' },
  { key: 'domingo', label: 'Domingo' },
];

export default function DiasScreen() {
  const { colors } = useTheme();
  const router = useRouter();

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
          📅 Días de la semana
        </Text>
        <Text style={[styles.subtitle, { color: colors.subtext, fontFamily: fonts.regular }]}>
          Toca un día para registrar las comidas
        </Text>

        {DIAS.map((dia) => (
          <TouchableOpacity
            key={dia.key}
            style={[styles.dayCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => router.push(`/dia/${dia.key}`)}
          >
            <Text style={[styles.dayText, { color: colors.text, fontFamily: fonts.semiBold }]}>
              {dia.label}
            </Text>
            <Ionicons name="chevron-forward" size={22} color={colors.primary} />
          </TouchableOpacity>
        ))}
      </ScrollView>
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
  title: { fontSize: 26, marginBottom: 8 },
  subtitle: { fontSize: 14, marginBottom: 20 },
  dayCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
    borderRadius: 15,
    borderWidth: 1,
    marginBottom: 12,
    elevation: 2,
  },
  dayText: { fontSize: 18 },
});