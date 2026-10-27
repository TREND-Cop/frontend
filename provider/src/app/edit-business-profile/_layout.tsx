import React from 'react';
import { Slot } from 'expo-router';
import { EditProfileDraftProvider } from '../../context/EditProfileDraftContext';

export default function EditBusinessProfileLayout() {
  return (
    <EditProfileDraftProvider>
      <Slot />
    </EditProfileDraftProvider>
  );
}
