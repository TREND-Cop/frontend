import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Check } from 'lucide-react-native';
import Svg, { Path, Circle } from 'react-native-svg';

// ── Custom Exact Eye Open Icon (Figma Spec) ──
const EyeOpenIcon = ({
  size = 24,
  color = 'rgba(0, 8, 20, 0.96)',
}: {
  size?: number;
  color?: string;
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M2 12C3.6 7.6 7.8 4.5 12 4.5C16.2 4.5 20.4 7.6 22 12C20.4 16.4 16.2 19.5 12 19.5C7.8 19.5 3.6 16.4 2 12Z"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth={1.5} />
  </Svg>
);

// ── Custom Exact Eye Closed with Eyelashes Icon (Figma Spec) ──
const EyeClosedIcon = ({
  size = 24,
  color = 'rgba(0, 8, 20, 0.96)',
}: {
  size?: number;
  color?: string;
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {/* Eyelid curved arc */}
    <Path
      d="M3 10.5C5.8 14.5 8.7 16.2 12 16.2C15.3 16.2 18.2 14.5 21 10.5"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
    />
    {/* Downward radiating eyelashes */}
    <Path
      d="M6 13.5L4 16.5"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
    />
    <Path
      d="M9.8 15.5L9 19"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
    />
    <Path
      d="M14.2 15.5L15 19"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
    />
    <Path
      d="M18 13.5L20 16.5"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
    />
  </Svg>
);

export const ChangePasswordScreen: React.FC = () => {
  const router = useRouter();

  // Input states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Password visibility states (true = show plain text, false = masked with eyelashes icon)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Validation & Error states
  const [currentPasswordError, setCurrentPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setIsKeyboardVisible(true)
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setIsKeyboardVisible(false)
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const hasAnyInput =
    currentPassword.trim().length > 0 ||
    newPassword.trim().length > 0 ||
    confirmPassword.trim().length > 0;

  // Validation logic
  const isCurrentPasswordValid = currentPassword.length >= 6;
  const isNewPasswordValid = newPassword.length >= 6;
  const isConfirmPasswordMatching =
    confirmPassword.length > 0 && confirmPassword === newPassword;

  // Live status for fields
  const isCurrentPasswordCorrect = isCurrentPasswordValid && !currentPasswordError;
  const isConfirmPasswordCorrect =
    isConfirmPasswordMatching && isNewPasswordValid && !confirmPasswordError;

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/profile' as any);
    }
  };

  const handleCurrentPasswordChange = (text: string) => {
    setCurrentPassword(text);
    setCurrentPasswordError(null);
  };

  const handleNewPasswordChange = (text: string) => {
    setNewPassword(text);
    if (confirmPassword.length > 0 && text !== confirmPassword) {
      setConfirmPasswordError('Password dose not match');
    } else {
      setConfirmPasswordError(null);
    }
  };

  const handleConfirmPasswordChange = (text: string) => {
    setConfirmPassword(text);
    if (text.length > 0 && text !== newPassword) {
      setConfirmPasswordError('Password dose not match');
    } else {
      setConfirmPasswordError(null);
    }
  };

  const handleSaveChanges = () => {
    let hasError = false;

    // Validate current password
    if (currentPassword.length < 6) {
      setCurrentPasswordError('Incorrect password input');
      hasError = true;
    } else {
      setCurrentPasswordError(null);
    }

    // Validate confirm password
    if (!newPassword || confirmPassword !== newPassword) {
      setConfirmPasswordError('Password dose not match');
      hasError = true;
    } else {
      setConfirmPasswordError(null);
    }

    if (hasError) return;

    // Navigate to dedicated in-app profile verification method screen
    router.push({
      pathname: '/profile-verification-method',
      params: { type: 'password' },
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {/* ── Page Header (Figma: height 64px, borderBottom 1px solid rgba(235, 235, 245, 0.96)) ── */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleGoBack}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ArrowLeft size={24} color="rgba(0, 8, 20, 0.96)" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Password Change</Text>

          <View style={styles.headerRightPlaceholder} />
        </View>

        {/* ── Scrollable Form Area ── */}
        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: isKeyboardVisible ? 320 : 24 },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          {/* Field 1: Current Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Current Password</Text>
            <View
              style={[
                styles.inputBox,
                currentPasswordError
                  ? styles.inputBoxError
                  : isCurrentPasswordCorrect
                  ? styles.inputBoxSuccess
                  : styles.inputBoxNormal,
              ]}
            >
              <TextInput
                style={styles.textInput}
                value={currentPassword}
                onChangeText={handleCurrentPasswordChange}
                placeholder="Enter current password"
                placeholderTextColor="rgba(192, 192, 204, 0.96)"
                secureTextEntry={!showCurrentPassword}
                autoCapitalize="none"
              />
              {isCurrentPasswordCorrect ? (
                <View style={styles.greenCheckmarkCircle}>
                  <Check size={14} color="#FFFFFF" strokeWidth={3} />
                </View>
              ) : (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  {showCurrentPassword ? (
                    <EyeOpenIcon
                      size={24}
                      color={
                        currentPasswordError
                          ? 'rgba(204, 41, 41, 0.9)'
                          : 'rgba(0, 8, 20, 0.96)'
                      }
                    />
                  ) : (
                    <EyeClosedIcon
                      size={24}
                      color={
                        currentPasswordError
                          ? 'rgba(204, 41, 41, 0.9)'
                          : 'rgba(0, 8, 20, 0.96)'
                      }
                    />
                  )}
                </TouchableOpacity>
              )}
            </View>
            {currentPasswordError && (
              <Text style={styles.errorText}>{currentPasswordError}</Text>
            )}
          </View>

          {/* Field 2: New Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>New Password</Text>
            <View style={[styles.inputBox, styles.inputBoxNormal]}>
              <TextInput
                style={styles.textInput}
                value={newPassword}
                onChangeText={handleNewPasswordChange}
                placeholder="Enter new password"
                placeholderTextColor="rgba(192, 192, 204, 0.96)"
                secureTextEntry={!showNewPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setShowNewPassword(!showNewPassword)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                {showNewPassword ? (
                  <EyeOpenIcon size={24} color="rgba(0, 8, 20, 0.96)" />
                ) : (
                  <EyeClosedIcon size={24} color="rgba(0, 8, 20, 0.96)" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Field 3: Confirm Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Confirm Password</Text>
            <View
              style={[
                styles.inputBox,
                confirmPasswordError
                  ? styles.inputBoxError
                  : isConfirmPasswordCorrect
                  ? styles.inputBoxSuccess
                  : styles.inputBoxNormal,
              ]}
            >
              <TextInput
                style={styles.textInput}
                value={confirmPassword}
                onChangeText={handleConfirmPasswordChange}
                placeholder="Confirm password"
                placeholderTextColor="rgba(192, 192, 204, 0.96)"
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
              />
              {isConfirmPasswordCorrect ? (
                <View style={styles.greenCheckmarkCircle}>
                  <Check size={14} color="#FFFFFF" strokeWidth={3} />
                </View>
              ) : (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  {showConfirmPassword ? (
                    <EyeOpenIcon
                      size={24}
                      color={
                        confirmPasswordError
                          ? 'rgba(204, 41, 41, 0.9)'
                          : 'rgba(0, 8, 20, 0.96)'
                      }
                    />
                  ) : (
                    <EyeClosedIcon
                      size={24}
                      color={
                        confirmPasswordError
                          ? 'rgba(204, 41, 41, 0.9)'
                          : 'rgba(0, 8, 20, 0.96)'
                      }
                    />
                  )}
                </TouchableOpacity>
              )}
            </View>
            {confirmPasswordError && (
              <Text style={styles.errorText}>{confirmPasswordError}</Text>
            )}
          </View>
        </ScrollView>

        {/* ── Bottom Section (Save Changes Button) ── */}
        {!isKeyboardVisible && (
          <View style={styles.bottomContainer}>
            <TouchableOpacity
              style={[
                styles.saveButton,
                hasAnyInput ? styles.saveButtonActive : styles.saveButtonDisabled,
              ]}
              activeOpacity={hasAnyInput ? 0.8 : 1}
              disabled={!hasAnyInput}
              onPress={handleSaveChanges}
            >
              <Text
                style={[
                  styles.saveButtonText,
                  hasAnyInput
                    ? styles.saveButtonTextActive
                    : styles.saveButtonTextDisabled,
                ]}
              >
                Save Changes
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardContainer: {
    flex: 1,
  },

  // ── Header (Figma: 64px height, 1px border bottom) ──
  header: {
    height: 64,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(235, 235, 245, 0.96)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  headerButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontSize: 17,
    fontWeight: '500',
    lineHeight: 24,
    letterSpacing: 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
    textAlign: 'center',
  },
  headerRightPlaceholder: {
    width: 48,
    height: 48,
  },

  // ── Content Area (Figma: paddingTop 40px, gap 32px between groups) ──
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 24,
    gap: 32,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
    letterSpacing: 0.6,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  inputBox: {
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
  },
  inputBoxNormal: {
    borderColor: 'rgba(192, 192, 204, 0.96)',
  },
  inputBoxError: {
    borderColor: 'rgba(204, 41, 41, 0.9)',
  },
  inputBoxSuccess: {
    borderColor: '#0C790C',
  },
  textInput: {
    flex: 1,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  errorText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(204, 41, 41, 0.9)',
    paddingHorizontal: 4,
  },
  greenCheckmarkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#0C790C',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Bottom Area (Button) ──
  bottomContainer: {
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 12 : 24,
    paddingTop: 8,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  saveButton: {
    width: '100%',
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: 'rgba(248, 249, 250, 0.98)',
  },
  saveButtonActive: {
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    shadowColor: 'rgba(133, 139, 148, 0.08)',
    shadowOffset: { width: 8, height: 16 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 4,
  },
  saveButtonText: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter_500Medium',
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
    letterSpacing: 0.15,
    textTransform: 'capitalize',
  },
  saveButtonTextDisabled: {
    color: 'rgba(192, 192, 204, 0.96)',
  },
  saveButtonTextActive: {
    color: '#FFFFFF',
  },
});
