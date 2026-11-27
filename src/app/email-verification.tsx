/**
 * Route: /email-verification
 */

import { useLocalSearchParams } from 'expo-router';
import { useSafeRouter } from '../utils/safeNavigation';
import { EmailVerificationScreen } from '@/screens/auth/EmailVerificationScreen';

export default function EmailVerificationRoute() {
  const safeRouter = useSafeRouter();
  const params = useLocalSearchParams<{ email: string }>();

  return (
    <EmailVerificationScreen
      route={{ params: { email: params.email } }}
      navigation={{
        navigate: (screen: string) => {
          if (screen === 'PasswordResetSuccess' || screen === 'SignInScreen') {
            safeRouter.replace('/password-reset-success' as any);
          }
        },
        goBack: () => safeRouter.back(),
      }}
    />
  );
}
