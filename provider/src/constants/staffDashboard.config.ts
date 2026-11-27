/**
 * Staff Dashboard Configuration & Dev Overrides
 *
 * Frontend stubs marked with TODO (Backend).
 * Dev-only constants strictly default to false / null.
 */

/**
 * When true, returns sample values shaped like the Figma frames:
 * (1 pending, 0 ongoing, 3 cancelled, 3 completed, 3 photos, +12%, 3 reviews,
 * 4 times: Closing 8:30:00pm, Break 12:00:00pm, Resumption 8:30:00am, Work Days Mon - Wed, Sun).
 * Default MUST be false.
 */
export const DEV_SAMPLE_STAFF_DASHBOARD = true;

/**
 * Dev override for break time countdown in seconds.
 * When set to a number (e.g. 30610 for 8:30:10 hrs, or 120 for 2 mins),
 * the break countdown chip will display and tick down every second.
 * Default MUST be null.
 */
export const DEV_STAFF_BREAK_IN_SECONDS: number | null = null;
