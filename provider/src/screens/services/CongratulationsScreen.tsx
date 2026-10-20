import React, { useState, useEffect } from 'react';
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
import { useRouter } from 'expo-router';

import { useServiceDraft } from '../../context/ServiceDraftContext';
import { LoadingOverlay } from '../../components/LoadingOverlay';
import { NativeDockSpacer } from '../../components/NativeDockSpacer';
import { triggerLightHaptic } from '../../utils/haptics';

const FONT_MEDIUM = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium';
const FONT_REGULAR = Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular';
const FONT_BUTTON = Platform.OS === 'ios' ? 'Inter' : 'Inter_500Medium';

/**
 * 1:1 Figma CongratulationsScreen (booking successful screen F5, F6)
 *
 * Implements:
 * - Celebration illustration (confetti background + dancing celebration characters)
 * - Heading: "Congratulations" (20px SF Pro 510/500, line-height 28px, center)
 * - Subtitle: "You have successfully added a service to Trend, now clients can book them."
 * - Button 1: "Add another service" (dark pill) -> dimmed loading overlay -> clears draft -> Step 1 with skeleton loader
 * - Button 2: "Back to dashboard" (text button) -> clears draft -> returns to main dashboard
 * - Hardware back and swipe back disabled
 */
export const CongratulationsScreen: React.FC = () => {
  const router = useRouter();
  const { resetDraft } = useServiceDraft();

  const [isLoading, setIsLoading] = useState(false);

  // Disable hardware back button on Android so user cannot go back to Review
  useEffect(() => {
    const onBackPress = () => {
      return true; // block back navigation
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, []);

  // "Add another service" action:
  // Shows loading overlay -> clears draft -> navigates to Step 1 with skeleton loader
  const handleAddAnotherService = () => {
    triggerLightHaptic();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      resetDraft();
      // Pass skeleton=true query param so Step 1 displays ServiceFormSkeleton first
      router.replace('/business-services-wizard?skeleton=true' as any);
    }, 800);
  };

  // "Back to dashboard" action:
  // Clears draft -> returns to main dashboard
  const handleBackToDashboard = () => {
    triggerLightHaptic();
    resetDraft();
    // TODO (Skeleton): Trigger global skeleton on dashboard return when prompt is implemented
    router.replace('/' as any);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.contentContainer}>
        {/* ── 1. Illustration Area (Confetti + Characters) ── */}
        <View style={styles.illustrationWrapper}>
          <Image
            source={require('../../../assets/images/dashboard/tutorial_confetti.png')}
            style={styles.confettiImage}
            resizeMode="contain"
          />
          <Image
            source={require('../../../assets/images/dashboard/tutorial_celebration_characters.png')}
            style={styles.charactersImage}
            resizeMode="contain"
          />
        </View>

        {/* ── 2. Text Container ── */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>Congratulations</Text>
          <Text style={styles.subtitle}>
            You have successfully added a service to Trend, now clients can book them.
          </Text>
        </View>

        {/* ── 3. Actions ── */}
        <View style={styles.actionsContainer}>
          {/* Add another service (Dark Pill Button) */}
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.addAnotherButton}
            onPress={handleAddAnotherService}
            accessibilityRole="button"
            accessibilityLabel="Add another service"
          >
            <Text style={styles.addAnotherButtonText}>Add another service</Text>
          </TouchableOpacity>

          {/* Back to dashboard (Text Button) */}
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.backDashboardButton}
            onPress={handleBackToDashboard}
            accessibilityRole="button"
            accessibilityLabel="Back to dashboard"
          >
            <Text style={styles.backDashboardButtonText}>Back to dashboard</Text>
          </TouchableOpacity>
        </View>
      </View>

      <NativeDockSpacer backgroundColor="#FFFFFF" />

      {/* ── 4. Dimmed Processing Overlay (F6: 4 dots) ── */}
      <LoadingOverlay
        visible={isLoading}
        dotsCount={4}
        dotSize={10}
        dotGap={12}
        overlayOpacity={0.1}
        dotColor="rgba(0, 8, 20, 0.96)"
      />
    </SafeAreaView>
  );
};

export default CongratulationsScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },

  // 1. Illustration Area (top: 76px, confetti 466x308, characters 213x153)
  illustrationWrapper: {
    width: 358,
    height: 280,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 32,
  },
  confettiImage: {
    position: 'absolute',
    width: 358,
    height: 260,
  },
  charactersImage: {
    width: 213,
    height: 153,
    marginTop: 20,
  },

  // 2. Text Container (top: 449px, 358x92px)
  textContainer: {
    width: 358,
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

  // 3. Actions Container
  actionsContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 16,
  },
  addAnotherButton: {
    width: 358,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(133, 139, 148, 0.08)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 4,
  },
  addAnotherButtonText: {
    fontFamily: FONT_BUTTON,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
    color: '#FFFFFF',
  },
  backDashboardButton: {
    width: 262,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backDashboardButtonText: {
    fontFamily: FONT_BUTTON,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
    color: 'rgba(96, 96, 102, 0.96)',
    textAlign: 'center',
  },
});
