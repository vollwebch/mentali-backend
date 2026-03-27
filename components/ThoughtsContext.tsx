import React, { createContext, ReactNode, useCallback, useContext, useMemo, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TREE_LEVELS } from '../constants/Prizes';

export interface Thought {
  id: string;
  emotion: string;
  emotionEmoji: string;
  emotionLabel: string;
  text: string;
  createdAt: string; // ISO
  expiresInHours: number;
  reactions: { heart: number; message: number; fire: number; brain: number };
  aiResponse?: string;
  private?: boolean;
}

export interface UserStats {
  level: number;
  thoughts: number;
  likes: number;
  days: number;
  comments: number;
  helpedOthers: number;
  aiInsights: number;
  emotions: { [key: string]: number };
}

interface ThoughtsContextProps {
  thoughts: Thought[];
  addThought: (thought: Omit<Thought, 'id' | 'createdAt'>) => void;
  allThoughts: Thought[];
  privateThoughts: Thought[];
  userStats: UserStats;
  updateUserStats: (stats: Partial<UserStats>) => void;
  isLoading: boolean;
  levelUpInfo: { level: number; reward: any } | null; // Nuevo estado para notificación
  clearLevelUp: () => void; // Función para limpiar la notificación
}

const ThoughtsContext = createContext<ThoughtsContextProps | undefined>(undefined);

const INITIAL_STATS: UserStats = {
  level: 1,
  thoughts: 0,
  likes: 0,
  days: 1,
  comments: 0,
  helpedOthers: 0,
  aiInsights: 0,
  emotions: {
    joy: 0,
    gratitude: 0,
    sadness: 0,
    anger: 0,
    fear: 0,
    surprise: 0,
  },
};

export function ThoughtsProvider({ children }: { children: ReactNode }) {
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [userStats, setUserStats] = useState<UserStats>(INITIAL_STATS);
  const [isLoading, setIsLoading] = useState(true);
  const [levelUpInfo, setLevelUpInfo] = useState<{ level: number; reward: any } | null>(null);

  useEffect(() => {
    const loadAndResetData = async () => {
      try {
        const hasBeenReset = await AsyncStorage.getItem('app_data_reset_v2');
        if (!hasBeenReset) {
          console.log('Performing one-time data reset for v2...');
          await AsyncStorage.multiRemove(['thoughts', 'userStats', 'app_data_reset_v1']);
          await AsyncStorage.setItem('app_data_reset_v2', 'true');
          setThoughts([]);
          setUserStats(INITIAL_STATS);
        } else {
          const [savedThoughts, savedStats] = await Promise.all([
            AsyncStorage.getItem('thoughts'),
            AsyncStorage.getItem('userStats'),
          ]);

          if (savedThoughts) {
            const parsedThoughts = JSON.parse(savedThoughts);
            if (Array.isArray(parsedThoughts)) setThoughts(parsedThoughts);
          }
          if (savedStats) {
            const parsedStats = JSON.parse(savedStats);
            if (typeof parsedStats === 'object' && parsedStats !== null) {
              setUserStats(prev => ({ ...INITIAL_STATS, ...parsedStats }));
            }
          }
        }
      } catch (error) {
        console.error("Failed to load or reset data. Using initial state.", error);
        setThoughts([]);
        setUserStats(INITIAL_STATS);
      } finally {
        setIsLoading(false);
      }
    };

    loadAndResetData();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      AsyncStorage.setItem('thoughts', JSON.stringify(thoughts));
      AsyncStorage.setItem('userStats', JSON.stringify(userStats));
    }
  }, [thoughts, userStats, isLoading]);

  useEffect(() => {
    if (isLoading) return;

    const checkLevelUp = () => {
      const nextLevelData = TREE_LEVELS.find(l => l.level === userStats.level + 1);
      if (!nextLevelData) return;

      const canLevelUp =
        userStats.thoughts >= nextLevelData.thoughts &&
        userStats.likes >= nextLevelData.likes &&
        userStats.days >= nextLevelData.days;

      if (canLevelUp) {
        console.log(`Leveling up to ${nextLevelData.level}!`);
        setUserStats(prevStats => ({ ...prevStats, level: nextLevelData.level }));
        setLevelUpInfo({ level: nextLevelData.level, reward: nextLevelData.reward }); // Guardar info para notificación
      }
    };

    checkLevelUp();
  }, [userStats, isLoading]);

  const clearLevelUp = () => {
    setLevelUpInfo(null);
  };

  const now = new Date();
  const activeThoughts = useMemo(() => {
    return thoughts.filter(t => {
      if (!t || !t.createdAt || !t.expiresInHours) return false;
      const created = new Date(t.createdAt);
      const expires = new Date(created.getTime() + t.expiresInHours * 60 * 60 * 1000);
      return expires > now && !t.private;
    });
  }, [thoughts]);

  const privateThoughts = useMemo(() => {
    return thoughts.filter(t => {
      if (!t || !t.createdAt || !t.expiresInHours) return false;
      const created = new Date(t.createdAt);
      const expires = new Date(created.getTime() + t.expiresInHours * 60 * 60 * 1000);
      return expires > now && t.private;
    });
  }, [thoughts]);

  const addThought = useCallback((thought: Omit<Thought, 'id' | 'createdAt'>) => {
    const newThought: Thought = {
      ...thought,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      reactions: thought.reactions || { heart: 0, message: 0, fire: 0, brain: 0 },
    };
    setThoughts(prev => [newThought, ...prev]);

    setUserStats(prevStats => {
      const newEmotions = { ...prevStats.emotions };
      const emotionKey = thought.emotion.toLowerCase();
      if (emotionKey in newEmotions) {
        newEmotions[emotionKey] = (newEmotions[emotionKey] || 0) + 1;
      }

      return {
        ...prevStats,
        thoughts: prevStats.thoughts + 1,
        emotions: newEmotions,
      };
    });
  }, []);

  const updateUserStats = useCallback((stats: Partial<UserStats>) => {
    setUserStats(prevStats => ({ ...prevStats, ...stats }));
  }, []);

  return (
    <ThoughtsContext.Provider value={{ thoughts: activeThoughts, addThought, allThoughts: thoughts, privateThoughts, userStats, updateUserStats, isLoading, levelUpInfo, clearLevelUp }}>
      {children}
    </ThoughtsContext.Provider>
  );
}

export function useThoughts() {
  const ctx = useContext(ThoughtsContext);
  if (!ctx) throw new Error('useThoughts debe usarse dentro de ThoughtsProvider');
  return ctx;
}