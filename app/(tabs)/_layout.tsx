import { Tabs } from 'expo-router';
import { Platform, StyleSheet, View, Animated, Easing } from 'react-native';
import { useTheme } from '../../ThemeContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef, useEffect } from 'react';

function AnimatedTabIcon({ 
  name, 
  focused, 
  color 
}: { 
  name: string; 
  focused: boolean; 
  color: string;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (focused) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1.15,
          friction: 4,
          tension: 100,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 4,
          tension: 100,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [focused]);

  return (
    <View style={styles.iconContainer}>
      {focused && (
        <Animated.View 
          style={[
            styles.glowEffect, 
            { 
              opacity: glowAnim,
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          <LinearGradient
            colors={['rgba(139, 92, 246, 0.4)', 'rgba(236, 72, 153, 0.2)', 'transparent']}
            style={styles.glowGradient}
          />
        </Animated.View>
      )}
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <MaterialCommunityIcons 
          name={name as any} 
          size={28} 
          color={focused ? '#8B5CF6' : color} 
        />
      </Animated.View>
      {focused && (
        <Animated.View style={[styles.activePill, { opacity: glowAnim }]}>
          <LinearGradient
            colors={['#8B5CF6', '#EC4899']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.activePillGradient}
          />
        </Animated.View>
      )}
    </View>
  );
}

export default function TabLayout() {
  const { theme } = useTheme();
  const darkMode = theme === 'dark';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#8B5CF6',
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: Platform.OS === 'ios' ? 95 : 80,
          paddingBottom: Platform.OS === 'ios' ? 32 : 14,
          paddingTop: 12,
          backgroundColor: darkMode ? 'rgba(10, 10, 10, 0.85)' : 'rgba(255, 255, 255, 0.85)',
          borderTopWidth: 0,
          elevation: 0,
          shadowColor: '#8B5CF6',
          shadowOpacity: 0.15,
          shadowRadius: 24,
          shadowOffset: { width: 0, height: -8 },
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
          marginTop: 6,
          letterSpacing: 0.3,
        },
        tabBarInactiveTintColor: darkMode ? '#6B7280' : '#9CA3AF',
        tabBarItemStyle: {
          paddingVertical: 4,
        },
        tabBarBackground: () => (
          <View style={styles.tabBarBackground}>
            {Platform.OS === 'ios' ? (
              <BlurView 
                intensity={darkMode ? 40 : 60} 
                tint={darkMode ? 'dark' : 'light'}
                style={StyleSheet.absoluteFill}
              />
            ) : (
              <View style={[StyleSheet.absoluteFill, { 
                backgroundColor: darkMode ? 'rgba(10, 10, 10, 0.92)' : 'rgba(255, 255, 255, 0.92)' 
              }]} />
            )}
            <View style={[
              styles.topBorderGradient,
              { backgroundColor: darkMode ? 'rgba(139, 92, 246, 0.3)' : 'rgba(139, 92, 246, 0.2)' }
            ]} />
          </View>
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon 
              name={focused ? "home" : "home-outline"} 
              focused={focused} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="premios"
        options={{
          title: 'Premios',
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon 
              name={focused ? "trophy" : "trophy-outline"} 
              focused={focused} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="psicologo"
        options={{
          title: 'Psicólogo',
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon 
              name="brain" 
              focused={focused} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon 
              name={focused ? "account" : "account-outline"} 
              focused={focused} 
              color={color} 
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarBackground: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  topBorderGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    width: 60,
    height: 36,
  },
  glowEffect: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  glowGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
  },
  activePill: {
    position: 'absolute',
    bottom: -10,
    width: 28,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  activePillGradient: {
    width: '100%',
    height: '100%',
  },
});
