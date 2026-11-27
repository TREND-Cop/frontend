import React from 'react';
import { Stack } from 'expo-router';
import PayoutDeletedSuccessScreen from '../screens/payout/PayoutDeletedSuccessScreen';

export default function PayoutDeletedRoute() {
  return (
    <>
      <Stack.Screen options={{ gestureEnabled: false }} />
      <PayoutDeletedSuccessScreen />
    </>
  );
}
