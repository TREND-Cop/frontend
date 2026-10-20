import { SelectionOption } from '../components/SelectionSheet';

/**
 * Service form dropdown options for Trend Business wizard.
 *
 * NOTE: Values derived strictly from Figma specs/placeholders and edit frame references.
 * Additional test options are clearly marked as `TODO (Copy)`.
 * Real options will be supplied by client.
 */

// ── Discounts (Optional) ──────────────────────────────────────────────────────
export const DISCOUNT_OPTIONS: SelectionOption[] = [
  { id: '10_off', label: '10% OFF' }, // Placeholder from Figma
  { id: '15_off', label: '15% OFF' }, // TODO (Copy): Placeholder for testing
  { id: '20_off', label: '20% OFF' }, // TODO (Copy): Placeholder for testing
  { id: '25_off', label: '25% OFF' }, // TODO (Copy): Placeholder for testing
  { id: '50_off', label: '50% OFF' }, // TODO (Copy): Placeholder for testing
  { id: 'custom_discount', label: '₦1,000 Discount' }, // From Section 5 frame
];

// ── Gender Type (Required) ────────────────────────────────────────────────────
export const GENDER_OPTIONS: SelectionOption[] = [
  { id: 'all_gender', label: 'All Gender' }, // Placeholder from Figma
  { id: 'male_only', label: 'Male only' }, // From Edit frame
  { id: 'female_only', label: 'Female only' }, // TODO (Copy): Inferred companion option
];

// ── Service Type (Required) ───────────────────────────────────────────────────
export const SERVICE_TYPE_OPTIONS: SelectionOption[] = [
  { id: 'home_service', label: 'Home service' }, // Placeholder from Figma
  { id: 'in_salon', label: 'In-salon only' }, // TODO (Copy): Placeholder for testing
  { id: 'both', label: 'Both (In-salon & Home service)' }, // TODO (Copy): Placeholder for testing
];

// ── Service Duration (Required) ───────────────────────────────────────────────
export const DURATION_OPTIONS: SelectionOption[] = [
  { id: '30_min', label: '30 mins' }, // From edit frame
  { id: '45_min', label: '45 mins' }, // TODO (Copy)
  { id: '1_hr', label: '1 hr' }, // Placeholder from Figma
  { id: '1_30_hr', label: '1:30 hr' }, // From Edit frame
  { id: '2_hr', label: '2 hr' }, // TODO (Copy)
  { id: '2_30_hr', label: '2:30 hr' }, // TODO (Copy)
  { id: '3_hr', label: '3 hr' }, // TODO (Copy)
  { id: '4_hr', label: '4 hr' }, // TODO (Copy)
  { id: '4_30_hr', label: '4:30 hr' }, // From Edit frame
];
