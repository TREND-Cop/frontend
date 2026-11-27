/**
 * Trend Business — Staff Work Photos Configuration & Dev Seeding
 */

export type StaffPhotoApprovalStatus = 'pending' | 'approved' | 'declined';

export interface StaffWorkPhoto {
  id: string;
  uri: any;
  isNew?: boolean;
  approvalStatus: StaffPhotoApprovalStatus;
  createdAt: string;
}

/**
 * Dev-only toggle: when true, preloads 4 sample haircut photos in the staff grid.
 * STRICT DEFAULT: false (starts empty per prompt specification).
 */
export const DEV_SAMPLE_STAFF_WORK_PHOTOS = false;

/**
 * Dev-only toggle: controls the initial approval status assigned to new uploads by staff.
 * Options: 'pending' | 'approved' | 'declined'
 * STRICT DEFAULT: 'pending' (per prompt specification: all new staff uploads start pending owner approval).
 */
export const DEV_STAFF_UPLOAD_STATUS: StaffPhotoApprovalStatus = 'pending';

/**
 * Auto-redirect delay (ms) on successful upload before returning to Post Work grid.
 */
export const POST_WORK_SUCCESS_REDIRECT_MS = 3000;

// Sample haircut asset matching Figma frames S1-S3
const SAMPLE_HAIRCUT_IMAGE = require('../../assets/images/appointments/hair_cut.jpg');

export const INITIAL_DEV_STAFF_PHOTOS: StaffWorkPhoto[] = [
  {
    id: 'staff-sample-1',
    uri: SAMPLE_HAIRCUT_IMAGE,
    isNew: false,
    approvalStatus: 'approved',
    createdAt: '2026-03-12T10:00:00.000Z',
  },
  {
    id: 'staff-sample-2',
    uri: SAMPLE_HAIRCUT_IMAGE,
    isNew: false,
    approvalStatus: 'approved',
    createdAt: '2026-03-12T10:05:00.000Z',
  },
  {
    id: 'staff-sample-3',
    uri: SAMPLE_HAIRCUT_IMAGE,
    isNew: false,
    approvalStatus: 'pending',
    createdAt: '2026-03-12T10:10:00.000Z',
  },
  {
    id: 'staff-sample-4',
    uri: SAMPLE_HAIRCUT_IMAGE,
    isNew: false,
    approvalStatus: 'pending',
    createdAt: '2026-03-12T10:15:00.000Z',
  },
];
