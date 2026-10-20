/**
 * Configuration constants for Post Work flow
 * Matching 1:1 Figma notes and specifications
 */

// Note "Loader" in Figma: after successful upload, wait 3 seconds before auto-redirecting to Post Work grid
export const POST_WORK_SUCCESS_REDIRECT_MS = 3000;

// Dev-only toggle: when true, preloads 4 sample haircut photos in the grid matching Figma frames S1-S3
// Default: false (store starts empty per prompt specification)
export const DEV_SAMPLE_WORK_PHOTOS = false;
