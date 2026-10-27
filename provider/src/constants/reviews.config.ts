/**
 * Trend Business — Reviews Configuration & Dev Seeding
 *
 * TODO (Backend): Shape to confirm with backend schema
 */

export interface ReviewClient {
  name: string;
  photoUri: string | any | null;
  isVerified: boolean;
}

export interface ReviewReply {
  text: string;
  createdAt: string;
}

export interface Review {
  id: string;
  client: ReviewClient;
  text: string;
  images: any[];
  createdAt: string;
  reply?: ReviewReply;
}

/**
 * Dev-only constant controlling whether sample reviews are seeded.
 * Default is strictly false. Set to true to test the 4 design reviews.
 */
export const DEV_SAMPLE_REVIEWS = true;

/**
 * Mock duration (ms) for skeleton loader on screen entry (800-1200ms per spec)
 */
export const CLIENTS_REVIEW_SKELETON_MS = 1000;

/**
 * Mock duration (ms) for post reply action (600-1000ms per spec)
 */
export const POST_REPLY_MOCK_MS = 750;

/**
 * Duration (ms) for "Comment posted" toast notification (default: 2500ms)
 */
export const COMMENT_TOAST_MS = 2500;

/**
 * Mock duration (ms) for report review submission (1000-1500ms per spec)
 */
export const REPORT_SUBMIT_MOCK_MS = 1200;

/**
 * Mock duration (ms) for 4-dot loader when returning to dashboard from Report Success (800-1200ms per spec)
 */
export const REPORT_RETURN_LOADER_MS = 1000;

/**
 * Report review submission payload
 * TODO (Backend): confirm schema with backend
 */
export interface ReportSubmission {
  reviewId: string;
  title: string;
  report: string;
  images: string[];
  createdAt?: string;
}

// ── Sample Assets for Mock Reviews ──
const SAMPLE_PHOTO_1 = require('../../assets/images/portfolio/staff_portfolio_1.png');
const SAMPLE_PHOTO_2 = require('../../assets/images/portfolio/staff_portfolio_2.png');
const SAMPLE_PHOTO_3 = require('../../assets/images/portfolio/staff_portfolio_3.png');

const SAMPLE_AVATAR_1 = require('../../assets/images/appointments/jude_fabulous.png');
const SAMPLE_AVATAR_2 = require('../../assets/images/profile/gavin_nwosis_avatar.png');
const SAMPLE_AVATAR_3 = require('../../assets/images/profile/godwin_profile_avatar.png');

/**
 * Design sample reviews from Figma frame L1 & component variants:
 * 1. Plain review (no reply, Reply button visible)
 * 2. Plain review with distinct feedback
 * 3. Review with threaded business reply (Reply button hidden)
 * 4. Review with 3 photo thumbnails
 */
export const MOCK_SAMPLE_REVIEWS: Review[] = [
  {
    id: 'review_1',
    client: {
      name: 'Dammy Samson',
      photoUri: SAMPLE_AVATAR_1,
      isVerified: true,
    },
    text: 'The service was great...',
    images: [],
    createdAt: '2026-03-12T12:32:00.000Z',
  },
  {
    id: 'review_2',
    client: {
      name: 'Gavin Nwosi',
      photoUri: SAMPLE_AVATAR_2,
      isVerified: true,
    },
    text: 'The service was great... Loved the clean setup and attention to detail.',
    images: [],
    createdAt: '2026-03-12T10:15:00.000Z',
  },
  {
    id: 'review_3',
    client: {
      name: 'Samuel Obanuju',
      photoUri: SAMPLE_AVATAR_3,
      isVerified: true,
    },
    text: 'The service was fire',
    images: [],
    createdAt: '2026-03-11T14:20:00.000Z',
    reply: {
      text: 'Thanks for your feedback, we look forward to having you use our salon again.... Please go to luminous lux page and send us a message',
      createdAt: '2026-03-11T15:35:00.000Z',
    },
  },
  {
    id: 'review_4',
    client: {
      name: 'Dammy Samson',
      photoUri: SAMPLE_AVATAR_1,
      isVerified: true,
    },
    text: 'These cuts are fire',
    images: [SAMPLE_PHOTO_1, SAMPLE_PHOTO_2, SAMPLE_PHOTO_3],
    createdAt: '2026-03-10T09:40:00.000Z',
  },
];
