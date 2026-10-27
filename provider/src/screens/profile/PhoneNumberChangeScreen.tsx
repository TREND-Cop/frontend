import React, { useState, useMemo } from 'react';
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
import { useRouter } from 'expo-router';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

import { NativeDockSpacer } from '../../components/NativeDockSpacer';
import { useProviderProfile } from '../../context/ProviderProfileContext';
import { AccountVerificationFlow } from '../verification/AccountVerificationFlow';
import { DEV_TAKEN_PHONES } from '../../constants/passwordVerification.config';

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

function NigeriaFlagIcon({ size = 24 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect width="24" height="24" rx="4" fill="#F9F9F9" />
      <Rect width="8" height="24" rx="2" fill="#83BF4F" />
      <Rect x="16" width="8" height="24" rx="2" fill="#83BF4F" />
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

function GreenCheckmarkIcon({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Circle cx="10" cy="10" r="10" fill="#0C790C" />
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

function normalizePhoneDigits(input: string): string {
  // Strip non-digits
  const digitsOnly = input.replace(/\D/g, '');
  // If starts with 234, strip country code
  if (digitsOnly.startsWith('234')) {
    const rest = digitsOnly.slice(3);
    return rest.startsWith('0') ? rest.slice(1) : rest;
  }
  // Strip leading 0
  return digitsOnly.startsWith('0') ? digitsOnly.slice(1) : digitsOnly;
}

export const PhoneNumberChangeScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { ownerPhone, ownerEmail, updateOwnerPhone } = useProviderProfile();

  const [newPhone, setNewPhone] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // Normalize current and entered phone
  const currentDigits = useMemo(() => normalizePhoneDigits(ownerPhone || ''), [ownerPhone]);
  const newDigits = useMemo(() => normalizePhoneDigits(newPhone), [newPhone]);

  // Valid length: 10 digits after +234
  const isValidLength = newDigits.length === 10;
  const isInputEmpty = newPhone.trim().length === 0;

  const handlePhoneChange = (text: string) => {
    setNewPhone(text);
    if (errorMessage) {
      setErrorMessage('');
    }
  };

  const handleSavePress = () => {
    if (isInputEmpty) return;

    if (!isValidLength) {
      setErrorMessage('Phone number is incorrect or already exists');
      return;
    }

    // Reject if same as current number
    if (newDigits === currentDigits) {
      setErrorMessage('Phone number is incorrect or already exists');
      return;
    }

    // Check DEV_TAKEN_PHONES
    if (DEV_TAKEN_PHONES.some((p) => normalizePhoneDigits(p) === newDigits)) {
      setErrorMessage('Phone number is incorrect or already exists');
      return;
    }

    setErrorMessage('');
    // Valid: advance to Account Verification
    setIsVerifying(true);
  };

  const handleVerified = async () => {
    // Format formatted phone: +234 followed by the 10 digits formatted with standard spacing
    const formattedPhone = `+234 ${newDigits.slice(0, 3)} ${newDigits.slice(3, 6)} ${newDigits.slice(6)}`;
    await updateOwnerPhone(formattedPhone);

    // Return to profile hub with toast confirmation
    router.replace('/profile?toast=Phone%20number%20updated' as any);
  };

  const handleSharePress = async () => {
    try {
      await Share.share({
        message: 'Trend Provider Phone Number Change',
      });
    } catch {
      // Ignored
    }
  };

  if (isVerifying) {
    return (
      <AccountVerificationFlow
        email={ownerEmail}
        phone={ownerPhone}
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
              onPress={() => router.back()}
              accessibilityLabel="Back to Profile"
            >
              <ArrowLeftIcon size={24} />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>Phone Number Change</Text>

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
          {/* Field 1: Current Phone Number (Read-only) */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Current Phone Number</Text>
            <View style={styles.readOnlyInput}>
              <View style={styles.prefixGroup}>
                <NigeriaFlagIcon size={24} />
                <Text style={styles.prefixText}>+234</Text>
              </View>
              <Text style={styles.currentPhoneValue} numberOfLines={1}>
                {ownerPhone || '+234 8110783610'}
              </Text>
              <GreyCheckmarkIcon size={20} />
            </View>
          </View>

          {/* Field 2: New Phone Number (Editable) */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>New Phone Number</Text>
            <View
              style={[
                styles.inputWrapper,
                hasError && styles.inputError,
                isValidLength && !hasError && styles.inputValid,
              ]}
            >
              <View style={styles.prefixGroup}>
                <NigeriaFlagIcon size={24} />
                <Text style={styles.prefixText}>+234</Text>
              </View>

              <View style={styles.divider} />

              <TextInput
                style={styles.textInput}
                value={newPhone}
                onChangeText={handlePhoneChange}
                placeholder="08110783610"
                placeholderTextColor="#C0C0CC"
                keyboardType="phone-pad"
                autoFocus={false}
                selectionColor={Platform.OS === 'ios' ? '#000814' : 'rgba(0, 8, 20, 0.25)'}
                cursorColor="#000814"
              />

              {isValidLength && !hasError && <GreenCheckmarkIcon size={20} />}
            </View>

            {hasError && <Text style={styles.errorText}>{errorMessage}</Text>}
          </View>
        </ScrollView>

        {/* ── Fixed Bottom Save Changes Button ── */}
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
    gap: 40,
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
    gap: 10,
  },
  prefixGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  prefixText: {
    fontFamily: FONT_REGULAR,
    fontSize: 16,
    lineHeight: 24,
    color: '#606066',
  },
  currentPhoneValue: {
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
});
