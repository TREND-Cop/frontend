/**
 * Trend Business — Trend Tone and Polarity Utilities
 *
 * Implements Figma "Chart Metrics" note rule:
 * - polarity is 'higherIsBetter' (default) or 'lowerIsBetter'.
 * - Normal ('higherIsBetter'): up is positive (green), down is negative (red).
 * - Inverted ('lowerIsBetter'): for canceled & rescheduled appointments,
 *   up is negative (red) and down is positive (green).
 */

export type TrendDirection = 'up' | 'down';
export type TrendPolarity = 'higherIsBetter' | 'lowerIsBetter';
export type TrendTone = 'positive' | 'negative';

export const TREND_COLORS = {
  positive: 'rgba(12, 121, 12, 0.96)', // Primary green
  negative: 'rgba(204, 41, 41, 0.9)',  // Red warning
};

/**
 * Pure function returning 'positive' (green) or 'negative' (red) based on
 * direction and polarity.
 */
export function getTrendTone(
  direction: TrendDirection,
  polarity: TrendPolarity = 'higherIsBetter'
): TrendTone {
  if (polarity === 'higherIsBetter') {
    return direction === 'up' ? 'positive' : 'negative';
  }
  // 'lowerIsBetter' (e.g. cancellations, reschedules)
  return direction === 'up' ? 'negative' : 'positive';
}

/**
 * Pure function returning the comparison tone for a previous period value.
 * Inferred from Figma frame C2:
 * When the current trend is positive (e.g. green ↗ 56%), previous value (12%) uses negative tone (red).
 * When the current trend is negative (e.g. red ↘ 44%), previous value (56%) uses positive tone (green).
 */
export function getPreviousValueTone(trendTone: TrendTone): TrendTone {
  return trendTone === 'positive' ? 'negative' : 'positive';
}

/**
 * Self-verification test asserting all direction, polarity, and previous tone combinations.
 * Run in dev environments to verify rule integrity.
 */
export function verifyTrendToneCombinations(): boolean {
  const case1 = getTrendTone('up', 'higherIsBetter') === 'positive';
  const case2 = getTrendTone('down', 'higherIsBetter') === 'negative';
  const case3 = getTrendTone('up', 'lowerIsBetter') === 'negative';
  const case4 = getTrendTone('down', 'lowerIsBetter') === 'positive';

  const prev1 = getPreviousValueTone('positive') === 'negative';
  const prev2 = getPreviousValueTone('negative') === 'positive';

  if (!case1 || !case2 || !case3 || !case4 || !prev1 || !prev2) {
    throw new Error('Trend tone combination test failed');
  }

  return true;
}

// Execute assertion verification on load
if (__DEV__) {
  try {
    verifyTrendToneCombinations();
  } catch (err) {
    console.error('Trend polarity assertions failed:', err);
  }
}
