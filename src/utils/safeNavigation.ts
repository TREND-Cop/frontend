/**
 * LINT GUARD — CENTRAL NAVIGATION & SINGLE-FLIGHT ACTION HELPER
 * ----------------------------------------------------------------------------
 * Do NOT call `router.push(`, `router.replace(`, `router.navigate(`, `router.back(`,
 * or `<Link` directly in screens, components, tab bars, or dialogs.
 *
 * Always use:
 *   - `useSafeRouter()` / `safeRouter` / `<SafeLink>` for navigation
 *   - `useSingleFlight(fn)` for async / submit / confirm / delete / send / sheet handlers
 *
 * Grep check to find stragglers across the repo:
 *   grep -rnE "\brouter\.(push|replace|navigate|back)\(|<Link\b" provider/src src --exclude="safeNavigation.ts"
 */

import React, { useCallback, useRef } from 'react';
import { router, Link } from 'expo-router';
import { skeletonCadenceStore } from './skeletonCadenceStore';
import { tabSkeletonStore } from './tabSkeletonStore';

// Safety fallback timeout (ms) so a failed or no-op navigation can never leave the app stuck locked
export const LOCK_SAFETY_TIMEOUT_MS = 600;
const ASYNC_ACTION_MAX_LOCK_MS = 10000;

let isInitialized = false;

// In-flight target locks: normalized targetKey -> safety release timeout ID
const inFlightTargets = new Map<string, ReturnType<typeof setTimeout>>();

// Back / dismiss single-flight lock
let isBackInFlight = false;
let backSafetyTimer: ReturnType<typeof setTimeout> | null = null;

// Optional access to Expo Router's internal store for active route inspection & state listeners
let expoRouterStore: any = null;
let expoRouterRouting: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  expoRouterStore = require('expo-router/build/global-state/store')?.store ?? null;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  expoRouterRouting = require('expo-router/build/global-state/router') ?? null;
} catch {
  expoRouterStore = null;
  expoRouterRouting = null;
}

/**
 * Strips Expo Router route-group segments like `/(tabs)` or `/(auth)` and trailing slashes.
 */
function normalizePathname(rawPathname: string): string {
  const stripped = rawPathname
    .trim()
    .replace(/\/\([^/]+\)/g, '')
    .replace(/\/+/g, '/')
    .replace(/\/+$/, '');
  return (stripped || '/').toLowerCase();
}

/**
 * Normalizes and serializes target href (string or `{ pathname, params }`) to a canonical key.
 * Substitutes dynamic `[param]` segments so `{ pathname: '/salon/[id]', params: { id: '1' } }`
 * and `'/salon/1'` produce the exact same key.
 */
export function getRouteKey(url: any): string {
  if (!url) return '';

  if (typeof url === 'string') {
    const [rawPath, rawQuery] = url.split('?');
    const path = normalizePathname(rawPath || '/');
    if (!rawQuery) return path;
    const pairs = rawQuery
      .split('&')
      .filter(Boolean)
      .sort()
      .join('&');
    return pairs ? `${path}?${pairs}` : path;
  }

  try {
    if (typeof url === 'object' && url.pathname) {
      let resolvedPath = String(url.pathname);
      const remainingParams: Record<string, string> = {};

      if (url.params && typeof url.params === 'object') {
        for (const [k, v] of Object.entries(url.params)) {
          if (v === undefined || v === null) continue;
          const token = `[${k}]`;
          const catchAllToken = `[...${k}]`;
          if (resolvedPath.includes(token)) {
            resolvedPath = resolvedPath.replace(token, String(v));
          } else if (resolvedPath.includes(catchAllToken)) {
            resolvedPath = resolvedPath.replace(catchAllToken, Array.isArray(v) ? v.join('/') : String(v));
          } else {
            remainingParams[k] = String(v);
          }
        }
      }

      const path = normalizePathname(resolvedPath);
      const sortedKeys = Object.keys(remainingParams).sort();
      if (sortedKeys.length === 0) return path;
      const query = sortedKeys.map((k) => `${k}=${remainingParams[k]}`).join('&');
      return `${path}?${query}`;
    }
    return JSON.stringify(url);
  } catch {
    return String(url);
  }
}

/**
 * Returns the canonical route key of the screen currently focused in Expo Router,
 * or `''` if unavailable.
 */
export function getCurrentActiveRouteKey(): string {
  try {
    const routeInfo = expoRouterStore?.getRouteInfo?.();
    if (!routeInfo || !routeInfo.pathname) return '';
    return getRouteKey({
      pathname: routeInfo.pathname,
      params: routeInfo.params,
    });
  } catch {
    return '';
  }
}

/**
 * Releases the in-flight lock for a specific target key.
 */
function releaseTargetLock(targetKey: string) {
  if (!targetKey) return;
  const timer = inFlightTargets.get(targetKey);
  if (timer) {
    clearTimeout(timer);
  }
  inFlightTargets.delete(targetKey);
}

/**
 * Locks a target key and schedules its safety release.
 */
function lockTarget(targetKey: string, durationMs: number = LOCK_SAFETY_TIMEOUT_MS) {
  if (!targetKey) return;
  releaseTargetLock(targetKey);
  const timer = setTimeout(() => {
    inFlightTargets.delete(targetKey);
  }, durationMs);
  inFlightTargets.set(targetKey, timer);
}

/**
 * Releases the back/dismiss lock.
 */
function releaseBackLock() {
  if (backSafetyTimer) {
    clearTimeout(backSafetyTimer);
    backSafetyTimer = null;
  }
  isBackInFlight = false;
}

/**
 * Locks back/dismiss navigation until transition settles or safety timeout fires.
 */
function lockBack(durationMs: number = LOCK_SAFETY_TIMEOUT_MS) {
  releaseBackLock();
  isBackInFlight = true;
  backSafetyTimer = setTimeout(() => {
    isBackInFlight = false;
    backSafetyTimer = null;
  }, durationMs);
}

/**
 * Checks whether a forward navigation to `href` should be ignored:
 * 1. Target is already in flight (`inFlightTargets.has(targetKey)`).
 * 2. User is already on the exact same route (`pathname + params`), unless `options?.forceReload` is set.
 */
function shouldSkipForwardNavigation(href: any, options?: any, actionLabel: string = 'navigate'): string | null {
  const targetKey = getRouteKey(href);
  if (!targetKey) return '';

  // 1. Dedupe by target: ignore identical href while navigation to it is in flight
  if (inFlightTargets.has(targetKey)) {
    if (__DEV__) {
      console.warn(`[SafeNavigation] Ignored duplicate in-flight ${actionLabel} to "${targetKey}"`);
    }
    return null;
  }

  // 2. Ignore re-tapping a link/tab to the screen the user is already on
  if (!options?.forceReload) {
    const activeKey = getCurrentActiveRouteKey();
    if (activeKey && activeKey === targetKey) {
      if (__DEV__) {
        console.warn(`[SafeNavigation] Ignored ${actionLabel} to already-active screen "${targetKey}"`);
      }
      return null;
    }
  }

  return targetKey;
}

/**
 * Subscribes to Expo Router's navigation state changes so locks release cleanly
 * once the stack transition finishes.
 */
function attachNavigationStateReleaseListener() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const routeInfoCache = require('expo-router/build/global-state/routeInfoCache');
    const subscribers: Set<() => void> | undefined = routeInfoCache?.routeInfoSubscribers;
    if (subscribers && typeof subscribers.add === 'function') {
      let lastPathname = '';
      subscribers.add(() => {
        const currentKey = getCurrentActiveRouteKey();
        if (currentKey && currentKey !== lastPathname) {
          lastPathname = currentKey;
          for (const key of Array.from(inFlightTargets.keys())) {
            if (key !== currentKey) {
              releaseTargetLock(key);
            }
          }
        }
      });
    }
  } catch {
    // Fallback timeout handles lock release if internal cache module changes
  }
}

/**
 * Patches the global singleton `router` exported by `expo-router`.
 * Runs once at root layout initialization.
 */
export function initSafeNavigation() {
  if (isInitialized) return;
  isInitialized = true;

  attachNavigationStateReleaseListener();

  const originalPush = router.push.bind(router);
  const originalNavigate = router.navigate.bind(router);
  const originalReplace = router.replace.bind(router);
  const originalBack = router.back.bind(router);
  const originalCanGoBack = router.canGoBack ? router.canGoBack.bind(router) : () => true;
  const originalDismiss = router.dismiss ? router.dismiss.bind(router) : undefined;
  const originalDismissTo = router.dismissTo ? router.dismissTo.bind(router) : undefined;
  const originalDismissAll = router.dismissAll ? router.dismissAll.bind(router) : undefined;
  const originalLinkTo = expoRouterRouting?.linkTo ? expoRouterRouting.linkTo.bind(expoRouterRouting) : undefined;

  // ─── Guard: router.push ──────────────────────────────────────────────────
  (router as any).push = (href: any, options?: any) => {
    const targetKey = shouldSkipForwardNavigation(href, options, 'push');
    if (targetKey === null) return;

    lockTarget(targetKey, LOCK_SAFETY_TIMEOUT_MS);
    try {
      skeletonCadenceStore.registerNavigation(targetKey);
      return originalPush(href, options);
    } catch (error) {
      releaseTargetLock(targetKey);
      throw error;
    }
  };

  // ─── Guard: router.navigate ──────────────────────────────────────────────
  (router as any).navigate = (href: any, options?: any) => {
    const targetKey = shouldSkipForwardNavigation(href, options, 'navigate');
    if (targetKey === null) return;

    lockTarget(targetKey, LOCK_SAFETY_TIMEOUT_MS);
    try {
      skeletonCadenceStore.registerNavigation(targetKey);
      return originalNavigate(href, options);
    } catch (error) {
      releaseTargetLock(targetKey);
      throw error;
    }
  };

  // ─── Guard: router.replace ───────────────────────────────────────────────
  (router as any).replace = (href: any, options?: any) => {
    const targetKey = shouldSkipForwardNavigation(href, options, 'replace');
    if (targetKey === null) return;

    lockTarget(targetKey, LOCK_SAFETY_TIMEOUT_MS);
    try {
      skeletonCadenceStore.registerNavigation(targetKey);
      return originalReplace(href, options);
    } catch (error) {
      releaseTargetLock(targetKey);
      throw error;
    }
  };

  // ─── Guard: router.back ──────────────────────────────────────────────────
  (router as any).back = () => {
    if (isBackInFlight) {
      if (__DEV__) {
        console.warn('[SafeNavigation] Ignored rapid double-tap back()');
      }
      return;
    }

    if (!originalCanGoBack()) {
      if (__DEV__) {
        console.warn('[SafeNavigation] Ignored back() because canGoBack() is false');
      }
      return;
    }

    lockBack(LOCK_SAFETY_TIMEOUT_MS);
    try {
      tabSkeletonStore.triggerBack();
      return originalBack();
    } catch (error) {
      releaseBackLock();
      throw error;
    }
  };

  // ─── Guard: router.dismiss / dismissTo / dismissAll ──────────────────────
  if (originalDismiss) {
    (router as any).dismiss = (count?: number) => {
      if (isBackInFlight) return;
      if (!originalCanGoBack()) return;
      lockBack(LOCK_SAFETY_TIMEOUT_MS);
      try {
        tabSkeletonStore.triggerBack();
        return originalDismiss(count);
      } catch (error) {
        releaseBackLock();
        throw error;
      }
    };
  }

  if (originalDismissTo) {
    (router as any).dismissTo = (href: any, options?: any) => {
      const targetKey = shouldSkipForwardNavigation(href, options, 'dismissTo');
      if (targetKey === null) return;
      lockTarget(targetKey, LOCK_SAFETY_TIMEOUT_MS);
      try {
        tabSkeletonStore.triggerBack();
        return originalDismissTo(href, options);
      } catch (error) {
        releaseTargetLock(targetKey);
        throw error;
      }
    };
  }

  if (originalDismissAll) {
    (router as any).dismissAll = () => {
      if (isBackInFlight) return;
      lockBack(LOCK_SAFETY_TIMEOUT_MS);
      try {
        tabSkeletonStore.triggerBack();
        return originalDismissAll();
      } catch (error) {
        releaseBackLock();
        throw error;
      }
    };
  }

  // ─── Guard: Expo Router internal `linkTo` (used by `<Link>`) ─────────────
  if (originalLinkTo) {
    expoRouterRouting.linkTo = (href: any, options?: any) => {
      const targetKey = shouldSkipForwardNavigation(href, options, 'linkTo');
      if (targetKey === null) return;
      lockTarget(targetKey, LOCK_SAFETY_TIMEOUT_MS);
      try {
        skeletonCadenceStore.registerNavigation(targetKey);
        return originalLinkTo(href, options);
      } catch (error) {
        releaseTargetLock(targetKey);
        throw error;
      }
    };
  }
}

// Automatically initialize upon module import
initSafeNavigation();

/**
 * Central safe router singleton. All methods delegate through the guarded router.
 */
export const safeRouter = {
  push: (href: any, options?: any) => router.push(href, options),
  replace: (href: any, options?: any) => router.replace(href, options),
  navigate: (href: any, options?: any) => router.navigate(href, options),
  /**
   * Resets the entire root navigation stack to a given href or custom state tree,
   * completely purging navigation history so native hardware back / gestures
   * can NEVER navigate back to previous authenticated screens or profiles.
   */
  resetRoot: (
    target: string | { pathname: string; params?: any } | { index?: number; routes: Array<{ name: string; params?: any }> },
    options?: any
  ) => {
    // 1. Purge all in-flight locks immediately
    inFlightTargets.clear();
    releaseBackLock();

    // 2. Resolve destination href from string, pathname object, or route state tree
    let destinationHref: any = '/';
    if (typeof target === 'string') {
      destinationHref = target;
    } else if (typeof target === 'object' && target !== null) {
      if (Array.isArray((target as any).routes)) {
        const routes = (target as any).routes;
        const lastRoute = routes[routes.length - 1];
        if (lastRoute) {
          const rawName = String(lastRoute.name || '');
          const cleanPath = !rawName || rawName === 'index' ? '/' : (rawName.startsWith('/') ? rawName : `/${rawName}`);
          destinationHref = lastRoute.params ? { pathname: cleanPath, params: lastRoute.params } : cleanPath;
        }
      } else if ('pathname' in target) {
        destinationHref = target;
      }
    }

    // 3. Dismiss any presented modals or sub-screens
    try {
      if (router.canDismiss?.()) {
        router.dismissAll?.();
      }
    } catch {}

    // 4. Force replace with destination route
    try {
      router.replace(destinationHref as any, { ...(options || {}), forceReload: true });
    } catch {
      try {
        router.navigate(destinationHref as any, options);
      } catch {}
    }
  },
  back: () => router.back(),
  dismiss: (count?: number) => router.dismiss?.(count),
  dismissTo: (href: any, options?: any) => router.dismissTo?.(href, options),
  dismissAll: () => router.dismissAll?.(),
  canGoBack: () => (router.canGoBack ? router.canGoBack() : false),
  canDismiss: () => (router.canDismiss ? router.canDismiss() : false),
  setParams: (params: any) => router.setParams?.(params),
};

/**
 * Central hook returning the guarded `safeRouter` (push, replace, navigate, back, dismiss, canGoBack, setParams).
 */
export function useSafeRouter() {
  return safeRouter;
}

/**
 * Shared "tap once" hook for actions (submit, confirm, delete, send, log out, sheet open).
 * Sets a synchronous `useRef` lock BEFORE any `await` or `setTimeout` so a fast second tap
 * is ignored immediately without waiting for `useState` to re-render.
 */
export function useSingleFlight<T extends (...args: any[]) => any>(
  fn: T | undefined,
  safetyReleaseMs: number = LOCK_SAFETY_TIMEOUT_MS
): (...args: Parameters<T>) => ReturnType<T> | undefined {
  const inFlightRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fnRef = useRef(fn);
  fnRef.current = fn;

  return useCallback(
    (...args: Parameters<T>): ReturnType<T> | undefined => {
      if (!fnRef.current) return undefined;
      if (inFlightRef.current) {
        if (__DEV__) {
          console.warn('[useSingleFlight] Ignored duplicate tap while action is in flight');
        }
        return undefined;
      }

      // Lock synchronously before any work or state update
      inFlightRef.current = true;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }

      const releaseAfter = (ms: number) => {
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
          inFlightRef.current = false;
          timerRef.current = null;
        }, ms);
      };

      try {
        const result = fnRef.current(...args);
        if (result && typeof (result as any).then === 'function') {
          releaseAfter(ASYNC_ACTION_MAX_LOCK_MS);
          (result as Promise<any>).finally(() => {
            releaseAfter(Math.min(safetyReleaseMs, 350));
          });
        } else {
          releaseAfter(safetyReleaseMs);
        }
        return result;
      } catch (error) {
        inFlightRef.current = false;
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
        throw error;
      }
    },
    [safetyReleaseMs]
  );
}

/**
 * Non-hook utility to wrap any callback in a synchronous single-flight lock.
 */
export function throttlePress<T extends (...args: any[]) => any>(
  fn: T,
  delay: number = LOCK_SAFETY_TIMEOUT_MS
): (...args: Parameters<T>) => void {
  let inFlight = false;
  let timer: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (inFlight) return;
    inFlight = true;

    const release = (ms: number) => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        inFlight = false;
        timer = null;
      }, ms);
    };

    try {
      const result = fn(...args);
      if (result && typeof (result as any).then === 'function') {
        release(ASYNC_ACTION_MAX_LOCK_MS);
        (result as Promise<any>).finally(() => release(Math.min(delay, 350)));
      } else {
        release(delay);
      }
    } catch (error) {
      inFlight = false;
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      throw error;
    }
  };
}

/**
 * Drop-in `<SafeLink>` wrapper around Expo Router's `<Link>` that prevents duplicate pushes
 * when tapped rapidly.
 */
export const SafeLink: React.FC<React.ComponentProps<typeof Link>> = ({
  onPress,
  href,
  ...rest
}) => {
  const lockedRef = useRef(false);

  const handlePress = useCallback(
    (e: any) => {
      const targetKey = getRouteKey(href);
      if (lockedRef.current || (targetKey && inFlightTargets.has(targetKey))) {
        e?.preventDefault?.();
        return;
      }
      lockedRef.current = true;
      setTimeout(() => {
        lockedRef.current = false;
      }, LOCK_SAFETY_TIMEOUT_MS);
      onPress?.(e);
    },
    [href, onPress]
  );

  return React.createElement(Link, {
    ...rest,
    href,
    onPress: handlePress,
  });
};
