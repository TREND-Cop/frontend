import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSafeRouter } from '../../utils/safeNavigation';
import { StepProgressHeader } from '../../components/StepProgressHeader';
import { NativeDockSpacer } from '../../components/NativeDockSpacer';
import { useProviderOnboarding } from '../../context/ProviderOnboardingContext';

export const BusinessNameScreen: React.FC = () => {
  const safeRouter = useSafeRouter();
  const insets = useSafeAreaInsets();
  const { businessName, setBusinessName } = useProviderOnboarding();

  const [name, setName] = useState(businessName);
  const [error, setError] = useState<string | null>(null);

  // ── Keyboard State ──
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

  const handleNextPress = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Required');
      return;
    }

    setError(null);
    setBusinessName(trimmed);
    safeRouter.push('/business-location' as any);
  };

  const handleBackPress = () => {
    safeRouter.back();
  };

  return (
    <View style={styles.screenContainer}>
      <StatusBar style="dark" />

      <KeyboardAvoidingView
        style={styles.flexOne}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View
            style={[
              styles.contentContainer,
              {
                paddingTop: Math.max(insets.top + 8, 20),
                paddingBottom: isKeyboardVisible
                  ? 16
                  : Math.max(insets.bottom + 16, 24),
              },
            ]}
          >
            {/* ── 1. Top Unified Step Progress Header (Step 2 of 4) ── */}
            <StepProgressHeader
              currentStep={2}
              totalSteps={4}
              onBack={handleBackPress}
              marginBottom={0}
            />

            {/* ── 2. Vertically Centered Large Input Area (Frame 1000006546) ── */}
            <View style={styles.centerContainer}>
              <View style={styles.centeredInputArea}>
                <TextInput
                  style={[styles.businessNameInput, error ? styles.inputErrorColor : null]}
                  placeholder="Enter Your Business Name"
                  placeholderTextColor="rgba(192, 192, 204, 0.96)"
                  value={name}
                  onChangeText={(val) => {
                    setName(val);
                    if (error) setError(null);
                  }}
                  textAlign="center"
                  cursorColor="#000814"
                  selectionColor={Platform.OS === 'ios' ? '#000814' : 'rgba(0, 8, 20, 0.25)'}
                  autoCapitalize="words"
                  autoFocus
                />
                {/* Line 64 Underline */}
                <View
                  style={[
                    styles.inputUnderline,
                    error ? styles.underlineError : null,
                  ]}
                />

                {error && <Text style={styles.errorText}>{error}</Text>}
              </View>
            </View>

            {/* ── 3. Next Button (Stays visible at the bottom / above keyboard) ── */}
            <View style={styles.buttonWrapper}>
              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.nextButton}
                onPress={handleNextPress}
              >
                <Text style={styles.nextButtonText}>Next</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      {/* Android System Dock Barrier: only active when keyboard is not visible */}
      {!isKeyboardVisible && <NativeDockSpacer backgroundColor="#FFFFFF" />}
    </View>
  );
};

export default BusinessNameScreen;

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  flexOne: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  /* Centered Input (Frame 1000006546: width 358px, height 52px) */
  centerContainer: {
    flex: 1,
    width: '100%',
    maxWidth: 358,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centeredInputArea: {
    width: '100%',
    maxWidth: 358,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  businessNameInput: {
    width: '100%',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 24,
    lineHeight: 32,
    color: '#000814',
    textAlign: 'center',
    paddingVertical: 8,
    includeFontPadding: false,
  },
  inputErrorColor: {
    color: '#CC2929',
  },
  inputUnderline: {
    width: '100%',
    height: 1,
    backgroundColor: '#EBEBF5',
    marginTop: 12,
  },
  underlineError: {
    backgroundColor: '#CC2929',
  },
  errorText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 14,
    color: '#CC2929',
    marginTop: 8,
    textAlign: 'center',
  },

  /* Next Button */
  buttonWrapper: {
    width: '100%',
    maxWidth: 358,
    alignSelf: 'center',
  },
  nextButton: {
    width: '100%',
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonText: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    color: '#FFFFFF',
    includeFontPadding: false,
  },
});
