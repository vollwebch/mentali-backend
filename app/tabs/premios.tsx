import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Dimensions, Modal, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, Vibration, View } from 'react-native';
import { useTheme } from '../../ThemeContext';
import { useThoughts } from '../../components/ThoughtsContext';
import { Colors } from '../../constants/Colors';
import { PRIZES } from '../../constants/Prizes'; // Importar PRIZES

export default function PremiosScreen() {
  const { theme } = useTheme();
  const { allThoughts } = useThoughts();
  const colors = {
    ...Colors[theme],
    card: (Colors[theme] as any).card ?? (theme === 'dark' ? '#23243a' : '#fff'),
    cardBorder: (Colors[theme] as any).cardBorder ?? (theme === 'dark' ? '#23243a' : '#E0E7FF'),
    accent: (Colors[theme] as any).accent ?? Colors[theme].tint ?? '#A78BFA',
    secondaryText: (Colors[theme] as any).secondaryText ?? (theme === 'dark' ? '#a5b4fc' : '#6D28D9'),
    background: Colors[theme].background ?? (theme === 'dark' ? '#18192A' : '#F3F4F6'),
  };
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const screenWidth = Dimensions.get('window').width;
  const slideAnim = useState(new Animated.Value(screenWidth))[0];
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [rewardToShow, setRewardToShow] = useState(null);
  const soundRef = useRef(null);
  
  // Estados para controlar la expansión de premios
  const [showAllUnlocked, setShowAllUnlocked] = useState(false);
  const [showAllLocked, setShowAllLocked] = useState(false);
  
  // Estado para trackear premios desbloqueados
  const [previouslyUnlockedPrizes, setPreviouslyUnlockedPrizes] = useState<Set<string>>(new Set());
  const [newlyUnlockedPrizes, setNewlyUnlockedPrizes] = useState<any[]>([]);

  // Cargar configuración guardada
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedSound = await AsyncStorage.getItem('soundEnabled');
        const savedVibration = await AsyncStorage.getItem('vibrationEnabled');
        
        if (savedSound !== null) {
          setSoundEnabled(JSON.parse(savedSound));
        }
        if (savedVibration !== null) {
          setVibrationEnabled(JSON.parse(savedVibration));
        }
        
        console.log("⚙️ Configuración cargada - Sonido:", savedSound, "Vibración:", savedVibration);
      } catch (error) {
        console.log("❌ Error cargando configuración:", error);
      }
    };
    
    loadSettings();
  }, []);

  // Guardar configuración cuando cambie
  const updateSoundSetting = async (enabled: boolean) => {
    setSoundEnabled(enabled);
    try {
      await AsyncStorage.setItem('soundEnabled', JSON.stringify(enabled));
      console.log("💾 Sonido guardado:", enabled);
    } catch (error) {
      console.log("❌ Error guardando sonido:", error);
    }
  };

  const updateVibrationSetting = async (enabled: boolean) => {
    setVibrationEnabled(enabled);
    try {
      await AsyncStorage.setItem('vibrationEnabled', JSON.stringify(enabled));
      console.log("💾 Vibración guardada:", enabled);
    } catch (error) {
      console.log("❌ Error guardando vibración:", error);
    }
  };

  // Calcular datos reales del usuario
  const userThoughts = allThoughts.length;
  const userLevel = Math.floor(userThoughts / 5) + 1; // 1 nivel cada 5 pensamientos
  const userLikes = allThoughts.reduce((total, thought) => total + (thought.reactions?.heart || 0), 0);
  const userDays = allThoughts.length > 0 ? Math.max(1, Math.floor((Date.now() - Math.min(...allThoughts.map(t => new Date(t.createdAt).getTime()))) / (1000 * 60 * 60 * 24))) : 1;
  const userComments = allThoughts.reduce((total, thought) => total + (thought.reactions?.message || 0), 0);
  const userHelpedOthers = Math.floor(userThoughts * 0.1); // Simulado: 10% de pensamientos ayudan a otros
  const userAIInsights = allThoughts.filter(t => t.aiResponse).length;

  // Calcular rachas emocionales
  const userEmotionStreaks = {
    joy: allThoughts.filter(t => t.emotion === 'joy').length,
    gratitude: allThoughts.filter(t => t.emotion === 'gratitude').length,
    reflection: allThoughts.filter(t => t.emotion === 'reflection').length,
    resilience: allThoughts.filter(t => t.emotion === 'resilience').length,
    sadness: allThoughts.filter(t => t.emotion === 'sadness').length,
    anger: allThoughts.filter(t => t.emotion === 'anger').length,
    fear: allThoughts.filter(t => t.emotion === 'fear').length,
    surprise: allThoughts.filter(t => t.emotion === 'surprise').length,
  };

  // Sistema completo de premios con datos reales
  const ALL_PRIZES = useMemo(() => {
    const stats = {
      thoughts: userThoughts,
      level: userLevel,
      likes: userLikes,
      days: userDays,
      comments: userComments,
      helpedOthers: userHelpedOthers,
      insights: userAIInsights,
      emotions: userEmotionStreaks,
    };

    return PRIZES.map(prize => ({
      ...prize,
      unlocked: prize.isUnlocked(stats),
    }));
  }, [userThoughts, userLevel, userLikes, userDays, userComments, userHelpedOthers, userAIInsights, userEmotionStreaks]);

  // Función para mostrar un premio (simulación, deberías llamarla cuando el usuario desbloquee un premio real)
  const handleShowReward = useCallback(async (prize: any) => {
    console.log("🎉 Mostrando premio:", prize.title);
    console.log("🔊 Sonido habilitado:", soundEnabled);
    console.log("📳 Vibración habilitada:", vibrationEnabled);
    
    setRewardToShow(prize);
    setShowRewardModal(true);

    // Efectos de celebración
    if (vibrationEnabled) {
      try {
        console.log("📳 Reproduciendo vibración...");
        await Vibration.vibrate([100, 50, 100], true); // Vibración más suave
      } catch (error) {
        console.log("❌ Vibración no disponible:", error);
      }
    }

    if (soundEnabled) {
      try {
        console.log("🔊 Reproduciendo sonido...");
        await playSound();
      } catch (error) {
        console.log("❌ Sonido no disponible:", error);
      }
    } else {
      console.log("🔇 Sonido deshabilitado en configuraciones");
    }
  }, [soundEnabled, vibrationEnabled]);

  // Detectar premios recién desbloqueados
  useEffect(() => {
    const currentlyUnlockedPrizes = ALL_PRIZES.filter(p => p.unlocked);
    const currentlyUnlockedIds = new Set(currentlyUnlockedPrizes.map(p => p.id));
    
    // Encontrar premios que no estaban desbloqueados antes
    const newUnlockedPrizes = currentlyUnlockedPrizes.filter(prize => 
      !previouslyUnlockedPrizes.has(prize.id)
    );
    
    if (newUnlockedPrizes.length > 0) {
      console.log("🎉 Nuevos premios desbloqueados:", newUnlockedPrizes.map(p => p.title));
      setNewlyUnlockedPrizes(newUnlockedPrizes);
      // Mostrar el primer premio desbloqueado
      handleShowReward(newUnlockedPrizes[0]);
    }
    
    // Actualizar el estado de premios previamente desbloqueados
    setPreviouslyUnlockedPrizes(currentlyUnlockedIds);
  }, [ALL_PRIZES, previouslyUnlockedPrizes, handleShowReward]);

  // Función para mostrar el siguiente premio desbloqueado
  const showNextUnlockedPrize = () => {
    if (newlyUnlockedPrizes.length > 1) {
      const remainingPrizes = newlyUnlockedPrizes.slice(1);
      setNewlyUnlockedPrizes(remainingPrizes);
      handleShowReward(remainingPrizes[0]);
    } else {
      setNewlyUnlockedPrizes([]);
      setShowRewardModal(false);
    }
  };

  const categories = [
    { id: 'all', name: 'Todos', icon: 'trophy-award' as const, color: '#ffd700' },
    { id: 'thought-count', name: 'Pensamientos', icon: 'lightbulb-on-outline' as const, color: '#3b82f6' },
    { id: 'like-count', name: 'Likes', icon: 'heart' as const, color: '#f472b6' },
    { id: 'day-count', name: 'Días Activos', icon: 'calendar-week' as const, color: '#22c55e' },
    { id: 'emotion-streak', name: 'Emociones', icon: 'emoticon-happy' as const, color: '#fbbf24' },
    { id: 'ai-insight', name: 'IA', icon: 'robot' as const, color: '#06b6d4' },
    { id: 'level-up', name: 'Nivel', icon: 'arrow-up-bold-circle' as const, color: '#a78bfa' },
    { id: 'special-day', name: 'Eventos', icon: 'calendar-star' as const, color: '#3b82f6' },
  ];

  const filteredPrizes = selectedCategory === 'all' 
    ? ALL_PRIZES 
    : ALL_PRIZES.filter(prize => prize.category === selectedCategory);

  const unlockedPrizes = filteredPrizes.filter(p => p.unlocked);
  const lockedPrizes = filteredPrizes.filter(p => !p.unlocked);
  
  // Limitar premios mostrados inicialmente
  const initialUnlockedCount = 10;
  const initialLockedCount = 10;
  const displayedUnlockedPrizes = showAllUnlocked ? unlockedPrizes : unlockedPrizes.slice(0, initialUnlockedCount);
  const displayedLockedPrizes = showAllLocked ? lockedPrizes : lockedPrizes.slice(0, initialLockedCount);

  // Al abrir/cerrar el panel de configuración
  const openSettings = () => {
    setSettingsVisible(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };
  const closeSettings = () => {
    Animated.timing(slideAnim, {
      toValue: screenWidth,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setSettingsVisible(false));
  };

  async function playSound() {
    try {
      // Usar sonido del sistema que sabemos que funciona
      const { sound } = await Audio.Sound.createAsync(
        { uri: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav' },
        { shouldPlay: true, volume: 1.0 }
      );
      
      soundRef.current = sound as any;
      await sound.playAsync();
      
      // Limpiar el sonido después de reproducirlo
      sound.setOnPlaybackStatusUpdate((status: any) => {
        if (status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (error) {
      console.log("Sonido no disponible, usando vibración intensa como fallback");
      // Fallback: vibración más intensa
      try {
        await Vibration.vibrate([100, 50, 100], true);
        setTimeout(async () => {
          await Vibration.vibrate([100, 50, 100], true);
        }, 100);
        setTimeout(async () => {
          await Vibration.vibrate([100, 50, 100], true);
        }, 300);
      } catch (vibError) {
        console.log("Ni siquiera vibración disponible");
      }
    }
  }

  const router = useRouter();

  

  // Limpieza del sonido al desmontar el componente
  useEffect(() => {
    return () => {
      if (soundRef.current && typeof (soundRef.current as any).unloadAsync === 'function') {
        (soundRef.current as any).unloadAsync();
      }
    };
  }, []);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ paddingBottom: 32 }}>
      {/* Header con título y acciones */}
      <View style={[styles.headerRow, { backgroundColor: colors.card }] }>
        <TouchableOpacity style={[styles.headerBtn, { backgroundColor: colors.accent + '22' }]} onPress={() => setShowStats(!showStats)}>
          <Feather name="bar-chart-2" size={22} color={colors.accent} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Mis Premios</Text>
        <TouchableOpacity style={[styles.headerBtn, { backgroundColor: colors.accent + '22' }]} onPress={openSettings}>
          <Feather name="settings" size={22} color={colors.accent} />
        </TouchableOpacity>
      </View>

      {/* Tarjeta de bienvenida */}
      <LinearGradient colors={theme === 'dark' ? [colors.card, colors.cardBorder] : ['#fff', '#f3f4f6']} style={styles.card}>
        <View style={[styles.cardIconCircle, { backgroundColor: 'rgba(255,215,0,0.10)', borderWidth: 2, borderColor: '#7c5e00' }]}> 
          <MaterialCommunityIcons name="trophy-award" size={36} color="#FFC300" style={{ textShadowColor: '#FFD700', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 6 }} />
        </View>
        <Text style={[styles.cardTitleText, { color: colors.text }]}>Tu Colección de Premios</Text>
        <Text style={[styles.cardDesc, { color: colors.secondaryText }]}>Celebra tus logros y crecimiento emocional</Text>
        
        {/* Botón de prueba de sonido */}
        <TouchableOpacity 
          style={{
            backgroundColor: colors.accent,
            borderRadius: 12,
            paddingHorizontal: 20,
            paddingVertical: 10,
            marginTop: 12,
          }}
          onPress={async () => {
            console.log("🔊 Probando sonido...");
            console.log("🔊 Sonido habilitado:", soundEnabled);
            if (soundEnabled) {
              await playSound();
            } else {
              console.log("🔇 Sonido deshabilitado");
            }
          }}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 14 }}>
            🔊 Probar Sonido
          </Text>
        </TouchableOpacity>
        
        <View style={styles.statsRow}>
          <View style={[styles.statBox, { position: 'absolute', left: 20 }] }>
            <Text style={[styles.statNumber, { color: colors.accent }]}>{ALL_PRIZES.filter(p => p.unlocked).length}</Text>
            <Text style={[styles.statLabel, { color: colors.secondaryText }]}>Desbloqueados</Text>
          </View>
          <View style={[styles.statBox, { alignItems: 'center' }] }>
            <Text style={[styles.statNumber, { color: colors.accent }]}>{ALL_PRIZES.length}</Text>
            <Text style={[styles.statLabel, { color: colors.secondaryText }]}>Total</Text>
          </View>
          <View style={[styles.statBox, { position: 'absolute', right: 60 }] }>
            <Text style={[styles.statNumber, { color: colors.accent }]}>{userLevel}</Text>
            <Text style={[styles.statLabel, { color: colors.secondaryText }]}>Nivel</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Filtros por categoría */}
      <View style={[styles.card, { backgroundColor: colors.card, marginTop: 18 }] }>
        <View style={styles.cardRow}>
          <MaterialCommunityIcons name="filter-variant" size={22} color={colors.accent} style={{ marginRight: 8 }} />
          <Text style={[styles.cardTitleText, { color: colors.accent, fontSize: 18 }]}>Filtrar por Categoría</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesRow}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryBtn,
                selectedCategory === category.id && { backgroundColor: category.color }
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <MaterialCommunityIcons name={category.icon} size={20} color={selectedCategory === category.id ? '#fff' : category.color} />
              <Text style={[styles.categoryText, selectedCategory === category.id && { color: '#fff' }] }>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Panel lateral de configuración */}
      <Modal visible={settingsVisible} transparent animationType="none">
        <TouchableOpacity style={styles.drawerOverlay} activeOpacity={1} onPress={closeSettings} />
        <Animated.View style={[styles.drawer, { backgroundColor: colors.card, transform: [{ translateX: slideAnim }] }] }>
          <View style={styles.drawerHeader}>
            <Text style={[styles.drawerTitle, { color: colors.text }]}>Configuración</Text>
            <TouchableOpacity onPress={closeSettings}>
              <Feather name="x" size={24} color={colors.accent} />
            </TouchableOpacity>
          </View>
          <View style={styles.drawerOptionRow}>
            <Text style={[styles.drawerOptionLabel, { color: colors.text }]}>Sonido al ganar premio</Text>
            <Switch 
              value={soundEnabled} 
              onValueChange={updateSoundSetting}
              trackColor={{ false: colors.cardBorder, true: colors.accent }}
              thumbColor={soundEnabled ? colors.accent : '#f4f3f4'}
            />
          </View>
          <View style={styles.drawerOptionRow}>
            <Text style={[styles.drawerOptionLabel, { color: colors.text }]}>Vibración al ganar premio</Text>
            <Switch 
              value={vibrationEnabled} 
              onValueChange={updateVibrationSetting}
              trackColor={{ false: colors.cardBorder, true: colors.accent }}
              thumbColor={vibrationEnabled ? colors.accent : '#f4f3f4'}
            />
          </View>
        </Animated.View>
      </Modal>

      {/* Modal de estadísticas rápidas */}
      <Modal visible={showStats} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: '#000a', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: colors.card, borderRadius: 18, padding: 24, width: 320, maxHeight: '80%' }}>
            <View style={styles.drawerHeader}>
              <Text style={[styles.drawerTitle, { color: colors.text }]}>Estadísticas</Text>
              <TouchableOpacity onPress={() => setShowStats(false)}>
                <Feather name="x" size={24} color={colors.accent} />
              </TouchableOpacity>
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Progreso general */}
              <View style={styles.statSection}>
                <Text style={styles.statSectionTitle}>📊 Progreso General</Text>
                <View style={styles.statRow}>
                  <Text style={styles.statLabelModal}>Nivel actual:</Text>
                  <Text style={styles.statValueModal}>{userLevel}</Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={styles.statLabelModal}>Premios desbloqueados:</Text>
                  <Text style={styles.statValueModal}>{ALL_PRIZES.filter(p => p.unlocked).length}/{ALL_PRIZES.length}</Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={styles.statLabelModal}>Porcentaje completado:</Text>
                  <Text style={styles.statValueModal}>{Math.round((ALL_PRIZES.filter(p => p.unlocked).length / ALL_PRIZES.length) * 100)}%</Text>
                </View>
              </View>

              {/* Actividad */}
              <View style={styles.statSection}>
                <Text style={styles.statSectionTitle}>📝 Actividad</Text>
                <View style={styles.statRow}>
                  <Text style={styles.statLabelModal}>Pensamientos escritos:</Text>
                  <Text style={styles.statValueModal}>{userThoughts}</Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={styles.statLabelModal}>Likes recibidos:</Text>
                  <Text style={styles.statValueModal}>{userLikes}</Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={styles.statLabelModal}>Días activos:</Text>
                  <Text style={styles.statValueModal}>{userDays}</Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={styles.statLabelModal}>Comentarios recibidos:</Text>
                  <Text style={styles.statValueModal}>{userComments}</Text>
                </View>
              </View>

              {/* Próximos logros */}
              <View style={styles.statSection}>
                <Text style={styles.statSectionTitle}>🎯 Próximos Logros</Text>
                <View style={styles.statRow}>
                  <Text style={styles.statLabelModal}>Siguiente nivel:</Text>
                  <Text style={styles.statValueModal}>Nivel {userLevel + 1}</Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={styles.statLabelModal}>Pensamientos para próximo premio:</Text>
                  <Text style={styles.statValueModal}>{Math.max(0, 10 - userThoughts)}</Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={styles.statLabelModal}>Likes para próximo premio:</Text>
                  <Text style={styles.statValueModal}>{Math.max(0, 10 - userLikes)}</Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={styles.statLabelModal}>Días para racha de 7:</Text>
                  <Text style={styles.statValueModal}>{Math.max(0, 7 - userDays)}</Text>
                </View>
              </View>

              {/* Categorías más activas */}
              <View style={styles.statSection}>
                <Text style={styles.statSectionTitle}>🏆 Categorías Destacadas</Text>
                <View style={styles.statRow}>
                  <Text style={styles.statLabelModal}>Premios por nivel:</Text>
                  <Text style={styles.statValueModal}>{ALL_PRIZES.filter(p => p.category === 'level' && p.unlocked).length}</Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={styles.statLabelModal}>Logros conseguidos:</Text>
                  <Text style={styles.statValueModal}>{ALL_PRIZES.filter(p => p.category === 'achievement' && p.unlocked).length}</Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={styles.statLabelModal}>Rachas emocionales:</Text>
                  <Text style={styles.statValueModal}>{ALL_PRIZES.filter(p => p.category === 'emotion-streak' && p.unlocked).length}</Text>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Sección de premios desbloqueados */}
      {unlockedPrizes.length > 0 && (
        <View style={[styles.card, { backgroundColor: colors.card, marginTop: 18 }] }>
          <View style={styles.cardRow}>
            <MaterialCommunityIcons name="medal" size={22} color={colors.accent} style={{ marginRight: 8 }} />
            <Text style={[styles.cardTitleText, { color: colors.accent, fontSize: 18 }] }>
              Premios Desbloqueados ({unlockedPrizes.length})
            </Text>
          </View>
          <View style={styles.prizesGrid}>
            {displayedUnlockedPrizes.map((prize, index) => {
              const isLegendaryOrSpecial = ('rarity' in prize && prize.rarity === 'legendary');
              return (
                <LinearGradient
                  key={prize.id}
                  colors={isLegendaryOrSpecial ? ['#FFC300', '#FFD700', colors.card] : [prize.color, colors.card]}
                  style={styles.prizeCard}
                >
                  <Text style={[styles.prizeText, { color: colors.text }]}>{prize.title}</Text>
                  <View
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 24,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: isLegendaryOrSpecial ? 'rgba(255,215,0,0.10)' : '#fff',
                      borderWidth: isLegendaryOrSpecial ? 2 : 0,
                      borderColor: isLegendaryOrSpecial ? '#7c5e00' : 'transparent',
                      marginTop: 4,
                    }}
                  >
                    <MaterialCommunityIcons
                      name={prize.icon as any}
                      size={28}
                      color={isLegendaryOrSpecial ? '#FFC300' : prize.color}
                      style={isLegendaryOrSpecial ? { textShadowColor: '#FFD700', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 6 } : undefined}
                    />
                  </View>
                  {prize.level > 0 && <Text style={[styles.prizeLevel, { color: colors.secondaryText }]}>Nivel {prize.level}</Text>}
                </LinearGradient>
              );
            })}
          </View>
          
          {/* Texto para expandir/contraer premios desbloqueados */}
          {unlockedPrizes.length > initialUnlockedCount && (
            <TouchableOpacity onPress={() => setShowAllUnlocked(!showAllUnlocked)}>
              <Text style={[styles.moreText, { color: colors.accent }] }>
                {showAllUnlocked 
                  ? 'Ver menos' 
                  : `+${unlockedPrizes.length - initialUnlockedCount} premios más desbloqueados`
                }
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Sección de premios bloqueados */}
      {lockedPrizes.length > 0 && (
        <View style={[styles.card, { backgroundColor: colors.card, marginTop: 18 }] }>
          <View style={styles.cardRow}>
            <MaterialCommunityIcons name="lock" size={22} color={colors.secondaryText} style={{ marginRight: 8 }} />
            <Text style={[styles.cardTitleText, { color: colors.secondaryText, fontSize: 18 }] }>
              Premios por Desbloquear ({lockedPrizes.length})
            </Text>
          </View>
          <View style={styles.prizesGrid}>
            {displayedLockedPrizes.map((prize, index) => (
              <View key={prize.id} style={[styles.prizeCardLocked, { backgroundColor: colors.cardBorder }] }>
                <Text style={[styles.prizeTextLocked, { color: colors.secondaryText }]}>{prize.title}</Text>
                <View style={styles.lockedIcon}>
                  <MaterialCommunityIcons name={prize.icon as any} size={24} color={prize.color} />
                </View>
                {prize.level > 0 && <Text style={[styles.prizeLevelLocked, { color: colors.secondaryText }]}>Nivel {prize.level}</Text>}
              </View>
            ))}
          </View>
          
          {/* Texto para expandir/contraer premios bloqueados */}
          {lockedPrizes.length > initialLockedCount && (
            <TouchableOpacity style={styles.expandButton} onPress={() => setShowAllLocked(!showAllLocked)}>
              <Text style={styles.expandButtonText}>
                {showAllLocked 
                  ? 'Ver menos' 
                  : `Ver más (${lockedPrizes.length - initialLockedCount})`
                }
              </Text>
              <MaterialCommunityIcons name={showAllLocked ? "chevron-up" : "chevron-down"} size={20} color={colors.text} />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Información adicional */}
      <View style={[styles.card, { backgroundColor: colors.card, marginTop: 18 }] }>
        <View style={styles.cardRow}>
          <MaterialCommunityIcons name="information-outline" size={22} color={colors.tint} style={{ marginRight: 8 }} />
          <Text style={[styles.cardTitleText, { color: colors.tint, fontSize: 18 }]}>¿Cómo ganar premios?</Text>
        </View>
        <Text style={[styles.infoText, { color: colors.text }] }>
          • <Text style={{ color: '#3b82f6' }}>Pensamientos:</Text> Escribe pensamientos regularmente{"\n"}
          • <Text style={{ color: '#f472b6' }}>Likes:</Text> Recibe interacciones en tus pensamientos{"\n"}
          • <Text style={{ color: '#22c55e' }}>Días Activos:</Text> Mantén una racha de uso diario{"\n"}
          • <Text style={{ color: '#fbbf24' }}>Emociones:</Text> Explora y registra diversas emociones{"\n"}
          • <Text style={{ color: '#06b6d4' }}>IA:</Text> Interactúa con las funciones de IA{"\n"}
          • <Text style={{ color: '#a78bfa' }}>Nivel:</Text> Sube de nivel en tu viaje de crecimiento{"\n"}
          • <Text style={{ color: '#3b82f6' }}>Eventos:</Text> Participa en eventos especiales y festividades
        </Text>
      </View>

      {/* Modal de premio */}
      <Modal visible={showRewardModal} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: '#000a', justifyContent: 'center', alignItems: 'center' }}>
          <Animated.View 
            style={{ 
              backgroundColor: colors.card, 
              borderRadius: 18, 
              padding: 32, 
              alignItems: 'center', 
              width: 300,
              shadowColor: colors.accent,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.5,
              shadowRadius: 20,
              elevation: 10,
            }}
          >
            {rewardToShow && (
              (() => {
                const iconName = getSafeIcon((rewardToShow as any).icon);
                return (
                  <>
                    <View style={{
                      width: 80,
                      height: 80,
                      borderRadius: 40,
                      backgroundColor: 'rgba(167,139,250,0.1)',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 16,
                      borderWidth: 2,
                      borderColor: (rewardToShow as any).color,
                    }}>
                      <MaterialCommunityIcons
                        name={iconName as any}
                        size={54}
                        color={(rewardToShow as any).color}
                        style={{ marginBottom: 0 } as any}
                      />
                    </View>
                    <Text style={{ color: '#fff', fontSize: 22, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' }}>
                      ¡Premio desbloqueado! 🎉
                    </Text>
                    <Text style={{ color: '#a5b4fc', fontSize: 16, textAlign: 'center', marginBottom: 16, lineHeight: 22 }}>
                      {(rewardToShow as any).title}
                    </Text>
                    
                    {/* Indicador de múltiples premios */}
                    {newlyUnlockedPrizes.length > 1 && (
                      <Text style={{ color: '#a78bfa', fontSize: 14, textAlign: 'center', marginBottom: 16 }}>
                        {newlyUnlockedPrizes.indexOf(rewardToShow) + 1} de {newlyUnlockedPrizes.length} premios
                      </Text>
                    )}
                    
                    <View style={{ flexDirection: 'row', gap: 12 }}>
                      {newlyUnlockedPrizes.length > 1 && (
                        <TouchableOpacity
                          onPress={showNextUnlockedPrize}
                          style={{
                            backgroundColor: '#475569',
                            borderRadius: 12,
                            paddingHorizontal: 24,
                            paddingVertical: 12,
                          }}
                        >
                          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>
                            Siguiente
                          </Text>
                        </TouchableOpacity>
                      )}
                      
                      <TouchableOpacity
                        onPress={() => {
                          setShowRewardModal(false);
                          setNewlyUnlockedPrizes([]);
                        }}
                        style={{
                          backgroundColor: '#a78bfa',
                          borderRadius: 12,
                          paddingHorizontal: 32,
                          paddingVertical: 12,
                          shadowColor: '#a78bfa',
                          shadowOffset: { width: 0, height: 4 },
                          shadowOpacity: 0.3,
                          shadowRadius: 8,
                          elevation: 5,
                        }}
                      >
                        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>
                          {newlyUnlockedPrizes.length > 1 ? 'Cerrar' : '¡Genial!'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </>
                );
              })()
            )}
          </Animated.View>
        </View>
      </Modal>
    </ScrollView>
  );
}

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
    marginBottom: 16,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginTop: 8,
    position: 'relative',
  },
  statBox: {
    alignItems: 'center',
  },
  statBoxRight: {
    alignItems: 'center',
    marginLeft: 20,
  },
  statNumber: {
    color: '#a7f3d0',
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#e0e7ef',
    fontSize: 12,
    marginTop: 2,
  },
  categoriesRow: {
    flexDirection: 'row',
    width: '100%',
  },
  categoryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: '#334155',
    borderWidth: 1,
    borderColor: '#475569',
  },
  categoryText: {
    color: '#a5b4fc',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  drawerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    zIndex: 1,
  },
  drawer: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: '80%',
    height: '100%',
    backgroundColor: '#23243a',
    padding: 24,
    zIndex: 2,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: -2, height: 0 },
    elevation: 10,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  drawerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  drawerOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  drawerOptionLabel: {
    color: '#a5b4fc',
    fontSize: 16,
  },
  prizesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
  },
  prizeCard: {
    width: '48%',
    height: 120,
    marginBottom: 12,
    borderRadius: 12,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  prizeCardLocked: {
    width: '48%',
    height: 120,
    marginBottom: 12,
    borderRadius: 12,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#334155',
    borderWidth: 1,
    borderColor: '#475569',
  },
  lockedIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#475569',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  prizeText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 4,
  },
  prizeTextLocked: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 4,
  },
  prizeLevel: {
    fontSize: 12,
    color: '#a7f3d0',
    fontWeight: '600',
  },
  prizeLevelLocked: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 12,
    borderRadius: 8,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  expandButtonText: {
    color: '#a78bfa',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
  },
  infoText: {
    color: '#a5b4fc',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'left',
    alignSelf: 'flex-start',
  },
  statSection: {
    marginBottom: 24,
  },
  statSectionTitle: {
    color: '#a78bfa',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  statLabelModal: {
    color: '#a5b4fc',
    fontSize: 16,
  },
  statValueModal: {
    color: '#a7f3d0',
    fontSize: 16,
    fontWeight: 'bold',
  },
});