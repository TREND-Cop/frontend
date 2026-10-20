/**
 * Service Categories and Subcategories for Trend Business.
 *
 * TODO (Backend): categories come from the backend.
 *
 * Known issues from Figma spec resolved:
 * 1. Duplicates removed:
 *    - Removed 2nd "Mesotherapy" (Skin & Facial)
 *    - Removed 2nd "Radio frequency" (Skin & Facial)
 *    - Removed 2nd "Facial Grooming" (Skin & Facial)
 * 2. Typos corrected:
 *    - "Body Scubs" -> "Body Scrubs" (Body & Spa Treatment)
 *    - "Leaser & IPL Hair Remover" -> "Laser & IPL Hair Removal" (Hair Removal)
 *    - "Preventative & Prejuvenaion" -> "Preventative & Prejuvenation" (Wellness & Lifestyle)
 *    - "Autoplasty" -> "Otoplasty" (Surgical & Cosmetic Surgery)
 * 3. Typography note:
 *    - "Sexual Wellness & Rejuvenation" normalized to standard group item typography.
 */

export interface ServiceCategoryItem {
  id: string;
  name: string;
}

export interface ServiceCategoryGroup {
  id: string;
  name: string;
  iconName: string; // Asset icon identifier
  image?: any;
  items: ServiceCategoryItem[];
}

/**
 * Exact 1:1 Figma Category Icons for all 9 groups.
 * Mapped both by category group ID and by iconName.
 */
export const CATEGORY_ICONS: Record<string, any> = {
  barbing_salon: require('../../assets/images/categories/barbing.png'),
  skin_facial: require('../../assets/images/categories/facial.png'),
  nails: require('../../assets/images/categories/nails.png'),
  body_spa: require('../../assets/images/categories/body_spa.png'),
  makeup_enhancement: require('../../assets/images/categories/makeup.png'),
  hair_removal: require('../../assets/images/categories/hair_removal.png'),
  med_spa: require('../../assets/images/categories/spa.png'),
  surgical_cosmetic: require('../../assets/images/categories/surgical.png'),
  wellness_lifestyle: require('../../assets/images/categories/wellness.png'),

  // Aliases by iconName
  clipper: require('../../assets/images/categories/barbing.png'),
  skincare: require('../../assets/images/categories/facial.png'),
  manicure: require('../../assets/images/categories/nails.png'),
  massage: require('../../assets/images/categories/body_spa.png'),
  makeup: require('../../assets/images/categories/makeup.png'),
  laser_hair: require('../../assets/images/categories/hair_removal.png'),
  facial_surgery: require('../../assets/images/categories/spa.png'),
  syringe: require('../../assets/images/categories/surgical.png'),
  spa: require('../../assets/images/categories/wellness.png'),
};

export function getCategoryIcon(idOrIconName?: string): any {
  if (!idOrIconName) return null;
  return CATEGORY_ICONS[idOrIconName] || null;
}

export const SERVICE_CATEGORIES: ServiceCategoryGroup[] = [
  {
    id: 'barbing_salon',
    name: 'Barbing Salon',
    iconName: 'clipper',
    image: CATEGORY_ICONS.barbing_salon,
    items: [
      { id: 'hair_cut_styling', name: 'Hair cut & styling' },
      { id: 'hair_treatment', name: 'Hair treatment' },
      { id: 'chemical_treatment', name: 'Chemical treatment' },
      { id: 'kids_hair_cut', name: 'Kids hair cut' },
      { id: 'scalp_treatment', name: 'Scalp treatment' },
      { id: 'hair_colour', name: 'Hair colour' },
      { id: 'hair_extension', name: 'Hair extension' },
    ],
  },
  {
    id: 'skin_facial',
    name: 'Skin & Facial',
    iconName: 'skincare',
    image: CATEGORY_ICONS.skin_facial,
    items: [
      { id: 'hydra_facial', name: 'Hydra facial' },
      { id: 'micro_current', name: 'Micro-current' },
      { id: 'advanced_facial', name: 'Advanced facial' },
      { id: 'facial', name: 'Facial' },
      { id: 'led_light_therapy', name: 'LED - light therapy' },
      { id: 'ultra_sound', name: 'Ultra sound' },
      { id: 'carbon_peels', name: 'Carbon peels' },
      { id: 'dermal_piercing', name: 'Dermal piercing' },
      { id: 'mesotherapy', name: 'Mesotherapy' },
      { id: 'micro_needling', name: 'Micro-needling' },
      { id: 'radio_frequency', name: 'Radio frequency' },
      { id: 'exosome_therapy', name: 'Exosome therapy' },
      { id: 'facial_grooming', name: 'Facial Grooming' },
      { id: 'skin_rejuvenation', name: 'Skin Rejuvenation' },
      { id: 'cryotherapy_facial', name: 'Cryotherapy Facial' },
      { id: 'acne_scar_treatment', name: 'Acne & Scar Treatment' },
    ],
  },
  {
    id: 'nails',
    name: 'Nails',
    iconName: 'manicure',
    image: CATEGORY_ICONS.nails,
    items: [
      { id: 'manicure', name: 'Manicure' },
      { id: 'nail_repair', name: 'Nail Repair' },
      { id: 'pedicure', name: 'Pedicure' },
    ],
  },
  {
    id: 'body_spa',
    name: 'Body & Spa Treatment',
    iconName: 'massage',
    image: CATEGORY_ICONS.body_spa,
    items: [
      { id: 'massages', name: 'Massages' },
      { id: 'body_scrubs', name: 'Body Scrubs' },
      { id: 'exfoliation', name: 'Exfoliation' },
      { id: 'polishes', name: 'Polishes' },
      { id: 'body_wraps', name: 'Body Wraps' },
      { id: 'body_sculpting', name: 'Body Sculpting' },
      { id: 'butt_facial', name: 'Butt Facial' },
      { id: 'cryotherapy', name: 'Cryotherapy' },
      { id: 'teeth_whitening', name: 'Teeth Whitening' },
    ],
  },
  {
    id: 'makeup_enhancement',
    name: 'Make-Up & Enhancement',
    iconName: 'makeup',
    image: CATEGORY_ICONS.makeup_enhancement,
    items: [
      { id: 'makeups', name: 'Makeups' },
      { id: 'tattoo_piercing', name: 'Tattoo & Piercing' },
    ],
  },
  {
    id: 'hair_removal',
    name: 'Hair Removal',
    iconName: 'laser_hair',
    image: CATEGORY_ICONS.hair_removal,
    items: [
      { id: 'waxing', name: 'Waxing' },
      { id: 'sugaring', name: 'Sugaring' },
      { id: 'laser_ipl_hair_removal', name: 'Laser & IPL Hair Removal' },
      { id: 'electrolysis', name: 'Electrolysis' },
    ],
  },
  {
    id: 'med_spa',
    name: 'Med Spa & Aesthetic',
    iconName: 'facial_surgery',
    image: CATEGORY_ICONS.med_spa,
    items: [
      { id: 'neurotoxins', name: 'Neurotoxins' },
      { id: 'dermal_filler', name: 'Dermal Filler' },
      { id: 'prp_prf_injections', name: 'PRP / PRF Injections' },
      { id: 'fat_dissolving', name: 'Fat Dissolving' },
      { id: 'ipl', name: 'IPL' },
      { id: 'skin_tightening', name: 'Skin Tightening' },
      { id: 'laser_resurfacing', name: 'Laser Resurfacing' },
      { id: 'pdo_threads', name: 'PDO Threads' },
      { id: 'injectable_moisturizers', name: 'Inject-able Moisturizers' },
      { id: 'non_surgical_lift', name: 'Non-surgical Lift' },
      { id: 'vein_treatments', name: 'Vein Treatments' },
      { id: 'regenerative_treatments', name: 'Regenerative Treatments' },
      { id: 'pigmentation', name: 'Pigmentation' },
      { id: 'tattoo_removal', name: 'Tattoo Removal' },
    ],
  },
  {
    id: 'surgical_cosmetic',
    name: 'Surgical & Cosmetic Surgery',
    iconName: 'syringe',
    image: CATEGORY_ICONS.surgical_cosmetic,
    items: [
      { id: 'pectoral_calf_implants', name: 'Pectoral Calf Implants' },
      { id: 'rhinoplasty', name: 'Rhinoplasty' },
      { id: 'hair_transplant', name: 'Hair Transplant' },
      { id: 'neck_lift', name: 'Neck Lift' },
      { id: 'brow_lift', name: 'Brow Lift' },
      { id: 'face_lift', name: 'Face lift' },
      { id: 'otoplasty', name: 'Otoplasty' },
      { id: 'fat_transfer_grafting', name: 'Fat Transfer Grafting' },
      { id: 'sexual_wellness_rejuvenation', name: 'Sexual Wellness & Rejuvenation' },
      { id: 'blepharoplasty', name: 'Blepharoplasty' },
      { id: 'liposuction_body_contouring', name: 'Liposuction & Body Contouring' },
      { id: 'jawline_chin_implants', name: 'Jawline Chin Implants' },
      { id: 'body_lifts', name: 'Body Lifts' },
      { id: 'facial_masculinization', name: 'Facial Masculinization' },
      { id: 'gynaecomastia_reduction', name: 'Gynaecomastia Reduction' },
    ],
  },
  {
    id: 'wellness_lifestyle',
    name: 'Wellness & Lifestyle',
    iconName: 'spa',
    image: CATEGORY_ICONS.wellness_lifestyle,
    items: [
      { id: 'tanning', name: 'Tanning' },
      { id: 'holistic_alternative', name: 'Holistic & Alternative' },
      { id: 'wellness_longevity', name: 'Wellness & Longevity' },
      { id: 'preventative_prejuvenation', name: 'Preventative & Prejuvenation' },
    ],
  },
];
