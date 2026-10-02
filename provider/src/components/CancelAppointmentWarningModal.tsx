import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Platform,
  Dimensions,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = Math.min(358, SCREEN_WIDTH - 32);

export interface CancelAppointmentWarningModalProps {
  visible: boolean;
  onDiscard: () => void;
  onConfirmCancel: () => void;
}

/**
 * 1:1 Figma Delete Warning Popup
 * Rendered when the provider taps "Cancel" on an appointment.
 */
export const CancelAppointmentWarningModal: React.FC<CancelAppointmentWarningModalProps> = ({
  visible,
  onDiscard,
  onConfirmCancel,
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
            <View style={styles.deleteWarningPopup}>
              {/* ── warning block ── */}
              <View style={styles.warningBlock}>
                {/* Cancel Appointment */}
                <Text style={styles.cancelAppointmentTitle}>
                  Cancel Appointment
                </Text>

                {/* Changeling this appointment, you might loose this customer trust. */}
                <Text style={styles.warningDescription}>
                  Changeling this appointment, you might loose this customer trust.
                </Text>
              </View>

              {/* ── buttons row ── */}
              <View style={styles.buttonsRow}>
                {/* Discard button */}
                <TouchableOpacity
                  style={styles.discardButton}
                  activeOpacity={0.7}
                  onPress={onDiscard}
                >
                  <Text style={styles.discardButtonText}>Discard</Text>
                </TouchableOpacity>

                {/* Line 185 vertical divider */}
                <View style={styles.line185} />

                {/* Cancel button */}
                <TouchableOpacity
                  style={styles.cancelButton}
                  activeOpacity={0.7}
                  onPress={onConfirmCancel}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
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

  /* delete warning popup (1:1 Figma Converter) */
  deleteWarningPopup: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    gap: 24,
    width: CARD_WIDTH,
    maxWidth: 358,
    minHeight: 218,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
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

  /* warning (1:1 Figma Converter) */
  warningBlock: {
    flexDirection: 'column',
    alignItems: 'center',
    padding: 0,
    gap: 19,
    width: '100%',
    maxWidth: 326,
    alignSelf: 'stretch',
  },

  /* Cancel Appointment (1:1 Figma Converter) */
  cancelAppointmentTitle: {
    width: '100%',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 20,
    lineHeight: 28,
    textAlign: 'center',
    letterSpacing: 0.2,
    color: 'rgba(204, 41, 41, 0.9)',
    includeFontPadding: false,
  },

  /* Changeling this appointment, you might loose this customer trust. (1:1 Figma Converter) */
  warningDescription: {
    width: '100%',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    includeFontPadding: false,
  },

  /* buttons (1:1 Figma Converter) */
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 0,
    width: '100%',
    maxWidth: 326,
    height: 48,
    alignSelf: 'stretch',
  },

  /* cancel button [Discard in UI] (1:1 Figma Converter) */
  discardButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    width: 127,
    height: 48,
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
  },

  /* Discard text (1:1 Figma Converter) */
  discardButtonText: {
    width: 60,
    height: 24,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    includeFontPadding: false,
  },

  /* Line 185 (1:1 Figma Converter) */
  line185: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(235, 235, 245, 0.96)',
  },

  /* delete button [Cancel in UI] (1:1 Figma Converter) */
  cancelButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    width: 123,
    height: 48,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderRadius: 24,
  },

  /* Cancel text (1:1 Figma Converter) */
  cancelButtonText: {
    width: 54,
    height: 24,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    letterSpacing: 0.4,
    color: 'rgba(204, 41, 41, 0.9)',
    includeFontPadding: false,
  },
});

export default CancelAppointmentWarningModal;
