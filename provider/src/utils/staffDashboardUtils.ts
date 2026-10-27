/**
 * Staff Dashboard Formatting Utilities
 */

const ORDERED_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/**
 * Formats a list of work days into contiguous ranges joined with commas.
 * Handles Figma data slip where "Mon - Wed Sun" lacked punctuation.
 * E.g.: ['Mon', 'Tue', 'Wed', 'Sun'] -> "Mon - Wed, Sun"
 *       ['Mon', 'Wed', 'Fri'] -> "Mon, Wed, Fri"
 *       ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] -> "Mon - Fri"
 */
export function formatWorkDays(days?: string[]): string {
  if (!days || days.length === 0) {
    return '—';
  }

  // Normalize and filter valid days preserving calendar order
  const dayIndices = days
    .map((d) => ORDERED_DAYS.indexOf(d.trim()))
    .filter((idx) => idx !== -1)
    .sort((a, b) => a - b);

  if (dayIndices.length === 0) {
    return '—';
  }

  // Deduplicate
  const uniqueIndices = Array.from(new Set(dayIndices));

  // Find contiguous ranges
  const ranges: string[] = [];
  let rangeStart = uniqueIndices[0];
  let rangeEnd = uniqueIndices[0];

  for (let i = 1; i < uniqueIndices.length; i++) {
    const current = uniqueIndices[i];
    if (current === rangeEnd + 1) {
      rangeEnd = current;
    } else {
      if (rangeStart === rangeEnd) {
        ranges.push(ORDERED_DAYS[rangeStart]);
      } else if (rangeEnd === rangeStart + 1) {
        ranges.push(`${ORDERED_DAYS[rangeStart]}, ${ORDERED_DAYS[rangeEnd]}`);
      } else {
        ranges.push(`${ORDERED_DAYS[rangeStart]} - ${ORDERED_DAYS[rangeEnd]}`);
      }
      rangeStart = current;
      rangeEnd = current;
    }
  }

  // Push last range
  if (rangeStart === rangeEnd) {
    ranges.push(ORDERED_DAYS[rangeStart]);
  } else if (rangeEnd === rangeStart + 1) {
    ranges.push(`${ORDERED_DAYS[rangeStart]}, ${ORDERED_DAYS[rangeEnd]}`);
  } else {
    ranges.push(`${ORDERED_DAYS[rangeStart]} - ${ORDERED_DAYS[rangeEnd]}`);
  }

  return ranges.join(', ');
}

/**
 * Formats remaining seconds into Figma standard hours:minutes:seconds string with "hrs" label.
 * E.g. 30610 -> "8:30:10 hrs"
 */
export function formatSecondsToBreakString(totalSeconds: number): string {
  if (totalSeconds <= 0) return '0:00:00 hrs';

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);

  return `${hours}:${pad(minutes)}:${pad(seconds)} hrs`;
}
