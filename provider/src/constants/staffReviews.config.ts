/**
 * Trend Business — Staff Reviews Configuration & Dev Seeding
 *
 * Provides isolated mock data and configuration for the staff member's read-only reviews.
 */

import { Review } from './reviews.config';

/**
 * Dev-only constant controlling whether sample reviews are seeded for staff.
 * Default is strictly false. Set to true to test the Figma frame reviews.
 */
export const DEV_SAMPLE_STAFF_REVIEWS = true;

// ── Sample Assets for Mock Reviews ──
const SAMPLE_PHOTO_1 = require('../../assets/images/portfolio/staff_portfolio_1.png');
const SAMPLE_PHOTO_2 = require('../../assets/images/portfolio/staff_portfolio_2.png');
const SAMPLE_PHOTO_3 = require('../../assets/images/portfolio/staff_portfolio_3.png');

const SAMPLE_AVATAR_1 = require('../../assets/images/appointments/jude_fabulous.png');

/**
 * 4 design reviews matching Figma frame "review and comment" (390×1269):
 * 1. Plain review (Dammy Samson, unverified, "The service was great...")
 * 2. Plain review (Dammy Samson, unverified, "The service was great...")
 * 3. Verified review with business reply ("The service was fire" + reply from Luminous Lux)
 * 4. Verified review with 3 photo thumbnails ("These cuts are fire" + 3 thumbnails)
 */
export const MOCK_SAMPLE_STAFF_REVIEWS: Review[] = [
  {
    id: 'staff_review_1',
    client: {
      name: 'Dammy Samson',
      photoUri: SAMPLE_AVATAR_1,
      isVerified: false,
    },
    text: 'The service was great...',
    images: [],
    createdAt: '2026-03-12T12:32:00.000Z',
  },
  {
    id: 'staff_review_2',
    client: {
      name: 'Dammy Samson',
      photoUri: SAMPLE_AVATAR_1,
      isVerified: false,
    },
    text: 'The service was great...',
    images: [],
    createdAt: '2026-03-12T12:32:00.000Z',
  },
  {
    id: 'staff_review_3',
    client: {
      name: 'Dammy Samson',
      photoUri: SAMPLE_AVATAR_1,
      isVerified: true,
    },
    text: 'The service was fire',
    images: [],
    createdAt: '2026-03-12T12:32:00.000Z',
    reply: {
      text: 'Thanks for your feedback, we look forward to having you use our salon again.... Please go to luminous lux page and send us a message',
      createdAt: '2026-03-12T12:32:00.000Z',
    },
  },
  {
    id: 'staff_review_4',
    client: {
      name: 'Dammy Samson',
      photoUri: SAMPLE_AVATAR_1,
      isVerified: true,
    },
    text: 'These cuts are fire',
    images: [SAMPLE_PHOTO_1, SAMPLE_PHOTO_2, SAMPLE_PHOTO_3],
    createdAt: '2026-03-12T12:32:00.000Z',
  },
];
