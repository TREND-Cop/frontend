/**
 * Skeleton Cadence Store
 *
 * Tracks user navigation across screens to enforce the founder's cadence rule:
 * - Screen 1: Instant (no skeleton loader delay)
 * - Screen 2: Instant (no skeleton loader delay)
 * - Screen 3: Skeleton Loader appears (images visible, text covered with skeleton for ~1-1.5s)
 * - Cadence resets: (1, 2 instant -> 3 skeleton -> 4, 5 instant -> 6 skeleton...)
 */

// Routes that are Quick Action Sheets (drawers), not standard screen navigations
const MODAL_ROUTES = [
  'add-card',
  'bank-transfer',
  'appointment-day',
  'chat',
];

class SkeletonCadenceStore {
  private screenCount: number = 0;
  private lastRoute: string = '';

  /**
   * Called on forward screen navigation (push, navigate, replace).
   * Increments screen count if the route is a standard page (not a drawer/action sheet).
   */
  public registerNavigation(routeKey: string) {
    if (!routeKey) return;

    // Check if this is a drawer or quick action sheet modal
    const isModal = MODAL_ROUTES.some((modal) => routeKey.includes(modal));
    if (isModal) return;

    // Prevent counting rapid duplicates of the same route
    if (routeKey === this.lastRoute) return;

    this.lastRoute = routeKey;
    this.screenCount += 1;
  }

  /**
   * Returns true if the current screen should show the text skeleton loader
   * (every 3rd screen transition), and false for screens 1 & 2.
   */
  public shouldShowSkeleton(): boolean {
    return this.screenCount > 0 && this.screenCount % 3 === 0;
  }

  /**
   * Returns the current screen count (for debugging / analytics).
   */
  public getCount(): number {
    return this.screenCount;
  }

  /**
   * Resets the cadence counter (e.g. on logout or returning to root).
   */
  public reset() {
    this.screenCount = 0;
    this.lastRoute = '';
  }
}

export const skeletonCadenceStore = new SkeletonCadenceStore();
