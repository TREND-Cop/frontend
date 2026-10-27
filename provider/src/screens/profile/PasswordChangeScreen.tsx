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
import { useRouter } from 'expo-router';
import Svg, { Path, Circle } from 'react-native-svg';

import { NativeDockSpacer } from '../../components/NativeDockSpacer';
import { useProviderProfile } from '../../context/ProviderProfileContext';
import { AccountVerificationFlow } from '../verification/AccountVerificationFlow';
import { DEV_WRONG_CURRENT_PASSWORDS } from '../../constants/passwordVerification.config';

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

function EyeOpenIcon({ size = 24 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"
        stroke="#000814"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx="12" cy="12" r="3" stroke="#000814" strokeWidth="1.5" />
    </Svg>
  );
}

function EyeClosedIcon({ size = 24 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"
        stroke="#000814"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M4 4l16 16"
        stroke="#000814"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </Svg>
  );
}

function CheckmarkBadgeIcon({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Circle cx="10" cy="10" r="10" fill="#0C790C" />
      <Path
        d="M6 10l3 3 5-5"
        stroke="#FFFFFF"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export const PasswordChangeScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { ownerPhone, ownerEmail } = useProviderProfile();

  // Inputs state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Eye visibility toggles (masked by default)
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Errors state
  const [currentError, setCurrentError] = useState('');
  const [newError, setNewError] = useState('');
  const [confirmError, setConfirmError] = useState('');

  // Acceptance state: true when validation passes
  const [isAccepted, setIsAccepted] = useState(false);

  // Flow mode: 'form' | 'verification'
  const [isVerifying, setIsVerifying] = useState(false);

  const hasAnyInput =
    currentPassword.length > 0 || newPassword.length > 0 || confirmPassword.length > 0;

  // Clear errors on change
  const handleCurrentChange = (text: string) => {
    setCurrentPassword(text);
    if (currentError) setCurrentError('');
    if (newError) setNewError('');
    if (isAccepted) setIsAccepted(false);
  };

  const handleNewChange = (text: string) => {
    setNewPassword(text);
    if (newError) setNewError('');
    if (confirmError) setConfirmError('');
    if (isAccepted) setIsAccepted(false);
  };

  const handleConfirmChange = (text: string) => {
    setConfirmPassword(text);
    if (confirmError) setConfirmError('');
    if (isAccepted) setIsAccepted(false);
  };

  const handleSavePress = () => {
    if (!hasAnyInput) return;

    let hasError = false;

    // 1. Check wrong current password (dev test or backend stub)
    // TODO (Backend): check current password
    if (DEV_WRONG_CURRENT_PASSWORDS.includes(currentPassword)) {
      setCurrentError('Incorrect password input');
      hasError = true;
    } else {
      setCurrentError('');
    }

    // 2. Check new password rules: min 8 chars and must differ from current password
    if (newPassword.length < 8) {
      setNewError('Password must be at least 8 characters');
      hasError = true;
    } else if (newPassword === currentPassword) {
      setNewError('New password must differ from current password');
      hasError = true;
    } else {
      setNewError('');
    }

    // 3. Check confirm password match
    if (confirmPassword !== newPassword || confirmPassword.length === 0) {
      // Design typo corrected from "Password dose not match"
      setConfirmError('Password does not match');
      hasError = true;
    } else {
      setConfirmError('');
    }

    if (hasError) {
      setIsAccepted(false);
      return;
    }

    // 3. Accepted: show green borders and checkmarks on Current & Confirm
    setIsAccepted(true);

    // After brief acceptance indicator, transition into Account Verification
    setTimeout(() => {
      setIsVerifying(true);
    }, 300);
  };

  const handleVerified = async () => {
    // TODO (Backend): change password after verification
    // Passwords held in memory only until here. Never persist, never log.
    // Finish at success + dots state per spec, reporting callback triggered.
  };

  const handleBackPress = () => {
    if (isVerifying) {
      setIsVerifying(false);
      return;
    }
    router.back();
  };

  const handleSharePress = async () => {
    try {
      await Share.share({
        message: 'Trend Provider Password Change',
      });
    } catch (e) {
      // Ignore share dismissal
    }
  };

  // If in verification mode, render Shared AccountVerificationFlow
  if (isVerifying) {
    return (
      <AccountVerificationFlow
        phone={ownerPhone}
        // TODO (Backend): email on file (not collected at signup, null unless in profile state)
        email={ownerEmail || null}
        selectSubtitle="Please verify that this account belongs to you, Select verification method."
        onVerified={handleVerified}
        onBack={() => setIsVerifying(false)}
      />
    );
  }

  // ──────────────────────────────────────────────────────────
  // Password Change Form
  // ──────────────────────────────────────────────────────────
  return (
    <View style={styles.screenContainer}>
      <StatusBar style="dark" />
      <View style={{ height: insets.top, backgroundColor: '#FFFFFF' }} />

      {/* Top Page Header (64px) */}
      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.backButton}
          onPress={handleBackPress}
        >
          <ArrowLeftIcon size={24} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Password Change</Text>

        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.shareButton}
          onPress={handleSharePress}
        >
          <ShareIcon size={24} />
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
          {/* Field 1: Current Password */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Current Password</Text>
            <View
              style={[
                styles.inputWrapper,
                currentError ? styles.inputError : undefined,
                isAccepted ? styles.inputAccepted : undefined,
              ]}
            >
              <TextInput
                style={styles.textInput}
                value={currentPassword}
                onChangeText={handleCurrentChange}
                placeholder="Enter current password"
                placeholderTextColor="#C0C0CC"
                secureTextEntry={!showCurrent}
                autoCapitalize="none"
              />
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.eyeButton}
                onPress={() => setShowCurrent(!showCurrent)}
              >
                {isAccepted ? (
                  <CheckmarkBadgeIcon size={20} />
                ) : showCurrent ? (
                  <EyeOpenIcon size={24} />
                ) : (
                  <EyeClosedIcon size={24} />
                )}
              </TouchableOpacity>
            </View>
            {Boolean(currentError) && (
              <Text style={styles.errorText}>{currentError}</Text>
            )}
          </View>

          {/* Field 2: New Password */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>New Password</Text>
            <View
              style={[
                styles.inputWrapper,
                newError ? styles.inputError : undefined,
              ]}
            >
              <TextInput
                style={styles.textInput}
                value={newPassword}
                onChangeText={handleNewChange}
                placeholder="Enter new password"
                placeholderTextColor="#C0C0CC"
                secureTextEntry={!showNew}
                autoCapitalize="none"
              />
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.eyeButton}
                onPress={() => setShowNew(!showNew)}
              >
                {showNew ? (
                  <EyeOpenIcon size={24} />
                ) : (
                  <EyeClosedIcon size={24} />
                )}
              </TouchableOpacity>
            </View>
            {Boolean(newError) && (
              <Text style={styles.errorText}>{newError}</Text>
            )}
          </View>

          {/* Field 3: Confirm Password */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Confirm Password</Text>
            <View
              style={[
                styles.inputWrapper,
                confirmError ? styles.inputError : undefined,
                isAccepted ? styles.inputAccepted : undefined,
              ]}
            >
              <TextInput
                style={styles.textInput}
                value={confirmPassword}
                onChangeText={handleConfirmChange}
                placeholder="Confirm password"
                placeholderTextColor="#C0C0CC"
                secureTextEntry={!showConfirm}
                autoCapitalize="none"
              />
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.eyeButton}
                onPress={() => setShowConfirm(!showConfirm)}
              >
                {isAccepted ? (
                  <CheckmarkBadgeIcon size={20} />
                ) : showConfirm ? (
                  <EyeOpenIcon size={24} />
                ) : (
                  <EyeClosedIcon size={24} />
                )}
              </TouchableOpacity>
            </View>
            {Boolean(confirmError) && (
              <Text style={styles.errorText}>{confirmError}</Text>
            )}
          </View>
        </ScrollView>

        {/* Bottom Action Button: Save Changes */}
        <View style={[styles.bottomContainer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <TouchableOpacity
            activeOpacity={0.8}
            disabled={!hasAnyInput}
            onPress={handleSavePress}
            style={[
              styles.saveButton,
              hasAnyInput ? styles.saveButtonActive : styles.saveButtonDisabled,
            ]}
          >
            <Text
              style={[
                styles.saveButtonText,
                hasAnyInput ? styles.saveButtonTextActive : styles.saveButtonTextDisabled,
              ]}
            >
              {hasAnyInput ? 'Save changes' : 'Save Changes'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <NativeDockSpacer />
    </View>
  );
};

export default PasswordChangeScreen;

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  flexOne: {
    flex: 1,
  },
  header: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
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
  inputWrapper: {
    width: '100%',
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#C0C0CC',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
  },
  inputError: {
    borderColor: '#CC2929',
  },
  inputAccepted: {
    borderColor: '#0C790C',
  },
  textInput: {
    flex: 1,
    fontFamily: FONT_REGULAR,
    fontSize: 16,
    lineHeight: 24,
    color: '#000814',
    paddingVertical: 0,
  },
  eyeButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  errorText: {
    fontFamily: FONT_REGULAR,
    fontSize: 16,
    lineHeight: 24,
    color: '#CC2929',
    marginTop: 4,
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
