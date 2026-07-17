/**
 * Route: / (index)
 * Entry point — renders the OnboardingScreen carousel.
 */

import { useRouter } from 'expo-router';
import { OnboardingScreen } from '@/screens/onboarding/OnboardingScreen';

export default function OnboardingRoute() {
  const router = useRouter();

  return (
    <OnboardingScreen
      navigation={{
        navigate: (screen: string) => {
          // Map screen names to expo-router paths
          if (screen === 'SignUpScreen') router.push('/sign-up');
        },
      }}
    />
  );
}
