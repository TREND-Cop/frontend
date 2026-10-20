/**
 * Staff Role definitions grouped by category
 *
 * TODO (Backend): roles come from the backend API
 *
 * Corrected typos from Figma design:
 * - "Barbing Salons" -> "Barbing Salon"
 * - "Cryotheraphy Specialist" -> "Cryotherapy Specialist"
 * - "Leaser & IPL technician" -> "Laser & IPL technician"
 * - "Leaser specialist" -> "Laser specialist"
 * - "plastic surgeon" -> "Plastic surgeon"
 * - "Wellness couch" -> "Wellness coach"
 */

export interface StaffRoleItem {
  id: string;
  name: string;
}

export interface StaffRoleGroup {
  id: string;
  groupName: string;
  roles: StaffRoleItem[];
}

export const STAFF_ROLE_GROUPS: StaffRoleGroup[] = [
  {
    id: 'barbing_salon',
    groupName: 'Barbing Salon',
    roles: [
      { id: 'barber', name: 'Barber' },
      { id: 'hair_stylist', name: 'Hair stylist' },
      { id: 'hair_colorist', name: 'Hair colorist' },
      { id: 'trichologist', name: 'Trichologist / Scalp specialist' },
      { id: 'hair_extension', name: 'Hair extension specialist' },
    ],
  },
  {
    id: 'skin_facial',
    groupName: 'Skin & Facial',
    roles: [
      { id: 'esthetician', name: 'Esthetician / Aesthetician' },
      { id: 'medical_esthetician', name: 'Medical esthetician' },
      { id: 'facialist', name: 'Facialist' },
      { id: 'skin_care_specialist', name: 'Skin care specialist' },
      { id: 'advanced_skin_therapist', name: 'Advanced skin therapist' },
    ],
  },
  {
    id: 'nails',
    groupName: 'Nails',
    roles: [
      { id: 'nail_technician', name: 'Nail technician' },
      { id: 'manicurist', name: 'Manicurist' },
      { id: 'pedicurist', name: 'Pedicurist' },
    ],
  },
  {
    id: 'body_spa',
    groupName: 'Body & Spa Treatment',
    roles: [
      { id: 'massage_therapist', name: 'Massage therapist' },
      { id: 'spa_therapist', name: 'Spa therapist' },
      { id: 'body_treatment_specialist', name: 'Body treatment specialist' },
      { id: 'body_contouring_specialist', name: 'Body contouring specialist' },
      { id: 'cryotherapy_specialist', name: 'Cryotherapy Specialist' },
    ],
  },
  {
    id: 'makeup_enhancement',
    groupName: 'Make-Up & Enhancement',
    roles: [
      { id: 'makeup_artist', name: 'Makeup artist' },
      { id: 'tattoo_artist', name: 'Tattoo artist' },
      { id: 'piercing_specialist', name: 'Piercing specialist' },
    ],
  },
  {
    id: 'hair_removal',
    groupName: 'Hair Removal',
    roles: [
      { id: 'waxing_specialist', name: 'Waxing specialist' },
      { id: 'sugaring_specialist', name: 'Sugaring specialist' },
      { id: 'laser_ipl_technician', name: 'Laser & IPL technician' },
      { id: 'electrologist', name: 'Electrologist' },
    ],
  },
  {
    id: 'med_spa',
    groupName: 'Med Spa & Aesthetic',
    roles: [
      { id: 'aesthetic_injector', name: 'Aesthetic Injector / Nurse Injector' },
      { id: 'laser_specialist', name: 'Laser specialist' },
      { id: 'prp_specialist', name: 'Regenerative / PRP Specialist' },
      { id: 'med_aesthetician', name: 'Medical Aesthetician' },
      { id: 'cosmetic_doctor', name: 'Cosmetic Doctor / Aesthetic Physician' },
    ],
  },
  {
    id: 'surgical_cosmetic',
    groupName: 'Surgical & Cosmetic Surgery',
    roles: [
      { id: 'plastic_surgeon', name: 'Plastic surgeon' },
      { id: 'cosmetic_surgeon', name: 'Cosmetic surgeon' },
      { id: 'hair_transplant_surgeon', name: 'Hair transplant surgeon' },
      { id: 'body_contouring', name: 'Body contouring' },
    ],
  },
  {
    id: 'wellness_lifestyle',
    groupName: 'Wellness & Lifestyle',
    roles: [
      { id: 'wellness_coach', name: 'Wellness coach' },
      { id: 'holistic_practitioner', name: 'Holistic practitioner' },
      { id: 'longevity_specialist', name: 'Longevity specialist' },
      { id: 'tanning_specialist', name: 'Tanning specialist' },
    ],
  },
];
