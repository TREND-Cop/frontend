import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Share,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSafeRouter } from '../../utils/safeNavigation';
import Svg, { Path, Circle } from 'react-native-svg';

import { NativeDockSpacer } from '../../components/NativeDockSpacer';
import { useProviderProfile } from '../../context/ProviderProfileContext';
import { AccountVerificationFlow } from '../verification/AccountVerificationFlow';
import { DEV_REJECTED_GMAILS } from '../../constants/passwordVerification.config';

// ── Platform Typography Standards ──
const FONT_MEDIUM = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium';
const FONT_REGULAR = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular';
const FONT_BUTTON = Platform.OS === 'ios' ? 'Inter' : 'Inter_500Medium';
const FONT_HEADER = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium';

// ── SVG Icons ──
function ArrowLeftIcon({ size = 24 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M19 12H5M11 6l-6 6 6 6"
        stroke="#000814"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function ShareIcon({ size = 24 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="18" cy="5" r="3" stroke="#141B34" strokeWidth="1.5" />
      <Circle cx="6" cy="12" r="3" stroke="#141B34" strokeWidth="1.5" />
      <Circle cx="18" cy="19" r="3" stroke="#141B34" strokeWidth="1.5" />
      <Path
        d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98"
        stroke="#141B34"
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
        stroke="#000814"
        strokeWidth="1.5"
      />
      <Path
        d="M3 7l8.2 5.467a1.5 1.5 0 0 0 1.6 0L21 7"
        stroke="#000814"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </Svg>
  );
}

function isValidGmailAddress(email: string): boolean {
  const trimmed = email.trim().toLowerCase();
  // Must end with @gmail.com and have text before @
  const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/i;
  return gmailRegex.test(trimmed);
}

export const AddGoogleAccountScreen: React.FC = () => {
  const safeRouter = useSafeRouter();
  const insets = useSafeAreaInsets();
  const { updateOwnerEmail } = useProviderProfile();

  const [emailInput, setEmailInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isValidated, setIsValidated] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const isInputEmpty = emailInput.trim().length === 0;

  const handleEmailChange = (text: string) => {
    setEmailInput(text);
    if (errorMessage) {
      setErrorMessage('');
    }
    if (isValidated) {
      setIsValidated(false);
    }
  };

  const handleSavePress = () => {
    if (isInputEmpty) return;

    const trimmed = emailInput.trim();

    if (!isValidGmailAddress(trimmed)) {
      setErrorMessage('Incorrect gmail address');
      setIsValidated(false);
      return;
    }

    if (DEV_REJECTED_GMAILS.some((e) => e.toLowerCase() === trimmed.toLowerCase())) {
      setErrorMessage('Incorrect gmail address');
      setIsValidated(false);
      return;
    }

    setErrorMessage('');
    setIsValidated(true);

    // Direct transition to OTP verification (Choice A3 / Prompt 4 spec)
    setIsVerifying(true);
  };

  const handleVerified = async () => {
    await updateOwnerEmail(emailInput.trim());
    safeRouter.replace('/profile?toast=Gmail%20account%20added' as any);
  };

  const handleSharePress = async () => {
    try {
      await Share.share({
        message: 'Trend Provider Add Google Account',
      });
    } catch {
      // Ignored
    }
  };

  if (isVerifying) {
    return (
      <AccountVerificationFlow
        skipSelect={true}
        directTargetContact={{
          type: 'email',
          value: emailInput.trim(),
        }}
        onVerified={handleVerified}
        onBack={() => setIsVerifying(false)}
      />
    );
  }

  const isSaveActive = !isInputEmpty;
  const hasError = Boolean(errorMessage);

  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoid}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.screenContainer}>
        <StatusBar style="dark" />
        <View style={{ height: insets.top, backgroundColor: '#FFFFFF' }} />

        {/* ── Fixed Page Header (64px, padding: 8px 16px) ── */}
        <View style={styles.pageHeader}>
          <View style={styles.headerContent}>
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.backButton}
              onPress={() => safeRouter.back()}
              accessibilityLabel="Back to Profile"
            >
              <ArrowLeftIcon size={24} />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>Add Google Account</Text>

            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.shareButton}
              onPress={handleSharePress}
              accessibilityLabel="Share"
            >
              <ShareIcon size={24} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Scrollable Form Area ── */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Description Copy */}
          <Text style={styles.descriptionText}>
            Entering a Google account means you want to add a Gmail account to the login process.
          </Text>

          {/* Input Field: Enter Google Account */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Enter Google Account</Text>
            <View
              style={[
                styles.inputWrapper,
                hasError && styles.inputError,
                isValidated && !hasError && styles.inputValid,
              ]}
            >
              <EnvelopeIcon size={24} />
              <View style={styles.divider} />
              <TextInput
                style={styles.textInput}
                value={emailInput}
                onChangeText={handleEmailChange}
                placeholder="johndoe@gmail.com"
                placeholderTextColor="#C0C0CC"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                selectionColor={Platform.OS === 'ios' ? '#000814' : 'rgba(0, 8, 20, 0.25)'}
                cursorColor="#000814"
              />
            </View>

            {hasError && <Text style={styles.errorText}>{errorMessage}</Text>}
          </View>
        </ScrollView>

        {/* ── Fixed Bottom Save Changes Button ── */}
        <View style={[styles.bottomContainer, { paddingBottom: insets.bottom + 16 }]}>
          <TouchableOpacity
            activeOpacity={isSaveActive ? 0.85 : 1}
            disabled={!isSaveActive}
            onPress={handleSavePress}
            style={[
              styles.saveButton,
              isSaveActive ? styles.saveButtonActive : styles.saveButtonDisabled,
            ]}
          >
            <Text
              style={[
                styles.saveButtonText,
                isSaveActive ? styles.saveButtonTextActive : styles.saveButtonTextDisabled,
              ]}
            >
              Save changes
            </Text>
          </TouchableOpacity>
        </View>

        <NativeDockSpacer />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardAvoid: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  screenContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  pageHeader: {
    width: '100%',
    height: 64,
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  headerContent: {
    width: '100%',
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: FONT_HEADER,
    fontWeight: '500',
    fontSize: 17,
    lineHeight: 24,
    color: '#000814',
    textAlign: 'center',
  },
  shareButton: {
    width: 48,
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
    gap: 32,
  },
  descriptionText: {
    fontFamily: FONT_REGULAR,
    fontSize: 16,
    lineHeight: 24,
    color: '#606066',
  },
  fieldGroup: {
    width: '100%',
    gap: 16,
  },
  fieldLabel: {
    fontFamily: FONT_MEDIUM,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    color: '#000814',
  },
  inputWrapper: {
    width: '100%',
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#C0C0CC',
    backgroundColor: '#F7F7F7',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 8,
  },
  inputValid: {
    borderColor: '#0C790C',
  },
  inputError: {
    borderColor: '#CC2929',
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: '#C0C0CC',
    marginHorizontal: 4,
  },
  textInput: {
    flex: 1,
    fontFamily: FONT_REGULAR,
    fontSize: 16,
    lineHeight: 24,
    color: '#000814',
    paddingVertical: 0,
  },
  errorText: {
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    lineHeight: 20,
    color: '#CC2929',
    marginTop: -8,
  },
  bottomContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    backgroundColor: '#FFFFFF',
  },
  saveButton: {
    width: '100%',
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
  },
  saveButtonActive: {
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
  },
  saveButtonText: {
    fontFamily: FONT_BUTTON,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
  },
  saveButtonTextDisabled: {
    color: 'rgba(192, 192, 204, 0.96)',
  },
  saveButtonTextActive: {
    color: '#FFFFFF',
  },
});
