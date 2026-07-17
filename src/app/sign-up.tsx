/**
 * Route: /sign-up
 */

import { useRouter } from 'expo-router';
import { SignUpScreen } from '@/screens/auth/SignUpScreen';

export default function SignUpRoute() {
  const router = useRouter();

  return (
    <SignUpScreen
      navigation={{
        navigate: (screen: string, params?: any) => {
          if (screen === 'SignInScreen') router.push('/sign-in');
          if (screen === 'PhoneVerification') router.push({ pathname: '/phone-verification', params });
          if (screen === 'UserLocation') router.push('/user-location');
          if (screen === 'TermsScreen') console.log('TODO: Terms screen');
        },
        goBack: () => router.back(),
      }}
    />
  );
}
