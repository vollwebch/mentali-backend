import React, { useCallback, useState } from 'react';
import { GiftedChat, IMessage } from 'react-native-gifted-chat';
import { Platform, View } from 'react-native';

// URL de la API según la plataforma
const getApiUrl = () => {
  if (Platform.OS === 'web') {
    return '/api/chat';
  }
  return 'https://mentali-app.vercel.app/api/chat';
};

const API_URL = getApiUrl();

export default function PsicologoChat() {
  const [messages, setMessages] = useState<IMessage[]>([
    {
      _id: 1,
      text: '¡Hola! 🌱 Soy Mentali, tu psicólogo virtual. Estoy aquí para escucharte y apoyarte sin juicios. ¿En qué te gustaría hablar hoy?',
      createdAt: new Date(),
      user: { _id: 2, name: 'Mentali', avatar: '🧠' },
    },
  ]);
  const [loading, setLoading] = useState(false);

  const onSend = useCallback(async (newMessages: IMessage[] = []) => {
    setMessages(previousMessages => GiftedChat.append(previousMessages, newMessages));
    setLoading(true);
    try {
      const userMessages = [...GiftedChat.append([], newMessages), ...messages]
        .reverse()
        .map(m => ({
          role: m.user._id === 1 ? 'user' : 'assistant',
          content: m.text,
        }));

      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: userMessages }),
      });
      const data = await res.json();

      setMessages(previousMessages =>
        GiftedChat.append(previousMessages, [
          {
            _id: Date.now(),
            text: data.response || 'Lo siento, no pude procesar tu mensaje.',
            createdAt: new Date(),
            user: { _id: 2, name: 'Mentali', avatar: '🧠' },
          },
        ])
      );
    } catch (e) {
      setMessages(previousMessages =>
        GiftedChat.append(previousMessages, [
          {
            _id: Date.now(),
            text: 'Lo siento, hubo un error al conectar. Por favor, intenta de nuevo. 🙏',
            createdAt: new Date(),
            user: { _id: 2, name: 'Mentali', avatar: '🧠' },
          },
        ])
      );
    }
    setLoading(false);
  }, [messages]);

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <GiftedChat
        messages={messages}
        onSend={(msgs: IMessage[]) => onSend(msgs)}
        user={{ _id: 1 }}
        isTyping={loading}
        placeholder="Escribe tu mensaje..."
        renderUsernameOnMessage
        showUserAvatar
        messagesContainerStyle={{ backgroundColor: '#f5f5f5' }}
      />
    </View>
  );
}
