import { Platform } from 'react-native';
import { EdgeInsets } from 'react-native-safe-area-context';

/**
 * Returns a guaranteed safe bottom padding value for bottom bars and floating buttons.
 *
 * Accounts for:
 * - Android 3-button navigation dock (~48dp)
 * - Android gesture pill bar (~16dp - 24dp)
 * - iOS home indicator (~34dp)
 * - Standard fallback padding
 */
export function getSafeBottomPadding(
  insets?: EdgeInsets | { bottom: number },
  minPadding: number = 16,
  extraSpacing: number = 8
): number {
  const bottomInset = insets?.bottom || 0;
  if (bottomInset > 0) {
    const effectiveBottom = Platform.OS === 'android' ? Math.max(bottomInset, 52) : bottomInset;
    return effectiveBottom + (Platform.OS === 'ios' ? 4 : extraSpacing);
  }
  return Platform.OS === 'ios' ? 34 : (Platform.OS === 'android' ? 52 + extraSpacing : minPadding);
}
