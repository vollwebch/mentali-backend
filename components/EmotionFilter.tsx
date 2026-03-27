import React, { useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Text, Animated, Easing } from 'react-native';
import { useTheme } from '../ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';

const EMOTIONS = [
  { key: 'all', emoji: '✨', label: 'Todos', gradientColors: ['#8B5CF6', '#EC4899'] },
  { key: 'joy', emoji: '😊', label: 'Alegría', gradientColors: ['#FCD34D', '#F59E0B'] },
  { key: 'sadness', emoji: '😢', label: 'Tristeza', gradientColors: ['#60A5FA', '#3B82F6'] },
  { key: 'fear', emoji: '😰', label: 'Miedo', gradientColors: ['#A78BFA', '#8B5CF6'] },
  { key: 'anger', emoji: '😠', label: 'Ira', gradientColors: ['#F87171', '#EF4444'] },
  { key: 'love', emoji: '💝', label: 'Amor', gradientColors: ['#F472B6', '#EC4899'] },
  { key: 'anxiety', emoji: '😟', label: 'Ansiedad', gradientColors: ['#FB923C', '#F97316'] },
  { key: 'hope', emoji: '🌟', label: 'Esperanza', gradientColors: ['#34D399', '#10B981'] },
  { key: 'calm', emoji: '🧘', label: 'Calma', gradientColors: ['#818CF8', '#6366F1'] },
  { key: 'gratitude', emoji: '🙏', label: 'Gratitud', gradientColors: ['#2DD4BF', '#14B8A6'] },
  { key: 'surprise', emoji: '😮', label: 'Sorpresa', gradientColors: ['#A78BFA', '#7C3AED'] },
  { key: 'loneliness', emoji: '🥺', label: 'Soledad', gradientColors: ['#9CA3AF', '#6B7280'] },
  { key: 'stress', emoji: '😫', label: 'Estrés', gradientColors: ['#FCD34D', '#F59E0B'] },
  { key: 'motivation', emoji: '💪', label: 'Motivación', gradientColors: ['#34D399', '#059669'] },
];

interface EmotionFilterProps {
  selected?: string;
  onSelect?: (key: string) => void;
}

function AnimatedChip({ 
  emotion, 
  isActive, 
  onPress,
  darkMode 
}: { 
  emotion: typeof EMOTIONS[0];
  isActive: boolean;
  onPress: () => void;
  darkMode: boolean;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        friction: 5,
        tension: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  React.useEffect(() => {
    if (isActive) {
      Animated.timing(glowAnim, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(glowAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [isActive]);

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
      style={styles.chipWrapper}
    >
      <Animated.View 
        style={[
          styles.chip,
          { 
            transform: [{ scale: scaleAnim }],
            backgroundColor: isActive 
              ? 'transparent'
              : (darkMode ? 'rgba(22, 22, 22, 0.8)' : 'rgba(250, 250, 250, 0.9)'),
            borderColor: isActive 
              ? 'transparent' 
              : (darkMode ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.1)'),
            shadowOpacity: isActive ? 0.3 : 0,
          }
        ]}
      >
        {isActive && (
          <Animated.View style={[StyleSheet.absoluteFill, { opacity: glowAnim }]}>
            <LinearGradient
              colors={emotion.gradientColors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
        )}
        
        {/* Glow effect */}
        {isActive && (
          <Animated.View style={[
            styles.glowEffect,
            { opacity: glowAnim }
          ]}>
            <LinearGradient
              colors={emotion.gradientColors}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
        )}

        <Text style={styles.emoji}>{emotion.emoji}</Text>
        <Text style={[
          styles.label, 
          { 
            color: isActive 
              ? '#FFFFFF' 
              : (darkMode ? '#9CA3AF' : '#6B7280'),
            textShadowColor: isActive ? 'rgba(0,0,0,0.3)' : 'transparent',
            textShadowOffset: isActive ? { width: 0, height: 1 } : { width: 0, height: 0 },
            textShadowRadius: isActive ? 2 : 0,
          }
        ]}>
          {emotion.label}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

export default function EmotionFilter({ selected = 'all', onSelect }: EmotionFilterProps) {
  const scrollRef = useRef<ScrollView>(null);
  const { theme } = useTheme();
  const darkMode = theme === 'dark';

  return (
    <View style={styles.container}>
      {/* Gradient background accent */}
      <View style={styles.gradientAccent}>
        <LinearGradient
          colors={darkMode 
            ? ['rgba(139, 92, 246, 0.1)', 'transparent'] 
            : ['rgba(139, 92, 246, 0.05)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        decelerationRate="fast"
        bounces
      >
        {EMOTIONS.map((emotion) => (
          <AnimatedChip
            key={emotion.key}
            emotion={emotion}
            isActive={selected === emotion.key}
            onPress={() => onSelect?.(emotion.key)}
            darkMode={darkMode}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    paddingVertical: 14,
  },
  gradientAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  scrollContent: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    gap: 10,
  },
  chipWrapper: {
    alignItems: 'center',
  },
  chip: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderWidth: 2,
    minWidth: 82,
    overflow: 'hidden',
    shadowColor: '#8B5CF6',
    shadowOpacity: 0,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  glowEffect: {
    position: 'absolute',
    top: -20,
    left: -20,
    right: -20,
    bottom: -20,
    borderRadius: 40,
    opacity: 0.3,
  },
  emoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
});
