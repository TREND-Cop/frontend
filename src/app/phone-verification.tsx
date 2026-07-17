/**
 * Route: /phone-verification
 */

import { useRouter, useLocalSearchParams } from 'expo-router';
import { PhoneVerificationScreen } from '@/screens/auth/PhoneVerificationScreen';

export default function PhoneVerificationRoute() {
  const router = useRouter();
  const params = useLocalSearchParams<{ phone: string }>();

  return (
    <PhoneVerificationScreen
      route={{ params: { phone: params.phone } }}
      navigation={{
        navigate: (screen: string) => {
          if (screen === 'UserLocation') router.push('/user-location');
        },
        goBack: () => router.back(),
      }}
    />
  );
}
