import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
  BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { triggerLightHaptic } from '../../utils/haptics';
import { NativeDockSpacer } from '../../components/NativeDockSpacer';

const FONT_MEDIUM = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium';
const FONT_REGULAR = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular';
const FONT_BUTTON = Platform.OS === 'ios' ? 'Inter' : 'Inter_500Medium';

const CONFETTI_ASSET = require('../../../assets/images/dashboard/tutorial_confetti.png');
const CHARACTERS_ASSET = require('../../../assets/images/dashboard/tutorial_celebration_characters.png');

/**
 * 1:1 Figma StaffSuccessScreen (Frame A4)
 *
 * Implements:
 * - Confetti and celebration characters illustration
 * - Heading "Successful"
 * - Subtitle "You have successfully added a staff member to your business."
 * - Dark pill "Get staff login code" (routes to placeholder)
 * - Light outlined pill "Go to staff management" (clears back stack, goes to Staff Management)
 * - Hardware and gesture back are disabled
 */
export const StaffSuccessScreen: React.FC = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  // Disable hardware back button on Android
  useEffect(() => {
    const onBackPress = () => true;
    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, []);

  const handleGoToStaffManagement = () => {
    triggerLightHaptic();
    // Replace stack so neither AddStaffForm nor SuccessScreen remain in back stack
    router.replace('/staffs' as any);
  };

  const handleGetLoginCode = () => {
    triggerLightHaptic();
    router.push({
      pathname: '/staff/login-code',
      params: { id: id || '' },
    } as any);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.content}>
        {/* ── Illustration Stack ── */}
        <View style={styles.illustrationContainer}>
          <Image
            source={CONFETTI_ASSET}
            style={styles.confettiImage}
            resizeMode="contain"
          />
          <Image
            source={CHARACTERS_ASSET}
            style={styles.charactersImage}
            resizeMode="contain"
          />
        </View>

        {/* ── Headings ── */}
        <View style={styles.copyBox}>
          <Text style={styles.title}>Successful</Text>
          <Text style={styles.subtitle}>
            You have successfully added a staff member to your business.
          </Text>
        </View>

        {/* ── Action Buttons ── */}
        <View style={styles.actionsBox}>
          {/* Dark Pill: Get staff login code */}
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.darkButton}
            onPress={handleGetLoginCode}
            accessible
            accessibilityRole="button"
            accessibilityLabel="Get staff login code"
          >
            <Text style={styles.darkButtonText}>Get staff login code</Text>
          </TouchableOpacity>

          {/* Light Outlined Pill: Go to staff management */}
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.lightButton}
            onPress={handleGoToStaffManagement}
            accessible
            accessibilityRole="button"
            accessibilityLabel="Go to staff management"
          >
            <Text style={styles.lightButtonText}>Go to staff management</Text>
          </TouchableOpacity>
        </View>
      </View>

      <NativeDockSpacer backgroundColor="#FFFFFF" />
    </SafeAreaView>
  );
};

export default StaffSuccessScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 40,
  },
  illustrationContainer: {
    width: '100%',
    height: 320,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 24,
  },
  confettiImage: {
    position: 'absolute',
    width: '100%',
    maxWidth: 420,
    height: 308,
    top: 0,
  },
  charactersImage: {
    position: 'absolute',
    width: 213,
    height: 153,
    bottom: 24,
  },
  copyBox: {
    width: '100%',
    maxWidth: 358,
    alignItems: 'center',
    gap: 16,
    marginBottom: 48,
  },
  title: {
    fontFamily: FONT_MEDIUM,
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.2,
    color: '#000000',
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: FONT_REGULAR,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    textAlign: 'center',
  },
  actionsBox: {
    width: '100%',
    maxWidth: 358,
    gap: 16,
  },
  darkButton: {
    width: '100%',
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#858B94',
    shadowOffset: { width: 4, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 3,
  },
  darkButtonText: {
    fontFamily: FONT_BUTTON,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
    color: '#FFFFFF',
  },
  lightButton: {
    width: '100%',
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(235, 235, 245, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lightButtonText: {
    fontFamily: FONT_BUTTON,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
    color: 'rgba(0, 8, 20, 0.96)',
  },
});
