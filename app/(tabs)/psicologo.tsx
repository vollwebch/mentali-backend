import React, { useCallback, useState, useRef, useEffect } from 'react';
import { GiftedChat, IMessage, Bubble, InputToolbar, Send } from 'react-native-gifted-chat';
import { Platform, View, StyleSheet, Text, SafeAreaView, StatusBar, TouchableOpacity, Animated, Easing } from 'react-native';
import { useTheme } from '../../ThemeContext';
import { Colors } from '../../constants/Colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

// =====================================================
// IA PSICÓLOGO REAL - CON LLM
// =====================================================

// URLs de API (en orden de preferencia)
const API_URLS = [
  // API remota deshabilitada temporalmente - usando fallback local inteligente
];

// Historial de conversación
let conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = [];

// Función para obtener respuesta de la IA
async function getAIResponse(userMessage: string): Promise<string> {
  conversationHistory.push({ role: 'user', content: userMessage });
  const messagesToSend = conversationHistory.slice(-10);
  
  // Intentar con cada URL de API
  for (const apiUrl of API_URLS) {
    try {
      console.log('Intentando:', apiUrl);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: messagesToSend }),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) continue;
      
      const data = await response.json();
      
      if (data.response) {
        conversationHistory.push({ role: 'assistant', content: data.response });
        return data.response;
      }
    } catch (e) {
      console.log('Error con', apiUrl, ':', e.message);
    }
  }
  
  // Fallback local inteligente
  const fallback = getLocalResponse(userMessage);
  conversationHistory.push({ role: 'assistant', content: fallback });
  return fallback;
}

// Fallback local mejorado - Sistema inteligente de respuestas
function getLocalResponse(message: string): string {
  const t = message.toLowerCase().trim();
  const lastUserMsg = conversationHistory.filter(m => m.role === 'user').pop()?.content?.toLowerCase() || '';
  const lastBotMsg = conversationHistory.filter(m => m.role === 'assistant').pop()?.content || '';
  
  // CRÍTICO: "¿y tú?" - Cuando preguntan por el bot
  if (t.match(/\by\s*t[uú]|\by\s*a\s*t[ií]|como est[aá]s tu|t[uú] c[oó]mo est[aá]s/)) {
    return 'Como IA no tengo emociones propias, pero estoy aquí para escucharte a ti. 💙 ¿Hay algo que te gustaría compartir?';
  }
  
  // Preguntas sobre el bot
  if (t.match(/qui[eé]n eres|qu[eé] eres|tu nombre|c[oó]mo te llamas/)) {
    return 'Soy Mentali, un psicólogo virtual creado para escucharte y apoyarte. 💙 ¿Cómo te sientes hoy?';
  }
  
  // "perfecto" - necesita contexto
  if (t.match(/perfecto|genial|excelente|buen[ií]simo/)) {
    if (lastBotMsg.includes('ejercicio') || lastBotMsg.includes('práctica')) {
      return '¡Me alegra que te guste la idea! 💜 ¿Te gustaría que exploremos más sobre esto?';
    }
    return '¡Qué bueno! 💜 ¿Qué te hace sentir así?';
  }
  
  // Respuestas ambiguas - "no se" / "no sé"
  if (t.match(/^no\s*s[eé]|^no s[eé]$/)) {
    if (lastBotMsg.includes('cómo te sientes') || lastBotMsg.includes('cómo está')) {
      return 'Está bien, a veces es difícil identificar lo que sentimos. 🌿 ¿Cómo ha estado tu día en general?';
    }
    if (lastBotMsg.includes('qué te gustaría') || lastBotMsg.includes('qué te hace')) {
      return 'No te preocupes, tómate tu tiempo. 🌿 ¿Hay algo en particular que te preocupe?';
    }
    return 'Está bien. 🌿 A veces es difícil encontrar las palabras. ¿Quieres hablar de algo en particular?';
  }
  
  // Saludos
  if (t.match(/^(hola|hey|hi|hello|buenos d[ií]as|buenas tardes|buenas noches)/)) {
    return '¡Hola! 👋 Soy Mentali, tu psicólogo virtual. Estoy aquí para escucharte. ¿Cómo te sientes hoy?';
  }
  
  // Agradecimientos
  if (t.match(/gracias|te agradezco|muchas gracias/)) {
    return 'De nada, estoy aquí para ti. 💙 ¿Hay algo más en lo que pueda ayudarte?';
  }
  
  // Afirmaciones simples
  if (t.match(/^(si|s[ií]|claro|exacto|cierto|ok|vale|de acuerdo)$/)) {
    return 'Entiendo. 💙 ¿Te gustaría contarme más sobre eso?';
  }
  
  // Negaciones simples
  if (t.match(/^(no|nop|nope)$/)) {
    return 'Está bien. 🌿 ¿Hay algo más que te gustaría compartir?';
  }
  
  // Emociones positivas
  if (t.match(/bien|genial|feliz|contento|alegre|tranquil|relajad/)) {
    return '¡Me alegra escuchar eso! 💜 ¿Qué es lo que te hace sentir así?';
  }
  
  // Emociones negativas
  if (t.includes('triste') || t.includes('deprimido') || t.includes('deprimida')) {
    return 'Siento que estés pasando por esto. 💙 Tus sentimientos son válidos. ¿Qué ha despertado estas emociones?';
  }
  if (t.includes('ansioso') || t.includes('ansiedad') || t.includes('nervioso')) {
    return 'Entiendo, la ansiedad puede sentirse abrumadora. 💙 ¿Qué está provocando estos sentimientos?';
  }
  if (t.includes('estresado') || t.includes('estrés') || t.includes('agobiado')) {
    return 'El estrés puede ser muy difícil de manejar. 💙 ¿Hay algo específico que te esté generando esta presión?';
  }
  if (t.match(/solo|sol[ao]|vac[ií]o|vac[ií]a|sin sentido/)) {
    return 'Sentirse solo puede ser muy doloroso. 💙 Quiero que sepas que estoy aquí contigo. ¿Hace cuánto te sientes así?';
  }
  if (t.match(/enfadado|enojado|molesto|furioso|irritado/)) {
    return 'La ira es una emoción válida. 💙 ¿Qué fue lo que provocó estos sentimientos?';
  }
  if (t.includes('desilusion') || t.includes('decepción') || t.includes('desilusión') || t.includes('decepcionado')) {
    return 'Lamento tu desilusión. 💔 Es válido sentirse así. ¿Qué sucedió?';
  }
  if (t.match(/cansado|agotado|sin energ[ií]a|fatiga/)) {
    return 'El agotamiento puede ser señal de muchas cosas. 💙 ¿Has estado durmiendo bien o hay algo que te preocupa?';
  }
  
  // Problemas de sueño
  if (t.match(/no puedo dormir|insomnio|no duermo|dormir mal/)) {
    return 'Los problemas de sueño pueden afectar mucho nuestro bienestar. 💙 ¿Tu mente está muy activa por las noches?';
  }
  
  // Problemas relacionales
  if (t.match(/novio|novia|pareja|relaci[oó]n|matrimonio/)) {
    return 'Las relaciones pueden ser complejas. 💙 ¿Qué está pasando en tu relación?';
  }
  if (t.match(/amigo|amiga|amistad|amigos/)) {
    return 'Las amistades son importantes. 💙 ¿Hay algo pasando con tus amigos?';
  }
  if (t.match(/familia|madre|padre|hermano|hermana|pap[áa]|mam[áa]/)) {
    return 'La familia puede ser fuente de apoyo pero también de conflicto. 💙 ¿Qué está sucediendo con tu familia?';
  }
  
  // Problemas de trabajo/estudio
  if (t.match(/trabajo|jefe|compa[ñn]ero|empleo/)) {
    return 'El ambiente laboral puede generar mucho estrés. 💙 ¿Qué está pasando en tu trabajo?';
  }
  if (t.match(/estudio|examen|universidad|escuela|colegio/)) {
    return 'La presión académica puede ser muy estresante. 💙 ¿Qué te preocupa de tus estudios?';
  }
  
  // Crisis - SIEMPRE responder con recursos
  if (t.match(/suicidar|matarme|morir|muerte|acabar con|no quiero vivir/)) {
    return '🆘 Tu vida es valiosa. Por favor, contacta ayuda inmediata:\n\n📞 España: 024\n📞 México: 800-290-0024\n📞 Argentina: 135\n📞 Colombia: 106\n\nEstoy aquí contigo. 💙';
  }
  if (t.match(/cortar|lastimar|herir|autolesion/)) {
    return '🆘 Siento que estés sufriendo tanto. Por favor, busca ayuda profesional. Estos números pueden ayudarte:\n\n📞 España: 024\n📞 México: 800-290-0024\n\nNo estás solo/a. 💙';
  }
  
  // Preguntas de ayuda
  if (t.match(/ayuda|ayudar|necesito|apoyo/)) {
    return 'Estoy aquí para escucharte y apoyarte. 💙 ¿Qué es lo que necesitas?';
  }
  
  // Respuesta por defecto inteligente
  return 'Te escucho con atención. 💙 ¿Podrías contarme un poco más sobre lo que estás sintiendo?';
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
    text: '¡Hola! 🌱 Soy Mentali, tu psicólogo virtual. Estoy aquí para escucharte y apoyarte sin juicios. ¿En qué te gustaría hablar hoy?',
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
