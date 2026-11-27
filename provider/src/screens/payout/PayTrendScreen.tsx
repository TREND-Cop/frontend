/**
 * PayTrendScreen — 1:1 Figma Inter-Bank Payment Flow for Provider Platform
 * Figma Frame: /* Pay Trend * / (4-screen connected flow)
 *
 * Exact Converter Measurements:
 * 1. Idle (inter - bank transaction):
 *    - Header: 64px, back button 48x48, centered "Pay Trend" (17px 500, letterSpacing 0.2px)
 *    - Instruction: top 132px (24px below header), 358px, 16px Regular, rgba(96, 96, 102, 0.96)
 *    - Payment Card: top 260px (56px below instruction), 358px, padding 16px, gap 24px,
 *      bg rgba(247, 247, 247, 0.96), 1px dashed rgba(192, 192, 204, 0.96), radius 24px
 *    - Action Button: top 664px, 358x48px, radius 24px, rgba(0, 8, 20, 0.96), green checkmark + "I have made payment"
 * 2. Verifying Modal (pop up loader):
 *    - Backdrop: rgba(65, 63, 63, 0.1)
 *    - Card: 326x329px, radius 24px, #FFFFFF, hourglass 88x100px, "Verifying payment" (16px 500), subtitle (14px 400)
 * 3. Failed Modal (pop up loader):
 *    - Card: 326x377px, radius 24px, #FFFFFF, red X circle 88x88px, "Transaction failed" (16px 500),
 *      subtitle (14px 400), "Try Again" button (242x48px, radius 24px)
 * 4. Success Screen (booking successful screen):
 *    - Confetti 466x308px + Glossy Green Badge 150x150px
 *    - "Payment successful" (20px 500) + "Your transaction to trend was successful, you may continue using trend." (16px 400)
 *    - "Back to Dashboard" button (358x48px, radius 24px)
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Modal,
  Platform,
  Animated,
  useWindowDimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { useSafeRouter } from '../../utils/safeNavigation';
import { NativeDockSpacer } from '../../components/NativeDockSpacer';
import { AnimatedHourglassLoader } from '../../components/ui/AnimatedHourglassLoader';
import { trendApi, getAuthToken } from '../../api/trendApi';

const ZENITH_LOGO = require('../../../assets/images/payout/zenith_bank_logo.png');
const SUCCESS_BADGE = require('../../../assets/images/appointments/glossy_green_success_badge.png');
const CONFETTI_IMAGE = require('../../../assets/images/appointments/booking_success_confetti.png');
const RED_CROSS_BADGE = require('../../../assets/images/appointments/red_cross_failed_badge.png');

const FONT_HEADER = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium';
const FONT_MEDIUM = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium';
const FONT_REGULAR = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular';
const FONT_BUTTON = Platform.OS === 'ios' ? 'Inter' : 'Inter_500Medium';

type PayTrendState = 'idle' | 'verifying' | 'failed' | 'success';

function ArrowLeftIcon({ size = 24, color = 'rgba(0, 8, 20, 0.96)' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M19 12H5M11 6l-6 6 6 6"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function CopyIcon({ size = 24, color = '#141B34' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect
        x="9"
        y="9"
        width="13"
        height="13"
        rx="3"
        stroke={color}
        strokeWidth="1.5"
      />
      <Path
        d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </Svg>
  );
}

function GreenCheckmarkCircle({ size = 24 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
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
}

function RedCrossBadge({ size = 88 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 88 88" fill="none">
      <Circle cx="44" cy="44" r="40" fill="#FFF2F2" stroke="#E02D2D" strokeWidth="5" />
      <Path
        d="M32 32L56 56M56 32L32 56"
        stroke="#E02D2D"
        strokeWidth="6.5"
        strokeLinecap="round"
      />
    </Svg>
  );
}

// ── 1:1 Figma Spec Eye Toggle Icon (Open: oval + pupil circle, Closed: downward arch + 4 lashes) ──
function EyeToggleIcon({ isVisible, size = 24 }: { isVisible: boolean; size?: number }) {
  if (isVisible) {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
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
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
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

export const PayTrendScreen: React.FC = () => {
  const safeRouter = useSafeRouter();
  const params = useLocalSearchParams<{ simulateFail?: string; amount?: string }>();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  const [txState, setTxState] = useState<PayTrendState>('idle');
  const [copied, setCopied] = useState(false);
  const [showAmount, setShowAmount] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [displayAmount, setDisplayAmount] = useState(
    params.amount
      ? params.amount.startsWith('₦')
        ? params.amount
        : `₦${params.amount}`
      : '₦14,200'
  );
  const [accountName, setAccountName] = useState('TREND SECURE');
  const [accountNumber, setAccountNumber] = useState('1234567890');
  const [bankName, setBankName] = useState('Zenith Bank');

  useEffect(() => {
    let active = true;
    trendApi.payments
      .getBankDetails()
      .then((res) => {
        if (!active || !res.ok || !res.data) return;
        const { account_number, account_name, bank_name } = res.data;
        if (account_number && account_number !== '0000000000') {
          setAccountNumber(account_number);
        }
        if (account_name && account_name !== 'Trend Ltd') {
          setAccountName(account_name);
        }
        if (bank_name && bank_name !== 'Your Bank') {
          setBankName(bank_name);
        }
      })
      .catch(() => {});

    if (!params.amount) {
      getAuthToken('business')
        .then((token) => (token ? trendApi.business.getBalance() : null))
        .then((res) => {
          if (!active || !res || !res.ok || !res.data) return;
          const owed = Number(
            res.data.outstanding ?? res.data.owed ?? res.data.balance ?? res.data.amount_owed ?? 0
          );
          if (Number.isFinite(owed) && owed > 0) {
            setDisplayAmount(`₦${owed.toLocaleString()}`);
          }
        })
        .catch(() => {});
    }

    return () => {
      active = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [params.amount]);

  const handleBack = () => {
    if (safeRouter.canGoBack()) {
      safeRouter.back();
    } else {
      safeRouter.replace('/payout-option' as any);
    }
  };

  const handleCopyAccountNumber = () => {
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(accountNumber).catch(() => {});
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirmTransfer = () => {
    if (txState === 'verifying' || txState === 'success') return;
    setTxState('verifying');

    if (params.simulateFail !== '1') {
      const numericAmount = Number(displayAmount.replace(/[^0-9.]/g, '')) || 0;
      getAuthToken('business')
        .then((token) =>
          token
            ? trendApi.payments.reportBusinessPayment({
                amount: numericAmount,
                reference: `TRF-${Date.now()}`,
              })
            : null
        )
        .catch(() => {});
    }

    timerRef.current = setTimeout(() => {
      if (params.simulateFail === '1') {
        setTxState('failed');
      } else {
        setTxState('success');
      }
    }, 2200);
  };

  const handleTryAgain = () => {
    setTxState('idle');
  };

  const handleBackToDashboard = () => {
    safeRouter.replace('/dashboard' as any);
  };

  const vScale = windowHeight < 800 ? Math.max(0.75, windowHeight / 844) : 1;
  const contentWidth = Math.min(358, windowWidth - 32);

  // ── Screen 3: Payment Successful Full Celebration View ──
  if (txState === 'success') {
    return (
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <StatusBar style="dark" />
        <View style={styles.successContainer}>
          {/* Confetti Background (466x308, top: 71px => 27px below status bar) */}
          <Image
            source={CONFETTI_IMAGE}
            style={[styles.confettiImage, { top: Math.round(27 * vScale) }]}
            resizeMode="contain"
          />

          {/* Glossy Green Checkmark Badge (150x150, top: 143px => 99px below status bar) */}
          <View style={[styles.successBadgeWrapper, { marginTop: Math.round(99 * vScale) }]}>
            <Image
              source={SUCCESS_BADGE}
              style={styles.successBadgeImage}
              resizeMode="contain"
            />
          </View>

          {/* congratulation text (top: 405px => 112px below 150px badge, width: 358px, gap: 16px) */}
          <View
            style={[
              styles.successTextBlock,
              {
                width: contentWidth,
                marginTop: Math.round(112 * vScale),
              },
            ]}
          >
            <Text style={styles.successTitle}>Payment successful</Text>
            <Text style={styles.successSubtitle}>
              Your transaction to trend was successful, you may continue using trend.
            </Text>
          </View>

          {/* Back to Dashboard Button (top: 601px => 104px below 92px text block, 358x48px) */}
          <TouchableOpacity
            style={[
              styles.primaryActionBtn,
              {
                width: contentWidth,
                marginTop: Math.round(104 * vScale),
              },
            ]}
            activeOpacity={0.85}
            onPress={handleBackToDashboard}
          >
            <Text style={styles.primaryActionBtnText}>Back to Dashboard</Text>
          </TouchableOpacity>
        </View>

        <NativeDockSpacer backgroundColor="#FFFFFF" />
      </SafeAreaView>
    );
  }

  // ── Screen 1 (Idle) + Screen 2 (Verifying Modal) + Screen 4 (Failed Modal) ──
  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <StatusBar style="dark" />

      {/* ── Page Header (64px) ── */}
      <View style={styles.pageHeader}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            activeOpacity={0.7}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <ArrowLeftIcon />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Pay Trend</Text>

          <View style={styles.headerRightSpacer} />
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Instruction Text (24px below header, 358px) */}
        <Text style={[styles.instructionText, { maxWidth: 358 }]}>
          Before making a transfer, always double-check the account number and account name to ensure they are correct.
        </Text>

        {/* Payment Information Field (56px below instruction, 358px, dashed border) */}
        <View style={styles.paymentCard}>
          {/* Bank Row */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Bank</Text>
            <View style={styles.bankRow}>
              <Image
                source={ZENITH_LOGO}
                style={styles.bankLogo}
                resizeMode="contain"
              />
              <Text style={styles.bankName}>{bankName}</Text>
            </View>
          </View>

          <View style={styles.cardDivider} />

          {/* Account Name Row */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Account Name</Text>
            <Text style={styles.fieldValue}>{accountName}</Text>
          </View>

          <View style={styles.cardDivider} />

          {/* Account Number + Copy Row */}
          <View style={styles.accountNumberRow}>
            <View style={styles.fieldGroupCompact}>
              <Text style={styles.fieldLabel}>Account Number</Text>
              <Text style={styles.fieldValue}>{accountNumber}</Text>
            </View>

            <TouchableOpacity
              style={styles.copyButton}
              activeOpacity={0.7}
              onPress={handleCopyAccountNumber}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              {copied ? <GreenCheckmarkCircle size={22} /> : <CopyIcon size={24} />}
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Total Amount Section (1:1 Figma Spec) ── */}
        <View style={styles.totalAmountSection}>
          <View style={styles.totalAmountHeaderCol}>
            <Text style={styles.totalAmountTitle}>Total amount</Text>
            <Text style={styles.totalAmountSubtitle}>
              Below is the amount you owe trend
            </Text>
          </View>

          <View style={styles.amountRow}>
            <Text style={styles.amountValueText}>
              {showAmount ? displayAmount : '••••••••'}
            </Text>

            <TouchableOpacity
              style={styles.eyeToggleButton}
              activeOpacity={0.7}
              onPress={() => setShowAmount((prev) => !prev)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <EyeToggleIcon isVisible={showAmount} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Action Button ("I have made payment") */}
        <TouchableOpacity
          style={[
            styles.primaryActionBtn,
            {
              width: '100%',
              maxWidth: 358,
              marginTop: Math.max(28, Math.round(36 * vScale)),
            },
          ]}
          activeOpacity={0.85}
          onPress={handleConfirmTransfer}
        >
          <GreenCheckmarkCircle size={24} />
          <Text style={styles.primaryActionBtnText}>I have made payment</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* ── Verifying / Failed Modal Overlay ── */}
      <Modal
        visible={txState === 'verifying' || txState === 'failed'}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => {
          if (txState === 'failed') handleTryAgain();
        }}
      >
        <View style={styles.modalBackdrop}>
          {txState === 'verifying' ? (
            <View style={styles.verifyingPopupCard}>
              <AnimatedHourglassLoader
                width={88}
                height={100}
                style={styles.popupIllustration}
              />
              <Text style={styles.popupTitle}>Verifying payment</Text>
              <Text style={styles.popupSubtitle}>
                We&apos;re checking your payment. This may take a minute, please hang tight!
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
              <Text style={styles.popupTitle}>Transaction failed</Text>
              <Text style={styles.popupSubtitle}>
                Your payment couldn&apos;t be completed. Please check your internet or the sent amount try again.
              </Text>
              <TouchableOpacity
                style={styles.tryAgainButton}
                activeOpacity={0.85}
                onPress={handleTryAgain}
              >
                <Text style={styles.primaryActionBtnText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>

      <NativeDockSpacer backgroundColor="#FFFFFF" />
    </SafeAreaView>
  );
};

export default PayTrendScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  pageHeader: {
    height: 64,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 48,
    width: '100%',
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: FONT_HEADER,
    fontWeight: '500',
    fontSize: 17,
    lineHeight: 24,
    letterSpacing: 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
    textAlign: 'center',
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
    paddingTop: 24,
    paddingBottom: 32,
    alignItems: 'center',
  },
  instructionText: {
    width: '100%',
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    marginBottom: 56,
    includeFontPadding: false,
  },
  paymentCard: {
    width: '100%',
    maxWidth: 358,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(192, 192, 204, 0.96)',
    borderRadius: 24,
    padding: 16,
    gap: 24,
  },
  fieldGroup: {
    width: '100%',
    gap: 8,
  },
  fieldGroupCompact: {
    gap: 8,
    flex: 1,
  },
  fieldLabel: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    includeFontPadding: false,
  },
  bankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    height: 41,
  },
  bankLogo: {
    width: 41,
    height: 41,
  },
  bankName: {
    fontFamily: FONT_MEDIUM,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    color: '#141A33',
    includeFontPadding: false,
  },
  fieldValue: {
    fontFamily: FONT_MEDIUM,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    color: '#000000',
    includeFontPadding: false,
  },
  cardDivider: {
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(235, 235, 245, 0.96)',
  },
  accountNumberRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  copyButton: {
    width: 40,
    height: 40,
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  totalAmountSection: {
    width: '100%',
    maxWidth: 358,
    marginTop: 28,
  },
  totalAmountHeaderCol: {
    gap: 8,
    marginBottom: 16,
  },
  totalAmountTitle: {
    fontFamily: FONT_HEADER,
    fontWeight: '500',
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.2,
    color: '#000000',
    includeFontPadding: false,
  },
  totalAmountSubtitle: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    includeFontPadding: false,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  amountValueText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_700Bold',
    fontWeight: '700',
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.2,
    color: '#000000',
    includeFontPadding: false,
  },
  eyeToggleButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryActionBtn: {
    height: 48,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    borderRadius: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 10,
    shadowColor: 'rgba(133, 139, 148, 0.2)',
    shadowOffset: { width: 4, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 6,
  },
  primaryActionBtnText: {
    fontFamily: FONT_BUTTON,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
    color: '#FFFFFF',
    includeFontPadding: false,
  },

  // ── Modal Overlays ──
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(65, 63, 63, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  verifyingPopupCard: {
    width: 326,
    minHeight: 329,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 22,
    paddingTop: 27,
    paddingBottom: 28,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 10,
  },
  failedPopupCard: {
    width: 326,
    minHeight: 377,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 22,
    paddingTop: 27,
    paddingBottom: 28,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 10,
  },
  popupIllustration: {
    width: 88,
    height: 100,
    marginBottom: 24,
  },
  failedIconWrap: {
    width: 88,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  popupTitle: {
    fontFamily: FONT_MEDIUM,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    color: '#000000',
    textAlign: 'center',
    marginBottom: 26,
    includeFontPadding: false,
  },
  popupSubtitle: {
    width: 281,
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    textAlign: 'center',
    includeFontPadding: false,
  },
  failedBadgeImage: {
    width: 88,
    height: 88,
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

  // ── Success Screen ──
  successContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    position: 'relative',
  },
  confettiImage: {
    position: 'absolute',
    width: 466,
    height: 308,
    alignSelf: 'center',
  },
  successBadgeWrapper: {
    width: 150,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successBadgeImage: {
    width: 150,
    height: 150,
  },
  successTextBlock: {
    alignItems: 'center',
    gap: 16,
  },
  successTitle: {
    width: '100%',
    fontFamily: FONT_MEDIUM,
    fontWeight: '500',
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.2,
    color: '#000000',
    textAlign: 'center',
    includeFontPadding: false,
  },
  successSubtitle: {
    width: '100%',
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    textAlign: 'center',
    includeFontPadding: false,
  },
});

