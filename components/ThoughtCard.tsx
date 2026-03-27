import { MaterialCommunityIcons } from '@expo/vector-icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import React, { useState, useRef, useEffect } from 'react';
import { Animated, Modal, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View, FlatList, KeyboardAvoidingView, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../ThemeContext';
import { Colors } from '../constants/Colors';
import { BlurView } from 'expo-blur';

dayjs.extend(relativeTime);

const EMOTION_CONFIG: Record<string, { color: string; bgColor: string; gradientColors: string[]; darkGradient: string[] }> = {
  joy: { color: '#F59E0B', bgColor: '#FFFBEB', gradientColors: ['#FCD34D', '#F59E0B'], darkGradient: ['#92400E', '#78350F'] },
  sadness: { color: '#3B82F6', bgColor: '#EFF6FF', gradientColors: ['#60A5FA', '#3B82F6'], darkGradient: ['#1E3A8A', '#1E40AF'] },
  fear: { color: '#8B5CF6', bgColor: '#F5F3FF', gradientColors: ['#A78BFA', '#8B5CF6'], darkGradient: ['#4C1D95', '#5B21B6'] },
  anger: { color: '#EF4444', bgColor: '#FEF2F2', gradientColors: ['#F87171', '#EF4444'], darkGradient: ['#7F1D1D', '#991B1B'] },
  love: { color: '#EC4899', bgColor: '#FDF2F8', gradientColors: ['#F472B6', '#EC4899'], darkGradient: ['#831843', '#9D174D'] },
  anxiety: { color: '#F97316', bgColor: '#FFF7ED', gradientColors: ['#FB923C', '#F97316'], darkGradient: ['#9A3412', '#C2410C'] },
  hope: { color: '#10B981', bgColor: '#ECFDF5', gradientColors: ['#34D399', '#10B981'], darkGradient: ['#064E3B', '#065F46'] },
  calm: { color: '#6366F1', bgColor: '#EEF2FF', gradientColors: ['#818CF8', '#6366F1'], darkGradient: ['#312E81', '#3730A3'] },
  gratitude: { color: '#14B8A6', bgColor: '#F0FDFA', gradientColors: ['#2DD4BF', '#14B8A6'], darkGradient: ['#134E4A', '#115E59'] },
  surprise: { color: '#8B5CF6', bgColor: '#F5F3FF', gradientColors: ['#A78BFA', '#8B5CF6'], darkGradient: ['#4C1D95', '#5B21B6'] },
  loneliness: { color: '#6B7280', bgColor: '#F9FAFB', gradientColors: ['#9CA3AF', '#6B7280'], darkGradient: ['#374151', '#4B5563'] },
  stress: { color: '#F59E0B', bgColor: '#FFFBEB', gradientColors: ['#FCD34D', '#F59E0B'], darkGradient: ['#92400E', '#78350F'] },
  motivation: { color: '#10B981', bgColor: '#ECFDF5', gradientColors: ['#34D399', '#10B981'], darkGradient: ['#064E3B', '#065F46'] },
  default: { color: '#8B5CF6', bgColor: '#F5F3FF', gradientColors: ['#A78BFA', '#8B5CF6'], darkGradient: ['#4C1D95', '#5B21B6'] },
};

interface ThoughtCardProps {
  emotion?: string;
  emotionEmoji?: string;
  emotionLabel?: string;
  text: string;
  createdAt: string;
  expiresInHours: number;
  reactions?: { heart?: number; message?: number; fire?: number; brain?: number };
  aiResponse?: string;
}

type Comment = { id: number; text: string; createdAt: string; likes: number; liked: boolean };

function timeAgo(date: string) {
  return dayjs(date).fromNow();
}

function timeUntilExpiry(date: string, hours: number) {
  const expiry = dayjs(date).add(hours, 'hour');
  const now = dayjs();
  if (expiry.isBefore(now)) return 'Expirado';
  const diff = expiry.diff(now, 'hour');
  if (diff < 1) return 'Expira pronto';
  return `${diff}h`;
}

function ReactionButton({ 
  emoji, 
  count, 
  isActive, 
  onPress,
  darkMode
}: { 
  emoji: string; 
  count: number; 
  isActive: boolean; 
  onPress: () => void;
  darkMode: boolean;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

  const handlePress = () => {
    // Bounce animation
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1.3,
        friction: 3,
        tension: 200,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        tension: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // Particle burst effect
    Animated.sequence([
      Animated.timing(bounceAnim, {
        toValue: 1,
        duration: 200,
        easing: Easing.out(Easing.back(2)),
        useNativeDriver: true,
      }),
      Animated.timing(bounceAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    onPress();
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.8}
      style={styles.reactionButtonWrapper}
    >
      <Animated.View style={[
        styles.reactionButton,
        {
          transform: [{ scale: scaleAnim }],
          backgroundColor: isActive 
            ? 'transparent'
            : (darkMode ? 'rgba(31, 31, 31, 0.9)' : 'rgba(250, 250, 250, 0.95)'),
          borderColor: isActive 
            ? 'transparent' 
            : (darkMode ? 'rgba(139, 92, 246, 0.15)' : 'rgba(139, 92, 246, 0.08)'),
          shadowOpacity: isActive ? 0.4 : 0,
        }
      ]}>
        {isActive && (
          <LinearGradient
            colors={['#8B5CF6', '#EC4899']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        )}
        <Animated.Text style={[
          styles.reactionEmoji,
          { 
            transform: [{ scale: bounceAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 1.5]
            })}]
          }
        ]}>
          {emoji}
        </Animated.Text>
        <Text style={[
          styles.reactionCount, 
          { 
            color: isActive ? '#FFFFFF' : (darkMode ? '#9CA3AF' : '#6B7280'),
            textShadowColor: isActive ? 'rgba(0,0,0,0.3)' : 'transparent',
            textShadowOffset: { width: 0, height: 1 },
            textShadowRadius: 2,
          }
        ]}>
          {count}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

export default function ThoughtCard({
  emotion = 'joy',
  emotionEmoji = '😊',
  emotionLabel = 'Alegría',
  text,
  createdAt,
  expiresInHours,
  reactions = {},
  aiResponse,
}: ThoughtCardProps) {
  const { theme } = useTheme();
  const darkMode = theme === 'dark';
  const colors = Colors[theme];
  const emotionStyle = EMOTION_CONFIG[emotion] || EMOTION_CONFIG.default;

  const [localReactions, setLocalReactions] = useState({
    heart: reactions.heart || 0,
    message: reactions.message || 0,
    fire: reactions.fire || 0,
    brain: reactions.brain || 0,
  });
  const [reacted, setReacted] = useState({ heart: false, message: false, fire: false, brain: false });
  const [comments, setComments] = useState<Comment[]>([]);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');

  const handleReact = (type: keyof typeof localReactions) => {
    setLocalReactions(prev => ({
      ...prev,
      [type]: reacted[type] ? Math.max(prev[type] - 1, 0) : prev[type] + 1,
    }));
    setReacted(prev => ({ ...prev, [type]: !prev[type] }));
  };

  const REACTIONS = [
    { key: 'heart', emoji: '❤️' },
    { key: 'message', emoji: '💬' },
    { key: 'fire', emoji: '🔥' },
    { key: 'brain', emoji: '🧠' },
  ] as const;

  const bgCard = darkMode ? 'rgba(22, 22, 22, 0.95)' : 'rgba(255, 255, 255, 0.95)';
  const borderColor = darkMode ? 'rgba(139, 92, 246, 0.15)' : 'rgba(139, 92, 246, 0.08)';

  return (
    <View style={[styles.card, { backgroundColor: bgCard, borderColor }]}>
      {/* Gradient Header Accent */}
      <View style={styles.headerAccent}>
        <LinearGradient
          colors={darkMode ? emotionStyle.darkGradient : emotionStyle.gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </View>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.authorInfo}>
          <View style={styles.avatarContainer}>
            <LinearGradient
              colors={['#8B5CF6', '#EC4899']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.avatar}
            >
              <Text style={styles.avatarEmoji}>👤</Text>
            </LinearGradient>
            {/* Online indicator */}
            <View style={styles.onlineDot}>
              <LinearGradient
                colors={['#10B981', '#059669']}
                style={StyleSheet.absoluteFill}
              />
            </View>
          </View>
          <View style={styles.authorMeta}>
            <Text style={[styles.authorName, { color: darkMode ? '#FFFFFF' : '#1F2937' }]}>Anónimo</Text>
            <View style={styles.metaRow}>
              <Text style={[styles.timeAgo, { color: darkMode ? '#6B7280' : '#9CA3AF' }]}>{timeAgo(createdAt)}</Text>
              <Text style={[styles.dot, { color: darkMode ? '#6B7280' : '#9CA3AF' }]}>•</Text>
              <View style={[styles.expiryBadge, { backgroundColor: darkMode ? 'rgba(139, 92, 246, 0.2)' : emotionStyle.bgColor }]}>
                <MaterialCommunityIcons name="clock-outline" size={11} color={emotionStyle.color} />
                <Text style={[styles.expiryText, { color: emotionStyle.color }]}>
                  {timeUntilExpiry(createdAt, expiresInHours)}
                </Text>
              </View>
            </View>
          </View>
        </View>
        <TouchableOpacity style={styles.moreBtn}>
          <MaterialCommunityIcons name="dots-horizontal" size={22} color={darkMode ? '#6B7280' : '#9CA3AF'} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <Text style={[styles.content, { color: darkMode ? '#FFFFFF' : '#1F2937' }]}>{text}</Text>

      {/* Emotion Tag */}
      <View style={styles.emotionRow}>
        <View style={[
          styles.emotionTag, 
          { backgroundColor: darkMode ? 'rgba(139, 92, 246, 0.15)' : emotionStyle.bgColor }
        ]}>
          <Text style={styles.emotionTagEmoji}>{emotionEmoji}</Text>
          <Text style={[styles.emotionTagText, { color: emotionStyle.color }]}>{emotionLabel}</Text>
        </View>
      </View>

      {/* Reactions */}
      <View style={[styles.reactionsContainer, { borderTopColor: borderColor }]}>
        {REACTIONS.map(({ key, emoji }) => (
          <ReactionButton
            key={key}
            emoji={emoji}
            count={key === 'message' ? comments.length : localReactions[key]}
            isActive={reacted[key]}
            onPress={() => key === 'message' ? setShowComments(true) : handleReact(key)}
            darkMode={darkMode}
          />
        ))}
      </View>

      {/* AI Response */}
      {aiResponse && (
        <View style={[styles.aiResponse, { backgroundColor: darkMode ? 'rgba(139, 92, 246, 0.12)' : 'rgba(139, 92, 246, 0.06)' }]}>
          <View style={styles.aiHeader}>
            <LinearGradient
              colors={['#8B5CF6', '#EC4899']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.aiIconContainer}
            >
              <MaterialCommunityIcons name="robot-happy" size={18} color="#FFFFFF" />
            </LinearGradient>
            <Text style={[styles.aiLabel, { color: '#8B5CF6' }]}>Mentali</Text>
            <View style={[styles.aiBadge, { backgroundColor: darkMode ? 'rgba(16, 185, 129, 0.25)' : 'rgba(16, 185, 129, 0.15)' }]}>
              <Text style={[styles.aiBadgeText, { color: '#10B981' }]}>IA</Text>
            </View>
          </View>
          <Text style={[styles.aiText, { color: darkMode ? '#FFFFFF' : '#1F2937' }]}>{aiResponse}</Text>
        </View>
      )}

      {/* Comments Modal */}
      <Modal visible={showComments} animationType="slide" transparent onRequestClose={() => setShowComments(false)}>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
            style={[styles.modalContent, { backgroundColor: bgCard }]}
          >
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: darkMode ? '#FFFFFF' : '#1F2937' }]}>Comentarios</Text>
              <TouchableOpacity onPress={() => setShowComments(false)} style={styles.closeButton}>
                <MaterialCommunityIcons name="close" size={24} color={darkMode ? '#6B7280' : '#9CA3AF'} />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={comments}
              keyExtractor={item => item.id.toString()}
              style={{ flex: 1 }}
              contentContainerStyle={{ paddingVertical: 8 }}
              ListEmptyComponent={
                <View style={styles.emptyComments}>
                  <View style={[styles.emptyCommentsIcon, { backgroundColor: darkMode ? 'rgba(139, 92, 246, 0.15)' : '#F5F3FF' }]}>
                    <MaterialCommunityIcons name="comment-outline" size={36} color="#8B5CF6" />
                  </View>
                  <Text style={[styles.emptyText, { color: darkMode ? '#6B7280' : '#9CA3AF' }]}>
                    Sé el primero en comentar
                  </Text>
                </View>
              }
              renderItem={({ item }) => (
                <View style={[styles.commentItem, { borderBottomColor: borderColor }]}>
                  <View style={styles.commentAvatar}>
                    <LinearGradient
                      colors={['#8B5CF6', '#A855F7']}
                      style={StyleSheet.absoluteFill}
                    />
                    <Text>👤</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.commentAuthor, { color: '#8B5CF6' }]}>Anónimo</Text>
                    <Text style={[styles.commentText, { color: darkMode ? '#FFFFFF' : '#1F2937' }]}>{item.text}</Text>
                    <Text style={[styles.commentTime, { color: darkMode ? '#6B7280' : '#9CA3AF' }]}>
                      {timeAgo(item.createdAt)}
                    </Text>
                  </View>
                </View>
              )}
            />
            
            <View style={[styles.commentInputContainer, { borderTopColor: borderColor }]}>
              <TextInput
                style={[
                  styles.commentInput, 
                  { 
                    backgroundColor: darkMode ? 'rgba(31, 31, 31, 0.9)' : 'rgba(245, 245, 245, 0.95)', 
                    color: darkMode ? '#FFFFFF' : '#1F2937',
                    borderColor: darkMode ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.1)',
                  }
                ]}
                placeholder="Escribe un comentario..."
                placeholderTextColor={darkMode ? '#555' : '#9CA3AF'}
                value={commentText}
                onChangeText={setCommentText}
                maxLength={240}
              />
              <TouchableOpacity
                style={styles.sendButton}
                onPress={() => {
                  if (commentText.trim()) {
                    setComments(prev => [
                      { id: Date.now(), text: commentText, createdAt: new Date().toISOString(), likes: 0, liked: false }, 
                      ...prev
                    ]);
                    setCommentText('');
                  }
                }}
              >
                <LinearGradient
                  colors={['#8B5CF6', '#EC4899']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
                <MaterialCommunityIcons name="send" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 28,
    borderWidth: 1.5,
    padding: 18,
    marginHorizontal: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#8B5CF6',
    shadowOpacity: 0.1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  headerAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8B5CF6',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  avatarEmoji: {
    fontSize: 22,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#161616',
  },
  authorMeta: {
    gap: 4,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '700',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  timeAgo: {
    fontSize: 13,
  },
  dot: {
    fontSize: 13,
  },
  expiryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 5,
  },
  expiryText: {
    fontSize: 12,
    fontWeight: '700',
  },
  moreBtn: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },
  content: {
    fontSize: 16,
    lineHeight: 26,
    marginBottom: 16,
    letterSpacing: 0.2,
  },
  emotionRow: {
    marginBottom: 16,
  },
  emotionTag: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    gap: 8,
  },
  emotionTagEmoji: {
    fontSize: 18,
  },
  emotionTagText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  reactionsContainer: {
    flexDirection: 'row',
    gap: 10,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  reactionButtonWrapper: {
    alignItems: 'center',
  },
  reactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    gap: 8,
    borderWidth: 1.5,
    overflow: 'hidden',
    shadowColor: '#8B5CF6',
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  reactionEmoji: {
    fontSize: 20,
  },
  reactionCount: {
    fontSize: 14,
    fontWeight: '800',
  },
  aiResponse: {
    marginTop: 16,
    padding: 18,
    borderRadius: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#8B5CF6',
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  aiIconContainer: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8B5CF6',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  aiLabel: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  aiBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
    marginLeft: 'auto',
  },
  aiBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  aiText: {
    fontSize: 15,
    lineHeight: 24,
    letterSpacing: 0.2,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 22,
    maxHeight: '80%',
    minHeight: 420,
  },
  modalHandle: {
    width: 44,
    height: 5,
    backgroundColor: '#4B5563',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 18,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  closeButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyComments: {
    alignItems: 'center',
    paddingVertical: 50,
    gap: 16,
  },
  emptyCommentsIcon: {
    width: 76,
    height: 76,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
  },
  commentItem: {
    flexDirection: 'row',
    paddingVertical: 16,
    borderBottomWidth: 1,
    gap: 14,
  },
  commentAvatar: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 3,
    letterSpacing: 0.2,
  },
  commentText: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 5,
  },
  commentTime: {
    fontSize: 12,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingTop: 18,
    borderTopWidth: 1,
    marginTop: 16,
  },
  commentInput: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 22,
    fontSize: 16,
    borderWidth: 1.5,
  },
  sendButton: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#8B5CF6',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
});
