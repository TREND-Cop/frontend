/**
 * PayoutOptionScreen — 1:1 Figma Screen for Payout Wallet & Pay Trend Selection
 * Figma Frame: /* Payout option * / (390 x 844)
 *
 * Exact Converter Measurements:
 * - Page Header: height 64px, padding 8px 16px, back button 48x48, centered "Payout Wallet" (17px 500, lineHeight 24px, letterSpacing 0.2px)
 * - Frame 1000006518: top 132px (24px below header), width 358px, paddingVertical 16px, gap 24px,
 *   background rgba(247, 247, 247, 0.96), border 1px solid rgba(235, 235, 245, 0.96), borderRadius 24px
 * - Option Row 1 ("Payout Wallet"): height 48px, paddingHorizontal 16px, 16px Regular #000000 + chevron right -> /payout-method
 * - Divider (Line 188): 1px rgba(235, 235, 245, 0.96)
 * - Option Row 2 ("Pay Trend"): height 48px, paddingHorizontal 16px, 16px Regular #000000 + chevron right -> /pay-trend
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { useSafeRouter } from '../../utils/safeNavigation';
import { NativeDockSpacer } from '../../components/NativeDockSpacer';
import { useProviderOnboarding } from '../../context/ProviderOnboardingContext';

const FONT_HEADER = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium';
const FONT_MEDIUM = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium';
const FONT_REGULAR = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular';

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

function ChevronRightIcon({ size = 24 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9 18l6-6-6-6"
        stroke="#141B34"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export const PayoutOptionScreen: React.FC = () => {
  const safeRouter = useSafeRouter();
  const { payoutMethod, isPayoutDeleted } = useProviderOnboarding();

  const handleBack = () => {
    if (safeRouter.canGoBack()) {
      safeRouter.back();
    } else {
      safeRouter.replace('/profile' as any);
    }
  };

  const handleOpenPayoutWallet = () => {
    if (isPayoutDeleted && !payoutMethod) {
      safeRouter.push({
        pathname: '/payout-form',
        params: { fromDeleted: 'true', fromOption: 'true' },
      } as any);
      return;
    }
    safeRouter.push({
      pathname: '/payout-method',
      params: { fromOption: 'true' },
    } as any);
  };

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

          <Text style={styles.headerTitle}>Payout Wallet</Text>

          <View style={styles.headerRightSpacer} />
        </View>
      </View>

      {/* ── Main Content (24px below header) ── */}
      <View style={styles.contentContainer}>
        <View style={styles.optionsCard}>
          {/* Row 1: Payout Wallet */}
          <TouchableOpacity
            style={styles.optionRow}
            activeOpacity={0.7}
            onPress={handleOpenPayoutWallet}
          >
            <View style={styles.optionTextCol}>
              <Text style={styles.optionTitle}>Payout Wallet</Text>
              <Text style={styles.optionDescription}>
                Add the bank account where you’d like to receive payments clients services.
              </Text>
            </View>
            <ChevronRightIcon size={24} />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Row 2: Pay Trend */}
          <TouchableOpacity
            style={styles.optionRow}
            activeOpacity={0.7}
            onPress={() => safeRouter.push('/pay-trend' as any)}
          >
            <View style={styles.optionTextCol}>
              <Text style={styles.optionTitle}>Pay Trend</Text>
              <Text style={styles.optionDescription}>
                Pay outstanding commission to trend on booked appointments clients paid in cash.
              </Text>
            </View>
            <ChevronRightIcon size={24} />
          </TouchableOpacity>
        </View>
      </View>

      <NativeDockSpacer backgroundColor="#FFFFFF" />
    </SafeAreaView>
  );
};

export default PayoutOptionScreen;

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
  contentContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
    alignItems: 'center',
  },
  optionsCard: {
    width: '100%',
    maxWidth: 358,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    borderRadius: 24,
    paddingVertical: 16,
    gap: 16,
  },
  optionRow: {
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionTextCol: {
    flex: 1,
    paddingRight: 16,
    gap: 6,
  },
  optionTitle: {
    fontFamily: FONT_MEDIUM,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: Platform.OS === 'ios' ? 0.4 : 0.2,
    color: '#000000',
    includeFontPadding: false,
  },
  optionDescription: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    includeFontPadding: false,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(235, 235, 245, 0.96)',
  },
});

