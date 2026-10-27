/**
 * Staff Login Configuration & Constants
 *
 * TODO (Backend): Connect to backend staff authentication endpoint.
 * Currently mock/in-memory only.
 */

/**
 * DEV_STAFF_CODE_ALWAYS_FAIL flag:
 * Set to `false` (default) for 4 digits to verify successfully.
 * Set to `true` to test the "Incorrect input code" error state.
 */
export const DEV_STAFF_CODE_ALWAYS_FAIL = false;

/**
 * DEV_STAFF_REJECT_NAME flag:
 * Set to `true` to test "Incorrect name input" error under Full Name field.
 */
export const DEV_STAFF_REJECT_NAME = false;

/**
 * DEV_STAFF_REJECT_BUSINESS flag:
 * Set to `true` to test "Incorrect business name input" error under Business / Company Name field.
 */
export const DEV_STAFF_REJECT_BUSINESS = false;

/**
 * Mock delay (ms) for staff login code verification
 */
export const MOCK_CODE_VERIFY_DELAY_MS = 300;

/**
 * Mock delay (ms) for staff credentials check
 */
export const MOCK_LOGIN_CHECK_DELAY_MS = 600;

/**
 * Pause duration (ms) on green code boxes before navigating to Staff Login form
 */
export const CODE_SUCCESS_PAUSE_MS = 500;
