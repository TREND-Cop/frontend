import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Image,
} from 'react-native';
import { fontFamilies } from '../../constants/theme';
import { useSingleFlight } from '../../utils/safeNavigation';

const WARNING_ICON = require('../../../assets/images/payout/warning_triangle.png');

// 1:1 Figma typography tokens conforming to Master Guidelines
const FONT_MEDIUM = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium';
const FONT_REGULAR = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular';
const FONT_BUTTON = Platform.OS === 'ios' ? 'Inter' : 'Inter_500Medium';

export interface ReplacePayoutDialogProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

/**
 * 1:1 Figma Replace Payout Dialog
 * Frame: pop up (width: 326px, height: 232px, radius: 16px)
 * Dimmed backdrop covers full screen including header and status bar.
 */
export const ReplacePayoutDialog: React.FC<ReplacePayoutDialogProps> = ({
  visible,
  onCancel,
  onConfirm,
}) => {
  const safeCancel = useSingleFlight(() => {
    if (!visible) return;
    onCancel();
  });
  const safeConfirm = useSingleFlight(() => {
    if (!visible) return;
    onConfirm();
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={safeCancel}
    >
      <View style={styles.backdropOverlay}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={safeCancel}
        />

        {/* ── Dialog Card (326x232, radius 16) ── */}
        <View style={styles.dialogCard}>
          {/* Warning Icon (40x40, centered) */}
          <View style={styles.iconContainer}>
            <Image
              source={WARNING_ICON}
              style={styles.warningIcon}
              resizeMode="contain"
            />
          </View>

          {/* Description texts */}
          <View style={styles.textContainer}>
            <Text style={styles.titleText}>Creating new Payout Wallet method?</Text>
            <Text style={styles.bodyText}>
              Creating a new payout wallet method will automatically delete the existing one
            </Text>
          </View>

          {/* Action buttons row (Figma layout: HORIZONTAL, gap 90px between outer edges / flex space-between) */}
          <View style={styles.buttonsRow}>
            {/* "Yes, Create" Button (127x40, red text) */}
            <TouchableOpacity
              style={styles.yesButton}
              activeOpacity={0.8}
              onPress={safeConfirm}
            >
              <Text style={styles.yesButtonText}>Yes, Create</Text>
            </TouchableOpacity>

            {/* "No,Cancel It." Button (131x40, grey text) */}
            <TouchableOpacity
              style={styles.noButton}
              activeOpacity={0.8}
              onPress={safeCancel}
            >
              <Text style={styles.noButtonText}>No,Cancel It.</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ReplacePayoutDialog;

const styles = StyleSheet.create({
  backdropOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  dialogCard: {
    width: 326,
    minHeight: 256,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    gap: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  iconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  warningIcon: {
    width: 40,
    height: 40,
  },
  textContainer: {
    width: 294,
    alignItems: 'center',
  },
  titleText: {
    fontFamily: FONT_MEDIUM,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    color: '#000814',
    textAlign: 'center',
    marginBottom: 8,
    includeFontPadding: false,
  },
  bodyText: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    color: '#606066',
    textAlign: 'center',
    includeFontPadding: false,
  },
  buttonsRow: {
    width: 294,
    height: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  yesButton: {
    width: 127,
    height: 40,
    borderRadius: 24,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderWidth: 1,
    borderColor: '#C0C0CC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  yesButtonText: {
    fontFamily: FONT_BUTTON,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    color: '#CC2929',
    includeFontPadding: false,
  },
  noButton: {
    width: 131,
    height: 40,
    borderRadius: 24,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderWidth: 1,
    borderColor: '#C0C0CC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noButtonText: {
    fontFamily: FONT_BUTTON,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    color: '#606066',
    includeFontPadding: false,
  },
});
