/**
 * Staff Management Configuration & Dev Seeding
 *
 * TODO (Backend): shape to confirm with backend schema
 */

import { StaffMember } from '../context/StaffContext';

/**
 * DEV_SAMPLE_STAFF flag:
 * Set to `false` (default) to test the "No Staff Found" empty state (M1 / M2).
 * Set to `true` to test the Staff List with existing staff (M3).
 */
export const DEV_SAMPLE_STAFF = false;

/**
 * Mock duration (ms) for skeleton loader on screen entry (800-1200ms per spec)
 */
export const STAFF_SKELETON_MS = 1000;

/**
 * Design sample staff data from Figma frames:
 * - Annabelle Gideon (Barber, 5 years Experience)
 * - Udoka Oyemechi (Barber, 5 years Experience)
 */
export const MOCK_SAMPLE_STAFF: StaffMember[] = [
  {
    id: 'staff_1',
    name: 'Annabelle Gideon',
    photoUri: null,
    avatarUri: null,
    roles: ['Barber'],
    role: 'Barber',
    experienceYears: 5,
    yearsExperience: 5,
    workHours: { start: '9:00am', end: '7:00pm' },
    breakHours: { start: '12:00pm', end: '1:00pm' },
    workDays: ['Monday', 'Wednesday', 'Sunday'],
    loginCode: '123456',
    isVerified: true,
  },
  {
    id: 'staff_2',
    name: 'Udoka Oyemechi',
    photoUri: null,
    avatarUri: null,
    roles: ['Barber'],
    role: 'Barber',
    experienceYears: 5,
    yearsExperience: 5,
    workHours: { start: '9:00am', end: '7:00pm' },
    breakHours: { start: '1:00pm', end: '2:00pm' },
    workDays: ['Tuesday', 'Thursday', 'Saturday'],
    loginCode: '654321',
    isVerified: true,
  },
];
