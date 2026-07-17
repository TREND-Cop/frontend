/**
 * Route: /home
 * Placeholder Home screen — shown after completing the signup flow.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '@/constants/theme';

export default function HomeRoute() {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🎉</Text>
      <Text style={styles.title}>Welcome to Trend!</Text>
      <Text style={styles.subtitle}>
        Your account has been created successfully.
      </Text>
      <Text style={styles.hint}>
        This is a placeholder Home screen.{'\n'}
        Replace it with your actual app content.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.appBackground,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.buttonPadding,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 20,
  },
  title: {
    ...typography.h1,
    color: '#000000',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.bodyRegular,
    color: colors.primarySupportText,
    textAlign: 'center',
    marginBottom: 24,
  },
  hint: {
    ...typography.caption,
    color: colors.iconInactive,
    textAlign: 'center',
  },
});
