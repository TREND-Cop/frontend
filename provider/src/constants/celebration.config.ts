/**
 * Single Orchestrated Timeline & Physics Configuration for Trend Business Celebration
 * Controls backdrop dim, cannons, confetti burst physics, welcome card entrance/exit,
 * and seamless hand-off to the tutorial overlay.
 */

// Global time scale: multiply durations by this factor (default: 1; set to 3 for slow-motion inspection)
export const CELEBRATION_TIME_SCALE = 1.0;

export const CELEBRATION_CONFIG = {
  // ── Palette (Curated 8 Figma Celebration Tokens) ──
  palette: [
    '#FF6B8B', // Pink / Coral
    '#E02475', // Magenta / Rose
    '#00C2CB', // Teal / Cyan
    '#1A82FF', // Blue
    '#FFD700', // Yellow / Gold
    '#F89B18', // Orange / Amber
    '#8B5CF6', // Purple / Violet
    '#0C790C', // Green / Emerald
  ],

  // ── Backdrop Dim Layer (Same 0.50 opacity shared with SpotlightOverlay for seamless hand-off) ──
  backdropColor: 'rgba(0, 0, 0, 0.50)',
  backdropFadeInDuration: 250 * CELEBRATION_TIME_SCALE,

  // ── Party Poppers / Cannons Timeline ──
  leftPopperTime: 150 * CELEBRATION_TIME_SCALE,
  rightPopperTime: 270 * CELEBRATION_TIME_SCALE, // 120ms stagger after left
  poppersRecoilDuration: 180 * CELEBRATION_TIME_SCALE,
  poppersFadeStartTime: 1300 * CELEBRATION_TIME_SCALE,
  poppersFadeDuration: 200 * CELEBRATION_TIME_SCALE,

  // ── Welcome Card Entrance ──
  cardEnterStartTime: 350 * CELEBRATION_TIME_SCALE,
  cardEnterDuration: 420 * CELEBRATION_TIME_SCALE, // settles ~770ms
  cardInitialScale: 0.92,
  cardInitialTranslateY: 24,

  // ── Card Content Stagger (Title, Subtitle, Action Button) ──
  titleStaggerDelay: 750 * CELEBRATION_TIME_SCALE,
  subtitleStaggerDelay: 820 * CELEBRATION_TIME_SCALE,
  buttonStaggerDelay: 890 * CELEBRATION_TIME_SCALE,
  contentFadeDuration: 260 * CELEBRATION_TIME_SCALE,
  contentTranslateY: 10,

  // ── Welcome Card Exit (When 'Get started' is tapped) ──
  cardExitDuration: 180 * CELEBRATION_TIME_SCALE,
  confettiExitDuration: 200 * CELEBRATION_TIME_SCALE,

  // ── Total Sequence Duration (After which everything is unmounted & animations stopped) ──
  sequenceTotalDuration: 3800 * CELEBRATION_TIME_SCALE,

  // ── Confetti Particle Physics (Full Screen Cannon Blast) ──
  particleCount: 56, // 28 per cannon (full, rich burst quantity at rock-solid 60fps on native Android)
  minLifetime: 2600 * CELEBRATION_TIME_SCALE,
  maxLifetime: 3500 * CELEBRATION_TIME_SCALE,

  // Aiming angles (degrees from horizontal):
  // Left cannon aims inward and up high: 76° ± 18° (58° to 94°)
  leftCannonAngleDeg: 76,
  // Right cannon aims inward and up high: 104° ± 18° (86° to 122°)
  rightCannonAngleDeg: 104,
  angleSpreadDeg: 18,

  // Initial velocity multiplier (relative to screen height per second)
  minVelocityMult: 1.15,
  maxVelocityMult: 1.55,

  // Downward gravity acceleration (px / s²)
  gravity: 650,

  // Air drag / damping factors (exponential drag)
  airDragCoefficient: 0.90,
  horizontalDragCoefficient: 0.45,
  terminalVelocity: 85,

  // Horizontal sway while drifting
  minSwayAmp: 8,
  maxSwayAmp: 22,
  minSwayFreq: 1.2,
  maxSwayFreq: 2.6,

  // ── Post-Burst Top Drift (Gentle trickle of small confetti from the top after burst) ──
  topDriftCount: 16,
  topDriftStartTime: 1100 * CELEBRATION_TIME_SCALE,
  topDriftMinSpeed: 130,
  topDriftMaxSpeed: 210,
  topDriftMinLifetime: 1900 * CELEBRATION_TIME_SCALE,
  topDriftMaxLifetime: 2300 * CELEBRATION_TIME_SCALE,
  topDriftMinSize: 4.5,
  topDriftMaxSize: 6.5,

  // ── Copy Tokens ──
  titleCopy: 'Welcome to Trend Business',
  subtitleCopy: "Let's get you set up on how it works.",
  buttonCopy: 'Get started',
};
