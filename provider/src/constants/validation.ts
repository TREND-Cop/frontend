/**
 * Shared validation rules and stubs for Trend Business (provider app).
 *
 * TODO (Backend): Keep these in sync with server-side validation policies.
 * When Supabase/backend phone auth is enabled, connect checkPhoneExists
 * to a real API endpoint.
 */

export const PASSWORD_RULES = {
  minLength: 1,
  requiresNumber: false,
};

/**
 * Validates password: any non-empty password of the user's choice is accepted.
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
export const checkPhoneExists = (_phone: string): boolean => {
  return false;
};
