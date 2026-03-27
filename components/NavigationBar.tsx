import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef, useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Animated, Platform, Easing } from 'react-native';
import { useTheme } from '../ThemeContext';
import { BlurView } from 'expo-blur';

interface NavigationBarProps {
  onMapPress?: () => void;
  onProfilePress?: () => void;
}

function PulseIcon({ 
  children, 
  onPress 
}: { 
  children: React.ReactNode; 
  onPress: () => void;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.timing(scaleAnim, {
      toValue: 0.92,
      duration: 100,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  return (
    <TouchableOpacity 
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
    >
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
}

export default function NavigationBar({ onMapPress, onProfilePress }: NavigationBarProps) {
  const { theme, toggleTheme } = useTheme();
  const darkMode = theme === 'dark';
  const logoRotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(logoRotate, {
          toValue: 1,
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(logoRotate, {
          toValue: 0,
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const rotateInterpolate = logoRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '5deg'],
  });

  return (
    <View style={styles.wrapper}>
      {/* Background with blur */}
      <View style={styles.backgroundContainer}>
        {Platform.OS === 'ios' ? (
          <BlurView 
            intensity={darkMode ? 40 : 60} 
            tint={darkMode ? 'dark' : 'light'}
            style={StyleSheet.absoluteFill}
          />
        ) : (
          <View style={[
            StyleSheet.absoluteFill, 
            { backgroundColor: darkMode ? 'rgba(10, 10, 10, 0.92)' : 'rgba(255, 255, 255, 0.92)' }
          ]} />
        )}
      </View>

      <View style={styles.container}>
        {/* Logo */}
        <View style={styles.leftSection}>
          <Animated.View style={[
            styles.logoContainer, 
            { transform: [{ rotate: rotateInterpolate }] }
          ]}>
            <LinearGradient
              colors={['#8B5CF6', '#EC4899']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.logoGradient}
            >
              <MaterialCommunityIcons name="brain" size={26} color="#FFFFFF" />
            </LinearGradient>
          </Animated.View>
          <View>
            <Text style={[styles.brandName, { color: darkMode ? '#FFFFFF' : '#1F2937' }]}>
              Mentali
            </Text>
            <Text style={[styles.brandTagline, { color: darkMode ? '#6B7280' : '#9CA3AF' }]}>
              Tu espacio mental
            </Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.rightSection}>
          <PulseIcon onPress={toggleTheme}>
            <View style={[
              styles.iconButton, 
              { 
                backgroundColor: darkMode 
                  ? 'rgba(139, 92, 246, 0.15)' 
                  : 'rgba(139, 92, 246, 0.08)',
                borderColor: darkMode 
                  ? 'rgba(139, 92, 246, 0.3)' 
                  : 'rgba(139, 92, 246, 0.15)',
              }
            ]}>
              <LinearGradient
                colors={darkMode ? ['#FBBF24', '#F59E0B'] : ['#8B5CF6', '#A855F7']}
                style={styles.iconGradient}
              >
                <MaterialCommunityIcons
                  name={darkMode ? 'white-balance-sunny' : 'weather-night'}
                  size={20}
                  color="#FFFFFF"
                />
              </LinearGradient>
            </View>
          </PulseIcon>
          
          <PulseIcon onPress={onMapPress || (() => {})}>
            <View style={[
              styles.iconButton, 
              { 
                backgroundColor: darkMode 
                  ? 'rgba(6, 182, 212, 0.15)' 
                  : 'rgba(6, 182, 212, 0.08)',
                borderColor: darkMode 
                  ? 'rgba(6, 182, 212, 0.3)' 
                  : 'rgba(6, 182, 212, 0.15)',
              }
            ]}>
              <LinearGradient
                colors={['#06B6D4', '#0891B2']}
                style={styles.iconGradient}
              >
                <Feather name="globe" size={18} color="#FFFFFF" />
              </LinearGradient>
            </View>
          </PulseIcon>
          
          <PulseIcon onPress={onProfilePress || (() => {})}>
            <View style={[
              styles.iconButton, 
              { 
                backgroundColor: darkMode 
                  ? 'rgba(236, 72, 153, 0.15)' 
                  : 'rgba(236, 72, 153, 0.08)',
                borderColor: darkMode 
                  ? 'rgba(236, 72, 153, 0.3)' 
                  : 'rgba(236, 72, 153, 0.15)',
              }
            ]}>
              <LinearGradient
                colors={['#EC4899', '#DB2777']}
                style={styles.iconGradient}
              >
                <Feather name="user" size={18} color="#FFFFFF" />
              </LinearGradient>
            </View>
          </PulseIcon>
        </View>
      </View>

      {/* Bottom gradient line */}
      <LinearGradient
        colors={['#8B5CF6', '#EC4899', '#06B6D4']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.bottomLine}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    overflow: 'hidden',
  },
  backgroundContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  logoContainer: {
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#8B5CF6',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  logoGradient: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  brandTagline: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 1,
    letterSpacing: 0.3,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  iconGradient: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomLine: {
    height: 2,
    marginLeft: 20,
    marginRight: 20,
    borderRadius: 1,
    opacity: 0.6,
  },
});
