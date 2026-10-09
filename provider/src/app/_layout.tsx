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
import { calculateNativeDock } from '../utils/useNativeDock';

// Global CSS reset for web to strip browser input outlines, focus rings, and autofill boxes
if (Platform.OS === 'web' && typeof document !== 'undefined') {
  const styleId = 'trend-provider-web-reset';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      input, textarea, select {
        outline: none !important;
        border: none !important;
        box-shadow: none !important;
        -webkit-box-shadow: none !important;
        background-color: transparent !important;
      }
      input:focus, textarea:focus, select:focus {
        outline: none !important;
        border: none !important;
        box-shadow: none !important;
        -webkit-box-shadow: none !important;
      }
      input:-webkit-autofill,
      input:-webkit-autofill:hover, 
      input:-webkit-autofill:focus {
        -webkit-box-shadow: 0 0 0px 1000px rgba(247, 247, 247, 0.96) inset !important;
        -webkit-text-fill-color: #000000 !important;
        transition: background-color 5000s ease-in-out 0s !important;
      }
    `;
    document.head.appendChild(style);
  }
}

/**
 * Ensures a minimum safe bottom inset on Android to prevent UI and buttons
 * from being obscured by the Android 3-button navigation dock (~48dp–56dp).
 */
function GlobalSafeAreaInsetsAdapter({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  const adjustedInsets = useMemo(() => {
    if (!insets) return insets;
    const { hasDock, dockHeight } = calculateNativeDock(insets.bottom);
    return {
      ...insets,
      bottom: hasDock ? dockHeight : insets.bottom,
    };
  }, [insets]);

  return (
    <SafeAreaInsetsContext.Provider value={adjustedInsets}>
      {children}
    </SafeAreaInsetsContext.Provider>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
    Inter_400Regular,
    Inter_500Medium,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <GlobalSafeAreaInsetsAdapter>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#FFFFFF' },
            animation: Platform.OS === 'ios' ? 'default' : 'fade_from_bottom',
            navigationBarColor: '#FFFFFF',
            navigationBarTranslucent: false,
          }}
        >
          <Stack.Screen name="index" />
        </Stack>
      </GlobalSafeAreaInsetsAdapter>
    </SafeAreaProvider>
  );
}
