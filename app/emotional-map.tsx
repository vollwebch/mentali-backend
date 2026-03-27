import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../ThemeContext';
import { useThoughts } from '../components/ThoughtsContext';
import { Colors } from '../constants/Colors';

// Tipos para los datos
interface EmotionDistribution {
  emoji: string;
  label: string;
  percent: number;
  color: string;
}
interface RegionalTrend {
  region: string;
  emoji: string;
  desc: string;
}
interface TrendingTopic {
  emoji: string;
  label: string;
  mentions: number;
}

export default function EmotionalMapScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const colors = {
    ...Colors[theme],
    card: (Colors[theme] as any).card ?? (theme === 'dark' ? '#23243a' : '#fff'),
    cardBorder: (Colors[theme] as any).cardBorder ?? (theme === 'dark' ? '#23243a' : '#A78BFA'),
    accent: (Colors[theme] as any).accent ?? Colors[theme].tint ?? '#A78BFA',
    secondaryText: (Colors[theme] as any).secondaryText ?? (theme === 'dark' ? '#a5b4fc' : '#6D28D9'),
    background: Colors[theme].background ?? (theme === 'dark' ? '#18192A' : '#F3F4F6'),
  };
  const darkMode = theme === 'dark';
  const { thoughts } = useThoughts();

  // Calcular análisis global
  const [loading, setLoading] = useState(true);
  const [emotionDistribution, setEmotionDistribution] = useState<EmotionDistribution[]>([]);
  const [regionalTrends, setRegionalTrends] = useState<RegionalTrend[]>([]);
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([]);
  const [thoughtsToday, setThoughtsToday] = useState<number>(0);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      // Análisis de emociones
      const emotionCount: Record<string, { count: number; emoji: string; label: string; color: string }> = {};
      thoughts.forEach(t => {
        if (!emotionCount[t.emotion]) {
          emotionCount[t.emotion] = {
            count: 0,
            emoji: t.emotionEmoji,
            label: t.emotionLabel,
            color: '#A78BFA', // color por defecto, puedes mapear colores por emoción si quieres
          };
        }
        emotionCount[t.emotion].count++;
      });
      const total = thoughts.length;
      const distribution = Object.values(emotionCount)
        .map(e => ({ ...e, percent: total ? Math.round((e.count / total) * 100) : 0 }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 4); // Top 4 emociones
      setEmotionDistribution(distribution);

      // Pensamientos de hoy
      const today = new Date();
      const todayCount = thoughts.filter(t => {
        const created = new Date(t.createdAt);
        return created.getDate() === today.getDate() && created.getMonth() === today.getMonth() && created.getFullYear() === today.getFullYear();
      }).length;
      setThoughtsToday(todayCount);

      // Temas en tendencia (simulado: palabras más frecuentes)
      const wordCount: Record<string, number> = {};
      thoughts.forEach(t => {
        t.text.split(/\s+/).forEach(word => {
          const w = word.toLowerCase().replace(/[^\wáéíóúüñ]/gi, '');
          if (w.length > 3) wordCount[w] = (wordCount[w] || 0) + 1;
        });
      });
      const trending = Object.entries(wordCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4)
        .map(([label, mentions]) => ({ emoji: '💭', label, mentions }));
      setTrendingTopics(trending);

      // Tendencias por región (simulado: regiones fijas con emoción dominante)
      setRegionalTrends([
        { region: 'América del Norte', emoji: distribution[0]?.emoji || '😟', desc: `Predomina ${distribution[0]?.label || 'Ansiedad'}` },
        { region: 'Europa del Sur', emoji: distribution[1]?.emoji || '🧘', desc: `Tendencia a ${distribution[1]?.label || 'Reflexión'}` },
        { region: 'Asia-Pacífico', emoji: distribution[2]?.emoji || '😢', desc: `Expresiones de ${distribution[2]?.label || 'Tristeza'}` },
        { region: 'América Latina', emoji: distribution[3]?.emoji || '💝', desc: `Más pensamientos sobre ${distribution[3]?.label || 'Amor'}` },
      ]);
      setLoading(false);
    }, 800);
  }, [thoughts]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }] }>
      <View style={[styles.header, { backgroundColor: colors.card }] }>
        <TouchableOpacity style={styles.headerBtn} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.accent} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.secondaryText }]}>Mapa Emocional Global</Text>
        <View style={styles.headerBtn} />
      </View>
      {loading ? (
        <View style={styles.loaderBox}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={{ color: colors.secondaryText, marginTop: 16 }}>Cargando tendencias emocionales…</Text>
        </View>
      ) : (
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Resumen global */}
        <View style={[styles.card, styles.gradientCard, { borderColor: colors.cardBorder, backgroundColor: colors.card }] }>
          <View style={styles.cardHeader}>
            <Feather name="globe" size={22} color={colors.accent} style={{ marginRight: 8 }} />
            <Text style={[styles.cardTitle, { color: colors.accent }]}>Estado Emocional Global Hoy</Text>
          </View>
          <View style={styles.summaryRow}>
            <View style={styles.summaryBox}>
              <Text style={styles.summaryEmoji}>{emotionDistribution[0]?.emoji || '😟'}</Text>
              <Text style={styles.summaryLabel}>Emoción dominante</Text>
              <Text style={[styles.summaryValue, { color: emotionDistribution[0]?.color || colors.accent }]}>{emotionDistribution[0]?.label || 'Ansiedad'} ({emotionDistribution[0]?.percent || 0}%)</Text>
            </View>
            <View style={styles.summaryBox}>
              <Text style={styles.summaryEmoji}>📝</Text>
              <Text style={styles.summaryLabel}>Pensamientos hoy</Text>
              <Text style={[styles.summaryValue, { color: colors.secondaryText }]}>{thoughtsToday}</Text>
            </View>
          </View>
          {/* Distribución emocional global */}
          <View style={styles.distCard}>
            <Text style={styles.distTitle}>Distribución emocional global:</Text>
            {emotionDistribution.map((e) => (
              <View key={e.label} style={styles.distRow}>
                <Text style={styles.distLabel}>{e.emoji} {e.label}</Text>
                <View style={styles.distBarTrack}>
                  <View style={[styles.distBar, { width: `${e.percent}%`, backgroundColor: e.color }]} />
                </View>
                <Text style={styles.distPercent}>{e.percent}%</Text>
              </View>
            ))}
          </View>
        </View>
        {/* Tendencias por región */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }] }>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="trending-up" size={20} color={colors.accent} style={{ marginRight: 8 }} />
            <Text style={[styles.cardTitle, { color: colors.accent }]}>Tendencias por Región</Text>
          </View>
          {regionalTrends.map((r) => (
            <View key={r.region} style={styles.regionCard}>
              <View style={styles.regionRow}>
                <Text style={styles.regionName}>{r.region}</Text>
                <Text style={styles.regionEmoji}>{r.emoji}</Text>
              </View>
              <Text style={styles.regionDesc}>{r.desc}</Text>
            </View>
          ))}
        </View>
        {/* Temas en tendencia */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }] }>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="pound" size={20} color={colors.accent} style={{ marginRight: 8 }} />
            <Text style={[styles.cardTitle, { color: colors.accent }]}>Temas en Tendencia</Text>
          </View>
          <View style={styles.topicsGrid}>
            {trendingTopics.map((t) => (
              <View key={t.label} style={styles.topicCard}>
                <Text style={styles.topicEmoji}>{t.emoji}</Text>
                <Text style={styles.topicLabel}>{t.label}</Text>
                <Text style={styles.topicMentions}>+{t.mentions} menciones</Text>
              </View>
            ))}
          </View>
        </View>
        {/* Privacidad */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }] }>
          <View style={styles.privacyBox}>
            <Text style={styles.privacyEmoji}>🔒</Text>
            <Text style={styles.privacyTitle}>Privacidad Garantizada</Text>
            <Text style={styles.privacyDesc}>Los datos son completamente anónimos y agregados por regiones amplias. Ninguna información personal es rastreada o almacenada.</Text>
          </View>
        </View>
      </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(55,65,81,0.5)',
  },
  headerBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 999 },
  headerTitle: { fontSize: 18, fontWeight: '600' },
  scrollContent: { padding: 20, paddingBottom: 40 },
  loaderBox: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  card: {
    borderRadius: 16, borderWidth: 1, marginBottom: 24, padding: 18,
    shadowColor: '#A855F7', shadowOpacity: 0.10, shadowRadius: 8, shadowOffset: { width: 0, height: 2 },
  },
  gradientCard: {
    backgroundColor: 'rgba(49,46,129,0.5)',
    borderColor: '#6366F1',
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  cardTitle: { fontSize: 16, fontWeight: '600' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 18 },
  summaryBox: { flex: 1, alignItems: 'center' },
  summaryEmoji: { fontSize: 32, marginBottom: 2 },
  summaryLabel: { fontSize: 13, color: '#9CA3AF', marginBottom: 2 },
  summaryValue: { fontSize: 16, fontWeight: '600' },
  distCard: { marginTop: 10 },
  distTitle: { fontSize: 13, color: '#9CA3AF', marginBottom: 8 },
  distRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  distLabel: { fontSize: 13, width: 90 },
  distBarTrack: { flex: 1, height: 10, backgroundColor: '#312E81', borderRadius: 8, marginHorizontal: 10, overflow: 'hidden' },
  distBar: { height: 10, borderRadius: 8 },
  distPercent: { fontSize: 12, color: '#9CA3AF', width: 38, textAlign: 'right' },
  regionCard: { backgroundColor: 'rgba(168,85,247,0.07)', borderRadius: 12, padding: 10, marginBottom: 10 },
  regionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 },
  regionName: { fontSize: 14, fontWeight: '500', color: '#D1D5DB' },
  regionEmoji: { fontSize: 20 },
  regionDesc: { fontSize: 12, color: '#9CA3AF' },
  topicsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 8 },
  topicCard: { backgroundColor: 'rgba(168,85,247,0.10)', borderRadius: 10, padding: 10, alignItems: 'center', width: '47%', marginBottom: 10 },
  topicEmoji: { fontSize: 20, marginBottom: 2 },
  topicLabel: { fontSize: 13, color: '#A78BFA', marginBottom: 2 },
  topicMentions: { fontSize: 12, color: '#9CA3AF' },
  privacyBox: { alignItems: 'center', justifyContent: 'center' },
  privacyEmoji: { fontSize: 24, marginBottom: 4 },
  privacyTitle: { fontSize: 14, fontWeight: '600', color: '#A78BFA', marginBottom: 2 },
  privacyDesc: { fontSize: 12, color: '#A78BFA', textAlign: 'center' },
}); 