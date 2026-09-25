import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Check } from 'lucide-react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { useUserContext } from '../../store/UserContext';

// ── Circular Nigeria Flag Icon (Figma Vector Spec) ──
const NigeriaFlagCircle = ({ size = 24 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="12" fill="#83BF4F" />
    <Path d="M8 0H16V24H8V0Z" fill="#F9F9F9" />
  </Svg>
);

export const ChangePhoneNumberScreen: React.FC = () => {
  const router = useRouter();
  const { profileData } = useUserContext();

  const currentCountryCode = '+234';
  const currentPhoneNumber = profileData.phone ? profileData.phone.replace('+234', '').trim() : '08110783610';

  const [newPhone, setNewPhone] = useState('');
  const [phoneError, setPhoneError] = useState<string | null>(null);
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

  // Validation
  const cleanPhone = newPhone.replace(/[^0-9]/g, '');
  const isValidPhoneLength = cleanPhone.length >= 10 && cleanPhone.length <= 11;
  const isDuplicate = cleanPhone === currentPhoneNumber.replace(/^0+/, '') || cleanPhone === currentPhoneNumber;
  const isValid = isValidPhoneLength && !isDuplicate && !phoneError;

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/profile' as any);
    }
  };

  const handlePhoneChange = (text: string) => {
    setNewPhone(text);
    if (phoneError) setPhoneError(null);
  };

  const handleSaveChanges = () => {
    const rawDigits = newPhone.replace(/[^0-9]/g, '');

    // Error simulation / validation
    if (rawDigits.length < 10 || isDuplicate) {
      setPhoneError('Phone number is in correct or already exist');
      return;
    }

    setPhoneError(null);

    // Navigate to in-app account verification selection screen (user signed up with phone)
    const fullPhone = `${currentCountryCode} ${newPhone}`;
    router.push({
      pathname: '/profile-verification-method',
      params: { signupMethod: 'phone', type: 'phone', targetPhone: fullPhone },
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
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

          <Text style={styles.headerTitle}>Phone Number Change</Text>

          <View style={styles.headerRightPlaceholder} />
        </View>

        {/* ── Scrollable Body Area ── */}
        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: isKeyboardVisible ? 320 : 24 },
          ]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
          {/* Field 1: Current Phone Number (Figma: height 88px, gap 16px) */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Current Phone Number</Text>
            <View style={[styles.inputBox, styles.inputBoxNormal]}>
              <View style={styles.inputLeftRow}>
                {/* Country code and flag */}
                <View style={styles.flagContainer}>
                  <NigeriaFlagCircle size={24} />
                  <Text style={styles.countryCodeText}>{currentCountryCode}</Text>
                </View>

                {/* Current Phone Number text */}
                <Text style={styles.currentPhoneText}>{currentPhoneNumber}</Text>
              </View>

              {/* Grey Checkmark Circle */}
              <View style={styles.greyCheckmarkCircle}>
                <Check size={14} color="#FFFFFF" strokeWidth={3} />
              </View>
            </View>
          </View>

          {/* Field 2: New Phone Number (Figma: height 88px, gap 16px) */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              {phoneError ? 'Phone Number' : 'New Phone Number'}
            </Text>
            <View
              style={[
                styles.inputBox,
                phoneError
                  ? styles.inputBoxError
                  : styles.inputBoxNormal,
              ]}
            >
              <View style={styles.inputLeftRow}>
                {/* Country code and flag */}
                <View style={styles.flagContainer}>
                  <NigeriaFlagCircle size={24} />
                  <Text style={styles.countryCodeText}>{currentCountryCode}</Text>
                </View>

                {/* New Phone Number TextInput */}
                <TextInput
                  style={styles.textInput}
                  value={newPhone}
                  onChangeText={(text) => handlePhoneChange(text.replace(/[^0-9]/g, ''))}
                  placeholder="08110783610"
                  placeholderTextColor="rgba(192, 192, 204, 0.96)"
                  keyboardType="number-pad"
                  inputMode="numeric"
                  autoFocus={false}
                />
              </View>

              {/* Right Valid Green Indicator */}
              {isValid && (
                <View style={styles.greenCheckmarkCircle}>
                  <Check size={14} color="#FFFFFF" strokeWidth={3} />
                </View>
              )}
            </View>

            {/* Error Message (Figma exact text: "Phone number is in correct or already exist") */}
            {phoneError && (
              <Text style={styles.errorText}>{phoneError}</Text>
            )}
          </View>
        </ScrollView>

        {/* ── Bottom Section (Save Changes Button) ── */}
        {!isKeyboardVisible && (
          <View style={styles.bottomContainer}>
            <TouchableOpacity
              style={[
                styles.saveButton,
                newPhone.trim().length > 0
                  ? styles.saveButtonActive
                  : styles.saveButtonDisabled,
              ]}
              activeOpacity={newPhone.trim().length > 0 ? 0.8 : 1}
              disabled={newPhone.trim().length === 0}
              onPress={handleSaveChanges}
            >
              <Text
                style={[
                  styles.saveButtonText,
                  newPhone.trim().length > 0
                    ? styles.saveButtonTextActive
                    : styles.saveButtonTextDisabled,
                ]}
              >
                Save Changes
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardContainer: {
    flex: 1,
  },

  // ── Header (Figma: height 64px, borderBottom 1px solid rgba(235, 235, 245, 0.96)) ──
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

  // ── Content Area (Figma: top 144px & top 272px -> 40px gap between groups) ──
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 36,
    paddingBottom: 24,
    gap: 40,
  },

  // ── Input Group (Figma: height 88px, gap 16px) ──
  inputGroup: {
    gap: 16,
  },
  inputLabel: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
    letterSpacing: 0.6,
    color: 'rgba(0, 8, 20, 0.96)',
  },

  // ── Input Field (Figma: 358x48px, border 1px solid rgba(192, 192, 204, 0.96), borderRadius 24px) ──
  inputBox: {
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
  },
  inputBoxNormal: {
    borderColor: 'rgba(192, 192, 204, 0.96)',
  },
  inputBoxError: {
    borderColor: 'rgba(204, 41, 41, 0.9)',
  },
  inputLeftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },

  // ── Country Code and Flag (Figma: width 82px, height 32px, borderRight 1px solid rgba(235, 235, 245, 0.96)) ──
  flagContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingRight: 8,
    height: 32,
    borderRightWidth: 1,
    borderRightColor: 'rgba(235, 235, 245, 0.96)',
  },
  countryCodeText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  currentPhoneText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    marginLeft: 4,
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
    paddingHorizontal: 4,
  },

  // ── Checkmark Badges (Figma: 24x24px, borderRadius 12px) ──
  greyCheckmarkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(192, 192, 204, 0.96)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  greenCheckmarkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#0C790C',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Error Label (Figma: font-size 16px, lineHeight 24px, color rgba(204, 41, 41, 0.9)) ──
  errorText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(204, 41, 41, 0.9)',
    marginTop: -8,
    paddingHorizontal: 4,
  },

  // ── Bottom Area (Figma: 358x48px, borderRadius 24px, bottom 98px / safe area) ──
  bottomContainer: {
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 12 : 24,
    paddingTop: 8,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
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
