import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../ThemeContext';
import { useThoughts } from '../../components/ThoughtsContext';
import { Colors } from '../../constants/Colors';

export default function HistorialPrivado() {
  const { theme } = useTheme();
  const colors = Colors[theme];
  const accent = (colors as any).accent ?? colors.tint ?? '#A78BFA';
  const { privateThoughts } = useThoughts();
  const router = useRouter();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient
        colors={theme === 'dark' ? ['#23243a', '#18192A'] : ['#ece9f6', '#f6f6fb']}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 24 }}>
          <LinearGradient
            colors={theme === 'dark' ? ['#a78bfa', '#7c3aed'] : ['#a78bfa', '#f472b6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerCard}
          >
            <View style={styles.headerRow}>
              <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                <MaterialCommunityIcons name="arrow-left" size={20} color="#fff" />
              </TouchableOpacity>
              <MaterialCommunityIcons name="history" size={20} color="#fff" style={{ marginRight: 8, marginLeft: 2 }} />
              <Text style={styles.headerTitle}>Historial Privado</Text>
            </View>
          </LinearGradient>
          {privateThoughts.length === 0 ? (
            <Text style={{ color: colors.secondaryText, textAlign: 'center', marginTop: 24 }}>
              No tienes pensamientos privados aún.
            </Text>
          ) : (
            privateThoughts.map(t => (
              <View key={t.id} style={[styles.thoughtCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }] }>
                <View style={styles.row}>
                  <Text style={[styles.date, { color: colors.secondaryText }]}>{new Date(t.createdAt).toLocaleDateString()}</Text>
                  <Text style={[styles.emotion, { color: accent }]}>{t.emotionLabel}</Text>
                </View>
                <Text style={[styles.text, { color: colors.text }]}>{t.text}</Text>
              </View>
            ))
          )}
        </ScrollView>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  headerCard: {
    borderRadius: 16,
    marginBottom: 18,
    padding: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtn: {
    marginRight: 6,
    padding: 4,
    borderRadius: 999,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 4,
  },
  thoughtCard: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 12,
  },
  date: {
    fontSize: 13,
    marginRight: 8,
  },
  emotion: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  text: {
    fontSize: 15,
    marginTop: 2,
  },
}); 