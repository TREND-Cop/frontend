import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  BackHandler,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { useSafeRouter } from '../../utils/safeNavigation';

import { useStaffAppointments } from '../../context/StaffAppointmentsContext';
import {
  MOCK_CLIENT_VERIFY_DELAY_MS,
  DEV_STAFF_CLIENT_NEVER_VERIFIES,
} from '../../constants/staffAppointments.config';
import { STAFF_ROUTES } from '../../constants/staffRoutes';
import { AnimatedHourglassLoader } from '../../components/ui/AnimatedHourglassLoader';
import { NativeDockSpacer } from '../../components/NativeDockSpacer';

/**
 * 1:1 Figma Verifying Appointment Status Screen
 * Figma Frame: App Successful Screen (top: 79px, left: 1250px, width: 390px, height: 844px)
 * Measurements:
 * - Hourglass: 213x153px, top: 187px, centered
 * - Text Block: Frame 1000006442, 358x116px, top: 404px, gap: 16px
 * - Title: 20px 500, line height 28px, letter spacing 0.2px, #000000
 * - Subtitle: 16px 400, line height 24px, letter spacing 0.4px, rgba(96, 96, 102, 0.96)
 */
export function StaffVerifyingStatusScreen() {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const safeRouter = useSafeRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { completeAppointment } = useStaffAppointments();

  // Reference scale factor for height relative to 844px Figma canvas
  const canvasHeight = Math.max(windowHeight, 700);
  const scaleY = canvasHeight / 844;
  // Calculated offsets matching Figma coordinates
  const hourglassMarginTop = Math.max(20, Math.round(187 * scaleY - insets.top));
  const hourglassToTextGap = Math.max(32, Math.round((404 - (187 + 153)) * scaleY));

  useEffect(() => {
    // 1. Android hardware back disabled (design has no back navigation)
    const backSub = BackHandler.addEventListener('hardwareBackPress', () => true);

    // 2. Mock client verification delay (or real-time push when connected)
    let timer: NodeJS.Timeout | null = null;
    if (!DEV_STAFF_CLIENT_NEVER_VERIFIES && id) {
      timer = setTimeout(() => {
        completeAppointment(id);
        safeRouter.replace({
          pathname: STAFF_ROUTES.COMPLETION_SUCCESS as any,
          params: { id },
        });
      }, MOCK_CLIENT_VERIFY_DELAY_MS);
    }

    return () => {
      backSub.remove();
      if (timer) clearTimeout(timer);
    };
  }, [id, completeAppointment, safeRouter]);

  return (
    <View style={[styles.screenContainer, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />

      {/* ── Top/Center Content Group ── */}
      <View style={styles.mainContent}>
        {/* Animated Loading Hourglass Illustration: 213x153px (Rectangle 296, top: 187px) */}
        <AnimatedHourglassLoader
          width={213}
          height={153}
          style={{
            marginTop: hourglassMarginTop,
            marginBottom: hourglassToTextGap,
          }}
        />

        {/* Text Block: Frame 1000006442 (358x116px, gap: 16px, top: 404px) */}
        <View style={styles.textBlock}>
          <Text style={styles.titleText}>Verifying Appointment Status</Text>
          <Text style={styles.subtitleText}>
            Waiting for your client to verify the appointment is completed, this wont take long.
          </Text>
        </View>
      </View>

      <NativeDockSpacer />
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
  },
  mainContent: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 16,
  },

  // Frame 1000006442: Text Block (width: 358px, height: 116px, gap: 16px)
  textBlock: {
    width: '100%',
    maxWidth: 358,
    alignItems: 'center',
    gap: 16,
  },
  // Verifying Appointment Status (283x28px)
  titleText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.2,
    color: '#000000',
    textAlign: 'center',
  },
  // Subtitle (358x72px)
  subtitleText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    textAlign: 'center',
  },
});

export default StaffVerifyingStatusScreen;
