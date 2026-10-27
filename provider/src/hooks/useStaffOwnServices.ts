import { useMemo } from 'react';
import {
  DEV_SAMPLE_STAFF_SERVICES,
  FRAME_STAFF_SERVICES,
} from '../constants/staffAppointments.config';

/**
 * Hook to retrieve the staff member's own services assigned to their profile.
 *
 * Per Figma specification:
 * "Staff can only filter based on the services that have been added to their profile on the Staff Management Section."
 *
 * Current frontend stub: returns undefined by default unless DEV_SAMPLE_STAFF_SERVICES is true.
 * TODO (Backend): Fetch staff member's assigned services from backend.
 */
export function useStaffOwnServices(): string[] | undefined {
  return useMemo(() => {
    if (DEV_SAMPLE_STAFF_SERVICES) {
      return [...FRAME_STAFF_SERVICES];
    }
    // Default: undefined until backend hydrates staff profile services
    return undefined;
  }, []);
}
