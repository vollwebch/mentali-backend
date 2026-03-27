import React, { useCallback, useState, useRef, useEffect } from 'react';
import { GiftedChat, IMessage, Bubble, InputToolbar, Send } from 'react-native-gifted-chat';
import { Platform, View, StyleSheet, Text, SafeAreaView, StatusBar, TouchableOpacity, Animated, Easing } from 'react-native';
import { useTheme } from '../../ThemeContext';
import { Colors } from '../../constants/Colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// =====================================================
// IA PSICÓLOGO REAL - Backend con z-ai-sdk (GRATIS)
// =====================================================

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

let conversationHistory: Message[] = [];

// URL del backend con IA real
const API_URL = 'https://mentali-backend.onrender.com/chat';

// Función para llamar a la IA REAL
async function getAIResponse(userMessage: string): Promise<string> {
  conversationHistory.push({ role: 'user', content: userMessage });
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        messages: conversationHistory.slice(-10) 
      }),
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) throw new Error('API error');
    
    const data = await response.json();
    const aiResponse = data.response || 'Lo siento, intenta de nuevo.';
    
    conversationHistory.push({ role: 'assistant', content: aiResponse });
    return aiResponse;
    
  } catch (error: any) {
    console.log('Error IA:', error.message);
    
    // Fallback inteligente
    const fallback = getFallbackResponse(userMessage);
    conversationHistory.push({ role: 'assistant', content: fallback });
    return fallback;
  }
}

// Fallback cuando la API no está disponible
function getFallbackResponse(message: string): string {
  const t = message.toLowerCase().trim();
  const lastBot = conversationHistory.filter(m => m.role === 'assistant').pop()?.content || '';
  
  if (t.match(/y\s*t[uú]|y\s*a\s*t[ií]|c[oó]mo est[aá]s tu/)) {
    return 'Como psicólogo virtual no tengo emociones propias, pero me importa mucho lo que sientes. 💙 ¿Cómo está tu día?';
  }
  if (t.match(/^(hola|hey|hi|hello)/)) {
    return '¡Hola! 👋 Soy Mentali, tu psicólogo virtual. Estoy aquí para escucharte. ¿Cómo te sientes hoy?';
  }
  if (t.includes('triste')) {
    return 'Siento que estés pasando por esto. 💙 ¿Qué ha despertado estos sentimientos?';
  }
  if (t.includes('ansioso') || t.includes('ansiedad')) {
    return 'La ansiedad puede sentirse abrumadora. 💙 ¿Qué la está causando?';
  }
  if (t.match(/no\s*s[eé]/)) {
    return 'Está bien. 🌿 A veces es difícil encontrar las palabras. ¿Cómo ha sido tu día?';
  }
  if (t.match(/suicidar|matarme|morir/)) {
    return '🆘 Tu vida importa. Llama: España 024, México 800-290-0024, Argentina 135. 💙';
  }
  
  return 'Te escucho con atención. 💙 ¿Podrías contarme más?';
}

// =====================================================
// COMPONENTES VISUALES
// =====================================================

function TypingIndicator() {
  const dots = [useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current];
  useEffect(() => {
    dots.forEach((dot, i) => {
      Animated.loop(Animated.sequence([
        Animated.delay(i * 150),
        Animated.timing(dot, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(dot, { toValue: 0, duration: 300, useNativeDriver: true })
      ])).start();
    });
  }, []);
  return (
    <View style={{ flexDirection: 'row', marginLeft: 8, gap: 3 }}>
      {dots.map((dot, i) => (
        <Animated.View key={i} style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: '#8B5CF6', transform: [{ translateY: dot.interpolate({ inputRange: [0, 1], outputRange: [0, -6] }) }] }} />
      ))}
    </View>
  );
}

function PulsingAvatar({ loading }: { loading: boolean }) {
  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (loading) {
      Animated.loop(Animated.sequence([
        Animated.timing(pulse, { toValue: 1.1, duration: 600, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 600, useNativeDriver: true })
      ])).start();
    }
  }, [loading]);
  return (
    <Animated.View style={{ transform: [{ scale: pulse }] }}>
      <LinearGradient colors={['#8B5CF6', '#EC4899']} style={{ width: 58, height: 58, borderRadius: 20, alignItems: 'center', justifyContent: 'center' }}>
        <MaterialCommunityIcons name="brain" size={28} color="#FFF" />
      </LinearGradient>
    </Animated.View>
  );
}

// =====================================================
// COMPONENTE PRINCIPAL
// =====================================================

export default function PsicologoChat() {
  const { theme } = useTheme();
  const colors = Colors[theme];
  const darkMode = theme === 'dark';
  
  const [messages, setMessages] = useState<IMessage[]>([{
    _id: 1,
    text: '¡Hola! 🌱 Soy Mentali, tu psicólogo virtual. Estoy aquí para escucharte y apoyarte sin juicios. ¿Cómo te sientes hoy?',
    createdAt: new Date(),
    user: { _id: 2, name: 'Mentali' },
  }]);
  const [loading, setLoading] = useState(false);

  const onSend = useCallback(async (newMessages: IMessage[] = []) => {
    const userMessage = newMessages[0]?.text || '';
    setMessages(prev => GiftedChat.append(prev, newMessages));
    setLoading(true);
    
    try {
      const response = await getAIResponse(userMessage);
      setMessages(prev => GiftedChat.append(prev, [{
        _id: Date.now(),
        text: response,
        createdAt: new Date(),
        user: { _id: 2, name: 'Mentali' },
      }]));
    } catch (e) {
      setMessages(prev => GiftedChat.append(prev, [{
        _id: Date.now(),
        text: 'Lo siento, hubo un problema. Intenta de nuevo. 🙏',
        createdAt: new Date(),
        user: { _id: 2, name: 'Mentali' },
      }]));
    }
    setLoading(false);
  }, []);

  const renderBubble = (props: any) => {
    const isUser = props.position === 'right';
    return (
      <View style={{ marginBottom: 12, maxWidth: '85%', alignItems: isUser ? 'flex-end' : 'flex-start' }}>
        <LinearGradient
          colors={isUser ? ['#8B5CF6', '#EC4899'] : (darkMode ? ['#1F1F1F', '#252525'] : ['#F3F4F6', '#F9FAFB'])}
          style={{ paddingHorizontal: 18, paddingVertical: 14, borderRadius: 24, borderBottomRightRadius: isUser ? 8 : 24, borderBottomLeftRadius: isUser ? 24 : 8 }}
        >
          <Text style={{ color: isUser ? '#FFF' : (darkMode ? '#FFF' : '#1F2937'), fontSize: 16, lineHeight: 24 }}>
            {props.currentMessage?.text}
          </Text>
        </LinearGradient>
      </View>
    );
  };

  const renderInputToolbar = (props: any) => (
    <View style={{ position: 'relative', borderTopWidth: 1, borderTopColor: 'rgba(139, 92, 246, 0.1)' }}>
      <View style={[StyleSheet.absoluteFill, { backgroundColor: darkMode ? 'rgba(10, 10, 10, 0.95)' : 'rgba(255, 255, 255, 0.95)' }]} />
      <View style={{ paddingVertical: 10, paddingHorizontal: 14 }}>
        <InputToolbar {...props} containerStyle={{ backgroundColor: 'transparent', borderTopWidth: 0 }} />
      </View>
    </View>
  );

  const renderSend = (props: any) => (
    <Send {...props} containerStyle={{ justifyContent: 'center', marginRight: 6, marginBottom: 6 }}>
      <LinearGradient colors={['#8B5CF6', '#EC4899']} style={{ width: 50, height: 50, borderRadius: 18, alignItems: 'center', justifyContent: 'center' }}>
        <MaterialCommunityIcons name="send" size={20} color="#FFF" />
      </LinearGradient>
    </Send>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: darkMode ? '#0A0A0A' : '#FFF' }}>
      <StatusBar barStyle={darkMode ? 'light-content' : 'dark-content'} />
      
      <View style={{ position: 'relative', zIndex: 10 }}>
        <View style={[StyleSheet.absoluteFill, { backgroundColor: darkMode ? 'rgba(10, 10, 10, 0.95)' : 'rgba(255, 255, 255, 0.95)' }]} />
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 16, gap: 16 }}>
          <PulsingAvatar loading={loading} />
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={{ fontSize: 22, fontWeight: '800', color: darkMode ? '#FFF' : '#1F2937' }}>Mentali</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: loading ? '#FBBF24' : '#10B981' }} />
              <Text style={{ fontSize: 13, fontWeight: '600', color: darkMode ? '#6B7280' : '#9CA3AF' }}>
                {loading ? 'Pensando...' : 'IA en línea'}
              </Text>
              {loading && <TypingIndicator />}
            </View>
          </View>
        </View>
        <LinearGradient colors={['#8B5CF6', '#EC4899', '#06B6D4']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ height: 2, marginHorizontal: 20, borderRadius: 1, opacity: 0.5 }} />
      </View>

      <View style={{ flex: 1 }}>
        <GiftedChat
          messages={messages}
          onSend={(msgs: IMessage[]) => onSend(msgs)}
          user={{ _id: 1 }}
          isTyping={loading}
          placeholder="Escribe tu mensaje..."
          renderUsernameOnMessage={false}
          showUserAvatar={false}
          renderAvatar={null}
          renderBubble={renderBubble}
          renderInputToolbar={renderInputToolbar}
          renderSend={renderSend}
          messagesContainerStyle={{ backgroundColor: 'transparent', paddingHorizontal: 12 }}
          textInputStyle={{
            color: colors.text,
            backgroundColor: darkMode ? 'rgba(31, 31, 31, 0.9)' : 'rgba(245, 245, 245, 0.95)',
            borderRadius: 26,
            paddingHorizontal: 22,
            paddingVertical: 14,
            fontSize: 16,
            marginRight: 10,
            borderWidth: 1.5,
            borderColor: darkMode ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.1)',
          }}
          textInputProps={{ placeholderTextColor: darkMode ? '#555' : '#9CA3AF' }}
          minInputToolbarHeight={72}
          scrollToBottom
        />
      </View>
      
      <View style={{ height: 80 }} />
    </SafeAreaView>
  );
}
