import { useStaffTabSkeleton } from './useStaffTabSkeleton';

let hasNavigatedToStaffChild = false;

export function markStaffSubScreenNavigation() {
  hasNavigatedToStaffChild = true;
}

export function resetStaffSubScreenNavigation() {
  hasNavigatedToStaffChild = false;
}

/**
 * Hook for Staff Home skeleton.
 * Triggers skeleton loader on every arrival, tab switch, and goBack navigation.
 */
export function useStaffDashboardSkeleton(durationMs: number = 900) {
  return useStaffTabSkeleton(durationMs);
}

export default useStaffDashboardSkeleton;
