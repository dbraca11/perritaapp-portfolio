import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Image, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { fonts } from '../../context/typography';

const DIAS_SEMANA = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];

export default function HomeScreen() {
  const { isDark, toggleTheme, colors } = useTheme();
  const router = useRouter();

  const hoy = new Date();
  const diaHoy = DIAS_SEMANA[hoy.getDay()];
  const nombreDiaHoy = diaHoy.charAt(0).toUpperCase() + diaHoy.slice(1);
  const fechaHoy = hoy.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.primary, fontFamily: fonts.bold }]}>
            🐶 PerritaApp
          </Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity
              onPress={toggleTheme}
              style={[styles.themeButton, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }]}
            >
              <Text style={{ fontSize: 20 }}>{isDark ? '☀️' : '🌙'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push('/ajustes')}
              style={[styles.themeButton, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }]}
            >
              <Ionicons name="settings-outline" size={22} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.photoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Image
            source={require('../../assets/images/pelua.jpg')}
            style={styles.photo}
            resizeMode="contain"
          />
          <Text style={[styles.photoCaption, { color: colors.subtext, fontFamily: fonts.regular }]}>
            Nuestra perrita 💕
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => router.push(`/dia/${diaHoy}`)}
          activeOpacity={0.9}
          style={styles.todayCard}
        >
          <LinearGradient
            colors={['#F06292', '#E91E63', '#C2185B']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.todayGradient}
          >
            <View style={styles.todayHeader}>
              <View>
                <Text style={[styles.todayLabel, { fontFamily: fonts.semiBold }]}>HOY</Text>
                <Text style={[styles.todayDay, { fontFamily: fonts.bold }]}>{nombreDiaHoy}</Text>
                <Text style={[styles.todayDate, { fontFamily: fonts.regular }]}>{fechaHoy}</Text>
              </View>
              <Ionicons name="restaurant" size={56} color="#FFF" />
            </View>
            <View style={styles.todayFooter}>
              <Text style={[styles.todayCta, { fontFamily: fonts.semiBold }]}>
                Registrar comidas del día
              </Text>
              <Ionicons name="chevron-forward" size={24} color="#FFF" />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.quickRow}>
          <TouchableOpacity
            style={[styles.quickCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => router.push('/dias')}
            activeOpacity={0.85}
          >
            <Ionicons name="calendar-outline" size={32} color={colors.primary} style={{ marginBottom: 8 }} />
            <Text style={[styles.quickTitle, { color: colors.text, fontFamily: fonts.semiBold }]}>Semana</Text>
            <Text style={[styles.quickSubtitle, { color: colors.subtext, fontFamily: fonts.regular }]}>
              Los 7 días
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => router.push('/historial')}
            activeOpacity={0.85}
          >
            <Ionicons name="stats-chart-outline" size={32} color={colors.primary} style={{ marginBottom: 8 }} />
            <Text style={[styles.quickTitle, { color: colors.text, fontFamily: fonts.semiBold }]}>Historial</Text>
            <Text style={[styles.quickSubtitle, { color: colors.subtext, fontFamily: fonts.regular }]}>
              Últimos 7 días
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 20 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: { fontSize: 28 },
  themeButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  photoCard: {
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 1,
    elevation: 3,
  },
  photo: {
    width: '100%',
    height: 280,
    backgroundColor: '#000',
  },
  photoCaption: {
    textAlign: 'center',
    padding: 10,
    fontSize: 14,
    fontStyle: 'italic',
  },
  todayCard: {
    borderRadius: 20,
    marginBottom: 18,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#E91E63',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  todayGradient: {
    padding: 22,
  },
  todayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  todayLabel: { color: '#FFF', fontSize: 12, letterSpacing: 2, opacity: 0.9 },
  todayDay: { color: '#FFF', fontSize: 32, marginTop: 4 },
  todayDate: { color: '#FFF', fontSize: 14, opacity: 0.85, marginTop: 2 },
  todayFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.3)',
    paddingTop: 14,
  },
  todayCta: { color: '#FFF', fontSize: 15 },
  quickRow: { flexDirection: 'row', gap: 12 },
  quickCard: {
    flex: 1,
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    elevation: 2,
  },
  quickTitle: { fontSize: 16, marginBottom: 2 },
  quickSubtitle: { fontSize: 12 },
});