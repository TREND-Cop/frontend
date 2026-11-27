import { useState, useCallback, useEffect, useRef } from 'react';
import { useFocusEffect, useNavigation } from 'expo-router';

/**
 * useStaffTabSkeleton
 *
 * Universal animated skeleton loading hook for all Staff screens (Dashboard, Messages, Profile).
 * Enforces skeleton loading whenever:
 * 1. A navigation tab button is clicked (Dashboard, Messages, Profile).
 * 2. Navigating to the screen via router.push or router.replace.
 * 3. Returning to the screen via router.back(), Android hardware dock, or swipe back.
 *
 * Automatically resets on blur to eliminate any visual flash of stale content on subsequent entry.
 *
 * @param durationMs Duration in ms for the skeleton loader to display (default: 900ms)
 */
export function useStaffTabSkeleton(durationMs: number = 900) {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigation = useNavigation<any>();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startLoading = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setIsLoading(true);
    timerRef.current = setTimeout(() => {
      setIsLoading(false);
    }, durationMs);
  }, [durationMs]);

  const resetToLoading = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setIsLoading(true);
  }, []);

  // 1. Focus effect: runs on initial entry, tab switch, or return via goBack
  useFocusEffect(
    useCallback(() => {
      startLoading();
      return () => {
        resetToLoading();
      };
    }, [startLoading, resetToLoading])
  );

  // 2. Navigation focus & blur listeners (including parent navigator transitions)
  useEffect(() => {
    if (!navigation) return;

    const unsubFocus = navigation.addListener('focus', () => {
      startLoading();
    });

    const unsubBlur = navigation.addListener('blur', () => {
      resetToLoading();
    });

    const parentNav = navigation.getParent?.();
    const unsubParentFocus = parentNav?.addListener?.('focus', () => {
      if (navigation.isFocused?.()) {
        startLoading();
      }
    });

    return () => {
      unsubFocus?.();
      unsubBlur?.();
      unsubParentFocus?.();
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [navigation, startLoading, resetToLoading]);

  return { isLoading, startLoading };
}

