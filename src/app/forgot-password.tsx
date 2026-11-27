/**
 * Route: /forgot-password
 */

import { useSafeRouter } from '../utils/safeNavigation';
import { ForgotPasswordScreen } from '../screens/auth/ForgotPasswordScreen';

export default function ForgotPasswordRoute() {
  const safeRouter = useSafeRouter();

  return (
    <ForgotPasswordScreen
      navigation={{
        navigate: (screen: string, params?: any) => {
          if (screen === 'VerificationMethod') {
            safeRouter.push('/verification-method');
          } else if (screen === 'EmailVerification') {
            safeRouter.push({
              pathname: '/email-verification',
              params: { email: params?.email },
            });
          }
        },
        goBack: () => safeRouter.back(),
      }}
    />
  );
}
