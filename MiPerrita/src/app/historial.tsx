import React, { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView,
  ScrollView, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { useTheme } from '../../context/ThemeContext';
import { db } from '../../context/firebase';
import { fonts } from '../../context/typography';

const DIAS_SEMANA = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];

type RegistroDia = {
  fecha: Date;
  dia: string;
  comidas: { desayuno?: boolean; almuerzo?: boolean; cena?: boolean };
};

export default function HistorialScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [registros, setRegistros] = useState<RegistroDia[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarHistorial();
  }, []);

  const cargarHistorial = async () => {
    try {
      // Calcular los últimos 7 días
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

      // Cargar los registros de Firestore
      const comidasRef = collection(db, 'comidas');
      const snapshot = await getDocs(comidasRef);

      snapshot.forEach((doc) => {
        const data = doc.data();
        const diaData = dias.find((d) => d.dia === data.dia);
        if (diaData) {
          diaData.comidas[data.comida as keyof typeof diaData.comidas] = data.comio;
        }
      });

      setRegistros(dias);
    } catch (error) {
      console.error('Error cargando historial:', error);
    } finally {
      setCargando(false);
    }
  };

  const formatearFecha = (fecha: Date) => {
    return fecha.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
    });
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
          📊 Historial
        </Text>
        <Text style={[styles.subtitle, { color: colors.subtext, fontFamily: fonts.regular }]}>
          Últimos 7 días
        </Text>

        {cargando ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
        ) : (
          registros.map((registro, index) => {
            const comidas = registro.comidas;
            const totalComidas = [comidas.desayuno, comidas.almuerzo, comidas.cena].filter(
              (v) => v === true
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
                    <Ionicons
                      name={comidas.desayuno === true ? 'checkmark-circle' : comidas.desayuno === false ? 'close-circle' : 'ellipse-outline'}
                      size={24}
                      color={comidas.desayuno === true ? '#4CAF50' : comidas.desayuno === false ? '#E53935' : colors.border}
                    />
                    <Text style={[styles.comidaLabel, { color: colors.subtext, fontFamily: fonts.regular }]}>
                      Desayuno
                    </Text>
                  </View>

                  <View style={styles.comidaItem}>
                    <Ionicons
                      name={comidas.almuerzo === true ? 'checkmark-circle' : comidas.almuerzo === false ? 'close-circle' : 'ellipse-outline'}
                      size={24}
                      color={comidas.almuerzo === true ? '#4CAF50' : comidas.almuerzo === false ? '#E53935' : colors.border}
                    />
                    <Text style={[styles.comidaLabel, { color: colors.subtext, fontFamily: fonts.regular }]}>
                      Almuerzo
                    </Text>
                  </View>

                  <View style={styles.comidaItem}>
                    <Ionicons
                      name={comidas.cena === true ? 'checkmark-circle' : comidas.cena === false ? 'close-circle' : 'ellipse-outline'}
                      size={24}
                      color={comidas.cena === true ? '#4CAF50' : comidas.cena === false ? '#E53935' : colors.border}
                    />
                    <Text style={[styles.comidaLabel, { color: colors.subtext, fontFamily: fonts.regular }]}>
                      Cena
                    </Text>
                  </View>
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
  title: { fontSize: 28, marginBottom: 4 },
  subtitle: { fontSize: 14, marginBottom: 20 },
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
  },
  comidaLabel: { fontSize: 11 },
});