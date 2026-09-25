import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  FlatList,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Search } from 'lucide-react-native';
import { Country } from 'country-state-city';

export interface CountryItem {
  name: string;
  code: string;
  flag: string;
  isoCode: string;
}

// Build list with Nigeria pinned at the top matching Figma
const ALL_COUNTRIES: CountryItem[] = (() => {
  try {
    const raw = Country.getAllCountries();
    const formatted: CountryItem[] = raw.map((c) => ({
      name: c.name,
      code: `+${(c.phonecode || '').replace(/^\++/, '')}`,
      flag: c.flag || '🏳️',
      isoCode: c.isoCode,
    }));

    // Find Nigeria and place at the top
    const nigeria = formatted.find((c) => c.isoCode === 'NG');
    const others = formatted.filter((c) => c.isoCode !== 'NG');

    if (nigeria) {
      return [nigeria, ...others];
    }
    return formatted;
  } catch {
    return [
      { name: 'Nigeria', code: '+234', flag: '🇳🇬', isoCode: 'NG' },
      { name: 'Bahamas', code: '+1-242', flag: '🇧🇸', isoCode: 'BS' },
      { name: 'United States', code: '+1', flag: '🇺🇸', isoCode: 'US' },
      { name: 'United Kingdom', code: '+44', flag: '🇬🇧', isoCode: 'GB' },
      { name: 'Canada', code: '+1', flag: '🇨🇦', isoCode: 'CA' },
      { name: 'Ghana', code: '+233', flag: '🇬🇭', isoCode: 'GH' },
    ];
  }
})();

interface CountryPickerBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (country: CountryItem) => void;
  selectedCountryName?: string;
}

export const CountryPickerBottomSheet: React.FC<CountryPickerBottomSheetProps> = ({
  visible,
  onClose,
  onSelect,
  selectedCountryName = 'Nigeria',
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCountries = useMemo(() => {
    if (!searchQuery.trim()) return ALL_COUNTRIES;
    const query = searchQuery.toLowerCase().trim();
    return ALL_COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.code.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const handleSelectCountry = (country: CountryItem) => {
    onSelect(country);
    setSearchQuery('');
    onClose();
  };

  const handleClose = () => {
    setSearchQuery('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Pressable style={styles.backdrop} onPress={handleClose} />

        {/* ── Bottom Sheet (Figma: width 390px, height 467px, border-radius 24px 24px 0px 0px) ── */}
        <View style={styles.sheetContainer}>
          {/* Top Grab Handle Indicator */}
          <View style={styles.grabHandle} />

          {/* Search Bar (Figma: width 358px, height 48px, border 1px solid rgba(192, 192, 204, 0.96), border-radius 24px) */}
          <View style={styles.searchBarContainer}>
            <Search size={24} color="rgba(0, 8, 20, 0.96)" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search country here.."
              placeholderTextColor="rgba(96, 96, 102, 0.96)"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCorrect={false}
            />
          </View>

          {/* Country Code list */}
          <FlatList
            data={filteredCountries}
            keyExtractor={(item) => item.name}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => {
              const isSelected = item.name === selectedCountryName;
              return (
                <View>
                  <TouchableOpacity
                    style={styles.countryRow}
                    activeOpacity={0.7}
                    onPress={() => handleSelectCountry(item)}
                  >
                    <Text style={styles.flagIcon}>{item.flag}</Text>
                    <Text
                      style={[
                        styles.countryName,
                        isSelected && styles.countryNameSelected,
                      ]}
                      numberOfLines={1}
                    >
                      {item.name}
                    </Text>
                    <Text style={styles.countryCode}>{item.code}</Text>
                  </TouchableOpacity>

                  {/* Divider line under Nigeria / selected item as in Figma */}
                  {item.name === 'Nigeria' && (
                    <View style={styles.dividerLine} />
                  )}
                </View>
              );
            }}
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },

  // ── Bottom Sheet (Figma: 467px height, 24px top radius) ──
  sheetContainer: {
    height: 467,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
  },
  grabHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(192, 192, 204, 0.96)',
    alignSelf: 'center',
    marginBottom: 16,
  },

  // ── Search Bar (Figma: 48px height, 24px radius, 16px horizontal margin) ──
  searchBarContainer: {
    height: 48,
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    borderRadius: 24,
    marginHorizontal: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  searchInput: {
    flex: 1,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.3,
    color: 'rgba(0, 8, 20, 0.96)',
    paddingVertical: 0,
  },

  // ── List ──
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  countryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 10,
    height: 44,
  },
  flagIcon: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 18,
    width: 24,
    textAlign: 'center',
  },
  countryName: {
    flex: 1,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    letterSpacing: 0.5,
    color: '#171717',
  },
  countryNameSelected: {
    fontWeight: '500',
  },
  countryCode: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    letterSpacing: 0.5,
    color: '#6F6F6F',
  },
  dividerLine: {
    height: 1,
    backgroundColor: 'rgba(235, 235, 245, 0.96)',
    marginVertical: 4,
  },
});
