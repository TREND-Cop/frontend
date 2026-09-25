/**
 * Route: /phone-verification
 */

import { useRouter, useLocalSearchParams } from 'expo-router';
import { PhoneVerificationScreen } from '@/screens/auth/PhoneVerificationScreen';

export default function PhoneVerificationRoute() {
  const router = useRouter();
  const params = useLocalSearchParams<{ phone: string; flow?: string }>();

  return (
    <PhoneVerificationScreen
      route={{ params: { phone: params.phone, flow: params.flow } }}
      navigation={{
        navigate: (screen: string) => {
          if (params.flow === 'forgot-password' || screen === 'PasswordResetSuccess') {
            router.replace('/password-reset-success' as any);
          } else if (screen === 'SignUpSuccess' || screen === 'UserLocation') {
            router.replace('/sign-up-success' as any);
          }
        },
        goBack: () => router.back(),
      }}
    />
  );
}
