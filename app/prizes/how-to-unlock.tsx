import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '../../ThemeContext';
import { Colors } from '../../constants/Colors';
import { PRIZES } from '../../constants/Prizes';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const HowToUnlockScreen = () => {
  const { theme } = useTheme();
  const styles = getStyles(Colors[theme]);
  const router = useRouter();

  return (
    <View style={styles.bg}>
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.headerBtn} onPress={() => router.back()}>
            <Feather name="arrow-left" size={22} color={Colors[theme].text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Cómo Desbloquear Premios</Text>
          <View style={{ width: 36 }} />
        </View>

        {PRIZES.map(prize => (
          <View key={prize.id} style={styles.prizeItem}>
            <View style={[styles.prizeIconContainer, { backgroundColor: prize.color + '20'}]}>
              {typeof prize.icon === 'string' && prize.icon.length > 2 ? (
                <MaterialCommunityIcons name={prize.icon} size={28} color={prize.color || '#fff'} />
              ) : (
                <Text style={styles.prizeIconEmoji}>{prize.icon}</Text>
              )}
            </View>
            <View style={styles.prizeTextContainer}>
              <Text style={styles.prizeTitle}>{prize.title}</Text>
              <Text style={styles.prizeDescription}>{prize.description}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const getStyles = (themeColors) => StyleSheet.create({
  bg: {
    flex: 1,
    backgroundColor: themeColors.background,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 32,
    paddingBottom: 18,
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: themeColors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: themeColors.text,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  prizeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: themeColors.card,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  prizeIconContainer: {
    marginRight: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  prizeIconEmoji: {
    fontSize: 24,
  },
  prizeTextContainer: {
    flex: 1,
  },
  prizeTitle: {
    color: themeColors.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  prizeDescription: {
    color: themeColors.secondaryText,
    fontSize: 14,
    marginTop: 4,
  },
});

export default HowToUnlockScreen;
