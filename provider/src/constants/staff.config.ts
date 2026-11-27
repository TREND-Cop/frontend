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
export const DEV_SAMPLE_STAFF = true;

/**
 * Mock duration (ms) for skeleton loader on screen entry (800-1200ms per spec)
 */
export const STAFF_SKELETON_MS = 1000;
export const STAFF_DETAIL_SKELETON_MS = 1000;

// TODO (Asset): Export final sample portfolio images from Figma
const SAMPLE_PORTFOLIO_1 = require('../../assets/images/portfolio/staff_portfolio_1.png');
const SAMPLE_PORTFOLIO_2 = require('../../assets/images/portfolio/staff_portfolio_2.png');
const SAMPLE_PORTFOLIO_3 = require('../../assets/images/portfolio/staff_portfolio_3.png');
const SAMPLE_PORTFOLIO_4 = require('../../assets/images/portfolio/staff_portfolio_4.png');

const ANNABELLE_HEADSHOT = require('../../assets/images/staff/annabelle_gideon.png');
const UDOKA_HEADSHOT = require('../../assets/images/profile/gavin_nwosis_avatar.png');

/**
 * Design sample staff data from Figma frames:
 * - staff_1: Unverified member (matches D1: banner, 'Not Verified', 4 portfolio photos with 1st 'New' tag, matches P2-P4)
 * - staff_2: Verified member (matches D2: blue badge, no banner, 0 portfolio photos, matches P1 empty state)
 */
export const MOCK_SAMPLE_STAFF: StaffMember[] = [
  {
    id: 'staff_1',
    name: 'Annabelle Gideon',
    photoUri: ANNABELLE_HEADSHOT as any,
    avatarUri: ANNABELLE_HEADSHOT as any,
    roles: ['Nail Artist', 'Barber'],
    role: 'Nail Artist',
    experienceYears: 5,
    yearsExperience: 5,
    workHours: { start: '7:30am', end: '9:30pm' },
    breakHours: { start: '7:30am', end: '9:30pm' },
    workDays: ['Monday', 'Wednesday', 'Friday'],
    loginCode: '1234',
    isVerified: false,
    portfolio: [
      { id: 'photo_1', uri: SAMPLE_PORTFOLIO_1, isNew: true },
      { id: 'photo_2', uri: SAMPLE_PORTFOLIO_2, isNew: false },
      { id: 'photo_3', uri: SAMPLE_PORTFOLIO_3, isNew: false },
      { id: 'photo_4', uri: SAMPLE_PORTFOLIO_4, isNew: false },
    ],
  },
  {
    id: 'staff_2',
    name: 'Udoka Oyemechi',
    photoUri: UDOKA_HEADSHOT as any,
    avatarUri: UDOKA_HEADSHOT as any,
    roles: ['Nail Artist'],
    role: 'Nail Artist',
    experienceYears: 3,
    yearsExperience: 3,
    workHours: { start: '8:00am', end: '6:00pm' },
    breakHours: null,
    workDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    loginCode: '1234',
    isVerified: true,
    portfolio: [],
  },
  {
    id: 'staff_3',
    name: 'Godwill Thomas',
    photoUri: require('../../assets/images/profile/godwin_profile_avatar.png'),
    avatarUri: require('../../assets/images/profile/godwin_profile_avatar.png'),
    roles: ['Nail Specialist', 'Barber'],
    role: 'Nail Specialist',
    experienceYears: 4,
    yearsExperience: 4,
    workHours: { start: '8:00am', end: '9:00pm' },
    breakHours: null,
    workDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    loginCode: '1234',
    isVerified: true,
    portfolio: [],
  },
];

