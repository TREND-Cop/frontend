export type Category = 'men' | 'women';

export interface ServiceCategory {
  id: string;
  name: string;
  icon: any; // URL string or require() number
  isMore?: boolean;
}

export const MEN_SERVICES: ServiceCategory[] = [
  { id: 'm1', name: 'Hair Cut', icon: require('../../../assets/images/services/men_haircut.png') },
  { id: 'm2', name: 'Waxing', icon: require('../../../assets/images/services/men_waxing.png') },
  { id: 'm3', name: 'Pedicure', icon: require('../../../assets/images/services/men_pedicure.png') },
  { id: 'm4', name: 'Manicure', icon: require('../../../assets/images/services/men_manicure.png') },
  { id: 'm5', name: 'Massage', icon: require('../../../assets/images/services/men_massage.png') },
  { id: 'm6', name: 'Facials', icon: require('../../../assets/images/services/men_facials.png') },
  { id: 'm7', name: 'Hair Colour', icon: require('../../../assets/images/services/men_hair_colour.png') },
  { id: 'm8', name: 'More', icon: '', isMore: true },
];

export const WOMEN_SERVICES: ServiceCategory[] = [
  { id: 'w1', name: 'Hair Dresser', icon: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=200&h=200&fit=crop' },
  { id: 'w2', name: 'Nail Art', icon: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=200&h=200&fit=crop' },
  { id: 'w3', name: 'Pedicure', icon: 'https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?w=200&h=200&fit=crop' },
  { id: 'w4', name: 'Spas', icon: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=200&h=200&fit=crop' },
  { id: 'w5', name: 'Massage', icon: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=200&h=200&fit=crop' },
  { id: 'w6', name: 'Facials', icon: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=200&h=200&fit=crop' },
  { id: 'w7', name: 'Piercing', icon: 'https://images.unsplash.com/photo-1535295972055-1c762f4483e5?w=200&h=200&fit=crop' },
  { id: 'w8', name: 'More', icon: '', isMore: true },
];

export const WEEKEND_DEAL = {
  label: 'Weekend Deal',
  discountText: '30% OFF',
  image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&q=80',
};

export const TRENDING_DATA = [
  { id: 't1', image: require('../../../assets/images/trending/trend_1.png'), title: 'Pedicure', price: 35000, rating: 4.2, audience: 'Male & Female', onPress: () => {} },
  { id: 't2', image: require('../../../assets/images/trending/trend_2.png'), title: 'Deep Hair Washing', price: 3000, audience: 'Male & Female', onPress: () => {} },
  { id: 't3', image: require('../../../assets/images/trending/trend_3.png'), title: 'Couples Spa Day', price: 85000, rating: 4.9, audience: 'Male & Female', onPress: () => {} },
  { id: 't4', image: require('../../../assets/images/custom/media__1784573549572.jpg'), title: 'Creative Haircuts', price: 15000, rating: 4.7, audience: 'Female', onPress: () => {} },
  { id: 't5', image: require('../../../assets/images/trending/trend_5.png'), title: 'Luxury Manicure', price: 12000, rating: 4.5, audience: 'Male & Female', onPress: () => {} },
];

export const POPULAR_DATA = [
  { id: 'p1', image: require('../../../assets/images/popular/pop_men_grooming.png'), title: 'Full Men Grooming', price: 10000, rating: 4.1, providerLocation: 'Jabi, Abuja', badge: 'popular' as const, onPress: () => {} },
  { id: 'p2', image: require('../../../assets/images/popular/pop_men_facial.png'), title: "Men's Facial", price: 33800, rating: 4.8, providerLocation: 'Kado, Abuja', badge: 'popular' as const, onPress: () => {} },
  { id: 'p3', image: require('../../../assets/images/popular/pop_men_shave.png'), title: 'Hot Towel Shave', price: 15000, rating: 4.9, providerLocation: 'Wuse, Abuja', badge: 'popular' as const, onPress: () => {} },
  { id: 'p4', image: require('../../../assets/images/popular/pop_men_haircut.png'), title: 'Premium Haircut', price: 12000, rating: 4.7, providerLocation: 'Maitama, Abuja', badge: 'popular' as const, onPress: () => {} },
  { id: 'p5', image: require('../../../assets/images/popular/pop_men_massage.png'), title: 'Back Massage', price: 45000, rating: 5.0, providerLocation: 'Gwarinpa, Abuja', badge: 'popular' as const, onPress: () => {} },
];

export const MORE_TO_SEE_DATA = [
  { id: 'ms1', image: require('../../../assets/images/more/more_food.png'), title: 'Gourmet Catering', price: '₦25,000', audience: 'Male & Female', onPress: () => {} },
  { id: 'ms2', image: require('../../../assets/images/more/more_fashion.png'), title: 'Personal Styling', price: '₦10,000', audience: 'Male & Female', onPress: () => {} },
  { id: 'ms3', image: require('../../../assets/images/more/more_photo.png'), title: 'Event Photography', price: '₦45,000', audience: 'Male & Female', onPress: () => {} },
  { id: 'ms4', image: require('../../../assets/images/more/more_makeup.png'), title: 'Bridal & Studio Makeup', price: '₦35,000', audience: 'Female', onPress: () => {} },
  { id: 'ms5', image: require('../../../assets/images/more/more_cleaning.png'), title: 'Home Organizing', price: '₦15,000', audience: 'Male & Female', onPress: () => {} },
  { id: 'ms6', image: require('../../../assets/images/more/more_dj.png'), title: 'Event DJ & Sound', price: '₦50,000', audience: 'Male & Female', onPress: () => {} },
];

export const BODY_WORK_DATA = [
  { id: 'bw1', image: require('../../../assets/images/custom/media__1784573525879.jpg'), title: 'Body Art & Tattoos', price: 45000, rating: 4.9, providerLocation: 'Wuse 2, Abuja', location: 'Wuse 2, Abuja', onPress: () => {} },
  { id: 'bw2', image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400&q=80', title: 'Full Body Scrub', price: 30000, rating: 4.7, providerLocation: 'Maitama, Abuja', location: 'Maitama, Abuja', onPress: () => {} },
  { id: 'bw3', image: 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=400&q=80', title: 'Cupping Therapy', price: 25000, rating: 4.6, providerLocation: 'Jabi, Abuja', location: 'Jabi, Abuja', onPress: () => {} },
  { id: 'bw4', image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400&q=80', title: 'Aromatherapy', price: 35000, rating: 4.8, providerLocation: 'Gwarinpa, Abuja', location: 'Gwarinpa, Abuja', onPress: () => {} },
  { id: 'bw5', image: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=400&q=80', title: 'Mud Bath', price: 50000, rating: 5.0, providerLocation: 'Asokoro, Abuja', location: 'Asokoro, Abuja', onPress: () => {} },
];

export const WEEKEND_SPECIALS_DATA = [
  { id: 'ws1', image: 'https://images.unsplash.com/photo-1618318854041-3d9646b1eb96?w=400&q=80', title: 'Sauna', price: 11000, originalPrice: 35000, rating: 4.1, providerLocation: 'Maitama, Abuja', location: 'Maitama, Abuja' },
  { id: 'ws2', image: 'https://images.unsplash.com/photo-1552693673-1bf958298935?w=400&q=80', title: 'Wellness Spa', price: 10000, originalPrice: 32000, rating: 4.8, providerLocation: 'Jabi, Abuja', location: 'Jabi, Abuja' },
  { id: 'ws3', image: 'https://images.unsplash.com/photo-1583248352195-d3a8e766edf2?w=400&q=80', title: 'Spa Bath', price: 15000, originalPrice: 40000, rating: 4.5, providerLocation: 'Wuse 2, Abuja', location: 'Wuse 2, Abuja' },
  { id: 'ws4', image: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=400&q=80', title: 'Full Scrub', price: 9000, originalPrice: 28000, rating: 4.3, providerLocation: 'Garki, Abuja', location: 'Garki, Abuja' },
  { id: 'ws5', image: 'https://images.unsplash.com/photo-1527718641238-d621b1990c0b?w=400&q=80', title: 'Therapy Room', price: 12000, originalPrice: 30000, rating: 4.6, providerLocation: 'Asokoro, Abuja', location: 'Asokoro, Abuja' },
];

export const HAIR_REMOVAL_DATA = [
  { id: 'hr1', image: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=400&q=80', title: 'Waxing', price: 35000, location: 'Jabi, Abuja', providerLocation: 'Jabi, Abuja', rating: 4.4, gender: 'Male & Female' },
  { id: 'hr2', image: 'https://images.unsplash.com/photo-1508759073827-02baef842d03?w=400&q=80', title: 'Threading', price: 21000, location: 'Katampe, Abuja', providerLocation: 'Katampe, Abuja', rating: 3.5, gender: 'Male & Female' },
];

export const BODY_TREATMENT_DATA = [
  { id: 'bt1', image: require('../../../assets/images/custom/stretch_mark_treatment.jpg'), title: 'Stretch Mark & Skin Tightening', price: 35000, location: 'Jabi, Abuja', providerLocation: 'Jabi, Abuja', rating: 4.4, gender: 'Male & Female' },
  { id: 'bt2', image: 'https://images.unsplash.com/photo-1596704017254-9bd12ceb9e2e?w=400&q=80', title: 'Cellulite Treatment', price: 21000, location: 'Katampe, Abuja', providerLocation: 'Katampe, Abuja', rating: 3.5, gender: 'Female' },
];

export const TOP_RATED_DATA = [
  { id: 'tr1', rank: 1, image: 'https://images.unsplash.com/photo-1521590832167-7bfc17484d20?w=400&q=80', title: 'Liora Beauty', categories: 'Spa  •  Spa  •  Spa', rating: 5.0, location: 'Jabi, Abuja', providerLocation: 'Jabi, Abuja' },
  { id: 'tr2', rank: 2, image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&q=80', title: 'Glow Up Beauty', categories: 'Unisex Salon', rating: 4.4, location: 'Mabushi, Abuja', providerLocation: 'Mabushi, Abuja' },
  { id: 'tr3', rank: 3, image: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400&q=80', title: 'Zen Touch', categories: 'Massage • Therapy', rating: 4.8, location: 'Wuse 2, Abuja', providerLocation: 'Wuse 2, Abuja' },
  { id: 'tr4', rank: 4, image: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=400&q=80', title: 'Glamour Lounge', categories: 'Hair • Makeup', rating: 4.6, location: 'Garki, Abuja', providerLocation: 'Garki, Abuja' },
  { id: 'tr5', rank: 5, image: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=400&q=80', title: 'Oasis Spa', categories: 'Spa • Wellness', rating: 4.9, location: 'Maitama, Abuja', providerLocation: 'Maitama, Abuja' },
  { id: 'tr6', rank: 6, image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&q=80', title: 'Serenity Studio', categories: 'Nails • Spa', rating: 4.7, location: 'Asokoro, Abuja', providerLocation: 'Asokoro, Abuja' },
];

export const SPECIAL_LADIES_DATA = [
  { id: 'sl1', image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=400&q=80', title: 'Hair Styling', price: 25000, rating: 4.5, providerLocation: 'Wuse 2, Abuja', location: 'Wuse 2, Abuja', badge: 'top_choices' as const, onPress: () => {} },
  { id: 'sl2', image: 'https://images.unsplash.com/photo-1519014816548-bf5fe059e98b?w=400&q=80', title: 'Nail Art', price: 35000, rating: 4.1, providerLocation: 'Wuse 2, Abuja', location: 'Wuse 2, Abuja', badge: 'top_choices' as const, onPress: () => {} },
  { id: 'sl3', image: 'https://images.unsplash.com/photo-1512496015851-a98fb38ba79eb?w=400&q=80', title: 'Make Up', price: 40000, rating: 4.8, providerLocation: 'Maitama, Abuja', location: 'Maitama, Abuja', badge: 'top_choices' as const, onPress: () => {} },
  { id: 'sl4', image: 'https://images.unsplash.com/photo-1516975080661-46b0d912a2df?w=400&q=80', title: 'Pedicure', price: 15000, rating: 4.3, providerLocation: 'Garki, Abuja', location: 'Garki, Abuja', badge: 'top_choices' as const, onPress: () => {} },
  { id: 'sl5', image: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=400&q=80', title: 'Facial Care', price: 30000, rating: 4.7, providerLocation: 'Asokoro, Abuja', location: 'Asokoro, Abuja', badge: 'top_choices' as const, onPress: () => {} },
];

export const PROFESSIONALS_DATA = [
  { id: 'p1', image: 'https://images.unsplash.com/photo-1531123897727-8f129e1bf98c?w=200&q=80', name: 'Bisola Andrew', experience: '5years', workplace: 'GoodCare Spa', rating: 4.4, reviewsCount: '101 Reviews', isAvailable: true },
  { id: 'p2', image: 'https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=200&q=80', name: 'Samuel Dare', experience: '3years', workplace: 'Imperial Care', rating: 4.0, reviewsCount: '99 Reviews', isAvailable: true },
  { id: 'p3', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80', name: 'Zainab Ahmed', experience: '4years', workplace: 'Luxe Aesthetics', rating: 4.8, reviewsCount: '142 Reviews', isAvailable: true },
  { id: 'p4', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80', name: 'David Adeleke', experience: '6years', workplace: 'Signature Cuts', rating: 4.9, reviewsCount: '210 Reviews', isAvailable: true },
  { id: 'p5', image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&q=80', name: 'Chioma Okafor', experience: '4years', workplace: 'Glow Beauty Lounge', rating: 4.6, reviewsCount: '87 Reviews', isAvailable: true },
  { id: 'p6', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80', name: 'Emeka Nwosu', experience: '7years', workplace: 'The Royal Treatment', rating: 4.7, reviewsCount: '175 Reviews', isAvailable: true },
];

export const BEAUTY_PLUS_DATA = [
  { id: 'bp1', image: require('../../../assets/images/custom/media__1784573525948.jpg'), title: 'Eyelash Extensions', price: 72000, rating: 4.1, providerLocation: 'Asokoro, Abuja', location: 'Asokoro, Abuja', badge: 'popular' as const, onPress: () => {} },
  { id: 'bp2', image: require('../../../assets/images/custom/media__1784573526082.jpg'), title: 'Glamour Make Up', price: 115000, rating: 4.8, providerLocation: 'Apo, Abuja', location: 'Apo, Abuja', badge: 'popular' as const, onPress: () => {} },
  { id: 'bp3', image: 'https://images.unsplash.com/photo-1515377659633-6e695d7eb80a?w=400&q=80', title: 'Hair Styling', price: 85000, rating: 4.5, providerLocation: 'Maitama, Abuja', location: 'Maitama, Abuja', badge: 'popular' as const, onPress: () => {} },
  { id: 'bp4', image: 'https://images.unsplash.com/photo-1580828343064-fde4cad202d5?w=400&q=80', title: 'Pedicure', price: 55000, rating: 4.2, providerLocation: 'Wuse 2, Abuja', location: 'Wuse 2, Abuja', badge: 'popular' as const, onPress: () => {} },
  { id: 'bp5', image: 'https://images.unsplash.com/photo-1556228578-8d89e47cb192?w=400&q=80', title: 'Facial Care', price: 95000, rating: 4.7, providerLocation: 'Garki, Abuja', location: 'Garki, Abuja', badge: 'popular' as const, onPress: () => {} },
];

export const NON_SURGICAL_DATA = [
  { id: 'ns1', image: require('../../../assets/images/custom/media__1784573525925.jpg'), title: 'Lips Filler Treatment', price: 32800, rating: 4.6, providerLocation: 'Wuse 2, Abuja', location: 'Wuse 2, Abuja', audience: 'Male & female', onPress: () => {} },
  { id: 'ns2', image: require('../../../assets/images/custom/media__1784573549457.jpg'), title: 'Cheeks Filler Treatment', price: 72850, rating: 4.9, providerLocation: 'Maitama, Abuja', location: 'Maitama, Abuja', audience: 'Male & female', onPress: () => {} },
  { id: 'ns3', image: require('../../../assets/images/custom/media__1784573525981.jpg'), title: 'Beard Filler Treatment', price: 55000, rating: 4.5, providerLocation: 'Jabi, Abuja', location: 'Jabi, Abuja', audience: 'Male', onPress: () => {} },
  { id: 'ns4', image: require('../../../assets/images/custom/media__1784573549487.jpg'), title: 'Hairline Restoration', price: 45000, rating: 4.7, providerLocation: 'Gwarinpa, Abuja', location: 'Gwarinpa, Abuja', audience: 'Male & female', onPress: () => {} },
  { id: 'ns5', image: 'https://images.unsplash.com/photo-1604882046808-bd83ab825597?w=400&q=80', title: 'Laser Hair Removal', price: 85000, rating: 4.8, providerLocation: 'Asokoro, Abuja', location: 'Asokoro, Abuja', audience: 'Male & female', onPress: () => {} },
];

export const PREMIUM_LADIES_LOOKS_DATA = [
  { id: 'pll1', image: require('../../../assets/images/custom/media__1784573549424.jpg'), title: 'Breast Lift', price: 37500, rating: 4.1, providerLocation: 'Jabi, Abuja', badge: 'top_choices' as const, onPress: () => {} },
  { id: 'pll2', image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400&q=80', title: 'Body Contouring', price: 34500, rating: 4.8, providerLocation: 'Area 11, Abuja', badge: 'top_choices' as const, onPress: () => {} },
  { id: 'pll3', image: require('../../../assets/images/custom/media__1784573525925.jpg'), title: 'Lips Filler', price: 32800, rating: 4.6, providerLocation: 'Maitama, Abuja', badge: 'top_choices' as const, onPress: () => {} },
  { id: 'pll4', image: require('../../../assets/images/custom/media__1784573525948.jpg'), title: 'Facial Rejuvenation', price: 40000, rating: 4.9, providerLocation: 'Wuse, Abuja', badge: 'top_choices' as const, onPress: () => {} },
  { id: 'pll5', image: require('../../../assets/images/custom/media__1784573525879.jpg'), title: 'Rhinoplasty', price: 85000, rating: 4.7, providerLocation: 'Asokoro, Abuja', badge: 'top_choices' as const, onPress: () => {} },
];

export const MALE_AESTHETIC_DATA = [
  { id: 'ma1', image: require('../../../assets/images/custom/media__1784573549487.jpg'), title: 'Hair Transplant', price: 35000, rating: 4.1, providerLocation: 'Jabi, Abuja', badge: 'popular' as const, onPress: () => {} },
  { id: 'ma2', image: require('../../../assets/images/custom/media__1784573525981.jpg'), title: 'Jawline Implant', price: 35000, rating: 4.8, providerLocation: 'Jabi, Abuja', badge: 'popular' as const, onPress: () => {} },
  { id: 'ma3', image: require('../../../assets/images/services/men_waxing.png'), title: 'Chest Waxing', price: 15000, rating: 4.5, providerLocation: 'Wuse, Abuja', badge: 'popular' as const, onPress: () => {} },
  { id: 'ma4', image: require('../../../assets/images/custom/media__1784573526082.jpg'), title: 'Botox for Men', price: 45000, rating: 4.6, providerLocation: 'Maitama, Abuja', badge: 'popular' as const, onPress: () => {} },
  { id: 'ma5', image: require('../../../assets/images/custom/media__1784573549572.jpg'), title: 'Laser Hair Removal', price: 25000, rating: 4.9, providerLocation: 'Garki, Abuja', badge: 'popular' as const, onPress: () => {} },
];

export const SEE_ALL_SECTIONS: Record<string, { title: string, data: any[] }> = {
  'hair-removal': { title: 'Hair Removal Treatments', data: HAIR_REMOVAL_DATA },
  'special-ladies': { title: 'Special For The Ladies', data: SPECIAL_LADIES_DATA },
  'beauty-plus': { title: 'Beauty Plus', data: BEAUTY_PLUS_DATA },
  'havana-body-work': { title: 'Havana', data: BODY_WORK_DATA },
  'body-treatment': { title: 'Body Treatment', data: BODY_TREATMENT_DATA },
  'havana-body-treatment': { title: 'Body Treatment', data: BODY_TREATMENT_DATA },
  'non-surgical': { title: 'Non-Surgical Aesthetic', data: NON_SURGICAL_DATA },
  'premium-ladies': { title: 'Premium Ladies Looks', data: PREMIUM_LADIES_LOOKS_DATA },
  'male-aesthetic': { title: 'Male Aesthetic', data: MALE_AESTHETIC_DATA },
};
