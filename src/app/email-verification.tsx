/**
 * Route: /email-verification
 */

import { useRouter, useLocalSearchParams } from 'expo-router';
import { EmailVerificationScreen } from '@/screens/auth/EmailVerificationScreen';

export default function EmailVerificationRoute() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email: string }>();

  return (
    <EmailVerificationScreen
      route={{ params: { email: params.email } }}
      navigation={{
        navigate: (screen: string) => {
          if (screen === 'SignInScreen') router.push('/sign-in');
        },
        goBack: () => router.back(),
      }}
    />
  );
}
