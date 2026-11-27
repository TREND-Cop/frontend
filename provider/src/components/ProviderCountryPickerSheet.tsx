import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  StyleSheet,
  Pressable,
  Platform,
  Keyboard,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { Country as CountryData } from 'country-state-city';

export interface CountryItem {
  name: string;
  code: string;
  flag: string;
  isoCode: string;
}

export interface ProviderCountryPickerSheetProps {
  visible: boolean;
  selectedCode?: string;
  onSelect: (country: CountryItem) => void;
  onClose: () => void;
}

// ── Search Icon (18x18, stroke 1.5px #000000) ──
function SearchIcon({ size = 20, color = '#000000' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M21 21l-4.35-4.35M19 11a8 8 0 11-16 0 8 8 0 0116 0z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// ── Clear Icon (16x16, stroke 1.5px #606066) ──
function ClearIcon({ size = 16, color = 'rgba(96, 96, 102, 0.96)' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Path
        d="M3 3l10 10M13 3L3 13"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

const NIGERIA_PINNED: CountryItem = {
  name: 'Nigeria',
  code: '+234',
  flag: '🇳🇬',
  isoCode: 'NG',
};

export const ProviderCountryPickerSheet: React.FC<ProviderCountryPickerSheetProps> = ({
  visible,
  selectedCode = '+234',
  onSelect,
  onClose,
}) => {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

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

    let handleViewportResize: (() => void) | null = null;
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.visualViewport) {
      handleViewportResize = () => {
        const vv = window.visualViewport;
        if (!vv) return;
        const diff = window.innerHeight - vv.height;
        if (diff > 100) {
          setKeyboardHeight(diff);
        } else {
          setKeyboardHeight(0);
        }
      };

      window.visualViewport.addEventListener('resize', handleViewportResize);
      window.visualViewport.addEventListener('scroll', handleViewportResize);
    }

    return () => {
      showSub.remove();
      hideSub.remove();
      if (handleViewportResize && typeof window !== 'undefined' && window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleViewportResize);
        window.visualViewport.removeEventListener('scroll', handleViewportResize);
      }
    };
  }, []);

  const isMobileWeb =
    Platform.OS === 'web' &&
    typeof navigator !== 'undefined' &&
    /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  const activeKeyboardHeight =
    keyboardHeight > 0
      ? keyboardHeight
      : isSearchFocused && isMobileWeb
      ? 290
      : 0;

  // Generate full list with Nigeria pinned first, then remaining sorted alphabetically
  const allCountries = useMemo(() => {
    try {
      const list = CountryData.getAllCountries().map((c) => ({
        name: c.name,
        code: `+${c.phonecode.replace(/^\++/, '')}`,
        flag: c.flag,
        isoCode: c.isoCode,
      }));

      // Filter out Nigeria from the main list, sort the rest alphabetically
      const others = list
        .filter((c) => c.isoCode !== 'NG')
        .sort((a, b) => a.name.localeCompare(b.name));

      return [NIGERIA_PINNED, ...others];
    } catch {
      return [
        NIGERIA_PINNED,
        { name: 'Afghanistan', code: '+93', flag: '🇦🇫', isoCode: 'AF' },
        { name: 'Åland Islands', code: '+358', flag: '🇦🇽', isoCode: 'AX' },
        { name: 'Albania', code: '+355', flag: '🇦🇱', isoCode: 'AL' },
        { name: 'Algeria', code: '+213', flag: '🇩🇿', isoCode: 'DZ' },
        { name: 'American Samoa', code: '+1-684', flag: '🇦🇸', isoCode: 'AS' },
        { name: 'Andorra', code: '+376', flag: '🇦🇩', isoCode: 'AD' },
      ];
    }
  }, []);

  const filteredCountries = useMemo(() => {
    if (!searchQuery.trim()) return allCountries;
    const query = searchQuery.toLowerCase();
    return allCountries.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.code.includes(query)
    );
  }, [allCountries, searchQuery]);

  const handleSelectCountry = useCallback((item: CountryItem) => {
    onSelect(item);
    setSearchQuery('');
    onClose();
  }, [onSelect, onClose]);

  const handleDismiss = useCallback(() => {
    setSearchQuery('');
    onClose();
  }, [onClose]);

  const renderCountryItem = useCallback(({ item, index }: { item: CountryItem; index: number }) => {
    const isPinnedNigeria = !searchQuery.trim() && index === 0;
    const isSelected = item.code === selectedCode;

    return (
      <View>
        <TouchableOpacity
          activeOpacity={0.7}
          style={[styles.countryRow, isSelected && styles.countryRowSelected]}
          onPress={() => handleSelectCountry(item)}
        >
          {/* Flag */}
          <Text style={styles.flagText}>{item.flag}</Text>
          {/* Country Name */}
          <Text style={[styles.countryNameText, isSelected && styles.selectedCountryText]} numberOfLines={1}>
            {item.name}
          </Text>
          {/* Dial Code */}
          <Text style={[styles.dialCodeText, isSelected && styles.selectedCountryText]}>
            {item.code}
          </Text>
        </TouchableOpacity>

        {/* Divider after pinned Nigeria in default list */}
        {isPinnedNigeria && <View style={styles.pinnedDivider} />}
      </View>
    );
  }, [selectedCode, searchQuery, handleSelectCountry]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      statusBarTranslucent
      onRequestClose={handleDismiss}
    >
      <View
        style={[
          styles.overlay,
          activeKeyboardHeight > 0 ? { paddingBottom: activeKeyboardHeight } : null,
        ]}
      >
        <Pressable style={styles.backdrop} onPress={handleDismiss} />

        <View
          style={[
            styles.sheetContainer,
            activeKeyboardHeight > 0
              ? {
                  height: Math.min(480, Dimensions.get('window').height - activeKeyboardHeight - (insets.top || 24)),
                  maxHeight: Dimensions.get('window').height - activeKeyboardHeight - (insets.top || 24),
                }
              : null,
            {
              paddingBottom:
                activeKeyboardHeight > 0
                  ? 8
                  : insets.bottom + 16,
            },
          ]}
        >
          {/* Drag down bar */}
          <View style={styles.dragBarContainer}>
            <View style={styles.dragBar} />
          </View>

          {/* Search bar (358px x 48px, radius 24px) */}
          <View style={styles.searchBar}>
            <SearchIcon size={20} color="#000000" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search country here.."
              placeholderTextColor="rgba(96, 96, 102, 0.96)"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery('')}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <ClearIcon size={16} />
              </TouchableOpacity>
            )}
          </View>

          {/* Country List (FlatList) */}
          <FlatList
            style={styles.flatList}
            data={filteredCountries}
            renderItem={renderCountryItem}
            keyExtractor={(item) => `${item.isoCode}-${item.code}`}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            initialNumToRender={20}
            maxToRenderPerBatch={20}
            windowSize={7}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No matching countries found</Text>
              </View>
            }
          />
        </View>
      </View>
    </Modal>
  );
};

export default ProviderCountryPickerSheet;

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
    height: 480,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  flatList: {
    flex: 1,
  },
  dragBarContainer: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 8,
  },
  dragBar: {
    width: 56,
    height: 5,
    borderRadius: 8,
    backgroundColor: 'rgba(192, 192, 204, 0.96)',
  },
  searchBar: {
    height: 48,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#C0C0CC',
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 14,
    lineHeight: 20,
    color: '#000000',
    paddingVertical: 0,
    includeFontPadding: false,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  countryRow: {
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    gap: 10,
  },
  countryRowSelected: {
    backgroundColor: 'rgba(235, 235, 245, 0.4)',
    borderRadius: 8,
  },
  flagText: {
    fontSize: 18,
    lineHeight: 24,
    width: 26,
    textAlign: 'center',
  },
  countryNameText: {
    flex: 1,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    color: '#171717',
    includeFontPadding: false,
  },
  dialCodeText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    color: '#6F6F6F',
    textAlign: 'right',
    includeFontPadding: false,
  },
  selectedCountryText: {
    color: '#000814',
    fontWeight: '600',
  },
  pinnedDivider: {
    width: '100%',
    height: 1,
    backgroundColor: '#DBDBDB',
    marginVertical: 8,
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 14,
    color: 'rgba(96, 96, 102, 0.96)',
  },
});
