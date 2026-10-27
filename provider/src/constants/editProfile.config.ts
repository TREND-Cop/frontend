/**
 * Configuration & constants for Edit Business Profile flow.
 * Figma Frames: E1, E2, E3, E4, E5, E6, V1, V2, V3, V4
 */

/**
 * Business name can only be changed once every 6 months.
 */
export const NAME_CHANGE_LOCK_MONTHS = 6;

/**
 * Dev-only override to test the locked business name state (Figma E3).
 * Set to a number (e.g. 96) to simulate 96 days remaining on the lock banner.
 * Set to null for normal dynamic calculation from nameChangedAt.
 */
export const DEV_NAME_LOCKED_DAYS: number | null = null;

/**
 * Dev-only toggle to test empty profile (Figma E1).
 * When true, clears initial values so placeholders and grey buttons can be inspected.
 */
export const DEV_EMPTY_PROFILE = false;

/**
 * Mock delay for saveBusinessProfile stub (TODO: Backend)
 */
export const SAVE_PROFILE_MOCK_MS = 1200;

/**
 * Route for the preview screen
 */
export const PREVIEW_PLACEHOLDER_ROUTE = '/edit-business-profile/preview';

// ─────────────────────────────────────────────────────────────────────────────
// PREVIEW SCREEN CONFIG & DEV TOGGLES (Part 2)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Dev-only toggle for preview client stubs (rating 4.1, distance 2.89km, verified status).
 * Set to true to view V1-V4 Figma preview fidelity.
 * Set to false to test hidden states (rating: null, distance: null, unverified).
 */
export const DEV_SAMPLE_PREVIEW = true;

/**
 * Dev-only toggle for preview services list.
 * Set to true to return sample categories ("Hair Cut", "Pedicure", "Manicure", "Facial")
 * and sample services ("Spiky" @ ₦13,750.00).
 * Set to false to test the minimal "No services yet" explicit empty block.
 */
export const DEV_SAMPLE_SERVICES = true;

/**
 * Dev-only toggle to populate sample salon photos if business has none.
 * When true and photo count is 0, supplies 11 sample salon photos
 * so the 3x2 grid and "6+" extra photos overlay can be visually inspected.
 */
export const DEV_SAMPLE_SALON_PHOTOS = true;

/**
 * Dev-only manual override for photo count:
 * - 0: tests minimal theme-based placeholder block
 * - 3: tests 3 photos (1 row)
 * - 6: tests 6 photos (2 full rows, no "+" overlay)
 * - 11: tests 11 photos ("6+" overlay on the 6th tile)
 * Set to null for normal count from salon photos.
 */
export const DEV_OVERRIDE_PHOTO_COUNT: number | null = null;
