import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState, useRef, useEffect } from 'react';
import { Animated, FlatList, SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View, Platform, Dimensions, Easing } from 'react-native';
import { useTheme } from '../../ThemeContext';
import EmotionFilter from '../../components/EmotionFilter';
import NavigationBar from '../../components/NavigationBar';
import ThoughtCard from '../../components/ThoughtCard';
import { useThoughts } from '../../components/ThoughtsContext';
import { Colors } from '../../constants/Colors';

const MAX_WIDTH = 480;
const TAB_BAR_HEIGHT = Platform.OS === 'ios' ? 95 : 80;

// Floating particles component
function FloatingParticles({ darkMode }: { darkMode: boolean }) {
  const particles = useRef([...Array(6)].map(() => ({
    x: new Animated.Value(Math.random()),
    y: new Animated.Value(Math.random()),
    scale: new Animated.Value(Math.random() * 0.5 + 0.5),
    opacity: new Animated.Value(Math.random() * 0.3 + 0.1),
  }))).current;

  useEffect(() => {
    particles.forEach((particle, index) => {
      const animate = () => {
        Animated.loop(
          Animated.sequence([
            Animated.parallel([
              Animated.timing(particle.y, {
                toValue: -0.2,
                duration: 8000 + index * 2000,
                easing: Easing.out(Easing.quad),
                useNativeDriver: true,
              }),
              Animated.timing(particle.opacity, {
                toValue: 0,
                duration: 8000 + index * 2000,
                easing: Easing.out(Easing.quad),
                useNativeDriver: true,
              }),
            ]),
            Animated.parallel([
              Animated.timing(particle.y, {
                toValue: 1.2,
                duration: 0,
                useNativeDriver: true,
              }),
              Animated.timing(particle.x, {
                toValue: Math.random(),
                duration: 0,
                useNativeDriver: true,
              }),
              Animated.timing(particle.opacity, {
                toValue: Math.random() * 0.3 + 0.1,
                duration: 0,
                useNativeDriver: true,
              }),
            ]),
          ])
        ).start();
      };
      animate();
    });
  }, []);

  const screenWidth = Dimensions.get('window').width;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {particles.map((particle, index) => (
        <Animated.View
          key={index}
          style={[
            styles.particle,
            {
              left: particle.x.interpolate({
                inputRange: [0, 1],
                outputRange: [0, screenWidth],
              }),
              top: particle.y.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 500],
              }),
              transform: [{ scale: particle.scale }],
              opacity: particle.opacity,
            },
          ]}
        >
          <LinearGradient
            colors={index % 2 === 0 ? ['#8B5CF6', '#EC4899'] : ['#06B6D4', '#10B981']}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      ))}
    </View>
  );
}

// Premium FAB Component
function PremiumFAB({ onPress }: { onPress: () => void }) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Glow animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.5,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Subtle rotation
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 20000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={styles.fabContainer}
    >
      {/* Glow rings */}
      <Animated.View style={[styles.fabGlowRing, { transform: [{ scale: pulseAnim }], opacity: glowAnim }]} />
      <Animated.View style={[styles.fabGlowRing2, { transform: [{ scale: pulseAnim }], opacity: glowAnim }]} />
      
      {/* Main button */}
      <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
        <LinearGradient
          colors={['#8B5CF6', '#EC4899', '#F472B6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fabGradient}
        >
          {/* Inner decorative ring */}
          <Animated.View style={[styles.fabInnerRing, { transform: [{ rotate: rotation }] }]}>
            <MaterialCommunityIcons name="pencil" size={28} color="#FFFFFF" />
          </Animated.View>
        </LinearGradient>
      </Animated.View>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const { theme } = useTheme();
  const colors = Colors[theme];
  const darkMode = theme === 'dark';
  const { thoughts } = useThoughts();
  const [selectedEmotion, setSelectedEmotion] = useState('all');
  const router = useRouter();
  
  const screenWidth = Dimensions.get('window').width;
  const isLargeScreen = screenWidth > 768;

  const filteredPosts = selectedEmotion === 'all'
    ? thoughts
    : thoughts.filter(p => p.emotion === selectedEmotion);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: darkMode ? '#0A0A0A' : '#FFFFFF' }}>
      <StatusBar 
        barStyle={darkMode ? 'light-content' : 'dark-content'} 
        backgroundColor={darkMode ? '#0A0A0A' : '#FFFFFF'} 
      />
      
      <View style={styles.container}>
        {/* Floating particles background */}
        <FloatingParticles darkMode={darkMode} />

        <NavigationBar
          onMapPress={() => router.push('../../emotional-map')}
          onProfilePress={() => router.push('/(tabs)/profile')}
        />

        {/* Gradient accent header */}
        <View style={styles.headerAccent}>
          <LinearGradient
            colors={darkMode ? ['#1E1B4B', '#312E81', '#0A0A0A'] : ['#8B5CF6', '#EC4899', '#FFFFFF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Tu Feed Emocional</Text>
            <Text style={styles.headerSubtitle}>Pensamientos que inspiran</Text>
          </View>
        </View>

        <EmotionFilter selected={selectedEmotion} onSelect={setSelectedEmotion} />

        <FlatList
          data={filteredPosts}
          keyExtractor={item => item.id}
          contentContainerStyle={{ 
            paddingTop: 12, 
            paddingBottom: TAB_BAR_HEIGHT + 90,
            paddingHorizontal: isLargeScreen ? 24 : 0
          }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={[styles.emptyIconContainer, { backgroundColor: darkMode ? 'rgba(139, 92, 246, 0.15)' : '#F5F3FF' }]}>
                <MaterialCommunityIcons 
                  name="thought-bubble-outline" 
                  size={56} 
                  color="#8B5CF6" 
                />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                Sin pensamientos aún
              </Text>
              <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
                ¡Sé el primero en compartir cómo te sientes!
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <ThoughtCard
              emotion={item.emotion}
              emotionEmoji={item.emotionEmoji}
              emotionLabel={item.emotionLabel}
              text={item.text}
              createdAt={item.createdAt}
              expiresInHours={item.expiresInHours}
              reactions={item.reactions}
              aiResponse={item.aiResponse}
            />
          )}
        />

        {/* Premium FAB */}
        <PremiumFAB onPress={() => router.push('/compose')} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    maxWidth: MAX_WIDTH,
    width: '100%',
    alignSelf: 'center',
  },
  particle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  headerAccent: {
    height: 140,
    overflow: 'hidden',
    position: 'relative',
  },
  headerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 15,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 90,
    gap: 18,
    paddingHorizontal: 36,
  },
  emptyIconContainer: {
    width: 110,
    height: 110,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8B5CF6',
    shadowOpacity: 0.2,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  fabContainer: {
    position: 'absolute',
    right: 22,
    bottom: Platform.OS === 'ios' ? 115 : 100,
    zIndex: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabGlowRing: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
  },
  fabGlowRing2: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(236, 72, 153, 0.1)',
  },
  fabGradient: {
    width: 68,
    height: 68,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8B5CF6',
    shadowOpacity: 0.5,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
  },
  fabInnerRing: {
    width: 68,
    height: 68,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
