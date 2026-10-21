import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SectionList,
  Modal,
  StyleSheet,
  Pressable,
  Platform,
  Keyboard,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';
import { STAFF_ROLE_GROUPS, StaffRoleItem } from '../../../constants/staffRoles';
import { triggerLightHaptic } from '../../../utils/haptics';

const FONT_MEDIUM = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium';
const FONT_REGULAR = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular';
const FONT_BUTTON = Platform.OS === 'ios' ? 'Inter' : 'Inter_500Medium';

export interface StaffRoleSheetProps {
  visible: boolean;
  mode?: 'add' | 'edit';
  selectedRoleName?: string;
  disabledRoleNames?: string[];
  currentRoles?: string[];
  onSelectRole?: (role: StaffRoleItem) => void;
  onConfirmRoles?: (roles: string[]) => void;
  onClose: () => void;
}

// ── Search Icon (20x20) ──
function SearchIcon({ size = 20, color = '#000000' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M21 21l-4.35-4.35M19 11a8 8 0 11-16 0 8 8 0 0116 0z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// ── Close / Cancel Icon (24x24) ──
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

// ── Radio Check Icon ──
function RadioCheckIcon({ isSelected, disabled }: { isSelected: boolean; disabled?: boolean }) {
  if (isSelected) {
    return (
      <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
        <Circle cx="12" cy="12" r="10" stroke="rgba(0, 8, 20, 0.96)" strokeWidth={1.5} />
        <Circle cx="12" cy="12" r="5" fill="rgba(0, 8, 20, 0.96)" />
      </Svg>
    );
  }
  const strokeColor = disabled ? 'rgba(235, 235, 245, 0.96)' : 'rgba(192, 192, 204, 0.96)';
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke={strokeColor} strokeWidth={1.5} />
    </Svg>
  );
}

// ── Red Circle ✕ Badge Icon (24x24) ──
function CircleXBadgeIcon({ size = 24 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" fill="rgba(204, 41, 41, 0.9)" />
      <Path
        d="M9 9l6 6M15 9l-6 6"
        stroke="#FFFFFF"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </Svg>
  );
}

/**
 * 1:1 Figma StaffRoleSheet (Frames B1 in Add mode, Frame E2 in Edit mode)
 *
 * Implements:
 * - mode === 'add' (default):
 *   - Selects 1 role for a slot, closes immediately
 * - mode === 'edit':
 *   - "Current Staff Role" section with chips + red ✕
 *   - "Select Staff Role" section with search and grouped list
 *   - Tapping role adds chip (max 3)
 *   - Bottom "Confirm" button (active when valid & changed)
 */
export const StaffRoleSheet: React.FC<StaffRoleSheetProps> = ({
  visible,
  mode = 'add',
  selectedRoleName,
  disabledRoleNames = [],
  currentRoles = [],
  onSelectRole,
  onConfirmRoles,
  onClose,
}) => {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // Keyboard height handling
  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (e) => {
      if (e?.endCoordinates?.height) {
        setKeyboardHeight(e.endCoordinates.height);
      }
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Edit mode working copy
  const [workingRoles, setWorkingRoles] = useState<string[]>([]);

  useEffect(() => {
    if (!visible) {
      setKeyboardHeight(0);
      return;
    }
    if (mode === 'edit') {
      setWorkingRoles(currentRoles ? [...currentRoles] : []);
      setSearchQuery('');
    }
  }, [visible, mode, currentRoles]);

  // Combined disabled list: in add mode disabledRoleNames; in edit mode workingRoles
  const activeDisabledRoles = useMemo(() => {
    if (mode === 'edit') {
      return workingRoles;
    }
    return disabledRoleNames;
  }, [mode, workingRoles, disabledRoleNames]);

  // Filter sections by search query
  const sections = useMemo(() => {
    const trimmed = searchQuery.trim().toLowerCase();

    return STAFF_ROLE_GROUPS.map((group) => {
      const filteredRoles = group.roles.filter((role) => {
        if (!trimmed) return true;
        return role.name.toLowerCase().includes(trimmed);
      });

      return {
        id: group.id,
        title: group.groupName,
        data: filteredRoles,
      };
    }).filter((section) => section.data.length > 0);
  }, [searchQuery]);

  const handleSelect = (role: StaffRoleItem) => {
    triggerLightHaptic();
    if (mode === 'edit') {
      if (workingRoles.includes(role.name)) {
        return;
      }
      if (workingRoles.length >= 3) {
        return;
      }
      setWorkingRoles((prev) => [...prev, role.name]);
    } else {
      Keyboard.dismiss();
      onSelectRole?.(role);
      onClose();
    }
  };

  const handleRemoveRole = (roleName: string) => {
    triggerLightHaptic();
    setWorkingRoles((prev) => prev.filter((r) => r !== roleName));
  };

  const isChanged = useMemo(() => {
    if (!currentRoles) return workingRoles.length > 0;
    if (workingRoles.length !== currentRoles.length) return true;
    return workingRoles.some((r, i) => r !== currentRoles[i]);
  }, [workingRoles, currentRoles]);

  const canConfirm = workingRoles.length >= 1 && isChanged;

  const handleConfirm = () => {
    if (!canConfirm) return;
    triggerLightHaptic();
    Keyboard.dismiss();
    onConfirmRoles?.(workingRoles);
    onClose();
  };

  const handleDismiss = () => {
    Keyboard.dismiss();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={handleDismiss}
    >
      <View
        style={[
          styles.overlay,
          keyboardHeight > 0 ? { paddingBottom: keyboardHeight } : null,
        ]}
      >
        <Pressable style={styles.backdrop} onPress={handleDismiss} />

        <View
          style={[
            styles.sheetContainer,
            keyboardHeight > 0
              ? {
                  maxHeight: Dimensions.get('window').height - keyboardHeight - (insets.top || 20),
                }
              : null,
            { paddingBottom: keyboardHeight > 0 ? 8 : Math.max(insets.bottom, 24) },
          ]}
        >
          {/* ── Header ── */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Staff Role</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.closeButton}
              onPress={handleDismiss}
              accessible
              accessibilityRole="button"
              accessibilityLabel="Close staff role sheet"
            >
              <CloseIcon size={20} />
            </TouchableOpacity>
          </View>

          {/* ── Edit Mode: Current Staff Role section (Frame E2) ── */}
          {mode === 'edit' && (
            <View style={styles.currentSection}>
              <Text style={styles.sectionHeading}>Current Staff Role</Text>
              <View style={styles.chipsRow}>
                {workingRoles.map((roleName) => (
                  <View key={roleName} style={styles.roleChip}>
                    <Text style={styles.roleChipText} numberOfLines={1}>
                      {roleName}
                    </Text>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => handleRemoveRole(roleName)}
                      accessibilityRole="button"
                      accessibilityLabel={`Remove ${roleName}`}
                    >
                      <CircleXBadgeIcon size={24} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>

              <Text style={styles.sectionHeading}>Select Staff Role</Text>
              <Text style={styles.helperText}>
                What is the role of this staff in your business
              </Text>
            </View>
          )}

          {/* ── Search Bar ── */}
          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <SearchIcon size={20} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search here.."
                placeholderTextColor="rgba(96, 96, 102, 0.96)"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCorrect={false}
                clearButtonMode="while-editing"
                accessible
                accessibilityLabel="Search staff role"
              />
            </View>
          </View>

          {/* ── Roles Grouped List ── */}
          {sections.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No roles found matching "{searchQuery}"</Text>
            </View>
          ) : (
            <SectionList
              sections={sections}
              keyExtractor={(item) => item.id}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
              renderSectionHeader={({ section: { title } }) => (
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionHeaderText}>{title}</Text>
                </View>
              )}
              renderItem={({ item }) => {
                const isSelectedInAdd = mode === 'add' && selectedRoleName === item.name;
                const isAlreadyAdded = activeDisabledRoles.includes(item.name);
                const isRowDisabled = isAlreadyAdded;

                return (
                  <TouchableOpacity
                    activeOpacity={isRowDisabled ? 1 : 0.7}
                    style={[styles.roleRow, isRowDisabled && styles.roleRowDisabled]}
                    onPress={() => !isRowDisabled && handleSelect(item)}
                    disabled={isRowDisabled}
                    accessible
                    accessibilityRole="radio"
                    accessibilityState={{ selected: isSelectedInAdd || isAlreadyAdded }}
                    accessibilityLabel={item.name}
                  >
                    <Text
                      style={[
                        styles.roleName,
                        (isSelectedInAdd || isAlreadyAdded) && styles.roleNameSelected,
                        isRowDisabled && styles.roleNameDisabled,
                      ]}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {item.name}
                    </Text>
                    <RadioCheckIcon
                      isSelected={isSelectedInAdd || isAlreadyAdded}
                      disabled={isRowDisabled}
                    />
                  </TouchableOpacity>
                );
              }}
            />
          )}

          {/* ── Edit Mode: Confirm Button (Frame E2) ── */}
          {mode === 'edit' && (
            <View style={styles.confirmButtonContainer}>
              <TouchableOpacity
                activeOpacity={canConfirm ? 0.85 : 1}
                style={[
                  styles.confirmButton,
                  canConfirm ? styles.confirmButtonActive : styles.confirmButtonDisabled,
                ]}
                onPress={handleConfirm}
                accessibilityRole="button"
                accessibilityLabel="Confirm"
                accessibilityState={{ disabled: !canConfirm }}
              >
                <Text
                  style={[
                    styles.confirmButtonText,
                    canConfirm ? styles.confirmTextActive : styles.confirmTextDisabled,
                  ]}
                >
                  Confirm
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default StaffRoleSheet;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '88%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  header: {
    height: 66,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(235, 235, 245, 0.96)',
    paddingHorizontal: 16,
    position: 'relative',
  },
  headerTitle: {
    fontFamily: FONT_MEDIUM,
    fontSize: 17,
    lineHeight: 24,
    letterSpacing: 0.2,
    color: '#000000',
    textAlign: 'center',
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  currentSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  sectionHeading: {
    fontFamily: FONT_MEDIUM,
    fontWeight: '500',
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.2,
    color: '#000000',
    marginBottom: 8,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  roleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    minWidth: 140,
    gap: 12,
  },
  roleChipText: {
    fontFamily: FONT_REGULAR,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  helperText: {
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    marginBottom: 12,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchBar: {
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    backgroundColor: 'rgba(248, 249, 250, 0.98)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontFamily: FONT_REGULAR,
    fontSize: 15,
    color: '#000000',
    paddingVertical: 0,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  sectionHeader: {
    paddingTop: 12,
    paddingBottom: 6,
    backgroundColor: '#FFFFFF',
  },
  sectionHeaderText: {
    fontFamily: FONT_MEDIUM,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: Platform.OS === 'ios' ? 0.5 : 0.2,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  roleRow: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  roleRowDisabled: {
    opacity: 0.4,
  },
  roleName: {
    flex: 1,
    fontFamily: FONT_REGULAR,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: '#000000',
    marginRight: 12,
  },
  roleNameSelected: {
    fontFamily: FONT_MEDIUM,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  roleNameDisabled: {
    color: 'rgba(96, 96, 102, 0.96)',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(96, 96, 102, 0.96)',
    textAlign: 'center',
  },
  confirmButtonContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(235, 235, 245, 0.96)',
    backgroundColor: '#FFFFFF',
  },
  confirmButton: {
    width: '100%',
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonActive: {
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
  },
  confirmButtonDisabled: {
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
  },
  confirmButtonText: {
    fontFamily: FONT_BUTTON,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
  },
  confirmTextActive: {
    color: '#FFFFFF',
  },
  confirmTextDisabled: {
    color: 'rgba(192, 192, 204, 0.96)',
  },
});
