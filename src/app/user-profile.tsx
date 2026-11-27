/**
 * Route: /user-profile
 */

import { useSafeRouter } from '../utils/safeNavigation';
import { UserProfileScreen } from '../screens/profile-setup/UserProfileScreen';

export default function UserProfileRoute() {
  const safeRouter = useSafeRouter();

  return (
    <UserProfileScreen
      navigation={{
        navigate: (screen: string) => {
          if (screen === 'UserGender') safeRouter.push('/user-gender');
        },
        goBack: () => safeRouter.back(),
      }}
    />
  );
}
