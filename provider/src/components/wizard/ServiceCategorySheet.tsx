import React, { useState, useMemo, useEffect, useRef } from 'react';
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
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';
import {
  SERVICE_CATEGORIES,
  ServiceCategoryGroup,
  ServiceCategoryItem,
  getCategoryIcon,
} from '../../constants/serviceCategories';
import { triggerLightHaptic } from '../../utils/haptics';

export interface ServiceCategorySheetProps {
  visible: boolean;
  selectedItemId?: string;
  onSelectCategory: (category: { id: string; groupName: string; itemName: string }) => void;
  onClose: () => void;
}

const FONT_MEDIUM = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium';
const FONT_REGULAR = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular';

// ── Search Icon (24x24, stroke 1.5px #000000) ─────────────────────────────────
function SearchIcon({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M21 21l-4.35-4.35M19 11a8 8 0 11-16 0 8 8 0 0116 0z"
        stroke="#000000"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// ── Cancel/Close Icon (24x24, stroke 1.5px #141B34) ───────────────────────────
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

// ── Clear Icon (16x16) ────────────────────────────────────────────────────────
function ClearIcon({ size = 16 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Path
        d="M3 3l10 10M13 3L3 13"
        stroke="rgba(96, 96, 102, 0.96)"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// ── Radio Checkmark Circle (24x24) for Service Items ──────────────────────────
function RadioCheckIcon({ isSelected }: { isSelected: boolean }) {
  if (isSelected) {
    return (
      <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
        <Circle cx="12" cy="12" r="10" fill="#0C790C" />
        <Path
          d="M8 12l2.83 2.83L16.5 9.17"
          stroke="#FFFFFF"
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    );
  }
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9.25" stroke="rgba(192, 192, 204, 0.96)" strokeWidth={1.5} />
    </Svg>
  );
}

// ── Exact 1:1 Figma Category Group Icon (24x24 inside 40x40 circle) ───────────
function CategoryGroupIcon({
  iconName,
  image,
  size = 24,
}: {
  iconName?: string;
  image?: any;
  size?: number;
}) {
  const iconSource = image || (iconName ? getCategoryIcon(iconName) : null);
  if (!iconSource) {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6z"
          stroke="rgba(96, 96, 102, 0.96)"
          strokeWidth={1.5}
          strokeLinecap="round"
        />
        <Path
          d="M9 12h6M12 9v6"
          stroke="rgba(96, 96, 102, 0.96)"
          strokeWidth={1.5}
          strokeLinecap="round"
        />
      </Svg>
    );
  }
  return (
    <Image
      source={iconSource}
      style={{ width: size, height: size, borderRadius: 4 }}
      resizeMode="contain"
    />
  );
}

/**
 * 1:1 Figma ServiceCategorySheet
 *
 * Implements:
 * - Near full-height bottom sheet with 24px top radius and shadow
 * - Header: centered "Service Category" (16px 500), circular 40x40 close button with ✕ icon
 * - "Search here.." search input with search icon
 * - Grouped SectionList containing 9 category groups and indented items
 * - Case-insensitive trimmed search matching item labels
 * - Keyboard visibility management and smooth scrolling
 * - Minimal theme "No results found" row when search yields no matches
 */
export const ServiceCategorySheet: React.FC<ServiceCategorySheetProps> = ({
  visible,
  selectedItemId,
  onSelectCategory,
  onClose,
}) => {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const searchInputRef = useRef<TextInput>(null);

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

  // Filter sections by item label (trimmed, case-insensitive)
  const filteredSections = useMemo(() => {
    const trimmed = searchQuery.trim().toLowerCase();
    if (!trimmed) {
      return SERVICE_CATEGORIES.map((group) => ({
        ...group,
        data: group.items,
      }));
    }

    const result: (ServiceCategoryGroup & { data: ServiceCategoryItem[] })[] = [];
    for (const group of SERVICE_CATEGORIES) {
      const matchingItems = group.items.filter((item) =>
        item.name.toLowerCase().includes(trimmed)
      );
      if (matchingItems.length > 0) {
        result.push({
          ...group,
          data: matchingItems,
        });
      }
    }
    return result;
  }, [searchQuery]);

  const totalResultsCount = useMemo(() => {
    return filteredSections.reduce((acc, curr) => acc + curr.data.length, 0);
  }, [filteredSections]);

  const handleSelectItem = (group: ServiceCategoryGroup, item: ServiceCategoryItem) => {
    triggerLightHaptic();
    onSelectCategory({
      id: item.id,
      groupName: group.name,
      itemName: item.name,
    });
    setSearchQuery('');
    onClose();
  };

  const handleClose = () => {
    triggerLightHaptic();
    setSearchQuery('');
    onClose();
  };

  const maxSheetHeight =
    keyboardHeight > 0
      ? Dimensions.get('window').height - keyboardHeight - (insets.top || 20)
      : Dimensions.get('window').height * 0.88;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <View
        style={[
          styles.overlay,
          keyboardHeight > 0 ? { paddingBottom: keyboardHeight } : null,
        ]}
      >
        <Pressable style={styles.backdrop} onPress={handleClose} />

        <View
          style={[
            styles.sheetContainer,
            {
              maxHeight: maxSheetHeight,
              paddingBottom: Math.max(insets.bottom, 16),
            },
          ]}
        >
          {/* ── Header (height: 66px, borderBottom 1px solid rgba(235, 235, 245, 0.96)) ── */}
          <View style={styles.header}>
            <View style={styles.headerLeftSpacer} />
            <Text style={styles.headerTitle}>Service Category</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleClose}
              style={styles.closeButton}
              accessibilityLabel="Close category selection"
            >
              <CloseIcon size={24} />
            </TouchableOpacity>
          </View>

          {/* ── Search Bar (width: 358px, height: 48px, top: 90px in frame) ── */}
          <View style={styles.searchBarWrapper}>
            <View style={styles.searchBar}>
              <SearchIcon size={20} />
              <TextInput
                ref={searchInputRef}
                style={styles.searchInput}
                placeholder="Search here.."
                placeholderTextColor="rgba(96, 96, 102, 0.96)"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="search"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => setSearchQuery('')}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  activeOpacity={0.7}
                >
                  <ClearIcon size={16} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* ── Grouped SectionList ── */}
          <SectionList
            sections={filteredSections}
            keyExtractor={(item) => item.id}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            renderSectionHeader={({ section }) => (
              <View style={styles.groupHeader}>
                <View style={styles.groupIconContainer}>
                  <CategoryGroupIcon iconName={section.iconName} image={section.image} size={24} />
                </View>
                <Text style={styles.groupHeaderText}>{section.name}</Text>
              </View>
            )}
            renderItem={({ item, section }) => {
              const isSelected = selectedItemId === item.id;
              return (
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={[styles.itemRow, isSelected && styles.itemRowSelected]}
                  onPress={() => handleSelectItem(section, item)}
                >
                  <Text
                    style={[
                      styles.itemText,
                      isSelected && styles.itemTextSelected,
                    ]}
                    numberOfLines={1}
                  >
                    {item.name}
                  </Text>
                  <RadioCheckIcon isSelected={isSelected} />
                </TouchableOpacity>
              );
            }}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No results found</Text>
              </View>
            }
          />
        </View>
      </View>
    </Modal>
  );
};

export default ServiceCategorySheet;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  sheetContainer: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    shadowColor: 'rgba(133, 139, 148, 0.12)',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 15,
  },

  /* Header: 66px height, padding: 10px 16px, borderBottom 1px solid rgba(235, 235, 245, 0.96) */
  header: {
    width: '100%',
    height: 66,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(235, 235, 245, 0.96)',
    backgroundColor: '#FFFFFF',
  },
  headerLeftSpacer: {
    width: 40,
  },
  /* Title: 16px SF Pro 510/500, line-height 24px, letter-spacing 0.5px, color #000000 */
  headerTitle: {
    fontFamily: FONT_MEDIUM,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    color: '#000000',
    textAlign: 'center',
    includeFontPadding: false,
  },
  /* close button: 40x40px, radius 24px, background rgba(247, 247, 247, 0.96) */
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 24,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Search bar wrapper */
  searchBarWrapper: {
    width: '100%',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  /* search bar & filter icon: height 48px, radius 24px, background rgba(248, 249, 250, 0.98), border 1px solid rgba(192, 192, 204, 0.96) */
  searchBar: {
    width: '100%',
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
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: '#000000',
    paddingVertical: 0,
    includeFontPadding: false,
  },

  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },

  /* Group header: Frame 1000006440, height 40px, gap 16px, top: 178px */
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingTop: 24,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  /* Frame 1000006439: 40x40px, background: rgba(247, 247, 247, 0.96), rx: 20px */
  groupIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  /* Group text: 16px SF Pro 510/500, line-height 24px, letter-spacing 0.5px, color rgba(96, 96, 102, 0.96) */
  groupHeaderText: {
    fontFamily: FONT_MEDIUM,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    color: 'rgba(96, 96, 102, 0.96)',
    includeFontPadding: false,
  },

  /* Indented category item row: height 48px, left: 64px in frame */
  itemRow: {
    height: 48,
    paddingLeft: 56, // Indented under group header text
    paddingRight: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemRowSelected: {
    backgroundColor: 'rgba(247, 247, 247, 0.7)',
    borderRadius: 12,
  },
  /* 16px SF Pro 400, line-height 24px, letter-spacing 0.4px, color #000000 */
  itemText: {
    flex: 1,
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: '#000000',
    includeFontPadding: false,
    paddingRight: 12,
  },
  itemTextSelected: {
    fontWeight: '600',
    color: 'rgba(0, 8, 20, 0.96)',
  },

  /* Empty Search */
  emptyContainer: {
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontFamily: FONT_REGULAR,
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(96, 96, 102, 0.96)',
    textAlign: 'center',
  },
});
