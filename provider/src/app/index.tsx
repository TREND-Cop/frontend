import React from 'react';
import { useRouter } from 'expo-router';
import { ProviderOnboardingScreen } from '../screens/auth/ProviderOnboardingScreen';

export default function Index() {
  const router = useRouter();

  return (
    <ProviderOnboardingScreen
      onSelectRole={(role, mode) => {
        if (role === 'business_owner') {
          router.push('/login-business-owner');
        }
      }}
    />
  );
}
