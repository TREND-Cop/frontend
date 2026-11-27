import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Platform,
  TouchableWithoutFeedback,
} from 'react-native';
import { triggerLightHaptic } from '../../utils/haptics';
import { useSingleFlight } from '../../utils/safeNavigation';

const FONT_MEDIUM = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium';
const FONT_REGULAR = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular';
const FONT_BUTTON = Platform.OS === 'ios' ? 'Inter' : 'Inter_500Medium';

export interface DeleteSearchConfirmModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  count?: number;
}

export const DeleteSearchConfirmModal: React.FC<DeleteSearchConfirmModalProps> = ({
  visible,
  onClose,
  onConfirm,
  count = 1,
}) => {
  const safeClose = useSingleFlight(() => {
    if (!visible) return;
    triggerLightHaptic();
    onClose();
  });
  const safeConfirm = useSingleFlight(() => {
    if (!visible) return;
    triggerLightHaptic();
    onConfirm();
  });

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={safeClose}>
      <View style={styles.modalOverlay}>
        <TouchableWithoutFeedback onPress={safeClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        <View style={styles.dialogBox}>
          {/* Title & Description Block */}
          <View style={styles.textBlock}>
            <Text style={styles.title}>
              {count > 1 ? `Delete ${count} searches?` : 'Delete this search?'}
            </Text>
            <Text style={styles.description}>
              Deleting your search history, you may loose all previous search.
            </Text>
          </View>

          {/* Action Buttons (Height 40px) */}
          <View style={styles.actionsRow}>
            {/* Cancel Button */}
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={safeClose}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            {/* Delete Button (Figma layer Book Now) */}
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={safeConfirm}
              activeOpacity={0.8}
            >
              <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    paddingHorizontal: 24,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  dialogBox: {
    width: 342,
    maxWidth: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    gap: 24,
    shadowColor: 'rgba(16, 24, 40, 0.08)',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 10,
  },
  textBlock: {
    width: '100%',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontFamily: FONT_MEDIUM,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    color: 'rgba(0, 8, 20, 0.96)',
    textAlign: 'center',
  },
  description: {
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    textAlign: 'center',
  },
  actionsRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
  },
  cancelButton: {
    flex: 1,
    height: 40,
    borderRadius: 24,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelText: {
    fontFamily: FONT_BUTTON,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
    color: 'rgba(204, 41, 41, 0.9)',
    textAlign: 'center',
  },
  deleteButton: {
    flex: 1,
    height: 40,
    borderRadius: 24,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteText: {
    fontFamily: FONT_BUTTON,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
    color: 'rgba(0, 8, 20, 0.96)',
    textAlign: 'center',
  },
});

