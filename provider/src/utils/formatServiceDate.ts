/**
 * Formats a Date object or ISO string into the design's date format:
 * e.g. "11th 03, 2026"
 * 
 * Provides:
 * 1. formatServiceDateParts(date): structured parts for transform-free superscript rendering.
 * 2. formatServiceDate(date): plain formatted string.
 */

export interface ServiceDateParts {
  day: number;
  ordinal: string;
  monthString: string;
  year: number;
}

/**
 * Returns the ordinal suffix for a given day of the month (1st, 2nd, 3rd, 4th, 11th, 21st, etc.)
 */
export function getOrdinalSuffix(day: number): string {
  if (day >= 11 && day <= 13) {
    return 'th';
  }
  switch (day % 10) {
    case 1:
      return 'st';
    case 2:
      return 'nd';
    case 3:
      return 'rd';
    default:
      return 'th';
  }
}

/**
 * Parses date input into structured parts for React Native rendering with superscript ordinal.
 */
export function formatServiceDateParts(dateInput: Date | string | number): ServiceDateParts {
  const d = dateInput instanceof Date ? dateInput : new Date(dateInput);
  
  // Guard against invalid dates
  if (isNaN(d.getTime())) {
    return {
      day: 1,
      ordinal: 'st',
      monthString: '01',
      year: new Date().getFullYear(),
    };
  }

  const day = d.getDate();
  const month = d.getMonth() + 1; // 1-indexed month (01 - 12)
  const monthString = month < 10 ? `0${month}` : `${month}`;
  const year = d.getFullYear();
  const ordinal = getOrdinalSuffix(day);

  return {
    day,
    ordinal,
    monthString,
    year,
  };
}

/**
 * Returns plain string representation: e.g. "11th 03, 2026"
 */
export function formatServiceDate(dateInput: Date | string | number): string {
  const { day, ordinal, monthString, year } = formatServiceDateParts(dateInput);
  return `${day}${ordinal} ${monthString}, ${year}`;
}

export default formatServiceDate;
