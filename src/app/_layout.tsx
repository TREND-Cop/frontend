/**
 * Root Layout — Sets up the navigation stack for the entire app.
 *
 * Uses expo-router's Stack navigator to manage the screen flow:
 * Onboarding → SignUp/SignIn → Profile Setup → Home
 *
 * All screens are registered here as stack routes.
 * The initial route is the index (OnboardingScreen).
 */

import '../utils/safeNavigation';
import React, { useMemo } from 'react';
import { Platform } from 'react-native';
import { Stack } from 'expo-router';
export { ErrorBoundary } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaInsetsContext, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
  DMSans_700Bold,
} from '@expo-google-fonts/dm-sans';
import {
  Inter_400Regular,
  Inter_500Medium,
} from '@expo-google-fonts/inter';
import { UserProvider } from '../store/UserContext';
import { BookingProvider } from '../store/BookingContext';
import { FavoritesProvider } from '../store/FavoritesContext';
import { MessagesProvider } from '../store/MessagesContext';
import { InAppShareModal } from '../components/InAppShareModal';
import { BookmarkBottomSheetModal } from '../components/BookmarkBottomSheetModal';
import { GlobalTopToast } from '../components/ui/GlobalTopToast';

/**
 * Ensures a minimum safe bottom inset on Android to prevent UI and buttons
 * from being obscured by the Android 3-button navigation dock (~48dp–56dp).
 */
function GlobalSafeAreaInsetsAdapter({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  const adjustedInsets = useMemo(() => {
    if (!insets) return insets;
    return {
      ...insets,
      bottom: Platform.OS === 'android' ? Math.max(insets.bottom, 52) : insets.bottom,
    };
  }, [insets]);

  return (
    <SafeAreaInsetsContext.Provider value={adjustedInsets}>
      {children}
    </SafeAreaInsetsContext.Provider>
  );
}

if (Platform.OS === 'web' && typeof document !== 'undefined') {
  const styleId = 'trend-web-autofill-reset';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      html, body, #root {
        scroll-behavior: smooth;
        -webkit-overflow-scrolling: touch;
        overscroll-behavior-y: none;
      }
      * {
        -webkit-tap-highlight-color: transparent;
      }
      input:-webkit-autofill,
      input:-webkit-autofill:hover, 
      input:-webkit-autofill:focus,
      input:-webkit-autofill:active {
        -webkit-box-shadow: 0 0 0 1000px rgba(248, 249, 250, 0.98) inset !important;
        -webkit-text-fill-color: #141A33 !important;
        background-color: transparent !important;
        transition: background-color 5000s ease-in-out 0s !important;
      }
      input, textarea {
        background-color: transparent !important;
        outline: none !important;
        border: none !important;
        box-shadow: none !important;
      }
    `;
    document.head.appendChild(style);
  }
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
    'DMSans-Regular': DMSans_400Regular,
    'DMSans-Medium': DMSans_500Medium,
    'DMSans-SemiBold': DMSans_600SemiBold,
    'DMSans-Bold': DMSans_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter: Inter_500Medium,
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <GlobalSafeAreaInsetsAdapter>
        <UserProvider>
          <BookingProvider>
            <FavoritesProvider>
              <MessagesProvider>
                {/* Dark status bar text on white background */}
                <StatusBar style="dark" />

                <Stack
                  screenOptions={{
                    headerShown: false, // We use our own custom headers
                    animation: 'none', // Instant navigation across the platform (never slides right/left when clicked)
                    navigationBarColor: '#FFFFFF',
                    navigationBarTranslucent: false,
                    contentStyle: { backgroundColor: '#FFFFFF' },
                  }}
                >
                {/* ─── Quick Action Sheets (Drawer / Bottom Sheet Presentation) ─ */}
                <Stack.Screen
                  name="appointment-day"
                  options={{
                    presentation: 'transparentModal',
                    animation: 'slide_from_bottom',
                  }}
                />
                <Stack.Screen name="add-card" />
                <Stack.Screen name="bank-transfer" />

                {/* ─── Onboarding ─────────────────────────────────────────── */}
                <Stack.Screen name="index" />

                {/* ─── Auth Screens ───────────────────────────────────────── */}
                <Stack.Screen name="sign-up" />
                <Stack.Screen name="sign-in" />
                <Stack.Screen name="forgot-password" />
                <Stack.Screen name="email-verification" />
                <Stack.Screen name="phone-verification" />
                <Stack.Screen name="sign-up-success" />
                <Stack.Screen name="appointment-time" />
                <Stack.Screen name="style-selection" />
                <Stack.Screen name="add-one-product" />
                <Stack.Screen name="booking-success" />

                {/* ─── Profile Setup Wizard ───────────────────────────────── */}
                <Stack.Screen name="user-location" />
                <Stack.Screen name="user-profile" />
                <Stack.Screen name="user-gender" />
                <Stack.Screen name="username" />
                <Stack.Screen name="change-location" />

                {/* ─── Main App ───────────────────────────────────────────── */}
                <Stack.Screen name="home" />
                <Stack.Screen name="video" options={{ presentation: 'fullScreenModal' }} />

                {/* ─── Salon Routes ──────────────────────────────────────────── */}
                <Stack.Screen name="salon/location" />
                <Stack.Screen name="salon/about" />
                <Stack.Screen name="salon/gallery" />
                <Stack.Screen name="salon/services" />
                <Stack.Screen name="salon/staffs" />
                <Stack.Screen name="salon/reviews" />
                <Stack.Screen name="salon/[id]" />
              </Stack>

              {/* ─── Global In-App Share Bottom Sheet Modal ─────────────── */}
              <InAppShareModal />

              {/* ─── Global Bookmark Bottom Sheet Modal ─────────────────── */}
              <BookmarkBottomSheetModal />

              {/* ─── Global Top Toast Notification ─────────────────────── */}
              <GlobalTopToast />
              </MessagesProvider>
            </FavoritesProvider>
          </BookingProvider>
        </UserProvider>
      </GlobalSafeAreaInsetsAdapter>
    </SafeAreaProvider>
  );
}

