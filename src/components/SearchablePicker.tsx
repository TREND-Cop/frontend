/**
 * SearchablePicker — Modal bottom-sheet picker with search functionality.
 *
 * Used in UserLocationScreen for country and state selection.
 * Displays a scrollable list of items with a search bar at the top.
 *
 * Features:
 * - Search/filter input to narrow down the list
 * - Scrollable list of items with optional left icon (e.g. flag emoji)
 * - Selected item highlighting
 * - Close button to dismiss without selection
 *
 * Usage:
 *   <SearchablePicker
 *     visible={showCountryPicker}
 *     title="Select Country"
 *     items={countries.map(c => ({ label: c.name, value: c.isoCode, icon: c.flag }))}
 *     selectedValue={selectedCountry}
 *     onSelect={(value) => setSelectedCountry(value)}
 *     onClose={() => setShowCountryPicker(false)}
 *   />
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  StyleSheet,
  SafeAreaView,
  Pressable,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, typography, radius, spacing, shadows } from '../constants/theme';

/** Represents a single item in the picker list */
export interface PickerItem {
  /** Display label (e.g. "Nigeria") */
  label: string;
  /** Unique value for selection (e.g. "NG") */
  value: string;
  /** Optional icon displayed to the left of the label (e.g. "🇳🇬") */
  icon?: string;
}

interface SearchablePickerProps {
  /** Whether the picker modal is visible */
  visible: boolean;
  /** Title shown at the top of the picker (e.g. "Select Country") */
  title: string;
  /** List of items to display in the picker */
  items: PickerItem[];
  /** Currently selected item value */
  selectedValue?: string;
  /** Called when the user selects an item */
  onSelect: (value: string, label: string) => void;
  /** Called when the user closes the picker without selecting */
  onClose: () => void;
}

export const SearchablePicker: React.FC<SearchablePickerProps> = ({
  visible,
  title,
  items,
  selectedValue,
  onSelect,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter items based on search query (case-insensitive)
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const query = searchQuery.toLowerCase();
    return items.filter((item) => item.label.toLowerCase().includes(query));
  }, [items, searchQuery]);

  /**
   * Renders a single item row in the picker list.
   */
  const renderItem = ({ item }: { item: PickerItem }) => {
    const isSelected = item.value === selectedValue;

    return (
      <TouchableOpacity
        style={[styles.itemRow, isSelected && styles.itemRowSelected]}
        onPress={() => {
          onSelect(item.value, item.label);
          setSearchQuery(''); // Reset search on selection
        }}
        activeOpacity={0.7}
      >
        {/* Optional icon (e.g. country flag) */}
        {item.icon && <Text style={styles.itemIcon}>{item.icon}</Text>}

        {/* Item label */}
        <Text
          style={[styles.itemLabel, isSelected && styles.itemLabelSelected]}
        >
          {item.label}
        </Text>

        {/* Checkmark for selected item */}
        {isSelected && <Text style={styles.selectedCheck}>✓</Text>}
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <SafeAreaView style={styles.sheetContainer} pointerEvents="box-none">
          {/* ─── Drag Handle ────────────────────────────────────────────── */}
          <View style={styles.dragHandleContainer}>
            <View style={styles.dragHandle} />
          </View>

          {/* ─── Search Input ───────────────────────────────────────── */}
          <View style={styles.searchContainer}>
            <Feather name="search" size={20} color="#000000" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search here.."
              placeholderTextColor="rgba(96, 96, 102, 0.96)"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* ─── Item List ──────────────────────────────────────────── */}
          <FlatList
            data={filteredItems}
            renderItem={renderItem}
            keyExtractor={(item) => item.value}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No results found</Text>
              </View>
            }
          />
        </SafeAreaView>
      </View>
    </Modal>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // ── Overlay ─────────────────────────────────────────────────────────────
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },

  // ── Sheet Container ────────────────────────────────────────────────────
  sheetContainer: {
    backgroundColor: colors.appBackground,
    borderTopLeftRadius: radius.large,
    borderTopRightRadius: radius.large,
    maxHeight: '80%',
    paddingBottom: 20,
  },

  // ── Drag Handle ─────────────────────────────────────────────────────────
  dragHandleContainer: {
    alignItems: 'center',
    paddingVertical: 12, // Space around the handle
  },
  dragHandle: {
    width: 36,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: 'rgba(219, 219, 219, 0.96)', // A light grey for the drag handle
  },

  // ── Search ──────────────────────────────────────────────────────────────
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.buttonPadding,
    marginTop: 8, // Roughly 36px from top when combined with drag handle padding
    marginBottom: 24, // Space before list
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    borderRadius: 24,
    paddingHorizontal: 16,
    height: 48,
    gap: 16, // Space between icon and text
  },
  searchIcon: {
    // Icon styles handled by Feather size/color props mostly
  },
  searchInput: {
    flex: 1,
    ...typography.bodyRegular,
    color: '#000000',
    paddingVertical: 0,
    // @ts-ignore: outlineStyle is a web-only property
    outlineStyle: 'none',
  },

  // ── List Items ──────────────────────────────────────────────────────────
  listContent: {
    paddingHorizontal: spacing.buttonPadding,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    // Removed borderBottomWidth
  },
  itemRowSelected: {
    backgroundColor: colors.successBackground,
  },
  itemIcon: {
    fontSize: 22,
    marginRight: 12,
  },
  itemLabel: {
    ...typography.bodyRegular,
    color: '#000000',
    flex: 1,
  },
  itemLabelSelected: {
    ...typography.bodyMed,
    color: colors.primary,
  },
  selectedCheck: {
    fontSize: 16,
    color: colors.successVibrant,
    marginLeft: 8,
  },

  // ── Empty State ─────────────────────────────────────────────────────────
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    ...typography.bodyRegular,
    color: colors.primarySupportText,
  },
});
