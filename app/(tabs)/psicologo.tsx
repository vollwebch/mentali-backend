import React, { useCallback, useState, useRef, useEffect } from 'react';
import { GiftedChat, IMessage, Bubble, InputToolbar, Send } from 'react-native-gifted-chat';
import { Platform, View, StyleSheet, Text, SafeAreaView, StatusBar, TouchableOpacity, Animated, Easing } from 'react-native';
import { useTheme } from '../../ThemeContext';
import { Colors } from '../../constants/Colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

// =====================================================
// IA PSICÓLOGO CON LÓGICA CONTEXTUAL
// =====================================================

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

let conversationHistory: Message[] = [];

// Analizar intención del mensaje
function analyzeIntent(message: string): { intent: string; emotion: string; context: string } {
  const text = message.toLowerCase().trim();
  
  // Detectar si pregunta por el bot
  const askingAboutBot = text.match(/\by\s*t[uú]|\by\s*a\s*t[ií]|c[oó]mo est[aá]s tu|t[uú] c[oó]mo est[aá]s|qu[ié]e[eé]n eres|qu[eé] eres/);
  
  // Detectar emociones
  let emotion = 'neutral';
  if (text.match(/triste|deprimido|llorar|llorando|melancol/)) emotion = 'tristeza';
  else if (text.match(/ansioso|ansiedad|nervioso|preocupado|estresado|estr[eé]s/)) emotion = 'ansiedad';
  else if (text.match(/solo|sol[a]|vac[ií]o|sin alguien|nadie/)) emotion = 'soledad';
  else if (text.match(/enfadado|enojado|molesto|irritado|furioso|ira/)) emotion = 'ira';
  else if (text.match(/feliz|alegre|contento|genial|b[ié]en|perfecto/)) emotion = 'alegria';
  else if (text.match(/cansado|agotado|sin energ[ií]a|fatiga/)) emotion = 'agotamiento';
  else if (text.match(/miedo|asustado|terror|p[aá]nico/)) emotion = 'miedo';
  else if (text.match(/decepcionado|desilusi[oó]n|frustrado/)) emotion = 'frustracion';
  
  // Detectar intención
  let intent = 'desconocido';
  if (askingAboutBot) intent = 'pregunta_bot';
  else if (text.match(/^(hola|hey|hi|hello|buenos|buenas)/)) intent = 'saludo';
  else if (text.match(/gracias|te agradezco|muchas gracias/)) intent = 'agradecimiento';
  else if (text.match(/^no\s*s[eé]|no s[eé]$/)) intent = 'indeciso';
  else if (text.match(/^(si|s[ií]|claro|exacto|ok|vale)$/)) intent = 'afirmacion';
  else if (text.match(/^(no|nop|nope)$/)) intent = 'negacion';
  else if (text.match(/suicidar|matarme|morir|acabar con|no quiero vivir/)) intent = 'crisis';
  else if (text.match(/ayuda|necesito|apoyo/)) intent = 'solicitud_ayuda';
  else if (text.match(/novio|novia|pareja|relaci[oó]n/)) intent = 'problema_relacion';
  else if (text.match(/trabajo|jefe|empleo/)) intent = 'problema_trabajo';
  else if (text.match(/familia|padre|madre|hermano/)) intent = 'problema_familia';
  else if (text.length < 5) intent = 'mensaje_corto';
  else if (text.length > 0) intent = 'expresion';
  
  // Contexto basado en mensaje anterior
  const lastBotMsg = conversationHistory.filter(m => m.role === 'assistant').pop()?.content || '';
  let context = 'inicio';
  if (lastBotMsg.includes('¿Cómo te sientes')) context = 'pregunta_emocion';
  else if (lastBotMsg.includes('¿Qué')) context = 'pregunta_abierta';
  else if (lastBotMsg.includes('¿Cómo ha')) context = 'pregunta_dia';
  else if (lastBotMsg.includes('ejercicio')) context = 'sugerencia_ejercicio';
  
  return { intent, emotion, context };
}

// Generar respuesta inteligente basada en contexto
function generateResponse(message: string): string {
  const { intent, emotion, context } = analyzeIntent(message);
  const text = message.toLowerCase().trim();
  
  // CRISIS - SIEMPRE PRIORIDAD
  if (intent === 'crisis') {
    return '🆘 Tu vida importa mucho. Por favor, contacta ayuda ahora:\n\n🇪🇸 España: 024\n🇲🇽 México: 800-290-0024\n🇦🇷 Argentina: 135\n🇨🇴 Colombia: 106\n\nNo estás solo/a. Estoy aquí contigo. 💙';
  }
  
  // PREGUNTA POR EL BOT - RESPUESTA COHERENTE
  if (intent === 'pregunta_bot') {
    if (text.includes('quien') || text.includes('qué')) {
      return 'Soy Mentali, un psicólogo virtual creado para escucharte y apoyarte. 💙 ¿Cómo te sientes hoy?';
    }
    return 'Como psicólogo virtual no tengo emociones propias, pero me importa mucho lo que sientes. 💙 Cuéntame, ¿cómo está tu día?';
  }
  
  // SALUDO
  if (intent === 'saludo') {
    return '¡Hola! 👋 Soy Mentali, tu psicólogo virtual. Estoy aquí para escucharte sin juicios. ¿Cómo te sientes hoy?';
  }
  
  // AGRADECIMIENTO
  if (intent === 'agradecimiento') {
    return 'Es un honor poder acompañarte. 💙 ¿Hay algo más que te gustaría compartir?';
  }
  
  // INDECISO
  if (intent === 'indeciso') {
    if (context === 'pregunta_emocion') {
      return 'Está bien, a veces es difícil ponerle nombre a lo que sentimos. 🌿 ¿Tu día ha sido bueno, malo, o algo intermedio?';
    }
    if (context === 'pregunta_dia') {
      return 'No te preocupes. A veces los días son simplemente días. 🌿 ¿Hay algo pequeño que te gustaría contar?';
    }
    return 'Está bien, no tienes que tener todo claro ahora. 🌿 Tómate tu tiempo. ¿Hay algo en tu mente?';
  }
  
  // AFIRMACIÓN
  if (intent === 'afirmacion') {
    if (context === 'pregunta_emocion' || context === 'pregunta_abierta') {
      return 'Me alegra que puedas compartir esto. 💙 ¿Qué más hay en tu corazón?';
    }
    return 'Entiendo. 💙 ¿Te gustaría contarme más sobre eso?';
  }
  
  // NEGACIÓN
  if (intent === 'negacion') {
    return 'Está bien. 🌿 Aquí estoy si necesitas hablar de algo. ¿Hay algo en lo que pueda ayudarte?';
  }
  
  // EMOCIONES - RESPUESTAS EMPÁTICAS
  if (emotion === 'tristeza') {
    return 'Siento que estés pasando por este momento. 💙 Tus sentimientos son completamente válidos. ¿Qué ha despertado esta tristeza en ti?';
  }
  if (emotion === 'ansiedad') {
    return 'Entiendo que la ansiedad puede sentirse abrumadora. 💙 Respira profundo. ¿Qué está generando esta inquietud en ti?';
  }
  if (emotion === 'soledad') {
    return 'Sentirse solo puede ser muy doloroso. 💙 Quiero que sepas que estoy aquí contigo ahora mismo. ¿Hace cuánto te sientes así?';
  }
  if (emotion === 'ira') {
    return 'La ira es una emoción válida y a veces necesaria. 💙 ¿Qué fue lo que provocó estos sentimientos en ti?';
  }
  if (emotion === 'alegria') {
    return '¡Qué bueno escuchar eso! 💜 Las emociones positivas también merecen ser celebradas. ¿Qué está trayendo esta alegría a tu vida?';
  }
  if (emotion === 'agotamiento') {
    return 'El agotamiento puede ser físico, emocional o ambos. 💙 ¿Has estado descansando lo suficiente? ¿O hay algo que te preocupa?';
  }
  if (emotion === 'miedo') {
    return 'El miedo es una respuesta natural, pero puede paralizarnos. 💙 ¿Qué es lo que te asusta? A veces hablarlo ayuda a que pierda poder.';
  }
  if (emotion === 'frustracion') {
    return 'La frustración surge cuando las expectativas no coinciden con la realidad. 💙 ¿Qué esperabas que sucediera?';
  }
  
  // PROBLEMAS ESPECÍFICOS
  if (intent === 'problema_relacion') {
    return 'Las relaciones pueden ser fuente de gran alegría pero también de dolor. 💙 ¿Qué está pasando en tu relación?';
  }
  if (intent === 'problema_trabajo') {
    return 'El trabajo ocupa gran parte de nuestra vida y puede generar mucho estrés. 💙 ¿Qué situación estás enfrentando?';
  }
  if (intent === 'problema_familia') {
    return 'La familia es importante pero las dinámicas pueden ser complejas. 💙 ¿Qué está sucediendo con tu familia?';
  }
  if (intent === 'solicitud_ayuda') {
    return 'Estoy aquí para ti. 💙 Cuéntame qué necesitas, te escucho con atención.';
  }
  
  // MENSAJE CORTO
  if (intent === 'mensaje_corto') {
    return 'Te escucho. 💙 ¿Podrías contarme un poco más?';
  }
  
  // RESPUESTA POR DEFECTO INTELIGENTE
  const lastBotMsg = conversationHistory.filter(m => m.role === 'assistant').pop()?.content || '';
  
  // Si el usuario responde a una pregunta específica
  if (context === 'pregunta_emocion') {
    return 'Gracias por compartir eso conmigo. 💙 ¿Puedes profundizar un poco más en cómo te hace sentir?';
  }
  if (context === 'sugerencia_ejercicio') {
    return '¿Te gustaría que probemos algún ejercicio de respiración o mindfulness? 🧘';
  }
  
  // Default inteligente
  return 'Te escucho con atención. 💙 Cuéntame más sobre lo que estás sintiendo o pensando.';
}

// Función principal para obtener respuesta
async function getAIResponse(userMessage: string): Promise<string> {
  conversationHistory.push({ role: 'user', content: userMessage });
  
  const response = generateResponse(userMessage);
  
  conversationHistory.push({ role: 'assistant', content: response });
  
  // Mantener solo los últimos 20 mensajes
  if (conversationHistory.length > 20) {
    conversationHistory = conversationHistory.slice(-20);
  }
  
  return response;
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
