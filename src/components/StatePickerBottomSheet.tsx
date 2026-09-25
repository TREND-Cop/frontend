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
import Svg, { Circle } from 'react-native-svg';
import { State } from 'country-state-city';

export interface StateItem {
  name: string;
}

const NIGERIAN_STATES: StateItem[] = [
  { name: 'F. C.T Abuja' },
  { name: 'Edo State' },
  { name: 'Lagos State' },
  { name: 'Kano State' },
  { name: 'Benue State' },
  { name: 'Kaduna state' },
  { name: 'Gombe State' },
  { name: 'Abia State' },
  { name: 'Adamawa State' },
  { name: 'Akwa Ibom State' },
  { name: 'Anambra State' },
  { name: 'Bauchi State' },
  { name: 'Bayelsa State' },
  { name: 'Borno State' },
  { name: 'Cross River State' },
  { name: 'Delta State' },
  { name: 'Ebonyi State' },
  { name: 'Ekiti State' },
  { name: 'Enugu State' },
  { name: 'Imo State' },
  { name: 'Jigawa State' },
  { name: 'Katsina State' },
  { name: 'Kebbi State' },
  { name: 'Kogi State' },
  { name: 'Kwara State' },
  { name: 'Nasarawa State' },
  { name: 'Niger State' },
  { name: 'Ogun State' },
  { name: 'Ondo State' },
  { name: 'Osun State' },
  { name: 'Oyo State' },
  { name: 'Plateau State' },
  { name: 'Rivers State' },
  { name: 'Sokoto State' },
  { name: 'Taraba State' },
  { name: 'Yobe State' },
  { name: 'Zamfara State' },
];

const RadioButtonIcon = ({ checked = false }: { checked?: boolean }) => {
  if (checked) {
    return (
      <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
        <Circle cx="10" cy="10" r="9" stroke="rgba(0, 8, 20, 0.96)" strokeWidth="1.5" />
        <Circle cx="10" cy="10" r="5" fill="rgba(0, 8, 20, 0.96)" />
      </Svg>
    );
  }
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
      <Circle cx="10" cy="10" r="9" stroke="rgba(192, 192, 204, 0.96)" strokeWidth="1.5" />
    </Svg>
  );
};

interface StatePickerBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (state: StateItem) => void;
  selectedStateName?: string;
  countryIsoCode?: string;
  countryName?: string;
}

export const StatePickerBottomSheet: React.FC<StatePickerBottomSheetProps> = ({
  visible,
  onClose,
  onSelect,
  selectedStateName = 'F. C.T Abuja',
  countryIsoCode = 'NG',
  countryName = 'Nigeria',
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Dynamically load states based on the active country
  const statesForCountry = useMemo(() => {
    if (countryIsoCode === 'NG' || countryName.toLowerCase() === 'nigeria') {
      return NIGERIAN_STATES;
    }

    try {
      const fetchedStates = State.getStatesOfCountry(countryIsoCode);
      if (fetchedStates && fetchedStates.length > 0) {
        return fetchedStates.map((s) => ({ name: s.name }));
      }
    } catch {
      // fallback
    }

    // Fallback if no specific subdivisions found for that country
    return [
      { name: `${countryName} (Main Region)` },
      { name: `${countryName} (Capital District)` },
      { name: `${countryName} (Central Province)` },
    ];
  }, [countryIsoCode, countryName]);

  const filteredStates = useMemo(() => {
    if (!searchQuery.trim()) return statesForCountry;
    const query = searchQuery.toLowerCase().trim();
    return statesForCountry.filter((s) => s.name.toLowerCase().includes(query));
  }, [statesForCountry, searchQuery]);

  const handleSelectState = (state: StateItem) => {
    onSelect(state);
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
              placeholder="Search state here.."
              placeholderTextColor="rgba(96, 96, 102, 0.96)"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCorrect={false}
            />
          </View>

          {/* State list */}
          <FlatList
            data={filteredStates}
            keyExtractor={(item, index) => `${item.name}-${index}`}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => {
              const isSelected =
                item.name.toLowerCase().replace(/[^a-z]/g, '') ===
                selectedStateName.toLowerCase().replace(/[^a-z]/g, '');

              return (
                <TouchableOpacity
                  style={styles.stateRow}
                  activeOpacity={0.7}
                  onPress={() => handleSelectState(item)}
                >
                  <Text
                    style={[
                      styles.stateName,
                      isSelected && styles.stateNameSelected,
                    ]}
                    numberOfLines={1}
                  >
                    {item.name}
                  </Text>
                  <RadioButtonIcon checked={isSelected} />
                </TouchableOpacity>
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
  stateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    height: 48,
  },
  stateName: {
    flex: 1,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    letterSpacing: 0.5,
    color: '#171717',
  },
  stateNameSelected: {
    fontWeight: '500',
  },
});
