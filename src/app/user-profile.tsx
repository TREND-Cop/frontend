/**
 * Route: /user-profile
 */

import { useRouter } from 'expo-router';
import { UserProfileScreen } from '@/screens/profile-setup/UserProfileScreen';

export default function UserProfileRoute() {
  const router = useRouter();

  return (
    <UserProfileScreen
      navigation={{
        navigate: (screen: string) => {
          if (screen === 'UserGender') router.push('/user-gender');
        },
        goBack: () => router.back(),
      }}
    />
  );
}
