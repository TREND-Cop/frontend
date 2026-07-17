/**
 * Shared validation rules used across auth screens.
 * TODO (Backend): Keep these in sync with your server-side validation policies.
 * Changing values here will automatically update client-side validation
 * in SignUpScreen, ForgotPasswordScreen, and any other screen that imports them.
 */

/**
 * Password validation rules.
 * - minLength: minimum number of characters required
 * - requiresNumber: whether at least one digit (0-9) is required
 */
export const PASSWORD_RULES = {
  minLength: 8,
  requiresNumber: true,
};

/**
 * Validates the password against PASSWORD_RULES.
 * Returns true only if all rules pass.
 */
export const isPasswordValid = (password: string): boolean => {
  if (password.length < PASSWORD_RULES.minLength) return false;
  if (PASSWORD_RULES.requiresNumber && !/\d/.test(password)) return false;
  return true;
};

/**
 * Validates a phone number string (digits only, 7–15 characters).
 * Uses the E.164 length range as a sensible default.
 */
export const isPhoneValid = (phone: string): boolean => {
  const digitsOnly = phone.replace(/\D/g, '');
  return digitsOnly.length >= 7 && digitsOnly.length <= 15;
};

/**
 * Available country dial codes for the phone field picker.
 * TODO (Backend): This list can be fetched from an API in the future.
 */
export const COUNTRY_CODES = [
  { code: '+1', flag: '🇺🇸', country: 'US' },
  { code: '+44', flag: '🇬🇧', country: 'UK' },
  { code: '+234', flag: '🇳🇬', country: 'NG' },
  { code: '+91', flag: '🇮🇳', country: 'IN' },
  { code: '+61', flag: '🇦🇺', country: 'AU' },
  { code: '+49', flag: '🇩🇪', country: 'DE' },
  { code: '+33', flag: '🇫🇷', country: 'FR' },
  { code: '+86', flag: '🇨🇳', country: 'CN' },
  { code: '+81', flag: '🇯🇵', country: 'JP' },
];
