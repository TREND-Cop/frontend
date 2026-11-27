/**
 * Route: / (index)
 * Entry point — renders the 1:1 Figma Video Onboarding Screen.
 */

import { useSafeRouter } from '../utils/safeNavigation';
import { OnboardingScreen } from '../screens/onboarding/OnboardingScreen';

export default function OnboardingRoute() {
  const safeRouter = useSafeRouter();

  return (
    <OnboardingScreen
      onSignUp={() => safeRouter.push('/sign-up')}
      onSignIn={() => safeRouter.push('/sign-in')}
      onDismiss={() => safeRouter.replace('/home')}
      onGetStarted={() => safeRouter.push('/role-selection' as any)}
    />
  );
}
