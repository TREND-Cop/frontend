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
import { useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';

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
      <Path
        d="M12 3v11M12 3l-4 4M12 3l4 4"
        stroke="#141B34"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M4 12v7a2 2 0 002 2h12a2 2 0 002-2v-7"
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
  const router = useRouter();
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
    router.push('/add-google-account' as any);
  };

  const handleUpdateGmailPress = () => {
    // If email on file, open update form; otherwise, open empty state
    if (hasEmailOnFile) {
      router.push('/gmail-update' as any);
    } else {
      router.push('/gmail-update?empty=true' as any);
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
            onPress={() => router.back()}
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
        {/* Grey Menu Card */}
        <View style={styles.menuCard}>
          {/* Row 1: Add Gmail Account */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleAddGmailPress}
            style={styles.menuRow}
          >
            <View style={styles.menuRowLeft}>
              <GoogleMailIcon size={24} />
              <Text style={styles.menuRowLabel}>Add Gmail Account</Text>
            </View>
            <ChevronRightIcon size={24} />
          </TouchableOpacity>

          <View style={styles.cardDivider} />

          {/* Row 2: Update Existing Gmail Account */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleUpdateGmailPress}
            style={styles.menuRow}
          >
            <View style={styles.menuRowLeft}>
              <GoogleMailIcon size={24} />
              <Text style={styles.menuRowLabel}>Update Existing Gmail Account</Text>
            </View>
            <ChevronRightIcon size={24} />
          </TouchableOpacity>
        </View>
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
    paddingTop: 16,
    paddingBottom: 40,
  },
  menuCard: {
    width: '100%',
    backgroundColor: '#F7F7F7',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
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
  cardDivider: {
    width: '100%',
    height: 1,
    backgroundColor: '#EBEBF5',
  },
});
