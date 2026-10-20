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

const CELEBRATION_ILLUSTRATION = require('../../../assets/images/dashboard/tutorial_celebration_characters.png');

interface ConnectAccountModalProps {
  visible: boolean;
  onConnectAccount: () => void;
  onMaybeLater: () => void;
}

/**
 * 1:1 Figma Pop up 2 ("Amazing") — Connect Account Prompt
 * Frame: 358px x 499px, borderRadius: 24px, background: #FFFFFF
 */
export const ConnectAccountModal: React.FC<ConnectAccountModalProps> = ({
  visible,
  onConnectAccount,
  onMaybeLater,
}) => {
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

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
  }, [visible]);

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
        {/* ── Illustration (Celebration Characters + Confetti: 260px x 150px) ── */}
        <View style={styles.illustrationWrapper}>
          <Image
            source={CELEBRATION_ILLUSTRATION}
            style={styles.illustrationImage}
            resizeMode="contain"
          />
        </View>

        {/* ── Title ("Amazing", 20px Medium, lineHeight: 28px) ── */}
        <Text style={styles.titleText}>Amazing</Text>

        {/* ── Subtitle (331px x 72px, 16px Regular, lineHeight: 24px) ── */}
        <Text style={styles.subtitleText}>
          Lastly, let’s connect an account to your business. It’s free, secure,
          and you can start using Trend right away.
        </Text>

        {/* ── Primary Button: "Connect account" (266px x 48px, radius: 24px) ── */}
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.connectButton}
          onPress={onConnectAccount}
        >
          <Text style={styles.connectButtonText}>Connect account</Text>
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
    height: 499,
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
    width: 260,
    height: 150,
    marginTop: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  illustrationImage: {
    width: '100%',
    height: '100%',
  },
  titleText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 20,
    lineHeight: 28,
    color: '#000000',
    textAlign: 'center',
    includeFontPadding: false,
    marginTop: 20,
  },
  subtitleText: {
    width: 331,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    color: 'rgba(96, 96, 102, 0.96)',
    textAlign: 'center',
    includeFontPadding: false,
    marginTop: 12,
  },
  connectButton: {
    width: 266,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.barberPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 36,
  },
  connectButtonText: {
    fontFamily: fontFamilies.button,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    color: '#FFFFFF',
    includeFontPadding: false,
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
    color: 'rgba(96, 96, 102, 0.96)',
    includeFontPadding: false,
  },
});

export default ConnectAccountModal;
