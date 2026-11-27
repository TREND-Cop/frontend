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
import { useSingleFlight } from '../../utils/safeNavigation';

const WARNING_ICON = require('../../../assets/images/payout/warning_triangle.png');

const FONT_MEDIUM = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium';
const FONT_REGULAR = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular';
const FONT_BUTTON = Platform.OS === 'ios' ? 'Inter' : 'Inter_500Medium';

export interface RemoveStaffDialogProps {
  visible: boolean;
  staffName: string;
  onCancel: () => void;
  onConfirm: () => void;
}

/**
 * 1:1 Figma Confirmation Dialog for Staff Removal
 *
 * Implements:
 * - Red warning triangle icon
 * - Title: "Remove staff?"
 * - Body: "{name} will be removed from your business and clients will no longer be able to book them. This can't be undone."
 * - Note: Marked `TODO (Copy)` — this confirmation step is added for safety and not drawn in Figma D1/D2
 * - Action buttons: "Yes, Remove" (red text) & "No, Cancel It." (grey text)
 */
export const RemoveStaffDialog: React.FC<RemoveStaffDialogProps> = ({
  visible,
  staffName,
  onCancel,
  onConfirm,
}) => {
  const safeConfirm = useSingleFlight(() => {
    if (!visible) return;
    onConfirm();
  });
  const safeCancel = useSingleFlight(() => {
    if (!visible) return;
    onCancel();
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

          {/* Texts (TODO (Copy): not drawn in design) */}
          <View style={styles.textContainer}>
            <Text style={styles.titleText}>Remove staff?</Text>
            <Text style={styles.bodyText}>
              {staffName} will be removed from your business and clients will no longer be able to book them. This can't be undone.
            </Text>
          </View>

          {/* Action buttons row */}
          <View style={styles.buttonsRow}>
            {/* "Yes, Remove" (outlined red pill) */}
            <TouchableOpacity
              style={styles.yesButton}
              activeOpacity={0.8}
              onPress={safeConfirm}
              accessibilityRole="button"
              accessibilityLabel="Yes, Remove"
            >
              <Text style={styles.yesButtonText}>Yes, Remove</Text>
            </TouchableOpacity>

            {/* "No, Cancel It." (outlined grey pill) */}
            <TouchableOpacity
              style={styles.noButton}
              activeOpacity={0.8}
              onPress={safeCancel}
              accessibilityRole="button"
              accessibilityLabel="No, Cancel It."
            >
              <Text style={styles.noButtonText}>No, Cancel It.</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default RemoveStaffDialog;

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
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  },
  iconContainer: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  warningIcon: {
    width: 36,
    height: 36,
  },
  textContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  titleText: {
    fontFamily: FONT_MEDIUM,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: '#000000',
    textAlign: 'center',
    marginBottom: 6,
  },
  bodyText: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.2,
    color: 'rgba(96, 96, 102, 0.96)',
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  buttonsRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  yesButton: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(204, 41, 41, 0.9)',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  yesButtonText: {
    fontFamily: FONT_BUTTON,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
    color: 'rgba(204, 41, 41, 0.9)',
  },
  noButton: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noButtonText: {
    fontFamily: FONT_BUTTON,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
    color: 'rgba(96, 96, 102, 0.96)',
  },
});
