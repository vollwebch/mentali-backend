import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, Vibration, View } from 'react-native';
import { useTheme } from '../../ThemeContext';
import { useThoughts } from '../../components/ThoughtsContext';
import { Colors } from '../../constants/Colors';

// Generador de niveles (resumido para ejemplo, pero en la implementación real se generan 100)
const TREE_LEVELS = Array.from({ length: 100 }, (_, i) => {
  const level = i + 1;
  let requiredThoughts = 1 + i * 2;
  let requiredLikes = Math.floor(i / 5);
  let requiredDays = Math.floor(i / 10);
  let requiredSpecial = null;
  let label = '';
  let description = '';
  let reward = {};

  // Nombres y recompensas creativas por tramos
  if (level === 1) {
    label = 'Semilla Plantada';
    description = '¡Has plantado la semilla de tu bienestar!';
    reward = { type: 'sticker', icon: 'sprout', text: 'Sticker: Semilla' };
  } else if (level === 2) {
    label = 'Brote Nuevo';
    description = 'Tu primer brote emocional ha surgido.';
    reward = { type: 'phrase', icon: 'format-quote-close', text: '“Cada paso cuenta”' };
  } else if (level === 3) {
    label = 'Primeras Raíces';
    description = 'Tus raíces emocionales se fortalecen.';
    reward = { type: 'medal', icon: 'medal', text: 'Medalla: Raíces' };
  } else if (level < 10) {
    label = `Árbol en Crecimiento ${level}`;
    description = 'Tu árbol sigue creciendo con tus reflexiones.';
    reward = { type: 'sticker', icon: 'tree-outline', text: 'Sticker: Árbol' };
  } else if (level < 20) {
    label = `Florecen las Ramas ${level}`;
    description = 'Las ramas florecen gracias a tu constancia.';
    reward = { type: 'medal', icon: 'flower', text: 'Medalla: Flor' };
  } else if (level < 30) {
    label = `Árbol Frondoso ${level}`;
    description = 'Tu árbol es cada vez más frondoso.';
    reward = { type: 'phrase', icon: 'format-quote-close', text: '“Sigue creciendo”' };
  } else if (level < 40) {
    label = `Árbol Resistente ${level}`;
    description = 'Tu resiliencia se refleja en tu árbol.';
    reward = { type: 'sticker', icon: 'shield', text: 'Sticker: Resiliencia' };
  } else if (level < 50) {
    label = `Árbol Sabio ${level}`;
    description = 'La sabiduría florece en tus ramas.';
    reward = { type: 'medal', icon: 'owl', text: 'Medalla: Búho' };
  } else if (level < 60) {
    label = `Árbol de Luz ${level}`;
    description = 'Tu árbol irradia luz y energía positiva.';
    reward = { type: 'sticker', icon: 'star', text: 'Sticker: Luz' };
  } else if (level < 70) {
    label = `Árbol Milenario ${level}`;
    description = 'Tu árbol es un símbolo de constancia.';
    reward = { type: 'medal', icon: 'trophy-award', text: 'Medalla: Milenario' };
  } else if (level < 80) {
    label = `Árbol de Sabiduría ${level}`;
    description = 'Tu experiencia inspira a otros.';
    reward = { type: 'phrase', icon: 'format-quote-close', text: '“Tu historia inspira”' };
  } else if (level < 90) {
    label = `Árbol de Luz Dorada ${level}`;
    description = 'Tu árbol brilla con luz dorada.';
    reward = { type: 'sticker', icon: 'star-shooting', text: 'Sticker: Luz Dorada' };
  } else {
    label = `Árbol Legendario ${level}`;
    description = '¡Has alcanzado la leyenda emocional!';
    reward = { type: 'medal', icon: 'crown', text: 'Medalla: Leyenda' };
    requiredSpecial = 'Completa un reto especial';
  }
  return {
    level,
    label,
    requiredThoughts,
    requiredLikes,
    requiredDays,
    requiredSpecial,
    description,
    reward,
  };
});

const PRIZES = [
  { type: 'medal', icon: 'medal' as const, color: '#fbbf24', text: '¡Has ganado una medalla de crecimiento!' },
  { type: 'sticker', icon: 'emoticon-happy-outline' as const, color: '#38bdf8', text: '¡Sticker especial desbloqueado!' },
  { type: 'phrase', icon: 'format-quote-close' as const, color: '#a78bfa', text: '“Cada paso cuenta en tu viaje emocional”' },
];
const SPECIAL_PRIZES = [
  { type: 'special', icon: 'star-shooting' as const, color: '#f472b6', text: '¡Premio especial! Hoja dorada desbloqueada 🌟' },
  { type: 'special', icon: 'trophy-award' as const, color: '#a3e635', text: '¡Premio especial! Fondo exclusivo desbloqueado 🏆' },
];

type Prize = {
  type: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  color: string;
  text: string;
};

const ProfileScreen = () => {
  const { theme } = useTheme();
  // Corregido: Evitar acceder a propiedades que pueden no existir en Colors[theme]
  const colors = {
    ...Colors[theme],
    card: (Colors[theme] as any).card ?? (theme === 'dark' ? '#23243a' : '#fff'),
    cardBorder: (Colors[theme] as any).cardBorder ?? (theme === 'dark' ? '#23243a' : '#E0E7FF'),
    cardShadow: (Colors[theme] as any).cardShadow ?? 'rgba(167,139,250,0.12)',
    blurBg: (Colors[theme] as any).blurBg ?? 'rgba(167,139,250,0.12)',
    accent: (Colors[theme] as any).accent ?? Colors[theme].tint ?? '#A78BFA',
    secondaryText: (Colors[theme] as any).secondaryText ?? (theme === 'dark' ? '#a5b4fc' : '#6D28D9'),
  };
  const { allThoughts, privateThoughts } = useThoughts();
  const [treeLevel, setTreeLevel] = useState(1); // Simulación de nivel
  const [showPrize, setShowPrize] = useState(false);
  const [currentPrize, setCurrentPrize] = useState<Prize | null>(null);
  const [treeScale] = useState(new Animated.Value(1));
  const [previousLevel, setPreviousLevel] = useState(1);
  const router = useRouter();
  const soundRef = useRef(null);

  // Función para reproducir sonido de celebración
  async function playCelebrationSound() {
    try {
      console.log("🔊 Reproduciendo sonido de celebración del árbol...");
      const { sound } = await Audio.Sound.createAsync(
        { uri: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav' },
        { shouldPlay: true, volume: 1.0 }
      );
      
      soundRef.current = sound as any;
      await sound.playAsync();
      
      sound.setOnPlaybackStatusUpdate((status: any) => {
        if (status.didJustFinish) {
          sound.unloadAsync();
        }
      });
      console.log("✅ Sonido reproducido exitosamente");
    } catch (error) {
      console.log("❌ Error con sonido del árbol:", error);
      // Fallback: vibración más intensa
      try {
        Vibration.vibrate(100);
        setTimeout(async () => {
          Vibration.vibrate(100);
        }, 100);
      } catch (vibError) {
        console.log("❌ Ni siquiera vibración disponible");
      }
    }
  }

  // Función para vibración de celebración
  async function playCelebrationVibration() {
    try {
      Vibration.vibrate(100);
      setTimeout(async () => {
        Vibration.vibrate(100);
      }, 200);
    } catch (error) {
      console.log("Vibración no disponible");
    }
  }

  // Calcular datos del usuario
  const userThoughts = useMemo(() => allThoughts.filter(t => t), [allThoughts]); // Aquí puedes filtrar por usuario si hay multiusuario
  const userLikes = useMemo(() => userThoughts.reduce((acc, t) => acc + (t.reactions?.heart || 0), 0), [userThoughts]);
  // Simulación de días activos: contar días únicos con pensamientos
  const userDays = useMemo(() => Array.from(new Set(userThoughts.map(t => new Date(t.createdAt).toDateString()))).length, [userThoughts]);

  // Calcular nivel actual
  const currentLevel = useMemo(() => {
    let level = 1;
    for (let i = TREE_LEVELS.length - 1; i >= 0; i--) {
      const lvl = TREE_LEVELS[i];
      if (
        userThoughts.length >= lvl.requiredThoughts &&
        userLikes >= lvl.requiredLikes &&
        userDays >= lvl.requiredDays &&
        (!lvl.requiredSpecial || false) // Aquí puedes poner lógica de retos especiales
      ) {
        level = lvl.level;
        break;
      }
    }
    return level;
  }, [userThoughts, userLikes, userDays]);
  
  // Detectar subida de nivel
  useEffect(() => {
    if (currentLevel > previousLevel) {
      console.log("🎉 ¡Subió de nivel!", previousLevel, "→", currentLevel);
      // ¡Subió de nivel!
      handleLevelUp(currentLevel);
      setPreviousLevel(currentLevel);
    }
  }, [currentLevel, previousLevel]);

  // Limpieza del sonido al desmontar
  useEffect(() => {
    return () => {
      if (soundRef.current && typeof (soundRef.current as any).unloadAsync === 'function') {
        (soundRef.current as any).unloadAsync();
      }
    };
  }, []);

  const levelData = TREE_LEVELS[currentLevel - 1];
  const nextLevelData = TREE_LEVELS[currentLevel] || null;

  // Progreso hacia el siguiente nivel
  let progress = 1;
  if (nextLevelData) {
    let total = 0;
    let count = 0;
    if (nextLevelData.requiredThoughts > 0) {
      total += userThoughts.length / nextLevelData.requiredThoughts;
      count++;
    }
    if (nextLevelData.requiredLikes > 0) {
      total += userLikes / nextLevelData.requiredLikes;
      count++;
    }
    if (nextLevelData.requiredDays > 0) {
      total += userDays / nextLevelData.requiredDays;
      count++;
    }
    progress = Math.min(total / (count || 1), 1);
  }

  // Mostrar requisitos que faltan
  const missing = nextLevelData
    ? {
        thoughts: Math.max(0, nextLevelData.requiredThoughts - userThoughts.length),
        likes: Math.max(0, nextLevelData.requiredLikes - userLikes),
        days: Math.max(0, nextLevelData.requiredDays - userDays),
        special: nextLevelData.requiredSpecial,
      }
    : null;

  // Pensamientos expirados = historial público
  const now = new Date();
  const publicHistory = allThoughts.filter(t => {
    const created = new Date(t.createdAt);
    const expires = new Date(created.getTime() + t.expiresInHours * 60 * 60 * 1000);
    return expires <= now;
  });

  // Calcular emoción predominante
  const emotionCounts = {
    joy: userThoughts.filter(t => t.emotion === 'joy').length,
    gratitude: userThoughts.filter(t => t.emotion === 'gratitude').length,
    reflection: userThoughts.filter(t => t.emotion === 'reflection').length,
    resilience: userThoughts.filter(t => t.emotion === 'resilience').length
  };
  
  const predominantEmotion = Object.entries(emotionCounts).reduce((a, b) => 
    emotionCounts[a[0] as keyof typeof emotionCounts] > emotionCounts[b[0] as keyof typeof emotionCounts] ? a : b
  )[0];
  
  const totalEmotions = Object.values(emotionCounts).reduce((a, b) => a + b, 0);
  const emotionPercentage = totalEmotions > 0 ? Math.round((emotionCounts[predominantEmotion as keyof typeof emotionCounts] / totalEmotions) * 100) : 0;

  // Animación simple para feedback visual
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();
  };

  // Lógica de premios rotativos + especial
  const handleLevelUp = useCallback(async (newLevel: number) => {
    console.log("🎉 ¡Subió de nivel!", newLevel);
    
    let prize;
    if ((newLevel) % 3 === 0) {
      // Premio especial aleatorio
      prize = SPECIAL_PRIZES[Math.floor(Math.random() * SPECIAL_PRIZES.length)];
    } else {
      prize = PRIZES[(newLevel - 1) % PRIZES.length];
    }
    
    console.log("🏆 Premio otorgado:", prize.text);
    setCurrentPrize(prize);
    setShowPrize(true);
    setTreeLevel(newLevel + 1);
    
    // Efectos de celebración
    console.log("📳 Reproduciendo vibración de celebración...");
    await playCelebrationVibration();
    console.log("🔊 Reproduciendo sonido de celebración...");
    await playCelebrationSound();
    
    // Animación de crecimiento
    Animated.sequence([
      Animated.spring(treeScale, { toValue: 1.15, useNativeDriver: true }),
      Animated.spring(treeScale, { toValue: 1, useNativeDriver: true }),
    ]).start();
  }, [playCelebrationSound, playCelebrationVibration, treeScale]);

  return (
    <ScrollView style={[styles.bg, { backgroundColor: colors.background }]} contentContainerStyle={{ paddingBottom: 32 }}>
      {/* Header con título y acciones */}
      <View style={[styles.headerRow, { backgroundColor: colors.cardShadow }] }>
        <TouchableOpacity style={[styles.headerBtn, { backgroundColor: colors.blurBg || 'rgba(167,139,250,0.12)' }] }>
          <Feather name="arrow-left" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Tu Espacio Personal</Text>
        <TouchableOpacity style={[styles.headerBtn, { backgroundColor: colors.blurBg || 'rgba(167,139,250,0.12)' }] }>
          <Feather name="external-link" size={22} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Tarjeta de bienvenida */}
      <LinearGradient colors={["#3a2a5d", "#4b256a"]} style={styles.card}>
        <View style={styles.cardIconCircle}>
          <MaterialCommunityIcons name="brain" size={36} color="#A855F7" />
        </View>
        <Text style={styles.cardTitleText}>Bienvenido a tu espacio personal</Text>
        <Text style={styles.cardDesc}>Aquí puedes ver tu progreso emocional y patrones personales</Text>
      </LinearGradient>

      {/* Tarjeta Árbol Emocional Interactiva */}
      <LinearGradient colors={["#183c2b", "#1e293b"]} style={[styles.card, { marginTop: 18 }] }>
        <View style={styles.cardIconCircleGreen}>
          <MaterialCommunityIcons name="tree-outline" size={36} color="#34D399" />
        </View>
        <Text style={styles.cardTitleText}>Tu Árbol Emocional</Text>
        <Text style={styles.cardLevel}>Nivel {currentLevel} - {levelData?.label || 'Árbol en Crecimiento'}</Text>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
        </View>
        <Text style={styles.cardDescSmall}>
          Tu árbol ha crecido con {userThoughts.length} entradas de reflexión. 
          {nextLevelData && (
            ` Necesitas ${missing?.thoughts || 0} pensamientos más para el siguiente nivel.`
          )}
        </Text>
      </LinearGradient>

      {/* Modal de premio al subir de nivel */}
      <Modal visible={showPrize} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: '#000a', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: colors.card, borderRadius: 18, padding: 32, alignItems: 'center', width: 300 }}>
            {currentPrize && (
              <>
                <MaterialCommunityIcons name={currentPrize.icon} size={54} color={currentPrize.color} style={{ marginBottom: 12 }} />
                <Text style={{ color: colors.text, fontSize: 20, fontWeight: 'bold', marginBottom: 8 }}>¡Felicidades!</Text>
                <Text style={{ color: colors.accent, fontSize: 16, textAlign: 'center', marginBottom: 12 }}>{currentPrize.text}</Text>
                <TouchableOpacity onPress={() => setShowPrize(false)} style={{ marginTop: 10, backgroundColor: colors.accent, borderRadius: 8, paddingHorizontal: 24, paddingVertical: 10 }}>
                  <Text style={{ color: colors.text, fontWeight: 'bold', fontSize: 16 }}>¡Genial!</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Tarjeta Análisis Emocional */}
      <View style={[styles.card, { backgroundColor: '#23243a', marginTop: 18 }] }>
        <View style={styles.cardRow}>
          <MaterialCommunityIcons name="chart-line" size={22} color="#a78bfa" style={{ marginRight: 8 }} />
          <Text style={[styles.cardTitleText, { color: '#a78bfa', fontSize: 18 }]}>Análisis Emocional</Text>
        </View>
        <Text style={styles.analysisText}>Emoción predominante esta semana <Text style={{ color: '#a78bfa', fontWeight: 'bold' }}>{predominantEmotion}</Text></Text>
        <View style={styles.analysisBox}>
          <View style={styles.analysisIconCircle}>
            <MaterialCommunityIcons name="medal" size={22} color="#FFD700" />
          </View>
          <Text style={styles.analysisPercent}>{emotionPercentage}%</Text>
        </View>
        <Text style={styles.analysisSub}>Patrones detectados</Text>
      </View>

      {/* Tarjeta Historial Privado */}
      <View style={[styles.card, { backgroundColor: colors.card, marginTop: 18 }] }>
        <View style={styles.cardRow}>
          <MaterialCommunityIcons name="history" size={22} color={colors.accent} style={{ marginRight: 8 }} />
          <Text style={[styles.cardTitleText, { color: colors.accent, fontSize: 18 }]}>Tu Historial Privado</Text>
        </View>
        {privateThoughts.length === 0 ? (
          <Text style={{ color: colors.secondaryText, textAlign: 'center', marginTop: 8 }}>
            Aún no tienes pensamientos privados. ¡Activa el modo privado al publicar para guardar tus reflexiones solo para ti!
          </Text>
        ) : (
          privateThoughts.slice(0, 3).map((t) => (
            <View key={t.id} style={styles.historyItem}>
              <View style={styles.historyRow}>
                <Text style={styles.historyDate}>{new Date(t.createdAt).toLocaleDateString()}</Text>
                <Text style={styles.historyTag}>{t.emotionLabel}</Text>
              </View>
              <Text style={styles.historyText}>{t.text}</Text>
              <View style={styles.historyMetaRow}>
                <Text style={styles.historyMeta}>❤️ {t.reactions.heart} reacciones</Text>
                {t.aiResponse && <Text style={styles.historyMeta}>🤖 IA respondió</Text>}
              </View>
            </View>
          ))
        )}
        <TouchableOpacity style={styles.historyBtn} onPress={() => router.push('../../profile/historial-privado')}>
          <LinearGradient colors={["#a78bfa", "#7c3aed"]} style={styles.historyBtnGradient}>
            <Text style={styles.historyBtnText}>Ver historial completo</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Sección de historial público */}
      <View style={[styles.card, { backgroundColor: colors.card, marginTop: 18 }] }>
        <View style={styles.cardRow}>
          <MaterialCommunityIcons name="earth" size={22} color="#38bdf8" style={{ marginRight: 8 }} />
          <Text style={[styles.cardTitleText, { color: '#38bdf8', fontSize: 18 }]}>Tu Historial Público</Text>
        </View>
        {allThoughts.filter(t => !t.private).length === 0 ? (
          <Text style={{ color: '#a5b4fc', textAlign: 'center', marginTop: 8 }}>Aún no tienes pensamientos públicos. ¡Publica uno y aparecerá aquí!</Text>
        ) : (
          allThoughts.filter(t => !t.private).slice(0, 3).map((t) => (
            <Animated.View key={t.id} style={[styles.historyItem, { transform: [{ scale: scaleAnim }] }] }>
              <TouchableOpacity
                activeOpacity={0.85}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                style={{ width: '100%' }}
              >
                <View style={styles.historyRow}>
                  <Text style={styles.historyDate}>{new Date(t.createdAt).toLocaleDateString()}</Text>
                  <Text style={styles.historyTag}>{t.emotionLabel}</Text>
                </View>
                <Text style={styles.historyText}>{t.text}</Text>
                <View style={styles.historyMetaRow}>
                  <Text style={styles.historyMeta}>❤️ {t.reactions.heart} reacciones</Text>
                  {t.aiResponse && <Text style={styles.historyMeta}>🤖 IA respondió</Text>}
                </View>
              </TouchableOpacity>
            </Animated.View>
          ))
        )}
        {allThoughts.filter(t => !t.private).length > 3 && (
          <TouchableOpacity style={styles.historyBtn} onPress={() => router.push('../../profile/historial-publico')}>
            <LinearGradient colors={["#38bdf8", "#a78bfa"]} style={styles.historyBtnGradient}>
              <Text style={styles.historyBtnText}>Ver historial público completo</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>

      {/* Botones inferiores */}
      <View style={styles.bottomRow}>
        <TouchableOpacity style={styles.bottomBtn}>
          <LinearGradient colors={["#a78bfa", "#f472b6"]} style={styles.bottomBtnGradient}>
            <MaterialCommunityIcons name="download" size={22} color="#fff" />
            <Text style={styles.bottomBtnText}>Exportar Diario</Text>
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomBtn}>
          <LinearGradient colors={["#38bdf8", "#a78bfa"]} style={styles.bottomBtnGradient}>
            <MaterialCommunityIcons name="music" size={22} color="#fff" />
            <Text style={styles.bottomBtnText}>Música Emocional</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    backgroundColor: '#18192A',
    paddingHorizontal: 0,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 32,
    paddingBottom: 18,
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(167,139,250,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  card: {
    borderRadius: 18,
    padding: 22,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 0,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  cardIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6d28d9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  cardIconCircleGreen: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#052e16',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  cardTitleText: {
    color: '#fff',
    fontSize: 19,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 6,
  },
  cardDesc: {
    color: '#e0e7ef',
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 0,
  },
  cardLevel: {
    color: '#a7f3d0',
    fontSize: 15,
    marginTop: 4,
    marginBottom: 8,
    textAlign: 'center',
    fontWeight: '600',
  },
  progressBarBg: {
    width: '100%',
    height: 8,
    backgroundColor: '#334155',
    borderRadius: 8,
    marginBottom: 8,
    marginTop: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    width: '32%',
    height: 8,
    backgroundColor: '#38bdf8',
    borderRadius: 8,
  },
  cardDescSmall: {
    color: '#e0e7ef',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 4,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  analysisText: {
    color: '#fff',
    fontSize: 15,
    marginBottom: 8,
    textAlign: 'center',
  },
  analysisBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  analysisIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#a78bfa',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  analysisPercent: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  analysisSub: {
    color: '#a78bfa',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 2,
  },
  historyItem: {
    backgroundColor: '#23243a',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    width: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  historyDate: {
    color: '#a5b4fc',
    fontSize: 13,
    marginRight: 8,
  },
  historyTag: {
    color: '#fbbf24',
    fontSize: 13,
    fontWeight: 'bold',
  },
  historyText: {
    color: '#fff',
    fontSize: 15,
    marginBottom: 4,
  },
  historyMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  historyMeta: {
    color: '#a5b4fc',
    fontSize: 12,
  },
  historyBtn: {
    marginTop: 6,
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  historyBtnGradient: {
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
  },
  historyBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 28,
    marginHorizontal: 16,
    gap: 12,
  },
  bottomBtn: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
  },
  bottomBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  bottomBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
    marginLeft: 8,
  },
  progressPercent: {
    color: '#a7f3d0',
    fontSize: 15,
    fontWeight: 'bold',
    marginTop: 4,
  },
  requirementsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  requirementBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
    borderRadius: 8,
    backgroundColor: '#334155',
  },
  requirementText: {
    color: '#a7f3d0',
    fontSize: 13,
    marginLeft: 4,
  },
});

export default ProfileScreen; 