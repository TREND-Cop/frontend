/**
 * PhoneVerificationScreen — 4-digit OTP verification after signup.
 *
 * Flow: SignUpScreen → PhoneVerificationScreen → UserLocationScreen
 *
 * Features:
 * - 4 separate OTP input boxes with auto-advance focus
 * - Countdown timer (65 seconds) for resend cooldown
 * - Resend button that resets the timer and stubs a resendCode() call
 * - Verify button enabled only when all 4 digits are entered
 * - Navigates to UserLocationScreen on successful verification
 *
 * Uses shared components: PrimaryButton
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
} from 'react-native';
import { colors, typography, radius, spacing } from '../../constants/theme';
import { PrimaryButton } from '../../components/PrimaryButton';

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

/** Number of OTP digits */
const OTP_LENGTH = 4;

/** Countdown timer duration in seconds */
const RESEND_COUNTDOWN_SECONDS = 65;

// ─────────────────────────────────────────────────────────────────────────────
// STUB FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Verifies the OTP code entered by the user.
 * 
 * TODO (Backend):
 * 1. POST request to `/api/auth/verify-otp`
 *    Payload: { "phone": _phone, "code": _code }
 * 2. On Success (200 OK):
 *    - Return `true` to proceed to the next onboarding/home screen.
 * 3. On Error (400 Bad Request - Invalid OTP):
 *    - Return `false` so the UI can show an "Incorrect code" error message.
 *
 * @param _code - The 4-digit OTP code entered by the user
 * @returns true if verification succeeds, false otherwise
 */
const verifyCode = async (_code: string): Promise<boolean> => {
  console.log('verifyCode called — wire up your API here');
  return true; // Mock: always succeeds
};

/**
 * Resends the verification code to the user's phone.
 * 
 * TODO (Backend):
 * 1. POST request to `/api/auth/resend-otp`
 *    Payload: { "phone": _phone }
 * 2. Ensure backend has rate-limiting to prevent abuse.
 * 3. Returns void on success. Throw or alert on failure.
 */
const resendCode = async (_phone: string): Promise<void> => {
  console.log('resendCode called — wire up your API here');
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPER: Format seconds into "M:SS" display
// ─────────────────────────────────────────────────────────────────────────────

const formatCountdown = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export const PhoneVerificationScreen = ({
  navigation,
  route,
}: {
  navigation?: any;
  route?: any;
}) => {
  // ── Route Params ────────────────────────────────────────────────────────
  // Phone passed from SignUpScreen (stub fallback for development)
  const phone = route?.params?.phone ?? '+1 234 567 8900';

  // ── OTP State ───────────────────────────────────────────────────────────
  // Each digit is stored as a separate string in the array
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));

  // Refs for each OTP input box (used to auto-advance focus)
  const inputRefs = useRef<(TextInput | null)[]>(Array(OTP_LENGTH).fill(null));

  // ── Countdown Timer State ───────────────────────────────────────────────
  const [countdown, setCountdown] = useState(RESEND_COUNTDOWN_SECONDS);
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  // Derived: all 4 digits entered = verify button can be enabled
  const allDigitsEntered = otp.every((digit) => digit.length === 1);

  // ── Countdown Timer Effect ──────────────────────────────────────────────

  useEffect(() => {
    // Don't run if timer isn't active
    if (!isTimerRunning) return;

    // Clear interval if countdown reaches 0
    if (countdown <= 0) {
      setIsTimerRunning(false);
      return;
    }

    // Tick down every second
    const interval = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    // Cleanup on unmount or when dependencies change
    return () => clearInterval(interval);
  }, [countdown, isTimerRunning]);

  // ── Handlers ────────────────────────────────────────────────────────────

  /**
   * Handles text changes in individual OTP boxes.
   * Auto-advances focus to the next box when a digit is entered.
   * Handles backspace to move focus to the previous box.
   */
  const handleOtpChange = useCallback(
    (text: string, index: number) => {
      // Only allow numeric input
      const digit = text.replace(/[^0-9]/g, '');

      // Update the OTP array
      const newOtp = [...otp];
      newOtp[index] = digit.slice(-1); // Take only the last digit
      setOtp(newOtp);

      // Auto-advance to next box if digit was entered
      if (digit.length > 0 && index < OTP_LENGTH - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    },
    [otp]
  );

  /**
   * Handles backspace key press to move focus to the previous box.
   */
  const handleKeyPress = useCallback(
    (e: any, index: number) => {
      if (e.nativeEvent.key === 'Backspace' && otp[index] === '' && index > 0) {
        // Move focus to previous box and clear its value
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
      }
    },
    [otp]
  );

  /**
   * Handles the "Verify" button press.
   * Calls the stubbed verifyCode function and navigates on success.
   */
  const handleVerify = useCallback(async () => {
    if (!allDigitsEntered) return;

    const code = otp.join('');
    const success = await verifyCode(code);

    if (success) {
      if (navigation) {
        navigation.navigate('UserLocation');
      }
    } else {
      // TODO: Show an error to the user (e.g. "Invalid code, please try again")
      console.log('Verification failed');
    }
  }, [allDigitsEntered, otp, navigation]);

  /**
   * Handles the "Resend" button press.
   * Resets the countdown timer and calls the stubbed resendCode function.
   */
  const handleResend = useCallback(async () => {
    if (isTimerRunning) return; // Can't resend while timer is running

    // Reset timer
    setCountdown(RESEND_COUNTDOWN_SECONDS);
    setIsTimerRunning(true);

    // Clear OTP boxes
    setOtp(Array(OTP_LENGTH).fill(''));

    // Stub API call
    await resendCode(phone);
    console.log('Resend code to:', phone);
  }, [isTimerRunning, phone]);

  /**
   * Back button handler — returns to the previous screen.
   */
  const handleGoBack = () => {
    if (navigation) {
      navigation.goBack();
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.container}>
        {/* ─── Header with Back Arrow ───────────────────────────────── */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
        </View>

        {/* ─── Centered Envelope Icon ────────────────────────────────── */}
        <View style={styles.iconContainer}>
          <Text style={styles.envelopeIcon}>📱</Text>
        </View>

        {/* ─── Title & Subtitle ──────────────────────────────────────── */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Phone verification</Text>
          <Text style={styles.subtitle}>
            Verification code sent to the following phone number:
          </Text>
          <Text style={styles.emailText}>{phone}</Text>
        </View>

        {/* ─── OTP Input Boxes ───────────────────────────────────────── */}
        <View style={styles.otpContainer}>
          {Array.from({ length: OTP_LENGTH }).map((_, index) => (
            <TextInput
              key={index}
              ref={(ref) => {
                inputRefs.current[index] = ref;
              }}
              style={[
                styles.otpBox,
                otp[index].length > 0 && styles.otpBoxFilled,
              ]}
              value={otp[index]}
              onChangeText={(text) => handleOtpChange(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              textAlign="center"
              selectTextOnFocus
            />
          ))}
        </View>

        {/* ─── Countdown Timer ───────────────────────────────────────── */}
        <View style={styles.timerContainer}>
          {isTimerRunning ? (
            <Text style={styles.timerText}>
              Resend in {formatCountdown(countdown)}
            </Text>
          ) : (
            <TouchableOpacity onPress={handleResend}>
              <Text style={styles.resendActiveText}>Resend</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ─── Verify Button ─────────────────────────────────────────── */}
        <PrimaryButton
          title="Verify"
          onPress={handleVerify}
          disabled={!allDigitsEntered}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: colors.appBackground,
    paddingHorizontal: spacing.buttonPadding,
    paddingTop: 60,
    paddingBottom: 40,
  },

  // ── Header Row (Back Arrow) ─────────────────────────────────────────────
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  backArrow: {
    fontSize: 24,
    color: '#000000',
  },

  // ── Centered Envelope Icon ──────────────────────────────────────────────
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  envelopeIcon: {
    fontSize: 48,
  },

  // ── Title & Subtitle ───────────────────────────────────────────────────
  titleContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    ...typography.h1,
    color: '#000000',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.bodyRegular,
    color: colors.primarySupportText,
    textAlign: 'center',
    marginBottom: 8,
  },
  emailText: {
    ...typography.bodyMed, // Bold/emphasized email
    color: '#000000',
    textAlign: 'center',
  },

  // ── OTP Input Boxes ────────────────────────────────────────────────────
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 24,
  },
  otpBox: {
    width: 48,
    height: 48,
    borderWidth: 1,
    borderColor: colors.outlineBorders,
    borderRadius: 8,
    ...typography.h1,
    color: '#000000',
    textAlign: 'center',
    textAlignVertical: 'center', // Android vertical centering
    // @ts-ignore: web-only outline style
    outlineStyle: 'none',
  },
  otpBoxFilled: {
    borderColor: colors.primary, // Highlight filled boxes
  },

  // ── Countdown Timer ─────────────────────────────────────────────────────
  timerContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  timerText: {
    ...typography.bodyRegular,
    color: colors.primarySupportText,
  },
  resendActiveText: {
    ...typography.bodyMed,
    color: colors.primary,
  },
});
