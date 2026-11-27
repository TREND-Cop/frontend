/**
 * Route: /phone-verification
 */

import { useLocalSearchParams } from 'expo-router';
import { useSafeRouter } from '../utils/safeNavigation';
import { PhoneVerificationScreen } from '@/screens/auth/PhoneVerificationScreen';

export default function PhoneVerificationRoute() {
  const safeRouter = useSafeRouter();
  const params = useLocalSearchParams<{ phone: string; flow?: string }>();

  return (
    <PhoneVerificationScreen
      route={{ params: { phone: params.phone, flow: params.flow } }}
      navigation={{
        navigate: (screen: string) => {
          if (params.flow === 'forgot-password' || screen === 'PasswordResetSuccess') {
            safeRouter.replace('/password-reset-success' as any);
          } else if (screen === 'SignUpSuccess' || screen === 'UserLocation') {
            safeRouter.replace('/sign-up-success' as any);
          }
        },
        goBack: () => safeRouter.back(),
      }}
    />
  );
}
