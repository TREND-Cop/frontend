/**
 * AuthFooter — Reusable footer section for auth screens.
 *
 * Renders two parts:
 * 1. An account-switch link (e.g. "Don't have an account? Sign Up")
 * 2. A Terms & Conditions line with a tappable link
 *
 * Usage:
 *   <AuthFooter
 *     promptText="Don't have an account? "
 *     linkText="Sign Up"
 *     onLinkPress={handleGoToSignUp}
 *     onTermsPress={handleOpenTerms}
 *   />
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, typography } from '../constants/theme';

interface AuthFooterProps {
  /** The static text before the tappable link (e.g. "Don't have an account? ") */
  promptText: string;
  /** The tappable link text (e.g. "Sign Up") */
  linkText: string;
  /** Called when the link text is tapped */
  onLinkPress: () => void;
  /**
   * Called when "Terms and Condition" is tapped.
   * TODO (Navigation): Navigate to TermsScreen or open a web URL.
   */
  onTermsPress: () => void;
}

export const AuthFooter: React.FC<AuthFooterProps> = ({
  promptText,
  linkText,
  onLinkPress,
  onTermsPress,
}) => {
  return (
    <>
      {/* ─── Account Switch Link ──────────────────────────────────── */}
      <View style={styles.switchRow}>
        <Text style={styles.switchText}>{promptText}</Text>
        <TouchableOpacity onPress={onLinkPress}>
          <Text style={styles.switchLink}>{linkText}</Text>
        </TouchableOpacity>
      </View>

      {/* ─── Terms & Conditions ───────────────────────────────────── */}
      <View style={styles.termsContainer}>
        <Text style={styles.termsText}>
          By continuing, you agree to our Application{' '}
        </Text>
        <TouchableOpacity onPress={onTermsPress}>
          <Text style={styles.termsLink}>Terms and Condition</Text>
        </TouchableOpacity>
      </View>
    </>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 32,
  },
  switchText: {
    ...typography.label,
    color: '#141A33',
  },
  switchLink: {
    ...typography.button,
    color: 'rgba(26, 130, 255, 0.9)',
    textDecorationLine: 'underline',
  },
  termsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  termsText: {
    ...typography.caption,
    color: '#000000',
    textAlign: 'center',
  },
  termsLink: {
    ...typography.caption,
    color: '#000000',
    textDecorationLine: 'underline',
  },
});
