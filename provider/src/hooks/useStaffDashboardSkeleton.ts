import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';

/**
 * Global navigation trigger flag for Staff Home skeleton on return.
 * Set right before navigating to any child screen (Prompts 2-4),
 * consumed on the next focus event of StaffHomeScreen.
 */
let hasNavigatedToStaffChild = false;

/**
 * Call right before navigating away from Staff Home to any child screen.
 * This ensures returning via back button, hardware back, or flow completion
 * triggers the skeleton on return.
 */
export function markStaffSubScreenNavigation() {
  hasNavigatedToStaffChild = true;
}

/**
 * Resets the staff navigation flag (e.g. for testing or logout).
 */
export function resetStaffSubScreenNavigation() {
  hasNavigatedToStaffChild = false;
}

/**
 * Hook for Staff Home skeleton on return.
 *
 * Rules:
 * 1. NO skeleton on initial entry / arrival (the Successful screen spinner already covers it).
 * 2. NO skeleton on tab switching.
 * 3. Shows skeleton for durationMs (~900ms) ONLY when returning from a sub-screen.
 */
export function useStaffDashboardSkeleton(durationMs: number = 900) {
  const [isLoading, setIsLoading] = useState<boolean>(() => hasNavigatedToStaffChild);

  useFocusEffect(
    useCallback(() => {
      if (hasNavigatedToStaffChild) {
        // Sub-screen return detected: consume flag and trigger skeleton
        hasNavigatedToStaffChild = false;
        setIsLoading(true);

        const timer = setTimeout(() => {
          setIsLoading(false);
        }, durationMs);

        return () => clearTimeout(timer);
      } else {
        // Direct arrival or tab focus without child navigation
        setIsLoading(false);
      }
    }, [durationMs])
  );

  return { isLoading };
}
