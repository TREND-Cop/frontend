/**
 * Route: /forgot-password
 */

import { useRouter } from 'expo-router';
import { ForgotPasswordScreen } from '../screens/auth/ForgotPasswordScreen';

export default function ForgotPasswordRoute() {
  const router = useRouter();

  return (
    <ForgotPasswordScreen
      navigation={{
        navigate: (screen: string, params?: any) => {
          if (screen === 'VerificationMethod') {
            router.push('/verification-method');
          } else if (screen === 'EmailVerification') {
            router.push({
              pathname: '/email-verification',
              params: { email: params?.email },
            });
          }
        },
        goBack: () => router.back(),
      }}
    />
  );
}
