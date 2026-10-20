/**
 * Shared validation rules and stubs for Trend Business (provider app).
 *
 * TODO (Backend): Keep these in sync with server-side validation policies.
 * When Supabase/backend phone auth is enabled, connect checkPhoneExists
 * to a real API endpoint.
 */

export const PASSWORD_RULES = {
  minLength: 8,
  requiresNumber: false,
};

/**
 * Validates password: must meet minimum length of 8 characters.
 * Short passwords like '1112' (4 chars) will fail and trigger "Incorrect password input".
 */
export const isPasswordValid = (password: string): boolean => {
  if (!password || password.length < PASSWORD_RULES.minLength) return false;
  if (PASSWORD_RULES.requiresNumber && !/\d/.test(password)) return false;
  return true;
};

/**
 * Validates phone numbers: digits only, 7 to 15 digits (standard E.164 length).
 */
export const isPhoneValid = (phone: string): boolean => {
  const digitsOnly = phone.replace(/\D/g, '');
  return digitsOnly.length >= 7 && digitsOnly.length <= 15;
};

/**
 * Checks if a phone number already exists in the system.
 *
 * TODO (Backend): Mock behavior for testing error state in design frame 5.
 * Returns true for '08110783610' (the exact phone number in Figma error frame).
 * Replace with actual backend API call once phone authentication is wired.
 */
export const checkPhoneExists = (phone: string): boolean => {
  const digitsOnly = phone.replace(/\D/g, '');
  // Matches '08110783610', '+2348110783610', or '8110783610'
  return digitsOnly.endsWith('8110783610') || digitsOnly === '08110783610';
};
