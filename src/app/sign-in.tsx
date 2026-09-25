/**
 * Route: /sign-in
 */

import { useRouter } from 'expo-router';
import { SignInScreen } from '../screens/auth/SignInScreen';

export default function SignInRoute() {
  const router = useRouter();

  return (
    <SignInScreen
      navigation={{
        navigate: (screen: string) => {
          if (screen === 'Home' || screen === 'SignInSuccess') {
            router.replace({ pathname: '/sign-in-success', params: { mode: 'sign-in' } } as any);
          }
          if (screen === 'ForgotPassword') router.push('/forgot-password');
          if (screen === 'SignUpScreen') router.push('/sign-up');
          if (screen === 'TermsScreen') console.log('TODO: Terms screen');
        },
        goBack: () => router.back(),
      }}
    />
  );
}
