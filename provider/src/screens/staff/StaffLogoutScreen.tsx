import { useSafeRouter, useSingleFlight } from '../../utils/safeNavigation';
import { useState } from 'react';
import {
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { LoadingOverlay } from '../../components/LoadingOverlay';
import { NativeDockSpacer } from '../../components/NativeDockSpacer';
import { STAFF_ROUTES } from '../../constants/staffRoutes';
import { typography } from '../../constants/theme';
import { useStaffLoginStore } from '../../context/StaffLoginContext';
import { useStaffProfile } from '../../context/StaffProfileContext';
import { triggerLightHaptic } from '../../utils/haptics';

/**
 * 1:1 Figma Staff Log Out Screen (390x844)
 * Matches Screen 4 in docs/design/staff-profile.txt:
 * - Illustration (213x153): Two people standing and waving
 * - Heading: "Logging Out?" (20px/28px 500 #000000)
 * - Subtitle: "We will be waiting for your return" (16px/24px 400 rgba(96,96,102,0.96))
 * - "Go back home" (335x48, radius 24, barberPrimary): returns to staff home
 * - "Logout" (358x48, radius 24, rgba(247,247,247,0.96)): shows LoadingOverlay, clears session, resets to entry
 */
export function StaffLogoutScreen() {
  const safeRouter = useSafeRouter();
  const insets = useSafeAreaInsets();
  const { clearStaffLogin } = useStaffLoginStore();
  const { clearStaffProfile } = useStaffProfile();

  const [isLoading, setIsLoading] = useState(false);

  const handleGoBackHome = useSingleFlight(() => {
    if (isLoading) return;
    triggerLightHaptic();
    safeRouter.replace(STAFF_ROUTES.HOME as any);
  });

  const handleConfirmLogout = useSingleFlight(() => {
    if (isLoading) return;
    triggerLightHaptic();
    setIsLoading(true);

    // Short mock delay per designer spec: "when the user push the logout button, the screen loads and goes back to the very start"
    setTimeout(() => {
      clearStaffLogin();
      clearStaffProfile();
      setIsLoading(false);
      // Reset navigation stack completely to the staff login code page
      safeRouter.resetRoot('/staff-login-code');
    }, 700);
  }, 1000);

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.container}>
        {/* Illustration (213x153) */}
        <View style={styles.illustrationWrapper}>
          <Image
            source={require('../../../assets/images/profile/Two_people_standing_and_waving_20261002023157.jpg')}
            style={styles.illustrationImage}
            resizeMode="contain"
          />
        </View>

        {/* Text Block */}
        <View style={styles.textContainer}>
          <Text style={styles.mainHeading}>Logging Out?</Text>
          <Text style={styles.subtitle}>
            We will be waiting for your return
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={[styles.buttonsContainer, { paddingBottom: insets.bottom + 24 }]}>
          {/* Primary Button: "Go back home" (335x48) */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleGoBackHome}
            style={styles.primaryButton}
          >
            <Text style={styles.primaryButtonText}>Go back home</Text>
          </TouchableOpacity>

          {/* Secondary Button: "Logout" (358x48) */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleConfirmLogout}
            style={styles.logoutButton}
          >
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      <NativeDockSpacer />

      {/* Loading Overlay with 4 pulsing dots */}
      <LoadingOverlay visible={isLoading} centered />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  illustrationWrapper: {
    width: 213,
    height: 153,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 44,
  },
  illustrationImage: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 54,
    gap: 16,
  },
  mainHeading: {
    ...typography.h2Med,
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.2,
    color: '#000000',
    textAlign: 'center',
  },
  subtitle: {
    ...typography.bodyRegular,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    textAlign: 'center',
  },
  buttonsContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 40,
  },
  primaryButton: {
    width: 335, // Design slip: 335px vs 358px per spec
    height: 48,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(133, 139, 148, 0.16)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 12,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  primaryButtonText: {
    ...typography.button,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
    color: '#FFFFFF',
  },
  logoutButton: {
    width: 358,
    height: 48,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutButtonText: {
    ...typography.button,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
    color: 'rgba(204, 41, 41, 0.9)',
  },
});

