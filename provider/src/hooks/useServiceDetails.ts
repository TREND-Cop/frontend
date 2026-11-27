import { useState, useEffect, useMemo } from 'react';
import { DEV_SAMPLE_SERVICES, Service } from './useServices';
import { StaffMember } from './useStaff';
import { ServicePackageItem, AddOnItem } from '../context/ServiceDraftContext';
import { loadFromStorage, STORAGE_KEYS } from '../utils/providerStorage';

/**
 * ServiceDetails ViewModel
 * TODO (Backend): shape to confirm
 */
export interface ServiceDetails {
  id: string;
  name: string;
  imageUri: any;
  images?: any[];
  price: number;
  duration: string;
  discount?: number | null;
  staff: StaffMember[];
  addOns: AddOnItem[];
  packages: ServicePackageItem[];
}

const MEN_BRADE_IMG = require('../../assets/images/services/pop_men_haircut.png');
const TAPPER_FADE_IMG = require('../../assets/images/services/men_haircut.png');

/**
 * Hook to retrieve service details by ID.
 * Automatically checks in-memory / AsyncStorage persisted services first,
 * falling back to Figma design samples ('Men Brade' and 'Tapper Fade').
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
  const [persistedService, setPersistedService] = useState<ServiceDetails | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Synchronously compute dev sample if matching
  const sampleService = useMemo<ServiceDetails | null>(() => {
    if (!id || !useDev) return null;

    // 1. Sample 1: "Men Brade" (Matches Figma Frame D1)
    if (id === 'service-men-brade' || id === 'men-brade') {
      const menBradeDetails: ServiceDetails = {
        id: 'service-men-brade',
        name: 'Men Brade',
        imageUri: MEN_BRADE_IMG,
        images: [MEN_BRADE_IMG],
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
      return menBradeDetails;
    }

    // 2. Sample 2: "Tapper Fade" (Minimal service: no add-ons, no packages)
    if (id === 'service-tapper-fade' || id === 'tapper-fade') {
      const tapperFadeDetails: ServiceDetails = {
        id: 'service-tapper-fade',
        name: 'Tapper Fade',
        imageUri: TAPPER_FADE_IMG,
        images: [TAPPER_FADE_IMG],
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
        addOns: [],
        packages: [],
      };
      return tapperFadeDetails;
    }

    return null;
  }, [id, useDev]);

  // Load from local storage if id is not a sample
  useEffect(() => {
    let isMounted = true;
    if (!id) {
      setIsLoading(false);
      return;
    }

    if (sampleService) {
      setIsLoading(false);
      return;
    }

    loadFromStorage<Service[]>(STORAGE_KEYS.SERVICES_LIST, []).then((stored) => {
      if (!isMounted) return;
      const found = stored.find((s) => s.id === id);
      if (found) {
        setPersistedService({
          id: found.id,
          name: found.name,
          imageUri: found.imageUri || (found.images && found.images[0]) || null,
          images: found.images || (found.imageUri ? [found.imageUri] : []),
          price: found.price ?? 0,
          duration: found.duration || '1hr',
          discount: found.discount ?? null,
          staff: found.staff || [],
          addOns: found.addOns || [],
          packages: found.packages || [],
        });
      }
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [id, sampleService]);

  const activeService = sampleService || persistedService;

  return {
    service: activeService,
    isLoading: isLoading && !activeService,
    isNotFound: !isLoading && !activeService,
  };
}

export default useServiceDetails;
