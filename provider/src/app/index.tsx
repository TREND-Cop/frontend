import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { ProviderOnboardingScreen } from '../screens/auth/ProviderOnboardingScreen';
import { DEV_SEED_DRAFT } from '../context/ServiceDraftContext';

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    if (DEV_SEED_DRAFT) {
      router.replace('/business-services-review');
    }
  }, [router]);

  return (
    <ProviderOnboardingScreen
      onSelectRole={(role, mode) => {
        if (role === 'business_owner') {
          if (mode === 'create_account') {
            router.push('/sign-up-business-owner');
          } else {
            router.push('/login-business-owner');
          }
        } else if (role === 'staff') {
          router.push('/staff-login-code' as any);
        }
      }}
    />
  );
}
