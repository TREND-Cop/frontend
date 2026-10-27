import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

export interface InfoModalProps {
  visible: boolean;
  title?: string;
  description?: string;
  onClose: () => void;
  testID?: string;
}

const FONT_TITLE = Platform.select({
  ios: 'SF Pro',
  android: 'DMSans_500Medium',
  default: 'DMSans_500Medium',
});

const FONT_BODY = Platform.select({
  ios: 'SF Pro',
  android: 'DMSans_400Regular',
  default: 'DMSans_400Regular',
});

function CloseIcon({ size = 24, color = '#141B34' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6 6L18 18M6 18L18 6"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

const DEFAULT_TITLE = 'Total Revenue';
const DEFAULT_DESCRIPTION =
  'Total Revenue shows the overall income your business generated from its services within a period of time, in other words how much money is coming into the business.';

/**
 * InfoModal: Centered card over a dimmed backdrop matching Figma S5 spec.
 * - Title: 16px 500
 * - 48x48 rounded X close button
 * - Body text: 16px 400, line-height 24px
 * - Closes with X or backdrop tap
 */
export const InfoModal: React.FC<InfoModalProps> = ({
  visible,
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  onClose,
  testID,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      accessibilityViewIsModal
    >
      <View style={styles.backdropOverlay}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        <View style={styles.cardContainer} testID={testID}>
          {/* Top Row: Title + Close Button */}
          <View style={styles.headerRow}>
            <Text style={styles.titleText}>{title}</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onClose}
              style={styles.closeButton}
              accessible
              accessibilityRole="button"
              accessibilityLabel="Close information modal"
            >
              <CloseIcon size={24} color="#141B34" />
            </TouchableOpacity>
          </View>

          {/* Description Body */}
          <Text style={styles.bodyText}>{description}</Text>
        </View>
      </View>
    </Modal>
  );
};

export default InfoModal;

const styles = StyleSheet.create({
  backdropOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 8, 20, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  cardContainer: {
    width: '100%',
    maxWidth: 358,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    gap: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
      },
      android: {
        elevation: 8,
      },
      default: {
        boxShadow: '0px 10px 24px rgba(0, 0, 0, 0.15)',
      },
    }),
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 48,
  },
  titleText: {
    fontFamily: FONT_TITLE,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    color: '#000000',
    flex: 1,
    includeFontPadding: false,
  },
  closeButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bodyText: {
    fontFamily: FONT_BODY,
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: '#000000',
    includeFontPadding: false,
  },
});
