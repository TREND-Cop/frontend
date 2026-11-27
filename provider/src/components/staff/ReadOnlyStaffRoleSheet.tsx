import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';
import { triggerLightHaptic } from '../../utils/haptics';

const FONT_MEDIUM = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium';
const FONT_REGULAR = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular';

export interface ReadOnlyStaffRoleSheetProps {
  visible: boolean;
  roles: string[];
  onClose: () => void;
}

// ── Close Icon (cancel-01, 24x24) ──
function CloseIcon({ size = 24 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M18 6L6 18M6 6l12 12"
        stroke="#141B34"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// ── checkmark-circle-02 (24x24, dark circle with white check) ──
function DarkCheckCircleIcon({ size = 24 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" fill="rgba(0, 8, 20, 0.96)" />
      <Path
        d="M8 12.2l2.8 2.8L16.5 9"
        stroke="#FFFFFF"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * 1:1 Figma Read-Only Staff Role Bottom Sheet (Frame D3)
 *
 * Implements:
 * - Opened by tapping the role dropdown arrow beside the staff role in the profile card
 * - Header: "Staff Role" (17px 500) and Close "X" button (40x40 circle)
 * - One row per role the member has, each with dark checkmark circle
 * - Closes with X, backdrop press, or swipe down
 * - Read-only: no Confirm button, no editing
 */
export const ReadOnlyStaffRoleSheet: React.FC<ReadOnlyStaffRoleSheetProps> = ({
  visible,
  roles,
  onClose,
}) => {
  const insets = useSafeAreaInsets();

  const handleClose = () => {
    triggerLightHaptic();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.backdropOverlay}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={handleClose}
          accessibilityLabel="Dismiss staff role sheet"
        />

        {/* ── Sheet Container ── */}
        <View
          style={[
            styles.sheetContainer,
            { paddingBottom: insets.bottom + 16 },
          ]}
        >
          {/* ── Header (62px) ── */}
          <View style={styles.header}>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>Staff Role</Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.closeButton}
              onPress={handleClose}
              accessibilityRole="button"
              accessibilityLabel="Close staff role sheet"
            >
              <CloseIcon size={24} />
            </TouchableOpacity>
          </View>

          {/* ── Roles Rows ── */}
          <View style={styles.rolesList}>
            {roles.map((roleName, index) => (
              <View key={`${roleName}_${index}`} style={styles.roleRow}>
                <Text style={styles.roleText}>{roleName}</Text>
                <DarkCheckCircleIcon size={24} />
              </View>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ReadOnlyStaffRoleSheet;

const styles = StyleSheet.create({
  backdropOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 0,
  },
  header: {
    height: 62,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(235, 235, 245, 0.96)',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
    paddingLeft: 40, // Balances right 40px close button
  },
  headerTitle: {
    fontFamily: FONT_MEDIUM,
    fontWeight: '500',
    fontSize: 17,
    lineHeight: 24,
    letterSpacing: 0.2,
    color: '#000000',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 24,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rolesList: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 8,
  },
  roleRow: {
    width: '100%',
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },
  roleText: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: '#000000',
  },
});
