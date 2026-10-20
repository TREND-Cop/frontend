/**
 * MOCK — replace with TODO (Backend) calls
 *
 * Phone auth and SMS verification are not set up on the backend yet.
 * In accordance with Figma:
 * - F4 shows "2700" as the successful code.
 * - F3 shows "1190" as the error code.
 */

export const MOCK_VALID_OTP = '2700';

export interface VerifyOtpResult {
  success: boolean;
  error?: string;
}

/**
 * Verify OTP code against mock value.
 * TODO (Backend): Replace mock delay and hardcoded code with real SMS verification API endpoint.
 */
export async function verifyOtp(phone: string, code: string): Promise<VerifyOtpResult> {
  // Short simulated delay for realistic feel
  await new Promise((resolve) => setTimeout(resolve, 150));

  // Any number/code is valid during experimentation
  return { success: true };
}

/**
 * Request / Resend OTP code.
 * TODO (Backend): Replace mock delay with SMS provider dispatch call.
 */
export async function requestOtp(phone: string): Promise<{ success: boolean }> {
  // Simulated mock network wait
  await new Promise((resolve) => setTimeout(resolve, 800));
  return { success: true };
}
