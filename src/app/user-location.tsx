/**
 * Route: /user-location (Step 1 of Profile Setup: Enter Your Location)
 */

import React from 'react';
import { useRouter } from 'expo-router';
import { UserLocationScreen } from '../screens/profile-setup/UserLocationScreen';

export default function UserLocationRoute() {
  const router = useRouter();

  return (
    <UserLocationScreen
      navigation={{
        navigate: (screen: string) => {
          if (screen === 'UserProfile') router.push('/user-profile');
        },
        goBack: () => router.back(),
      }}
    />
  );
}
