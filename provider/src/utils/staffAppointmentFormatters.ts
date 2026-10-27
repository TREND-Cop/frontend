/**
 * Formatting utilities for Staff Appointments (list banners & countdowns)
 */

export interface AppointmentCountdownState {
  type: 'later_date' | 'future_today' | 'waiting_to_start';
  label: string;
  timerString?: string;
}

/**
 * Calculates the banner state and live countdown/countup timer for an appointment.
 */
export function getAppointmentBannerState(
  startTime: number,
  isLaterDate: boolean = false,
  dateString?: string,
  now: number = Date.now()
): AppointmentCountdownState {
  if (isLaterDate) {
    // Fixed: cleaned double spaces and trailing periods
    const cleanDate = dateString?.replace(/\s+/g, ' ').replace(/\.$/, '') || '';
    return {
      type: 'later_date',
      label: `Starts in ${cleanDate}`,
    };
  }

  const diffMs = startTime - now;

  if (diffMs > 0) {
    // Starts later today: whole hours remaining and countdown
    const diffSec = Math.floor(diffMs / 1000);
    const wholeHours = Math.floor(diffSec / 3600);
    const hrs = Math.floor(diffSec / 3600);
    const mins = Math.floor((diffSec % 3600) / 60);
    const secs = diffSec % 60;

    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
    const timerString = `${hrs}:${pad(mins)}:${pad(secs)}`;

    return {
      type: 'future_today',
      label: `Starting in ${wholeHours}hrs time`,
      timerString,
    };
  }

  // Start time reached: counting up from 0:00:00
  const elapsedSec = Math.max(0, Math.floor((now - startTime) / 1000));
  const hrs = Math.floor(elapsedSec / 3600);
  const mins = Math.floor((elapsedSec % 3600) / 60);
  const secs = elapsedSec % 60;

  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  const timerString = `${hrs}:${pad(mins)}:${pad(secs)}`;

  return {
    type: 'waiting_to_start',
    label: 'Waiting for client to start',
    timerString,
  };
}

/**
 * Formats price in Naira with comma separation. E.g. 22700 -> "₦22,700"
 */
export function formatNaira(amount: number): string {
  return `₦${amount.toLocaleString()}`;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const MONTH_NAMES_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

/**
 * Formats a Date object or ms timestamp to "D MMMM, YYYY" (e.g. "8 June, 2026").
 */
export function formatHistoryDate(input: Date | number): string {
  const d = typeof input === 'number' ? new Date(input) : input;
  return `${d.getDate()} ${MONTH_NAMES[d.getMonth()]}, ${d.getFullYear()}`;
}

/**
 * Formats a Date object or ms timestamp to short format "D MMM, YYYY" (e.g. "Nov 19, 2026").
 */
export function formatDetailDate(input: Date | number): string {
  const d = typeof input === 'number' ? new Date(input) : input;
  return `${MONTH_NAMES_SHORT[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

/**
 * Formats a Date object or ms timestamp to 12-hour time "h:mma" (e.g. "9:30am").
 */
export function formatAppointmentTime(input: Date | number): string {
  const d = typeof input === 'number' ? new Date(input) : input;
  let hours = d.getHours();
  const minutes = d.getMinutes();
  const ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 becomes 12
  const minStr = minutes < 10 ? `0${minutes}` : `${minutes}`;
  return `${hours}:${minStr}${ampm}`;
}

/**
 * Formats duration in seconds to "h:mm:ss" or "hh:mm:ss". Defaults to "00:00:00" if 0 or unknown.
 */
export function formatDurationHMS(totalSeconds?: number): string {
  if (!totalSeconds || totalSeconds <= 0) return '00:00:00';
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = Math.floor(totalSeconds % 60);
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
}

