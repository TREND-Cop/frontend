/**
 * Safely parses formatted currency strings (e.g. "₦13,750.00", "From ₦27,000", "14200")
 * into a whole-unit number without stripping decimal points (preventing 100x inflation).
 */
export function parsePrice(value: string | number | null | undefined, fallback = 0): number {
  if (typeof value === 'number') {
    return Number.isFinite(value) && value > 0 ? Math.round(value) : fallback;
  }
  if (!value) return fallback;
  const cleaned = String(value).replace(/,/g, '');
  const match = cleaned.match(/\d+(?:\.\d+)?/);
  if (!match) return fallback;
  const parsed = parseFloat(match[0]);
  return Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed) : fallback;
}
