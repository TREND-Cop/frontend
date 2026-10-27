import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  AppState,
  AppStateStatus,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

import { OtpInput, OtpStatus } from '../../components/OtpInput';
import { LoadingOverlay } from '../../components/LoadingOverlay';
import { NativeDockSpacer } from '../../components/NativeDockSpacer';
import {
  DEV_SAMPLE_EMAIL,
  DEV_HIDE_PHONE,
  DEV_OTP_ALWAYS_FAIL,
  VERIFICATION_OTP_RESEND_COUNTDOWN,
} from '../../constants/passwordVerification.config';

// ── Typography Tokens ──
const FONT_SEMIBOLD = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_600SemiBold';
const FONT_MEDIUM = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium';
const FONT_REGULAR = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular';
const FONT_BUTTON = Platform.OS === 'ios' ? 'Inter' : 'Inter_500Medium';

// ── SVG Icons ──
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

function LockKeyholeIcon({ size = 24 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M7 10V7a5 5 0 0 1 10 0v3"
        stroke="#000000"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Rect
        x="3"
        y="10"
        width="18"
        height="12"
        rx="3"
        stroke="#000000"
        strokeWidth="1.5"
      />
      <Circle cx="12" cy="15" r="1.5" fill="#000000" />
      <Path
        d="M12 16.5V18.5"
        stroke="#000000"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </Svg>
  );
}

function EnvelopeIcon({ size = 24 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6z"
        stroke="#000000"
        strokeWidth="1.5"
      />
      <Path
        d="M3 7l8.2 5.467a1.5 1.5 0 0 0 1.6 0L21 7"
        stroke="#000000"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </Svg>
  );
}

function MailMethodIcon({ size = 24, disabled = false }: { size?: number; disabled?: boolean }) {
  const color = disabled ? '#C0C0CC' : '#141B34';
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 6.5A1.5 1.5 0 0 1 4.5 5h15A1.5 1.5 0 0 1 21 6.5v11a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5v-11z"
        stroke={color}
        strokeWidth="1.5"
      />
      <Path
        d="M3 7l8.2 5.467a1.5 1.5 0 0 0 1.6 0L21 7"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </Svg>
  );
}

function PhoneMethodIcon({ size = 24, disabled = false }: { size?: number; disabled?: boolean }) {
  const color = disabled ? '#C0C0CC' : '#141B34';
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M19 14.5a3 3 0 0 0-3-3H8a3 3 0 0 0-3 3v2a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3v-2z"
        stroke={color}
        strokeWidth="1.5"
      />
      <Path
        d="M5 14.5C5 9.8 8.8 6 13.5 6H15"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <Circle cx="17.5" cy="5" r="2.5" stroke={color} strokeWidth="1.5" />
      <Path d="M9 16h6" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  );
}

function RadioIcon({ selected }: { selected: boolean }) {
  if (selected) {
    return (
      <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
        <Circle cx="12" cy="12" r="10" fill="#000814" />
        <Path
          d="M8 12.2l2.6 2.6L16 9.5"
          stroke="#FFFFFF"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    );
  }
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9.25" stroke="#C0C0CC" strokeWidth="1.5" />
    </Svg>
  );
}

function CircleXIcon({ size = 24 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" fill="#CC2929" stroke="#CC2929" strokeWidth="1.5" />
      <Path
        d="M9 9l6 6M15 9l-6 6"
        stroke="#FFFFFF"
        strokeWidth="1.8"
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

export type VerificationMethod = 'email' | 'phone';

export interface DirectTargetContact {
  type: 'email' | 'phone';
  value: string;
}

export interface AccountVerificationProps {
  email?: string | null;
  phone?: string | null;
  selectSubtitle?: string;
  onVerified?: () => void | Promise<void>;
  onBack?: () => void;
  // Prompt 4 direct contact & skipSelect props
  directTargetContact?: DirectTargetContact;
  skipSelect?: boolean;
  // Optional dev overrides
  devSampleEmail?: string | null;
  devHidePhone?: boolean;
  devOtpAlwaysFail?: boolean;
}

/**
 * Shared Account Verification component/flow:
 * 1. Step 1: Method Select ("Email Verification", "Phone Number Verification")
 * 2. Step 2: 4-digit OTP Verification
 * Designed for reusability across Password Change (Prompt 3) and Phone Number / Gmail Change (Prompt 4).
 */
export const AccountVerificationFlow: React.FC<AccountVerificationProps> = ({
  email: initialEmail,
  phone: initialPhone,
  selectSubtitle,
  onVerified,
  onBack,
  directTargetContact,
  skipSelect = false,
  devSampleEmail = DEV_SAMPLE_EMAIL,
  devHidePhone = DEV_HIDE_PHONE,
  devOtpAlwaysFail = DEV_OTP_ALWAYS_FAIL,
}) => {
  const insets = useSafeAreaInsets();

  // Resolve active contacts taking into account dev-only testing flags
  const activeEmail = devSampleEmail !== null ? devSampleEmail : initialEmail || null;
  const activePhone = devHidePhone ? null : initialPhone || null;

  const hasEmail = Boolean(activeEmail && activeEmail.trim().length > 0);
  const hasPhone = Boolean(activePhone && activePhone.trim().length > 0);

  // Compute availability-derived subtitle if not explicitly passed (Prompt 4 spec)
  const resolvedSubtitle = selectSubtitle ?? (
    hasPhone && !hasEmail
      ? 'Please verify that this account belongs to you, using existing phone number.'
      : hasEmail && !hasPhone
      ? 'Please verify that this account belongs to you, using existing email address.'
      : 'Please verify that this account belongs to you, Select verification method.'
  );

  // Flow step: 'select' | 'otp'
  const [step, setStep] = useState<'select' | 'otp'>(skipSelect ? 'otp' : 'select');
  const [selectedMethod, setSelectedMethod] = useState<VerificationMethod | null>(
    directTargetContact ? directTargetContact.type : null
  );

  // OTP State
  const [otpCode, setOtpCode] = useState('');
  const [otpStatus, setOtpStatus] = useState<OtpStatus>('default');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Resend timer (1:05)
  const [secondsLeft, setSecondsLeft] = useState(VERIFICATION_OTP_RESEND_COUNTDOWN);
  const endTimeRef = useRef<number>(Date.now() + VERIFICATION_OTP_RESEND_COUNTDOWN * 1000);

  const updateRemainingTime = useCallback(() => {
    const diff = Math.ceil((endTimeRef.current - Date.now()) / 1000);
    setSecondsLeft(Math.max(0, diff));
  }, []);

  useEffect(() => {
    if (step !== 'otp') return;

    const interval = setInterval(updateRemainingTime, 500);
    const subscription = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      if (nextState === 'active') {
        updateRemainingTime();
      }
    });

    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, [step, updateRemainingTime]);

  // Method Selection Handlers
  const handleSelectEmail = () => {
    if (!hasEmail) return;
    setSelectedMethod('email');
  };

  const handleSelectPhone = () => {
    if (!hasPhone) return;
    setSelectedMethod('phone');
  };

  const handleConfirmMethod = () => {
    if (!selectedMethod) {
      // "Confirm" without a selection does nothing and shows no error (per spec)
      return;
    }
    // Advance to OTP step and start timer
    endTimeRef.current = Date.now() + VERIFICATION_OTP_RESEND_COUNTDOWN * 1000;
    setSecondsLeft(VERIFICATION_OTP_RESEND_COUNTDOWN);
    setOtpCode('');
    setOtpStatus('default');
    setStep('otp');
  };

  // OTP Input & Verification Handlers
  const handleOtpChange = (newCode: string) => {
    setOtpCode(newCode);
    if (otpStatus === 'error') {
      setOtpStatus('default');
    }
  };

  const handleVerifyOtp = async () => {
    if (otpCode.length !== 4 || isVerifying || isSuccess) return;

    setIsVerifying(true);
    setOtpStatus('default');

    // Short simulated network delay (marked mock)
    await new Promise((resolve) => setTimeout(resolve, 450));

    // TODO (Backend): Mock verification call accepts any 4 digits unless DEV_OTP_ALWAYS_FAIL is active
    if (devOtpAlwaysFail) {
      setOtpStatus('error');
      setIsVerifying(false);
      return;
    }

    // Success State: boxes turn green, show loading dots overlay
    setOtpStatus('success');
    setIsSuccess(true);
    setIsVerifying(false);

    // Call callback after success (per spec: caller finishes at success + dots state)
    if (onVerified) {
      try {
        await onVerified();
      } catch (err) {
        // Safe callback handling
      }
    }
  };

  const handleResendOtp = async () => {
    // Only enabled when timer reaches 0:00 (mirroring onboarding OTP behavior)
    if (secondsLeft > 0) return;

    setOtpCode('');
    setOtpStatus('default');

    // Reset countdown to 1:05
    endTimeRef.current = Date.now() + VERIFICATION_OTP_RESEND_COUNTDOWN * 1000;
    setSecondsLeft(VERIFICATION_OTP_RESEND_COUNTDOWN);

    // TODO (Backend): Mock resend OTP request
  };

  const handleBack = () => {
    if (step === 'otp' && !skipSelect) {
      setStep('select');
      setOtpCode('');
      setOtpStatus('default');
      return;
    }
    if (onBack) {
      onBack();
    }
  };

  // ──────────────────────────────────────────────────────────
  // RENDER STEP 1: Method Selection
  // ──────────────────────────────────────────────────────────
  if (step === 'select') {
    return (
      <View style={styles.screenContainer}>
        <StatusBar style="dark" />
        <View style={{ height: insets.top, backgroundColor: '#FFFFFF' }} />

        {/* Top Header Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.iconBackButton}
            onPress={handleBack}
          >
            <ArrowLeftIcon size={24} color="#000814" />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContentSelect}
          showsVerticalScrollIndicator={false}
        >
          {/* Lock Keyhole Badge (48x48, radius 24, #F8F9FA) */}
          <View style={styles.badgeContainer}>
            <LockKeyholeIcon size={24} />
          </View>

          {/* Title & Subtitle */}
          <View style={styles.selectHeaderTexts}>
            <Text style={styles.headerTitle}>Account Verification</Text>
            <Text style={styles.headerSubtitle}>{resolvedSubtitle}</Text>
          </View>

          {/* Method Cards */}
          <View style={styles.cardsWrapper}>
            {/* Card 1: Email Verification */}
            <TouchableOpacity
              activeOpacity={hasEmail ? 0.8 : 1}
              onPress={handleSelectEmail}
              disabled={!hasEmail}
              style={[
                styles.methodCard,
                !hasEmail ? styles.methodCardDisabled : styles.methodCardBorder,
              ]}
            >
              <View style={styles.methodCardContent}>
                {/* 40x40 circle icon */}
                <View style={styles.methodIconBadge}>
                  <MailMethodIcon size={24} disabled={!hasEmail} />
                </View>

                {/* Texts */}
                <View style={styles.methodTextContainer}>
                  <Text
                    style={[
                      styles.methodTitle,
                      !hasEmail && styles.methodTextDisabled,
                    ]}
                  >
                    Email Verification
                  </Text>
                  <Text
                    style={[
                      styles.methodContact,
                      !hasEmail && styles.methodTextDisabled,
                    ]}
                    numberOfLines={1}
                  >
                    {hasEmail ? activeEmail : 'No email on file'}
                  </Text>
                </View>
              </View>

              {/* Radio Indicator */}
              <View style={styles.radioWrapper}>
                <RadioIcon selected={hasEmail && selectedMethod === 'email'} />
              </View>
            </TouchableOpacity>

            {/* Card 2: Phone Number Verification */}
            <TouchableOpacity
              activeOpacity={hasPhone ? 0.8 : 1}
              onPress={handleSelectPhone}
              disabled={!hasPhone}
              style={[
                styles.methodCard,
                !hasPhone ? styles.methodCardDisabled : styles.methodCardBorder,
              ]}
            >
              <View style={styles.methodCardContent}>
                {/* 40x40 circle icon */}
                <View style={styles.methodIconBadge}>
                  <PhoneMethodIcon size={24} disabled={!hasPhone} />
                </View>

                {/* Texts */}
                <View style={styles.methodTextContainer}>
                  <Text
                    style={[
                      styles.methodTitle,
                      !hasPhone && styles.methodTextDisabled,
                    ]}
                  >
                    Phone Number Verification
                  </Text>
                  <Text
                    style={[
                      styles.methodContact,
                      !hasPhone && styles.methodTextDisabled,
                    ]}
                    numberOfLines={1}
                  >
                    {hasPhone ? activePhone : 'No phone number on file'}
                  </Text>
                </View>
              </View>

              {/* Radio Indicator */}
              <View style={styles.radioWrapper}>
                <RadioIcon selected={hasPhone && selectedMethod === 'phone'} />
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Bottom Sticky Action Button: Confirm */}
        <View style={[styles.bottomButtonContainer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleConfirmMethod}
            style={styles.confirmButton}
          >
            <Text style={styles.confirmButtonText}>Confirm</Text>
          </TouchableOpacity>
        </View>

        <NativeDockSpacer />
      </View>
    );
  }

  // ──────────────────────────────────────────────────────────
  // RENDER STEP 2: OTP Verification
  // ──────────────────────────────────────────────────────────
  const isVerifyEnabled = otpCode.length === 4 && !isVerifying && !isSuccess;
  const isResendActive = secondsLeft === 0;

  const contactString =
    directTargetContact
      ? directTargetContact.value
      : selectedMethod === 'email'
      ? activeEmail || 'Saulgoodman@gmail.com'
      : activePhone || '+234 8019238946';

  const otpSubtitle =
    (directTargetContact?.type || selectedMethod) === 'email'
      ? 'A verification code has been sent to the following Gmail.'
      : 'A verification code has been sent to the following number.';

  return (
    <View style={styles.screenContainer}>
      <StatusBar style="dark" />
      <View style={{ height: insets.top, backgroundColor: '#FFFFFF' }} />

      {/* Top Header Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.iconBackButton}
          onPress={handleBack}
        >
          <ArrowLeftIcon size={24} color="#000814" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContentOtp}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Centered Envelope Badge (48x48, radius 24, #F8F9FA) */}
        <View style={styles.badgeContainer}>
          <EnvelopeIcon size={24} />
        </View>

        {/* Title, Subtitle, Contact in full */}
        <View style={styles.otpHeaderTexts}>
          <Text style={styles.headerTitle}>Account Verification</Text>
          <Text style={styles.headerSubtitle}>{otpSubtitle}</Text>
          <Text style={styles.contactText} numberOfLines={1}>
            {contactString}
          </Text>
        </View>

        {/* 4 OTP Digit Boxes */}
        <View style={styles.otpBoxesWrapper}>
          <OtpInput
            value={otpCode}
            onChangeText={handleOtpChange}
            status={otpStatus}
            disabled={isSuccess || isVerifying}
          />
        </View>

        {/* Resend Countdown Timer */}
        <View style={styles.timerRow}>
          <Text style={styles.resendInText}>Resend in</Text>
          <Text style={styles.timerDigitsText}>{formatCountdown(secondsLeft)}</Text>
        </View>

        {/* Verify Action Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          disabled={!isVerifyEnabled}
          onPress={handleVerifyOtp}
          style={[
            styles.verifyButton,
            isVerifyEnabled ? styles.verifyButtonEnabled : styles.verifyButtonDisabled,
          ]}
        >
          <Text
            style={[
              styles.verifyButtonText,
              isVerifyEnabled ? styles.verifyButtonTextEnabled : styles.verifyButtonTextDisabled,
            ]}
          >
            verify
          </Text>
        </TouchableOpacity>

        {/* Didn't get OTP? Divider */}
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>Didn't get OTP?</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Resend Button Container with Floating Error Pill */}
        <View style={styles.resendAreaContainer}>
          <TouchableOpacity
            activeOpacity={0.8}
            disabled={!isResendActive}
            onPress={handleResendOtp}
            style={[
              styles.resendButton,
              !isResendActive && styles.resendButtonInactive,
            ]}
          >
            <Text
              style={[
                styles.resendButtonText,
                !isResendActive && styles.resendButtonTextInactive,
              ]}
            >
              resend
            </Text>
          </TouchableOpacity>

          {/* Error Pill shown over the resend area per Figma spec */}
          {otpStatus === 'error' && (
            <View style={styles.errorPill}>
              <CircleXIcon size={24} />
              <Text style={styles.errorPillText}>Incorrect OTP</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Dimmed Loading Overlay with 4 dots on Success */}
      <LoadingOverlay
        visible={isSuccess}
        dotsCount={4}
        dotSize={10}
        dotGap={12}
        paddingTop={429}
        overlayOpacity={0.1}
      />

      <NativeDockSpacer />
    </View>
  );
};

export default AccountVerificationFlow;

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topBar: {
    height: 48,
    paddingHorizontal: 16,
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  iconBackButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContentSelect: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 40,
  },
  scrollContentOtp: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 60,
  },
  badgeContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(248, 249, 250, 0.98)',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  selectHeaderTexts: {
    width: '100%',
    marginTop: 23,
    alignItems: 'flex-start',
  },
  otpHeaderTexts: {
    width: '100%',
    marginTop: 24,
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontFamily: FONT_SEMIBOLD,
    fontWeight: '600',
    fontSize: 24,
    lineHeight: 32,
    color: '#141A33',
  },
  headerSubtitle: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    color: 'rgba(96, 96, 102, 0.96)',
    marginTop: 8,
  },
  contactText: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    color: 'rgba(96, 96, 102, 0.96)',
    marginTop: 16,
  },
  cardsWrapper: {
    width: '100%',
    marginTop: 40,
    gap: 16,
  },
  methodCard: {
    width: '100%',
    height: 88,
    borderRadius: 24,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
  },
  methodCardBorder: {
    borderWidth: 1,
    borderColor: '#C0C0CC',
  },
  methodCardDisabled: {
    borderWidth: 1,
    borderColor: '#EBEBF5',
  },
  methodCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 16,
  },
  methodIconBadge: {
    width: 40,
    height: 40,
    borderRadius: 24,
    backgroundColor: 'rgba(248, 249, 250, 0.98)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  methodTitle: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    color: '#000000',
  },
  methodContact: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    color: 'rgba(96, 96, 102, 0.96)',
    marginTop: 4,
  },
  methodTextDisabled: {
    color: 'rgba(192, 192, 204, 0.96)',
  },
  radioWrapper: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  bottomButtonContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    backgroundColor: '#FFFFFF',
  },
  confirmButton: {
    width: '100%',
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonText: {
    fontFamily: FONT_BUTTON,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    color: '#FFFFFF',
  },
  otpBoxesWrapper: {
    marginTop: 40,
    alignItems: 'center',
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 24,
    height: 24,
  },
  resendInText: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  timerDigitsText: {
    fontFamily: FONT_MEDIUM,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    color: '#141A33',
  },
  verifyButton: {
    width: '100%',
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 80,
  },
  verifyButtonDisabled: {
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
  },
  verifyButtonEnabled: {
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
  },
  verifyButtonText: {
    fontFamily: FONT_BUTTON,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
  },
  verifyButtonTextDisabled: {
    color: 'rgba(192, 192, 204, 0.96)',
  },
  verifyButtonTextEnabled: {
    color: '#FFFFFF',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 95,
    gap: 16,
  },
  dividerLine: {
    flex: 1,
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
  resendAreaContainer: {
    width: '100%',
    marginTop: 24,
    alignItems: 'center',
    position: 'relative',
  },
  resendButton: {
    width: '100%',
    height: 44,
    borderRadius: 24,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderWidth: 1,
    borderColor: '#C0C0CC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resendButtonInactive: {
    opacity: 0.6,
  },
  resendButtonText: {
    fontFamily: FONT_BUTTON,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  resendButtonTextInactive: {
    color: 'rgba(192, 192, 204, 0.96)',
  },
  errorPill: {
    position: 'absolute',
    top: 0,
    width: 224,
    height: 44,
    borderRadius: 24,
    backgroundColor: '#F8EFEF',
    borderWidth: 1,
    borderColor: '#CC2929',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 16,
  },
  errorPillText: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    color: '#CC2929',
  },
});
