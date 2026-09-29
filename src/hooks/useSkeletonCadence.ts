import { useState, useEffect, useCallback, useRef } from 'react';
import { useFocusEffect, useNavigation } from 'expo-router';
import { tabSkeletonStore } from '../utils/tabSkeletonStore';

/**
 * useSkeletonCadence
 *
 * Hook to manage content-first skeleton hydration for the two designated screens:
 * 1. Salon Detail Screen (/salon/[id])
 * 2. Style Details Screen (/professional/style-details)
 *
 * Images, layout scaffolds, and action buttons render immediately,
 * while textual details display a subtle pulsing skeleton for durationMs (~1.1s–1.4s)
 * before smoothly fading into view.
 *
 * Enforces skeleton loading every single time the user enters the screen OR clicks "Go Back" to it.
 *
 * @param durationMs Duration in ms for the skeleton loader to display (default: 1400ms)
 */
export function useSkeletonCadence(durationMs: number = 1400) {
  const [isSkeletonLoading, setIsSkeletonLoading] = useState<boolean>(true);
  const navigation = useNavigation<any>();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startLoading = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setIsSkeletonLoading(true);
    timerRef.current = setTimeout(() => {
      setIsSkeletonLoading(false);
    }, durationMs);
  }, [durationMs]);

  const resetToLoading = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setIsSkeletonLoading(true);
  }, []);

  // 1. Focus effect: runs whenever screen is focused or returned to via goBack
  useFocusEffect(
    useCallback(() => {
      startLoading();
      return () => {
        resetToLoading();
      };
    }, [startLoading, resetToLoading])
  );

  // 2. Navigation focus & blur listeners
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

    const unsubBack = tabSkeletonStore.subscribeBack(() => {
      setTimeout(() => {
        if (navigation.isFocused?.()) {
          startLoading();
        }
      }, 50);
    });

    return () => {
      unsubFocus?.();
      unsubBlur?.();
      unsubParentFocus?.();
      unsubBack?.();
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [navigation, startLoading, resetToLoading]);

  return { isSkeletonLoading };
}

