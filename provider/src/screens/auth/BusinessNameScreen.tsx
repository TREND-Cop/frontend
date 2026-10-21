import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { StepProgressHeader } from '../../components/StepProgressHeader';
import { NativeDockSpacer } from '../../components/NativeDockSpacer';
import { useProviderOnboarding } from '../../context/ProviderOnboardingContext';

export const BusinessNameScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { businessName, setBusinessName } = useProviderOnboarding();

  const [name, setName] = useState(businessName);
  const [error, setError] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(true);

  // ── Keyboard State & Scroll Ref ──
  const scrollViewRef = useRef<ScrollView>(null);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setIsKeyboardVisible(true);
        setKeyboardHeight(e.endCoordinates.height);
      }
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setIsKeyboardVisible(false);
        setKeyboardHeight(0);
      }
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
    router.push('/business-location' as any);
  };

  const handleBackPress = () => {
    router.back();
  };

  return (
    <View style={styles.screenContainer}>
      <StatusBar style="dark" />

      <KeyboardAvoidingView
        style={styles.flexOne}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.flexOne}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: Math.max(insets.top + 8, 20),
              paddingBottom: Math.max(insets.bottom + 16, 24),
            },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          <View style={styles.topContent}>
            {/* ── Unified Step Progress Header (Step 2 of 4) ── */}
            <StepProgressHeader
              currentStep={2}
              totalSteps={4}
              onBack={handleBackPress}
              marginBottom={isKeyboardVisible ? 40 : 120}
            />

            {/* ── Centered Large Input Area (Frame 1000006546) ── */}
            <View style={styles.centeredInputArea}>
              <TextInput
                style={[styles.businessNameInput, error ? styles.inputErrorColor : null]}
                placeholder={isFocused ? '' : 'Enter Your Business Name'}
                placeholderTextColor="rgba(192, 192, 204, 0.96)"
                value={name}
                onChangeText={(val) => {
                  setName(val);
                  if (error) setError(null);
                }}
                onFocus={() => {
                  setIsFocused(true);
                  setTimeout(() => {
                    scrollViewRef.current?.scrollToEnd({ animated: true });
                  }, 150);
                }}
                onBlur={() => setIsFocused(false)}
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

          {/* ── Next Button (Stays visible above keyboard) ── */}
          <View style={styles.buttonWrapper}>
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.nextButton}
              onPress={handleNextPress}
            >
              <Text style={styles.nextButtonText}>Next</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Android System Dock Barrier */}
      <NativeDockSpacer backgroundColor="#FFFFFF" />
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
  scrollContent: {
    paddingHorizontal: 16,
    alignItems: 'center',
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  topContent: {
    width: '100%',
    maxWidth: 358,
    alignItems: 'center',
  },

  /* Centered Input (Frame 1000006546: width 358px, height 52px) */
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
