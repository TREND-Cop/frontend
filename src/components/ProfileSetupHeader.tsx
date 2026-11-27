/**
 * ProfileSetupHeader — Shared header for all profile-setup wizard screens.
 *
 * Features:
 * - Back arrow (top-left) to navigate to the previous step
 * - Optional segmented step progress bar aligned beside the back arrow
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

import { ArrowLeft } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { typography } from '../constants/theme';
import { useSingleFlight } from '../utils/safeNavigation';

interface ProfileSetupHeaderProps {
  /** Called when the back arrow is tapped */
  onBack: () => void;
  /** Screen title text */
  title: string;
  /** Screen subtitle/description text */
  subtitle: string;
  /** Current step number (1-based). If omitted, progress bar is hidden. */
  currentStep?: number;
  /** Total number of steps in the wizard. Defaults to 4. */
  totalSteps?: number;
}

export const ProfileSetupHeader: React.FC<ProfileSetupHeaderProps> = ({
  onBack,
  title,
  subtitle,
  currentStep,
  totalSteps = 4,
}) => {
  const safeBack = useSingleFlight(onBack);

  return (
    <View style={styles.container}>
      {/* ─── Top Row: Back Arrow + Segmented Progress Indicator ─────── */}
      <View style={styles.topRow}>
        {/* Back Arrow */}
        <TouchableOpacity
          onPress={safeBack}
          style={styles.backButton}
          activeOpacity={0.7}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <ArrowLeft size={24} color="#141A33" />
        </TouchableOpacity>

        {/* Segmented Progress Indicator */}
        {currentStep !== undefined && (
          <View
            style={styles.progressContainer}
            accessibilityRole="progressbar"
            accessibilityValue={{ min: 0, max: totalSteps, now: currentStep }}
          >
            {Array.from({ length: totalSteps }).map((_, index) => {
              const isActive = index < currentStep;
              return (
                <View
                  key={index}
                  style={[
                    styles.progressDash,
                    isActive ? styles.progressDashActive : styles.progressDashInactive,
                  ]}
                />
              );
            })}
          </View>
        )}
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
    gap: 11,
    marginBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressContainer: {
    flex: 1,
    height: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  progressDash: {
    flex: 1,
    height: 6,
    borderRadius: 6,
  },
  progressDashActive: {
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
  },
  progressDashInactive: {
    backgroundColor: 'rgba(235, 235, 245, 0.96)',
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
