/**
 * Route: /user-gender
 */

import { useRouter } from 'expo-router';
import { UserGenderScreen } from '@/screens/profile-setup/UserGenderScreen';

export default function UserGenderRoute() {
  const router = useRouter();

  return (
    <UserGenderScreen
      navigation={{
        navigate: (screen: string) => {
          if (screen === 'Username') router.push('/username');
        },
        goBack: () => router.back(),
      }}
    />
  );
}
