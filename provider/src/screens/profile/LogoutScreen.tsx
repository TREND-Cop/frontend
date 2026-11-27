import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSafeRouter, useSingleFlight } from '../../utils/safeNavigation';
import Svg, { Path } from 'react-native-svg';

import { useProviderProfile } from '../../context/ProviderProfileContext';
import { NativeDockSpacer } from '../../components/NativeDockSpacer';

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

export function ProviderLogoutScreen() {
  const safeRouter = useSafeRouter();
  const insets = useSafeAreaInsets();
  const { clearProfile } = useProviderProfile();

  const handleGoBackHome = useSingleFlight(() => {
    safeRouter.replace('/dashboard' as any);
  });

  const handleConfirmLogout = useSingleFlight(async () => {
    try {
      await clearProfile();
    } catch (e) {
      console.warn('Error clearing profile on logout:', e);
    }
    safeRouter.resetRoot('/login-business-owner');
  });

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      {/* ── Fixed Header (height: 64px) ── */}
      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => safeRouter.back()}
          style={styles.headerButton}
        >
          <ArrowLeftIcon size={24} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Logout</Text>

        <View style={styles.headerPlaceholder} />
      </View>

      <View style={styles.contentContainer}>
        {/* ── Illustration (170x170) ── */}
        <View style={styles.illustrationWrapper}>
          <Image
            source={require('../../../assets/images/profile/Two_people_standing_and_waving_20261002023157.jpg')}
            style={styles.illustrationImage}
            resizeMode="contain"
          />
        </View>

        {/* ── Titles ── */}
        <View style={styles.textContainer}>
          <Text style={styles.mainHeading}>Logging Out?</Text>
          <Text style={styles.subtitle}>
            Are you sure you want to log out of your account?
          </Text>
        </View>

        {/* ── Action Buttons ── */}
        <View style={[styles.buttonsContainer, { paddingBottom: insets.bottom + 24 }]}>
          {/* Go back home (Primary Button) */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleGoBackHome}
            style={styles.primaryButton}
          >
            <Text style={styles.primaryButtonText}>Go back home</Text>
          </TouchableOpacity>

          {/* Logout (Danger Outline Button) */}
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
  headerPlaceholder: {
    width: 48,
    height: 48,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustrationWrapper: {
    width: 170,
    height: 170,
    borderRadius: 85,
    overflow: 'hidden',
    marginBottom: 32,
    backgroundColor: '#F7F7FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  illustrationImage: {
    width: 150,
    height: 150,
  },
  textContainer: {
    alignItems: 'center',
    gap: 8,
    marginBottom: 48,
    paddingHorizontal: 24,
  },
  mainHeading: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_600SemiBold',
    fontWeight: '600',
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: 0.4,
    color: '#141A33',
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: 'rgba(96, 96, 102, 0.96)',
    textAlign: 'center',
  },
  buttonsContainer: {
    width: '100%',
    gap: 40,
  },
  primaryButton: {
    width: '100%',
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 8, 20, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
    color: '#FFFFFF',
  },
  logoutButton: {
    width: '100%',
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(204, 41, 41, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutButtonText: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
    color: 'rgba(204, 41, 41, 0.9)',
  },
});
