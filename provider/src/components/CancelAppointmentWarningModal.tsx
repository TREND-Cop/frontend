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
import { useSingleFlight } from '../utils/safeNavigation';

export interface CancelAppointmentWarningModalProps {
  visible: boolean;
  onDiscard: () => void;
  onConfirmCancel: () => void;
  title?: string;
  description?: string;
  confirmButtonText?: string;
  discardButtonText?: string;
  step?: 1 | 2;
  onProceedToStep2?: () => void;
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
 * 1:1 Figma Cancel Appointment Warning Modal
 * Handles Step 1 (First Warning: "You will loose this customer if you cancel")
 * and Step 2 (Confirmation Warning Popup with 40x40 alert icon: "Canceling this appointment, you may loose the client trust.")
 */
export const CancelAppointmentWarningModal: React.FC<CancelAppointmentWarningModalProps> = ({
  visible,
  onDiscard,
  onConfirmCancel,
  title,
  description,
  confirmButtonText,
  discardButtonText,
  step = 1,
  onProceedToStep2,
}) => {
  // Modal 1 vs Modal 2 copy based on 1:1 Figma CSS tokens
  const currentTitle = title || (step === 1 ? 'Cancel Appointment' : 'Cancel Appointment?');
  const currentDescription = description || (
    step === 1
      ? 'You will loose this customer if you cancel'
      : 'Canceling this appointment, you may loose the client trust.'
  );
  const currentCancelText = confirmButtonText || 'Cancel';
  const currentKeepText = discardButtonText || (step === 1 ? 'Keep' : 'Keep');

  const handleCancelClick = useSingleFlight(() => {
    if (!visible) return;
    if (step === 1 && onProceedToStep2) {
      onProceedToStep2();
    } else {
      onConfirmCancel();
    }
  });
  const handleDiscardClick = useSingleFlight(() => {
    if (!visible) return;
    onDiscard();
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleDiscardClick}
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={handleDiscardClick}>
        <View style={styles.modalBackdrop}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View style={[styles.popUpCard, step === 1 && styles.popUpCardStep1]}>
              {/* ── Rectangle 300: 40x40px Warning Icon (Shown in Step 2 per Figma) ── */}
              {step === 2 && (
                <View style={styles.iconContainer}>
                  <AlertTriangleIcon size={40} />
                </View>
              )}

              {/* ── Content Container (1:1 Figma tokens) ── */}
              <View style={[styles.contentFrame, step === 1 && styles.contentFrameStep1]}>
                {/* ── cancel description ── */}
                <View style={[styles.cancelDescription, step === 1 && styles.cancelDescriptionStep1]}>
                  {/* Cancel Appointment / Cancel Appointment? (16px 510/500) */}
                  <Text style={styles.titleText}>{currentTitle}</Text>

                  {/* Subtitle description (14px 400) */}
                  <Text style={styles.descriptionText}>{currentDescription}</Text>
                </View>

                {/* ── action buttons: width 268px (Step 1) / 310px (Step 2), height 40px ── */}
                <View style={[styles.actionButtonsRow, step === 1 && styles.actionButtonsRowStep1]}>
                  {/* Left: Cancel button (red text) */}
                  <TouchableOpacity
                    style={[styles.cancelButton, step === 1 && styles.cancelButtonStep1]}
                    activeOpacity={0.7}
                    onPress={handleCancelClick}
                  >
                    <Text style={styles.cancelButtonText}>{currentCancelText}</Text>
                  </TouchableOpacity>

                  {/* Right: Keep / Book Now button (dark text) */}
                  <TouchableOpacity
                    style={[styles.keepButton, step === 1 && styles.keepButtonStep1]}
                    activeOpacity={0.7}
                    onPress={handleDiscardClick}
                  >
                    <Text style={styles.keepButtonText}>{currentKeepText}</Text>
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
  actionButtonsRowStep1: {
    width: 268,
    maxWidth: '100%',
  },

  /* Step 1 Sizing */
  popUpCardStep1: {
    width: 300,
    height: 170,
    padding: 16,
    gap: 16,
  },
  contentFrameStep1: {
    width: 268,
    height: 138,
    gap: 16,
  },
  cancelDescriptionStep1: {
    width: 268,
    height: 72,
    gap: 8,
  },
  iconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* Buttons */
  cancelButton: {
    width: 145,
    height: 40,
    borderRadius: 24,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonStep1: {
    width: 120,
  },
  cancelButtonText: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
    color: 'rgba(204, 41, 41, 0.9)',
    includeFontPadding: false,
  },

  keepButton: {
    width: 145,
    height: 40,
    borderRadius: 24,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  keepButtonStep1: {
    width: 120,
  },
  keepButtonText: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
    color: 'rgba(0, 8, 20, 0.96)',
    includeFontPadding: false,
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
