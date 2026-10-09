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
import Svg, { Path, Rect, Circle, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';

export interface CancelAppointmentWarningModalProps {
  visible: boolean;
  onDiscard: () => void;
  onConfirmCancel: () => void;
  title?: string;
  description?: string;
  confirmButtonText?: string;
  discardButtonText?: string;
}

/**
 * 1:1 Figma Red 3D Warning Triangle Icon (40x40px)
 */
function AlertTriangleIcon({ size = 40 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <Defs>
        <SvgLinearGradient id="alertGrad" x1="20" y1="4" x2="20" y2="36" gradientUnits="userSpaceOnUse">
          <Stop offset="0%" stopColor="#EA4343" />
          <Stop offset="100%" stopColor="#C92020" />
        </SvgLinearGradient>
      </Defs>
      {/* 3D-effect bottom base shadow */}
      <Path
        d="M20 5.5L35.5 32.5C36.3 33.9 35.3 35.5 33.7 35.5H6.3C4.7 35.5 3.7 33.9 4.5 32.5L20 5.5Z"
        fill="rgba(0,0,0,0.12)"
        transform="matrix(1 0 0 1 0 1.5)"
      />
      {/* Main Triangle */}
      <Path
        d="M17.4019 6.5C18.5566 4.5 21.4434 4.5 22.5981 6.5L36.4545 30.5C37.6092 32.5 36.1658 35 33.8564 35H6.14359C3.83419 35 2.39082 32.5 3.54552 30.5L17.4019 6.5Z"
        fill="url(#alertGrad)"
      />
      {/* Exclamation Bar */}
      <Rect x="18.5" y="14" width="3" height="10" rx="1.5" fill="#FFFFFF" />
      {/* Exclamation Dot */}
      <Circle cx="20" cy="28" r="1.75" fill="#FFFFFF" />
    </Svg>
  );
}

/**
 * 1:1 Figma Cancel Appointment Warning Modal (342x232px)
 * Rendered when the provider taps "Cancel" on an appointment.
 */
export const CancelAppointmentWarningModal: React.FC<CancelAppointmentWarningModalProps> = ({
  visible,
  onDiscard,
  onConfirmCancel,
  title = 'Cancel Appointment?',
  description = 'Canceling this appointment, you may loose the client trust.',
  confirmButtonText = 'Yes, Cancel it.',
  discardButtonText = 'No, Don’t cancel',
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDiscard}
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={onDiscard}>
        <View style={styles.modalBackdrop}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View style={styles.popUpCard}>
              {/* ── Rectangle 300: 40x40px Warning Icon ── */}
              <AlertTriangleIcon size={40} />

              {/* ── Frame 1000006539: 310x144px ── */}
              <View style={styles.contentFrame}>
                {/* ── cancel description: 310x80px ── */}
                <View style={styles.cancelDescription}>
                  {/* Cancel Appointment? (16px 510/500) */}
                  <Text style={styles.titleText}>{title}</Text>

                  {/* Canceling this appointment, you may loose the client trust. (14px 400) */}
                  <Text style={styles.descriptionText}>{description}</Text>
                </View>

                {/* ── action buttons: 310x40px ── */}
                <View style={styles.actionButtonsRow}>
                  {/* Left: Yes, Cancel it. (139x40px) */}
                  <TouchableOpacity
                    style={styles.confirmCancelButton}
                    activeOpacity={0.7}
                    onPress={onConfirmCancel}
                  >
                    <Text style={styles.confirmCancelButtonText}>{confirmButtonText}</Text>
                  </TouchableOpacity>

                  {/* Right: No, Don't cancel (151x40px) */}
                  <TouchableOpacity
                    style={styles.discardCancelButton}
                    activeOpacity={0.7}
                    onPress={onDiscard}
                  >
                    <Text style={styles.discardCancelButtonText}>{discardButtonText}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 8, 20, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },

  /* pop up (342x232px, 1:1 Figma Converter) */
  popUpCard: {
    width: 342,
    maxWidth: '100%',
    height: 232,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.15,
        shadowRadius: 24,
      },
      android: {
        elevation: 10,
      },
    }),
  },

  /* Frame 1000006539 (310x144px, gap: 24px, 1:1 Figma) */
  contentFrame: {
    width: 310,
    maxWidth: '100%',
    height: 144,
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 24,
  },

  /* cancel description (310x80px, gap: 16px, 1:1 Figma) */
  cancelDescription: {
    width: 310,
    maxWidth: '100%',
    height: 80,
    flexDirection: 'column',
    alignItems: 'center',
    gap: 16,
  },

  /* Cancel Appointment? (16px SF Pro 510 / DM Sans 500, line-height 24px) */
  titleText: {
    width: 310,
    maxWidth: '100%',
    height: 24,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: Platform.OS === 'ios' ? 0.5 : 0.2,
    textAlign: 'center',
    color: 'rgba(0, 8, 20, 0.96)',
    includeFontPadding: false,
  },

  /* Canceling this appointment, you may loose the client trust. (14px SF Pro 400 / DM Sans 400, line-height 20px) */
  descriptionText: {
    width: 310,
    maxWidth: '100%',
    height: 40,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    textAlign: 'center',
    color: 'rgba(96, 96, 102, 0.96)',
    includeFontPadding: false,
  },

  /* action buttons (310x40px, 1:1 Figma) */
  actionButtonsRow: {
    width: 310,
    maxWidth: '100%',
    height: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  /* Filled action Button (Left - Cancel: 139x40px, 1:1 Figma) */
  confirmCancelButton: {
    width: 139,
    height: 40,
    borderRadius: 24,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* Yes, Cancel it. text (Inter 500, 16px, line-height 24px, red) */
  confirmCancelButtonText: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
    color: 'rgba(204, 41, 41, 0.9)',
    includeFontPadding: false,
  },

  /* Filled action Button (Right - No, Don't cancel: 151x40px, 1:1 Figma) */
  discardCancelButton: {
    width: 151,
    height: 40,
    borderRadius: 24,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* No, Don't cancel text (Inter 500, 16px, line-height 24px, grey) */
  discardCancelButtonText: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
    color: 'rgba(96, 96, 102, 0.96)',
    includeFontPadding: false,
  },
});

export default CancelAppointmentWarningModal;
