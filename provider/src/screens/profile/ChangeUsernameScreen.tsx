import { useSafeRouter } from '../../utils/safeNavigation';
import { useRef, useState } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';

import { NativeDockSpacer } from '../../components/NativeDockSpacer';
import { useProviderProfile } from '../../context/ProviderProfileContext';

function ArrowLeftIcon({ size = 24 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M19 12H5M11 6l-6 6 6 6"
        stroke="#000814"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function ShareIcon({ size = 24 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="18" cy="5" r="3" stroke="#141B34" strokeWidth="1.5" />
      <Circle cx="6" cy="12" r="3" stroke="#141B34" strokeWidth="1.5" />
      <Circle cx="18" cy="19" r="3" stroke="#141B34" strokeWidth="1.5" />
      <Path
        d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98"
        stroke="#141B34"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </Svg>
  );
}

function AlertCircleIcon({ size = 20, color = '#F89B18' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Circle cx="10" cy="10" r="8" stroke={color} strokeWidth="1.5" />
      <Path d="M10 6v5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Circle cx="10" cy="14" r="1" fill={color} />
    </Svg>
  );
}

function CheckmarkIcon({ size = 16, color = '#FFFFFF' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Path
        d="M3.33 8l3.34 3.33 6.66-6.66"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function ProviderChangeUsernameScreen() {
  const safeRouter = useSafeRouter();
  const insets = useSafeAreaInsets();
  const { ownerName, updateOwnerName } = useProviderProfile();

  const [newName, setNewName] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const toastAnim = useRef(new Animated.Value(0)).current;

  // Validation logic
  const trimmed = newName.trim();
  const isInputFilled = trimmed.length > 0;
  const isDuplicate = trimmed.toLowerCase() === ownerName.toLowerCase();
  const isReserved = ['johndoe', 'admin', 'trend', 'kalba'].includes(trimmed.toLowerCase());
  const hasError = isDuplicate || isReserved || !!errorMessage;
  const isValid = isInputFilled && !hasError;

  const handleNameChange = (val: string) => {
    setNewName(val);
    setErrorMessage(null);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: 'Manage your Trend Business ID Name.',
      });
    } catch (e) {
      // Ignored
    }
  };

  const handleSave = async () => {
    if (!isValid || isUpdating) return;

    setIsUpdating(true);
    const result = await updateOwnerName(trimmed);
    setIsUpdating(false);

    if (!result.success) {
      setErrorMessage(result.error || 'Username already in use');
      return;
    }

    // Trigger Success Toast
    setShowToast(true);
    Animated.sequence([
      Animated.timing(toastAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.delay(1800),
      Animated.timing(toastAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowToast(false);
      safeRouter.back();
    });
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* ── Fixed Header (height: 64px) ── */}
        <View style={styles.header}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => safeRouter.back()}
            style={styles.headerButton}
          >
            <ArrowLeftIcon size={24} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>ID Name</Text>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleShare}
            style={styles.headerButton}
          >
            <ShareIcon size={24} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── 6-Month Warning Note Container (358x76px) ── */}
          <View style={styles.noteContainer}>
            <AlertCircleIcon size={20} color="#F89B18" />
            <Text style={styles.noteText}>
              If you change your name now you won't be able to change it again for the next 6 months
            </Text>
          </View>

          {/* ── Field 1: Existing Name (Read-Only) ── */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Existing Name</Text>
            <View style={styles.readOnlyInput}>
              <Text style={styles.readOnlyText}>{ownerName}</Text>
              <CheckmarkIcon size={16} color="rgba(192, 192, 204, 0.96)" />
            </View>
          </View>

          {/* ── Field 2: Enter New Name ── */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Enter New Name</Text>
            <View
              style={[
                styles.textInputField,
                hasError && styles.textInputFieldInvalid,
                isValid && styles.textInputFieldValid,
              ]}
            >
              <TextInput
                value={newName}
                onChangeText={handleNameChange}
                placeholder="JohnDoe"
                placeholderTextColor="rgba(192, 192, 204, 0.96)"
                style={styles.textInput}
                autoCapitalize="words"
                autoCorrect={false}
              />
              {isValid && (
                <View style={styles.validCheckBadge}>
                  <CheckmarkIcon size={12} color="#FFFFFF" />
                </View>
              )}
            </View>

            {/* Error Message */}
            {hasError && (
              <Text style={styles.errorText}>
                {errorMessage || (isDuplicate ? 'Username is same as existing' : 'Username already in use')}
              </Text>
            )}
          </View>
        </ScrollView>

        {/* ── Toast Notification Pill ── */}
        {showToast && (
          <Animated.View
            style={[
              styles.toastContainer,
              {
                opacity: toastAnim,
                transform: [
                  {
                    translateY: toastAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.toastBadge}>
              <CheckmarkIcon size={14} color="#FFFFFF" />
            </View>
            <Text style={styles.toastText}>ID Name Updated</Text>
          </Animated.View>
        )}

        {/* ── Bottom Save Button Container ── */}
        <View style={[styles.bottomContainer, { paddingBottom: insets.bottom + 16 }]}>
          <TouchableOpacity
            activeOpacity={isValid ? 0.85 : 1}
            disabled={!isValid || isUpdating}
            onPress={handleSave}
            style={[
              styles.saveButton,
              isValid ? styles.saveButtonActive : styles.saveButtonDisabled,
            ]}
          >
            <Text
              style={[
                styles.saveButtonText,
                isValid ? styles.saveButtonTextActive : styles.saveButtonTextDisabled,
              ]}
            >
              {isUpdating ? 'Saving...' : 'Save Changes'}
            </Text>
          </TouchableOpacity>
        </View>

        <NativeDockSpacer />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    height: 64,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  headerButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  headerTitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.2,
    color: '#000000',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 80,
    gap: 24,
  },

  // ── 6-Month Warning Note ──
  noteContainer: {
    width: '100%',
    backgroundColor: '#F6F0E6',
    borderRadius: 24,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  noteText: {
    flex: 1,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: '#F89B18',
  },

  // ── Input Groups ──
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  readOnlyInput: {
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  readOnlyText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    color: 'rgba(96, 96, 102, 0.96)',
  },
  textInputField: {
    height: 48,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textInputFieldInvalid: {
    borderColor: '#CC2929',
  },
  textInputFieldValid: {
    borderColor: '#0C790C',
  },
  textInput: {
    flex: 1,
    height: '100%',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    color: '#000814',
  },
  validCheckBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#0C790C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.2,
    color: '#CC2929',
    marginTop: 2,
  },

  // ── Toast Pill ──
  toastContainer: {
    position: 'absolute',
    top: 76,
    alignSelf: 'center',
    backgroundColor: '#0C790C',
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  toastBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  toastText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 14,
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },

  // ── Bottom Save Button ──
  bottomContainer: {
    paddingHorizontal: 16,
    paddingTop: 40,
    backgroundColor: '#FFFFFF',
  },
  saveButton: {
    width: '100%',
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonActive: {
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
  },
  saveButtonDisabled: {
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
  },
  saveButtonText: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
  },
  saveButtonTextActive: {
    color: '#FFFFFF',
  },
  saveButtonTextDisabled: {
    color: 'rgba(192, 192, 204, 0.96)',
  },
});
