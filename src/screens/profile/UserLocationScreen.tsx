import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
  Keyboard,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, ChevronDown, Check } from 'lucide-react-native';
import { State } from 'country-state-city';
import { CountryPickerBottomSheet, CountryItem } from '../../components/CountryPickerBottomSheet';
import { StatePickerBottomSheet, StateItem } from '../../components/StatePickerBottomSheet';
import { useUserContext } from '../../store/UserContext';

// ── Nigeria Flag Icon (24x24 Circular) ──
const NigeriaFlag = ({ size = 24 }: { size?: number }) => (
  <View
    style={{
      width: size,
      height: size,
      borderRadius: size / 2,
      overflow: 'hidden',
      flexDirection: 'row',
    }}
  >
    <View style={{ flex: 1, backgroundColor: '#83BF4F' }} />
    <View style={{ flex: 1, backgroundColor: '#F9F9F9' }} />
    <View style={{ flex: 1, backgroundColor: '#83BF4F' }} />
  </View>
);

export function UserLocationScreen() {
  const router = useRouter();
  const { profileData, setLocation } = useUserContext();

  // Location form state
  const [selectedCountry, setSelectedCountry] = useState<CountryItem>({
    name: 'Nigeria',
    code: '+234',
    flag: '🇳🇬',
    isoCode: 'NG',
  });
  const [selectedState, setSelectedState] = useState(profileData.location || 'F.C.T, Abuja.');
  const [residentialAddress, setResidentialAddress] = useState('Street 112, Abel Cresent.');

  // Flow states
  const [hasChanges, setHasChanges] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setIsKeyboardVisible(true)
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setIsKeyboardVisible(false)
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Bottom sheets visibility
  const [countryPickerVisible, setCountryPickerVisible] = useState(false);
  const [statePickerVisible, setStatePickerVisible] = useState(false);

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/profile' as any);
    }
  };

  const handleSelectCountry = (country: CountryItem) => {
    setSelectedCountry(country);
    
    // Automatically adjust the state selection to the newly chosen country
    if (country.isoCode === 'NG' || country.name.toLowerCase() === 'nigeria') {
      setSelectedState('F.C.T, Abuja.');
    } else {
      try {
        const states = State.getStatesOfCountry(country.isoCode);
        if (states && states.length > 0) {
          setSelectedState(states[0].name);
        } else {
          setSelectedState(`${country.name} (Main Region)`);
        }
      } catch {
        setSelectedState(`${country.name} (Main Region)`);
      }
    }

    setHasChanges(true);
    setShowSuccessToast(false);
  };

  const handleSelectState = (state: StateItem) => {
    setSelectedState(state.name);
    setHasChanges(true);
    setShowSuccessToast(false);
  };

  const handleAddressChange = (text: string) => {
    setResidentialAddress(text);
    setHasChanges(true);
    setShowSuccessToast(false);
  };

  const handleSaveChanges = () => {
    if (!hasChanges) return;
    const formattedLocation = `${selectedState}, ${selectedCountry.name}`;
    setLocation(formattedLocation);
    setHasChanges(false);
    setShowSuccessToast(true);
    setTimeout(() => {
      router.replace('/profile' as any);
    }, 500);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* ── Page Header (Figma: height 64px, borderBottom 1px solid rgba(235, 235, 245, 0.96)) ── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={handleGoBack}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ArrowLeft size={24} color="rgba(0, 8, 20, 0.96)" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Location Update</Text>

        <View style={styles.headerRightPlaceholder} />
      </View>

      {/* ── Scrollable Form Area ── */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: isKeyboardVisible ? 320 : 24 },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          {/* Field 1: Country (Figma: height 88px, label 24px, gap 16px, box 48px) */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabelRegular}>Country</Text>
            <TouchableOpacity
              style={styles.inputBox}
              activeOpacity={0.7}
              onPress={() => setCountryPickerVisible(true)}
            >
              <View style={styles.countryContentRow}>
                {selectedCountry.name === 'Nigeria' ? (
                  <NigeriaFlag size={24} />
                ) : (
                  <Text style={styles.flagEmoji}>{selectedCountry.flag}</Text>
                )}
                <Text style={styles.countryText}>{selectedCountry.name}</Text>
              </View>
              <ChevronDown size={24} color="rgba(0, 8, 20, 0.96)" />
            </TouchableOpacity>
          </View>

          {/* Field 2: State of Residence (Figma: height 88px, label 24px, gap 16px, box 48px) */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabelMed}>State of Residence</Text>
            <TouchableOpacity
              style={styles.inputBox}
              activeOpacity={0.7}
              onPress={() => setStatePickerVisible(true)}
            >
              <Text style={styles.stateValueText} numberOfLines={1}>
                {selectedState}
              </Text>
              <ChevronDown size={24} color="rgba(0, 8, 20, 0.96)" />
            </TouchableOpacity>
          </View>

          {/* Field 3: Residential Address (Figma: height 88px, label 24px, gap 16px, box 48px) */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabelMed}>Residential Address</Text>
            <View style={styles.inputBox}>
              <TextInput
                style={styles.textInput}
                value={residentialAddress}
                onChangeText={handleAddressChange}
                placeholder="Enter residential address"
                placeholderTextColor="rgba(96, 96, 102, 0.96)"
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ── Bottom Section (Success Toast + Save Changes Button) ── */}
      {!isKeyboardVisible && (
        <View style={styles.bottomContainer}>
          {/* In-app Action taken indicator (Figma: width 212px, height 44px, background rgba(0, 8, 20, 0.96)) */}
          {showSuccessToast && (
            <View style={styles.actionTakenIndicator}>
              <View style={styles.checkmarkCircle}>
                <Check size={14} color="#FFFFFF" strokeWidth={3} />
              </View>
              <Text style={styles.actionTakenText}>Location Updated</Text>
            </View>
          )}

          {/* Save Changes Button (Active: black rgba(0, 8, 20, 0.96), Disabled: rgba(248, 249, 250, 0.98)) */}
          <TouchableOpacity
            style={[
              styles.saveButton,
              hasChanges ? styles.saveButtonActive : styles.saveButtonDisabled,
            ]}
            activeOpacity={hasChanges ? 0.8 : 1}
            disabled={!hasChanges}
            onPress={handleSaveChanges}
          >
            <Text
              style={[
                styles.saveButtonText,
                hasChanges ? styles.saveButtonTextActive : styles.saveButtonTextDisabled,
              ]}
            >
              Save Changes
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── Country Bottom Sheet (Figma: 390x467px) ── */}
      <CountryPickerBottomSheet
        visible={countryPickerVisible}
        onClose={() => setCountryPickerVisible(false)}
        onSelect={handleSelectCountry}
        selectedCountryName={selectedCountry.name}
      />

      {/* ── State Bottom Sheet (Figma: 390x467px) ── */}
      <StatePickerBottomSheet
        visible={statePickerVisible}
        onClose={() => setStatePickerVisible(false)}
        onSelect={handleSelectState}
        selectedStateName={selectedState}
        countryIsoCode={selectedCountry.isoCode}
        countryName={selectedCountry.name}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // ── Header (Figma: 64px height, 1px border bottom) ──
  header: {
    height: 64,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(235, 235, 245, 0.96)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  headerButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontSize: 17,
    fontWeight: '500',
    lineHeight: 24,
    letterSpacing: 0.2,
    color: 'rgba(0, 8, 20, 0.96)',
    textAlign: 'center',
  },
  headerRightPlaceholder: {
    width: 48,
    height: 48,
  },

  // ── Content Area (Figma: paddingTop 37px, gap 40px between groups) ──
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 37,
    paddingBottom: 24,
  },
  inputGroup: {
    marginBottom: 40,
  },
  inputLabelRegular: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
    marginBottom: 16,
  },
  inputLabelMed: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
    letterSpacing: 0.6,
    color: 'rgba(0, 8, 20, 0.96)',
    marginBottom: 16,
  },
  inputBox: {
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
  },
  countryContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  flagEmoji: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 20,
    lineHeight: 24,
  },
  countryText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  stateValueText: {
    flex: 1,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
  },
  textInput: {
    flex: 1,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(0, 8, 20, 0.96)',
    paddingVertical: 0,
    paddingHorizontal: 0,
  },

  // ── Bottom Area (Toast + Button) ──
  bottomContainer: {
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 12 : 24,
    paddingTop: 8,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  actionTakenIndicator: {
    width: 212,
    height: 44,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 16,
    marginBottom: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  checkmarkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(12, 121, 12, 0.96)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTakenText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    letterSpacing: 0.4,
    color: '#FFFFFF',
  },
  saveButton: {
    width: '100%',
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: 'rgba(248, 249, 250, 0.98)',
  },
  saveButtonActive: {
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    shadowColor: 'rgba(133, 139, 148, 0.08)',
    shadowOffset: { width: 8, height: 16 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 4,
  },
  saveButtonText: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter_500Medium',
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
    letterSpacing: 0.15,
    textTransform: 'capitalize',
  },
  saveButtonTextDisabled: {
    color: 'rgba(192, 192, 204, 0.96)',
  },
  saveButtonTextActive: {
    color: '#FFFFFF',
  },
});
