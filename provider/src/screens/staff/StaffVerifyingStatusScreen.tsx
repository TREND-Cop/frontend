import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  BackHandler,
  Platform,
  Animated,
  Easing,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Svg, { Circle } from 'react-native-svg';

import { useStaffAppointments } from '../../context/StaffAppointmentsContext';
import {
  MOCK_CLIENT_VERIFY_DELAY_MS,
  DEV_STAFF_CLIENT_NEVER_VERIFIES,
} from '../../constants/staffAppointments.config';
import { STAFF_ROUTES } from '../../constants/staffRoutes';

const HOURGLASS_IMAGE = require('../../../assets/images/appointments/verifying_hourglass.png');

function GreenRotatingSpinner({ size = 32 }: { size?: number }) {
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    animation.start();
    return () => animation.stop();
  }, [spinValue]);

  const rotate = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View style={{ width: size, height: size, transform: [{ rotate }] }}>
      <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        <Circle cx="16" cy="16" r="12" stroke="rgba(235, 235, 245, 0.96)" strokeWidth="3" />
        <Circle
          cx="16"
          cy="16"
          r="12"
          stroke="rgba(12, 121, 12, 0.96)"
          strokeWidth="3"
          strokeDasharray="28 50"
          strokeLinecap="round"
        />
      </Svg>
    </Animated.View>
  );
}

/**
 * 1:1 Figma Verifying Appointment Status Screen
 * Frame: App Successful Screen (first instance: 390x844)
 */
export function StaffVerifyingStatusScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { completeAppointment } = useStaffAppointments();

  // Gentle breathing float on the hourglass illustration
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Android hardware back does nothing here (design has no back navigation)
    const backSub = BackHandler.addEventListener('hardwareBackPress', () => true);

    // 2. Gentle float animation
    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -8,
          duration: 1400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 4,
          duration: 1400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    floatLoop.start();

    // 3. Mock client verification delay
    let timer: NodeJS.Timeout | null = null;
    if (!DEV_STAFF_CLIENT_NEVER_VERIFIES && id) {
      timer = setTimeout(() => {
        // Complete appointment in store
        completeAppointment(id);
        // Replace screen with Successful screen so back is impossible
        router.replace({
          pathname: STAFF_ROUTES.COMPLETION_SUCCESS as any,
          params: { id },
        });
      }, MOCK_CLIENT_VERIFY_DELAY_MS);
    }

    return () => {
      backSub.remove();
      floatLoop.stop();
      if (timer) clearTimeout(timer);
    };
  }, [id, floatAnim, completeAppointment, router]);

  return (
    <View style={[styles.screenContainer, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <StatusBar style="dark" />

      <View style={styles.contentContainer}>
        {/* Hourglass Illustration: 213x153px */}
        <Animated.View style={[styles.hourglassWrapper, { transform: [{ translateY: floatAnim }] }]}>
          <Image
            source={HOURGLASS_IMAGE}
            style={styles.hourglassImage}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Text Block (Frame 1000006442) */}
        <View style={styles.textBlock}>
          <Text style={styles.titleText}>Verifying Appointment Status</Text>
          <Text style={styles.subtitleText}>
            Waiting for your client to verify the appointment is completed, this wont take long.
          </Text>
        </View>

        {/* Mini Loader & Status Text (mini loader in CSS) */}
        <View style={styles.loaderContainer}>
          <GreenRotatingSpinner size={32} />
          <Text style={styles.waitingClientText}>Waiting for client</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Hourglass illustration container
  hourglassWrapper: {
    width: 213,
    height: 153,
    marginBottom: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hourglassImage: {
    width: 213,
    height: 153,
  },

  // Text Block
  textBlock: {
    width: '100%',
    maxWidth: 358,
    alignItems: 'center',
    gap: 16,
    marginBottom: 64,
  },
  titleText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.2,
    color: '#000000',
    textAlign: 'center',
  },
  subtitleText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    textAlign: 'center',
  },

  // Mini Loader
  loaderContainer: {
    alignItems: 'center',
    gap: 16,
  },
  waitingClientText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
    textAlign: 'center',
  },
});

export default StaffVerifyingStatusScreen;
