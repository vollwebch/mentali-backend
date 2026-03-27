import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View, Modal, SafeAreaView, StatusBar, Platform, Animated, Easing } from 'react-native';
import { useTheme } from '../../ThemeContext';
import { useThoughts } from '../../components/ThoughtsContext';
import { Colors } from '../../constants/Colors';
import { PRIZES } from '../../constants/Prizes';

const TAB_BAR_HEIGHT = Platform.OS === 'ios' ? 95 : 80;

// Shimmer effect component
function ShimmerEffect({ children }: { children: React.ReactNode }) {
  const shimmerAnim = useRef(new Animated.Value(-1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 2,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const translateX = shimmerAnim.interpolate({
    inputRange: [-1, 2],
    outputRange: [-300, 300],
  });

  return (
    <View style={StyleSheet.absoluteFill}>
      {children}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            transform: [{ translateX }],
          },
        ]}
      >
        <LinearGradient
          colors={['transparent', 'rgba(255,255,255,0.3)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
}

// Animated progress bar
function AnimatedProgressBar({ progress }: { progress: number }) {
  const widthAnim = useRef(new Animated.Value(0)).current;
  const shimmerAnim = useRef(new Animated.Value(-1)).current;

  useEffect(() => {
    Animated.spring(widthAnim, {
      toValue: progress,
      friction: 8,
      tension: 40,
      useNativeDriver: false,
    }).start();

    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 2,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [progress]);

  const translateX = shimmerAnim.interpolate({
    inputRange: [-1, 2],
    outputRange: [-100, 100],
  });

  return (
    <View style={styles.progressBarBg}>
      <Animated.View style={[styles.progressBarFill, { width: widthAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '100%'],
      }) }]}>
        <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ translateX }] }]}>
          <LinearGradient
            colors={['transparent', 'rgba(255,255,255,0.4)', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      </Animated.View>
    </View>
  );
}

// 3D Prize Card
function PrizeCard3D({ prize, unlocked, darkMode }: { prize: any; unlocked: boolean; darkMode: boolean }) {
  const rotateY = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  const isIconName = typeof prize.icon === 'string' && prize.icon.length > 2;

  useEffect(() => {
    if (unlocked) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [unlocked]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
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
    <TouchableOpacity
      activeOpacity={0.9}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.prizeCardWrapper}
    >
      <Animated.View
        style={[
          styles.prizeCard,
          unlocked ? styles.prizeCardUnlocked : styles.prizeCardLocked,
          { 
            backgroundColor: unlocked 
              ? (darkMode ? 'rgba(22, 22, 22, 0.95)' : 'rgba(255, 255, 255, 0.95)')
              : (darkMode ? 'rgba(20, 20, 20, 0.9)' : 'rgba(245, 245, 245, 0.95)'),
            transform: [{ scale: scaleAnim }],
            borderColor: unlocked 
              ? (darkMode ? 'rgba(139, 92, 246, 0.3)' : 'rgba(139, 92, 246, 0.2)')
              : 'transparent',
          }
        ]}
      >
        {unlocked && (
          <Animated.View style={[styles.prizeGlow, { opacity: glowAnim }]}>
            <LinearGradient
              colors={[prize.color + '60', 'transparent']}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
        )}

        <View style={[
          styles.prizeIconContainer,
          { 
            backgroundColor: unlocked 
              ? (prize.color + '25')
              : (darkMode ? 'rgba(50, 50, 50, 0.5)' : 'rgba(200, 200, 200, 0.3)')
          }
        ]}>
          {unlocked ? (
            isIconName ? (
              <MaterialCommunityIcons name={prize.icon as any} size={32} color={prize.color} />
            ) : (
              <Text style={styles.prizeEmoji}>{prize.icon}</Text>
            )
          ) : (
            <MaterialCommunityIcons name="lock" size={24} color={darkMode ? '#4B5563' : '#9CA3AF'} />
          )}
        </View>
        <Text style={[
          styles.prizeTitle,
          { color: unlocked ? (darkMode ? '#FFFFFF' : '#1F2937') : (darkMode ? '#4B5563' : '#9CA3AF') }
        ]} numberOfLines={2}>
          {prize.title}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

function getSafeIcon(icon: any): string {
  if (typeof icon === 'string' && icon.length > 2) {
    return icon;
  }
  return 'trophy';
}

export default function PremiosScreen() {
  const { theme } = useTheme();
  const darkMode = theme === 'dark';
  const colors = Colors[theme];
  const { allThoughts, userStats } = useThoughts();
  
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showAllUnlocked, setShowAllUnlocked] = useState(false);
  const [showAllLocked, setShowAllLocked] = useState(false);

  // User stats
  const stats = {
    thoughts: userStats.thoughts || 0,
    likes: userStats.likes || 0,
    days: userStats.days || 1,
    level: userStats.level || 1,
    emotions: userStats.emotions || {},
  };

  // Calculate prizes
  const ALL_PRIZES = useMemo(() => {
    return PRIZES.map(prize => ({
      ...prize,
      unlocked: prize.isUnlocked ? prize.isUnlocked(stats) : false,
      color: prize.color || '#8B5CF6',
    }));
  }, [stats]);

  const unlockedPrizes = ALL_PRIZES.filter(p => p.unlocked);
  const lockedPrizes = ALL_PRIZES.filter(p => !p.unlocked);
  const visibleUnlockedPrizes = showAllUnlocked ? unlockedPrizes : unlockedPrizes.slice(0, 8);
  const visibleLockedPrizes = showAllLocked ? lockedPrizes : lockedPrizes.slice(0, 8);

  const progressToNext = stats.thoughts / Math.max(1, (stats.level + 1) * 2);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: darkMode ? '#0A0A0A' : '#FFFFFF' }]}>
      <StatusBar barStyle={darkMode ? 'light-content' : 'dark-content'} backgroundColor={darkMode ? '#0A0A0A' : '#FFFFFF'} />
      
      <View style={styles.contentContainer}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scrollContent, { paddingBottom: TAB_BAR_HEIGHT + 20 }]}>
          {/* Header */}
          <View style={styles.headerRow}>
            <Text style={[styles.headerTitle, { color: darkMode ? '#FFFFFF' : '#1F2937' }]}>Premios</Text>
            <View style={styles.headerButtons}>
              <TouchableOpacity style={[styles.headerBtn, { backgroundColor: darkMode ? 'rgba(139, 92, 246, 0.15)' : '#F5F3FF' }]} onPress={() => setShowStats(true)}>
                <Feather name="bar-chart-2" size={22} color="#8B5CF6" />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.headerBtn, { backgroundColor: darkMode ? 'rgba(139, 92, 246, 0.15)' : '#F5F3FF' }]} onPress={() => setSettingsVisible(true)}>
                <Feather name="settings" size={22} color="#8B5CF6" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Epic Stats Banner with Shimmer */}
          <View style={styles.statsBannerContainer}>
            <LinearGradient 
              colors={['#8B5CF6', '#A855F7', '#EC4899']} 
              style={styles.statsBanner}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <ShimmerEffect>
                <View style={StyleSheet.absoluteFill} />
              </ShimmerEffect>
              
              <View style={styles.statsBannerIcon}>
                <LinearGradient
                  colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)']}
                  style={StyleSheet.absoluteFill}
                />
                <MaterialCommunityIcons name="trophy-award" size={36} color="#FFFFFF" />
              </View>
              <Text style={styles.statsBannerTitle}>Tu Colección Épica</Text>
              <Text style={styles.statsBannerDesc}>Celebra tus logros emocionales</Text>
              
              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <Text style={styles.statNumber}>{unlockedPrizes.length}</Text>
                  <Text style={styles.statLabel}>Desbloqueados</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statBox}>
                  <Text style={styles.statNumber}>{ALL_PRIZES.length}</Text>
                  <Text style={styles.statLabel}>Total</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statBox}>
                  <Text style={styles.statNumber}>{stats.level}</Text>
                  <Text style={styles.statLabel}>Nivel</Text>
                </View>
              </View>

              {/* Progress to next level */}
              <View style={styles.levelProgress}>
                <Text style={styles.levelProgressText}>Progreso al siguiente nivel</Text>
                <AnimatedProgressBar progress={progressToNext} />
              </View>
            </LinearGradient>
          </View>

          {/* Unlocked Prizes */}
          <View style={[styles.sectionCard, { backgroundColor: darkMode ? 'rgba(22, 22, 22, 0.95)' : 'rgba(255, 255, 255, 0.95)', borderColor: darkMode ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.1)' }]}>
            <View style={styles.sectionHeader}>
              <LinearGradient
                colors={['#FBBF24', '#F59E0B']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.sectionIconGradient}
              >
                <MaterialCommunityIcons name="medal" size={24} color="#FFFFFF" />
              </LinearGradient>
              <Text style={[styles.sectionTitle, { color: darkMode ? '#FFFFFF' : '#1F2937' }]}>Desbloqueados ({unlockedPrizes.length})</Text>
            </View>
            {unlockedPrizes.length === 0 ? (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons name="trophy-outline" size={48} color={darkMode ? '#6B7280' : '#9CA3AF'} />
                <Text style={[styles.emptyText, { color: darkMode ? '#6B7280' : '#9CA3AF' }]}>Aún no tienes premios</Text>
              </View>
            ) : (
              <>
                <View style={styles.prizesGrid}>
                  {visibleUnlockedPrizes.map(prize => (
                    <PrizeCard3D key={prize.id} prize={prize} unlocked={true} darkMode={darkMode} />
                  ))}
                </View>
                {unlockedPrizes.length > 8 && (
                  <TouchableOpacity onPress={() => setShowAllUnlocked(!showAllUnlocked)} style={styles.viewMoreBtn}>
                    <Text style={[styles.viewMoreText, { color: '#8B5CF6' }]}>
                      {showAllUnlocked ? 'Ver menos' : `Ver todos (${unlockedPrizes.length})`}
                    </Text>
                    <Feather name={showAllUnlocked ? 'chevron-up' : 'chevron-down'} size={18} color="#8B5CF6" />
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>

          {/* Locked Prizes */}
          <View style={[styles.sectionCard, { backgroundColor: darkMode ? 'rgba(22, 22, 22, 0.95)' : 'rgba(255, 255, 255, 0.95)', borderColor: darkMode ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.1)' }]}>
            <View style={styles.sectionHeader}>
              <LinearGradient
                colors={darkMode ? ['#4B5563', '#374151'] : ['#9CA3AF', '#6B7280']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.sectionIconGradient}
              >
                <MaterialCommunityIcons name="lock" size={24} color="#FFFFFF" />
              </LinearGradient>
              <Text style={[styles.sectionTitle, { color: darkMode ? '#FFFFFF' : '#1F2937' }]}>Por Desbloquear ({lockedPrizes.length})</Text>
            </View>
            <View style={styles.prizesGrid}>
              {visibleLockedPrizes.map(prize => (
                <PrizeCard3D key={prize.id} prize={prize} unlocked={false} darkMode={darkMode} />
              ))}
            </View>
            {lockedPrizes.length > 8 && (
              <TouchableOpacity onPress={() => setShowAllLocked(!showAllLocked)} style={styles.viewMoreBtn}>
                <Text style={[styles.viewMoreText, { color: '#8B5CF6' }]}>
                  {showAllLocked ? 'Ver menos' : `Ver todos (${lockedPrizes.length})`}
                </Text>
                <Feather name={showAllUnlocked ? 'chevron-up' : 'chevron-down'} size={18} color="#8B5CF6" />
              </TouchableOpacity>
            )}
          </View>

          {/* How to Win */}
          <View style={[styles.sectionCard, { backgroundColor: darkMode ? 'rgba(22, 22, 22, 0.95)' : 'rgba(255, 255, 255, 0.95)', borderColor: darkMode ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.1)' }]}>
            <View style={styles.sectionHeader}>
              <LinearGradient
                colors={['#06B6D4', '#0891B2']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.sectionIconGradient}
              >
                <MaterialCommunityIcons name="lightbulb" size={24} color="#FFFFFF" />
              </LinearGradient>
              <Text style={[styles.sectionTitle, { color: darkMode ? '#FFFFFF' : '#1F2937' }]}>¿Cómo ganar?</Text>
            </View>
            {[
              { icon: 'pencil', text: 'Escribe pensamientos cada día', color: '#8B5CF6' },
              { icon: 'heart', text: 'Recibe apoyo de la comunidad', color: '#EC4899' },
              { icon: 'calendar-check', text: 'Mantén tu racha activa', color: '#10B981' },
              { icon: 'arrow-up-bold-circle', text: 'Sube de nivel tu árbol', color: '#06B6D4' },
            ].map((item, index) => (
              <View key={index} style={[styles.howToWinItem, { backgroundColor: darkMode ? 'rgba(31, 31, 31, 0.9)' : 'rgba(250, 250, 250, 0.95)' }]}>
                <LinearGradient
                  colors={[item.color, item.color + 'CC']}
                  style={styles.howToWinNumber}
                >
                  <Text style={styles.howToWinNumberText}>{index + 1}</Text>
                </LinearGradient>
                <MaterialCommunityIcons name={item.icon as any} size={24} color={item.color} />
                <Text style={[styles.howToWinText, { color: darkMode ? '#FFFFFF' : '#1F2937' }]}>{item.text}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Settings Modal */}
      <Modal transparent visible={settingsVisible} onRequestClose={() => setSettingsVisible(false)} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: darkMode ? '#161616' : '#FFFFFF' }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: darkMode ? '#FFFFFF' : '#1F2937' }]}>Ajustes</Text>
              <TouchableOpacity onPress={() => setSettingsVisible(false)} style={styles.closeBtn}>
                <Feather name="x" size={24} color={darkMode ? '#6B7280' : '#9CA3AF'} />
              </TouchableOpacity>
            </View>
            <View style={[styles.settingRow, { backgroundColor: darkMode ? 'rgba(31, 31, 31, 0.9)' : 'rgba(250, 250, 250, 0.95)' }]}>
              <View style={styles.settingLeft}>
                <MaterialCommunityIcons name="vibrate" size={24} color="#8B5CF6" />
                <Text style={[styles.settingLabel, { color: darkMode ? '#FFFFFF' : '#1F2937' }]}>Vibración Háptica</Text>
              </View>
              <Switch
                value={vibrationEnabled}
                onValueChange={setVibrationEnabled}
                trackColor={{ false: '#767577', true: 'rgba(139, 92, 246, 0.5)' }}
                thumbColor={vibrationEnabled ? '#8B5CF6' : '#F4F3F4'}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Stats Modal */}
      <Modal transparent visible={showStats} onRequestClose={() => setShowStats(false)} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: darkMode ? '#161616' : '#FFFFFF' }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: darkMode ? '#FFFFFF' : '#1F2937' }]}>Estadísticas</Text>
              <TouchableOpacity onPress={() => setShowStats(false)} style={styles.closeBtn}>
                <Feather name="x" size={24} color={darkMode ? '#6B7280' : '#9CA3AF'} />
              </TouchableOpacity>
            </View>
            <View style={styles.statsSection}>
              <Text style={[styles.statsSectionTitle, { color: '#8B5CF6' }]}>Actividad</Text>
              <View style={styles.statRow}>
                <Text style={[styles.statLabelModal, { color: darkMode ? '#9CA3AF' : '#6B7280' }]}>Pensamientos</Text>
                <Text style={[styles.statValueModal, { color: darkMode ? '#FFFFFF' : '#1F2937' }]}>{stats.thoughts}</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={[styles.statLabelModal, { color: darkMode ? '#9CA3AF' : '#6B7280' }]}>Racha</Text>
                <Text style={[styles.statValueModal, { color: darkMode ? '#FFFFFF' : '#1F2937' }]}>{stats.days} días</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={[styles.statLabelModal, { color: darkMode ? '#9CA3AF' : '#6B7280' }]}>Likes recibidos</Text>
                <Text style={[styles.statValueModal, { color: darkMode ? '#FFFFFF' : '#1F2937' }]}>{stats.likes}</Text>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentContainer: { flex: 1, maxWidth: 480, width: '100%', alignSelf: 'center' },
  scrollContent: { paddingHorizontal: 18 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 18, paddingBottom: 18 },
  headerTitle: { fontSize: 30, fontWeight: '800', letterSpacing: 0.5 },
  headerButtons: { flexDirection: 'row', gap: 12 },
  headerBtn: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  statsBannerContainer: { borderRadius: 28, overflow: 'hidden', marginBottom: 20 },
  statsBanner: { padding: 26, alignItems: 'center' },
  statsBannerIcon: { width: 72, height: 72, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 16, overflow: 'hidden' },
  statsBannerTitle: { color: '#FFFFFF', fontSize: 26, fontWeight: '800', marginBottom: 6, letterSpacing: 0.5 },
  statsBannerDesc: { color: 'rgba(255,255,255,0.85)', fontSize: 15, marginBottom: 20 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-evenly', width: '100%', alignItems: 'center' },
  statBox: { alignItems: 'center', flex: 1 },
  statDivider: { width: 1, height: 44, backgroundColor: 'rgba(255,255,255,0.25)' },
  statNumber: { color: '#FFFFFF', fontSize: 32, fontWeight: '800' },
  statLabel: { color: 'rgba(255,255,255,0.75)', fontSize: 12, marginTop: 6, fontWeight: '600' },
  levelProgress: { width: '100%', marginTop: 20, paddingHorizontal: 10 },
  levelProgressText: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginBottom: 8, textAlign: 'center', fontWeight: '600' },
  progressBarBg: { width: '100%', height: 10, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 10, overflow: 'hidden' },
  progressBarFill: { height: 10, backgroundColor: '#FFFFFF', borderRadius: 10, overflow: 'hidden' },
  sectionCard: { borderRadius: 28, borderWidth: 1.5, padding: 22, marginBottom: 18 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 14 },
  sectionIconGradient: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { fontSize: 19, fontWeight: '700', letterSpacing: 0.3 },
  emptyState: { alignItems: 'center', paddingVertical: 36, gap: 14 },
  emptyText: { fontSize: 15, fontWeight: '500' },
  prizesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  prizeCardWrapper: { width: '23.5%' },
  prizeCard: { aspectRatio: 1, borderRadius: 20, padding: 12, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderWidth: 1.5 },
  prizeCardUnlocked: { shadowColor: '#8B5CF6', shadowOpacity: 0.2, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 6 },
  prizeCardLocked: { shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 3 }, elevation: 3 },
  prizeGlow: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 20 },
  prizeIconContainer: { width: 52, height: 52, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  prizeEmoji: { fontSize: 30 },
  prizeTitle: { fontSize: 11, fontWeight: '700', textAlign: 'center', letterSpacing: 0.2 },
  viewMoreBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 18, gap: 8, paddingVertical: 14 },
  viewMoreText: { fontSize: 15, fontWeight: '700', letterSpacing: 0.3 },
  howToWinItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 18, borderRadius: 18, marginBottom: 10, gap: 14 },
  howToWinNumber: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  howToWinNumberText: { fontSize: 14, fontWeight: '800', color: '#FFFFFF' },
  howToWinText: { fontSize: 15, flex: 1, fontWeight: '500', letterSpacing: 0.2 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { borderRadius: 28, padding: 26, width: 340, maxWidth: '90%' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 26 },
  modalTitle: { fontSize: 24, fontWeight: '800', letterSpacing: 0.3 },
  closeBtn: { width: 42, height: 42, borderRadius: 14, backgroundColor: 'rgba(0,0,0,0.06)', alignItems: 'center', justifyContent: 'center' },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 18, paddingHorizontal: 18, borderRadius: 18 },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  settingLabel: { fontSize: 16, fontWeight: '600' },
  statsSection: { marginBottom: 24 },
  statsSectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16, letterSpacing: 0.3 },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 },
  statLabelModal: { fontSize: 15 },
  statValueModal: { fontSize: 15, fontWeight: '700' },
});
