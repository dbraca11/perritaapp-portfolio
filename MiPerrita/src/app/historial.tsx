import React, { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView,
  ScrollView, ActivityIndicator, RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { collection, getDocs } from 'firebase/firestore';
import { useTheme } from '../../context/ThemeContext';
import { db } from '../../context/firebase';
import { fonts } from '../../context/typography';

const DIAS_SEMANA = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];

type RegistroDia = {
  fecha: Date;
  dia: string;
  comidas: {
    desayuno?: { comio: boolean; registradoPor?: string; hora?: string };
    almuerzo?: { comio: boolean; registradoPor?: string; hora?: string };
    cena?: { comio: boolean; registradoPor?: string; hora?: string };
  };
};

export default function HistorialScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [registros, setRegistros] = useState<RegistroDia[]>([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);

  useEffect(() => {
    cargarHistorial();
  }, []);

  const cargarHistorial = async () => {
    try {
      const hoy = new Date();
      const dias: RegistroDia[] = [];

      for (let i = 6; i >= 0; i--) {
        const fecha = new Date(hoy);
        fecha.setDate(hoy.getDate() - i);
        const diaSemana = DIAS_SEMANA[fecha.getDay()];

        dias.push({
          fecha,
          dia: diaSemana,
          comidas: {},
        });
      }

      const comidasRef = collection(db, 'comidas');
      const snapshot = await getDocs(comidasRef);

      snapshot.forEach((doc) => {
        const data = doc.data();
        const diaData = dias.find((d) => d.dia === data.dia);
        if (diaData) {
          const hora = data.timestamp?.toDate?.()
            ? data.timestamp.toDate().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
            : undefined;

          diaData.comidas[data.comida as keyof typeof diaData.comidas] = {
            comio: data.comio,
            registradoPor: data.registradoPor,
            hora,
          };
        }
      });

      setRegistros(dias);
    } catch (error) {
      console.error('Error cargando historial:', error);
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  };

  const onRefresh = () => {
    setRefrescando(true);
    cargarHistorial();
  };

  const formatearFecha = (fecha: Date) => {
    return fecha.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
    });
  };

  // Estadísticas semanales
  const calcularEstadisticas = () => {
    let totalComidas = 0;
    let comidasRegistradas = 0;

    registros.forEach((r) => {
      ['desayuno', 'almuerzo', 'cena'].forEach((key) => {
        totalComidas++;
        const c = r.comidas[key as keyof typeof r.comidas];
        if (c && c.comio === true) comidasRegistradas++;
      });
    });

    const porcentaje = totalComidas > 0 ? Math.round((comidasRegistradas / totalComidas) * 100) : 0;
    return { comidasRegistradas, totalComidas, porcentaje };
  };

  const stats = calcularEstadisticas();
  const hayDatos = registros.some((r) => Object.keys(r.comidas).length > 0);

  const renderIcono = (comida: any) => {
    if (!comida) {
      return <Ionicons name="ellipse-outline" size={24} color={colors.border} />;
    }
    if (comida.comio === true) {
      return <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />;
    }
    return <Ionicons name="close-circle" size={24} color="#E53935" />;
  };

  const getQuien = (comida: any) => {
    if (!comida?.registradoPor) return '';
    const nombre = comida.registradoPor;
    return nombre.charAt(0).toUpperCase() + nombre.slice(1);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refrescando}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
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
          📊 Historial
        </Text>
        <Text style={[styles.subtitle, { color: colors.subtext, fontFamily: fonts.regular }]}>
          Últimos 7 días · Desliza para refrescar
        </Text>

        {cargando ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
        ) : !hayDatos ? (
          <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="paw-outline" size={64} color={colors.primary} />
            <Text style={[styles.emptyTitle, { color: colors.text, fontFamily: fonts.semiBold }]}>
              Aún no hay registros
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.subtext, fontFamily: fonts.regular }]}>
              Cuando registren las comidas de la perrita, aparecerán aquí.
            </Text>
          </View>
        ) : (
          <>
            {/* Estadísticas semanales */}
            <View style={[styles.statsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.statsRow}>
                <View style={styles.statsItem}>
                  <Text style={[styles.statsValue, { color: colors.primary, fontFamily: fonts.bold }]}>
                    {stats.comidasRegistradas}
                  </Text>
                  <Text style={[styles.statsLabel, { color: colors.subtext, fontFamily: fonts.regular }]}>
                    Comidas
                  </Text>
                </View>
                <View style={[styles.statsDivider, { backgroundColor: colors.border }]} />
                <View style={styles.statsItem}>
                  <Text style={[styles.statsValue, { color: colors.primary, fontFamily: fonts.bold }]}>
                    {stats.totalComidas}
                  </Text>
                  <Text style={[styles.statsLabel, { color: colors.subtext, fontFamily: fonts.regular }]}>
                    Esperadas
                  </Text>
                </View>
                <View style={[styles.statsDivider, { backgroundColor: colors.border }]} />
                <View style={styles.statsItem}>
                  <Text style={[styles.statsValue, { color: colors.primary, fontFamily: fonts.bold }]}>
                    {stats.porcentaje}%
                  </Text>
                  <Text style={[styles.statsLabel, { color: colors.subtext, fontFamily: fonts.regular }]}>
                    Cumplido
                  </Text>
                </View>
              </View>
            </View>

            {registros.map((registro, index) => {
              const comidas = registro.comidas;
              const totalComidas = [comidas.desayuno, comidas.almuerzo, comidas.cena].filter(
                (v) => v?.comio === true
              ).length;

              return (
                <View
                  key={index}
                  style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
                >
                  <View style={styles.cardHeader}>
                    <View>
                      <Text style={[styles.diaText, { color: colors.text, fontFamily: fonts.bold }]}>
                        {registro.dia.charAt(0).toUpperCase() + registro.dia.slice(1)}
                      </Text>
                      <Text style={[styles.fechaText, { color: colors.subtext, fontFamily: fonts.regular }]}>
                        {formatearFecha(registro.fecha)}
                      </Text>
                    </View>
                    <View style={[styles.badge, { backgroundColor: colors.primaryLight }]}>
                      <Text style={[styles.badgeText, { color: colors.primary, fontFamily: fonts.bold }]}>
                        {totalComidas}/3
                      </Text>
                    </View>
                  </View>

                  <View style={styles.comidasRow}>
                    <View style={styles.comidaItem}>
                      {renderIcono(comidas.desayuno)}
                      <Text style={[styles.comidaLabel, { color: colors.subtext, fontFamily: fonts.regular }]}>
                        Desayuno
                      </Text>
                      {comidas.desayuno?.registradoPor && (
                        <Text style={[styles.comidaQuien, { color: colors.primary, fontFamily: fonts.regular }]}>
                          {getQuien(comidas.desayuno)}
                        </Text>
                      )}
                    </View>

                    <View style={styles.comidaItem}>
                      {renderIcono(comidas.almuerzo)}
                      <Text style={[styles.comidaLabel, { color: colors.subtext, fontFamily: fonts.regular }]}>
                        Almuerzo
                      </Text>
                      {comidas.almuerzo?.registradoPor && (
                        <Text style={[styles.comidaQuien, { color: colors.primary, fontFamily: fonts.regular }]}>
                          {getQuien(comidas.almuerzo)}
                        </Text>
                      )}
                    </View>

                    <View style={styles.comidaItem}>
                      {renderIcono(comidas.cena)}
                      <Text style={[styles.comidaLabel, { color: colors.subtext, fontFamily: fonts.regular }]}>
                        Cena
                      </Text>
                      {comidas.cena?.registradoPor && (
                        <Text style={[styles.comidaQuien, { color: colors.primary, fontFamily: fonts.regular }]}>
                          {getQuien(comidas.cena)}
                        </Text>
                      )}
                    </View>
                  </View>
                </View>
              );
            })}
          </>
        )}
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
  title: { fontSize: 28, marginBottom: 4 },
  subtitle: { fontSize: 14, marginBottom: 20 },
  emptyCard: {
    padding: 40,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    marginTop: 20,
  },
  emptyTitle: { fontSize: 20, marginTop: 16, marginBottom: 8 },
  emptySubtitle: { fontSize: 14, textAlign: 'center' },
  statsCard: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statsItem: { alignItems: 'center', flex: 1 },
  statsValue: { fontSize: 24 },
  statsLabel: { fontSize: 12, marginTop: 2 },
  statsDivider: { width: 1, height: 40 },
  card: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  diaText: { fontSize: 18 },
  fechaText: { fontSize: 13, marginTop: 2 },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: { fontSize: 14 },
  comidasRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  comidaItem: {
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  comidaLabel: { fontSize: 11 },
  comidaQuien: { fontSize: 10, fontWeight: '600' },
});