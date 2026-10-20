import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import { colors, fontFamilies } from '../../constants/theme';

const TRIAL_CLOCK_IMAGE = require('../../../assets/images/dashboard/trial_clock.png');

interface TrialNoticeModalProps {
  visible: boolean;
  onUnderstand: () => void;
  expirationText?: string;
}

/**
 * 1:1 Figma Pop up 3 ("Free 7 Days Use") — Trial Notice Modal
 * Frame: 358px x 432px, borderRadius: 24px, background: #FFFFFF
 */
export const TrialNoticeModal: React.FC<TrialNoticeModalProps> = ({
  visible,
  onUnderstand,
  expirationText = 'Currently your using our 7 days free trial as a first time user. This gift expires 1st January 2027',
}) => {
  if (!visible) return null;

  return (
    <View style={styles.backdropOverlay}>
      <View style={styles.cardContainer}>
        {/* ── Clock Illustration (Rectangle 306: 198px x 147px) ── */}
        <View style={styles.illustrationWrapper}>
          <Image
            source={TRIAL_CLOCK_IMAGE}
            style={styles.illustrationImage}
            resizeMode="contain"
          />
        </View>

        {/* ── Title ("Free 7 Days Use", 20px Medium, lineHeight: 28px) ── */}
        <Text style={styles.titleText}>Free 7 Days Use</Text>

        {/* ── Subtitle (331px x 72px, 16px Regular, lineHeight: 24px) ── */}
        <Text style={styles.subtitleText}>{expirationText}</Text>

        {/* ── Primary Button: "I understand" (266px x 48px, radius: 24px) ── */}
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.understandButton}
          onPress={onUnderstand}
        >
          <Text style={styles.understandButtonText}>I understand</Text>
        </TouchableOpacity>
      </View>
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
    height: 432,
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
    marginTop: 19,
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
    marginTop: 19,
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
    marginTop: 14,
  },
  understandButton: {
    width: 266,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.barberPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  understandButtonText: {
    fontFamily: fontFamilies.button,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    color: '#FFFFFF',
    includeFontPadding: false,
  },
});

export default TrialNoticeModal;
