/**
 * Pure helper functions for formatting, parsing, diffing, and lock calculation
 * for the Edit Business Profile flow.
 */

import { NAME_CHANGE_LOCK_MONTHS, DEV_NAME_LOCKED_DAYS } from '../constants/editProfile.config';

export interface EditableBusinessProfile {
  businessName: string;
  operatingHours: string;
  operatingDays: string;
  address: string;
  country: string;
  countryCode: string;
  state: string;
  gender: string;
  nameChangedAt?: string | null;
}

/**
 * Formats open and close time strings into a standardized time range string.
 * Example: "9:00am", "9:00pm" -> "9:00am - 9:00pm"
 */
export function formatTimeRange(openTime?: string | null, closeTime?: string | null): string {
  const open = (openTime || '').trim();
  const close = (closeTime || '').trim();
  if (!open && !close) return '';
  if (open && !close) return open;
  if (!open && close) return close;
  // If already contains a dash separator
  if (open.includes(' - ')) return open;
  return `${open} - ${close}`;
}

/**
 * Parses a time range string into open and close components.
 * Example: "9:00am - 9:00pm" -> { open: "9:00am", close: "9:00pm" }
 */
export function parseTimeRange(range?: string | null): { open: string; close: string } {
  if (!range || !range.trim()) {
    return { open: '', close: '' };
  }
  const parts = range.split(/\s*-\s*/);
  if (parts.length >= 2) {
    return { open: parts[0].trim(), close: parts[1].trim() };
  }
  return { open: parts[0].trim(), close: '' };
}

/**
 * Formats a day or list of days into a comma-separated or range string.
 * Example: ['Monday', 'Thursday', 'Sunday'] -> "Monday, Thursday, Sunday"
 */
export function formatDays(days: string[] | string): string {
  if (typeof days === 'string') {
    return days.trim();
  }
  if (!Array.isArray(days) || days.length === 0) {
    return '';
  }
  return days.map((d) => d.trim()).filter(Boolean).join(', ');
}

/**
 * Diffs the working copy against the saved profile.
 * Returns an array of keys that differ.
 */
export function diffBusinessProfile(
  saved: EditableBusinessProfile,
  working: EditableBusinessProfile
): (keyof EditableBusinessProfile)[] {
  const changed: (keyof EditableBusinessProfile)[] = [];

  const normalize = (val?: string | null) => (val || '').trim();

  if (normalize(saved.businessName) !== normalize(working.businessName)) {
    changed.push('businessName');
  }
  if (normalize(saved.operatingHours) !== normalize(working.operatingHours)) {
    changed.push('operatingHours');
  }
  if (normalize(saved.operatingDays) !== normalize(working.operatingDays)) {
    changed.push('operatingDays');
  }
  if (normalize(saved.address) !== normalize(working.address)) {
    changed.push('address');
  }
  if (normalize(saved.country) !== normalize(working.country)) {
    changed.push('country');
  }
  if (normalize(saved.state) !== normalize(working.state)) {
    changed.push('state');
  }
  if (normalize(saved.gender) !== normalize(working.gender)) {
    changed.push('gender');
  }

  return changed;
}

/**
 * Checks if a working profile is complete and valid to be saved.
 * Valid = name (trimmed, non-empty, if editable), operating hours (both times),
 * operating days (at least one), address (non-empty), country, state, gender.
 */
export function validateBusinessProfile(profile: EditableBusinessProfile): boolean {
  if (!profile.businessName || !profile.businessName.trim()) {
    return false;
  }
  if (!profile.operatingHours || !profile.operatingHours.trim()) {
    return false;
  }
  // Must have both open and close times
  const { open, close } = parseTimeRange(profile.operatingHours);
  if (!open || !close) {
    return false;
  }
  if (!profile.operatingDays || !profile.operatingDays.trim()) {
    return false;
  }
  if (!profile.address || !profile.address.trim()) {
    return false;
  }
  if (!profile.country || !profile.country.trim()) {
    return false;
  }
  if (!profile.state || !profile.state.trim()) {
    return false;
  }
  if (!profile.gender || !profile.gender.trim()) {
    return false;
  }
  return true;
}

/**
 * Computes whether the business name is locked from editing (6-month rule),
 * and how many days remain until unlocked.
 */
export function computeNameLock(
  nameChangedAt?: string | null,
  devOverrideDays: number | null = DEV_NAME_LOCKED_DAYS
): { isLocked: boolean; daysRemaining: number } {
  if (devOverrideDays !== null && devOverrideDays !== undefined) {
    return {
      isLocked: devOverrideDays > 0,
      daysRemaining: Math.max(0, devOverrideDays),
    };
  }

  if (!nameChangedAt) {
    return { isLocked: false, daysRemaining: 0 };
  }

  const changedMs = new Date(nameChangedAt).getTime();
  if (isNaN(changedMs)) {
    return { isLocked: false, daysRemaining: 0 };
  }

  const nowMs = Date.now();
  // 6 months in milliseconds (~182.5 days)
  const lockDurationMs = NAME_CHANGE_LOCK_MONTHS * 30.4375 * 24 * 60 * 60 * 1000;
  const unlockDateMs = changedMs + lockDurationMs;
  const remainingMs = unlockDateMs - nowMs;

  if (remainingMs > 0) {
    const daysRemaining = Math.ceil(remainingMs / (24 * 60 * 60 * 1000));
    return { isLocked: true, daysRemaining };
  }

  return { isLocked: false, daysRemaining: 0 };
}

// ─────────────────────────────────────────────────────────────────────────────
// PREVIEW SCREEN HELPERS & FORMATTERS (Prompt 2)
// ─────────────────────────────────────────────────────────────────────────────

interface ParsedTimeComponents {
  hour: number;
  minute: number;
  period: 'am' | 'pm';
}

function parseTimeComponents(tStr: string): ParsedTimeComponents | null {
  const match = tStr.trim().toLowerCase().match(/^(\d{1,2})(?::(\d{1,2}))?\s*(am|pm)$/);
  if (!match) return null;
  const hour = parseInt(match[1], 10);
  const minute = match[2] ? parseInt(match[2], 10) : 0;
  const period = match[3] as 'am' | 'pm';
  return { hour, minute, period };
}

function formatSingleClientTime(t: ParsedTimeComponents, showMinutes: boolean): string {
  if (showMinutes) {
    const minStr = t.minute.toString().padStart(2, '0');
    return `${t.hour}:${minStr}${t.period}`;
  }
  return `${t.hour}${t.period}`;
}

/**
 * Formats operating hours for clients (Preview screen).
 * Rule: "8am - 12am" (no minutes when both are :00, "9:30am - 9:00pm" otherwise).
 * Handles:
 * - "8:00am - 12:00am" -> "8am - 12am"
 * - "8am - 12am" -> "8am - 12am"
 * - "9:30am - 9:00pm" -> "9:30am - 9:00pm"
 * - "12:00am - 12:00pm" -> "12am - 12pm"
 */
export function formatHoursForClients(range?: string | null): string {
  if (!range || !range.trim()) return '';
  const trimmed = range.trim();
  const parts = trimmed.split(/\s*-\s*/);
  if (parts.length < 2) {
    const parsed = parseTimeComponents(parts[0]);
    return parsed ? formatSingleClientTime(parsed, parsed.minute !== 0) : trimmed;
  }

  const openParsed = parseTimeComponents(parts[0]);
  const closeParsed = parseTimeComponents(parts[1]);

  if (!openParsed || !closeParsed) {
    return trimmed;
  }

  // If both have 00 minutes (or no minutes), omit minutes completely
  const bothZeroMinutes = openParsed.minute === 0 && closeParsed.minute === 0;

  if (bothZeroMinutes) {
    return `${formatSingleClientTime(openParsed, false)} - ${formatSingleClientTime(closeParsed, false)}`;
  }

  // Otherwise, format both with two-digit minutes e.g. "9:30am - 9:00pm"
  return `${formatSingleClientTime(openParsed, true)} - ${formatSingleClientTime(closeParsed, true)}`;
}

export const WEEKDAYS_ORDER = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const;

/**
 * Formats operating days for clients (Preview screen).
 * Rule:
 * - "Monday - Sunday" for all seven days
 * - ranges for a contiguous run ("Monday - Wednesday", "Friday - Monday")
 * - single day for 1 day ("Monday")
 * - comma list otherwise ("Monday, Thursday, Sunday")
 */
export function formatDaysForClients(input?: string[] | string | null): string {
  if (!input) return '';
  let days: string[] = [];
  if (Array.isArray(input)) {
    days = input.map((d) => d.trim()).filter(Boolean);
  } else {
    const raw = input.trim();
    if (!raw) return '';
    // If input already contains a dash range like "Monday - Sunday" or "Monday - Wednesday"
    if (raw.includes(' - ')) {
      const parts = raw.split(/\s*-\s*/);
      if (parts.length === 2) {
        const startIdx = WEEKDAYS_ORDER.indexOf(parts[0] as any);
        const endIdx = WEEKDAYS_ORDER.indexOf(parts[1] as any);
        if (startIdx !== -1 && endIdx !== -1) {
          if (startIdx <= endIdx) {
            days = (WEEKDAYS_ORDER.slice(startIdx, endIdx + 1) as unknown) as string[];
          } else {
            // wrap-around e.g. Friday to Monday
            days = [
              ...WEEKDAYS_ORDER.slice(startIdx),
              ...WEEKDAYS_ORDER.slice(0, endIdx + 1),
            ] as any;
          }
        }
      }
    }
    if (days.length === 0) {
      days = raw
        .replace(/\s+and\s+/i, ', ')
        .split(/,\s*/)
        .map((d) => d.trim())
        .filter(Boolean);
    }
  }

  // Deduplicate
  const uniqueDays = Array.from(new Set(days));
  if (uniqueDays.length === 0) return '';
  if (uniqueDays.length === 7) return 'Monday - Sunday';
  if (uniqueDays.length === 1) return uniqueDays[0];

  // Check for contiguous run (including circular wrap-around e.g. Friday to Monday)
  const count = uniqueDays.length;
  const validDays = uniqueDays.every((d) => WEEKDAYS_ORDER.includes(d as any));
  if (validDays && count >= 2 && count <= 6) {
    for (let s = 0; s < 7; s++) {
      const candidate: string[] = [];
      for (let i = 0; i < count; i++) {
        candidate.push(WEEKDAYS_ORDER[(s + i) % 7]);
      }
      const matchesAll = candidate.every((d) => uniqueDays.includes(d));
      if (matchesAll) {
        const startDay = WEEKDAYS_ORDER[s];
        const endDay = WEEKDAYS_ORDER[(s + count - 1) % 7];
        return `${startDay} - ${endDay}`;
      }
    }
  }

  // Non-contiguous / scattered list: return compact abbreviated list (e.g. "Mon, Thu, Sun")
  // so it fits comfortably on a single row in preview and cards without wrapping or creating empty voids
  const shortMap: Record<string, string> = {
    Monday: 'Mon',
    Tuesday: 'Tue',
    Wednesday: 'Wed',
    Thursday: 'Thu',
    Friday: 'Fri',
    Saturday: 'Sat',
    Sunday: 'Sun',
  };
  return uniqueDays.map((d) => shortMap[d] || d).join(', ');
}

/**
 * Formats price for preview screen with exactly 2 decimal places.
 * Example: 13750 -> "₦13,750.00"
 */
export function formatPreviewPrice(amount: number): string {
  const parts = Math.abs(amount).toFixed(2).split('.');
  const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const sign = amount < 0 ? '-' : '';
  return `${sign}₦${intPart}.${parts[1]}`;
}

// ── Pure Unit Asserts (executed at load time to guarantee correctness) ──
function runAssertions() {
  // formatTimeRange
  console.assert(
    formatTimeRange('9:00am', '9:00pm') === '9:00am - 9:00pm',
    'formatTimeRange failed basic pair'
  );
  console.assert(
    formatTimeRange('9:00am - 9:00pm') === '9:00am - 9:00pm',
    'formatTimeRange failed idempotency'
  );

  // parseTimeRange
  const parsed = parseTimeRange('9:00am - 9:00pm');
  console.assert(parsed.open === '9:00am' && parsed.close === '9:00pm', 'parseTimeRange failed');

  // formatDays
  console.assert(
    formatDays(['Monday', 'Thursday', 'Sunday']) === 'Monday, Thursday, Sunday',
    'formatDays array failed'
  );

  // diffBusinessProfile
  const sampleA: EditableBusinessProfile = {
    businessName: 'Luminous Lux',
    operatingHours: '9:00am - 9:00pm',
    operatingDays: 'Monday - Friday',
    address: 'Street 11',
    country: 'Nigeria',
    countryCode: '+234',
    state: 'F.C.T Abuja',
    gender: 'Unisex',
  };
  const sampleB = { ...sampleA, businessName: 'Luminous Care' };
  const diffs = diffBusinessProfile(sampleA, sampleB);
  console.assert(diffs.length === 1 && diffs[0] === 'businessName', 'diffBusinessProfile failed');

  // ── Prompt 2 Asserts: formatHoursForClients ──
  // 1. Both :00 minutes -> no minutes
  console.assert(
    formatHoursForClients('8:00am - 12:00am') === '8am - 12am',
    'formatHoursForClients 8:00am - 12:00am failed'
  );
  console.assert(
    formatHoursForClients('8am - 12am') === '8am - 12am',
    'formatHoursForClients 8am - 12am failed'
  );
  // 2. Midnight and noon
  console.assert(
    formatHoursForClients('12:00am - 12:00pm') === '12am - 12pm',
    'formatHoursForClients midnight to noon failed'
  );
  // 3. :30 minutes -> formats with minutes on both
  console.assert(
    formatHoursForClients('9:30am - 9:00pm') === '9:30am - 9:00pm',
    'formatHoursForClients 9:30am - 9:00pm failed'
  );
  console.assert(
    formatHoursForClients('8:00am - 8:30pm') === '8:00am - 8:30pm',
    'formatHoursForClients 8:00am - 8:30pm failed'
  );

  // ── Prompt 2 Asserts: formatDaysForClients ──
  // 1. All days
  console.assert(
    formatDaysForClients(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']) === 'Monday - Sunday',
    'formatDaysForClients all days failed'
  );
  console.assert(
    formatDaysForClients('Monday - Sunday') === 'Monday - Sunday',
    'formatDaysForClients string all days failed'
  );
  // 2. One day
  console.assert(
    formatDaysForClients(['Monday']) === 'Monday',
    'formatDaysForClients single day failed'
  );
  // 3. Contiguous run
  console.assert(
    formatDaysForClients(['Monday', 'Tuesday', 'Wednesday']) === 'Monday - Wednesday',
    'formatDaysForClients contiguous run failed'
  );
  console.assert(
    formatDaysForClients(['Tuesday', 'Wednesday', 'Thursday', 'Friday']) === 'Tuesday - Friday',
    'formatDaysForClients Tuesday - Friday failed'
  );
  // 4. Wrap-around (Friday to Monday)
  console.assert(
    formatDaysForClients(['Friday', 'Saturday', 'Sunday', 'Monday']) === 'Friday - Monday',
    'formatDaysForClients wrap-around Friday to Monday failed'
  );
  // 5. Scattered list (not contiguous)
  console.assert(
    formatDaysForClients(['Monday', 'Thursday', 'Sunday']) === 'Mon, Thu, Sun',
    'formatDaysForClients scattered list failed'
  );

  // ── Prompt 2 Asserts: formatPreviewPrice ──
  console.assert(
    formatPreviewPrice(13750) === '₦13,750.00',
    'formatPreviewPrice 13750 failed'
  );
  console.assert(
    formatPreviewPrice(14200) === '₦14,200.00',
    'formatPreviewPrice 14200 failed'
  );
  console.assert(
    formatPreviewPrice(0) === '₦0.00',
    'formatPreviewPrice 0 failed'
  );
}

runAssertions();

