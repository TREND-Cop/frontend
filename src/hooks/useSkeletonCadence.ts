import { useState, useEffect } from 'react';

/**
 * useSkeletonCadence
 *
 * Hook to manage content-first skeleton hydration for the two designated screens:
 * 1. Salon Detail Screen (/salon/[id])
 * 2. Style Details Screen (/professional/style-details)
 *
 * Images, layout scaffolds, and action buttons render immediately,
 * while textual details display a subtle pulsing skeleton for durationMs (~1.1s)
 * before smoothly fading into view.
 *
 * @param durationMs Duration in ms for the skeleton loader to display (default: 1400ms)
 */
export function useSkeletonCadence(durationMs: number = 1400) {
  const [isSkeletonLoading, setIsSkeletonLoading] = useState<boolean>(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSkeletonLoading(false);
    }, durationMs);

    return () => clearTimeout(timer);
  }, [durationMs]);

  return { isSkeletonLoading };
}

