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
import { Platform, View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import Svg, { Path } from 'react-native-svg';
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
          <Svg width={32} height={24} viewBox="0 0 256 193" fill="none">
            <Path
              d="M58.182 192.05V93.54L0 50.05v120c0 12.15 9.85 22 22 22h36.182Z"
              fill="#4285F4"
            />
            <Path
              d="M197.818 192.05h36.182c12.15 0 22-9.85 22-22V50.05l-58.182 43.49v98.51Z"
              fill="#34A853"
            />
            <Path
              d="M58.182 93.54l69.818 52.273 69.818-52.273V22c0-18.04-20.73-27.87-34.46-16.18L128 35.82 92.64 5.82C78.91-5.87 58.182 3.96 58.182 22v71.54Z"
              fill="#EA4335"
            />
            <Path
              d="M197.818 22v71.54l58.182-43.49V34.05c0-17.65-20.17-27.42-33.68-16.03L197.818 22Z"
              fill="#FBBC04"
            />
            <Path
              d="M0 50.05l58.182 43.49V22L33.68 5.97C20.17-5.42 0 4.35 0 22v28.05Z"
              fill="#C5221F"
            />
          </Svg>
        </TouchableOpacity>

        {/* Apple Button */}
        <TouchableOpacity
          style={styles.socialButton}
          onPress={onApplePress}
          activeOpacity={0.7}
        >
          <Svg width={32} height={32} viewBox="0 0 24 24" fill="#000000">
            <Path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.38c.62-.75 1.04-1.8 0.92-2.85-.9.04-1.99.6-2.64 1.35-.57.66-1.07 1.72-.94 2.74 1.01.08 2.04-.49 2.66-1.24z" />
          </Svg>
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
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 24,
    color: '#000000',
  },
});
