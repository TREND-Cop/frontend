/**
 * Route: /sign-up
 */

import { SignUpScreen } from '../screens/auth/SignUpScreen';
import { useSafeRouter } from '../utils/safeNavigation';

export default function SignUpRoute() {
  const safeRouter = useSafeRouter();

  return (
    <SignUpScreen
      navigation={{
        navigate: (screen: string, params?: any) => {
          if (screen === 'SignInScreen') safeRouter.push('/sign-in');
          if (screen === 'UserLocation') safeRouter.push('/user-location');
          if (screen === 'PhoneVerification') {
            // Number verification after sign up (commented out, preserved for future use)
            // safeRouter.push({ pathname: '/phone-verification', params });
            safeRouter.push('/user-location');
          }
          if (screen === 'TermsScreen') console.log('TODO: Terms screen');
        },
        goBack: () => safeRouter.back(),
      }}
    />
  );
}
