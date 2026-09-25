/**
 * ProfileSetupHeader — Shared header for all profile-setup wizard screens.
 *
 * Features:
 * - Back arrow (top-left) to navigate to the previous step
 * - Optional step progress indicator (dots showing current step out of total)
 * - Title (typography.h1)
 * - Subtitle (typography.bodyRegular, muted)
 *
 * Usage:
 *   <ProfileSetupHeader
 *     onBack={() => navigation.goBack()}
 *     title="Enter Your Location"
 *     subtitle="Your location will enable us connect you with places near you."
 *     currentStep={1}
 *     totalSteps={4}
 *   />
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { colors, typography, spacing } from '../constants/theme';

interface ProfileSetupHeaderProps {
  /** Called when the back arrow is tapped */
  onBack: () => void;
  /** Screen title text */
  title: string;
  /** Screen subtitle/description text */
  subtitle: string;
  /** Current step number (1-based). If omitted, progress dots are hidden. */
  currentStep?: number;
  /** Total number of steps in the wizard. Defaults to 4. */
  totalSteps?: number;
}

export const ProfileSetupHeader: React.FC<ProfileSetupHeaderProps> = ({
  onBack,
  title,
  subtitle,
}) => {
  return (
    <View style={styles.container}>
      {/* ─── Top Row: Back Arrow ────────────────────────────────────── */}
      <View style={styles.topRow}>
        {/* Back Arrow */}
        <TouchableOpacity onPress={onBack} style={styles.backButton} activeOpacity={0.7}>
          <ArrowLeft size={24} color="#141A33" />
        </TouchableOpacity>
      </View>

      {/* ─── Title & Subtitle ──────────────────────────────────────── */}
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    marginBottom: 40,
  },

  // ── Top Row ─────────────────────────────────────────────────────────────
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    fontSize: 24,
    color: '#141A33', // Custom back arrow color
  },

  // ── Title & Subtitle ───────────────────────────────────────────────────
  title: {
    ...typography.h1Med,
    color: '#141A33',
    lineHeight: 32,
    marginBottom: 8,
  },
  subtitle: {
    ...typography.bodyRegular,
    color: 'rgba(96, 96, 102, 0.96)',
    lineHeight: 24,
  },
});
