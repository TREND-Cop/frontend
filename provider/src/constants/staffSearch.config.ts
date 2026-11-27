import { StaffMember } from '../context/StaffContext';

export interface RecentSearchStaffItem {
  id: string;
  staffId: string;
  name: string;
  role: string;
  hours: string;
  avatar: any;
  rating: string;
  timestamp: number;
}

/**
 * Initial sample recent searches seeded for demonstration.
 */
export const INITIAL_RECENT_SEARCHES: RecentSearchStaffItem[] = [
  {
    id: 'recent_1',
    staffId: 'staff_1',
    name: 'Godwill Thomas',
    role: 'Nail Artist',
    hours: '8am - 10pm',
    avatar: require('../../assets/images/profile/godwin_profile_avatar.png'),
    rating: '4.1',
    timestamp: Date.now() - 3600000,
  },
  {
    id: 'recent_2',
    staffId: 'staff_2',
    name: 'Ibrahim Musa',
    role: 'Barber',
    hours: '9am - 8pm',
    avatar: require('../../assets/images/profile/gavin_nwosis_avatar.png'),
    rating: '4.5',
    timestamp: Date.now() - 7200000,
  },
];

/**
 * Simple string distance helper (Levenshtein distance) for fuzzy matching.
 */
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

/**
 * Finds a "Do you mean" suggestion among staff members if user typed a close typo.
 */
export function findSuggestedStaffName(
  query: string,
  staffList: StaffMember[]
): string | null {
  const cleanQuery = query.trim().toLowerCase();
  if (cleanQuery.length < 3) return null;

  // If already directly matches someone, no suggestion needed
  const hasExact = staffList.some(
    (s) =>
      s.name.toLowerCase().includes(cleanQuery) ||
      (s.role && s.role.toLowerCase().includes(cleanQuery))
  );
  if (hasExact) return null;

  let bestMatch: string | null = null;
  let minDistance = 4; // Max allowed distance

  for (const staff of staffList) {
    const fullName = staff.name.toLowerCase();
    const parts = fullName.split(' ');

    // Check full name distance
    const distFull = levenshteinDistance(cleanQuery, fullName);
    if (distFull < minDistance) {
      minDistance = distFull;
      bestMatch = staff.name;
    }

    // Check each name part (first name, last name)
    for (const part of parts) {
      const distPart = levenshteinDistance(cleanQuery, part);
      if (distPart <= 2 && distPart < minDistance) {
        minDistance = distPart;
        bestMatch = staff.name;
      }
    }
  }

  return bestMatch;
}

