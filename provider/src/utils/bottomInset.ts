import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Design gap between the floating tab bar and the top of the native dock.
 * From Figma: 57px (Messages) / 64px (Profile) minus 34px iPhone home indicator = ~23px-30px.
 * Standardized across owner and staff apps to 24px.
 */
export const DOCK_GAP = 24;

/**
 * Height of the floating tab bar in pixels (Frame width: 300px, height: 80px, radius: 40px).
 */
export const TAB_BAR_HEIGHT = 80;

/**
 * Hook to retrieve safe bottom calculations for all bottom UI elements.
 * Read directly at render time from react-native-safe-area-context.
 */
export function useBottomInset() {
  const insets = useSafeAreaInsets();
  const bottomInset = insets.bottom;

  // Floating tab bar offset:
  // With no native dock (bottomInset === 0): completely flush with screen bottom (bottom: 0).
  // With a native dock (bottomInset > 0): sits above it with DOCK_GAP.
  const tabBottomOffset = bottomInset > 0 ? bottomInset + DOCK_GAP : 0;

  // Total obstruction height of the floating tab bar (including clearance for scroll views)
  const tabScrollPadding = tabBottomOffset + TAB_BAR_HEIGHT + 24;

  // Floating action button (FAB) offset:
  // Sits 20px above the floating tab bar on tab screens, or follows tabBottomOffset on non-tab screens.
  const fabBottomOffset = tabBottomOffset + TAB_BAR_HEIGHT + 20;

  // Bottom fade overlay height behind the tab bar
  const bottomFadeHeight = tabBottomOffset + TAB_BAR_HEIGHT + 24;

  /**
   * Helper to compute paddingBottom for full-width bottom bars (pinned footers, action buttons, composers, sheets).
   * @param designPadding Base padding specified in design (defaults to 16px)
   * @param isKeyboardActive Whether keyboard is currently open (if true, dock inset is omitted)
   */
  const getFullWidthBarPadding = (designPadding: number = 16, isKeyboardActive: boolean = false) => {
    return isKeyboardActive ? designPadding : bottomInset + designPadding;
  };

  return {
    bottomInset,
    hasDock: bottomInset > 0,
    tabBottomOffset,
    tabScrollPadding,
    fabBottomOffset,
    bottomFadeHeight,
    getFullWidthBarPadding,
  };
}

export default useBottomInset;

