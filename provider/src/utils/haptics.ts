import { Platform, Vibration } from 'react-native';

/**
 * Universal safe haptic feedback utility.
 * Delivers a crisp, subtle mechanical key-click sensation ("mindful of intensity")
 * matching modern smartphone keyboards.
 *
 * - Dynamically loads `expo-haptics` if available.
 * - Gracefully falls back to subtle hardware vibration micro-pulses (10-12ms) on Android.
 * - Falls back to `navigator.vibrate` on Web.
 * - Guaranteed zero-crash execution.
 */
let expoHaptics: any = null;

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  expoHaptics = require('expo-haptics');
} catch {
  expoHaptics = null;
}

export function triggerLightHaptic(): void {
  try {
    if (expoHaptics && expoHaptics.impactAsync && expoHaptics.ImpactFeedbackStyle) {
      expoHaptics.impactAsync(expoHaptics.ImpactFeedbackStyle.Light).catch(() => {});
      return;
    }

    if (Platform.OS === 'android') {
      // 10ms subtle micro-tick
      Vibration.vibrate(10);
      return;
    }

    if (Platform.OS === 'ios') {
      Vibration.vibrate(10);
      return;
    }

    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(10);
      return;
    }
  } catch {
    // Fail silently without disrupting user interaction
  }
}

export default triggerLightHaptic;
