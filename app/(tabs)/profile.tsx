import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, Vibration, View, SafeAreaView, StatusBar, Platform, Easing } from 'react-native';
import { useTheme } from '../../ThemeContext';
import { useThoughts } from '../../components/ThoughtsContext';
import { Colors } from '../../constants/Colors';

const TAB_BAR_HEIGHT = Platform.OS === 'ios' ? 95 : 80;

// Animated progress ring
function ProgressRing({ progress, size, strokeWidth, color }: { progress: number; size: number; strokeWidth: number; color: string }) {
  const animatedProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedProgress, {
      toValue: progress,
      duration: 1500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  return (
    <View style={{ width: size, height: size }}>
      <Animated.View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: strokeWidth,
          borderColor: 'rgba(139, 92, 246, 0.15)',
          position: 'absolute',
        }}
      />
      <Animated.View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: strokeWidth,
          borderColor: color,
          position: 'absolute',
          transform: [
            {
              rotate: animatedProgress.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '360deg'],
              }),
            },
          ],
          opacity: animatedProgress.interpolate({
            inputRange: [0, 0.1, 1],
            outputRange: [0.3, 1, 1],
          }),
        }}
      />
    </View>
  );
}

// Animated stat card
function StatCard({ icon, value, label, color, darkMode }: { icon: string; value: string | number; label: string; color: string; darkMode: boolean }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      friction: 5,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  return (
    <TouchableOpacity activeOpacity={0.9} onPressIn={handlePressIn} onPressOut={handlePressOut}>
      <Animated.View style={[
        styles.statCard,
        { 
          backgroundColor: darkMode ? 'rgba(22, 22, 22, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          borderColor: darkMode ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.1)',
          transform: [{ scale: scaleAnim }]
        }
      ]}>
        <View style={[styles.statIconContainer, { backgroundColor: color + '20' }]}>
          <MaterialCommunityIcons name={icon as any} size={24} color={color} />
        </View>
        <Text style={[styles.statValue, { color: darkMode ? '#FFFFFF' : '#1F2937' }]}>{value}</Text>
        <Text style={[styles.statLabel, { color: darkMode ? '#6B7280' : '#9CA3AF' }]}>{label}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

// Tree levels generator
const TREE_LEVELS = Array.from({ length: 100 }, (_, i) => {
  const level = i + 1;
  let requiredThoughts = 1 + i * 2;
  let requiredLikes = Math.floor(i / 5);
  let requiredDays = Math.floor(i / 10);
  let requiredSpecial = null;
  let label = '';
  let description = '';
  let reward = {};

  if (level === 1) {
    label = 'Semilla Plantada';
    description = '¡Has plantado la semilla de tu bienestar!';
    reward = { type: 'sticker', icon: 'sprout', text: 'Sticker: Semilla' };
  } else if (level === 2) {
    label = 'Brote Nuevo';
    description = 'Tu primer brote emocional ha surgido.';
    reward = { type: 'phrase', icon: 'format-quote-close', text: '"Cada paso cuenta"' };
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
    reward = { type: 'phrase', icon: 'format-quote-close', text: '"Sigue creciendo"' };
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
    reward = { type: 'phrase', icon: 'format-quote-close', text: '"Tu historia inspira"' };
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
  { type: 'phrase', icon: 'format-quote-close' as const, color: '#a78bfa', text: '"Cada paso cuenta en tu viaje emocional"' },
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
  const darkMode = theme === 'dark';
  const colors = Colors[theme];
  const { allThoughts, privateThoughts } = useThoughts();
  const [treeLevel, setTreeLevel] = useState(1);
  const [showPrize, setShowPrize] = useState(false);
  const [currentPrize, setCurrentPrize] = useState<Prize | null>(null);
  const [treeScale] = useState(new Animated.Value(1));
  const [previousLevel, setPreviousLevel] = useState(1);
  const router = useRouter();
  const soundRef = useRef(null);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  async function playCelebrationSound() {
    try {
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
    } catch (error) {
      try {
        Vibration.vibrate(100);
        setTimeout(() => Vibration.vibrate(100), 100);
      } catch (vibError) {}
    }
  }

  async function playCelebrationVibration() {
    try {
      Vibration.vibrate(100);
      setTimeout(() => Vibration.vibrate(100), 200);
    } catch (error) {}
  }

  const userThoughts = useMemo(() => allThoughts.filter(t => t), [allThoughts]);
  const userLikes = useMemo(() => userThoughts.reduce((acc, t) => acc + (t.reactions?.heart || 0), 0), [userThoughts]);
  const userDays = useMemo(() => Array.from(new Set(userThoughts.map(t => new Date(t.createdAt).toDateString()))).length, [userThoughts]);

  const currentLevel = useMemo(() => {
    let level = 1;
    for (let i = TREE_LEVELS.length - 1; i >= 0; i--) {
      const lvl = TREE_LEVELS[i];
      if (
        userThoughts.length >= lvl.requiredThoughts &&
        userLikes >= lvl.requiredLikes &&
        userDays >= lvl.requiredDays &&
        (!lvl.requiredSpecial || false)
      ) {
        level = lvl.level;
        break;
      }
    }
    return level;
  }, [userThoughts, userLikes, userDays]);
  
  useEffect(() => {
    if (currentLevel > previousLevel) {
      handleLevelUp(currentLevel);
      setPreviousLevel(currentLevel);
    }
  }, [currentLevel, previousLevel]);

  useEffect(() => {
    return () => {
      if (soundRef.current && typeof (soundRef.current as any).unloadAsync === 'function') {
        (soundRef.current as any).unloadAsync();
      }
    };
  }, []);

  const levelData = TREE_LEVELS[currentLevel - 1];
  const nextLevelData = TREE_LEVELS[currentLevel] || null;

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

  const missing = nextLevelData
    ? {
        thoughts: Math.max(0, nextLevelData.requiredThoughts - userThoughts.length),
        likes: Math.max(0, nextLevelData.requiredLikes - userLikes),
        days: Math.max(0, nextLevelData.requiredDays - userDays),
        special: nextLevelData.requiredSpecial,
      }
    : null;

  const now = new Date();
  const publicHistory = allThoughts.filter(t => {
    const created = new Date(t.createdAt);
    const expires = new Date(created.getTime() + t.expiresInHours * 60 * 60 * 1000);
    return expires <= now;
  });

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

  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();
  };

  const handleLevelUp = useCallback(async (newLevel: number) => {
    let prize;
    if ((newLevel) % 3 === 0) {
      prize = SPECIAL_PRIZES[Math.floor(Math.random() * SPECIAL_PRIZES.length)];
    } else {
      prize = PRIZES[(newLevel - 1) % PRIZES.length];
    }
    
    setCurrentPrize(prize);
    setShowPrize(true);
    setTreeLevel(newLevel + 1);
    
    await playCelebrationVibration();
    await playCelebrationSound();
    
    Animated.sequence([
      Animated.spring(treeScale, { toValue: 1.15, useNativeDriver: true }),
      Animated.spring(treeScale, { toValue: 1, useNativeDriver: true }),
    ]).start();
  }, [treeScale]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: darkMode ? '#0A0A0A' : '#FFFFFF' }]}>
      <StatusBar barStyle={darkMode ? 'light-content' : 'dark-content'} backgroundColor={darkMode ? '#0A0A0A' : '#FFFFFF'} />
      
      <ScrollView style={styles.scrollView} contentContainerStyle={{ paddingBottom: TAB_BAR_HEIGHT + 20 }} showsVerticalScrollIndicator={false}>
        {/* Premium Hero Section */}
        <View style={styles.heroSection}>
          <LinearGradient 
            colors={darkMode ? ['#1E1B4B', '#312E81', '#0A0A0A'] : ['#6D28D9', '#8B5CF6', '#EC4899']} 
            style={styles.heroGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {/* Decorative circles */}
            <View style={[styles.decorativeCircle, styles.decorativeCircle1]} />
            <View style={[styles.decorativeCircle, styles.decorativeCircle2]} />
            
            <View style={styles.avatarContainer}>
              <LinearGradient
                colors={['#8B5CF6', '#EC4899']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.avatarRing}
              >
                <View style={[styles.avatarInner, { backgroundColor: darkMode ? '#1E1B4B' : '#6D28D9' }]}>
                  <MaterialCommunityIcons name="account" size={48} color="#FFFFFF" />
                </View>
              </LinearGradient>
              <View style={styles.levelBadge}>
                <LinearGradient
                  colors={['#FBBF24', '#F59E0B']}
                  style={StyleSheet.absoluteFill}
                />
                <Text style={styles.levelBadgeText}>{currentLevel}</Text>
              </View>
            </View>
            
            <Text style={styles.heroTitle}>Tu Espacio Personal</Text>
            <Text style={styles.heroSubtitle}>Bienvenido a tu santuario emocional</Text>
          </LinearGradient>
        </View>

        {/* Stats Cards */}
        <Animated.View style={[styles.statsRow, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <StatCard icon="pencil" value={userThoughts.length} label="Pensamientos" color="#8B5CF6" darkMode={darkMode} />
          <StatCard icon="heart" value={userLikes} label="Likes" color="#EC4899" darkMode={darkMode} />
          <StatCard icon="calendar" value={`${userDays}d`} label="Racha" color="#10B981" darkMode={darkMode} />
        </Animated.View>

        {/* Tree Card */}
        <View style={[styles.card, { backgroundColor: darkMode ? 'rgba(22, 22, 22, 0.95)' : 'rgba(255, 255, 255, 0.95)', borderColor: darkMode ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.1)' }]}>
          <View style={styles.treeHeader}>
            <View style={styles.treeIconContainer}>
              <LinearGradient
                colors={['#34D399', '#10B981']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <MaterialCommunityIcons name="tree" size={28} color="#FFFFFF" style={styles.treeIcon} />
            </View>
            <View style={styles.treeTitleContainer}>
              <Text style={[styles.cardTitle, { color: darkMode ? '#FFFFFF' : '#1F2937' }]}>Tu Árbol Emocional</Text>
              <Text style={styles.cardLevel}>Nivel {currentLevel} - {levelData?.label || 'Árbol en Crecimiento'}</Text>
            </View>
            <ProgressRing progress={progress} size={60} strokeWidth={5} color="#10B981" />
          </View>
          
          <View style={styles.progressBarBg}>
            <Animated.View style={[
              styles.progressBarFill, 
              { 
                width: `${progress * 100}%`,
              }
            ]}>
              <LinearGradient
                colors={['#34D399', '#10B981', '#059669']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
            </Animated.View>
          </View>
          
          <Text style={[styles.cardDesc, { color: darkMode ? '#9CA3AF' : '#6B7280' }]}>
            Tu árbol ha crecido con {userThoughts.length} entradas. 
            {nextLevelData && ` Necesitas ${missing?.thoughts || 0} pensamientos más para subir de nivel.`}
          </Text>
        </View>

        {/* Prize Modal */}
        <Modal visible={showPrize} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: darkMode ? '#161616' : '#FFFFFF' }]}>
              {currentPrize && (
                <>
                  <View style={styles.prizeIconContainer}>
                    <LinearGradient
                      colors={['#8B5CF6', '#EC4899']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={StyleSheet.absoluteFill}
                    />
                    <MaterialCommunityIcons name={currentPrize.icon} size={56} color="#FFFFFF" />
                  </View>
                  <Text style={[styles.modalTitle, { color: darkMode ? '#FFFFFF' : '#1F2937' }]}>¡Felicidades!</Text>
                  <Text style={[styles.modalDesc, { color: '#8B5CF6' }]}>{currentPrize.text}</Text>
                  <TouchableOpacity onPress={() => setShowPrize(false)} style={styles.modalButton}>
                    <LinearGradient colors={['#8B5CF6', '#EC4899']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.modalButtonGradient}>
                      <Text style={styles.modalButtonText}>¡Genial!</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </Modal>

        {/* Analysis Card */}
        <View style={[styles.card, { backgroundColor: darkMode ? 'rgba(22, 22, 22, 0.95)' : 'rgba(255, 255, 255, 0.95)', borderColor: darkMode ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.1)' }]}>
          <View style={styles.cardRow}>
            <View style={styles.analysisIconContainer}>
              <LinearGradient
                colors={['#8B5CF6', '#A855F7']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <MaterialCommunityIcons name="chart-line" size={22} color="#FFFFFF" />
            </View>
            <Text style={[styles.cardSectionTitle, { color: '#8B5CF6' }]}>Análisis Emocional</Text>
          </View>
          <Text style={[styles.analysisText, { color: darkMode ? '#FFFFFF' : '#1F2937' }]}>
            Emoción predominante: <Text style={{ color: '#8B5CF6', fontWeight: 'bold' }}>{predominantEmotion}</Text>
          </Text>
          <View style={styles.analysisBox}>
            <View style={styles.analysisIconCircle}>
              <LinearGradient
                colors={['#FBBF24', '#F59E0B']}
                style={StyleSheet.absoluteFill}
              />
              <MaterialCommunityIcons name="medal" size={22} color="#FFFFFF" />
            </View>
            <Text style={[styles.analysisPercent, { color: darkMode ? '#FFFFFF' : '#1F2937' }]}>{emotionPercentage}%</Text>
          </View>
          <Text style={[styles.analysisSub, { color: '#8B5CF6' }]}>Patrones detectados</Text>
        </View>

        {/* Private History Card */}
        <View style={[styles.card, { backgroundColor: darkMode ? 'rgba(22, 22, 22, 0.95)' : 'rgba(255, 255, 255, 0.95)', borderColor: darkMode ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.1)' }]}>
          <View style={styles.cardRow}>
            <View style={styles.historyIconContainer}>
              <LinearGradient
                colors={['#EC4899', '#DB2777']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <MaterialCommunityIcons name="history" size={22} color="#FFFFFF" />
            </View>
            <Text style={[styles.cardSectionTitle, { color: '#EC4899' }]}>Tu Historial Privado</Text>
          </View>
          {privateThoughts.length === 0 ? (
            <Text style={[styles.emptyHistory, { color: darkMode ? '#6B7280' : '#9CA3AF' }]}>
              Aún no tienes pensamientos privados. ¡Activa el modo privado al publicar para guardar tus reflexiones solo para ti!
            </Text>
          ) : (
            privateThoughts.slice(0, 3).map((t) => (
              <View key={t.id} style={[styles.historyItem, { backgroundColor: darkMode ? 'rgba(31, 31, 31, 0.9)' : 'rgba(250, 250, 250, 0.95)' }]}>
                <View style={styles.historyRow}>
                  <Text style={[styles.historyDate, { color: darkMode ? '#9CA3AF' : '#6B7280' }]}>{new Date(t.createdAt).toLocaleDateString()}</Text>
                  <Text style={styles.historyTag}>{t.emotionLabel}</Text>
                </View>
                <Text style={[styles.historyText, { color: darkMode ? '#FFFFFF' : '#1F2937' }]}>{t.text}</Text>
                <View style={styles.historyMetaRow}>
                  <Text style={[styles.historyMeta, { color: darkMode ? '#6B7280' : '#9CA3AF' }]}>❤️ {t.reactions.heart} reacciones</Text>
                  {t.aiResponse && <Text style={[styles.historyMeta, { color: darkMode ? '#6B7280' : '#9CA3AF' }]}>🤖 IA respondió</Text>}
                </View>
              </View>
            ))
          )}
          <TouchableOpacity style={styles.historyBtn} onPress={() => router.push('../../profile/historial-privado')}>
            <LinearGradient colors={['#EC4899', '#DB2777']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.historyBtnGradient}>
              <Text style={styles.historyBtnText}>Ver historial completo</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Public History Card */}
        <View style={[styles.card, { backgroundColor: darkMode ? 'rgba(22, 22, 22, 0.95)' : 'rgba(255, 255, 255, 0.95)', borderColor: darkMode ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.1)' }]}>
          <View style={styles.cardRow}>
            <View style={styles.publicIconContainer}>
              <LinearGradient
                colors={['#06B6D4', '#0891B2']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <MaterialCommunityIcons name="earth" size={22} color="#FFFFFF" />
            </View>
            <Text style={[styles.cardSectionTitle, { color: '#06B6D4' }]}>Tu Historial Público</Text>
          </View>
          {allThoughts.filter(t => !t.private).length === 0 ? (
            <Text style={[styles.emptyHistory, { color: darkMode ? '#6B7280' : '#9CA3AF' }]}>
              Aún no tienes pensamientos públicos. ¡Publica uno y aparecerá aquí!
            </Text>
          ) : (
            allThoughts.filter(t => !t.private).slice(0, 3).map((t) => (
              <Animated.View key={t.id} style={[styles.historyItem, { backgroundColor: darkMode ? 'rgba(31, 31, 31, 0.9)' : 'rgba(250, 250, 250, 0.95)', transform: [{ scale: scaleAnim }] }]}>
                <TouchableOpacity activeOpacity={0.85} onPressIn={handlePressIn} onPressOut={handlePressOut} style={{ width: '100%' }}>
                  <View style={styles.historyRow}>
                    <Text style={[styles.historyDate, { color: darkMode ? '#9CA3AF' : '#6B7280' }]}>{new Date(t.createdAt).toLocaleDateString()}</Text>
                    <Text style={styles.historyTag}>{t.emotionLabel}</Text>
                  </View>
                  <Text style={[styles.historyText, { color: darkMode ? '#FFFFFF' : '#1F2937' }]}>{t.text}</Text>
                  <View style={styles.historyMetaRow}>
                    <Text style={[styles.historyMeta, { color: darkMode ? '#6B7280' : '#9CA3AF' }]}>❤️ {t.reactions.heart} reacciones</Text>
                    {t.aiResponse && <Text style={[styles.historyMeta, { color: darkMode ? '#6B7280' : '#9CA3AF' }]}>🤖 IA respondió</Text>}
                  </View>
                </TouchableOpacity>
              </Animated.View>
            ))
          )}
          {allThoughts.filter(t => !t.private).length > 3 && (
            <TouchableOpacity style={styles.historyBtn} onPress={() => router.push('../../profile/historial-publico')}>
              <LinearGradient colors={['#06B6D4', '#0891B2']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.historyBtnGradient}>
                <Text style={styles.historyBtnText}>Ver historial público completo</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>

        {/* Bottom Buttons */}
        <View style={styles.bottomRow}>
          <TouchableOpacity style={styles.bottomBtn}>
            <LinearGradient colors={['#8B5CF6', '#EC4899']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.bottomBtnGradient}>
              <MaterialCommunityIcons name="download" size={22} color="#FFFFFF" />
              <Text style={styles.bottomBtnText}>Exportar Diario</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity style={styles.bottomBtn}>
            <LinearGradient colors={['#06B6D4', '#10B981']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.bottomBtnGradient}>
              <MaterialCommunityIcons name="music" size={22} color="#FFFFFF" />
              <Text style={styles.bottomBtnText}>Música</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1, paddingHorizontal: 18, maxWidth: 480, width: '100%', alignSelf: 'center' },
  heroSection: { marginBottom: 20 },
  heroGradient: { borderRadius: 32, padding: 28, alignItems: 'center', position: 'relative', overflow: 'hidden' },
  decorativeCircle: { position: 'absolute', borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.08)' },
  decorativeCircle1: { width: 200, height: 200, top: -80, right: -80 },
  decorativeCircle2: { width: 150, height: 150, bottom: -60, left: -60 },
  avatarContainer: { position: 'relative', marginBottom: 20 },
  avatarRing: { width: 100, height: 100, borderRadius: 36, padding: 4, alignItems: 'center', justifyContent: 'center' },
  avatarInner: { width: 92, height: 92, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  levelBadge: { position: 'absolute', bottom: -5, right: -5, width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  levelBadgeText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  heroTitle: { color: '#FFFFFF', fontSize: 28, fontWeight: '800', marginBottom: 8, letterSpacing: 0.5 },
  heroSubtitle: { color: 'rgba(255,255,255,0.85)', fontSize: 15, fontWeight: '500' },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  statCard: { flex: 1, borderRadius: 22, borderWidth: 1.5, padding: 18, alignItems: 'center', shadowColor: '#8B5CF6', shadowOpacity: 0.1, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 4 },
  statIconContainer: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  statValue: { fontSize: 24, fontWeight: '800', marginBottom: 4 },
  statLabel: { fontSize: 12, fontWeight: '600', letterSpacing: 0.3 },
  card: { borderRadius: 28, borderWidth: 1.5, padding: 22, marginBottom: 18 },
  treeHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 14 },
  treeIconContainer: { width: 52, height: 52, borderRadius: 18, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  treeIcon: { zIndex: 1 },
  treeTitleContainer: { flex: 1 },
  cardTitle: { fontSize: 20, fontWeight: '700', marginBottom: 4, letterSpacing: 0.3 },
  cardLevel: { color: '#10B981', fontSize: 14, fontWeight: '600' },
  progressBarBg: { width: '100%', height: 12, backgroundColor: 'rgba(16, 185, 129, 0.15)', borderRadius: 12, marginBottom: 14, overflow: 'hidden' },
  progressBarFill: { height: 12, borderRadius: 12, overflow: 'hidden' },
  cardDesc: { fontSize: 14, textAlign: 'center', lineHeight: 22 },
  cardRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 12 },
  analysisIconContainer: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  cardSectionTitle: { fontSize: 18, fontWeight: '700', letterSpacing: 0.3 },
  analysisText: { fontSize: 16, marginBottom: 14, textAlign: 'center' },
  analysisBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 8, gap: 14 },
  analysisIconCircle: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  analysisPercent: { fontSize: 24, fontWeight: '800' },
  analysisSub: { fontSize: 14, textAlign: 'center', fontWeight: '600' },
  historyIconContainer: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  publicIconContainer: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  emptyHistory: { textAlign: 'center', marginTop: 10, lineHeight: 24, paddingHorizontal: 10 },
  historyItem: { borderRadius: 18, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(139, 92, 246, 0.1)' },
  historyRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6, gap: 10 },
  historyDate: { fontSize: 13 },
  historyTag: { color: '#FBBF24', fontSize: 13, fontWeight: '700' },
  historyText: { fontSize: 15, marginBottom: 8, lineHeight: 22 },
  historyMetaRow: { flexDirection: 'row', justifyContent: 'space-between' },
  historyMeta: { fontSize: 12 },
  historyBtn: { marginTop: 12, width: '100%', borderRadius: 18, overflow: 'hidden' },
  historyBtnGradient: { paddingVertical: 16, alignItems: 'center', borderRadius: 18 },
  historyBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15, letterSpacing: 0.3 },
  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 24, marginBottom: 14, gap: 14 },
  bottomBtn: { flex: 1, borderRadius: 20, overflow: 'hidden' },
  bottomBtnGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, gap: 10 },
  bottomBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14, letterSpacing: 0.3 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { borderRadius: 32, padding: 36, alignItems: 'center', width: 340, maxWidth: '90%' },
  prizeIconContainer: { width: 100, height: 100, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 20, overflow: 'hidden' },
  modalTitle: { fontSize: 28, fontWeight: '800', marginBottom: 14, letterSpacing: 0.5 },
  modalDesc: { fontSize: 16, textAlign: 'center', marginBottom: 20, lineHeight: 24 },
  modalButton: { borderRadius: 18, overflow: 'hidden' },
  modalButtonGradient: { paddingHorizontal: 40, paddingVertical: 16 },
  modalButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 18, letterSpacing: 0.3 },
});

export default ProfileScreen;
