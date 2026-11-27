import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  AppState,
  AppStateStatus,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSafeRouter } from '../../utils/safeNavigation';
import Svg, { Path } from 'react-native-svg';
import { useProviderOnboarding } from '../../context/ProviderOnboardingContext';
import { OtpInput, OtpStatus, OTP_LENGTH } from '../../components/OtpInput';
import { NativeDockSpacer } from '../../components/NativeDockSpacer';
import { verifyOtp, requestOtp } from '../../constants/otp.mock';
import { OTP_RESEND_COUNTDOWN_SECONDS } from '../../constants/onboarding.config';
import { trendApi } from '../../api/trendApi';

// Typography matching Golden Rules & Provider Platform Typography Mandate
const FONT_SEMIBOLD = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_600SemiBold';
const FONT_MEDIUM = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium';
const FONT_REGULAR = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular';
const FONT_BUTTON = Platform.OS === 'ios' ? 'Inter' : 'Inter_500Medium';

// ── 1:1 Vector arrow-left-02 Icon ──
function ArrowLeftIcon({ size = 24, color = '#000814' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M19 12H5M11 6l-6 6 6 6"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// ── 1:1 Vector notification-01 Icon ──
function NotificationBellIcon({ size = 24, color = '#000000' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2C8.686 2 6 4.686 6 8v5.293L4.293 15C4.105 15.187 4 15.442 4 15.707V17c0 .552.448 1 1 1h14c.552 0 1-.448 1-1v-1.293c0-.265-.105-.52-.293-.707L18 13.293V8c0-3.314-2.686-6-6-6z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M9 18c0 1.657 1.343 3 3 3s3-1.343 3-3"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </Svg>
  );
}

function formatCountdown(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export const BusinessOtpScreen: React.FC = () => {
  const safeRouter = useSafeRouter();
  const insets = useSafeAreaInsets();
  const { ownerProfile } = useProviderOnboarding();

  // Phone number from onboarding state (fallback to experimentation demo phone)
  const rawPhone = ownerProfile.phone || '813 656 7398';
  const countryCode = ownerProfile.countryCode || '+234';
  const fullPhone = `${countryCode} ${rawPhone}`.trim();

  // OTP state
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<OtpStatus>('default');
  const [errorMessage, setErrorMessage] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // Resend Countdown Timer (computed from target end timestamp)
  const [secondsLeft, setSecondsLeft] = useState(OTP_RESEND_COUNTDOWN_SECONDS);
  const endTimeRef = useRef<number>(Date.now() + OTP_RESEND_COUNTDOWN_SECONDS * 1000);

  const updateRemainingTime = useCallback(() => {
    const diff = Math.ceil((endTimeRef.current - Date.now()) / 1000);
    setSecondsLeft(Math.max(0, diff));
  }, []);

  useEffect(() => {
    const interval = setInterval(updateRemainingTime, 500);

    // Ensure timer stays strictly accurate across backgrounding
    const subscription = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      if (nextState === 'active') {
        updateRemainingTime();
      }
    });

    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, [updateRemainingTime]);

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    // Clear error back to default as soon as user edits any digit
    if (status === 'error') {
      setStatus('default');
      setErrorMessage('');
    }
  };

  const handleVerifyPress = async () => {
    if (code.length === 0 || isVerifying) return;

    setIsVerifying(true);
    setStatus('default');
    setErrorMessage('');

    try {
      const target = fullPhone.replace(/\s+/g, '');
      const apiRes = await trendApi.auth.otpVerify({ target, code });

      if (apiRes.ok) {
        setStatus('success');
        setTimeout(() => {
          safeRouter.replace('/congratulations' as any);
        }, 200);
      } else {
        setStatus('error');
        setErrorMessage(
          apiRes.error || 'Incorrect code, please check the code and try again'
        );
      }
    } catch (e) {
      setStatus('error');
      setErrorMessage('Verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendPress = async () => {
    // Only acts when timer is at 0:00
    if (secondsLeft > 0) return;

    // Reset code and errors
    setCode('');
    setStatus('default');
    setErrorMessage('');

    // Restart timer from 1:05
    endTimeRef.current = Date.now() + OTP_RESEND_COUNTDOWN_SECONDS * 1000;
    setSecondsLeft(OTP_RESEND_COUNTDOWN_SECONDS);

    // Call live OTP send endpoint
    const target = fullPhone.replace(/\s+/g, '');
    const apiRes = await trendApi.auth.otpSend({ target });
    if (!apiRes.ok) {
      await requestOtp(fullPhone);
    }
  };

  const handleBackPress = () => {
    safeRouter.back();
  };

  const isVerifyEnabled = code.length >= 4 && !isVerifying;

  return (
    <View style={styles.screenContainer}>
      <StatusBar style="dark" />

      {/* Top Safe Area Spacing */}
      <View style={{ height: insets.top, backgroundColor: '#FFFFFF' }} />

      {/* Top Header Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.backButton}
          onPress={handleBackPress}
        >
          <ArrowLeftIcon size={24} color="#000814" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.flexOne}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Notification Bell Badge (48x48, radius 24) */}
          <View style={styles.bellBadge}>
            <NotificationBellIcon size={24} color="#000000" />
          </View>

          {/* Header Texts */}
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Number Verification</Text>
            <Text style={styles.subtitle}>
              Verification code sent to the following Phone Number
            </Text>
            {fullPhone ? (
              <Text style={styles.phoneText}>{fullPhone}</Text>
            ) : (
              <Text style={styles.phoneEmptyText}>No phone number provided</Text>
            )}
          </View>

          {/* 4 OTP Digit Boxes */}
          <View style={styles.otpWrapper}>
            <OtpInput
              value={code}
              onChangeText={handleCodeChange}
              status={status}
              autoFocus={true}
              disabled={isVerifying}
            />
          </View>

          {/* Error Message (F3: shifts layout down in normal flow) */}
          {status === 'error' && errorMessage ? (
            <Text style={styles.errorMessage}>{errorMessage}</Text>
          ) : null}

          {/* Resend Timer Row */}
          <View style={styles.resendTimerRow}>
            <Text style={styles.resendLabel}>Resend in</Text>
            <Text style={styles.timerText}>{formatCountdown(secondsLeft)}</Text>
          </View>

          {/* Verify Button (F1 disabled, F2-F4 active) */}
          <TouchableOpacity
            activeOpacity={isVerifyEnabled ? 0.85 : 1}
            disabled={!isVerifyEnabled}
            style={[
              styles.verifyButton,
              isVerifyEnabled ? styles.verifyButtonActive : styles.verifyButtonDisabled,
            ]}
            onPress={handleVerifyPress}
          >
            <Text
              style={[
                styles.verifyText,
                isVerifyEnabled ? styles.verifyTextActive : styles.verifyTextDisabled,
              ]}
            >
              verify
            </Text>
          </TouchableOpacity>

          {/* Divider: Didn't get OTP? */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>Didn't get OTP?</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Resend Button */}
          <TouchableOpacity
            activeOpacity={secondsLeft === 0 ? 0.85 : 1}
            style={styles.resendButton}
            onPress={handleResendPress}
          >
            <Text style={styles.resendText}>resend</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Android System Dock Barrier */}
      <NativeDockSpacer backgroundColor="#FFFFFF" />
    </View>
  );
};

export default BusinessOtpScreen;

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  flexOne: {
    flex: 1,
  },
  topBar: {
    width: '100%',
    height: 48,
    paddingHorizontal: 16,
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 40,
    alignItems: 'center',
  },
  bellBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(245, 246, 250, 0.98)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  headerContainer: {
    width: 358,
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    width: 358,
    fontFamily: FONT_SEMIBOLD,
    fontWeight: '600',
    fontSize: 24,
    lineHeight: 32,
    color: '#141A33',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    width: 358,
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    color: 'rgba(96, 96, 102, 0.96)',
    textAlign: 'center',
    marginBottom: 8,
  },
  phoneText: {
    width: 358,
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    color: 'rgba(96, 96, 102, 0.96)',
    textAlign: 'center',
  },
  phoneEmptyText: {
    width: 358,
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 15,
    lineHeight: 24,
    color: '#CC2929',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  otpWrapper: {
    width: 312,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  errorMessage: {
    width: 317,
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    color: '#CC2929',
    textAlign: 'center',
    marginBottom: 16,
  },
  resendTimerRow: {
    height: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 32,
  },
  resendLabel: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  timerText: {
    fontFamily: FONT_MEDIUM,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    color: '#141A33',
  },
  verifyButton: {
    width: 358,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginBottom: 32,
  },
  verifyButtonDisabled: {
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
  },
  verifyButtonActive: {
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
  },
  verifyText: {
    fontFamily: FONT_BUTTON,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
  },
  verifyTextDisabled: {
    color: 'rgba(192, 192, 204, 0.96)',
  },
  verifyTextActive: {
    color: '#FFFFFF',
  },
  dividerRow: {
    width: 337,
    height: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 24,
  },
  dividerLine: {
    width: 97,
    height: 1,
    backgroundColor: '#EBEBF5',
  },
  dividerText: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  resendButton: {
    width: 358,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderWidth: 1,
    borderColor: '#C0C0CC',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  resendText: {
    fontFamily: FONT_BUTTON,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    color: 'rgba(0, 8, 20, 0.96)',
  },
});
