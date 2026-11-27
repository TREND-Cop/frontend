import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  Platform,
} from 'react-native';
import { colors, fontFamilies } from '../../constants/theme';

const BARBER_ILLUSTRATION = require('../../../assets/images/dashboard/payout_wallet_barber_illustration.png');

interface ConnectAccountModalProps {
  visible: boolean;
  ownerName?: string;
  onConnectAccount: () => void;
  onMaybeLater: () => void;
}

/**
 * 1:1 Figma Pop up — Add Payout Wallet Prompt
 * Frame: 358px x 542px, borderRadius: 24px, background: #FFFFFF
 */
export const ConnectAccountModal: React.FC<ConnectAccountModalProps> = ({
  visible,
  ownerName,
  onConnectAccount,
  onMaybeLater,
}) => {
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const trimmed = ownerName?.trim() || '';
  const firstName = trimmed.length > 0 ? trimmed.split(' ')[0] : '';
  const greeting = firstName ? `Hi, ${firstName}.` : 'Hi there.';

  useEffect(() => {
    if (visible) {
      scaleAnim.setValue(0.95);
      opacityAnim.setValue(0);
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 65,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]).start();
    }
  }, [visible, opacityAnim, scaleAnim]);

  if (!visible) return null;

  return (
    <View style={styles.backdropOverlay}>
      <Animated.View
        style={[
          styles.cardContainer,
          {
            opacity: opacityAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* ── Illustration (Barber in blue apron waving with balloons & confetti: 198px x 147px) ── */}
        <View style={styles.illustrationWrapper}>
          <Image
            source={BARBER_ILLUSTRATION}
            style={styles.illustrationImage}
            resizeMode="contain"
          />
        </View>

        {/* ── Title ("Hi, {firstName}." or "Hi there.", 20px Medium, lineHeight: 28px, letterSpacing: 0.2px) ── */}
        <Text style={styles.titleText}>{greeting}</Text>

        {/* ── Subtitle (331px, 16px Regular, lineHeight: 24px, letterSpacing: 0.4px) ── */}
        <Text style={styles.subtitleText}>
          Finish Setting up your account by adding a payout wallet this will help you will receive payments client made through bank transfer or card. It’s free, safe, and easy to set up.
        </Text>

        {/* ── Primary Button: "Add payout wallet" (minWidth: 266px, height: 48px, radius: 24px) ── */}
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.connectButton}
          onPress={onConnectAccount}
          accessibilityLabel="Add payout wallet"
        >
          <Text
            style={styles.connectButtonText}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.85}
          >
            Add payout wallet
          </Text>
        </TouchableOpacity>

        {/* ── Secondary Button: "Maybe later" (210px x 48px) ── */}
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.maybeLaterButton}
          onPress={onMaybeLater}
        >
          <Text style={styles.maybeLaterText}>Maybe later</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  backdropOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9998,
    paddingHorizontal: 16,
  },
  cardContainer: {
    width: 358,
    height: 542,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.16,
    shadowRadius: 28,
    elevation: 12,
  },
  illustrationWrapper: {
    width: 198,
    height: 147,
    marginTop: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  illustrationImage: {
    width: 198,
    height: 147,
  },
  titleText: {
    fontFamily: fontFamilies.bodyMedium,
    fontWeight: '500',
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.2,
    color: '#000000',
    textAlign: 'center',
    includeFontPadding: false,
    marginTop: 24,
  },
  subtitleText: {
    width: 331,
    fontFamily: fontFamilies.body,
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    textAlign: 'center',
    includeFontPadding: false,
    marginTop: 12,
  },
  connectButton: {
    minWidth: 266,
    paddingHorizontal: 20,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.barberPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
    shadowColor: 'rgba(133, 139, 148, 0.12)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
  },
  connectButtonText: {
    fontFamily: fontFamilies.button,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
    color: '#FFFFFF',
    includeFontPadding: false,
    textAlign: 'center',
  },
  maybeLaterButton: {
    width: 210,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  maybeLaterText: {
    fontFamily: fontFamilies.button,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
    color: 'rgba(96, 96, 102, 0.96)',
    textAlign: 'center',
    includeFontPadding: false,
  },
});

export default ConnectAccountModal;
