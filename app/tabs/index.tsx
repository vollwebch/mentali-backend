import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Animated, FlatList, SafeAreaView, StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';
import EmotionFilter from '../../components/EmotionFilter';
import NavigationBar from '../../components/NavigationBar';
import ThoughtCard from '../../components/ThoughtCard';
import { useThoughts } from '../../components/ThoughtsContext';
import { Colors } from '../../constants/Colors';
import { useTheme } from '../../ThemeContext';

export default function HomeScreen() {
  const { theme } = useTheme();
  const colors = {
    ...Colors[theme],
    card: (Colors[theme] as any).card ?? (theme === 'dark' ? '#23243a' : '#fff'),
    cardBorder: (Colors[theme] as any).cardBorder ?? (theme === 'dark' ? '#23243a' : '#E0E7FF'),
    accent: (Colors[theme] as any).accent ?? Colors[theme].tint ?? '#A78BFA',
    secondaryText: (Colors[theme] as any).secondaryText ?? (theme === 'dark' ? '#a5b4fc' : '#6D28D9'),
    fabGradient: (Colors[theme] as any).buttonGradient ?? [theme === 'dark' ? '#9333ea' : '#a78bfa', theme === 'dark' ? '#db2777' : '#f472b6'],
    background: Colors[theme].background ?? (theme === 'dark' ? '#18192A' : '#F3F4F6'),
  };
  const { thoughts } = useThoughts();
  const [selectedEmotion, setSelectedEmotion] = useState('all');
  const [pulse] = useState(new Animated.Value(1));
  const router = useRouter();

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.08, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  // Filtrado de posts por emoción
  const filteredPosts = selectedEmotion === 'all'
    ? thoughts
    : thoughts.filter(p => p.emotion === selectedEmotion);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }] }>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      <View style={[styles.container, { backgroundColor: colors.background }] }>
        <NavigationBar
          onMapPress={() => router.push('../../emotional-map')}
          onProfilePress={() => router.push('/(tabs)/profile')}
        />
        <EmotionFilter selected={selectedEmotion} onSelect={setSelectedEmotion} />
        <FlatList
          data={filteredPosts}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
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
        <Animated.View style={[styles.fabContainer, { transform: [{ scale: pulse }] }]}> 
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.fabTouchable}
            onPress={() => router.push('/compose')}
          >
            <LinearGradient
              colors={colors.fabGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.fabGradient}
            >
              <MaterialCommunityIcons name="pencil" size={32} color="#fff" style={{}} />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#18192A', // bg-gray-900
  },
  container: {
    flex: 1,
    backgroundColor: '#18192A', // bg-gray-900
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
  },
  listContent: {
    padding: 16,
    paddingBottom: 120,
  },
  fabContainer: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    zIndex: 10,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
  },
  fabTouchable: {
    borderRadius: 999,
    overflow: 'hidden',
  },
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#9333ea',
    shadowOpacity: 0.35,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
  },
});
