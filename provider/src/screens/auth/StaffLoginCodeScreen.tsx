import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { OtpInput, OtpStatus } from '../../components/OtpInput';
import { useStaffLoginStore } from '../../context/StaffLoginContext';
import {
  DEV_STAFF_CODE_ALWAYS_FAIL,
  MOCK_CODE_VERIFY_DELAY_MS,
  CODE_SUCCESS_PAUSE_MS,
} from '../../constants/staffLogin.config';

const STAFF_WELCOME_ILLUSTRATION = require('../../../assets/images/staff/staff_welcome_illustration.png');

export function StaffLoginCodeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { setVerifiedCode } = useStaffLoginStore();

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

  const handleSubmit = useCallback(async () => {
    if (code.length < 4 || isVerifying) {
      // With fewer than 4 digits it does nothing (no error designed)
      return;
    }

    setIsVerifying(true);

    // Mock check: TODO (Backend) verify staff login code with backend endpoint
    setTimeout(() => {
      setIsVerifying(false);
      if (DEV_STAFF_CODE_ALWAYS_FAIL) {
        setStatus('error');
      } else {
        setStatus('success');
        setVerifiedCode(code);
        // Short pause on green state (~500ms) per prompt spec before navigating
        setTimeout(() => {
          router.push('/staff-login-form' as any);
        }, CODE_SUCCESS_PAUSE_MS);
      }
    }, MOCK_CODE_VERIFY_DELAY_MS);
  }, [code, isVerifying, setVerifiedCode, router]);

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
              Meet the business owner to get your staff login code.
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
              <Text style={styles.submitButtonText}>Submit</Text>
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
