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

const WARNING_ICON = require('../../assets/images/payout/warning_triangle.png');

const FONT_MEDIUM = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium';
const FONT_REGULAR = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular';
const FONT_BUTTON = Platform.OS === 'ios' ? 'Inter' : 'Inter_500Medium';

export interface DeletePostDialogProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
}

/**
 * 1:1 Figma Delete Post Dialog (Frame S3 & P5)
 * Dimensions: width 326px, height 232px, radius 16px.
 * Full-screen dimmed backdrop covers header, status bar, and entire screen.
 */
export const DeletePostDialog: React.FC<DeletePostDialogProps> = ({
  visible,
  onCancel,
  onConfirm,
  title = 'Delete Post?',
  description = 'The post will be removed from your business dashboard and clients can no longer see it.',
  confirmText = 'Yes, Delete',
  cancelText = 'No,Cancel It.',
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onCancel}
    >
      <View style={styles.backdropOverlay}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onCancel}
          accessibilityLabel="Dismiss dialog backdrop"
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

          {/* Texts */}
          <View style={styles.textContainer}>
            <Text style={styles.titleText}>{title}</Text>
            <Text style={styles.bodyText}>{description}</Text>
          </View>

          {/* Action buttons row */}
          <View style={styles.buttonsRow}>
            {/* Confirm button (outlined red pill) */}
            <TouchableOpacity
              style={styles.yesButton}
              activeOpacity={0.8}
              onPress={onConfirm}
              accessibilityLabel={confirmText}
            >
              <Text style={styles.yesButtonText}>{confirmText}</Text>
            </TouchableOpacity>

            {/* Cancel button (outlined grey pill) */}
            <TouchableOpacity
              style={styles.noButton}
              activeOpacity={0.8}
              onPress={onCancel}
              accessibilityLabel={cancelText}
            >
              <Text style={styles.noButtonText}>{cancelText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default DeletePostDialog;

const styles = StyleSheet.create({
  backdropOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  dialogCard: {
    width: 326,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingTop: 24,
    paddingBottom: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  warningIcon: {
    width: 40,
    height: 40,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 24,
    gap: 8,
    paddingHorizontal: 8,
  },
  titleText: {
    fontFamily: FONT_MEDIUM,
    fontWeight: '500',
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.2,
    color: '#000814',
    textAlign: 'center',
    includeFontPadding: false,
  },
  bodyText: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.2,
    color: 'rgba(96, 96, 102, 0.96)',
    textAlign: 'center',
    includeFontPadding: false,
  },
  buttonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 8,
    gap: 12,
  },
  yesButton: {
    flex: 1,
    height: 40,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(204, 41, 43, 0.4)',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  yesButtonText: {
    fontFamily: FONT_BUTTON,
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 20,
    color: '#CC292B',
    includeFontPadding: false,
  },
  noButton: {
    flex: 1,
    height: 40,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noButtonText: {
    fontFamily: FONT_BUTTON,
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(96, 96, 102, 0.96)',
    includeFontPadding: false,
  },
});
