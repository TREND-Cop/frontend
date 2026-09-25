export interface AddOnProductItem {
  id: string;
  name: string;
  category: string;
  price: number;
  rating: number;
  image: any;
  brand?: string;
  description?: string;
}

export interface AddOnSpecialistItem {
  id: string;
  name: string;
  role: string;
  rating: string;
  reviews: number;
  image: string;
}

export interface AddOnCatalogItem {
  id: string;
  name: string;
  category?: string;
  price: number;
  originalPrice: number;
  duration: string;
  rating: number;
  reviewsCount: string;
  discountBadge?: string;
  image: any;
  hasSubCategory?: boolean;
  subCategoryRoute?: string;
  products?: AddOnProductItem[];
  salonId?: string;
  serviceIds?: string[];
  specialist?: AddOnSpecialistItem;
}

export const ADD_ON_CATALOG: Record<string, AddOnCatalogItem> = {
  ao_feet: {
    id: 'ao_feet',
    name: 'Feet scrub',
    category: 'Foot Care',
    price: 8500,
    originalPrice: 41000,
    duration: '24min',
    rating: 5.1,
    reviewsCount: '320',
    image: require('../../assets/images/profile/cont1.jpg'),
    salonId: 'salon2',
    serviceIds: ['na5', 'na1', 'na2', 'na3', 'na4', 'na6'],
    specialist: {
      id: 's_addon_bisola_a',
      name: 'Bisola Andrew',
      role: 'Nail & Pedicure Expert',
      rating: '5.1',
      reviews: 32,
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80',
    },
  },
  ao_manicure: {
    id: 'ao_manicure',
    name: 'Manicure',
    category: 'Nail Care',
    price: 8500,
    originalPrice: 41000,
    duration: '24min',
    rating: 5.1,
    reviewsCount: '280',
    discountBadge: '10% OFF',
    image: require('../../assets/images/profile/14dcc3440340f9f140251ac160473457c89b198c.jpg'),
    salonId: 'salon2',
    serviceIds: ['na5', 'na1', 'na2', 'na3', 'na4'],
    specialist: {
      id: 's_addon_amaka',
      name: 'Amaka Eze',
      role: 'Nail Art Specialist',
      rating: '4.9',
      reviews: 28,
      image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&q=80',
    },
  },
  ao_quiff1: {
    id: 'ao_quiff1',
    name: 'Quiff',
    category: 'Haircut',
    price: 8500,
    originalPrice: 41000,
    duration: '24min',
    rating: 5.1,
    reviewsCount: '410',
    discountBadge: '10% OFF',
    image: require('../../assets/images/profile/cont2.jpg'),
    salonId: 'salon2',
    serviceIds: ['h1', 'h2', 'h3'],
    specialist: {
      id: 's_addon_micheal',
      name: 'Micheal Ureal',
      role: 'Senior Barber',
      rating: '5.0',
      reviews: 42,
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
    },
  },
  ao_quiff2: {
    id: 'ao_quiff2',
    name: 'Quiff',
    category: 'Haircut',
    price: 8500,
    originalPrice: 41000,
    duration: '24min',
    rating: 5.1,
    reviewsCount: '350',
    discountBadge: '10% OFF',
    image: require('../../assets/images/profile/cont3.jpg'),
    salonId: 'salon2',
    serviceIds: ['h1', 'h2', 'h3'],
    specialist: {
      id: 's_addon_micheal',
      name: 'Micheal Ureal',
      role: 'Senior Barber',
      rating: '5.0',
      reviews: 42,
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
    },
  },
  p1: {
    id: 'p1',
    name: 'Dry Wow Shampoo & Wash',
    category: 'Hair Wash',
    price: 8500,
    originalPrice: 12000,
    duration: '25min',
    rating: 4.8,
    reviewsCount: '321',
    discountBadge: '29% OFF',
    image: require('../../assets/images/profile/cont1.jpg'),
    hasSubCategory: true,
    subCategoryRoute: '/add-one-product',
    salonId: 'salon2',
    serviceIds: ['na5', 'h1', 'h2', 'h3'],
    specialist: {
      id: 's_addon_bisola',
      name: 'Bisola Olarewoju',
      role: 'Hair Wash & Scalp Specialist',
      rating: '5.1',
      reviews: 24,
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80',
    },
    products: [
      {
        id: 'prod_dry_wow_classic',
        name: 'Dry Wow Classic Shampoo',
        category: 'Dry shampoo',
        price: 6500,
        rating: 4.8,
        image: require('../../assets/images/profile/cont1.jpg'),
        brand: 'Dry Wow',
        description: 'Instant volume and oil absorption with refreshing botanical aroma.',
      },
      {
        id: 'prod_tea_tree_wash',
        name: 'Organic Tea Tree & Mint Wash',
        category: 'Clarifying wash',
        price: 8500,
        rating: 4.9,
        image: require('../../assets/images/profile/cont2.jpg'),
        brand: 'EcoPure Herbal',
        description: 'Deep cleansing cooling menthol formula for scalp stimulation.',
      },
      {
        id: 'prod_keratin_moisture',
        name: 'Keratin Moisture Shield Soap',
        category: 'Moisturizing care',
        price: 11500,
        rating: 5.0,
        image: require('../../assets/images/profile/cont3.jpg'),
        brand: 'Luxe Salon Elite',
        description: 'Advanced keratin-infused formula to repair dry ends and lock in moisture.',
      },
    ],
  },
  p2: {
    id: 'p2',
    name: 'Hydrating Hair Conditioner',
    category: 'Hair Care',
    price: 6200,
    originalPrice: 9000,
    duration: '15min',
    rating: 4.3,
    reviewsCount: '185',
    discountBadge: '31% OFF',
    image: require('../../assets/images/profile/cont2.jpg'),
    salonId: 'salon2',
    serviceIds: ['h1', 'h2', 'h3'],
    specialist: {
      id: 's_addon_bisola',
      name: 'Bisola Olarewoju',
      role: 'Hair Care Specialist',
      rating: '5.1',
      reviews: 24,
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80',
    },
  },
  p3: {
    id: 'p3',
    name: 'Beard Trim & Shape',
    category: 'Scalp Care',
    price: 8500,
    originalPrice: 41000,
    duration: '24min',
    rating: 5.1,
    reviewsCount: '412',
    discountBadge: '10% OFF',
    image: require('../../assets/images/profile/30b9a5ab22324bd8357f666111d5584ad2e3c83e.jpg'),
    salonId: 'salon2',
    serviceIds: ['na5', 'h1', 'h2', 'h3'],
    specialist: {
      id: 's_addon_samson',
      name: 'Samson Nnkanu',
      role: 'Master Barber',
      rating: '5.0',
      reviews: 35,
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80',
    },
  },
  p4: {
    id: 'p4',
    name: 'Facial Clay Scrub',
    category: 'Facial Care',
    price: 8500,
    originalPrice: 41000,
    duration: '24min',
    rating: 5.1,
    reviewsCount: '230',
    discountBadge: '10% OFF',
    image: require('../../assets/images/profile/eb3281d09659fdef5e45647cf5529f61e83190f1.jpg'),
    salonId: 'salon2',
    serviceIds: ['na5', 'h1', 'h3'],
    specialist: {
      id: 's_addon_omotola',
      name: 'Omotola David',
      role: 'Facial & Skin Specialist',
      rating: '5.0',
      reviews: 29,
      image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&q=80',
    },
  },
  ao1: {
    id: 'ao1',
    name: 'Quiff Haircut & Styling',
    category: 'Haircut & Styling',
    price: 12000,
    originalPrice: 15000,
    duration: '45min',
    rating: 4.7,
    reviewsCount: '290',
    discountBadge: '20% OFF',
    image: require('../../assets/images/profile/cont1.jpg'),
    salonId: 'salon2',
    serviceIds: ['h1', 'h2'],
    specialist: {
      id: 's_addon_micheal',
      name: 'Micheal Ureal',
      role: 'Senior Barber',
      rating: '5.0',
      reviews: 42,
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
    },
  },
  ao2: {
    id: 'ao2',
    name: 'Men Cornrow Braids',
    category: 'Hair Braid',
    price: 18500,
    originalPrice: 24000,
    duration: '75min',
    rating: 4.6,
    reviewsCount: '175',
    discountBadge: '23% OFF',
    image: require('../../assets/images/profile/cont2.jpg'),
    salonId: 'salon2',
    serviceIds: ['h1', 'h2'],
    specialist: {
      id: 's_addon_bisola_a',
      name: 'Bisola Andrew',
      role: 'Hair Braid Specialist',
      rating: '4.8',
      reviews: 51,
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80',
    },
  },
  ao3: {
    id: 'ao3',
    name: 'Beard Trim & Hot Towel',
    category: 'Beard Care',
    price: 5000,
    originalPrice: 7500,
    duration: '20min',
    rating: 4.4,
    reviewsCount: '210',
    discountBadge: '33% OFF',
    image: require('../../assets/images/profile/cont3.jpg'),
    salonId: 'salon2',
    serviceIds: ['h1', 'h2', 'h3'],
    specialist: {
      id: 's_addon_samson',
      name: 'Samson Nnkanu',
      role: 'Master Barber',
      rating: '5.0',
      reviews: 35,
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80',
    },
  },
};

/**
 * Returns add-ons specifically uploaded by the service provider for a given service.
 * If the service has no add-ons uploaded by the provider, returns an empty array [].
 */
export function getAddOnsForService(serviceId?: string, salonId?: string): AddOnCatalogItem[] {
  const all = Object.values(ADD_ON_CATALOG);
  if (!serviceId && !salonId) return all;

  return all.filter((item) => {
    if (salonId && item.salonId && item.salonId !== salonId) {
      return false;
    }
    if (serviceId) {
      if (item.serviceIds && item.serviceIds.length > 0) {
        return item.serviceIds.includes(serviceId);
      }
      return false;
    }
    return true;
  });
}

