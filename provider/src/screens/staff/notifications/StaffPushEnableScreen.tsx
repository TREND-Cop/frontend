import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSafeRouter } from '../../../utils/safeNavigation';
import Svg, { Path } from 'react-native-svg';

import { useStaffNotifications } from '../../../context/StaffNotificationsContext';
import { NativeDockSpacer } from '../../../components/NativeDockSpacer';
import { STAFF_ROUTES } from '../../../constants/staffRoutes';

const FONT_REGULAR = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular';
const FONT_BUTTON = Platform.OS === 'ios' ? 'Inter' : 'Inter_500Medium';

function NotificationBellIcon({ size = 24, color = '#FFFFFF' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2C8.686 2 6 4.686 6 8v4.27l-1.7 2.55A1 1 0 005.13 16h13.74a1 1 0 00.83-1.55L18 12.27V8c0-3.314-2.686-6-6-6z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M9.5 19a2.5 2.5 0 005 0"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export const StaffPushEnableScreen: React.FC = () => {
  const safeRouter = useSafeRouter();
  const insets = useSafeAreaInsets();
  const { setHasPromptedPush } = useStaffNotifications();

  const handleEnablePush = () => {
    // TODO (Backend/push): Expo notifications permission request, pending backend plan
    setHasPromptedPush(true);
    safeRouter.replace(STAFF_ROUTES.NOTIFICATIONS as any);
  };

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 24) + 32 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Illustration Card Container (Frame 1000006525: 358x451px) ── */}
        <View style={styles.illustrationFrame}>
          {/* Top simulated camera & indicator dot */}
          <View style={styles.simulatedIndicatorRow}>
            <View style={styles.simulatedDot}>
              <View style={styles.innerDot} />
            </View>
          </View>

          {/* Skeleton Card 1 (327x84px) */}
          <View style={styles.skeletonCard1}>
            <View style={styles.cardContentRow}>
              {/* Icon frame (54x54, radius 8) */}
              <View style={styles.iconBox}>
                <View style={styles.innerSquare} />
              </View>
              {/* Skeleton lines col */}
              <View style={styles.linesCol}>
                <View style={styles.lineTag} />
                <View style={styles.lineLong} />
                <View style={styles.lineLong} />
              </View>
            </View>
          </View>

          {/* Skeleton Card 2 (310x84px) */}
          <View style={styles.skeletonCard2}>
            <View style={styles.cardContentRow}>
              {/* Icon frame (54x54, radius 8) */}
              <View style={styles.iconBox}>
                <View style={styles.innerSquare} />
              </View>
              {/* Skeleton lines col */}
              <View style={styles.linesCol}>
                <View style={styles.lineTag} />
                <View style={styles.lineMedium} />
                <View style={styles.lineMedium} />
              </View>
            </View>
          </View>

          {/* Bottom fade overlay */}
          <View style={styles.bottomFadeOverlay} />
        </View>

        {/* ── Explanatory Text (345x72px) ── */}
        <Text style={styles.explanatoryText}>
          Stay updated on important information about you business, staff uploads and more.
        </Text>

        {/* ── Enable Push Button (320x48px pill) ── */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleEnablePush}
          style={styles.enableButton}
          accessibilityRole="button"
          accessibilityLabel="Enable push notification"
        >
          <NotificationBellIcon size={24} color="#FFFFFF" />
          <Text style={styles.enableButtonText}>Enable push notification</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Android Dock Spacer Barrier */}
      <NativeDockSpacer />
    </SafeAreaView>
  );
};

export default StaffPushEnableScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 40,
  },
  illustrationFrame: {
    width: 358,
    height: 451,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    marginBottom: 24,
  },
  simulatedIndicatorRow: {
    width: '100%',
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  simulatedDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(192, 192, 204, 0.96)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  skeletonCard1: {
    width: 327,
    height: 84,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginTop: 32,
    padding: 15,
    shadowColor: 'rgba(133, 139, 148, 0.16)',
    shadowOffset: { width: 4, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 4,
  },
  skeletonCard2: {
    width: 310,
    height: 84,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginTop: 24,
    padding: 15,
    shadowColor: 'rgba(133, 139, 148, 0.16)',
    shadowOffset: { width: 4, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 4,
  },
  cardContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconBox: {
    width: 54,
    height: 54,
    borderRadius: 8,
    backgroundColor: '#EBEBEB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerSquare: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#D9D9D9',
  },
  linesCol: {
    flex: 1,
    gap: 8,
  },
  lineTag: {
    width: 62,
    height: 12,
    backgroundColor: '#D9D9D9',
    borderRadius: 4,
  },
  lineLong: {
    width: '100%',
    height: 12,
    backgroundColor: '#D9D9D9',
    borderRadius: 4,
  },
  lineMedium: {
    width: '80%',
    height: 12,
    backgroundColor: '#D9D9D9',
    borderRadius: 4,
  },
  bottomFadeOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 91,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
  },
  explanatoryText: {
    width: 345,
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    textAlign: 'center',
    marginBottom: 40,
    includeFontPadding: false,
  },
  enableButton: {
    width: 320,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: 'rgba(133, 139, 148, 0.16)',
    shadowOffset: { width: 4, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 6,
  },
  enableButtonText: {
    fontFamily: FONT_BUTTON,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
    color: '#FFFFFF',
    includeFontPadding: false,
  },
});

