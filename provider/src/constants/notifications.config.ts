/**
 * Dev-only test switches and configuration for Notifications (Prompt 5).
 * All dev switches default to OFF (false / empty) in production.
 */

// Dev-only switch to seed sample notifications (Anna media approval, hospital, etc.)
export const DEV_SAMPLE_NOTIFICATIONS: boolean = false;

// Mock durations for approve and decline animations (in milliseconds)
export const APPROVE_PROGRESS_DURATION_MS = 1200;
export const DECLINE_PROGRESS_DURATION_MS = 1200;
export const SUCCESS_TOAST_AUTO_DISMISS_MS = 2500;
export const AUTO_REDIRECT_DELAY_MS = 1500;
export const APPROVE_REDIRECT_DELAY_MS = 1500;
export const DECLINE_REDIRECT_DELAY_MS = 1500;
