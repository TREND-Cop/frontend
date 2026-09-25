import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Animated,
  Image,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Copy, Check } from 'lucide-react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { bookingStore } from '../../utils/bookingStore';
import { useBookingContext } from '../../store/BookingContext';
import { typography } from '../../constants/theme';
import { NativeDockSpacer } from '../../components/ui/NativeDockSpacer';

// ── Zenith Bank Logo matching Figma ──
const ZenithBankLogo = () => (
  <Image
    source={require('../../../assets/images/zenith_bank.png')}
    style={styles.zenithLogo}
    resizeMode="contain"
  />
);

// ── Green Checkmark Circle Badge (Figma: checkmark-circle-02) ──
const GreenCheckmarkBadge = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" fill="rgba(12, 121, 12, 0.96)" />
    <Path
      d="M8 12.5L10.5 15L16 9.5"
      stroke="#FFFFFF"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// ── Red Alert Exclamation Icon (Figma: alert-circle) ──
const RedAlertCircleIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" fill="rgba(204, 41, 41, 0.9)" />
    <Path
      d="M12 7.5V13M12 16.5H12.01"
      stroke="#FFFFFF"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </Svg>
);

// ── Orange Warning Alert Icon (Figma: Transaction Error) ──
const OrangeAlertCircleIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" fill="#F5950F" />
    <Path
      d="M12 7.5V13M12 16.5H12.01"
      stroke="#FFFFFF"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </Svg>
);

// ── 4-Dots Loading Indicator (● ● ● ●) Identical to Card Payment ──
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

export type TransactionStatus = 'idle' | 'verifying' | 'incomplete' | 'error' | 'success';

export const BankTransferScreen = ({ navigation }: { navigation?: any }) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const bottomInset = Platform.OS === 'android' ? Math.max(insets.bottom, 56) : Math.max(insets.bottom, 16);
  const params = useLocalSearchParams<{ state?: TransactionStatus }>();

  const [copied, setCopied] = useState<boolean>(false);
  const [transactionState, setTransactionState] = useState<TransactionStatus>(
    params.state || 'idle'
  );

  // Dynamic booking state from bookingStore
  const finalTotal = bookingStore.getFinalTotal(
    bookingStore.getCouponApplied(),
    bookingStore.getUsePoints(),
    'bank_transfer'
  );

  const accountNumber = '1234567890';
  const accountName = 'TREND SECURE';
  const bankName = 'Zenith Bank';

  const handleGoBack = () => {
    if (navigation?.canGoBack && navigation.canGoBack()) {
      navigation.goBack();
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/payment');
    }
  };

  const handleCopy = () => {
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(accountNumber);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const { confirmBooking } = useBookingContext();

  // Full Verification Flow (idle -> verifying with 4-dots -> success banner with 4-dots continuing -> congratulation screen)
  const handleMakePayment = () => {
    if (transactionState === 'verifying' || transactionState === 'success') return;

    setTransactionState('verifying');

    // 1. Initial verification loading period
    setTimeout(() => {
      // 2. Transaction successful banner appears, while 4-dots loading indicator continues loading
      setTransactionState('success');

      // 3. Continue loading, then smoothly enter the Congratulations page
      setTimeout(async () => {
        const transferDetails = {
          method: 'bank_transfer' as const,
          methodTitle: 'Inter-Bank Transfer',
          accountName: accountName,
          accountNumber: accountNumber,
          bankName: bankName,
        };
        const newAppt = await confirmBooking(transferDetails);
        router.push({
          pathname: '/booking-success',
          params: { appointmentId: newAppt?.id },
        });
      }, 1500);
    }, 1600);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* ── Header (Figma: height 64px, borderBottom) ── */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleGoBack}
          style={styles.backButton}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ArrowLeft size={24} color="rgba(0, 8, 20, 0.96)" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Inter-Bank Transfer</Text>

        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 130 + bottomInset },
        ]}
      >
        {/* ── State 1: Incomplete Transaction Amount Banner (Figma Screen 2) ── */}
        {transactionState === 'incomplete' && (
          <View style={styles.incompleteBanner}>
            <RedAlertCircleIcon />
            <View style={styles.bannerTextCol}>
              <Text style={styles.bannerTitle}>Incomplete Transaction Amount</Text>
              <Text style={styles.bannerSubtitle}>
                Incorrect payment amount, You will be refunded shortly.
              </Text>
            </View>
          </View>
        )}

        {/* ── State 2: Transaction Error / Network Denied Banner (Figma Screen 3) ── */}
        {transactionState === 'error' && (
          <View style={styles.errorBanner}>
            <OrangeAlertCircleIcon />
            <View style={styles.bannerTextCol}>
              <Text style={styles.bannerTitle}>
                Error Kindly Check Network or Bank Service
              </Text>
              <Text style={styles.bannerSubtitle}>Transaction Denied</Text>
            </View>
          </View>
        )}

        {/* ── State 3: Transaction Successful Banner (Figma Screen 4) ── */}
        {transactionState === 'success' && (
          <View style={styles.successBanner}>
            <GreenCheckmarkBadge />
            <View style={styles.bannerTextCol}>
              <Text style={styles.bannerTitle}>Transaction Successful</Text>
              <Text style={styles.bannerSubtitle}>Booking Successful</Text>
            </View>
          </View>
        )}

        {/* ── Payment Information Field (Figma: border 1px dashed, radius 24px, gap 16px) ── */}
        <View style={styles.dashedCard}>
          {/* 1. Amount Row */}
          <View style={styles.infoGroup}>
            <Text style={styles.infoLabel}>Amount</Text>
            <Text style={styles.amountValue}>
              ₦{finalTotal.toLocaleString()}
            </Text>
          </View>

          <View style={styles.divider} />

          {/* 2. Bank Row */}
          <View style={styles.infoGroup}>
            <Text style={styles.infoLabel}>Bank</Text>
            <View style={styles.bankBrandRow}>
              <ZenithBankLogo />
              <Text style={styles.bankNameText}>{bankName}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* 3. Account Name Row */}
          <View style={styles.infoGroup}>
            <Text style={styles.infoLabel}>Account Name</Text>
            <Text style={styles.accountNameText}>{accountName}</Text>
          </View>

          <View style={styles.divider} />

          {/* 4. Account Number & Copy Button Row */}
          <View style={styles.accountNumberRow}>
            <View style={styles.infoGroupNoFlex}>
              <Text style={styles.infoLabel}>Account Number</Text>
              <Text style={styles.accountNumberText}>{accountNumber}</Text>
            </View>

            <TouchableOpacity
              style={styles.copyButton}
              activeOpacity={0.7}
              onPress={handleCopy}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              {copied ? (
                <Check size={22} color="rgba(12, 121, 12, 0.96)" />
              ) : (
                <Copy size={22} color="#141B34" />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {copied && (
          <View style={styles.toastContainer}>
            <Text style={styles.toastText}>Account number copied to clipboard!</Text>
          </View>
        )}
      </ScrollView>

      {/* ── Bottom Action Button (Figma: height 48px, radius 24px) ── */}
      <View
        style={[
          styles.bottomBar,
          { paddingBottom: bottomInset },
        ]}
      >
        <TouchableOpacity
          style={styles.actionBtn}
          activeOpacity={0.85}
          onPress={handleMakePayment}
          disabled={transactionState === 'verifying' || transactionState === 'success'}
        >
          <GreenCheckmarkBadge />
          <Text style={styles.actionBtnText}>
            {transactionState === 'verifying' || transactionState === 'success'
              ? 'Verifying Payment...'
              : 'I Have Made Payment'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── Transparent Verifying Overlay (4 Dots floating in front) ── */}
      {(transactionState === 'verifying' || transactionState === 'success') && (
        <View style={styles.verifyingOverlay} pointerEvents="none">
          <FourDotsLoader />
        </View>
      )}
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

  // ── Header (Figma: height 64px, padding 8px 16px, borderBottom) ──
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

  // ── State Banners (Figma: radius 24px, minHeight 88px, padding 12px 16px, gap 16px) ──
  incompleteBanner: {
    width: '100%',
    minHeight: 88,
    backgroundColor: 'rgba(250, 237, 237, 0.96)',
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 16,
    marginBottom: 24,
  },
  errorBanner: {
    width: '100%',
    minHeight: 88,
    backgroundColor: 'rgba(254, 246, 235, 0.96)',
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 16,
    marginBottom: 24,
  },
  successBanner: {
    width: '100%',
    minHeight: 88,
    backgroundColor: 'rgba(235, 247, 237, 0.96)',
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 16,
    marginBottom: 24,
  },
  bannerTextCol: {
    flex: 1,
    gap: 4,
  },
  bannerTitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_600SemiBold',
    fontWeight: '600',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.2,
    color: '#000000',
  },
  bannerSubtitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.5,
    color: 'rgba(0, 8, 20, 0.96)',
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

  // ── Dashed Container (Figma: border 1px dashed, radius 24px, padding 16px, gap 16px) ──
  dashedCard: {
    width: '100%',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(192, 192, 204, 0.96)',
    borderRadius: 24,
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 16,
    backgroundColor: '#FFFFFF',
  },

  infoGroup: {
    width: '100%',
    gap: 8,
  },
  infoGroupNoFlex: {
    gap: 8,
  },
  infoLabel: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: Platform.OS === 'ios' ? 0.4 : 0.2,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  amountValue: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_600SemiBold',
    fontWeight: '600',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: Platform.OS === 'ios' ? 0.6 : 0.5,
    color: 'rgba(0, 8, 20, 0.96)',
  },

  // ── Bank Row ──
  zenithLogo: {
    width: 36,
    height: 30,
  },
  bankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  bankBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  bankNameText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: Platform.OS === 'ios' ? 0.4 : 0.2,
    color: '#141A33',
  },

  // ── Account Name ──
  accountNameText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: Platform.OS === 'ios' ? 0.4 : 0.2,
    color: '#000000',
  },

  // ── Account Number & Copy Row ──
  accountNumberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  accountNumberText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_600SemiBold',
    fontWeight: '600',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: Platform.OS === 'ios' ? 0.6 : 0.5,
    color: '#000000',
  },
  copyButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ── Divider ──
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(235, 235, 245, 0.96)',
  },

  // ── Toast Notification ──
  toastContainer: {
    marginTop: 16,
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 8, 20, 0.85)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  toastText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 13,
    letterSpacing: 0.5,
    color: '#FFFFFF',
  },

  // ── Bottom Action Bar ──
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  actionBtn: {
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#858B94',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  actionBtnText: {
    ...typography.button,
    color: '#FFFFFF',
    textTransform: 'capitalize',
  },
});

export default BankTransferScreen;
