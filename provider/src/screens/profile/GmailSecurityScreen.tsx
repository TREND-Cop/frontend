import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  Share,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSafeRouter } from '../../utils/safeNavigation';
import Svg, { Path, Circle } from 'react-native-svg';

import { NativeDockSpacer } from '../../components/NativeDockSpacer';
import { useProviderProfile } from '../../context/ProviderProfileContext';

// ── Platform Typography Standards ──
const FONT_MEDIUM = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium';
const FONT_HEADER = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium';

// ── SVG Icons ──
function ArrowLeftIcon({ size = 24 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M19 12H5M11 6l-6 6 6 6"
        stroke="#000814"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function ShareIcon({ size = 24 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="18" cy="5" r="3" stroke="#141B34" strokeWidth="1.5" />
      <Circle cx="6" cy="12" r="3" stroke="#141B34" strokeWidth="1.5" />
      <Circle cx="18" cy="19" r="3" stroke="#141B34" strokeWidth="1.5" />
      <Path
        d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98"
        stroke="#141B34"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </Svg>
  );
}

function ChevronRightIcon({ size = 24, color = '#C0C0CC' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9 18l6-6-6-6"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function GoogleMailIcon({ size = 24 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6z"
        stroke="rgba(0, 8, 20, 0.96)"
        strokeWidth="1.5"
      />
      <Path
        d="M3 7l8.2 5.467a1.5 1.5 0 0 0 1.6 0L21 7"
        stroke="rgba(0, 8, 20, 0.96)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </Svg>
  );
}

export const GmailSecurityScreen: React.FC = () => {
  const safeRouter = useSafeRouter();
  const insets = useSafeAreaInsets();
  const { ownerEmail } = useProviderProfile();

  const hasEmailOnFile = Boolean(ownerEmail && ownerEmail.trim().length > 0);

  const handleSharePress = async () => {
    try {
      await Share.share({
        message: 'Trend Provider Gmail Security',
      });
    } catch {
      // Ignored
    }
  };

  const handleAddGmailPress = () => {
    // Follow design literally (Choice A3): opens Add Google Account
    safeRouter.push('/add-google-account' as any);
  };

  const handleUpdateGmailPress = () => {
    // If email on file, open update form; otherwise, open empty state
    if (hasEmailOnFile) {
      safeRouter.push('/gmail-update' as any);
    } else {
      safeRouter.push('/gmail-update?empty=true' as any);
    }
  };

  return (
    <View style={styles.screenContainer}>
      <StatusBar style="dark" />
      <View style={{ height: insets.top, backgroundColor: '#FFFFFF' }} />

      {/* ── Fixed Page Header (64px, padding: 8px 16px) ── */}
      <View style={styles.pageHeader}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.backButton}
            onPress={() => safeRouter.back()}
            accessibilityLabel="Back to Profile"
          >
            <ArrowLeftIcon size={24} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Gmail Security</Text>

          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.shareButton}
            onPress={handleSharePress}
            accessibilityLabel="Share"
          >
            <ShareIcon size={24} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Scrollable Body ── */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Card 1: Add Gmail Account */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleAddGmailPress}
          style={styles.menuCard}
        >
          <View style={styles.menuRowLeft}>
            <GoogleMailIcon size={24} />
            <Text style={styles.menuRowLabel}>Add Gmail Account</Text>
          </View>
          <ChevronRightIcon size={24} />
        </TouchableOpacity>

        {/* Card 2: Update Existing Gmail Account */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleUpdateGmailPress}
          style={styles.menuCard}
        >
          <View style={styles.menuRowLeft}>
            <GoogleMailIcon size={24} />
            <Text style={styles.menuRowLabel}>Update Existing Gmail Account</Text>
          </View>
          <ChevronRightIcon size={24} />
        </TouchableOpacity>
      </ScrollView>

      <NativeDockSpacer />
    </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: FONT_HEADER,
    fontWeight: '500',
    fontSize: 17,
    lineHeight: 24,
    color: '#000814',
    textAlign: 'center',
  },
  shareButton: {
    width: 48,
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 40,
    gap: 40,
  },
  menuCard: {
    width: '100%',
    height: 56,
    backgroundColor: '#F7F7F7',
    borderRadius: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  menuRowLabel: {
    fontFamily: FONT_MEDIUM,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    color: '#000814',
  },
});
