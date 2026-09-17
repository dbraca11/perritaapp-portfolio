import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';

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
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={[styles.backText, { color: colors.primary }]}>‹ Volver</Text>
        </TouchableOpacity>

        <Text style={[styles.title, { color: colors.primary }]}>📅 Días de la semana</Text>
        <Text style={[styles.subtitle, { color: colors.subtext }]}>
          Toca un día para registrar las comidas
        </Text>

        {DIAS.map((dia) => (
          <TouchableOpacity
            key={dia.key}
            style={[styles.dayCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => router.push(`/dia/${dia.key}`)}
          >
            <Text style={[styles.dayText, { color: colors.text }]}>{dia.label}</Text>
            <Text style={[styles.arrow, { color: colors.primary }]}>›</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 20 },
  backButton: { marginBottom: 10 },
  backText: { fontSize: 18, fontWeight: '600' },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 8 },
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
  dayText: { fontSize: 18, fontWeight: '600' },
  arrow: { fontSize: 28, fontWeight: 'bold' },
});