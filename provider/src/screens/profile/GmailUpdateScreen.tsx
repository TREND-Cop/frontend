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
import { useRouter, useLocalSearchParams } from 'expo-router';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

import { NativeDockSpacer } from '../../components/NativeDockSpacer';
import { useProviderProfile } from '../../context/ProviderProfileContext';
import { AccountVerificationFlow } from '../verification/AccountVerificationFlow';
import {
  DEV_REJECTED_GMAILS,
  DEV_SAMPLE_EMAIL,
} from '../../constants/passwordVerification.config';

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
      <Path
        d="M12 3v11M12 3l-4 4M12 3l4 4"
        stroke="#141B34"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M4 12v7a2 2 0 002 2h12a2 2 0 002-2v-7"
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

function GreyCheckmarkIcon({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Circle cx="10" cy="10" r="10" fill="#C0C0CC" />
      <Path
        d="M6 10l3 3 5-5"
        stroke="#FFFFFF"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function StackedCardsGmailIllustration() {
  return (
    <View style={styles.illustrationWrapper}>
      {/* Background tilted card effect */}
      <View style={styles.tiltedCardBack} />
      <View style={styles.tiltedCardFront}>
        <View style={styles.illustrationCircle}>
          <EnvelopeIcon size={36} />
        </View>
      </View>
    </View>
  );
}

function isValidGmailAddress(email: string): boolean {
  const trimmed = email.trim().toLowerCase();
  const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/i;
  return gmailRegex.test(trimmed);
}

export const GmailUpdateScreen: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{ empty?: string }>();
  const insets = useSafeAreaInsets();
  const { ownerEmail, ownerPhone, updateOwnerEmail } = useProviderProfile();

  // Resolve effective email on file (taking into account DEV_SAMPLE_EMAIL)
  const effectiveCurrentEmail = DEV_SAMPLE_EMAIL !== null ? DEV_SAMPLE_EMAIL : ownerEmail;
  const isForceEmpty = params.empty === 'true';
  const hasEmailOnFile = Boolean(effectiveCurrentEmail && effectiveCurrentEmail.trim().length > 0) && !isForceEmpty;

  const [newEmailInput, setNewEmailInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isValidated, setIsValidated] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const isInputEmpty = newEmailInput.trim().length === 0;

  const handleEmailChange = (text: string) => {
    setNewEmailInput(text);
    if (errorMessage) {
      setErrorMessage('');
    }
    if (isValidated) {
      setIsValidated(false);
    }
  };

  const handleSavePress = () => {
    if (isInputEmpty) return;

    const trimmed = newEmailInput.trim();

    if (!isValidGmailAddress(trimmed)) {
      setErrorMessage('Incorrect gmail address');
      setIsValidated(false);
      return;
    }

    // Reject if same as existing email
    if (effectiveCurrentEmail && trimmed.toLowerCase() === effectiveCurrentEmail.toLowerCase()) {
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

    // Advance to Account Verification with selection step (Prompt 4 spec)
    setIsVerifying(true);
  };

  const handleVerified = async () => {
    await updateOwnerEmail(newEmailInput.trim());
    router.replace('/profile?toast=Gmail%20account%20updated' as any);
  };

  const handleSharePress = async () => {
    try {
      await Share.share({
        message: 'Trend Provider Gmail Account Update',
      });
    } catch {
      // Ignored
    }
  };

  if (isVerifying) {
    return (
      <AccountVerificationFlow
        email={effectiveCurrentEmail}
        phone={ownerPhone}
        onVerified={handleVerified}
        onBack={() => setIsVerifying(false)}
      />
    );
  }

  // ── Render Empty State (when no email on file) ──
  if (!hasEmailOnFile) {
    return (
      <View style={styles.screenContainer}>
        <StatusBar style="dark" />
        <View style={{ height: insets.top, backgroundColor: '#FFFFFF' }} />

        {/* Fixed Header */}
        <View style={styles.pageHeader}>
          <View style={styles.headerContent}>
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.backButton}
              onPress={() => router.back()}
              accessibilityLabel="Back to Profile"
            >
              <ArrowLeftIcon size={24} />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>Gmail Account Update</Text>

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

        {/* Centered Empty State View */}
        <View style={styles.emptyContainer}>
          <StackedCardsGmailIllustration />

          <Text style={styles.emptyTitle}>No added gmail to this account</Text>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push('/add-google-account' as any)}
            style={styles.emptyActionButton}
          >
            <Text style={styles.emptyActionButtonText}>Add gmail account</Text>
          </TouchableOpacity>
        </View>

        <NativeDockSpacer />
      </View>
    );
  }

  // ── Render Form State (when email is on file) ──
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

        {/* Fixed Page Header (64px) */}
        <View style={styles.pageHeader}>
          <View style={styles.headerContent}>
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.backButton}
              onPress={() => router.back()}
              accessibilityLabel="Back to Profile"
            >
              <ArrowLeftIcon size={24} />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>Gmail Account Update</Text>

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

        {/* Scrollable Form */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Description Copy (typo "chnage" corrected to "change") */}
          <Text style={styles.descriptionText}>
            Entering a new Gmail account means you wish to change the existing which will be your new login Gmail account.
          </Text>

          {/* Field 1: Existing Gmail Account (Read-only) */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Existing Gmail Account</Text>
            <View style={styles.readOnlyInput}>
              <EnvelopeIcon size={24} />
              <View style={styles.divider} />
              <Text style={styles.readOnlyText} numberOfLines={1}>
                {effectiveCurrentEmail || 'Saulgoodman@gmail.com'}
              </Text>
              <GreyCheckmarkIcon size={20} />
            </View>
          </View>

          {/* Field 2: Enter New Gmail Account (Editable) */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Enter New Gmail Account</Text>
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
                value={newEmailInput}
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

        {/* Fixed Bottom Save Changes Button */}
        <View style={[styles.bottomContainer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
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
  readOnlyInput: {
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
  readOnlyText: {
    flex: 1,
    fontFamily: FONT_REGULAR,
    fontSize: 16,
    lineHeight: 24,
    color: '#606066',
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
  // ── Empty State Styles ──
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 64,
  },
  illustrationWrapper: {
    width: 150,
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  tiltedCardBack: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 24,
    backgroundColor: '#EBEBF5',
    transform: [{ rotate: '8deg' }],
  },
  tiltedCardFront: {
    width: 128,
    height: 128,
    borderRadius: 24,
    backgroundColor: '#F7F7F7',
    borderWidth: 1,
    borderColor: '#C0C0CC',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000814',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  illustrationCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontFamily: FONT_REGULAR,
    fontSize: 16,
    lineHeight: 24,
    color: '#000000',
    textAlign: 'center',
    marginBottom: 32,
  },
  emptyActionButton: {
    width: 254,
    height: 44,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyActionButtonText: {
    fontFamily: FONT_BUTTON,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    color: '#FFFFFF',
  },
});
