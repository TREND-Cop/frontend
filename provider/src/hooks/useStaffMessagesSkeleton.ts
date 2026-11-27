import { useStaffTabSkeleton } from './useStaffTabSkeleton';

/**
 * Hook for Staff Messages skeleton.
 * Triggers skeleton loader on every arrival, tab switch, and goBack navigation.
 */
export function useStaffMessagesSkeleton(durationMs: number = 900) {
  return useStaffTabSkeleton(durationMs);
}

export default useStaffMessagesSkeleton;

