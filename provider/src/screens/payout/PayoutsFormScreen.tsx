import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  Modal,
  Animated,
  BackHandler,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useSafeRouter } from '../../utils/safeNavigation';
import Svg, { Path, Rect, Circle } from 'react-native-svg';
import * as ImagePicker from 'expo-image-picker';
import {
  BVN_LENGTH,
  ACCOUNT_NUMBER_LENGTH,
  BankOption,
} from '../../constants/payout.constants';
import { verifyPayout } from '../../constants/payout.mock';
import { useProviderOnboarding } from '../../context/ProviderOnboardingContext';
import { BankSelectionSheet } from '../../components/payout/BankSelectionSheet';
import { NativeDockSpacer } from '../../components/NativeDockSpacer';
import { AnimatedHourglassLoader } from '../../components/ui/AnimatedHourglassLoader';
import { trendApi, getAuthToken } from '../../api/trendApi';

const RED_CROSS_BADGE = require('../../../assets/images/appointments/red_cross_failed_badge.png');

// SVG Icons
function ArrowLeftIcon() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path
        d="M19 12H5M5 12L12 19M5 12L12 5"
        stroke="rgba(0, 8, 20, 0.96)"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function ShieldCheckIcon() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z"
        fill="rgba(12, 121, 12, 0.96)"
        stroke="rgba(12, 121, 12, 0.96)"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M8.5 12L10.5 14L15.5 9"
        stroke="#FFFFFF"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function CameraIcon() {
  return (
    <Svg width={56} height={56} viewBox="0 0 56 56" fill="none">
      <Path
        d="M46.67 43.17H9.33C7.86 43.17 6.67 41.98 6.67 40.51V18.17C6.67 16.7 7.86 15.51 9.33 15.51H16.33L19.83 10.84H36.17L39.67 15.51H46.67C48.14 15.51 49.33 16.7 49.33 18.17V40.51C49.33 41.98 48.14 43.17 46.67 43.17Z"
        stroke="rgba(0, 8, 20, 0.96)"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M28 35C32.4183 35 36 31.4183 36 27C36 22.5817 32.4183 19 28 19C23.5817 19 20 22.5817 20 27C20 31.4183 23.5817 35 28 35Z"
        stroke="rgba(0, 8, 20, 0.96)"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M43.75 21.58H43.77"
        stroke="rgba(0, 8, 20, 0.96)"
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
}

function ChevronDownIcon() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6 9L12 15L18 9"
        stroke="rgba(0, 8, 20, 0.96)"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// ── 1:1 Figma Spec Eye Toggle Icon (Open: oval + pupil circle, Closed: downward arch + 4 downward eyelashes) ──
function EyeToggleIcon({ isVisible }: { isVisible: boolean }) {
  if (isVisible) {
    return (
      <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
        <Path
          d="M2 12C3.6 7.6 7.8 4.5 12 4.5C16.2 4.5 20.4 7.6 22 12C20.4 16.4 16.2 19.5 12 19.5C7.8 19.5 3.6 16.4 2 12Z"
          stroke="rgba(0, 8, 20, 0.96)"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Circle cx="12" cy="12" r="3" stroke="rgba(0, 8, 20, 0.96)" strokeWidth={1.5} />
      </Svg>
    );
  }
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 10.5C5.8 14.5 8.7 16.2 12 16.2C15.3 16.2 18.2 14.5 21 10.5"
        stroke="rgba(0, 8, 20, 0.96)"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      <Path d="M6 13.5L4 16.5" stroke="rgba(0, 8, 20, 0.96)" strokeWidth={1.5} strokeLinecap="round" />
      <Path d="M10 15.5L9 19" stroke="rgba(0, 8, 20, 0.96)" strokeWidth={1.5} strokeLinecap="round" />
      <Path d="M14 15.5L15 19" stroke="rgba(0, 8, 20, 0.96)" strokeWidth={1.5} strokeLinecap="round" />
      <Path d="M18 13.5L20 16.5" stroke="rgba(0, 8, 20, 0.96)" strokeWidth={1.5} strokeLinecap="round" />
    </Svg>
  );
}

function ThreeDotsLoader() {
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const createAnim = (anim: Animated.Value) =>
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0.3,
          duration: 350,
          useNativeDriver: true,
        }),
      ]);

    const loop = Animated.loop(
      Animated.stagger(150, [createAnim(dot1), createAnim(dot2), createAnim(dot3)])
    );
    loop.start();
    return () => loop.stop();
  }, [dot1, dot2, dot3]);

  return (
    <View style={styles.dotsRow}>
      {[dot1, dot2, dot3].map((anim, idx) => (
        <Animated.View
          key={idx}
          style={[
            styles.dot,
            {
              opacity: anim,
              transform: [
                {
                  scale: anim.interpolate({
                    inputRange: [0.3, 1],
                    outputRange: [0.85, 1.2],
                  }),
                },
              ],
            },
          ]}
        />
      ))}
    </View>
  );
}

/**
 * 1:1 Figma Payouts Form Screen
 * Figma Frame measurements:
 * - Page Header: 64px, back button 48x48, title 17px 500, share button opacity: 0 (48x48)
 * - Tag: 358px x 72px, top: 132px (24px below header)
 * - Selfie Box: 326px x 321px, top: 244px (40px below tag), 1px dashed rgba(192, 192, 204, 0.96)
 * - BVN field: 358px x 88px, top: 621px (56px below selfie box)
 * - Account field: 358px x 88px, top: 749px (40px below BVN)
 * - Bank field: 358px x 88px, top: 877px (40px below Account)
 * - Verify Button: 358px x 48px, top: 1045px (80px below Bank)
 */
export const PayoutsFormScreen: React.FC = () => {
  const safeRouter = useSafeRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ fromDeleted?: string; fromOption?: string }>();
  const { ownerProfile, setPayoutMethod, isPayoutDeleted } = useProviderOnboarding();
  const isFromDeletedFlow = params.fromDeleted === 'true' || isPayoutDeleted;
  const cameFromOption = params.fromOption === 'true';

  // Local state only — sensitive data NEVER logs or persists
  const [selfieUri, setSelfieUri] = useState<string | null>(null);
  const [bvn, setBvn] = useState<string>('');
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [selectedBank, setSelectedBank] = useState<BankOption | null>(null);

  // Visibility toggles
  const [isBvnMasked, setIsBvnMasked] = useState<boolean>(true);
  const [isBankSheetOpen, setIsBankSheetOpen] = useState<boolean>(false);

  // Errors state
  const [errors, setErrors] = useState<{
    selfie?: string;
    bvn?: string;
    accountNumber?: string;
    bank?: string;
  }>({});

  // Loading state
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [isFailedModalOpen, setIsFailedModalOpen] = useState<boolean>(false);
  const [hasErrorsBeenReceived, setHasErrorsBeenReceived] = useState<boolean>(false);

  // Resolved dummy account holder name
  const dummyAccountName =
    ownerProfile?.fullName && ownerProfile.fullName.trim().length > 0
      ? ownerProfile.fullName.trim()
      : 'Emmanuel Obinna';

  const isAccountNumberValid =
    accountNumber.trim().length === ACCOUNT_NUMBER_LENGTH &&
    accountNumber.trim() !== '0000000000';

  // Cleanup on unmount for security
  useEffect(() => {
    return () => {
      setSelfieUri(null);
      setBvn('');
      setAccountNumber('');
    };
  }, []);

  // Form validity check
  const isFormFilled =
    selfieUri !== null &&
    bvn.trim().length === BVN_LENGTH &&
    accountNumber.trim().length === ACCOUNT_NUMBER_LENGTH &&
    selectedBank !== null;

  // Verify button is enabled only when filled AND no unresolved error locks it
  const isVerifyEnabled = isFormFilled && !hasErrorsBeenReceived;

  // Front camera selfie capture with web and fallback support
  const handleTakeSelfie = async () => {
    try {
      if (Platform.OS === 'web') {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
          setSelfieUri(result.assets[0].uri);
          if (errors.selfie) {
            setErrors((prev) => ({ ...prev, selfie: undefined }));
            setHasErrorsBeenReceived(false);
          }
        }
        return;
      }

      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        const fallback = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
        if (!fallback.canceled && fallback.assets && fallback.assets.length > 0) {
          setSelfieUri(fallback.assets[0].uri);
          if (errors.selfie) {
            setErrors((prev) => ({ ...prev, selfie: undefined }));
            setHasErrorsBeenReceived(false);
          }
        }
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        cameraType: ImagePicker.CameraType.front,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelfieUri(result.assets[0].uri);
        if (errors.selfie) {
          setErrors((prev) => ({ ...prev, selfie: undefined }));
          setHasErrorsBeenReceived(false);
        }
      }
    } catch {
      try {
        const fallback = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
        if (!fallback.canceled && fallback.assets && fallback.assets.length > 0) {
          setSelfieUri(fallback.assets[0].uri);
          if (errors.selfie) {
            setErrors((prev) => ({ ...prev, selfie: undefined }));
            setHasErrorsBeenReceived(false);
          }
        }
      } catch {
        // Handle error without crashing
      }
    }
  };

  const handleBvnChange = (val: string) => {
    const digits = val.replace(/[^0-9]/g, '').slice(0, BVN_LENGTH);
    setBvn(digits);
    if (errors.bvn) {
      setErrors((prev) => ({ ...prev, bvn: undefined }));
    }
    setHasErrorsBeenReceived(false);
  };

  const handleAccountNumberChange = (val: string) => {
    const digits = val.replace(/[^0-9]/g, '').slice(0, ACCOUNT_NUMBER_LENGTH);
    setAccountNumber(digits);
    if (errors.accountNumber) {
      setErrors((prev) => ({ ...prev, accountNumber: undefined }));
    }
    setHasErrorsBeenReceived(false);
  };

  const handleSelectBank = (bank: BankOption) => {
    setSelectedBank(bank);
    if (errors.bank) {
      setErrors((prev) => ({ ...prev, bank: undefined }));
    }
    setHasErrorsBeenReceived(false);
  };

  const handleVerifyPress = async () => {
    if (!isVerifyEnabled) return;

    setIsVerifying(true);

    try {
      const result = await verifyPayout({
        selfieUri,
        bvn,
        accountNumber,
        bankId: selectedBank?.id || '',
        ownerName: ownerProfile.fullName,
      });

      setIsVerifying(false);

      if (result.success) {
        // Clear sensitive credentials immediately
        setBvn('');
        setSelfieUri(null);

        // Keep ONLY what Payout Method screen needs: bank, account number, account name
        const bankNameVal = selectedBank?.name || 'Zenith Bank';
        const accountNameVal = result.accountName || ownerProfile.fullName || 'Emmanuel Obinna';
        setPayoutMethod({
          bankName: bankNameVal,
          bankId: selectedBank?.id || 'zenith',
          accountNumber,
          accountName: accountNameVal,
          bankLogo: selectedBank?.logo,
          verified: true,
        });

        try {
          const token = await getAuthToken('business');
          if (token) {
            await trendApi.business.updatePayout({
              bank_name: bankNameVal,
              account_number: accountNumber,
              account_name: accountNameVal,
            });
          }
        } catch {
          // Non-fatal backend sync fallback
        }

        // Navigate cleanly to success screen
        safeRouter.replace('/payout-success' as any);
      } else {
        setErrors(result.errors || {});
        setHasErrorsBeenReceived(true);
        setIsFailedModalOpen(true);
      }
    } catch {
      setIsVerifying(false);
      setErrors({
        accountNumber: 'Verification failed, please try again.',
      });
      setHasErrorsBeenReceived(true);
      setIsFailedModalOpen(true);
    }
  };

  const handleBackPress = useCallback(() => {
    if (isVerifying) return;
    if (isFromDeletedFlow) {
      if (cameFromOption && safeRouter.canGoBack()) {
        safeRouter.back();
      } else {
        safeRouter.replace('/payout-option' as any);
      }
      return;
    }
    if (safeRouter.canGoBack()) {
      safeRouter.back();
    } else {
      safeRouter.replace('/payout-option' as any);
    }
  }, [isVerifying, isFromDeletedFlow, cameFromOption, safeRouter]);

  useFocusEffect(
    useCallback(() => {
      if (Platform.OS !== 'android' || !isFromDeletedFlow) return undefined;
      const onBackPress = () => {
        if (isFailedModalOpen) {
          setIsFailedModalOpen(false);
          return true;
        }
        handleBackPress();
        return true;
      };
      const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => sub.remove();
    }, [isFromDeletedFlow, isFailedModalOpen, handleBackPress])
  );

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      {/* ── Fixed Page Header (64px, padding: 8px 16px) ── */}
      <View style={styles.pageHeader}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.headerBackButton}
            activeOpacity={0.7}
            onPress={handleBackPress}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <ArrowLeftIcon />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Payout Wallet</Text>

          {/* Invisible spacer balancing the 48px back button so title is perfectly centered */}
          <View style={styles.headerRightSpacer} />
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.flexOne}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(insets.bottom + 48, 64) },
          ]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
          {/* ── InfoBanner Tag (358px wide x 72px high, green tint #EEF8EE 0.8, top: 132px, 24px below header) ── */}
          <View style={styles.infoBanner}>
            <View style={styles.infoBannerIconCircle}>
              <ShieldCheckIcon />
            </View>
            <Text style={styles.infoBannerText}>
              Your information is protected and private. Not even Trend can access it.
            </Text>
          </View>

          {/* ── Selfie Box (326px x 321px, radius: 24px, 40px below Tag, 1px dashed rgba(192, 192, 204, 0.96)) ── */}
          <View style={styles.selfieSection}>
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.selfieBox}
              onPress={handleTakeSelfie}
            >
              {/* 1:1 SVG Dashed Border (Guaranteed 100% precision on iOS, Android & Web) */}
              <Svg
                style={StyleSheet.absoluteFill}
                width={326}
                height={321}
                pointerEvents="none"
              >
                <Rect
                  x={0.5}
                  y={0.5}
                  width={325}
                  height={320}
                  rx={24}
                  stroke={errors.selfie ? '#CC2929' : 'rgba(192, 192, 204, 0.96)'}
                  strokeWidth={1}
                  strokeDasharray="6 6"
                  fill="transparent"
                />
              </Svg>

              {selfieUri ? (
                <View style={styles.selfieImageContainer}>
                  <Image
                    source={{ uri: selfieUri }}
                    style={styles.selfieImage}
                    resizeMode="cover"
                  />
                  {/* Camera icon centered on top of preview per Figma spec */}
                  <View style={styles.selfieCameraOverlay}>
                    <CameraIcon />
                  </View>
                </View>
              ) : (
                <View style={styles.selfiePromptContainer}>
                  <CameraIcon />
                  <Text style={styles.selfiePromptText}>Tap here, to take selfie</Text>
                </View>
              )}
            </TouchableOpacity>

            {errors.selfie && (
              <Text style={styles.selfieErrorText}>{errors.selfie}</Text>
            )}
          </View>

          {/* ── Field 1: Enter Bank Verification Number (BVN) (358px x 88px, 56px below Selfie Box) ── */}
          <View style={styles.fieldContainerBVN}>
            <Text style={styles.fieldLabel}>
              Enter Bank Verification Number (BVN)
            </Text>
            <View
              style={[
                styles.inputFieldBox,
                errors.bvn ? styles.inputFieldBoxError : null,
              ]}
            >
              <TextInput
                style={styles.inputFieldText}
                placeholder="* * * * * * * *"
                placeholderTextColor="rgba(192, 192, 204, 0.96)"
                value={bvn}
                onChangeText={handleBvnChange}
                keyboardType="numeric"
                secureTextEntry={isBvnMasked}
                maxLength={BVN_LENGTH}
                autoCapitalize="none"
              />
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setIsBvnMasked(!isBvnMasked)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <EyeToggleIcon isVisible={!isBvnMasked} />
              </TouchableOpacity>
            </View>
            {errors.bvn && <Text style={styles.fieldErrorText}>{errors.bvn}</Text>}
          </View>

          {/* ── Field 2: Enter Account Number (358px x 88px, 40px below BVN) ── */}
          <View style={styles.fieldContainerAccount}>
            <Text style={styles.fieldLabel}>Enter Account Number</Text>
            <View
              style={[
                styles.inputFieldBox,
                errors.accountNumber ? styles.inputFieldBoxError : null,
              ]}
            >
              <TextInput
                style={styles.inputFieldText}
                placeholder="000-000-000-000-000"
                placeholderTextColor="rgba(192, 192, 204, 0.96)"
                value={accountNumber}
                onChangeText={handleAccountNumberChange}
                keyboardType="numeric"
                maxLength={ACCOUNT_NUMBER_LENGTH}
                autoCapitalize="none"
              />
              {isAccountNumberValid && !errors.accountNumber && (
                <View style={styles.validCheckBadge}>
                  <Svg width={12} height={10} viewBox="0 0 12 10" fill="none">
                    <Path
                      d="M1.5 5.2L4.2 8L10.5 1.8"
                      stroke="#FFFFFF"
                      strokeWidth={1.8}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                </View>
              )}
            </View>
            {errors.accountNumber ? (
              <Text style={styles.fieldErrorText}>{errors.accountNumber}</Text>
            ) : isAccountNumberValid ? (
              <View style={styles.accountHolderRow}>
                <View style={styles.accountHolderIconBadge}>
                  <Svg width={10} height={8} viewBox="0 0 12 10" fill="none">
                    <Path
                      d="M1.5 5.2L4.2 8L10.5 1.8"
                      stroke="#FFFFFF"
                      strokeWidth={1.8}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                </View>
                <Text style={styles.accountHolderText}>{dummyAccountName}</Text>
              </View>
            ) : null}
          </View>

          {/* ── Field 3: Enter Your Bank (358px x 88px, 40px below Account) ── */}
          <View style={styles.fieldContainerBank}>
            <Text style={styles.fieldLabelBank}>Enter Your Bank</Text>
            <TouchableOpacity
              activeOpacity={0.8}
              style={[
                styles.inputFieldBox,
                errors.bank ? styles.inputFieldBoxError : null,
              ]}
              onPress={() => setIsBankSheetOpen(true)}
            >
              {selectedBank ? (
                <View style={styles.bankFieldContent}>
                  <Image
                    source={selectedBank.logo}
                    style={styles.bankFieldLogo}
                    resizeMode="contain"
                  />
                  <Text style={styles.bankFieldText}>{selectedBank.name}</Text>
                </View>
              ) : (
                <Text style={styles.inputPlaceholderText}>Zenith Bank</Text>
              )}
              <ChevronDownIcon />
            </TouchableOpacity>
            {errors.bank && <Text style={styles.fieldErrorText}>{errors.bank}</Text>}
          </View>

          {/* ── Action Button: Verify (358px x 48px, radius: 24px, 80px below Bank) ── */}
          <TouchableOpacity
            activeOpacity={isVerifyEnabled ? 0.85 : 1}
            disabled={!isVerifyEnabled}
            style={[
              styles.verifyButton,
              isVerifyEnabled ? styles.verifyButtonEnabled : styles.verifyButtonDisabled,
            ]}
            onPress={handleVerifyPress}
          >
            <Text
              style={[
                styles.verifyButtonText,
                isVerifyEnabled ? styles.verifyTextEnabled : styles.verifyTextDisabled,
              ]}
            >
              Verify
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ── Bank Selection Sheet (390px x 467px) ── */}
      <BankSelectionSheet
        visible={isBankSheetOpen}
        selectedBankId={selectedBank?.id}
        onSelectBank={handleSelectBank}
        onClose={() => setIsBankSheetOpen(false)}
      />

      {/* ── Verifying / Failed Modal Overlay (Figma 1:1) ── */}
      <Modal
        visible={isVerifying || isFailedModalOpen}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => {
          if (isFailedModalOpen) setIsFailedModalOpen(false);
        }}
      >
        <View style={styles.modalBackdrop}>
          {isVerifying ? (
            <View style={styles.verifyingPopupCard}>
              <AnimatedHourglassLoader
                width={88}
                height={100}
                style={styles.popupIllustration}
              />
              <Text style={styles.popupTitle}>Verifying account</Text>
              <Text style={styles.popupSubtitle}>
                We&apos;re verifying your bank details. This wont take long, please hang tight!
              </Text>
              <View style={styles.popupLoaderWrap}>
                <ThreeDotsLoader />
              </View>
            </View>
          ) : (
            <View style={styles.failedPopupCard}>
              <View style={styles.failedIconWrap}>
                <Image
                  source={RED_CROSS_BADGE}
                  style={styles.failedBadgeImage}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.popupTitle}>Verification failed</Text>
              <Text style={styles.popupSubtitle}>
                We couldn&apos;t verify your account details. Please check your bank information and try again.
              </Text>
              <TouchableOpacity
                style={styles.tryAgainButton}
                activeOpacity={0.85}
                onPress={() => setIsFailedModalOpen(false)}
              >
                <Text style={styles.tryAgainButtonText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>

      {/* Android System Navigation Dock Barrier */}
      <NativeDockSpacer backgroundColor="#FFFFFF" minHeight={56} />
    </SafeAreaView>
  );
};

export default PayoutsFormScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  flexOne: {
    flex: 1,
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
    maxWidth: 358,
    height: 48,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerBackButton: {
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
    color: 'rgba(0, 8, 20, 0.96)',
    lineHeight: 24,
    letterSpacing: 0.2,
    includeFontPadding: false,
  },
  headerRightSpacer: {
    width: 48,
    height: 48,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  infoBanner: {
    width: 358,
    height: 72,
    marginTop: 24,
    backgroundColor: 'rgba(238, 248, 238, 0.8)',
    borderRadius: 24,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  infoBannerIconCircle: {
    width: 40,
    height: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoBannerText: {
    width: 270,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    color: 'rgba(12, 121, 12, 0.96)',
    lineHeight: 20,
    letterSpacing: 0.4,
    includeFontPadding: false,
  },
  selfieSection: {
    width: '100%',
    alignItems: 'center',
    marginTop: 40,
  },
  selfieBox: {
    width: 326,
    height: 321,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  selfiePromptContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  selfiePromptText: {
    width: 181,
    height: 24,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    color: 'rgba(96, 96, 102, 0.96)',
    lineHeight: 24,
    letterSpacing: 0.4,
    textAlign: 'center',
    includeFontPadding: false,
  },
  selfieImageContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  selfieImage: {
    width: '100%',
    height: '100%',
  },
  selfieCameraOverlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
  },
  selfieErrorText: {
    width: 326,
    marginTop: 8,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    color: '#CC2929',
    lineHeight: 20,
    textAlign: 'center',
    includeFontPadding: false,
  },
  fieldContainerBVN: {
    width: 358,
    marginTop: 56,
    gap: 16,
  },
  fieldContainerAccount: {
    width: 358,
    marginTop: 40,
    gap: 16,
  },
  fieldContainerBank: {
    width: 358,
    marginTop: 40,
    gap: 16,
  },
  fieldLabel: {
    width: 358,
    height: 24,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 16,
    color: 'rgba(0, 8, 20, 0.96)',
    lineHeight: 24,
    letterSpacing: 0.5,
    includeFontPadding: false,
  },
  fieldLabelBank: {
    width: 358,
    height: 24,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 16,
    color: '#000000',
    lineHeight: 24,
    letterSpacing: 0.5,
    includeFontPadding: false,
  },
  inputFieldBox: {
    width: 358,
    height: 48,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  inputFieldBoxError: {
    borderColor: '#CC2929',
  },
  inputFieldText: {
    flex: 1,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    color: '#000000',
    lineHeight: 20,
    letterSpacing: 0.4,
    paddingVertical: 0,
  },
  inputPlaceholderText: {
    width: 94,
    height: 24,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    color: 'rgba(192, 192, 204, 0.96)',
    lineHeight: 24,
    letterSpacing: 0.4,
    includeFontPadding: false,
  },
  fieldErrorText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    color: '#CC2929',
    lineHeight: 20,
    includeFontPadding: false,
  },
  validCheckBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(12, 121, 12, 0.96)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountHolderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  accountHolderIconBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(12, 121, 12, 0.96)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountHolderText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 14,
    color: 'rgba(12, 121, 12, 0.96)',
    lineHeight: 20,
    letterSpacing: 0.2,
    includeFontPadding: false,
  },
  bankFieldContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bankFieldLogo: {
    width: 32,
    height: 24,
  },
  bankFieldText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    color: '#141A33',
    lineHeight: 24,
    letterSpacing: 0.4,
    includeFontPadding: false,
  },
  verifyButton: {
    width: 358,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 80,
    padding: 16,
    gap: 10,
  },
  verifyButtonDisabled: {
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
  },
  verifyButtonEnabled: {
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
  },
  verifyButtonText: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
    includeFontPadding: false,
  },
  verifyTextDisabled: {
    color: 'rgba(192, 192, 204, 0.96)',
  },
  verifyTextEnabled: {
    color: '#FFFFFF',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(65, 63, 63, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  verifyingPopupCard: {
    width: 326,
    minHeight: 329,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingTop: 32,
    paddingBottom: 28,
    paddingHorizontal: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  },
  failedPopupCard: {
    width: 326,
    minHeight: 377,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingTop: 32,
    paddingBottom: 28,
    paddingHorizontal: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  },
  popupIllustration: {
    marginBottom: 8,
  },
  failedIconWrap: {
    width: 88,
    height: 88,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  failedBadgeImage: {
    width: 88,
    height: 88,
  },
  popupTitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
    textAlign: 'center',
    marginTop: 18,
    includeFontPadding: false,
  },
  popupSubtitle: {
    width: 281,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    textAlign: 'center',
    marginTop: 8,
    includeFontPadding: false,
  },
  popupLoaderWrap: {
    marginTop: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
  },
  tryAgainButton: {
    width: 242,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 28,
  },
  tryAgainButtonText: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
    color: '#FFFFFF',
    includeFontPadding: false,
  },
});
