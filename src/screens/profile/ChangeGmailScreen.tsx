import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { getSafeBottomPadding } from '../../utils/safeArea';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { useUserContext } from '../../store/UserContext';

// ── Star Loading Indicator (Figma: Star 3, 72x72px) ──
const StarLoadingIcon = ({
  size = 72,
  color = 'rgba(0, 8, 20, 0.96)',
}: {
  size?: number;
  color?: string;
}) => (
  <Svg width={size} height={size} viewBox="0 0 72 72" fill="none">
    <Path
      d="M36 6L44.5 25.5L66 27.5L50 42L54.5 63.5L36 53L17.5 63.5L22 42L6 27.5L27.5 25.5L36 6Z"
      fill={color}
    />
  </Svg>
);

// ── Mail Icon (Figma: mail-01, 24x24px) ──
const MailIcon = ({ color = 'rgba(192, 192, 204, 0.96)' }: { color?: string }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4 6H20C21.1 6 22 6.9 22 8V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V8C2 6.9 2.9 6 4 6Z"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M22 8L12 14L2 8"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// ── Checkmark Circle Icon (Figma: checkmark-circle-02, 24x24px - Verified State) ──
const CheckmarkCircleIcon = ({
  color = 'rgba(12, 121, 12, 0.96)',
}: {
  color?: string;
}) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
      fill={color}
    />
    <Path
      d="M8 12L11 15L16 9"
      stroke="#FFFFFF"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// ── Existing Checkmark Circle Icon (Figma: grey circle with white checkmark) ──
const ExistingCheckmarkIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" fill="rgba(192, 192, 204, 0.96)" />
    <Path
      d="M8.5 12.5L11 15L16 9.5"
      stroke="#FFFFFF"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const ChangeGmailScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const { profileData } = useUserContext();
  const mode = (params.mode as string) || 'update'; // default to update if accessed via change-gmail

  const isUpdateMode = mode === 'update';
  const screenTitle = isUpdateMode ? 'Gmail Account Update' : 'Add Google Account';
  const existingEmail = (params.existingEmail as string) || profileData.email || 'saulgoodman@gmail.com';

  const [email, setEmail] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showToast, setShowToast] = useState(false);
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

  // Animations
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const toastSlideAnim = useRef(new Animated.Value(30)).current;
  const toastOpacityAnim = useRef(new Animated.Value(0)).current;

  // Validation logic
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const hasInput = email.trim().length > 0;
  const isEmailValid = emailRegex.test(email.trim());
  const isGmailAddress = email.trim().toLowerCase().endsWith('@gmail.com');
  const isCorrect = hasInput && isEmailValid && isGmailAddress && !errorMessage;

  // Spin animation when saving
  useEffect(() => {
    if (isUpdating) {
      rotateAnim.setValue(0);
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    }
  }, [isUpdating]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/gmail-security' as any);
    }
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (errorMessage) {
      setErrorMessage(null);
    }
  };

  const handleSaveChanges = () => {
    const trimmed = email.trim();

    if (!trimmed) return;

    // Validate email format
    if (!emailRegex.test(trimmed) || !trimmed.toLowerCase().endsWith('@gmail.com')) {
      setErrorMessage('Incorrect gmail address');
      return;
    }

    setErrorMessage(null);

    // Route to verification selection or OTP
    router.push({
      pathname: '/profile-verification-method',
      params: {
        target: trimmed,
        targetEmail: trimmed,
        type: 'email',
      },
    } as any);
  };

  // Determine input border style based on flow state
  const getInputBorderColor = () => {
    if (errorMessage) return 'rgba(204, 41, 41, 0.9)'; // State 3: Error
    if (isCorrect) return 'rgba(12, 121, 12, 0.96)'; // State 4: Verified correct
    if (isFocused) return 'rgba(0, 8, 20, 0.96)';
    return 'rgba(192, 192, 204, 0.96)'; // State 1 / 2: Empty / Default
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {/* ── Page Header (Figma: height 64px, borderBottom 1px solid rgba(235, 235, 245, 0.96)) ── */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            {/* Back Button (48x48px, radius 24px) */}
            <TouchableOpacity
              onPress={handleGoBack}
              style={styles.backButton}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <ArrowLeft color="rgba(0, 8, 20, 0.96)" size={24} strokeWidth={1.5} />
            </TouchableOpacity>

            {/* Header Title (17px SF Pro 500, letterSpacing 0.2px) */}
            <Text style={styles.headerTitle}>{screenTitle}</Text>

            {/* Right invisible placeholder to keep title centered (48x48px) */}
            <View style={styles.headerPlaceholder} />
          </View>
        </View>

        {/* ── Scrollable Body Content ── */}
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
          {/* Subtitle Description (Figma: top 132px, 358px wide, 14px SF Pro 400, line-height 20px) */}
          <Text style={styles.descriptionText}>
            {isUpdateMode
              ? 'Entering a new gmail account means you wish to chnage the existing which will be your new login gmail account'
              : 'Entering a google account means you want to add a gmail account to the login process.'}
          </Text>

          {/* If Update Mode: Show Existing Gmail Account Field First */}
          {isUpdateMode && (
            <View style={styles.inputSection}>
              {/* Field Label: "Existing Gmail Account" (16px SF Pro 500, letterSpacing 0.6px) */}
              <Text style={styles.fieldLabel}>Existing Gmail Account</Text>

              {/* Disabled/Readonly Input Container with grey checkmark */}
              <View style={styles.existingFieldBox}>
                <View style={styles.inputInnerRow}>
                  {/* Mail Icon (24x24px) */}
                  <MailIcon color="rgba(192, 192, 204, 0.96)" />

                  {/* Vertical Divider Line (16px high) */}
                  <View style={styles.verticalDivider} />

                  {/* Existing Email Text (16px SF Pro 400, color rgba(96, 96, 102, 0.96)) */}
                  <Text style={styles.existingEmailText}>{existingEmail}</Text>
                </View>

                {/* Right Grey Checkmark Circle */}
                <ExistingCheckmarkIcon />
              </View>
            </View>
          )}

          {/* New Gmail Account Input Section */}
          <View style={styles.inputSection}>
            {/* Field Label: "Enter New Gmail Account" or "Enter Google Account" (16px SF Pro 500) */}
            <Text style={styles.fieldLabel}>
              {isUpdateMode ? 'Enter New Gmail Account' : 'Enter Google Account'}
            </Text>

            {/* Input Field Container (358x48px, radius 24px, padding 8x16px) */}
            <View
              style={[
                styles.inputFieldBox,
                { borderColor: getInputBorderColor() },
              ]}
            >
              {/* Mail icon + Divider Line + Text Input */}
              <View style={styles.inputInnerRow}>
                {/* Mail Icon (24x24px) */}
                <MailIcon
                  color={
                    errorMessage
                      ? 'rgba(204, 41, 41, 0.9)'
                      : isCorrect
                      ? 'rgba(12, 121, 12, 0.96)'
                      : 'rgba(192, 192, 204, 0.96)'
                  }
                />

                {/* Vertical Divider Line (Line 190: 16px high) */}
                <View style={styles.verticalDivider} />

                {/* Text Input (16px SF Pro 400, color rgba(0, 8, 20, 0.96)) */}
                <TextInput
                  style={[styles.textInput, { outlineStyle: 'none' } as any]}
                  placeholder={isUpdateMode ? '001Ghost@gmail.com' : 'johndoe@gmail.com'}
                  placeholderTextColor="rgba(192, 192, 204, 0.96)"
                  value={email}
                  onChangeText={handleEmailChange}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                />
              </View>

              {/* Right Checkmark Circle Icon (State 4: Verified) */}
              {isCorrect && (
                <View style={styles.checkmarkWrapper}>
                  <CheckmarkCircleIcon />
                </View>
              )}
            </View>

            {/* Error Message (State 3: "Incorrect gmail address", 16px SF Pro 500, color rgba(204, 41, 41, 0.9)) */}
            {errorMessage && (
              <Text style={styles.errorMessageText}>{errorMessage}</Text>
            )}
          </View>
        </ScrollView>

        {/* ── Bottom Save Changes Button (Figma: 358x44px, radius 24px, 16px Inter 500) ── */}
        {!isKeyboardVisible && (
          <View style={[styles.bottomBar, { paddingBottom: getSafeBottomPadding(insets, 16, 8) }]}>
            <TouchableOpacity
              style={[
                styles.saveButton,
                !hasInput && styles.saveButtonDisabled,
              ]}
              onPress={handleSaveChanges}
              disabled={!hasInput || isUpdating}
              activeOpacity={0.85}
            >
              <Text
                style={[
                  styles.saveButtonText,
                  !hasInput && styles.saveButtonTextDisabled,
                ]}
              >
                Save Changes
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Star 3 Loading Spinner Modal ── */}
        {isUpdating && (
          <View style={styles.loadingOverlay}>
            <Animated.View style={{ transform: [{ rotate: spin }] }}>
              <StarLoadingIcon size={72} color="rgba(0, 8, 20, 0.96)" />
            </Animated.View>
          </View>
        )}

        {/* ── Floating Pill Toast ── */}
        {showToast && (
          <Animated.View
            style={[
              styles.toastContainer,
              {
                opacity: toastOpacityAnim,
                transform: [{ translateY: toastSlideAnim }],
              },
            ]}
          >
            <View style={styles.toastPill}>
              <CheckmarkCircleIcon color="#0C790C" />
              <Text style={styles.toastText}>Gmail Account Updated</Text>
            </View>
          </Animated.View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // ── Screen Container (Figma: background #FFFFFF, width 390px, height 844px) ──
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // ── Page Header (Figma: height 64px, padding 8x16px, gap 10px, borderBottom 1px) ──
  header: {
    height: 64,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(235, 235, 245, 0.96)',
    justifyContent: 'center',
  },
  headerContent: {
    height: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
  },
  headerTitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 17,
    lineHeight: 24,
    letterSpacing: 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
    textAlign: 'center',
    flex: 1,
  },
  headerPlaceholder: {
    width: 48,
    height: 48,
  },

  // ── Scroll Content ──
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 40,
    gap: 32,
  },

  // ── Description Subtitle (Figma: top 132px, 358px wide, 14px SF Pro 400, line-height 20px) ──
  descriptionText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.3,
    color: 'rgba(96, 96, 102, 0.96)',
  },

  // ── User Info Input Field (Figma: 358x88px, gap 16px) ──
  inputSection: {
    gap: 16,
  },
  fieldLabel: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.6,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  existingFieldBox: {
    width: '100%',
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
  },
  existingEmailText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  inputFieldBox: {
    width: '100%',
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
  },
  inputInnerRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  verticalDivider: {
    width: 1,
    height: 16,
    backgroundColor: 'rgba(235, 235, 245, 0.96)',
  },
  textInput: {
    flex: 1,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
    padding: 0,
  },
  checkmarkWrapper: {
    marginLeft: 8,
  },
  errorMessageText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.6,
    color: 'rgba(204, 41, 41, 0.9)',
    marginTop: -8,
  },

  // ── Bottom Sticky Bar & Button (Figma: 358x44px, radius 24px, 16px Inter 500) ──
  bottomBar: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButton: {
    width: '100%',
    height: 44,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: 'rgba(248, 249, 250, 0.98)',
  },
  saveButtonText: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
    textTransform: 'capitalize',
    color: '#FFFFFF',
  },
  saveButtonTextDisabled: {
    color: 'rgba(192, 192, 204, 0.96)',
  },

  // ── Loading Overlay ──
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(65, 63, 63, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },

  // ── Floating Pill Toast ──
  toastContainer: {
    position: 'absolute',
    bottom: 90,
    alignSelf: 'center',
    zIndex: 1000,
  },
  toastPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  toastText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 20,
    color: '#FFFFFF',
  },
});
