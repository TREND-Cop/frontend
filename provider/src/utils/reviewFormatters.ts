/**
 * Trend Business — Review Formatters
 *
 * Formats timestamps for reviews and replies matching 1:1 Figma specification:
 * - "12:32pm, 12-03-2026"
 *   - Hour without leading zero (1..12)
 *   - Lowercase am/pm
 *   - Day-month-year with 2 digits each (DD-MM-YYYY)
 *   - Device local time
 */

export function formatReviewTimestamp(date: string | Date | number): string {
  if (!date) return '';

  const d = typeof date === 'object' ? date : new Date(date);
  if (isNaN(d.getTime())) {
    return '';
  }

  const rawHours = d.getHours();
  const rawMinutes = d.getMinutes();
  const period = rawHours >= 12 ? 'pm' : 'am';
  const hour = rawHours % 12 === 0 ? 12 : rawHours % 12;
  const minutes = String(rawMinutes).padStart(2, '0');

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();

  return `${hour}:${minutes}${period}, ${day}-${month}-${year}`;
}
