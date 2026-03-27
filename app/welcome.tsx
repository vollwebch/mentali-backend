import { MaterialCommunityIcons } from '@expo/vector-icons';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, Platform, StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';

const { width } = Dimensions.get('window');

interface GradientTextProps {
  text: string;
  style?: object;
}

function GradientText({ text, style }: GradientTextProps) {
  return (
    <MaskedView maskElement={<Text style={[style, { backgroundColor: 'transparent' }]}>{text}</Text>}>
      <LinearGradient
        colors={["#fff", "#e9d5ff", "#fbcfe8"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <Text style={[style, { opacity: 0 }]}>{text}</Text>
      </LinearGradient>
    </MaskedView>
  );
}

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <LinearGradient
      colors={["#312e81", "#581c87", "#831843"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.bg}
    >
      <View style={styles.centeredBox}>
        {/* Fondo translúcido y blur */}
        <View style={styles.blurBg} />
        {/* Círculo flotante con icono */}
        <View style={styles.floatingCircleBox}>
          <View style={styles.floatingCircle}>
            <MaterialCommunityIcons name="brain" size={44} color="#fff" />
          </View>
        </View>
        {/* Contenido */}
        <View style={styles.contentBox}>
          <GradientText text="Mentaby" style={styles.title} />
          <Text style={styles.subtitle}>Un espacio seguro para tu mente</Text>
          {/* Tarjetas */}
          <View style={styles.cardBox}>
            <View style={styles.card}>
              <MaterialCommunityIcons name="key-variant" size={22} color="#d8b4fe" style={styles.cardIcon} />
              <View>
                <Text style={styles.cardTitle}>100% Anónimo</Text>
                <Text style={styles.cardText}>Comparte tus pensamientos sin mostrar tu identidad</Text>
              </View>
            </View>
            <View style={styles.card}>
              <MaterialCommunityIcons name="robot-outline" size={22} color="#d8b4fe" style={styles.cardIcon} />
              <View>
                <Text style={styles.cardTitle}>IA Empática</Text>
                <Text style={styles.cardText}>Respuestas comprensivas que te acompañan emocionalmente</Text>
              </View>
            </View>
            <View style={styles.card}>
              <MaterialCommunityIcons name="clock-outline" size={22} color="#d8b4fe" style={styles.cardIcon} />
              <View>
                <Text style={styles.cardTitle}>Efímero</Text>
                <Text style={styles.cardText}>Los pensamientos desaparecen después de 24-72 horas</Text>
              </View>
            </View>
          </View>
          {/* Botón */}
          <Button
            mode="contained"
            style={styles.button}
            labelStyle={styles.buttonLabel}
            contentStyle={{ height: 48 }}
            onPress={() => router.replace('/(tabs)')}
            buttonColor="#fff"
            textColor="#581c87"
          >
            Comenzar mi viaje emocional
          </Button>
          {/* Texto de privacidad */}
          <Text style={styles.privacyText}>
            Tus pensamientos son privados y anónimos para otros usuarios
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 0,
  },
  centeredBox: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    padding: 0,
  },
  blurBg: {
    ...Platform.select({
      ios: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.20)',
        borderRadius: 24,
        zIndex: 0,
      },
      android: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.20)',
        borderRadius: 24,
        zIndex: 0,
      },
    }),
  },
  floatingCircleBox: {
    position: 'absolute',
    top: -60,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 2,
  },
  floatingCircle: {
    width: 80,
    height: 80,
    backgroundColor: 'rgba(255,255,255,0.20)',
    borderRadius: 40,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.10, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } },
      android: { elevation: 6 },
    }),
  },
  contentBox: {
    marginTop: 60,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: 24,
    paddingVertical: 32,
    paddingHorizontal: 20,
    alignItems: 'center',
    width: '100%',
    maxWidth: 360,
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    zIndex: 1,
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 18,
    color: '#e9d5ff',
    marginBottom: 28,
    textAlign: 'center',
    fontWeight: '300',
  },
  cardBox: {
    width: '100%',
    marginBottom: 28,
    gap: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.20)',
    paddingVertical: 16,
    paddingHorizontal: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  cardIcon: {
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#f3e8ff',
    marginBottom: 2,
  },
  cardText: {
    fontSize: 12,
    color: '#e9d5ff',
    fontWeight: '400',
    lineHeight: 18,
  },
  button: {
    width: '100%',
    borderRadius: 18,
    marginTop: 8,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  buttonLabel: {
    color: '#581c87',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.2,
  },
  privacyText: {
    color: '#a78bfa',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 18,
    fontWeight: '400',
    lineHeight: 18,
  },
}); 