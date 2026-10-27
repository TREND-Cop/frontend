import { useState, useCallback, useRef, useEffect } from 'react';
import { useFocusEffect, useNavigation } from 'expo-router';

/**
 * Universal Skeleton Loading on Navigation & 'Go Back' Hook for Provider Profile
 * Shows the animated shimmer skeleton for durationMs (~1100ms) on initial entry,
 * tab switches, and every 'Go Back' navigation event.
 */
export function useProfileSkeleton(durationMs: number = 1100) {
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

  // 1. Trigger when screen gains focus or returns via goBack (useFocusEffect)
  useFocusEffect(
    useCallback(() => {
      startLoading();
      return () => {
        resetToLoading();
      };
    }, [startLoading, resetToLoading])
  );

  // 2. Navigation focus & blur listeners (handles modal dismissals, stack pops)
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

  return { isLoading };
}
