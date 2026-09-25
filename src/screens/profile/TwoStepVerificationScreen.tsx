import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  Easing,
  Platform,
  KeyboardAvoidingView,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Check } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useUserContext } from '../../store/UserContext';

// ── Custom Animated 64x32px Toggle Switch (Figma Spec) ──
interface ToggleSwitchProps {
  value: boolean;
  onValueChange: (newValue: boolean) => void;
}

const CustomToggleSwitch: React.FC<ToggleSwitchProps> = ({ value, onValueChange }) => {
  const animatedValue = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: value ? 1 : 0,
      duration: 200,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [value]);

  const thumbTranslateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [4, 36],
  });

  const trackBgColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(248, 249, 250, 0.98)', 'rgba(12, 121, 12, 0.96)'],
  });

  const trackBorderColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(235, 235, 245, 0.96)', 'rgba(12, 121, 12, 0.96)'],
  });

  const thumbBgColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(192, 192, 204, 0.96)', 'rgba(255, 255, 255, 0.96)'],
  });

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => onValueChange(!value)}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <Animated.View
        style={[
          styles.switchTrack,
          {
            backgroundColor: trackBgColor,
            borderColor: trackBorderColor,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.switchThumb,
            {
              transform: [{ translateX: thumbTranslateX }],
              backgroundColor: thumbBgColor,
            },
          ]}
        />
      </Animated.View>
    </TouchableOpacity>
  );
};

export const TwoStepVerificationScreen: React.FC = () => {
  const router = useRouter();
  const { profileData, setTwoStepEnabled } = useUserContext();

  // Screen modes: 'toggle' | 'input'
  const [step, setStep] = useState<'toggle' | 'input'>('toggle');
  const [isGmailEnabled, setIsGmailEnabled] = useState(
    profileData.twoStepEnabled ?? false
  );

  // Email input state
  const [email, setEmail] = useState(profileData.email || '');
  const [emailError, setEmailError] = useState<string | null>(null);
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

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailValid = emailRegex.test(email.trim());
  const isCorrect = isEmailValid && !emailError;

  const handleGoBack = () => {
    if (step === 'input') {
      setStep('toggle');
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/profile' as any);
    }
  };

  const handleToggleChange = (newValue: boolean) => {
    setIsGmailEnabled(newValue);
    setTwoStepEnabled(newValue);
    if (newValue) {
      // Transition to email input step
      setStep('input');
    }
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (emailError) setEmailError(null);
  };

  const handleSaveToggle = () => {
    if (isGmailEnabled) {
      setStep('input');
    }
  };

  const handleSaveEmail = () => {
    const trimmed = email.trim();

    if (!trimmed || !emailRegex.test(trimmed)) {
      setEmailError('Email is incorrect or dose not exist');
      return;
    }

    setEmailError(null);

    // Navigate to Account Verification method selection
    router.push({
      pathname: '/profile-verification-method',
      params: { type: 'email', targetEmail: trimmed },
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
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

          <Text style={styles.headerTitle}>Two Step Verification</Text>

          <View style={styles.headerRightPlaceholder} />
        </View>

        {/* ── Content Body ── */}
        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: isKeyboardVisible ? 320 : 24 },
          ]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
          {step === 'toggle' ? (
            /* ── Step 1: Toggle Mode ── */
            <View style={styles.toggleSection}>
              <Text style={styles.introText}>
                You need the following to set up two step verification on your account
              </Text>

              <View style={styles.toggleRow}>
                <Text style={styles.toggleLabel}>Enable Gmail</Text>
                <CustomToggleSwitch
                  value={isGmailEnabled}
                  onValueChange={handleToggleChange}
                />
              </View>
            </View>
          ) : (
            /* ── Step 2: Email Input Mode (Figma: top 135px, gap 8px) ── */
            <View style={styles.inputSection}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Enter Email Address</Text>
                <View
                  style={[
                    styles.inputBox,
                    emailError
                      ? styles.inputBoxError
                      : styles.inputBoxNormal,
                  ]}
                >
                  <TextInput
                    style={styles.textInput}
                    value={email}
                    onChangeText={handleEmailChange}
                    placeholder="John Doe001@gmail.com"
                    placeholderTextColor="rgba(192, 192, 204, 0.96)"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoFocus={true}
                  />

                  {/* Right Correct Green Checkmark Badge (Figma: 24x24, #0C790C) */}
                  {isCorrect && (
                    <View style={styles.greenCheckmarkCircle}>
                      <Check size={14} color="#FFFFFF" strokeWidth={3} />
                    </View>
                  )}
                </View>
              </View>

              {/* Error Message (Figma: "Email is incorrect or dose not exist") */}
              {emailError && (
                <Text style={styles.errorText}>{emailError}</Text>
              )}
            </View>
          )}
        </ScrollView>

        {/* ── Bottom Save Change Button (Figma: 358x48px, borderRadius 24px) ── */}
        {!isKeyboardVisible && (
          <View style={styles.bottomContainer}>
            {step === 'toggle' ? (
              <TouchableOpacity
                style={[
                  styles.saveButton,
                  isGmailEnabled
                    ? styles.saveButtonActive
                    : styles.saveButtonDisabled,
                ]}
                activeOpacity={isGmailEnabled ? 0.8 : 1}
                disabled={!isGmailEnabled}
                onPress={handleSaveToggle}
              >
                <Text
                  style={[
                    styles.saveButtonText,
                    isGmailEnabled
                      ? styles.saveButtonTextActive
                      : styles.saveButtonTextDisabled,
                  ]}
                >
                  Save Change
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[
                  styles.saveButton,
                  email.trim().length > 0
                    ? styles.saveButtonActive
                    : styles.saveButtonDisabled,
                ]}
                activeOpacity={email.trim().length > 0 ? 0.8 : 1}
                disabled={email.trim().length === 0}
                onPress={handleSaveEmail}
              >
                <Text
                  style={[
                    styles.saveButtonText,
                    email.trim().length > 0
                      ? styles.saveButtonTextActive
                      : styles.saveButtonTextDisabled,
                  ]}
                >
                  Save Change
                </Text>
              </TouchableOpacity>
            )}
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

  // ── Header (Figma: height 64px, borderBottom 1px solid rgba(235, 235, 245, 0.96)) ──
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

  // ── Content Area ──
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 24,
  },

  // ── Toggle Step ──
  toggleSection: {
    gap: 32,
  },
  introText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  toggleLabel: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
    letterSpacing: 0.6,
    color: 'rgba(0, 8, 20, 0.96)',
  },

  // ── Custom Toggle Switch (64x32px) ──
  switchTrack: {
    width: 64,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    position: 'relative',
  },
  switchThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },

  // ── Input Step (Figma: top 135px, gap 8px) ──
  inputSection: {
    paddingTop: 8,
    gap: 8,
  },
  inputGroup: {
    gap: 16,
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
  greenCheckmarkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#0C790C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(204, 41, 41, 0.9)',
    paddingHorizontal: 4,
  },

  // ── Bottom Area (Figma: 358x48px, borderRadius 24px) ──
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
