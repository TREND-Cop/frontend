import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { SimpleArrowLeftIcon } from '../../components/messages/MessageIcons';
import { LoadingOverlay } from '../../components/LoadingOverlay';
import { useStaffLoginStore } from '../../context/StaffLoginContext';
import {
  DEV_STAFF_REJECT_NAME,
  DEV_STAFF_REJECT_BUSINESS,
  MOCK_LOGIN_CHECK_DELAY_MS,
} from '../../constants/staffLogin.config';

export function StaffLoginFormScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { setStaffDetails, clearStaffLogin } = useStaffLoginStore();

  const [fullName, setFullName] = useState('');
  const [businessName, setBusinessName] = useState('');

  const [nameError, setNameError] = useState<string | null>(null);
  const [businessError, setBusinessError] = useState<string | null>(null);

  const [isValid, setIsValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const businessInputRef = useRef<TextInput>(null);

  const handleBack = useCallback(() => {
    // Clear the entered code on back so the staff member must enter it again per spec
    clearStaffLogin();
    router.back();
  }, [clearStaffLogin, router]);

  const handleNameChange = useCallback((text: string) => {
    setFullName(text);
    if (nameError) setNameError(null);
    if (isValid) setIsValid(false);
  }, [nameError, isValid]);

  const handleBusinessChange = useCallback((text: string) => {
    setBusinessName(text);
    if (businessError) setBusinessError(null);
    if (isValid) setIsValid(false);
  }, [businessError, isValid]);

  const handleLoginPress = useCallback(async () => {
    const trimmedName = fullName.trim();
    const trimmedBusiness = businessName.trim();

    // With either field empty, does nothing and shows no error per design
    if (!trimmedName || !trimmedBusiness || isLoading) {
      return;
    }

    // Mock check: TODO (Backend) verify credentials with backend staff login endpoint
    setTimeout(() => {
      let hasError = false;

      if (DEV_STAFF_REJECT_NAME) {
        setNameError('Incorrect name input');
        hasError = true;
      }

      if (DEV_STAFF_REJECT_BUSINESS) {
        setNameError((prev) => prev); // keep previous
        setBusinessError('Incorrect business name input');
        hasError = true;
      }

      if (!hasError) {
        // Both fields valid -> turn green, show dimmed 4-dot loader, then navigate to success
        setIsValid(true);
        setStaffDetails(trimmedName, trimmedBusiness);
        setIsLoading(true);

        setTimeout(() => {
          setIsLoading(false);
          router.replace('/staff-login-success' as any);
        }, 1200);
      }
    }, MOCK_LOGIN_CHECK_DELAY_MS);
  }, [fullName, businessName, isLoading, setStaffDetails, router]);

  const nameInputStyle = [
    styles.inputField,
    nameError ? styles.inputFieldError : isValid ? styles.inputFieldValid : null,
  ];

  const nameTextStyle = [
    styles.textInput,
    nameError ? styles.textInputError : isValid ? styles.textInputValid : null,
  ];

  const businessInputStyle = [
    styles.inputField,
    businessError ? styles.inputFieldError : isValid ? styles.inputFieldValid : null,
  ];

  const businessTextStyle = [
    styles.textInput,
    businessError ? styles.textInputError : isValid ? styles.textInputValid : null,
  ];

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <StatusBar style="dark" />

        {/* ── Top Header Back Arrow ── */}
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.backButtonTouch}
            onPress={handleBack}
            activeOpacity={0.7}
            accessibilityLabel="Go back to Staff Login Code"
          >
            <SimpleArrowLeftIcon size={24} color="rgba(0, 8, 20, 0.96)" />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(insets.bottom, 24) + 16 },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Header Titles ── */}
          <View style={styles.titleSection}>
            <Text style={styles.screenTitle}>Staff Login</Text>
            <Text style={styles.screenSubtitle}>
              Enter requested information to access your dashboard
            </Text>
          </View>

          {/* ── Form Inputs ── */}
          <View style={styles.formContainer}>
            {/* Field 1: Full Name */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Full Name</Text>
              <View style={nameInputStyle}>
                <TextInput
                  style={nameTextStyle}
                  placeholder="John Doe"
                  placeholderTextColor="rgba(192, 192, 204, 0.96)"
                  value={fullName}
                  onChangeText={handleNameChange}
                  autoCorrect={false}
                  returnKeyType="next"
                  onSubmitEditing={() => businessInputRef.current?.focus()}
                />
              </View>
              {nameError && (
                <Text style={styles.fieldErrorText}>{nameError}</Text>
              )}
            </View>

            {/* Field 2: Business / Company Name */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Business / Company Name</Text>
              <View style={businessInputStyle}>
                <TextInput
                  ref={businessInputRef}
                  style={businessTextStyle}
                  placeholder="Luminous care"
                  placeholderTextColor="rgba(192, 192, 204, 0.96)"
                  value={businessName}
                  onChangeText={handleBusinessChange}
                  autoCorrect={false}
                  returnKeyType="done"
                  onSubmitEditing={handleLoginPress}
                />
              </View>
              {businessError && (
                <Text style={styles.fieldErrorText}>{businessError}</Text>
              )}
            </View>
          </View>

          {/* ── Action Button "Login" ── */}
          <View style={styles.buttonWrapper}>
            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLoginPress}
              activeOpacity={0.85}
              disabled={isLoading}
            >
              <Text style={styles.loginButtonText}>Login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* ── 4-Dot Loading Overlay (Centered on Dimmed Screen) ── */}
        <LoadingOverlay
          visible={isLoading}
          dotsCount={4}
          dotSize={10}
          dotGap={12}
          overlayOpacity={0.1}
          centered={true}
        />
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

  // ── Header Row ──
  headerRow: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
  },
  backButtonTouch: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },

  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },

  // ── Title Section (Frame: sign up header, gap: 16) ──
  titleSection: {
    width: '100%',
    maxWidth: 358,
    alignSelf: 'center',
    gap: 16,
    marginBottom: 48,
  },
  screenTitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_600SemiBold',
    fontWeight: '600',
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: 0.1,
    color: '#141A33',
    includeFontPadding: false,
  },
  screenSubtitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    includeFontPadding: false,
  },

  // ── Form Inputs (width: 358) ──
  formContainer: {
    width: '100%',
    maxWidth: 358,
    alignSelf: 'center',
    gap: 24,
    marginBottom: 48,
  },
  fieldGroup: {
    gap: 8,
  },
  fieldLabel: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    color: 'rgba(0, 8, 20, 0.96)',
    includeFontPadding: false,
  },
  inputField: {
    width: '100%',
    height: 48,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    borderRadius: 24,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  inputFieldError: {
    borderColor: 'rgba(204, 41, 41, 0.9)',
  },
  inputFieldValid: {
    borderColor: 'rgba(12, 121, 12, 0.96)',
  },
  textInput: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
    padding: 0,
    margin: 0,
  },
  textInputError: {
    color: 'rgba(204, 41, 41, 0.9)',
  },
  textInputValid: {
    color: 'rgba(12, 121, 12, 0.96)',
  },
  fieldErrorText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(204, 41, 41, 0.9)',
    marginTop: 4,
    includeFontPadding: false,
  },

  // ── Action Button ──
  buttonWrapper: {
    width: '100%',
    maxWidth: 358,
    alignSelf: 'center',
    marginTop: 24,
  },
  loginButton: {
    width: '100%',
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(133, 139, 148, 0.04)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  loginButtonText: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
    color: '#FFFFFF',
    includeFontPadding: false,
  },
});
