export interface ServiceCatalogItem {
  id: string;
  name: string;
  category: string;
  price: string;
  numericPrice: number;
  originalPrice?: string;
  duration: string;
  rating: string;
  discountBadge?: string;
  discountTimer?: string;
  image?: any;
}

export const ALL_SERVICES: ServiceCatalogItem[] = [
  // ── Men Braids ─────────────────────────────────────────────────────────────
  {
    id: 'mb1',
    name: 'Straight-Back Cornrows',
    category: 'Men Braids',
    price: '₦14,200',
    numericPrice: 14200,
    originalPrice: '₦18,000',
    duration: '1hr 30min',
    rating: '4.8',
    discountBadge: '10% OFF',
    image: require('../../assets/images/profile/men_braids.jpg'),
  },
  {
    id: 'mb2',
    name: 'Box Braids & Fade',
    category: 'Men Braids',
    price: '₦16,500',
    numericPrice: 16500,
    originalPrice: '₦20,000',
    duration: '2hr',
    rating: '4.9',
    image: require('../../assets/images/profile/men_braids.jpg'),
  },
  {
    id: 'mb3',
    name: 'Zig-Zag Stitch Braids',
    category: 'Men Braids',
    price: '₦15,000',
    numericPrice: 15000,
    originalPrice: '₦19,000',
    duration: '1hr 45min',
    rating: '4.7',
    image: require('../../assets/images/profile/men_braids.jpg'),
  },
  {
    id: 'mb4',
    name: 'Two-Strand Twist Braids',
    category: 'Men Braids',
    price: '₦13,800',
    numericPrice: 13800,
    originalPrice: '₦16,500',
    duration: '1hr 15min',
    rating: '4.6',
    image: require('../../assets/images/profile/men_braids.jpg'),
  },
  {
    id: 'mb5',
    name: 'Triangle Parting Braids',
    category: 'Men Braids',
    price: '₦17,200',
    numericPrice: 17200,
    originalPrice: '₦22,000',
    duration: '2hr 15min',
    rating: '5.0',
    discountBadge: '15% OFF',
    image: require('../../assets/images/profile/men_braids.jpg'),
  },
  {
    id: 'mb6',
    name: 'Men Freestyle Braid Art',
    category: 'Men Braids',
    price: '₦18,500',
    numericPrice: 18500,
    originalPrice: '₦24,000',
    duration: '2hr 30min',
    rating: '4.9',
    discountBadge: '10% OFF',
    image: require('../../assets/images/profile/men_braids.jpg'),
  },

  // ── Nail Art ───────────────────────────────────────────────────────────────
  {
    id: 'na1',
    name: 'French Glam Gel Art',
    category: 'Nail Art',
    price: '₦12,500',
    numericPrice: 12500,
    originalPrice: '₦15,000',
    duration: '45min',
    rating: '4.9',
    discountBadge: '10% OFF',
    image: require('../../assets/images/profile/14dcc3440340f9f140251ac160473457c89b198c.jpg'),
  },
  {
    id: 'na2',
    name: 'Abstract Marble Nails',
    category: 'Nail Art',
    price: '₦14,200',
    numericPrice: 14200,
    originalPrice: '₦18,000',
    duration: '1hr',
    rating: '4.8',
    image: require('../../assets/images/profile/30b9a5ab22324bd8357f666111d5584ad2e3c83e.jpg'),
  },
  {
    id: 'na3',
    name: 'Chrome Finish Acrylics',
    category: 'Nail Art',
    price: '₦16,000',
    numericPrice: 16000,
    originalPrice: '₦20,000',
    duration: '1hr 15min',
    rating: '5.0',
    image: require('../../assets/images/profile/eb3281d09659fdef5e45647cf5529f61e83190f1.jpg'),
  },
  {
    id: 'na4',
    name: 'Ombre Nails & Crystals',
    category: 'Nail Art',
    price: '₦15,500',
    numericPrice: 15500,
    originalPrice: '₦19,500',
    duration: '1hr',
    rating: '4.7',
    image: require('../../assets/images/profile/b4bdda58fe4760cb04cb35cca583a63e04b99e77.jpg'),
  },
  {
    id: 'na5',
    name: 'Long Stiletto Extensions',
    category: 'Nail Art',
    price: '₦18,000',
    numericPrice: 18000,
    originalPrice: '₦23,000',
    duration: '1hr 30min',
    rating: '4.9',
    discountBadge: '15% OFF',
    image: require('../../assets/images/profile/882a99380ae2d750b39f897365bd1d6083664a3b.jpg'),
  },
  {
    id: 'na6',
    name: 'Feet & Fingers Combo Art',
    category: 'Nail Art',
    price: '₦22,000',
    numericPrice: 22000,
    originalPrice: '₦28,000',
    duration: '2hr',
    rating: '5.0',
    discountBadge: '10% OFF',
    image: require('../../assets/images/profile/ee549b1ea85771de4cd8695943af94f474fedf19.jpg'),
  },

  // ── Hair Cut ───────────────────────────────────────────────────────────────
  {
    id: 'hc1',
    name: 'Low Skin Fade & Lineup',
    category: 'Hair Cut',
    price: '₦8,500',
    numericPrice: 8500,
    originalPrice: '₦11,000',
    duration: '35min',
    rating: '4.9',
    discountBadge: '10% OFF',
    image: require('../../assets/images/services/men_haircut.png'),
  },
  {
    id: 'hc2',
    name: 'Taper Fade & Beard Sculpt',
    category: 'Hair Cut',
    price: '₦11,000',
    numericPrice: 11000,
    originalPrice: '₦14,000',
    duration: '45min',
    rating: '5.0',
    image: require('../../assets/images/services/men_haircut.png'),
  },
  {
    id: 'hc3',
    name: 'Burst Fade Mohawk',
    category: 'Hair Cut',
    price: '₦9,500',
    numericPrice: 9500,
    originalPrice: '₦12,500',
    duration: '40min',
    rating: '4.8',
    image: require('../../assets/images/services/men_haircut.png'),
  },
  {
    id: 'hc4',
    name: 'Buzz Cut & Sharp Razor',
    category: 'Hair Cut',
    price: '₦7,000',
    numericPrice: 7000,
    originalPrice: '₦9,000',
    duration: '25min',
    rating: '4.7',
    image: require('../../assets/images/services/men_haircut.png'),
  },
  {
    id: 'hc5',
    name: 'Executive Cut & Hot Towel',
    category: 'Hair Cut',
    price: '₦13,500',
    numericPrice: 13500,
    originalPrice: '₦17,000',
    duration: '50min',
    rating: '5.0',
    discountBadge: '15% OFF',
    image: require('../../assets/images/services/men_haircut.png'),
  },

  // ── Pedicure ───────────────────────────────────────────────────────────────
  {
    id: 'pd1',
    name: 'Dry Wow Pedicure',
    category: 'Pedicure',
    price: '₦8,500',
    numericPrice: 8500,
    originalPrice: '₦11,000',
    duration: '40min',
    rating: '4.8',
    discountBadge: '10% OFF',
    image: require('../../assets/images/profile/dry_wow_pedicure.jpg'),
  },
  {
    id: 'pd2',
    name: 'Paraffin Wax Pedicure',
    category: 'Pedicure',
    price: '₦12,000',
    numericPrice: 12000,
    originalPrice: '₦15,000',
    duration: '50min',
    rating: '4.9',
    image: require('../../assets/images/profile/dry_wow_pedicure.jpg'),
  },
  {
    id: 'pd3',
    name: 'Gel Polish Pedicure',
    category: 'Pedicure',
    price: '₦10,500',
    numericPrice: 10500,
    originalPrice: '₦13,000',
    duration: '45min',
    rating: '4.7',
    image: require('../../assets/images/profile/dry_wow_pedicure.jpg'),
  },
  {
    id: 'pd4',
    name: 'Callus Removal & Scrub',
    category: 'Pedicure',
    price: '₦9,000',
    numericPrice: 9000,
    originalPrice: '₦11,500',
    duration: '35min',
    rating: '4.6',
    image: require('../../assets/images/profile/dry_wow_pedicure.jpg'),
  },
  {
    id: 'pd5',
    name: 'Deluxe Spa Pedicure & Massage',
    category: 'Pedicure',
    price: '₦16,000',
    numericPrice: 16000,
    originalPrice: '₦20,000',
    duration: '1hr 15min',
    rating: '5.0',
    discountBadge: '15% OFF',
    image: require('../../assets/images/profile/dry_wow_pedicure.jpg'),
  },

  // ── Facial ─────────────────────────────────────────────────────────────────
  {
    id: 'fc1',
    name: 'Deep Pore Cleansing Facial',
    category: 'Facial',
    price: '₦15,000',
    numericPrice: 15000,
    originalPrice: '₦18,000',
    duration: '50min',
    rating: '4.9',
    discountBadge: '10% OFF',
    image: require('../../assets/images/services/men_facials.png'),
  },
  {
    id: 'fc2',
    name: 'Hydrating Sheet Mask Facial',
    category: 'Facial',
    price: '₦12,500',
    numericPrice: 12500,
    originalPrice: '₦15,500',
    duration: '40min',
    rating: '4.8',
    image: require('../../assets/images/services/men_facials.png'),
  },
  {
    id: 'fc3',
    name: 'Anti-Aging Gold Facial',
    category: 'Facial',
    price: '₦22,000',
    numericPrice: 22000,
    originalPrice: '₦28,000',
    duration: '1hr 15min',
    rating: '5.0',
    discountBadge: '15% OFF',
    image: require('../../assets/images/services/men_facials.png'),
  },
  {
    id: 'fc4',
    name: 'Charcoal Detox & Scrub',
    category: 'Facial',
    price: '₦14,000',
    numericPrice: 14000,
    originalPrice: '₦17,000',
    duration: '45min',
    rating: '4.7',
    image: require('../../assets/images/services/men_facials.png'),
  },
  {
    id: 'fc5',
    name: 'Brightening Vitamin C Glow',
    category: 'Facial',
    price: '₦18,500',
    numericPrice: 18500,
    originalPrice: '₦23,000',
    duration: '1hr',
    rating: '4.9',
    discountBadge: '10% OFF',
    image: require('../../assets/images/services/men_facials.png'),
  },

  // ── Salon Detail Screen Services ──────────────────────────────────────────
  {
    id: 'h1',
    name: 'Spiky',
    category: 'Hair Cut',
    price: '₦13,750.00',
    numericPrice: 13750,
    originalPrice: '₦41,00',
    duration: '10 min',
    rating: '2.3',
    discountBadge: '10% OFF',
    discountTimer: '12:39:01',
    image: require('../../assets/images/profile/men_braids.jpg'),
  },
  {
    id: 'h2',
    name: 'Short Back And Sides',
    category: 'Hair Cut',
    price: '₦27,800.00',
    numericPrice: 27800,
    originalPrice: '₦41,00',
    duration: '1hr min',
    rating: '1.5',
    discountBadge: '10% OFF',
    discountTimer: '12:39:01',
    image: require('../../assets/images/profile/men_braids.jpg'),
  },
  {
    id: 'h3',
    name: 'Military Haircut',
    category: 'Hair Cut',
    price: '₦33,900.00',
    numericPrice: 33900,
    originalPrice: '₦41,00',
    duration: '34 min',
    rating: '4.5',
    discountBadge: '10% OFF',
    discountTimer: '12:39:01',
    image: require('../../assets/images/profile/men_braids.jpg'),
  },
  {
    id: 'h4',
    name: 'Crew Cut',
    category: 'Hair Cut',
    price: '₦4,200.00',
    numericPrice: 4200,
    originalPrice: '₦41,00',
    duration: '40 min',
    rating: '5.0',
    discountBadge: '10% OFF',
    discountTimer: '12:39:01',
    image: require('../../assets/images/profile/men_braids.jpg'),
  },
  {
    id: 'h5',
    name: 'Side Part',
    category: 'Hair Cut',
    price: '₦76,700.00',
    numericPrice: 76700,
    originalPrice: '₦41,00',
    duration: '45 min',
    rating: '3.2',
    discountBadge: '10% OFF',
    discountTimer: '12:39:01',
    image: require('../../assets/images/profile/men_braids.jpg'),
  },
  {
    id: 'h6',
    name: 'Man Braid',
    category: 'Hair Cut',
    price: '₦81,700.00',
    numericPrice: 81700,
    originalPrice: '₦41,00',
    duration: '1hr',
    rating: '3.9',
    discountBadge: '10% OFF',
    discountTimer: '12:39:01',
    image: require('../../assets/images/profile/men_braids.jpg'),
  },
  {
    id: 'p2',
    name: 'Nail Trimming & Shaping',
    category: 'Pedicure',
    price: '₦27,800.00',
    numericPrice: 27800,
    originalPrice: '₦41,00',
    duration: '1hr min',
    rating: '1.5',
    discountBadge: '10% OFF',
    discountTimer: '12:39:01',
    image: require('../../assets/images/profile/dry_wow_pedicure.jpg'),
  },
  {
    id: 'p3',
    name: 'Callus Remover',
    category: 'Pedicure',
    price: '₦33,900.00',
    numericPrice: 33900,
    originalPrice: '₦41,00',
    duration: '34 min',
    rating: '4.5',
    discountBadge: '10% OFF',
    discountTimer: '12:39:01',
    image: require('../../assets/images/profile/dry_wow_pedicure.jpg'),
  },
];

export const SERVICE_BY_ID: Record<string, ServiceCatalogItem> = ALL_SERVICES.reduce(
  (acc, s) => {
    acc[s.id] = s;
    return acc;
  },
  {} as Record<string, ServiceCatalogItem>
);

export const getServiceByIdOrName = (
  id?: string,
  name?: string
): ServiceCatalogItem | undefined => {
  if (id && SERVICE_BY_ID[id]) return SERVICE_BY_ID[id];
  if (name) {
    const cleanName = name.trim().toLowerCase();
    const exact = ALL_SERVICES.find((s) => s.name.toLowerCase() === cleanName);
    if (exact) return exact;

    const contains = ALL_SERVICES.find(
      (s) => s.name.toLowerCase().includes(cleanName) || cleanName.includes(s.name.toLowerCase())
    );
    if (contains) return contains;

    // Semantic category fallbacks
    if (cleanName.includes('nail') || cleanName.includes('acrylic') || cleanName.includes('manicure')) {
      return ALL_SERVICES.find((s) => s.category === 'Nail Art') || ALL_SERVICES[6];
    }
    if (cleanName.includes('pedicure')) {
      return ALL_SERVICES.find((s) => s.name.toLowerCase().includes('pedicure')) || ALL_SERVICES[12];
    }
    if (cleanName.includes('braid') || cleanName.includes('loc') || cleanName.includes('cornrow')) {
      return ALL_SERVICES.find((s) => s.category === 'Braids / Locs') || ALL_SERVICES[0];
    }
    if (cleanName.includes('cut') || cleanName.includes('hair') || cleanName.includes('barb') || cleanName.includes('fade')) {
      return ALL_SERVICES.find((s) => s.category === 'Hair Cut') || ALL_SERVICES[10];
    }
    if (cleanName.includes('facial') || cleanName.includes('skin') || cleanName.includes('glow')) {
      return ALL_SERVICES.find((s) => s.category === 'Facials') || ALL_SERVICES[15];
    }
    if (cleanName.includes('massage') || cleanName.includes('spa') || cleanName.includes('body')) {
      return ALL_SERVICES.find((s) => s.name.toLowerCase().includes('massage')) || ALL_SERVICES[15];
    }
  }
  return undefined;
};
