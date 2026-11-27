/**
 * Route: /user-gender
 */

import { useSafeRouter } from '../utils/safeNavigation';
import { UserGenderScreen } from '../screens/profile-setup/UserGenderScreen';

export default function UserGenderRoute() {
  const safeRouter = useSafeRouter();

  return (
    <UserGenderScreen
      navigation={{
        navigate: (screen: string) => {
          if (screen === 'Username') safeRouter.push('/username');
        },
        goBack: () => safeRouter.back(),
      }}
    />
  );
}
