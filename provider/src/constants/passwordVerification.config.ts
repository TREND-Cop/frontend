/**
 * Dev-only test switches and configuration for Password Change and Shared Account Verification.
 * All dev switches default to OFF (null / false / empty) in production.
 */

// Dev-only simulated email on file (set to e.g. 'Saulgoodman@gmail.com' to simulate email variant)
export const DEV_SAMPLE_EMAIL: string | null = null;

// Dev-only hide phone on file (set to true along with DEV_SAMPLE_EMAIL to test email-only variant)
export const DEV_HIDE_PHONE: boolean = false;

// Dev-only array of passwords that trigger "Incorrect password input" error on Current Password field
export const DEV_WRONG_CURRENT_PASSWORDS: string[] = [];

// Dev-only array of phone numbers (10 digits) that trigger "Phone number is incorrect or already exists" error
export const DEV_TAKEN_PHONES: string[] = [];

// Dev-only array of gmail addresses that trigger "Incorrect gmail address" error
export const DEV_REJECTED_GMAILS: string[] = [];

// Dev-only switch to force OTP verification to return failure
export const DEV_OTP_ALWAYS_FAIL: boolean = false;

// Countdown duration for OTP resend (seconds)
export const VERIFICATION_OTP_RESEND_COUNTDOWN = 65; // 1:05
