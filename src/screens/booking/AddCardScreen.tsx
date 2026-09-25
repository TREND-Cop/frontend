import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  Animated,
  Keyboard,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import Svg, { Path, Circle, Rect, Text as SvgText } from 'react-native-svg';
import { bookingStore } from '../../utils/bookingStore';
import { useBookingContext } from '../../store/BookingContext';
import { typography } from '../../constants/theme';
import { NativeDockSpacer } from '../../components/ui/NativeDockSpacer';

export type CardOperator = 'visa' | 'mastercard' | 'verve' | 'amex' | 'discover' | null;

// ── Mastercard Mini Logo matching Figma ──
const MastercardLogo = () => (
  <Svg width="32" height="20" viewBox="0 0 32 20" fill="none">
    <Circle cx="11" cy="10" r="7" fill="#EB001B" fillOpacity="0.95" />
    <Circle cx="21" cy="10" r="7" fill="#F79E1B" fillOpacity="0.95" />
  </Svg>
);

// ── Visa Mini Logo matching Figma ──
const VisaLogo = () => (
  <Svg width="32" height="20" viewBox="0 0 32 20" fill="none">
    <Path
      d="M13.2 14.5L14.9 5.5H17.2L15.5 14.5H13.2ZM22.4 5.7C22.0 5.5 21.3 5.3 20.4 5.3C18.3 5.3 16.8 6.4 16.8 8.0C16.8 9.2 17.9 9.8 18.7 10.2C19.5 10.6 19.8 10.9 19.8 11.3C19.8 11.9 19.1 12.2 18.4 12.2C17.5 12.2 16.9 12.0 16.3 11.7L15.9 11.5L15.5 13.7C16.1 14.0 17.2 14.3 18.3 14.3C20.6 14.3 22.1 13.2 22.1 11.4C22.1 10.5 21.5 9.7 20.3 9.1C19.6 8.7 19.2 8.5 19.2 8.0C19.2 7.6 19.6 7.2 20.5 7.2C21.2 7.2 21.8 7.4 22.2 7.6L22.6 7.8L22.4 5.7ZM26.5 5.5H24.7C24.1 5.5 23.7 5.7 23.5 6.2L19.9 14.5H22.3L22.8 13.2H25.7L26.0 14.5H28.1L26.5 5.5ZM23.4 11.5L24.6 8.2L25.3 11.5H23.4ZM11.6 5.5L9.4 11.6L9.2 10.3C8.8 9.0 7.7 7.5 6.4 6.8L11.6 5.5ZM6.2 5.5H3.9L3.8 5.7C5.7 6.1 7.2 7.2 8.2 8.7L7.4 14.5H9.8L13.8 5.5H11.6H6.2Z"
      fill="#0D99FF"
    />
  </Svg>
);

// ── Verve Mini Logo matching Figma & Screenshot (Teal ring with notch) ──
const VerveLogo = ({ isSpinning }: { isSpinning?: boolean }) => {
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isSpinning) {
      const loop = Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: Platform.OS !== 'web',
        })
      );
      loop.start();
      return () => loop.stop();
    }
  }, [isSpinning, rotateAnim]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View style={isSpinning ? { transform: [{ rotate: spin }] } : undefined}>
      <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <Circle cx="12" cy="12" r="8" stroke="#00B596" strokeWidth="2.8" />
        <Path d="M7 12H11" stroke="#2B0033" strokeWidth="2.5" strokeLinecap="round" />
      </Svg>
    </Animated.View>
  );
};

// ── American Express Logo ──
const AmexLogo = () => (
  <Svg width="32" height="20" viewBox="0 0 32 20" fill="none">
    <Rect width="32" height="20" rx="3" fill="#006FCF" />
    <SvgText
      x="16"
      y="14"
      fill="#FFFFFF"
      fontSize="9"
      fontWeight="bold"
      textAnchor="middle"
      fontFamily={Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular'}
    >
      AMEX
    </SvgText>
  </Svg>
);

// ── Discover Logo ──
const DiscoverLogo = () => (
  <Svg width="32" height="20" viewBox="0 0 32 20" fill="none">
    <Rect width="32" height="20" rx="3" fill="#F4F4F5" stroke="#E4E4E7" />
    <Circle cx="16" cy="10" r="6" fill="#FF6000" />
  </Svg>
);

// ── Custom Help Circle Icon matching Figma (16px x 16px) ──
const HelpCircleIcon = () => (
  <Svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <Circle cx="8" cy="8" r="6.75" stroke="rgba(91, 9, 91, 0.9)" strokeWidth="1.2" />
    <Path
      d="M6.5 6.5C6.5 5.67157 7.17157 5 8 5C8.82843 5 9.5 5.67157 9.5 6.5C9.5 7.15 9.1 7.6 8.5 7.9C8.1 8.1 8 8.4 8 8.8V9"
      stroke="rgba(91, 9, 91, 0.9)"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
    <Circle cx="8" cy="11.2" r="0.6" fill="rgba(91, 9, 91, 0.9)" />
  </Svg>
);

// ── 4-Dots Loading Indicator (● ● ● ●) ──
const FourDotsLoader = () => {
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;
  const dot4 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const createAnim = (val: Animated.Value) =>
      Animated.sequence([
        Animated.timing(val, {
          toValue: 1,
          duration: 300,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(val, {
          toValue: 0.3,
          duration: 300,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]);

    const loop = Animated.loop(
      Animated.stagger(150, [
        createAnim(dot1),
        createAnim(dot2),
        createAnim(dot3),
        createAnim(dot4),
      ])
    );

    loop.start();
    return () => loop.stop();
  }, [dot1, dot2, dot3, dot4]);

  return (
    <View style={styles.dotsLoaderContainer}>
      <Animated.View
        style={[
          styles.loaderDot,
          {
            opacity: dot1,
            transform: [
              {
                scale: dot1.interpolate({
                  inputRange: [0.3, 1],
                  outputRange: [0.8, 1.25],
                }),
              },
            ],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.loaderDot,
          {
            opacity: dot2,
            transform: [
              {
                scale: dot2.interpolate({
                  inputRange: [0.3, 1],
                  outputRange: [0.8, 1.25],
                }),
              },
            ],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.loaderDot,
          {
            opacity: dot3,
            transform: [
              {
                scale: dot3.interpolate({
                  inputRange: [0.3, 1],
                  outputRange: [0.8, 1.25],
                }),
              },
            ],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.loaderDot,
          {
            opacity: dot4,
            transform: [
              {
                scale: dot4.interpolate({
                  inputRange: [0.3, 1],
                  outputRange: [0.8, 1.25],
                }),
              },
            ],
          },
        ]}
      />
    </View>
  );
};

// ── Dynamic Card Operator Detection ──
export const detectCardOperator = (rawNumber: string): CardOperator => {
  const digits = rawNumber.replace(/\D/g, '');
  if (!digits || digits.length < 2) {
    if (digits === '4') return 'visa';
    return null;
  }

  // 1. Visa: Starts with 4
  if (digits.startsWith('4')) {
    return 'visa';
  }

  // 2. Mastercard: 51-55 or 2221-2720
  if (
    /^5[1-5]/.test(digits) ||
    /^(222[1-9]|22[3-9]\d|2[3-6]\d{2}|27[01]\d|2720)/.test(digits)
  ) {
    return 'mastercard';
  }

  // 3. American Express: Starts with 34 or 37
  if (/^3[47]/.test(digits)) {
    return 'amex';
  }

  // 4. Discover: 6011, 622, 644-649, 65 (except 6500)
  if (/^(6011|622|64[4-9]|65)/.test(digits) && !digits.startsWith('6500')) {
    return 'discover';
  }

  // 5. Verve (Nigeria & African card scheme): 506, 507, 6500, 504, 109
  if (/^(506|507|6500|504|109)/.test(digits)) {
    return 'verve';
  }

  // Default: empty / no icon until a valid recognized operator is inserted
  return null;
};

export const AddCardScreen = ({ navigation }: { navigation?: any }) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const bottomInset = Platform.OS === 'android' ? Math.max(insets.bottom, 56) : Math.max(insets.bottom, 16);

  const [cardNumber, setCardNumber] = useState<string>('109 480 910 567 034 0938');
  const [expiryDate, setExpiryDate] = useState<string>('02 / 2026');
  const [cvv, setCvv] = useState<string>('123');
  const [pin, setPin] = useState<string>('2002');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [errors, setErrors] = useState<{
    cardNumber?: string;
    expiryDate?: string;
    cvv?: string;
    pin?: string;
  }>({});
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

  // Dynamic operator detection based on user input in real time
  const detectedOperator = useMemo(() => {
    return detectCardOperator(cardNumber);
  }, [cardNumber]);

  const handleGoBack = () => {
    if (navigation?.canGoBack && navigation.canGoBack()) {
      navigation.goBack();
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/payment');
    }
  };

  // ── Standard 4-4-4-4 Card Number Formatting (with 4-6-5 for Amex) ──
  const formatCardNumber = (text: string) => {
    const digitsOnly = text.replace(/\D/g, '');

    // American Express (15 digits): 4-6-5 format (#### ###### #####)
    if (digitsOnly.startsWith('34') || digitsOnly.startsWith('37')) {
      const trimmed = digitsOnly.slice(0, 15);
      const part1 = trimmed.slice(0, 4);
      const part2 = trimmed.slice(4, 10);
      const part3 = trimmed.slice(10, 15);
      return [part1, part2, part3].filter(Boolean).join(' ');
    }

    // Standard 16 to 19 digit cards (Visa, Mastercard, Verve, Discover): 4-4-4-4 format
    const trimmed = digitsOnly.slice(0, 19);
    const groups = trimmed.match(/.{1,4}/g);
    if (!groups) return trimmed;
    return groups.join(' ');
  };

  const handleCardNumberChange = (text: string) => {
    if (errors.cardNumber) {
      setErrors((prev) => ({ ...prev, cardNumber: undefined }));
    }
    const formatted = formatCardNumber(text);
    setCardNumber(formatted);
  };

  const handleExpiryChange = (text: string) => {
    if (errors.expiryDate) {
      setErrors((prev) => ({ ...prev, expiryDate: undefined }));
    }
    const digitsOnly = text.replace(/\D/g, '');
    if (digitsOnly.length <= 2) {
      setExpiryDate(digitsOnly);
    } else {
      const month = digitsOnly.slice(0, 2);
      const year = digitsOnly.slice(2, 6);
      setExpiryDate(`${month} / ${year}`);
    }
  };

  const handleCvvChange = (text: string) => {
    if (errors.cvv) {
      setErrors((prev) => ({ ...prev, cvv: undefined }));
    }
    const digitsOnly = text.replace(/\D/g, '').slice(0, 4);
    setCvv(digitsOnly);
  };

  const handlePinChange = (text: string) => {
    if (errors.pin) {
      setErrors((prev) => ({ ...prev, pin: undefined }));
    }
    const digitsOnly = text.replace(/\D/g, '').slice(0, 4);
    setPin(digitsOnly);
  };

  const validateForm = () => {
    const newErrors: typeof errors = {};
    const rawCard = cardNumber.replace(/\s/g, '');

    if (rawCard.length < 13 || !detectedOperator) {
      newErrors.cardNumber = 'Incorrect card number';
    }

    if (!expiryDate || expiryDate.length < 4) {
      newErrors.expiryDate = 'Incorrect Date';
    }

    if (!cvv || cvv.length < 3) {
      newErrors.cvv = 'Incorrect CVV Number';
    }

    if (!pin || pin.length < 4) {
      newErrors.pin = 'Incorrect Pin';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const { confirmBooking } = useBookingContext();

  const handleVerifyCard = () => {
    const isValid = validateForm();
    if (!isValid) return;

    setIsVerifying(true);
    setTimeout(async () => {
      const digits = cardNumber.replace(/\s+/g, '');
      const last4 = digits.slice(-4) || '0938';
      const detected = detectCardOperator(cardNumber);
      const brandName = detected ? detected.charAt(0).toUpperCase() + detected.slice(1) : 'Mastercard';
      const cardDetails = {
        method: 'card' as const,
        methodTitle: 'Card Payment',
        cardBrand: brandName,
        cardLast4: last4,
        transactionRef: `TRX-${Math.floor(10000 + Math.random() * 90000)}`,
      };
      const newAppt = await confirmBooking(cardDetails);
      setIsVerifying(false);
      router.replace({
        pathname: '/booking-success',
        params: { appointmentId: newAppt?.id },
      } as any);
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* ─── Page Header (Figma Specs: 64px, border-bottom) ─── */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleGoBack}
          style={styles.backButton}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ArrowLeft size={24} color="rgba(0, 8, 20, 0.96)" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Card Information</Text>

        <View style={styles.headerPlaceholder} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: (isKeyboardVisible ? 320 : 130) + bottomInset },
          ]}
        >
          {/* Main Card Title (Figma Frame 1000005787 / H2 Med: 20px / 28px, gap 16px) */}
          <View style={styles.frameContainer}>
            <Text style={styles.sectionTitle}>Card Information</Text>

            {/* Form Container (Figma: add card input, padding 8px 0px, gap 40px) */}
            <View style={styles.formContainer}>
              {/* 1. Card Number Field (Figma: height 80px, gap 8px) */}
              <View style={styles.formGroup}>
                <Text style={styles.fieldLabel}>Card number</Text>
                <View style={styles.cardNumberPillBox}>
                  <TextInput
                    style={styles.dmSansInput}
                    placeholder="Enter 13 - 19 card digit number"
                    placeholderTextColor="rgba(96, 96, 102, 0.96)"
                    value={cardNumber}
                    onChangeText={handleCardNumberChange}
                    keyboardType="numeric"
                    maxLength={24}
                    underlineColorAndroid="transparent"
                    selectionColor="rgba(0, 8, 20, 0.96)"
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="off"
                  />
                  {/* Dynamic Operator Brand Icon based on input */}
                  {detectedOperator && (
                    <View style={styles.cardBrandBadge}>
                      {detectedOperator === 'visa' && <VisaLogo />}
                      {detectedOperator === 'mastercard' && <MastercardLogo />}
                      {detectedOperator === 'amex' && <AmexLogo />}
                      {detectedOperator === 'discover' && <DiscoverLogo />}
                      {detectedOperator === 'verve' && (
                        <VerveLogo isSpinning={isVerifying} />
                      )}
                    </View>
                  )}
                </View>
                {errors.cardNumber && (
                  <Text style={styles.errorText}>{errors.cardNumber}</Text>
                )}
              </View>

              {/* 2. Expiration Date & CVV Row (Figma: Frame 1000004546, height 88px, gap 32px) */}
              <View style={styles.twoColumnRow}>
                {/* Expiration date Column (Figma: width 139px, height 88px, centered) */}
                <View style={styles.expiryCol}>
                  <Text style={styles.expiryLabel}>Expiration date</Text>
                  <View style={styles.expiryPillBox}>
                    <TextInput
                      style={styles.expiryTextInput}
                      placeholder="MM / YYYY"
                      placeholderTextColor="rgba(96, 96, 102, 0.96)"
                      value={expiryDate}
                      onChangeText={handleExpiryChange}
                      keyboardType="numeric"
                      maxLength={10}
                      underlineColorAndroid="transparent"
                      selectionColor="rgba(0, 8, 20, 0.96)"
                      autoCapitalize="none"
                      autoCorrect={false}
                      autoComplete="off"
                    />
                  </View>
                  {errors.expiryDate && (
                    <Text style={styles.errorText}>{errors.expiryDate}</Text>
                  )}
                </View>

                {/* CVV Column (Figma: width 172px, height 88px) */}
                <View style={styles.cvvCol}>
                  <View style={styles.cvvHeaderRow}>
                    <Text style={styles.fieldLabelNoMargin}>Cvv</Text>
                    <TouchableOpacity activeOpacity={0.7} style={styles.helpIconBtn}>
                      <HelpCircleIcon />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.cvvPillBox}>
                    <TextInput
                      style={styles.dmSansInput}
                      placeholder="CVV"
                      placeholderTextColor="rgba(96, 96, 102, 0.96)"
                      value={cvv}
                      onChangeText={handleCvvChange}
                      keyboardType="numeric"
                      maxLength={4}
                      secureTextEntry={false}
                      underlineColorAndroid="transparent"
                      selectionColor="rgba(0, 8, 20, 0.96)"
                      autoCapitalize="none"
                      autoCorrect={false}
                      autoComplete="off"
                    />
                  </View>
                  {errors.cvv && (
                    <Text style={styles.errorText}>{errors.cvv}</Text>
                  )}
                </View>
              </View>

              {/* 3. PIN Field (Figma: card pin input field, height 80px, gap 8px) */}
              <View style={styles.formGroup}>
                <Text style={styles.fieldLabel}>PIN</Text>
                <View style={styles.pinPillBox}>
                  <TextInput
                    style={[styles.dmSansInput, { flex: 1 }]}
                    placeholder="Enter PIN"
                    placeholderTextColor="rgba(96, 96, 102, 0.96)"
                    value={pin}
                    onChangeText={handlePinChange}
                    keyboardType="numeric"
                    secureTextEntry={true}
                    maxLength={4}
                    underlineColorAndroid="transparent"
                    selectionColor="rgba(0, 8, 20, 0.96)"
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="off"
                  />
                </View>
                {errors.pin && (
                  <Text style={styles.errorText}>{errors.pin}</Text>
                )}
              </View>
            </View>
          </View>
        </ScrollView>

        {/* ─── Bottom Action Bar with "Verify Card" Button ─── */}
        {!isKeyboardVisible && (
          <View
            style={[
              styles.bottomBar,
              { paddingBottom: bottomInset },
            ]}
          >
            <TouchableOpacity
              style={styles.addCardBtn}
              activeOpacity={0.8}
              onPress={handleVerifyCard}
              disabled={isVerifying}
            >
              <Text style={styles.addCardBtnText}>
                {isVerifying ? 'Verifying...' : 'Verify Card'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ─── Transparent Verifying Overlay (4 Dots Pulse) ─── */}
        {isVerifying && (
          <View style={styles.verifyingOverlay} pointerEvents="none">
            <FourDotsLoader />
          </View>
        )}
      </KeyboardAvoidingView>
      <NativeDockSpacer />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    position: 'relative',
  },

  // ── Header (Figma: height 64px, padding: 8px 16px, borderBottom) ──
  header: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(235, 235, 245, 0.96)',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 17,
    lineHeight: 24,
    letterSpacing: 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
    textAlign: 'center',
  },
  headerPlaceholder: {
    width: 48,
    height: 48,
  },

  // ── Scroll Content ──
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },

  // ── Frame 1000005787 (gap: 16px) ──
  frameContainer: {
    width: '100%',
    gap: 16,
  },
  sectionTitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
  },

  // ── Form Container (Figma: add card input, padding 8px 0px, gap 40px) ──
  formContainer: {
    width: '100%',
    paddingVertical: 8,
    gap: 40,
  },
  formGroup: {
    width: '100%',
    gap: 8,
  },
  fieldLabel: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: Platform.OS === 'ios' ? 0.4 : 0.2,
    color: '#141A33',
    fontWeight: '400',
  },
  fieldLabelNoMargin: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: Platform.OS === 'ios' ? 0.4 : 0.2,
    color: '#141A33',
    fontWeight: '400',
  },
  errorText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.5,
    color: 'rgba(204, 41, 41, 0.9)',
    marginTop: 4,
  },

  // ── 4-Dots Loading Indicator ──
  dotsLoaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    height: 24,
  },
  loaderDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
  },

  // ── Verifying Screen Overlay (Only 4 Dots floating in front) ──
  verifyingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },

  // ── Card Number Pill Box (Figma: height 48px, radius 24px, padding 7px 16px, gap 24px) ──
  cardNumberPillBox: {
    width: '100%',
    height: 48,
    backgroundColor: 'rgba(248, 249, 250, 0.98)',
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 7,
    paddingHorizontal: 16,
    gap: 24,
  },
  cardBrandBadge: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ── DM Sans Input Style (Figma: DM Sans, 16px, 24px line height, letterSpacing 0.4px) ──
  dmSansInput: {
    flex: 1,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: Platform.OS === 'ios' ? 0.4 : 0.2,
    color: '#000000',
    height: 48,
    paddingVertical: 0,
    paddingHorizontal: 0,
    backgroundColor: 'transparent',
    borderWidth: 0,
    ...(Platform.OS === 'web'
      ? ({
          outlineStyle: 'none',
          outlineWidth: 0,
          boxShadow: 'none',
          backgroundColor: 'transparent',
          border: 'none',
          WebkitBoxShadow: '0 0 0 1000px rgba(248, 249, 250, 0.98) inset',
          WebkitTextFillColor: '#000000',
        } as any)
      : {}),
  },

  // ── Two Columns (Figma: Frame 1000004546, gap 32px, height 88px) ──
  twoColumnRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    width: '100%',
    gap: 32,
  },
  expiryCol: {
    width: 139,
    gap: 8,
    alignItems: 'center',
  },
  expiryLabel: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: Platform.OS === 'ios' ? 0.4 : 0.2,
    color: '#141A33',
    fontWeight: '400',
    textAlign: 'center',
    width: 139,
    height: 24,
  },
  expiryPillBox: {
    width: 139,
    height: 48,
    backgroundColor: 'rgba(248, 249, 250, 0.98)',
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
  },
  expiryTextInput: {
    width: '100%',
    height: 48,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: Platform.OS === 'ios' ? 0.4 : 0.2,
    color: 'rgba(96, 96, 102, 0.96)',
    textAlign: 'center',
    paddingVertical: 0,
    paddingHorizontal: 0,
    backgroundColor: 'transparent',
    borderWidth: 0,
    ...(Platform.OS === 'web'
      ? ({
          outlineStyle: 'none',
          outlineWidth: 0,
          boxShadow: 'none',
          backgroundColor: 'transparent',
          border: 'none',
          WebkitBoxShadow: '0 0 0 1000px rgba(248, 249, 250, 0.98) inset',
          WebkitTextFillColor: 'rgba(96, 96, 102, 0.96)',
          textAlign: 'center',
        } as any)
      : {}),
  },

  // ── CVV Column (Figma: width 172px, height 88px, gap 8px) ──
  cvvCol: {
    width: 172,
    gap: 8,
    alignItems: 'flex-start',
  },
  cvvHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: 70,
    height: 24,
  },
  helpIconBtn: {
    width: 32,
    height: 24,
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cvvPillBox: {
    width: 172,
    height: 48,
    backgroundColor: 'rgba(248, 249, 250, 0.98)',
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },

  // ── PIN Pill Box (Figma: height 48px, radius 24px, padding 12px 16px) ──
  pinPillBox: {
    width: '100%',
    height: 48,
    backgroundColor: 'rgba(248, 249, 250, 0.98)',
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  pinDotsIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingLeft: 8,
  },
  pinDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#000814',
  },

  // ── Bottom Action Bar (Figma: height 64px, boxShadow 0px -8px 20px rgba(133, 139, 148, 0.12)) ──
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(235, 235, 245, 0.96)',
    shadowColor: '#858B94',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
  },
  addCardBtn: {
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#858B94',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  addCardBtnText: {
    ...typography.button,
    color: '#FFFFFF',
    textTransform: 'capitalize',
  },
});

export default AddCardScreen;
