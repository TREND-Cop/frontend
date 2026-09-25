export interface PackageItem {
  id: string;
  name: string;
  tag?: string;
  description?: string;
  price: number;
  category?: string;
  image?: any;
  images: any[];
  features: string[];
  moreServicesCount?: number;
}

export const PACKAGE_CATALOG: PackageItem[] = [
  // ── Nail / Manicure Packages ─────────────────────────────────────────
  {
    id: 'pkg_nails_deluxe',
    name: 'Deluxe Acrylic & Nail Art Package',
    category: 'nails',
    price: 14500,
    images: [
      require('../../assets/images/packages/men_manicure.png'),
      require('../../assets/images/profile/1007653036.jpg'),
      require('../../assets/images/profile/882a99380ae2d750b39f897365bd1d6083664a3b.jpg'),
      require('../../assets/images/packages/facial_sheet_mask.png'),
    ],
    features: [
      'Acrylic Full Set & Sculpting',
      'Cuticle Treatment & Hand Massage',
      'Custom Accent Nail Art',
      'High-Gloss UV Top Coat',
    ],
    moreServicesCount: 4,
  },
  {
    id: 'pkg_nails_spa',
    name: 'Royal Hand Spa & Manicure',
    category: 'nails',
    price: 22000,
    images: [
      require('../../assets/images/packages/men_manicure.png'),
      require('../../assets/images/profile/1007604716.jpg'),
      require('../../assets/images/packages/clay_scrub_facial.png'),
    ],
    features: [
      'Paraffin Wax Treatment',
      'Exfoliating Hand Scrub',
      'Deluxe Manicure & Pedicure',
      'Nail Strengthening Therapy',
    ],
    moreServicesCount: 5,
  },

  // ── Hair / Braids Packages ───────────────────────────────────────────
  {
    id: 'pkg_hair_executive',
    name: 'Executive Hair Care Package',
    category: 'hair',
    price: 18500,
    images: [
      require('../../assets/images/packages/shampoo_wash.png'),
      require('../../assets/images/profile/men_braids.jpg'),
      require('../../assets/images/packages/facial_sheet_mask.png'),
    ],
    features: [
      'Deep Conditioning Wash',
      'Scalp Steam & Detox',
      'Precision Edge Styling',
      'Hydrating Hair Mask',
    ],
    moreServicesCount: 6,
  },

  // ── Barber / Men Grooming Packages ───────────────────────────────────
  {
    id: 'pkg_barber_royal',
    name: "Gentlemen's Royal Grooming Package",
    category: 'barbing',
    price: 16000,
    images: [
      require('../../assets/images/custom/gallery_barber_haircut.png'),
      require('../../assets/images/custom/gallery_barber_trim.jpg'),
      require('../../assets/images/custom/gallery_barber_facial.jpg'),
    ],
    features: [
      'Signature Precision Cut',
      'Hot Towel Beard Treatment',
      'Exfoliating Facial Cleanser',
      'Aftershave Balm Massage',
    ],
    moreServicesCount: 4,
  },

  // ── Spa / Wellness Packages ──────────────────────────────────────────
  {
    id: 'pkg_spa_wellness',
    name: 'Full Wellness & Body Spa Package',
    category: 'spa',
    price: 25000,
    images: [
      require('../../assets/images/packages/stone_massage.png'),
      require('../../assets/images/packages/back_massage.png'),
      require('../../assets/images/packages/facial_sheet_mask.png'),
    ],
    features: [
      'Hot Stone Therapy',
      'Full Back Massage',
      'Hydrating Facial Sheet Mask',
      'Aromatherapy Relaxation',
    ],
    moreServicesCount: 6,
  },

  // ── Legacy IDs for Backward Compatibility ────────────────────────────
  {
    id: 'pkg_12500_1',
    name: 'Executive Treatment Package',
    category: 'hair',
    price: 4500,
    images: [
      require('../../assets/images/packages/shampoo_wash.png'),
      require('../../assets/images/packages/men_manicure.png'),
      require('../../assets/images/packages/facial_sheet_mask.png'),
    ],
    features: [
      'Hair Washing',
      'Conditioning & Wash',
      'Manicure',
    ],
    moreServicesCount: 6,
  },
  {
    id: 'pkg_12500_2',
    name: 'Full Wellness Package',
    category: 'spa',
    price: 25000,
    images: [
      require('../../assets/images/packages/shampoo_wash.png'),
      require('../../assets/images/packages/stone_massage.png'),
      require('../../assets/images/packages/facial_sheet_mask.png'),
    ],
    features: [
      'Hair Washing',
      'Conditioning & Wash',
      'Manicure',
    ],
    moreServicesCount: 6,
  },
];

/**
 * Dynamically resolves the package catalog relevant to a specific service or category.
 * If serviceName is 'Acrylic nails' or related to nails, returns nail packages.
 * If serviceName is related to hair or braids, returns hair packages.
 * If serviceName is related to barber/haircut, returns barber packages.
 * Otherwise returns the full package catalog.
 */
export function getPackagesForService(serviceName?: string, category?: string): PackageItem[] {
  const query = `${serviceName || ''} ${category || ''}`.toLowerCase();

  if (query.includes('nail') || query.includes('acrylic') || query.includes('manicure') || query.includes('pedicure')) {
    return PACKAGE_CATALOG.filter((p) => p.category === 'nails' || p.id === 'pkg_12500_1');
  }
  if (query.includes('hair') || query.includes('braid') || query.includes('cornrow') || query.includes('wash')) {
    return PACKAGE_CATALOG.filter((p) => p.category === 'hair');
  }
  if (query.includes('barb') || query.includes('fade') || query.includes('beard') || query.includes('shave')) {
    return PACKAGE_CATALOG.filter((p) => p.category === 'barbing');
  }
  if (query.includes('spa') || query.includes('massage') || query.includes('wellness') || query.includes('facial')) {
    return PACKAGE_CATALOG.filter((p) => p.category === 'spa');
  }

  return PACKAGE_CATALOG;
}

/**
 * Finds a package by ID across the catalog.
 */
export function getPackageById(id?: string | null): PackageItem | undefined {
  if (!id) return undefined;
  return PACKAGE_CATALOG.find((p) => p.id === id);
}
