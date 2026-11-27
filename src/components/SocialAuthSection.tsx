/**
 * SocialAuthSection — Reusable social login divider + centered Google button.
 *
 * Used on customer auth screens (SignInScreen).
 * The divider text (e.g. "Sign in with" vs "Sign up with") is configurable.
 *
 * Usage:
 *   <SocialAuthSection
 *     dividerText="Sign in with"
 *     onGooglePress={handleGoogle}
 *   />
 */

import React from 'react';
import { Platform, View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { colors, typography } from '../constants/theme';
import { GoogleIcon } from './GoogleIcon';

interface SocialAuthSectionProps {
  /** Text shown between the two divider lines (e.g. "Sign in with") */
  dividerText: string;
  /**
   * Google button handler.
   *
   * TODO (Backend):
   * 1. Initialize Google OAuth flow (e.g. using @react-native-google-signin/google-signin).
   * 2. Obtain an `idToken` or `serverAuthCode` from Google.
   * 3. POST request to `/api/auth/google` with the token.
   * 4. The backend verifies the token and returns a JWT (like standard sign in).
   */
  onGooglePress: () => void;
  /** Optional button label (defaults to "Continue with Google") */
  buttonLabel?: string;
  /** Shows a compact inline loader beside the label while Google auth is in progress */
  loading?: boolean;
}

export const SocialAuthSection: React.FC<SocialAuthSectionProps> = ({
  dividerText,
  onGooglePress,
  buttonLabel = 'Continue with Google',
  loading = false,
}) => {
  return (
    <>
      {/* ─── Divider Row ──────────────────────────────────────────── */}
      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>{dividerText}</Text>
        <View style={styles.dividerLine} />
      </View>

      {/* ─── Centered Google Auth Button ──────────────────────────── */}
      <View style={styles.socialRow}>
        <TouchableOpacity
          style={[styles.googleButton, loading && styles.googleButtonLoading]}
          onPress={onGooglePress}
          activeOpacity={0.75}
          disabled={loading}
          accessibilityRole="button"
          accessibilityLabel={buttonLabel}
          accessibilityState={{ busy: loading }}
        >
          <GoogleIcon size={22} />
          <Text style={styles.googleButtonText}>{buttonLabel}</Text>
          {loading && (
            <ActivityIndicator
              size="small"
              color="rgba(0, 8, 20, 0.96)"
              style={styles.googleLoader}
            />
          )}
        </TouchableOpacity>
      </View>
    </>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.outlineBorders,
  },
  dividerText: {
    ...typography.supportText,
    color: colors.primarySupportText,
    marginHorizontal: 12,
  },
  socialRow: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  googleButton: {
    width: '100%',
    maxWidth: 358,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    backgroundColor: colors.appBackground,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 16,
  },
  googleButtonLoading: {
    opacity: 0.78,
  },
  googleLoader: {
    marginLeft: 2,
  },
  googleButtonText: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
    color: 'rgba(0, 8, 20, 0.96)',
    includeFontPadding: false,
  },
});
