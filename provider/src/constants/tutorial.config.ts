/**
 * Tutorial and First-Time Experience Configuration
 */

// Dev-only flag to force replay of the tutorial and first-time flow on dashboard load
export const FORCE_FIRST_TIME_FLOW = false;

// Confetti color palette (vibrant celebration tokens)
export const CONFETTI_PALETTE = [
  '#1A82FF', // Blue
  '#0C790C', // Green
  '#F89B18', // Orange / Amber
  '#CC2929', // Red
  '#73037C', // Purple
  '#FFD700', // Gold
  '#00C9A7', // Teal
  '#FF8066', // Coral
];

// Trial configuration
export const TRIAL_DAYS = 7;

// Dev-only flag to enable automated self-test runner (10 runs comparing drawn rect vs fresh measurement)
export const TUTORIAL_SELFTEST = false;

// Timing constants
export const TUTORIAL_TIMINGS = {
  confettiDurationMs: 2500,
  welcomeCardDelayMs: 600,
  stepFadeDurationMs: 120,
  scrollSettlingMs: 280,
};
