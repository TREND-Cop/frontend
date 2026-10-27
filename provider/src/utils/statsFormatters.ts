/**
 * Trend Business — Stats Formatters
 *
 * Pure formatter functions for Business Statistics:
 * - formatPeriodLabel: formats StatsPeriod into Figma 1:1 strings
 *   day -> "Monday 17 May, 2026"
 *   year -> "2026"
 * - formatNaira: "₦500,200", thousands separators, decimals only when present
 * - formatPercent: "5.2%"
 * - formatCount: "56"
 */

import { StatsPeriod } from '../context/StatsContext';

const WEEKDAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

/**
 * Formats a StatsPeriod into the exact Figma specification:
 * - day: "Monday 17 May, 2026" (full weekday, day, full month, comma, year)
 * - year: "2026"
 */
export function formatPeriodLabel(period: StatsPeriod): string {
  if (!period) return '';
  if (period.kind === 'year') {
    return `${period.year}`;
  }

  const d = period.date;
  const weekday = WEEKDAYS[d.getDay()];
  const day = d.getDate();
  const month = MONTHS[d.getMonth()];
  const year = d.getFullYear();

  return `${weekday} ${day} ${month}, ${year}`;
}

/**
 * Formats an amount in Naira (₦) with thousands separators.
 * Omits decimals unless the value has fractional decimals.
 * Examples:
 *   500200 -> "₦500,200"
 *   60200  -> "₦60,200"
 *   14200.5 -> "₦14,200.50"
 */
export function formatNaira(amount: number): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '₦0';
  }
  const hasDecimals = amount % 1 !== 0;
  const formatted = hasDecimals
    ? amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : amount.toLocaleString('en-US', { maximumFractionDigits: 0 });

  return `₦${formatted}`;
}

/**
 * Formats a percentage value into string with '%' suffix.
 * Examples:
 *   5.2 -> "5.2%"
 *   "5.2%" -> "5.2%"
 */
export function formatPercent(percent: number | string): string {
  if (percent === undefined || percent === null) return '0%';
  if (typeof percent === 'string') {
    return percent.endsWith('%') ? percent : `${percent}%`;
  }
  return `${percent}%`;
}

/**
 * Formats a count number with comma separators.
 * Examples:
 *   56 -> "56"
 *   1250 -> "1,250"
 */
export function formatCount(count: number): string {
  if (count === undefined || count === null || isNaN(count)) return '0';
  return count.toLocaleString('en-US');
}
