import { Tabs } from 'expo-router';
import React from 'react';

import { IconSymbol } from '../../components/ui/IconSymbol';
import TabBarBackground from '../../components/ui/TabBarBackground';
import { Colors } from '../../constants/Colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../ThemeContext';

export default function TabLayout() {
  const { theme } = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[theme].tint,
        headerShown: false,
        header: () => null,
        headerTransparent: true,
        tabBarBackground: TabBarBackground,
        tabBarStyle: {
          backgroundColor: theme === 'light' ? '#FFD700' : (theme === 'dark' ? '#1a1a1a' : '#fff'),
          borderTopColor: theme === 'dark' ? '#333' : '#e0e0e0',
        },
        tabBarLabelStyle: {
          fontSize: 13,
          fontWeight: '600',
          letterSpacing: 0.2,
        },
        tabBarInactiveTintColor: (Colors[theme] as any).secondaryText ?? '#6D28D9',
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          headerShown: false,
          header: () => null,
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="premios"
        options={{
          title: 'Premios',
          headerShown: false,
          header: () => null,
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="trophy-award" color={color} />,
        }}
      />
      <Tabs.Screen
        name="psicologo"
        options={{
          title: 'Psicólogo',
          headerShown: false,
          header: () => null,
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="brain" size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          headerShown: false,
          header: () => null,
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.crop.circle" color={color} />,
        }}
      />
    </Tabs>
  );
}
