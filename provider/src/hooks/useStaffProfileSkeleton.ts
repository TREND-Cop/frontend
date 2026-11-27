import { useStaffTabSkeleton } from './useStaffTabSkeleton';

let hasNavigatedToStaffProfileChild = false;

export function markStaffProfileChildNavigation() {
  hasNavigatedToStaffProfileChild = true;
}

export function resetStaffProfileChildNavigation() {
  hasNavigatedToStaffProfileChild = false;
}

/**
 * Hook for Staff Profile skeleton.
 * Triggers skeleton loader on every arrival, tab switch, and goBack navigation.
 */
export function useStaffProfileSkeleton(durationMs: number = 900) {
  return useStaffTabSkeleton(durationMs);
}

export default useStaffProfileSkeleton;
