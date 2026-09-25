/**
 * Route: /username
 */

import { useRouter } from 'expo-router';
import { UsernameScreen } from '../screens/profile-setup/UsernameScreen';

export default function UsernameRoute() {
  const router = useRouter();

  return (
    <UsernameScreen
      navigation={{
        navigate: (screen: string) => {
          if (screen === 'Home') router.push('/home');
        },
        goBack: () => router.back(),
      }}
    />
  );
}
