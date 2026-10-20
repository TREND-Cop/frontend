import { useMemo } from 'react';
import { useStaffStore, StaffMember, useStaffLoading } from '../context/StaffContext';
import { DEV_SAMPLE_STAFF } from '../constants/staff.config';

export { StaffMember, DEV_SAMPLE_STAFF };

export interface UseStaffResult {
  staffList: StaffMember[];
  isLoading: boolean;
  refetch: () => void;
}

/**
 * useStaff Hook
 *
 * Reads directly from the shared StaffContext store.
 * One source of truth across wizard steps, edit screens, and management list.
 *
 * TODO (Backend): Connect to backend API when available.
 */
export function useStaff(): UseStaffResult {
  const { staff } = useStaffStore();
  const isLoading = useStaffLoading();

  const refetch = () => {
    // Stub for future backend refetch
  };

  return {
    staffList: staff,
    isLoading,
    refetch,
  };
}

export default useStaff;
