import { useMemo } from 'react';

/**
 * Service View-Model
 * TODO (Backend): shape to confirm
 */
export interface Service {
  id: string;
  name: string;
  imageUri: string | null;
  createdAt: string; // ISO string in UTC or local timezone
  isNew?: boolean;
}

/**
 * DEV ONLY flag:
 * Set to true to preview sample services from the design ('Men Brade' and 'Tapper Fade').
 * Default is strictly false to show the explicit empty state.
 */
export const DEV_SAMPLE_SERVICES: boolean = false;

/**
 * Generates sample services matching Figma frame F2 with dynamic, non-hardcoded dates.
 */
function getDevSampleServices(): Service[] {
  const now = new Date();
  const currentYear = now.getFullYear();

  // "11th 03, [currentYear]" per design demonstration
  const menBradeDate = new Date(currentYear, 2, 11, 10, 30, 0); // March 11
  const tapperFadeDate = new Date(currentYear, 2, 11, 14, 15, 0); // March 11

  return [
    {
      id: 'service-men-brade',
      name: 'Men Brade',
      imageUri: null, // TODO (Asset): Men Brade photo (153x104, 2x: 306x208, 3x: 459x312 PNG/JPG)
      createdAt: menBradeDate.toISOString(),
      isNew: false,
    },
    {
      id: 'service-tapper-fade',
      name: 'Tapper Fade',
      imageUri: null, // TODO (Asset): Tapper Fade photo (153x104, 2x: 306x208, 3x: 459x312 PNG/JPG)
      createdAt: tapperFadeDate.toISOString(),
      isNew: true, // Shows green "New" tag
    },
  ];
}

/**
 * Hook to retrieve business services.
 * Stubbed with TODO (Backend).
 * Returns empty list by default unless DEV_SAMPLE_SERVICES is true or options.devSample is true.
 */
export function useServices(options?: { devSample?: boolean }): {
  services: Service[];
  isLoading: boolean;
} {
  // TODO (Backend): Replace with real local state/API call
  const useDev = options?.devSample ?? DEV_SAMPLE_SERVICES;

  const services = useMemo(() => {
    if (useDev) {
      return getDevSampleServices();
    }
    return [];
  }, [useDev]);

  return {
    services,
    isLoading: false,
  };
}

export default useServices;
