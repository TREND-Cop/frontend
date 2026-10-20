import React, { useState, useMemo } from 'react';
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
  KeyboardAvoidingView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';
import { STAFF_ROLE_GROUPS, StaffRoleItem } from '../../../constants/staffRoles';
import { triggerLightHaptic } from '../../../utils/haptics';

const FONT_MEDIUM = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium';
const FONT_REGULAR = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular';

export interface StaffRoleSheetProps {
  visible: boolean;
  selectedRoleName?: string;
  disabledRoleNames?: string[];
  onSelectRole: (role: StaffRoleItem) => void;
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
function RadioCheckIcon({ isSelected }: { isSelected: boolean }) {
  if (isSelected) {
    return (
      <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
        <Circle cx="12" cy="12" r="10" stroke="rgba(0, 8, 20, 0.96)" strokeWidth={1.5} />
        <Circle cx="12" cy="12" r="5" fill="rgba(0, 8, 20, 0.96)" />
      </Svg>
    );
  }
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke="rgba(192, 192, 204, 0.96)" strokeWidth={1.5} />
    </Svg>
  );
}

/**
 * 1:1 Figma StaffRoleSheet (Frames B1)
 *
 * Implements:
 * - Grouped sections with category headers
 * - Search by role name (case-insensitive, trimmed)
 * - Roles already selected in another slot are disabled / hidden
 * - Tapping a role selects it and closes the sheet immediately
 * - Keyboard avoiding view with smooth scrolling
 */
export const StaffRoleSheet: React.FC<StaffRoleSheetProps> = ({
  visible,
  selectedRoleName,
  disabledRoleNames = [],
  onSelectRole,
  onClose,
}) => {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');

  // Filter sections by search query and remove disabled roles
  const sections = useMemo(() => {
    const trimmed = searchQuery.trim().toLowerCase();

    return STAFF_ROLE_GROUPS.map((group) => {
      const filteredRoles = group.roles.filter((role) => {
        // Exclude if already selected in another slot
        if (disabledRoleNames.includes(role.name)) {
          return false;
        }
        if (!trimmed) return true;
        return role.name.toLowerCase().includes(trimmed);
      });

      return {
        id: group.id,
        title: group.groupName,
        data: filteredRoles,
      };
    }).filter((section) => section.data.length > 0);
  }, [searchQuery, disabledRoleNames]);

  const handleSelect = (role: StaffRoleItem) => {
    triggerLightHaptic();
    onSelectRole(role);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={[styles.sheetContainer, { paddingBottom: Math.max(insets.bottom, 24) }]}>
          {/* ── Header ── */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Staff Role</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.closeButton}
              onPress={onClose}
              accessible
              accessibilityRole="button"
              accessibilityLabel="Close staff role sheet"
            >
              <CloseIcon size={20} />
            </TouchableOpacity>
          </View>

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
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
              renderSectionHeader={({ section: { title } }) => (
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionHeaderText}>{title}</Text>
                </View>
              )}
              renderItem={({ item }) => {
                const isSelected = selectedRoleName === item.name;

                return (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    style={styles.roleRow}
                    onPress={() => handleSelect(item)}
                    accessible
                    accessibilityRole="radio"
                    accessibilityState={{ selected: isSelected }}
                    accessibilityLabel={item.name}
                  >
                    <Text
                      style={[
                        styles.roleName,
                        isSelected && styles.roleNameSelected,
                      ]}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {item.name}
                    </Text>
                    <RadioCheckIcon isSelected={isSelected} />
                  </TouchableOpacity>
                );
              }}
            />
          )}
        </View>
      </KeyboardAvoidingView>
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
    maxHeight: '85%',
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
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
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
    paddingBottom: 24,
  },
  sectionHeader: {
    paddingTop: 16,
    paddingBottom: 8,
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
});
