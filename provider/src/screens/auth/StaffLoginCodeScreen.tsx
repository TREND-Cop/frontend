import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Platform,
  KeyboardAvoidingView,
  BackHandler,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { isUnifiedPartnerRouting, useSafeRouter } from '../../utils/safeNavigation';
import { OtpInput, OtpStatus } from '../../components/OtpInput';
import { useStaffLoginStore } from '../../context/StaffLoginContext';
import {
  DEV_STAFF_CODE_ALWAYS_FAIL,
  MOCK_CODE_VERIFY_DELAY_MS,
  CODE_SUCCESS_PAUSE_MS,
} from '../../constants/staffLogin.config';
import { trendApi } from '../../api/trendApi';

const STAFF_WELCOME_ILLUSTRATION = require('../../../assets/images/staff/staff_welcome_illustration.png');

export function StaffLoginCodeScreen() {
  const insets = useSafeAreaInsets();
  const safeRouter = useSafeRouter();
  const { setVerifiedCode } = useStaffLoginStore();

  const isWebLanding = Platform.OS === 'web' || isUnifiedPartnerRouting();

  // Hardware back press returns to Role Selection on unified web landing, or Partner root on native
  useEffect(() => {
    const onBackPress = () => {
      if (isUnifiedPartnerRouting()) {
        safeRouter.exitToUnifiedRoot();
      } else {
        safeRouter.replace({ pathname: '/', params: { tab: 'login' } } as any);
      }
      return true;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, [safeRouter]);

  const [code, setCode] = useState('');
  const [status, setStatus] = useState<OtpStatus>('default');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleCodeChange = useCallback((text: string) => {
    setCode(text);
    // Editing clears any existing error state
    if (status === 'error') {
      setStatus('default');
    }
  }, [status]);

  const isSubmittingRef = useRef(false);

  const handleSubmit = useCallback(async () => {
    if (code.length < 4 || isVerifying || isSubmittingRef.current) {
      // With fewer than 4 digits it does nothing (no error designed)
      return;
    }

    isSubmittingRef.current = true;
    setIsVerifying(true);

    if (DEV_STAFF_CODE_ALWAYS_FAIL) {
      setTimeout(() => {
        setIsVerifying(false);
        setStatus('error');
        isSubmittingRef.current = false;
      }, MOCK_CODE_VERIFY_DELAY_MS);
      return;
    }

    const res = await trendApi.auth.staffLogin({ code: code.trim() });
    setIsVerifying(false);

    if (!res.ok) {
      setStatus('error');
      isSubmittingRef.current = false;
      return;
    }

    setStatus('success');
    setVerifiedCode(code.trim());
    // Short pause on green state (~500ms) per prompt spec before navigating
    setTimeout(() => {
      isSubmittingRef.current = false;
      safeRouter.push('/staff-login-form' as any);
    }, CODE_SUCCESS_PAUSE_MS);
  }, [code, isVerifying, setVerifiedCode, safeRouter]);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <StatusBar style="dark" />

        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(insets.bottom, 24) + 16 },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Illustration & Welcome Banner (Frame 1000006405) ── */}
          <View style={styles.bannerContainer}>
            <Image
              source={STAFF_WELCOME_ILLUSTRATION}
              style={styles.illustration}
              resizeMode="contain"
            />
            <Text style={styles.welcomeStaffText}>Welcome to Trend for Staff</Text>
          </View>

          {/* ── Title & Subtitle ── */}
          <View style={styles.titleGroup}>
            <Text style={styles.screenTitle}>Staff Login Code</Text>
            <Text style={styles.screenSubtitle}>
              {isWebLanding
                ? 'Meet the business owner to get staff login code'
                : 'Meet the business owner to get your staff login code.'}
            </Text>
          </View>

          {/* ── 4 Code Boxes & Error State ── */}
          <View style={styles.codeContainer}>
            <OtpInput
              value={code}
              onChangeText={handleCodeChange}
              status={status}
              autoFocus={true}
              keepTextColorOnStatus={true}
              boxBorderColor={
                status === 'default' ? 'rgba(96, 96, 102, 0.96)' : undefined
              }
            />

            {/* Error Message: Left-aligned with first digit box */}
            {status === 'error' && (
              <View style={styles.errorMessageWrapper}>
                <Text style={styles.errorText}>Incorrect input code</Text>
              </View>
            )}
          </View>

          {/* ── Submit Action Button ── */}
          <View style={styles.buttonWrapper}>
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
              activeOpacity={0.85}
              disabled={isVerifying}
            >
              <Text style={styles.submitButtonText}>{isWebLanding ? 'Login' : 'Submit'}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

// ── 1:1 Figma Converted Styles ───────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 420 : undefined,
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
  },

  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    alignItems: 'center',
  },

  // ── Banner (Frame 1000006405: width 214, height 181, gap 16) ──
  bannerContainer: {
    width: 214,
    alignItems: 'center',
    gap: 16,
    marginTop: 28,
    marginBottom: 36,
  },
  illustration: {
    width: 195,
    height: 141,
  },
  welcomeStaffText: {
    width: 214,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: '#000000',
    textAlign: 'center',
    includeFontPadding: false,
  },

  // ── Title & Subtitle ──
  titleGroup: {
    alignItems: 'center',
    gap: 12,
    marginBottom: 32,
    width: '100%',
    maxWidth: 338,
  },
  screenTitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
    textAlign: 'center',
    includeFontPadding: false,
  },
  screenSubtitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    textAlign: 'center',
    includeFontPadding: false,
  },

  // ── Code Input & Error Row ──
  codeContainer: {
    width: 312,
    alignSelf: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  errorMessageWrapper: {
    width: 312,
    paddingTop: 16,
    alignItems: 'flex-start',
  },
  errorText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(204, 41, 41, 0.9)',
    includeFontPadding: false,
  },

  // ── Action Button (Filled action Button: 358x48, radius 24) ──
  buttonWrapper: {
    width: '100%',
    maxWidth: 358,
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: 48,
  },
  submitButton: {
    width: '100%',
    maxWidth: 358,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(133, 139, 148, 0.08)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  submitButtonText: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
    color: '#FFFFFF',
    includeFontPadding: false,
  },
});
