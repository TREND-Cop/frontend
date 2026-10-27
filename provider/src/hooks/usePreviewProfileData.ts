import { useMemo } from 'react';
import {
  DEV_SAMPLE_PREVIEW,
  DEV_SAMPLE_SERVICES,
  DEV_SAMPLE_SALON_PHOTOS,
  DEV_OVERRIDE_PHOTO_COUNT,
} from '../constants/editProfile.config';

export interface PreviewCategory {
  id: string;
  name: string;
}

export interface PreviewService {
  id: string;
  name: string;
  price: number;
  imageUri: any;
  categoryId: string;
}

/**
 * 11 sample salon photos to simulate 3x2 grid and "6+" overlay (Figma V1-V4).
 */
export const SAMPLE_SALON_PHOTOS = [
  require('../../assets/images/portfolio/bisola_portfolio_1.png'),
  require('../../assets/images/portfolio/bisola_portfolio_2.png'),
  require('../../assets/images/portfolio/bisola_portfolio_3.png'),
  require('../../assets/images/portfolio/bisola_portfolio_4.png'),
  require('../../assets/images/portfolio/bisola_portfolio_5.png'),
  require('../../assets/images/portfolio/bisola_portfolio_6.png'),
  require('../../assets/images/portfolio/staff_portfolio_1.png'),
  require('../../assets/images/portfolio/staff_portfolio_2.png'),
  require('../../assets/images/portfolio/staff_portfolio_3.png'),
  require('../../assets/images/portfolio/staff_portfolio_4.png'),
  require('../../assets/images/portfolio/staff_portfolio_5.png'),
];

/**
 * Resolves the photo list for preview according to dev flags and overrides.
 */
export function getPreviewPhotos(uploadedPhotos?: (string | any)[] | null): any[] {
  if (DEV_OVERRIDE_PHOTO_COUNT !== null) {
    if (DEV_OVERRIDE_PHOTO_COUNT <= 0) return [];
    return SAMPLE_SALON_PHOTOS.slice(0, DEV_OVERRIDE_PHOTO_COUNT);
  }

  if (uploadedPhotos && uploadedPhotos.length > 0) {
    return uploadedPhotos;
  }

  if (DEV_SAMPLE_SALON_PHOTOS) {
    return SAMPLE_SALON_PHOTOS;
  }

  return [];
}

/**
 * Hook to retrieve verification status (TODO: Backend integration).
 * Default: unverified (false). With dev sample: verified (true).
 */
export function useBusinessStatus(): { isVerified: boolean } {
  const isVerified = DEV_SAMPLE_PREVIEW;
  return { isVerified };
}

/**
 * Hook to retrieve average business rating (TODO: Backend integration).
 * Default: null (hidden). With dev sample: 4.1.
 */
export function useBusinessRating(): { rating: number | null } {
  const rating = DEV_SAMPLE_PREVIEW ? 4.1 : null;
  return { rating };
}

/**
 * Hook to retrieve business distance from customer (TODO: Backend integration).
 * Default: null (hidden). With dev sample: "2.89km".
 */
export function useBusinessDistance(): { distance: string | null } {
  const distance = DEV_SAMPLE_PREVIEW ? '2.89km' : null;
  return { distance };
}

/**
 * Hook to retrieve preview service catalog (TODO: Backend integration).
 * Default: empty categories & services (shows "No services yet" block).
 * With DEV_SAMPLE_SERVICES: returns 4 categories ("Hair Cut", "Pedicure", "Manicure", "Facial")
 * and sample services including "Spiky" @ ₦13,750.00 matching Figma design.
 */
export function usePreviewServices(): {
  categories: PreviewCategory[];
  services: PreviewService[];
} {
  return useMemo(() => {
    if (!DEV_SAMPLE_SERVICES) {
      return { categories: [], services: [] };
    }

    const categories: PreviewCategory[] = [
      { id: 'haircut', name: 'Hair Cut' },
      { id: 'pedicure', name: 'Pedicure' },
      { id: 'manicure', name: 'Manicure' },
      { id: 'facial', name: 'Facial' },
    ];

    const services: PreviewService[] = [
      {
        id: 'spiky',
        name: 'Spiky',
        price: 13750,
        imageUri: require('../../assets/images/profile/men_braids.jpg'),
        categoryId: 'haircut',
      },
      {
        id: 'short-back-sides',
        name: 'Short Back And Sides',
        price: 27800,
        imageUri: require('../../assets/images/profile/men_braids.jpg'),
        categoryId: 'haircut',
      },
      {
        id: 'men-brade',
        name: 'Men Brade',
        price: 14200,
        imageUri: require('../../assets/images/profile/men_braids.jpg'),
        categoryId: 'haircut',
      },
      {
        id: 'deluxe-pedicure',
        name: 'Deluxe Pedicure',
        price: 18000,
        imageUri: require('../../assets/images/profile/dry_wow_pedicure.jpg'),
        categoryId: 'pedicure',
      },
      {
        id: 'classic-manicure',
        name: 'Classic Manicure',
        price: 12000,
        imageUri: require('../../assets/images/profile/dry_wow_pedicure.jpg'),
        categoryId: 'manicure',
      },
      {
        id: 'deep-cleansing-facial',
        name: 'Deep Cleansing Facial',
        price: 25000,
        imageUri: require('../../assets/images/profile/men_braids.jpg'),
        categoryId: 'facial',
      },
    ];

    return { categories, services };
  }, []);
}
