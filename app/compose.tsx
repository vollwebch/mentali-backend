import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState, useRef, useEffect } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, SafeAreaView, StatusBar, Dimensions, Animated, Easing } from 'react-native';
import EmotionFilter from '../components/EmotionFilter';
import { useThoughts } from '../components/ThoughtsContext';
import { useTheme } from '../ThemeContext';
import { Colors } from '../constants/Colors';
import { BlurView } from 'expo-blur';

const MAX_WIDTH = 480;

const EMOTION_OPTIONS = [
  { key: 'joy', emoji: '😊', label: 'Alegría', gradientColors: ['#FCD34D', '#F59E0B'] },
  { key: 'sadness', emoji: '😢', label: 'Tristeza', gradientColors: ['#60A5FA', '#3B82F6'] },
  { key: 'fear', emoji: '😰', label: 'Miedo', gradientColors: ['#A78BFA', '#8B5CF6'] },
  { key: 'anxiety', emoji: '😟', label: 'Ansiedad', gradientColors: ['#FB923C', '#F97316'] },
  { key: 'love', emoji: '💝', label: 'Amor', gradientColors: ['#F472B6', '#EC4899'] },
  { key: 'anger', emoji: '😠', label: 'Ira', gradientColors: ['#F87171', '#EF4444'] },
  { key: 'hope', emoji: '🌟', label: 'Esperanza', gradientColors: ['#34D399', '#10B981'] },
  { key: 'calm', emoji: '🧘', label: 'Calma', gradientColors: ['#818CF8', '#6366F1'] },
];

const DURATION_OPTIONS = [
  { label: '24 horas', value: '24h' },
  { label: '48 horas', value: '48h' },
  { label: '72 horas', value: '72h' },
];

// Animated toggle switch
function AnimatedSwitch({ value, onToggle, darkMode }: { value: boolean; onToggle: () => void; darkMode: boolean }) {
  const translateX = useRef(new Animated.Value(value ? 22 : 2)).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(translateX, {
      toValue: value ? 22 : 2,
      friction: 5,
      tension: 100,
      useNativeDriver: true,
    }).start();
  }, [value]);

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.95,
      friction: 5,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 4,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  return (
    <TouchableOpacity
      onPress={onToggle}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
    >
      <Animated.View style={[
        styles.switch,
        { 
          backgroundColor: value 
            ? 'transparent' 
            : (darkMode ? 'rgba(37, 37, 37, 0.9)' : 'rgba(236, 236, 236, 0.95)'),
          transform: [{ scale }],
          borderColor: value ? 'transparent' : (darkMode ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.1)'),
        }
      ]}>
        {value && (
          <LinearGradient
            colors={['#8B5CF6', '#EC4899']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        )}
        <Animated.View style={[
          styles.switchThumb,
          { transform: [{ translateX }] }
        ]} />
      </Animated.View>
    </TouchableOpacity>
  );
}

// Floating accent particles
function FloatingAccent({ darkMode }: { darkMode: boolean }) {
  const particles = useRef([...Array(4)].map(() => ({
    x: new Animated.Value(Math.random()),
    y: new Animated.Value(Math.random()),
    scale: new Animated.Value(Math.random() * 0.5 + 0.3),
    opacity: new Animated.Value(Math.random() * 0.2 + 0.1),
  }))).current;

  useEffect(() => {
    particles.forEach((particle, index) => {
      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(particle.y, {
              toValue: -0.3,
              duration: 6000 + index * 1500,
              easing: Easing.out(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.timing(particle.opacity, {
              toValue: 0,
              duration: 6000 + index * 1500,
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
              toValue: Math.random() * 0.2 + 0.1,
              duration: 0,
              useNativeDriver: true,
            }),
          ]),
        ])
      ).start();
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
                outputRange: [0, 600],
              }),
              transform: [{ scale: particle.scale }],
              opacity: particle.opacity,
            },
          ]}
        />
      ))}
    </View>
  );
}

export default function ComposeScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const darkMode = theme === 'dark';
  const colors = Colors[theme];
  const { addThought } = useThoughts();

  const [emotion, setEmotion] = useState('joy');
  const [text, setText] = useState('');
  const [duration, setDuration] = useState('24h');
  const [aiReply, setAiReply] = useState(true);
  const [charCount, setCharCount] = useState(0);
  const [privateThought, setPrivateThought] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const screenWidth = Dimensions.get('window').width;
  const isLargeScreen = screenWidth > 900;

  const selectedEmotion = EMOTION_OPTIONS.find(e => e.key === emotion) || EMOTION_OPTIONS[0];

  const handlePublish = () => {
    if (!text.trim()) return;
    addThought({
      emotion,
      emotionEmoji: selectedEmotion.emoji,
      emotionLabel: selectedEmotion.label,
      text,
      expiresInHours: duration === '24h' ? 24 : duration === '48h' ? 48 : 72,
      reactions: { heart: 0, message: 0, fire: 0, brain: 0 },
      private: privateThought,
    });
    setText('');
    setCharCount(0);
    setPrivateThought(false);
    router.push(privateThought ? '/(tabs)/profile' : '/(tabs)');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: darkMode ? '#0A0A0A' : '#FFFFFF' }}>
      <StatusBar barStyle={darkMode ? 'light-content' : 'dark-content'} backgroundColor={darkMode ? '#0A0A0A' : '#FFFFFF'} />
      
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.contentWrapper}>
          <View style={[styles.container, { maxWidth: MAX_WIDTH }]}>
            {/* Floating particles */}
            <FloatingAccent darkMode={darkMode} />

            {/* Header */}
            <View style={[styles.header, { borderBottomColor: darkMode ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.1)' }]}>
              <TouchableOpacity 
                style={[styles.backBtn, { backgroundColor: darkMode ? 'rgba(139, 92, 246, 0.15)' : '#F5F3FF' }]} 
                onPress={() => router.back()}
              >
                <MaterialCommunityIcons name="arrow-left" size={24} color="#8B5CF6" />
              </TouchableOpacity>
              <Text style={[styles.headerTitle, { color: colors.text }]}>Nuevo Pensamiento</Text>
              <TouchableOpacity style={styles.publishBtn} onPress={handlePublish}>
                <LinearGradient
                  colors={['#8B5CF6', '#EC4899']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
                <Text style={styles.publishBtnText}>Publicar</Text>
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
              {/* Emotion Section */}
              <View style={styles.section}>
                <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>¿Cómo te sientes?</Text>
                <EmotionFilter selected={emotion} onSelect={setEmotion} />
              </View>

              {/* Text Input */}
              <View style={styles.section}>
                <View style={[
                  styles.textareaContainer, 
                  { 
                    backgroundColor: darkMode ? 'rgba(22, 22, 22, 0.95)' : 'rgba(250, 250, 250, 0.95)', 
                    borderColor: darkMode ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.1)' 
                  }
                ]}>
                  {/* Gradient accent on top */}
                  <LinearGradient
                    colors={selectedEmotion.gradientColors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.textareaAccent}
                  />
                  <TextInput
                    style={[styles.textarea, { color: colors.text }]}
                    placeholder="Escribe lo que sientes... Tu identidad permanece completamente anónima."
                    placeholderTextColor={colors.textMuted}
                    multiline
                    maxLength={500}
                    value={text}
                    onChangeText={t => { setText(t); setCharCount(t.length); }}
                  />
                </View>
                <View style={styles.counterRow}>
                  <Text style={[styles.counterText, { color: colors.textMuted }]}>Máximo 500 caracteres</Text>
                  <Text style={[styles.counterText, { color: charCount > 450 ? '#EF4444' : colors.textMuted }]}>{charCount}/500</Text>
                </View>
              </View>

              {/* Privacy Toggle */}
              <TouchableOpacity 
                style={[
                  styles.toggleCard, 
                  { 
                    backgroundColor: darkMode ? 'rgba(22, 22, 22, 0.95)' : 'rgba(250, 250, 250, 0.95)', 
                    borderColor: darkMode ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.1)' 
                  }
                ]}
                onPress={() => setPrivateThought(!privateThought)}
                activeOpacity={0.9}
              >
                <View style={styles.toggleLeft}>
                  <View style={[
                    styles.toggleIconContainer, 
                    { backgroundColor: privateThought ? 'rgba(139, 92, 246, 0.15)' : 'rgba(6, 182, 212, 0.15)' }
                  ]}>
                    <MaterialCommunityIcons 
                      name={privateThought ? 'lock' : 'earth'} 
                      size={24} 
                      color={privateThought ? '#8B5CF6' : '#06B6D4'} 
                    />
                  </View>
                  <View>
                    <Text style={[styles.toggleLabel, { color: colors.text }]}>Pensamiento privado</Text>
                    <Text style={[styles.toggleSubtext, { color: colors.textMuted }]}>Solo tú podrás verlo</Text>
                  </View>
                </View>
                <AnimatedSwitch value={privateThought} onToggle={() => setPrivateThought(!privateThought)} darkMode={darkMode} />
              </TouchableOpacity>

              {/* Voice Mode Card */}
              <LinearGradient
                colors={darkMode ? ['#1E1B4B', '#312E81'] : ['#F5F3FF', '#EDE9FE']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.voiceCard}
              >
                <TouchableOpacity style={styles.voiceBtn}>
                  <View style={[
                    styles.voiceIconContainer, 
                    { backgroundColor: darkMode ? 'rgba(139, 92, 246, 0.3)' : 'rgba(255, 255, 255, 0.95)' }
                  ]}>
                    <LinearGradient
                      colors={['#8B5CF6', '#EC4899']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={StyleSheet.absoluteFill}
                    />
                    <MaterialCommunityIcons name="microphone" size={28} color="#FFFFFF" style={{ zIndex: 1 }} />
                  </View>
                  <View>
                    <Text style={[styles.voiceText, { color: darkMode ? '#EDE9FE' : '#6D28D9' }]}>Modo Susurro</Text>
                    <Text style={[styles.voiceSubtext, { color: darkMode ? 'rgba(255,255,255,0.7)' : '#7C3AED' }]}>Habla tus sentimientos</Text>
                  </View>
                </TouchableOpacity>
              </LinearGradient>

              {/* Duration Card */}
              <View style={[
                styles.optionCard, 
                { 
                  backgroundColor: darkMode ? 'rgba(22, 22, 22, 0.95)' : 'rgba(250, 250, 250, 0.95)', 
                  borderColor: darkMode ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.1)' 
                }
              ]}>
                <View style={styles.optionHeader}>
                  <View style={styles.optionLeft}>
                    <View style={[styles.optionIconContainer, { backgroundColor: darkMode ? 'rgba(139, 92, 246, 0.15)' : '#F5F3FF' }]}>
                      <MaterialCommunityIcons name="clock-outline" size={22} color="#8B5CF6" />
                    </View>
                    <Text style={[styles.optionLabel, { color: colors.text }]}>Duración</Text>
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.dropdown, 
                      { 
                        backgroundColor: darkMode ? 'rgba(31, 31, 31, 0.9)' : 'rgba(255, 255, 255, 0.95)', 
                        borderColor: darkMode ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.1)' 
                      }
                    ]}
                    onPress={() => setShowDropdown(!showDropdown)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.dropdownValue, { color: colors.text }]}>{duration}</Text>
                    <MaterialCommunityIcons name="chevron-down" size={20} color={colors.textMuted} />
                  </TouchableOpacity>
                </View>
                {showDropdown && (
                  <View style={[
                    styles.dropdownList, 
                    { 
                      backgroundColor: darkMode ? 'rgba(31, 31, 31, 0.95)' : 'rgba(255, 255, 255, 0.98)', 
                      borderColor: darkMode ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.1)' 
                    }
                  ]}>
                    {DURATION_OPTIONS.map(opt => (
                      <TouchableOpacity
                        key={opt.value}
                        style={[
                          styles.dropdownItem, 
                          duration === opt.value && { backgroundColor: darkMode ? 'rgba(139, 92, 246, 0.2)' : '#F5F3FF' }
                        ]}
                        onPress={() => { setDuration(opt.value); setShowDropdown(false); }}
                      >
                        <Text style={[styles.dropdownItemText, { color: colors.text }]}>{opt.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
                <Text style={[styles.optionSubtext, { color: colors.textMuted }]}>Tu pensamiento desaparecerá automáticamente pasado este tiempo</Text>
              </View>

              {/* AI Reply Toggle */}
              <TouchableOpacity 
                style={[
                  styles.optionCard, 
                  { 
                    backgroundColor: darkMode ? 'rgba(22, 22, 22, 0.95)' : 'rgba(250, 250, 250, 0.95)', 
                    borderColor: darkMode ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.1)' 
                  }
                ]}
                onPress={() => setAiReply(!aiReply)}
                activeOpacity={0.9}
              >
                <View style={styles.optionHeader}>
                  <View style={styles.optionLeft}>
                    <View style={[styles.optionIconContainer, { backgroundColor: darkMode ? 'rgba(139, 92, 246, 0.15)' : '#F5F3FF' }]}>
                      <LinearGradient
                        colors={['#8B5CF6', '#A855F7']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={StyleSheet.absoluteFill}
                      />
                      <MaterialCommunityIcons name="robot-happy" size={20} color="#FFFFFF" style={{ zIndex: 1 }} />
                    </View>
                    <View>
                      <Text style={[styles.optionLabel, { color: colors.text }]}>Respuesta de Mentali</Text>
                      <Text style={[styles.optionSubtext, { color: colors.textMuted }]}>Recibe una respuesta empática</Text>
                    </View>
                  </View>
                  <AnimatedSwitch value={aiReply} onToggle={() => setAiReply(!aiReply)} darkMode={darkMode} />
                </View>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  contentWrapper: { flex: 1, alignItems: 'center' },
  container: { flex: 1, width: '100%' },
  particle: { position: 'absolute', width: 10, height: 10, borderRadius: 5, backgroundColor: '#8B5CF6' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderBottomWidth: 1.5,
  },
  backBtn: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '800', letterSpacing: 0.3 },
  publishBtn: { borderRadius: 16, overflow: 'hidden' },
  publishBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 16, paddingHorizontal: 24, paddingVertical: 12, letterSpacing: 0.3 },
  scrollContent: { padding: 18, paddingBottom: 50 },
  section: { marginBottom: 22 },
  sectionLabel: { fontSize: 15, fontWeight: '700', marginBottom: 14, marginLeft: 4, letterSpacing: 0.3 },
  textareaContainer: { borderRadius: 24, borderWidth: 1.5, padding: 4, overflow: 'hidden' },
  textareaAccent: { height: 4 },
  textarea: { minHeight: 160, padding: 18, fontSize: 17, lineHeight: 26 },
  counterRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, paddingHorizontal: 6 },
  counterText: { fontSize: 13, fontWeight: '600' },
  toggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 22,
    borderWidth: 1.5,
    padding: 18,
    marginBottom: 18,
  },
  toggleLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  toggleIconContainer: { width: 50, height: 50, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  toggleLabel: { fontSize: 16, fontWeight: '700', marginBottom: 3, letterSpacing: 0.2 },
  toggleSubtext: { fontSize: 14 },
  switch: { width: 54, height: 32, borderRadius: 16, justifyContent: 'center', padding: 2, borderWidth: 1.5, overflow: 'hidden' },
  switchThumb: { width: 26, height: 26, borderRadius: 13, backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
  voiceCard: { borderRadius: 24, padding: 18, marginBottom: 18 },
  voiceBtn: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  voiceIconContainer: { width: 56, height: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  voiceText: { fontSize: 18, fontWeight: '700', marginBottom: 3, letterSpacing: 0.2 },
  voiceSubtext: { fontSize: 14 },
  optionCard: { borderRadius: 22, borderWidth: 1.5, padding: 18, marginBottom: 14 },
  optionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  optionLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  optionIconContainer: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  optionLabel: { fontSize: 16, fontWeight: '700', letterSpacing: 0.2 },
  optionSubtext: { fontSize: 13, marginTop: 12, lineHeight: 20 },
  dropdown: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, borderWidth: 1.5, gap: 8 },
  dropdownValue: { fontSize: 16, fontWeight: '700' },
  dropdownList: { borderRadius: 16, marginTop: 12, borderWidth: 1.5, overflow: 'hidden' },
  dropdownItem: { paddingVertical: 16, paddingHorizontal: 20 },
  dropdownItemText: { fontSize: 16, fontWeight: '600' },
});
