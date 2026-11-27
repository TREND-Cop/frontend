import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
  BackHandler,
  Animated,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { useSafeRouter } from '../../utils/safeNavigation';
import { NativeDockSpacer } from '../../components/NativeDockSpacer';

const CONFETTI_IMAGE = require('../../../assets/images/appointments/booking_success_confetti.png');
const SUCCESS_BADGE_IMAGE = require('../../../assets/images/appointments/glossy_green_success_badge.png');

/**
 * Payout Account Successfully Deleted Screen
 * Matches PayoutSuccessScreen 1:1 with compulsory "Add new payout wallet" action.
 * No back button or cancel button — business owners must add a replacement payout account.
 */
export const PayoutDeletedSuccessScreen: React.FC = () => {
  const safeRouter = useSafeRouter();
  const params = useLocalSearchParams<{ fromOption?: string }>();

  const useNative = Platform.OS !== 'web';
  const badgeScale = useRef(new Animated.Value(0.8)).current;
  const badgeOpacity = useRef(new Animated.Value(0)).current;
  const badgeFloat = useRef(new Animated.Value(0)).current;
  const badgeTilt = useRef(new Animated.Value(0)).current;
  const buttonPulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Lock Android hardware back — adding a new payout wallet is compulsory
    const sub = BackHandler.addEventListener('hardwareBackPress', () => true);

    Animated.parallel([
      Animated.timing(badgeOpacity, {
        toValue: 1,
        duration: 450,
        useNativeDriver: useNative,
      }),
      Animated.spring(badgeScale, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: useNative,
      }),
    ]).start(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(badgeFloat, {
            toValue: -12,
            duration: 850,
            easing: Easing.out(Easing.quad),
            useNativeDriver: useNative,
          }),
          Animated.timing(badgeFloat, {
            toValue: 2,
            duration: 750,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: useNative,
          }),
        ])
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(badgeTilt, {
            toValue: 1,
            duration: 900,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: useNative,
          }),
          Animated.timing(badgeTilt, {
            toValue: -1,
            duration: 900,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: useNative,
          }),
        ])
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(buttonPulse, {
            toValue: 1.03,
            duration: 850,
            easing: Easing.out(Easing.quad),
            useNativeDriver: useNative,
          }),
          Animated.timing(buttonPulse, {
            toValue: 0.985,
            duration: 750,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: useNative,
          }),
          Animated.timing(buttonPulse, {
            toValue: 1,
            duration: 350,
            easing: Easing.out(Easing.quad),
            useNativeDriver: useNative,
          }),
        ])
      ).start();
    });

    return () => {
      sub.remove();
      badgeFloat.stopAnimation();
      badgeTilt.stopAnimation();
      buttonPulse.stopAnimation();
    };
  }, [badgeScale, badgeOpacity, badgeFloat, badgeTilt, buttonPulse, useNative]);

  const handleAddNewPayoutWallet = () => {
    // Replace this screen with the payout creation form so Back from the form
    // lands directly on PayoutOptionScreen (never back here or on the deleted wallet screen).
    safeRouter.replace({
      pathname: '/payout-form',
      params: {
        fromDeleted: 'true',
        ...(params.fromOption ? { fromOption: params.fromOption } : {}),
      },
    } as any);
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.container}>
        <Image
          source={CONFETTI_IMAGE}
          style={styles.confettiImage}
          resizeMode="contain"
        />

        <Animated.View
          style={[
            styles.badgeWrapper,
            {
              opacity: badgeOpacity,
              transform: [
                { scale: badgeScale },
                { translateY: badgeFloat },
                {
                  rotate: badgeTilt.interpolate({
                    inputRange: [-1, 1],
                    outputRange: ['-3deg', '3deg'],
                  }),
                },
              ],
            },
          ]}
        >
          <Image
            source={SUCCESS_BADGE_IMAGE}
            style={styles.badgeImage}
            resizeMode="contain"
          />
        </Animated.View>

        <View style={styles.textContainer}>
          <Text style={styles.titleText}>Account successfully deleted</Text>
          <Text style={styles.subtitleText}>
            Please add another account to continue using Trend.
          </Text>
        </View>

        <Animated.View style={[styles.buttonWrapper, { transform: [{ scale: buttonPulse }] }]}>
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.actionButton}
            onPress={handleAddNewPayoutWallet}
            accessibilityRole="button"
            accessibilityLabel="Add new payout wallet"
          >
            <Text style={styles.actionButtonText}>Add new payout wallet</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      <NativeDockSpacer backgroundColor="#FFFFFF" />
    </SafeAreaView>
  );
};

export default PayoutDeletedSuccessScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
    paddingHorizontal: 16,
  },
  confettiImage: {
    position: 'absolute',
    top: 27,
    width: 466,
    height: 308,
    alignSelf: 'center',
    zIndex: 0,
  },
  badgeWrapper: {
    width: 150,
    height: 150,
    marginTop: 143,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeImage: {
    width: 150,
    height: 150,
  },
  textContainer: {
    width: '100%',
    maxWidth: 358,
    gap: 16,
    alignItems: 'center',
    marginTop: 46,
  },
  titleText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 20,
    lineHeight: 28,
    color: '#000000',
    textAlign: 'center',
    includeFontPadding: false,
  },
  subtitleText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.2,
    color: '#606066',
    textAlign: 'center',
    includeFontPadding: false,
  },
  buttonWrapper: {
    width: '100%',
    maxWidth: 358,
    marginTop: 144,
  },
  actionButton: {
    width: '100%',
    height: 48,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  actionButtonText: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
    color: '#FFFFFF',
    includeFontPadding: false,
  },
});
