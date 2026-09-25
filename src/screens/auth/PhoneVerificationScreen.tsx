/**
 * PhoneVerificationScreen — 1:1 Figma Screen for Number Verification
 * Exact styles converted from Figma specifications.
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { typography } from '../../constants/theme';

const OTP_LENGTH = 4;
const RESEND_COUNTDOWN_SECONDS = 65; // 1:05 in seconds

// ── Exact Figma Arrow-Left Icon (24x24) ──
const ArrowLeftIcon = ({ size = 24, color = 'rgba(0, 8, 20, 0.96)' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4.5 12H19.5"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M10 18C10 18 4.5 13.58 4.5 12C4.5 10.42 10 6 10 6"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// ── Exact Figma Notification Bell Icon (24x24) ──
const NotificationBellIcon = ({ size = 24, color = '#000000' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2C8.686 2 6 4.686 6 8V13.293L4.293 15C4.105 15.187 4 15.442 4 15.707V17C4 17.552 4.448 18 5 18H19C19.552 18 20 17.552 20 17V15.707C20 15.442 19.895 15.187 19.707 15L18 13.293V8C18 4.686 15.314 2 12 2Z"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M9 18C9 19.657 10.343 21 12 21C13.657 21 15 19.657 15 18"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
    />
  </Svg>
);

const formatCountdown = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const PhoneVerificationScreen = ({
  navigation,
  route,
}: {
  navigation?: any;
  route?: any;
}) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const phone = route?.params?.phone || '+234 8136567398';

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [focusedIndex, setFocusedIndex] = useState<number>(0);
  const inputRefs = useRef<(TextInput | null)[]>(Array(OTP_LENGTH).fill(null));

  const [countdown, setCountdown] = useState(RESEND_COUNTDOWN_SECONDS);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setIsKeyboardVisible(true)
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setIsKeyboardVisible(false)
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const allDigitsEntered = otp.every((digit) => digit.length === 1);

  useEffect(() => {
    if (!isTimerRunning) return;
    if (countdown <= 0) {
      setIsTimerRunning(false);
      return;
    }

    const interval = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [countdown, isTimerRunning]);

  const handleOtpChange = useCallback(
    (text: string, index: number) => {
      const digit = text.replace(/[^0-9]/g, '');
      const newOtp = [...otp];
      newOtp[index] = digit.slice(-1);
      setOtp(newOtp);

      if (digit.length > 0 && index < OTP_LENGTH - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    },
    [otp]
  );

  const handleKeyPress = useCallback(
    (e: any, index: number) => {
      if (e.nativeEvent.key === 'Backspace') {
        if (otp[index] === '' && index > 0) {
          const newOtp = [...otp];
          newOtp[index - 1] = '';
          setOtp(newOtp);
          inputRefs.current[index - 1]?.focus();
        }
      }
    },
    [otp]
  );

  const isForgotPassword = route?.params?.flow === 'forgot-password';

  const handleVerify = () => {
    if (!allDigitsEntered) return;
    if (isForgotPassword) {
      if (navigation?.navigate) {
        navigation.navigate('PasswordResetSuccess');
      } else {
        router.replace('/password-reset-success' as any);
      }
    } else {
      if (navigation?.navigate) {
        navigation.navigate('SignUpSuccess');
      } else {
        router.replace('/sign-up-success' as any);
      }
    }
  };

  const handleResend = () => {
    setCountdown(RESEND_COUNTDOWN_SECONDS);
    setIsTimerRunning(true);
    setOtp(Array(OTP_LENGTH).fill(''));
    inputRefs.current[0]?.focus();
  };

  const handleGoBack = () => {
    if (navigation?.goBack) {
      navigation.goBack();
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/sign-up' as any);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'android' ? 0 : 0}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: isKeyboardVisible ? 220 : 16 },
          ]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
          {/* Top Bar with Back Button */}
          <View style={styles.topBar}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleGoBack}
              activeOpacity={0.7}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <ArrowLeftIcon size={24} />
            </TouchableOpacity>
          </View>

          {/* Centered Bell Icon Circle Badge (Figma: Frame 1000005729, 48x48, top 99) */}
          <View style={styles.bellBadgeContainer}>
            <NotificationBellIcon size={24} />
          </View>

          {/* Header Text Group (Figma: email verification header, gap 16px, top 171) */}
          <View style={styles.headerGroup}>
            <View style={styles.titleSubtitleCol}>
              <Text style={styles.title}>Number Verification</Text>
              <Text style={styles.subtitle}>
                Verification code sent to the following Phone Number
              </Text>
              <Text style={styles.phoneNumber}>{phone}</Text>
            </View>
          </View>

          {/* 4 OTP Digit Boxes (Figma: verification pin, 312px width, 48px height, gap 40px, top 323) */}
          <View style={styles.otpPinContainer}>
            {otp.map((digit, index) => {
              const isFocused = focusedIndex === index;
              return (
                <View
                  key={index}
                  style={[
                    styles.otpBox,
                    isFocused && styles.otpBoxFocused,
                    digit.length > 0 && styles.otpBoxFilled,
                  ]}
                >
                  <TextInput
                    ref={(ref) => {
                      inputRefs.current[index] = ref;
                    }}
                    style={styles.otpInput}
                    value={digit}
                    onChangeText={(text) => handleOtpChange(text, index)}
                    onKeyPress={(e) => handleKeyPress(e, index)}
                    onFocus={() => setFocusedIndex(index)}
                    keyboardType="number-pad"
                    inputMode="numeric"
                    maxLength={1}
                    selectTextOnFocus
                    autoFocus={index === 0}
                  />
                </View>
              );
            })}
          </View>

          {/* Resend Timer Row (Figma: resend timer, 112px, 24px, gap 8px, top 395) */}
          <View style={styles.timerRow}>
            <Text style={styles.resendInText}>Resend in</Text>
            <Text style={styles.countdownText}>{formatCountdown(countdown)}</Text>
          </View>

          {/* Didn't get OTP Divider (Figma: didnt get otp question, 335px, 20px, gap 16px, top 637) */}
          <View style={styles.didntGetOtpRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.didntGetOtpText}>Didn't get OTP?</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Resend Action Button (Figma: Filled action Button, 358x48, radius 24, top 695) */}
          <TouchableOpacity
            style={styles.resendButton}
            onPress={handleResend}
            activeOpacity={0.8}
          >
            <Text style={styles.resendButtonText}>Resend</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* ── Sticky Verify Button — always visible above keyboard ── */}
        <View style={styles.stickyVerifyContainer}>
          <TouchableOpacity
            style={[
              styles.verifyButton,
              allDigitsEntered ? styles.verifyButtonActive : styles.verifyButtonDisabled,
            ]}
            onPress={handleVerify}
            disabled={!allDigitsEntered}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.verifyButtonText,
                allDigitsEntered ? styles.verifyButtonTextActive : styles.verifyButtonTextDisabled,
              ]}
            >
              Verify
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: 16,
    alignItems: 'center',
  },

  // ── Sticky Verify Button container (always above keyboard) ──
  stickyVerifyContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 8,
    backgroundColor: '#FFFFFF',
  },

  // ── Top Bar ──
  topBar: {
    width: '100%',
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  backButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ── Bell Icon Badge (Figma: 48x48, radius 24, background rgba(245, 246, 250, 0.98)) ──
  bellBadgeContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(245, 246, 250, 0.98)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },

  // ── Header Group (Figma: 358x128, gap 16) ──
  headerGroup: {
    width: '100%',
    maxWidth: 358,
    alignItems: 'center',
    marginBottom: 24,
  },
  titleSubtitleCol: {
    width: '100%',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    width: '100%',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_600SemiBold',
    fontWeight: '600',
    fontSize: 24,
    lineHeight: 32,
    textAlign: 'center',
    letterSpacing: 0.4,
    color: '#141A33',
  },
  subtitle: {
    width: '100%',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  phoneNumber: {
    width: '100%',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
  },

  // ── OTP Inputs Container (Figma: 312x48, gap 40) ──
  otpPinContainer: {
    width: 312,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  otpBox: {
    width: 48,
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  otpBoxFocused: {
    borderColor: 'rgba(0, 8, 20, 0.96)',
    borderWidth: 1.5,
  },
  otpBoxFilled: {
    borderColor: 'rgba(0, 8, 20, 0.96)',
  },
  otpInput: {
    width: '100%',
    height: '100%',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 20,
    lineHeight: 28,
    textAlign: 'center',
    letterSpacing: 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
  },

  // ── Resend Timer Row (Figma: 112x24, gap 8) ──
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 48,
  },
  resendInText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    letterSpacing: 0.3,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  countdownText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    letterSpacing: 0.6,
    color: '#141A33',
  },

  // ── Verify Button (Figma: 358x48, radius 24) ──
  verifyButton: {
    width: '100%',
    maxWidth: 358,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 88,
  },
  verifyButtonActive: {
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    shadowColor: 'rgba(133, 139, 148, 0.08)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 4,
  },
  verifyButtonDisabled: {
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
  },
  verifyButtonText: {
    ...typography.button,
    textTransform: 'capitalize',
  },
  verifyButtonTextActive: {
    color: '#FFFFFF',
  },
  verifyButtonTextDisabled: {
    color: 'rgba(192, 192, 204, 0.96)',
  },

  // ── Didn't get OTP? Row (Figma: 335x20, gap 16) ──
  didntGetOtpRow: {
    width: 335,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(235, 235, 245, 0.96)',
  },
  didntGetOtpText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    letterSpacing: 0.3,
    color: 'rgba(96, 96, 102, 0.96)',
  },

  // ── Resend Button (Figma: 358x48, radius 24, bg rgba(247, 247, 247, 0.96), border rgba(192, 192, 204, 0.96)) ──
  resendButton: {
    width: '100%',
    maxWidth: 358,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resendButtonText: {
    ...typography.button,
    color: 'rgba(0, 8, 20, 0.96)',
  },
});
