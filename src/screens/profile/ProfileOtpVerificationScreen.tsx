import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Easing,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, MessageSquare, Mail, AlertCircle } from 'lucide-react-native';
import Svg, { Path } from 'react-native-svg';
import { useRouter, useLocalSearchParams } from 'expo-router';

// ── Star Loading Indicator (Figma: Star 3, 72x72px) ──
const StarLoadingIcon = ({ size = 72, color = 'rgba(0, 8, 20, 0.96)' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 72 72" fill="none">
    <Path
      d="M36 6L44.5 25.5L66 27.5L50 42L54.5 63.5L36 53L17.5 63.5L22 42L6 27.5L27.5 25.5L36 6Z"
      fill={color}
    />
  </Svg>
);

const OTP_LENGTH = 4;
const RESEND_COUNTDOWN_SECONDS = 65;

import { useUserContext } from '../../store/UserContext';
import { toastStore } from '../../utils/toastStore';

const formatCountdown = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const ProfileOtpVerificationScreen: React.FC = () => {
  const router = useRouter();
  const { updateProfile } = useUserContext();
  const params = useLocalSearchParams<{
    method?: string;
    type?: string;
    target?: string;
    targetPhone?: string;
    targetEmail?: string;
  }>();
  const targetParam = params?.target;
  const isEmail =
    params?.method === 'email' ||
    params?.type === 'email' ||
    (targetParam ? targetParam.includes('@') : true);
  const target = targetParam || (isEmail ? 'Saulgoodman@gmail.com' : '+234 8019238946');

  // OTP state
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const inputRefs = useRef<(TextInput | null)[]>(Array(OTP_LENGTH).fill(null));

  // Countdown timer state
  const [countdown, setCountdown] = useState(RESEND_COUNTDOWN_SECONDS);
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  // States: 'typing' | 'error' | 'correct'
  const [status, setStatus] = useState<'typing' | 'error' | 'correct'>('typing');
  const [isVerifying, setIsVerifying] = useState(false);

  // Spinner animation
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const allDigitsEntered = otp.every((digit) => digit.length === 1);

  // Timer effect
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

  // Star spinner animation
  useEffect(() => {
    if (isVerifying) {
      rotateAnim.setValue(0);
      const loop = Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      loop.start();
      return () => loop.stop();
    }
  }, [isVerifying]);

  const handleOtpChange = useCallback(
    (text: string, index: number) => {
      const digit = text.replace(/[^0-9]/g, '');
      const newOtp = [...otp];
      newOtp[index] = digit.slice(-1);
      setOtp(newOtp);
      setStatus('typing');

      if (digit.length > 0 && index < OTP_LENGTH - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    },
    [otp]
  );

  const handleKeyPress = useCallback(
    (e: any, index: number) => {
      if (e.nativeEvent.key === 'Backspace' && otp[index] === '' && index > 0) {
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
      }
    },
    [otp]
  );

  const handleVerify = useCallback(async () => {
    if (!allDigitsEntered) return;
    const code = otp.join('');

    if (code === '0000') {
      setStatus('error');
      return;
    }

    setStatus('correct');
    setIsVerifying(true);

    setTimeout(() => {
      setIsVerifying(false);
      // Persist verified phone or email to user profile
      if (params?.type === 'phone' && params?.targetPhone) {
        updateProfile({ phone: params.targetPhone });
      } else if (params?.type === 'email' && params?.targetEmail) {
        updateProfile({ email: params.targetEmail });
      } else if (params?.target) {
        if (params.target.includes('@')) {
          updateProfile({ email: params.target });
        } else if (params.target.includes('+') || /\d{8,}/.test(params.target)) {
          updateProfile({ phone: params.target });
        }
      }
      // Show top popup notification matching action
      if (params?.type === 'password') {
        toastStore.showToast({
          message: 'Password reset successfully',
          type: 'success',
        });
      } else if (params?.type === 'phone' || params?.targetPhone) {
        toastStore.showToast({
          message: 'Phone number updated successfully',
          type: 'success',
        });
      } else if (params?.type === 'email' || params?.targetEmail) {
        toastStore.showToast({
          message: 'Google account updated successfully',
          type: 'success',
        });
      } else {
        toastStore.showToast({
          message: 'Profile updated successfully',
          type: 'success',
        });
      }

      // In-app profile flow returns cleanly to profile screen
      router.replace('/profile' as any);
    }, 1500);
  }, [allDigitsEntered, otp, router, params, updateProfile]);

  const handleResend = useCallback(() => {
    if (isTimerRunning) return;
    setCountdown(RESEND_COUNTDOWN_SECONDS);
    setIsTimerRunning(true);
    setOtp(Array(OTP_LENGTH).fill(''));
    setStatus('typing');
  }, [isTimerRunning]);

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/profile' as any);
    }
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'android' ? 0 : 0}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Top Bar ── */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.headerBackButton}
              onPress={handleGoBack}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <ArrowLeft size={24} color="rgba(0, 8, 20, 0.96)" />
            </TouchableOpacity>
          </View>

          {/* ── Content ── */}
          <View style={{ width: '100%', alignItems: 'center' }}>
            {/* Centered Message/Mail Icon Box */}
            <View style={styles.iconBox}>
              {isEmail ? (
                <Mail size={24} color="#000000" />
              ) : (
                <MessageSquare size={24} color="#000000" />
              )}
            </View>

          {/* Title & Subtitle Header */}
          <View style={styles.headerTextBlock}>
            <Text style={styles.title}>Account Verification</Text>
            <Text style={styles.subtitle}>
              {isEmail
                ? 'A verification code has been sent to the following gmail.'
                : 'A verification code has been sent to the following number.'}
            </Text>
            <Text style={styles.targetText}>{target}</Text>
          </View>

          {/* 4 OTP Digit Input Boxes */}
          <View style={styles.otpContainer}>
            {Array.from({ length: OTP_LENGTH }).map((_, index) => {
              const isError = status === 'error';
              const isCorrect = status === 'correct';

              return (
                <View
                  key={index}
                  style={[
                    styles.otpBox,
                    isError
                      ? styles.otpBoxError
                      : isCorrect
                      ? styles.otpBoxCorrect
                      : otp[index].length > 0
                      ? styles.otpBoxFilled
                      : styles.otpBoxNormal,
                  ]}
                >
                  <TextInput
                    ref={(ref) => {
                      inputRefs.current[index] = ref;
                    }}
                    style={[
                      styles.otpInput,
                      isError
                        ? styles.otpInputError
                        : isCorrect
                        ? styles.otpInputCorrect
                        : styles.otpInputNormal,
                    ]}
                    value={otp[index]}
                    onChangeText={(text) => handleOtpChange(text, index)}
                    onKeyPress={(e) => handleKeyPress(e, index)}
                    keyboardType="number-pad"
                    maxLength={1}
                    textAlign="center"
                    selectTextOnFocus
                  />
                </View>
              );
            })}
          </View>

          {/* Resend Timer */}
          <View style={styles.resendTimerContainer}>
            <Text style={styles.resendTimerLabel}>Resend in</Text>
            <Text style={styles.resendTimerValue}>
              {isTimerRunning ? formatCountdown(countdown) : '0:00'}
            </Text>
          </View>

          {/* Verify Action Button */}
          <TouchableOpacity
            style={[
              styles.verifyButton,
              allDigitsEntered
                ? styles.verifyButtonActive
                : styles.verifyButtonDisabled,
            ]}
            activeOpacity={allDigitsEntered ? 0.8 : 1}
            disabled={!allDigitsEntered}
            onPress={handleVerify}
          >
            <Text
              style={[
                styles.verifyButtonText,
                allDigitsEntered
                  ? styles.verifyButtonTextActive
                  : styles.verifyButtonTextDisabled,
              ]}
            >
              Verify
            </Text>
          </TouchableOpacity>

          {/* Spacer to push didn't get OTP to bottom */}
          <View style={styles.flexSpacer} />

          {/* Floating Error Toast if status === 'error' */}
          {status === 'error' && (
            <View style={styles.errorToast}>
              <AlertCircle size={16} color="rgba(204, 41, 41, 0.9)" />
              <Text style={styles.errorToastText}>Incorrect Password</Text>
            </View>
          )}

          {/* Didn't Get OTP Divider Line */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>Didn't get OTP?</Text>
            <View style={styles.dividerLine} />
          </View>

            {/* Resend Button Outline */}
            <TouchableOpacity
              style={styles.resendButton}
              onPress={handleResend}
              disabled={isTimerRunning}
              activeOpacity={0.7}
            >
              <Text style={styles.resendButtonText}>Resend</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Fullscreen Star Loader Overlay during verification */}
        {isVerifying && (
          <View style={styles.loaderOverlay}>
            <Animated.View
              style={[
                styles.loaderContainer,
                { transform: [{ rotate: spin }] },
              ]}
            >
              <StarLoadingIcon size={72} color="rgba(0, 8, 20, 0.96)" />
            </Animated.View>
          </View>
        )}
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

  // ── Header ──
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  headerBackButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Content ──
  content: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 24 : 36,
    alignItems: 'center',
  },

  // ── Icon Container (Figma: 48x48, background rgba(248, 249, 250, 0.98), borderRadius 24px) ──
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(248, 249, 250, 0.98)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },

  // ── Header Text Block (Figma: gap 8px) ──
  headerTextBlock: {
    width: '100%',
    alignItems: 'center',
    gap: 8,
    marginBottom: 40,
  },
  title: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_600SemiBold',
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 32,
    letterSpacing: 0.4,
    color: '#141A33',
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  targetText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    textAlign: 'center',
  },

  // ── 4 OTP Boxes (responsive width) ──
  otpContainer: {
    width: '100%',
    maxWidth: 326,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  otpBox: {
    width: 48,
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  otpBoxNormal: {
    borderColor: 'rgba(192, 192, 204, 0.96)',
  },
  otpBoxFilled: {
    borderColor: 'rgba(0, 8, 20, 0.96)',
  },
  otpBoxError: {
    borderColor: 'rgba(204, 41, 41, 0.9)',
  },
  otpBoxCorrect: {
    borderColor: 'rgba(12, 121, 12, 0.96)',
  },
  otpInput: {
    width: '100%',
    height: '100%',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontSize: 20,
    fontWeight: '500',
    lineHeight: 28,
    letterSpacing: 0.2,
    textAlign: 'center',
    padding: 0,
  },
  otpInputNormal: {
    color: 'rgba(0, 8, 20, 0.96)',
  },
  otpInputError: {
    color: 'rgba(204, 41, 41, 0.9)',
  },
  otpInputCorrect: {
    color: 'rgba(12, 121, 12, 0.96)',
  },

  // ── Resend Timer (Figma: width 112px, height 24px, gap 8px) ──
  resendTimerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 48,
  },
  resendTimerLabel: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    letterSpacing: 0.3,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  resendTimerValue: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
    letterSpacing: 0.6,
    color: '#141A33',
  },

  // ── Verify Button (Figma: height 48px, width 358px, borderRadius 24px) ──
  verifyButton: {
    width: '100%',
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifyButtonActive: {
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    shadowColor: 'rgba(133, 139, 148, 0.08)',
    shadowOffset: { width: 8, height: 16 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 4,
  },
  verifyButtonDisabled: {
    backgroundColor: 'rgba(248, 249, 250, 0.98)',
  },
  verifyButtonText: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter_500Medium',
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
    letterSpacing: 0.15,
    textTransform: 'capitalize',
  },
  verifyButtonTextActive: {
    color: '#FFFFFF',
  },
  verifyButtonTextDisabled: {
    color: 'rgba(192, 192, 204, 0.96)',
  },

  flexSpacer: {
    flex: 1,
    minHeight: 24,
  },

  // ── Error Toast ──
  errorToast: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDEDED',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
    marginBottom: 16,
  },
  errorToastText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(204, 41, 41, 0.9)',
  },

  // ── Didn't Get OTP Divider (responsive width) ──
  dividerRow: {
    width: '100%',
    maxWidth: 358,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(235, 235, 245, 0.96)',
  },
  dividerText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    letterSpacing: 0.3,
    color: 'rgba(96, 96, 102, 0.96)',
    textAlign: 'center',
  },

  // ── Resend Button (Figma: height 44px, background rgba(247, 247, 247, 0.96), border 1px solid rgba(192, 192, 204, 0.96)) ──
  resendButton: {
    width: '100%',
    height: 44,
    borderRadius: 24,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resendButtonText: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter_500Medium',
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
    letterSpacing: 0.15,
    color: 'rgba(0, 8, 20, 0.96)',
    textTransform: 'capitalize',
  },

  // ── Fullscreen Star Loader Overlay (Figma Spec) ──
  loaderOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(65, 63, 63, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  loaderContainer: {
    width: 72,
    height: 72,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
