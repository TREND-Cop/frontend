import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { useProviderOnboarding, SavedPayoutMethod } from '../../context/ProviderOnboardingContext';
import { ReplacePayoutDialog } from '../../components/payout/ReplacePayoutDialog';
import { NativeDockSpacer } from '../../components/NativeDockSpacer';
import { fontFamilies } from '../../constants/theme';

const ZENITH_LOGO = require('../../../assets/images/payout/zenith_bank_logo.png');

// 1:1 Typography Tokens conforming to Golden Rules
const FONT_MEDIUM = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium';
const FONT_REGULAR = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular';
const FONT_BUTTON = Platform.OS === 'ios' ? 'Inter' : 'Inter_500Medium';
const FONT_HEADER = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium';

// ── 1:1 Vector arrow-left-02 Icon ──
function ArrowLeftIcon({ size = 24, color = '#000814' }: { size?: number; color?: string }) {
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

// ── 1:1 Vector Green Shield-Check Icon ──
function ShieldCheckBadge({ size = 40 }: { size?: number }) {
  return (
    <View style={styles.shieldBadgeContainer}>
      <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
        {/* Shield background shape */}
        <Path
          d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3z"
          fill="#0C790C"
          stroke="#0C790C"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* White Checkmark */}
        <Path
          d="M9 12l2 2 4-4"
          stroke="#FFFFFF"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
}

// Default fallback mock method if none exists yet during development/testing
const DEFAULT_MOCK_METHOD: SavedPayoutMethod = {
  bankName: 'Zenith Bank',
  bankId: 'zenith',
  accountNumber: '1234567899',
  accountName: 'Emmanuel Obinna',
  bankLogo: ZENITH_LOGO,
  verified: true,
};

/**
 * 1:1 Figma Payout Method Screen (Part B)
 * Frame: Payout screen (width: 390px, height: 1333px)
 */
export const PayoutMethodScreen: React.FC = () => {
  const router = useRouter();
  const { payoutMethod } = useProviderOnboarding();
  const [isReplaceDialogOpen, setIsReplaceDialogOpen] = useState(false);

  // Use saved payout method from state, or fallback during testing
  const activeMethod = payoutMethod || DEFAULT_MOCK_METHOD;

  const handleBackPress = () => {
    router.back();
  };

  const handleOpenReplaceDialog = () => {
    setIsReplaceDialogOpen(true);
  };

  const handleCancelReplace = () => {
    setIsReplaceDialogOpen(false);
  };

  const handleConfirmReplace = () => {
    setIsReplaceDialogOpen(false);
    // Skips terms notice and routes directly to the Payouts form
    // TODO (Backend): Old method is kept until new method is verified successfully
    router.push('/payout-form' as any);
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <StatusBar style="dark" />

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

          <Text style={styles.headerTitle}>Payouts</Text>

          {/* Invisible spacer balancing the 48px back button so title is perfectly centered */}
          <View style={styles.headerRightSpacer} />
        </View>
      </View>

      {/* ── Main Content Container ── */}
      <View style={styles.contentContainer}>
        {/* Section Heading: "Payout Method" (16px Medium, left: 16px, top: 132px) */}
        <Text style={styles.sectionTitle}>Payout Method</Text>

        {/* ── Saved Method Card (358x87, radius 24) ── */}
        <View style={styles.payoutCard}>
          <View style={styles.payoutCardLeft}>
            {/* Top row: Bank Logo + Bank Name */}
            <View style={styles.bankNameRow}>
              <Image
                source={activeMethod.bankLogo || ZENITH_LOGO}
                style={styles.bankLogo}
                resizeMode="contain"
              />
              <Text style={styles.bankNameText}>{activeMethod.bankName}</Text>
            </View>

            {/* Bottom row: Account Number | Account Name */}
            <View style={styles.accountInfoRow}>
              <Text style={styles.accountNumberText}>{activeMethod.accountNumber}</Text>
              <View style={styles.dividerLine} />
              <Text style={styles.accountNameText} numberOfLines={1}>
                {activeMethod.accountName}
              </Text>
            </View>
          </View>

          {/* Right: Green Shield Checkmark Badge (40x40, radius 24) */}
          <ShieldCheckBadge size={40} />
        </View>

        {/* ── "Create new payout method" Pill Action Button ── */}
        <View style={styles.buttonWrapper}>
          <TouchableOpacity
            style={styles.createButton}
            activeOpacity={0.8}
            onPress={handleOpenReplaceDialog}
          >
            <Text style={styles.createButtonText}>Create new payout method</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Replace Payout Confirmation Dialog ── */}
      <ReplacePayoutDialog
        visible={isReplaceDialogOpen}
        onCancel={handleCancelReplace}
        onConfirm={handleConfirmReplace}
      />

      {/* Android System Navigation Bar & Native Dock Protection */}
      <NativeDockSpacer backgroundColor="#FFFFFF" />
    </SafeAreaView>
  );
};

export default PayoutMethodScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  /* ── Header ── */
  pageHeader: {
    width: '100%',
    height: 64,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EBEBF5',
    justifyContent: 'center',
    paddingHorizontal: 16,
    zIndex: 10,
  },
  headerContent: {
    width: '100%',
    height: 48,
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
    fontFamily: FONT_HEADER,
    fontWeight: '500',
    fontSize: 17,
    lineHeight: 24,
    color: '#000814',
    textAlign: 'center',
    includeFontPadding: false,
  },
  headerRightSpacer: {
    width: 48,
    height: 48,
  },

  /* ── Content ── */
  contentContainer: {
    flex: 1,
    paddingTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontFamily: FONT_MEDIUM,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    color: '#000000',
    marginBottom: 16,
    includeFontPadding: false,
  },

  /* ── Saved Payout Card ── */
  payoutCard: {
    width: 358,
    height: 87,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderRadius: 24,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    alignSelf: 'center',
  },
  payoutCardLeft: {
    flex: 1,
    height: 55,
    justifyContent: 'space-between',
    paddingRight: 10,
  },
  bankNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bankLogo: {
    width: 24,
    height: 24,
  },
  bankNameText: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    color: '#000000',
    includeFontPadding: false,
  },
  accountInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  accountNumberText: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    color: '#606066',
    includeFontPadding: false,
  },
  dividerLine: {
    width: 1,
    height: 14,
    backgroundColor: '#606066',
  },
  accountNameText: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    color: '#606066',
    flexShrink: 1,
    includeFontPadding: false,
  },
  shieldBadgeContainer: {
    width: 40,
    height: 40,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* ── Action Button ── */
  buttonWrapper: {
    marginTop: 48,
    alignItems: 'center',
  },
  createButton: {
    width: 244,
    height: 48,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderWidth: 1,
    borderColor: '#EBEBF5',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  createButtonText: {
    fontFamily: FONT_BUTTON,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    color: '#000814',
    includeFontPadding: false,
  },
});
