/**
 * Route: /onboarding
 * 1:1 Figma Video Onboarding Screen.
 */

import { useRouter } from 'expo-router';
import { OnboardingScreen } from '../screens/onboarding/OnboardingScreen';

export default function OnboardingScreenRoute() {
  const router = useRouter();

  return (
    <OnboardingScreen
      onSignUp={() => router.push('/sign-up')}
      onSignIn={() => router.push('/sign-in')}
      onDismiss={() => router.push('/sign-up')}
    />
  );
}
