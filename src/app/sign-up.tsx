/**
 * Route: /sign-up
 */

import { SignUpScreen } from '@/screens/auth/SignUpScreen';
import { useRouter } from 'expo-router';

export default function SignUpRoute() {
  const router = useRouter();

  return (
    <SignUpScreen
      navigation={{
        navigate: (screen: string) => {
          if (screen === 'SignInScreen') router.push('/sign-in');
          if (screen === 'UserLocation') router.push('/user-location');
          if (screen === 'TermsScreen') console.log('TODO: Terms screen');
        },
        goBack: () => router.back(),
      }}
    />
  );
}
