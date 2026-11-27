/**
 * Route: /user-location (Step 1 of Profile Setup: Enter Your Location)
 */

import React from 'react';
import { useSafeRouter } from '../utils/safeNavigation';
import { UserLocationScreen } from '../screens/profile-setup/UserLocationScreen';

export default function UserLocationRoute() {
  const safeRouter = useSafeRouter();

  return (
    <UserLocationScreen
      navigation={{
        navigate: (screen: string) => {
          if (screen === 'UserProfile') safeRouter.push('/user-profile');
        },
        goBack: () => safeRouter.back(),
      }}
    />
  );
}
