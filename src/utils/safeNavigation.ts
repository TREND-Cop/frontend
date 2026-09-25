/**
 * SafeNavigation — Global Guard Against Accidental Double-Tap & Rapid Duplicate Navigation
 *
 * Automatically intercepts Expo Router's `router` methods (`push`, `navigate`, `replace`, `back`, `dismiss`)
 * across the entire application. Prevents opening the same screen twice or popping multiple screens
 * when users tap buttons quickly in succession.
 */

import { router } from 'expo-router';
import { skeletonCadenceStore } from './skeletonCadenceStore';

// Cooldown windows in milliseconds
const DUPLICATE_TARGET_COOLDOWN_MS = 750; // Dropped if exact same target within 750ms
const RAPID_BURST_COOLDOWN_MS = 400;      // Dropped if ANY navigation action within 400ms
const BACK_COOLDOWN_MS = 450;             // Dropped if double-tapped back within 450ms

let isInitialized = false;
let lastGlobalNavTime = 0;
let lastGlobalNavTarget = '';
let lastBackTime = 0;

/**
 * Serializes target href/pathname/params to a stable string key.
 */
function getRouteKey(url: any): string {
  if (typeof url === 'string') return url;
  if (!url) return '';
  try {
    if (url.pathname) {
      const params = url.params ? JSON.stringify(url.params) : '';
      return `${url.pathname}?${params}`;
    }
    return JSON.stringify(url);
  } catch {
    return String(url);
  }
}

/**
 * Patches the global singleton `router` exported by `expo-router`.
 * Runs once at root layout initialization.
 */
export function initSafeNavigation() {
  if (isInitialized) return;
  isInitialized = true;

  const originalPush = router.push.bind(router);
  const originalNavigate = router.navigate.bind(router);
  const originalReplace = router.replace.bind(router);
  const originalBack = router.back.bind(router);
  const originalDismiss = router.dismiss.bind(router);
  const originalDismissTo = router.dismissTo.bind(router);
  const originalDismissAll = router.dismissAll.bind(router);

  // ─── Guard: router.push ──────────────────────────────────────────────────
  (router as any).push = (href: any, options?: any) => {
    const now = Date.now();
    const targetKey = getRouteKey(href);

    // Drop if same destination called within 750ms
    if (targetKey && targetKey === lastGlobalNavTarget && now - lastGlobalNavTime < DUPLICATE_TARGET_COOLDOWN_MS) {
      if (__DEV__) {
        console.warn(`[SafeNavigation] Prevented duplicate push to: "${targetKey}" (${now - lastGlobalNavTime}ms)`);
      }
      return;
    }

    // Drop if any navigation was invoked within 400ms (rapid double-tap burst)
    if (now - lastGlobalNavTime < RAPID_BURST_COOLDOWN_MS) {
      if (__DEV__) {
        console.warn(`[SafeNavigation] Prevented rapid burst push to: "${targetKey}" (${now - lastGlobalNavTime}ms)`);
      }
      return;
    }

    lastGlobalNavTime = now;
    lastGlobalNavTarget = targetKey;
    skeletonCadenceStore.registerNavigation(targetKey);
    return originalPush(href, options);
  };

  // ─── Guard: router.navigate ──────────────────────────────────────────────
  (router as any).navigate = (href: any, options?: any) => {
    const now = Date.now();
    const targetKey = getRouteKey(href);

    if (targetKey && targetKey === lastGlobalNavTarget && now - lastGlobalNavTime < DUPLICATE_TARGET_COOLDOWN_MS) {
      if (__DEV__) {
        console.warn(`[SafeNavigation] Prevented duplicate navigate to: "${targetKey}" (${now - lastGlobalNavTime}ms)`);
      }
      return;
    }

    if (now - lastGlobalNavTime < RAPID_BURST_COOLDOWN_MS) {
      if (__DEV__) {
        console.warn(`[SafeNavigation] Prevented rapid burst navigate to: "${targetKey}" (${now - lastGlobalNavTime}ms)`);
      }
      return;
    }

    lastGlobalNavTime = now;
    lastGlobalNavTarget = targetKey;
    skeletonCadenceStore.registerNavigation(targetKey);
    return originalNavigate(href, options);
  };

  // ─── Guard: router.replace ───────────────────────────────────────────────
  (router as any).replace = (href: any, options?: any) => {
    const now = Date.now();
    const targetKey = getRouteKey(href);

    if (targetKey && targetKey === lastGlobalNavTarget && now - lastGlobalNavTime < DUPLICATE_TARGET_COOLDOWN_MS) {
      if (__DEV__) {
        console.warn(`[SafeNavigation] Prevented duplicate replace to: "${targetKey}" (${now - lastGlobalNavTime}ms)`);
      }
      return;
    }

    if (now - lastGlobalNavTime < RAPID_BURST_COOLDOWN_MS) {
      if (__DEV__) {
        console.warn(`[SafeNavigation] Prevented rapid burst replace to: "${targetKey}" (${now - lastGlobalNavTime}ms)`);
      }
      return;
    }

    lastGlobalNavTime = now;
    lastGlobalNavTarget = targetKey;
    skeletonCadenceStore.registerNavigation(targetKey);
    return originalReplace(href, options);
  };

  // ─── Guard: router.back ──────────────────────────────────────────────────
  (router as any).back = () => {
    const now = Date.now();
    if (now - lastBackTime < BACK_COOLDOWN_MS) {
      if (__DEV__) {
        console.warn(`[SafeNavigation] Prevented rapid double-tap back (${now - lastBackTime}ms)`);
      }
      return;
    }

    lastBackTime = now;
    return originalBack();
  };

  // ─── Guard: router.dismiss / dismissTo / dismissAll ──────────────────────
  (router as any).dismiss = (count?: number) => {
    const now = Date.now();
    if (now - lastBackTime < BACK_COOLDOWN_MS) return;
    lastBackTime = now;
    return originalDismiss(count);
  };

  (router as any).dismissTo = (href: any, options?: any) => {
    const now = Date.now();
    if (now - lastBackTime < BACK_COOLDOWN_MS) return;
    lastBackTime = now;
    return originalDismissTo(href, options);
  };

  (router as any).dismissAll = () => {
    const now = Date.now();
    if (now - lastBackTime < BACK_COOLDOWN_MS) return;
    lastBackTime = now;
    return originalDismissAll();
  };
}

// Automatically initialize upon module import
initSafeNavigation();

/**
 * Utility helper to debounce/throttle any arbitrary button onPress handler.
 */
export function throttlePress<T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 500
): (...args: Parameters<T>) => void {
  let lastPress = 0;
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastPress >= delay) {
      lastPress = now;
      fn(...args);
    }
  };
}
