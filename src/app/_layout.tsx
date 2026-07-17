/**
 * Root Layout — Sets up the navigation stack for the entire app.
 *
 * Uses expo-router's Stack navigator to manage the screen flow:
 * Onboarding → SignUp/SignIn → Profile Setup → Home
 *
 * All screens are registered here as stack routes.
 * The initial route is the index (OnboardingScreen).
 */

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      {/* Dark status bar text on white background */}
      <StatusBar style="dark" />

      <Stack
        screenOptions={{
          headerShown: false, // We use our own custom headers
          animation: 'slide_from_right',
        }}
      >
        {/* ─── Onboarding ─────────────────────────────────────────── */}
        <Stack.Screen name="index" />

        {/* ─── Auth Screens ───────────────────────────────────────── */}
        <Stack.Screen name="sign-up" />
        <Stack.Screen name="sign-in" />
        <Stack.Screen name="forgot-password" />
        <Stack.Screen name="email-verification" />

        {/* ─── Profile Setup Wizard ───────────────────────────────── */}
        <Stack.Screen name="user-location" />
        <Stack.Screen name="user-profile" />
        <Stack.Screen name="user-gender" />
        <Stack.Screen name="username" />

        {/* ─── Main App ───────────────────────────────────────────── */}
        <Stack.Screen name="home" />
      </Stack>
    </>
  );
}
