import React from 'react';
import { ProviderTermsPolicyScreen } from '../../screens/profile/TermsPolicyScreen';

/**
 * Isolated Staff Route wrapping the reused Terms & Policy screen.
 * Tapping back cleanly returns to the Staff Profile tab, triggering the skeleton on return.
 */
export default function StaffTermsPolicyRoute() {
  return <ProviderTermsPolicyScreen isStaff={true} />;
}

