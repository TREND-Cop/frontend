/**
 * SocialAuthSection — Reusable social login divider + Google/Apple buttons.
 *
 * Used on both SignUpScreen and SignInScreen.
 * The divider text (e.g. "Sign up with" vs "Sign in with") is configurable.
 *
 * Usage:
 *   <SocialAuthSection
 *     dividerText="Sign up with"
 *     onGooglePress={handleGoogle}
 *     onApplePress={handleApple}
 *   />
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { colors, typography, radius } from '../constants/theme';

interface SocialAuthSectionProps {
  /** Text shown between the two divider lines (e.g. "Sign up with") */
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
  /**
   * Apple button handler.
   * 
   * TODO (Backend):
   * 1. Initialize Apple Sign In flow (e.g. using expo-apple-authentication).
   * 2. Obtain an `identityToken` from Apple.
   * 3. POST request to `/api/auth/apple` with the token.
   * 4. The backend verifies the token and returns a JWT.
   */
  onApplePress: () => void;
}

export const SocialAuthSection: React.FC<SocialAuthSectionProps> = ({
  dividerText,
  onGooglePress,
  onApplePress,
}) => {
  return (
    <>
      {/* ─── Divider Row ──────────────────────────────────────────── */}
      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>{dividerText}</Text>
        <View style={styles.dividerLine} />
      </View>

      {/* ─── Social Buttons ───────────────────────────────────────── */}
      <View style={styles.socialRow}>
        {/* Google Button */}
        <TouchableOpacity
          style={styles.socialButton}
          onPress={onGooglePress}
          activeOpacity={0.7}
        >
          <Image
            source={{ uri: 'https://img.icons8.com/color/48/000000/gmail-new.png' }}
            style={{ width: 32, height: 24 }}
            resizeMode="contain"
          />
        </TouchableOpacity>

        {/* Apple Button */}
        <TouchableOpacity
          style={styles.socialButton}
          onPress={onApplePress}
          activeOpacity={0.7}
        >
          <Image
            source={{ uri: 'https://img.icons8.com/ios-filled/50/000000/mac-os.png' }}
            style={{ width: 32, height: 32 }}
            resizeMode="contain"
          />
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
    marginBottom: 32,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.outlineBorders,
  },
  dividerText: {
    ...typography.caption,
    color: colors.primarySupportText,
    marginHorizontal: 12,
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 80,
    marginBottom: 40,
  },
  socialButton: {
    width: 56,
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.appBackground,
  },
  socialIcon: {
    fontSize: 24,
    color: '#000000',
  },
});
