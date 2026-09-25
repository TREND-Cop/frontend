import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Check } from 'lucide-react-native';
import Svg, { Path } from 'react-native-svg';
import { useUserContext } from '../../store/UserContext';

// ── Star Loading Indicator (Figma: Star 3, 72x72px) ──
const StarLoadingIcon = ({ size = 72, color = 'rgba(0, 8, 20, 0.96)' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 72 72" fill="none">
    <Path
      d="M36 6L44.5 25.5L66 27.5L50 42L54.5 63.5L36 53L17.5 63.5L22 42L6 27.5L27.5 25.5L36 6Z"
      fill={color}
    />
  </Svg>
);

export const ChangeUsernameScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { profileData, setUsername } = useUserContext();

  const currentUsername = profileData.username || 'Jude Fabulous';
  const [newUsername, setNewUsername] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showToast, setShowToast] = useState(false);
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

  // Animations
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const toastSlideAnim = useRef(new Animated.Value(30)).current;
  const toastOpacityAnim = useRef(new Animated.Value(0)).current;

  // Validation logic
  const isDuplicate =
    newUsername.trim().length > 0 &&
    newUsername.trim().toLowerCase() === currentUsername.trim().toLowerCase();
  const isValid = newUsername.trim().length >= 3 && !isDuplicate;
  const hasInput = newUsername.trim().length > 0;

  // Star spinner animation
  useEffect(() => {
    if (isUpdating) {
      rotateAnim.setValue(0);
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    }
  }, [isUpdating]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/profile-settings' as any);
    }
  };

  const handleSaveChanges = () => {
    if (!isValid || isUpdating) return;

    // Show slide-up toast and star loader
    setShowToast(true);
    setIsUpdating(true);

    // Slide up toast animation
    Animated.parallel([
      Animated.timing(toastSlideAnim, {
        toValue: 0,
        duration: 350,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(toastOpacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Quick 450ms processing duration before navigating back to profile
    setTimeout(() => {
      setUsername(newUsername.trim());
      router.replace('/profile' as any);
    }, 450);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {/* ── Page Header (Figma: height 64px, borderBottom 1px) ── */}
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleGoBack}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            disabled={isUpdating}
          >
            <ArrowLeft size={24} color="rgba(0, 8, 20, 0.96)" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Username</Text>

          <View style={styles.headerRightPlaceholder} />
        </View>

        {/* ── Form Body ── */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: isKeyboardVisible ? 320 : 24 },
          ]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          {/* Field 1: Current Username (Read-Only) */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Username</Text>
            <View style={styles.readOnlyInputBox}>
              <Text style={styles.readOnlyInputText} numberOfLines={1}>
                {currentUsername}
              </Text>
              <View style={styles.greyCheckmarkCircle}>
                <Check size={14} color="#FFFFFF" strokeWidth={2.5} />
              </View>
            </View>
          </View>

          {/* Field 2: Enter New Name (Interactive Input) */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Enter New Name</Text>
            <View
              style={[
                styles.textInputBox,
                isFocused && styles.textInputBoxFocused,
                isDuplicate && styles.textInputBoxError,
                isValid && styles.textInputBoxSuccess,
              ]}
            >
              <TextInput
                style={styles.textInput}
                value={newUsername}
                onChangeText={setNewUsername}
                placeholder=""
                placeholderTextColor="rgba(96, 96, 102, 0.96)"
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                autoCapitalize="words"
                autoCorrect={false}
                editable={!isUpdating}
              />

              {/* Green checkmark circle on valid state */}
              {isValid && (
                <View style={styles.greenCheckmarkCircle}>
                  <Check size={14} color="#FFFFFF" strokeWidth={2.5} />
                </View>
              )}
            </View>

            {/* Error Message when username is taken */}
            {isDuplicate && (
              <Text style={styles.errorText}>Username already in use</Text>
            )}
          </View>
        </ScrollView>

        {/* ── Center Star Loading Indicator Overlay (State 5) ── */}
        {isUpdating && (
          <View style={styles.starLoadingBackdrop} pointerEvents="none">
            <Animated.View style={{ transform: [{ rotate: spin }] }}>
              <StarLoadingIcon size={72} color="rgba(0, 8, 20, 0.96)" />
            </Animated.View>
          </View>
        )}

        {/* ── Slide-up "Username Updated" Toast (State 4) ── */}
        {showToast && (
          <Animated.View
            style={[
              styles.toastContainer,
              {
                bottom: insets.bottom + 124,
                transform: [{ translateY: toastSlideAnim }],
                opacity: toastOpacityAnim,
              },
            ]}
          >
            <View style={styles.toastCheckCircle}>
              <Check size={14} color="#FFFFFF" strokeWidth={2.5} />
            </View>
            <Text style={styles.toastText}>Username Updated</Text>
          </Animated.View>
        )}

        {/* ── Bottom Save Changes Button (Distance 64px from bottom) ── */}
        {!isKeyboardVisible && (
          <View
            style={[
              styles.bottomBarContainer,
              { paddingBottom: Math.max(insets.bottom, 24) + 16 },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.actionButton,
                hasInput && !isDuplicate && !isUpdating
                  ? styles.actionButtonActive
                  : styles.actionButtonDisabled,
              ]}
              activeOpacity={0.8}
              onPress={handleSaveChanges}
              disabled={!hasInput || isDuplicate || isUpdating}
            >
              <Text
                style={[
                  styles.actionButtonText,
                  hasInput && !isDuplicate && !isUpdating
                    ? styles.actionButtonTextActive
                    : styles.actionButtonTextDisabled,
                ]}
              >
                {hasInput && !isDuplicate ? 'Save Changes' : 'Save Change'}
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

  // ── Header (Figma: height 64px, borderBottom) ──
  headerRow: {
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

  // ── Content ──
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 140,
    gap: 32,
  },

  // ── Input Group ──
  inputGroup: {
    gap: 12,
  },
  inputLabel: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
    letterSpacing: 0.6,
    color: 'rgba(0, 8, 20, 0.96)',
  },

  // ── Read-Only Box ──
  readOnlyInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 48,
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    borderRadius: 24,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
  },
  readOnlyInputText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    flex: 1,
  },
  greyCheckmarkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(192, 192, 204, 0.96)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Interactive Input Box ──
  textInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 48,
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 204, 0.96)',
    borderRadius: 24,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
  },
  textInputBoxFocused: {
    borderColor: 'rgba(0, 8, 20, 0.96)',
  },
  textInputBoxError: {
    borderColor: 'rgba(204, 41, 41, 0.9)',
  },
  textInputBoxSuccess: {
    borderColor: 'rgba(192, 192, 204, 0.96)',
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
  },
  greenCheckmarkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#0C790C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontSize: 13,
    fontWeight: '400',
    color: 'rgba(204, 41, 41, 0.9)',
    paddingLeft: 4,
    marginTop: -4,
  },

  // ── Star Loading Backdrop (State 5) ──
  starLoadingBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },

  // ── Slide-up Toast (State 4) ──
  toastContainer: {
    position: 'absolute',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 20,
    zIndex: 90,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 6,
  },
  toastCheckCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#0C790C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toastText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontSize: 15,
    fontWeight: '500',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },

  // ── Bottom Bar (Figma: distance 64px from bottom) ──
  bottomBarContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  actionButton: {
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonDisabled: {
    backgroundColor: 'rgba(248, 249, 250, 0.98)',
  },
  actionButtonActive: {
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
  },
  actionButtonText: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter_500Medium',
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
    letterSpacing: 0.15,
    textTransform: 'capitalize',
  },
  actionButtonTextDisabled: {
    color: 'rgba(192, 192, 204, 0.96)',
  },
  actionButtonTextActive: {
    color: '#FFFFFF',
  },
});
