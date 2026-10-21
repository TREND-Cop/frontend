/**
 * Staff Formatters & Pure Helper Functions
 *
 * Dedicated pure formatters used across StaffDetailScreen and its edit sheets.
 * Note: Staff Management card and Add Staff form have their own formats; these
 * are strictly scoped to Staff Detail and Edit sheets per prompt specifications.
 */

export const WEEK_DAYS_ORDER = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const;

export type StandardWeekDay = typeof WEEK_DAYS_ORDER[number];

/**
 * Formats a time range object into display string.
 * Example: { start: '7:30am', end: '9:30pm' } -> "7:30am - 9:30pm"
 * Returns "Not set" when null/undefined.
 */
export function formatTimeRange(
  timeRange: { start: string; end: string } | null | undefined
): string {
  if (!timeRange || !timeRange.start || !timeRange.end) {
    return 'Not set';
  }
  return `${timeRange.start} - ${timeRange.end}`;
}

/**
 * Formats experience years into display string.
 * Example: 5 -> "5 Years experience"
 * Example: 1 -> "1 Year experience"
 * Returns "Not set" when null/undefined/0.
 */
export function formatExperience(years: number | null | undefined): string {
  if (years === null || years === undefined || years <= 0) {
    return 'Not set';
  }
  if (years === 1) {
    return '1 Year experience';
  }
  return `${years} Years experience`;
}

/**
 * Formats work days array into calendar-ordered string.
 * - Week order: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday
 * - If all 7 days selected: "Everyday"
 * - Returns "Not set" when empty/null/undefined.
 */
export function formatWorkDays(days: string[] | null | undefined): string {
  if (!days || days.length === 0) {
    return 'Not set';
  }

  // Filter and sort by standard week days order
  const ordered = WEEK_DAYS_ORDER.filter((day) => days.includes(day));

  if (ordered.length === 7) {
    return 'Everyday';
  }

  return ordered.join(', ');
}

/**
 * Formats roles array into display string joined by " & ".
 * Example: ['Nail Artist', 'Barber'] -> "Nail Artist & Barber"
 * Returns fallback or "Not set" when empty.
 */
export function formatRoles(
  roles: string[] | null | undefined,
  fallbackRole?: string
): string {
  if (roles && roles.length > 0) {
    return roles.join(' & ');
  }
  if (fallbackRole && fallbackRole.trim().length > 0) {
    return fallbackRole;
  }
  return 'Not set';
}

/**
 * Helper to parse a time string like "7:30am" or "9:30 pm" into hour, minute, period
 */
export function parseTimeString(timeStr: string | null | undefined): {
  hour: number | null;
  minute: number | null;
  period: 'am' | 'pm' | null;
} {
  if (!timeStr) {
    return { hour: null, minute: null, period: null };
  }

  const clean = timeStr.trim().toLowerCase();
  const isPm = clean.includes('pm');
  const isAm = clean.includes('am');
  const period: 'am' | 'pm' | null = isPm ? 'pm' : (isAm ? 'am' : null);

  const numericPart = clean.replace(/[apm\s]/g, '');
  const [hStr, mStr] = numericPart.split(':');

  const hour = hStr !== undefined && hStr !== '' ? parseInt(hStr, 10) : null;
  const minute = mStr !== undefined && mStr !== '' ? parseInt(mStr, 10) : 0;

  return {
    hour: typeof hour === 'number' && !isNaN(hour) ? hour : null,
    minute: typeof minute === 'number' && !isNaN(minute) ? minute : 0,
    period,
  };
}
