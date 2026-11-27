/**
 * Route: /username
 */

import { useSafeRouter } from '../utils/safeNavigation';
import { UsernameScreen } from '../screens/profile-setup/UsernameScreen';

export default function UsernameRoute() {
  const safeRouter = useSafeRouter();

  return (
    <UsernameScreen
      navigation={{
        navigate: (screen: string) => {
          if (screen === 'Home') safeRouter.push('/home');
        },
        goBack: () => safeRouter.back(),
      }}
    />
  );
}
