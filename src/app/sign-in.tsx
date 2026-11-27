/**
 * Route: /sign-in
 */

import { useSafeRouter } from '../utils/safeNavigation';
import { SignInScreen } from '../screens/auth/SignInScreen';

export default function SignInRoute() {
  const safeRouter = useSafeRouter();

  return (
    <SignInScreen
      navigation={{
        navigate: (screen: string) => {
          if (screen === 'Home' || screen === 'SignInSuccess') {
            safeRouter.replace({ pathname: '/sign-in-success', params: { mode: 'sign-in' } } as any);
          }
          if (screen === 'ForgotPassword') safeRouter.push('/forgot-password');
          if (screen === 'SignUpScreen') safeRouter.push('/sign-up');
          if (screen === 'TermsScreen') console.log('TODO: Terms screen');
        },
        goBack: () => safeRouter.back(),
      }}
    />
  );
}
