import React from 'react';
import { StaffHomeScreen } from '../screens/staff/StaffHomeScreen';
import { StaffMessagesProvider } from '../context/StaffMessagesContext';
import { StaffTutorialProvider } from '../context/StaffTutorialContext';

export default function StaffHomeAliasRoute() {
  return (
    <StaffMessagesProvider>
      <StaffTutorialProvider>
        <StaffHomeScreen />
      </StaffTutorialProvider>
    </StaffMessagesProvider>
  );
}
