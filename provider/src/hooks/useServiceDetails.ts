import { useMemo } from 'react';
import { DEV_SAMPLE_SERVICES } from './useServices';
import { StaffMember } from './useStaff';
import { ServicePackageItem, AddOnItem } from '../context/ServiceDraftContext';

/**
 * ServiceDetails ViewModel
 * TODO (Backend): shape to confirm
 */
export interface ServiceDetails {
  id: string;
  name: string;
  imageUri: string | null;
  price: number;
  duration: string;
  discount?: number | null;
  staff: StaffMember[];
  addOns: AddOnItem[];
  packages: ServicePackageItem[];
}

/**
 * Hook to retrieve service details by ID.
 * Stubbed with local state / mock data.
 * TODO (Backend): Replace with real API/DB fetch.
 *
 * Behavior:
 * - If devSample is enabled (or DEV_SAMPLE_SERVICES is true):
 *   - 'service-men-brade' / 'men-brade' returns full Figma D1 details
 *   - 'service-tapper-fade' / 'tapper-fade' returns minimal service with NO add-ons or packages
 * - Otherwise (or for unknown IDs): returns null / isNotFound: true
 */
export function useServiceDetails(
  id?: string,
  options?: { devSample?: boolean }
): {
  service: ServiceDetails | null;
  isLoading: boolean;
  isNotFound: boolean;
} {
  const useDev = options?.devSample ?? DEV_SAMPLE_SERVICES;

  const result = useMemo(() => {
    if (!id) {
      return { service: null, isNotFound: true };
    }

    if (useDev) {
      // 1. Sample 1: "Men Brade" (Matches Figma Frame D1)
      if (id === 'service-men-brade' || id === 'men-brade') {
        const menBradeDetails: ServiceDetails = {
          id: 'service-men-brade',
          name: 'Men Brade',
          imageUri: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400',
          price: 14200,
          duration: '1hr',
          discount: null, // Note: D1 frame has no discount ribbon
          staff: [
            {
              id: 'staff-annabelle',
              name: 'Annabelle Gideon',
              role: 'Barber',
              yearsExperience: 5,
              avatarUri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
            },
            {
              id: 'staff-udoka',
              name: 'Udoka Oyemechi',
              role: 'Barber',
              yearsExperience: 5,
              avatarUri: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400',
            },
          ],
          addOns: [
            {
              id: 'addon-dry-wow',
              imageUri: 'https://images.unsplash.com/photo-1512690459411-b9245aed614b?w=400',
              name: 'Dry Wow Shampoo',
              description: 'After Shave treatment and hair refresh',
              price: 22700,
              priceRaw: '22700',
              duration: '24min',
            },
          ],
          packages: [
            {
              id: 'pkg-men-brade',
              images: [
                'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400',
                'https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?w=400',
                'https://images.unsplash.com/photo-1512290900672-1f416e910bd6?w=400',
              ],
              contents: 'Hair Washing\nConditioning & Wash\nManicure',
              price: 4500,
              priceRaw: '4500',
              duration: '1:30 hr',
            },
          ],
        };
        return { service: menBradeDetails, isNotFound: false };
      }

      // 2. Sample 2: "Tapper Fade" (Minimal service: no add-ons, no packages)
      if (id === 'service-tapper-fade' || id === 'tapper-fade') {
        const tapperFadeDetails: ServiceDetails = {
          id: 'service-tapper-fade',
          name: 'Tapper Fade',
          imageUri: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=400',
          price: 8500,
          duration: '45min',
          discount: null,
          staff: [
            {
              id: 'staff-annabelle',
              name: 'Annabelle Gideon',
              role: 'Barber',
              yearsExperience: 5,
              avatarUri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
            },
          ],
          addOns: [], // Empty add-ons to verify section is omitted
          packages: [], // Empty packages to verify section is omitted
        };
        return { service: tapperFadeDetails, isNotFound: false };
      }
    }

    // Default: Not found
    return { service: null, isNotFound: true };
  }, [id, useDev]);

  return {
    service: result.service,
    isLoading: false,
    isNotFound: result.isNotFound,
  };
}

export default useServiceDetails;
