import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useFocusEffect, useNavigation } from 'expo-router';

type TabKey = 'home' | 'category' | 'explore' | 'bookings' | 'messages';
type Listener = (tab: TabKey) => void;
type GlobalBackListener = () => void;

class TabSkeletonStore {
  private lastTriggeredTab: TabKey | null = null;
  private listeners: Set<Listener> = new Set();
  private globalBackListeners: Set<GlobalBackListener> = new Set();

  triggerTab(tab: TabKey) {
    this.lastTriggeredTab = tab;
    this.notify(tab);
  }

  triggerBack() {
    this.globalBackListeners.forEach((l) => {
      try {
        l();
      } catch (e) {
        console.error(e);
      }
    });
  }

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  subscribeBack(listener: GlobalBackListener) {
    this.globalBackListeners.add(listener);
    return () => {
      this.globalBackListeners.delete(listener);
    };
  }

  private notify(tab: TabKey) {
    this.listeners.forEach((l) => {
      try {
        l(tab);
      } catch (e) {
        console.error(e);
      }
    });
  }
}

export const tabSkeletonStore = new TabSkeletonStore();

/**
 * Hook to manage animated skeleton loading cadence whenever a tab is clicked,
 * navigated to, or returned to via "Go Back".
 * Shows the animated shimmer skeleton for durationMs (~1100ms) on any entry or back navigation.
 */
export function useTabSkeleton(tabKey: TabKey, durationMs: number = 1100) {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigation = useNavigation<any>();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startLoading = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setIsLoading(true);
    timerRef.current = setTimeout(() => {
      setIsLoading(false);
    }, durationMs);
  }, [durationMs]);

  const resetToLoading = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setIsLoading(true);
  }, []);

  // 1. Trigger when tab gains focus or returns via goBack (useFocusEffect)
  useFocusEffect(
    useCallback(() => {
      startLoading();
      return () => {
        resetToLoading();
      };
    }, [startLoading, resetToLoading])
  );

  // 2. Navigation focus & blur listeners (including parent root stack pops)
  useEffect(() => {
    if (!navigation) return;

    const unsubFocus = navigation.addListener('focus', () => {
      startLoading();
    });

    const unsubBlur = navigation.addListener('blur', () => {
      resetToLoading();
    });

    // Parent (Root Stack) navigator focus listener:
    // Fires when returning from any pushed screen (like /salon/[id], /profile, etc.) to the tabs
    const parentNav = navigation.getParent?.();
    const unsubParentFocus = parentNav?.addListener?.('focus', () => {
      if (navigation.isFocused?.()) {
        startLoading();
      }
    });

    // Global back trigger (fires when router.back() is called anywhere)
    const unsubBack = tabSkeletonStore.subscribeBack(() => {
      setTimeout(() => {
        if (navigation.isFocused?.()) {
          startLoading();
        }
      }, 50);
    });

    return () => {
      unsubFocus?.();
      unsubBlur?.();
      unsubParentFocus?.();
      unsubBack?.();
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [navigation, startLoading, resetToLoading]);

  // 3. Trigger when the user taps the tab button (including tapping the currently active tab)
  useEffect(() => {
    const unsubscribe = tabSkeletonStore.subscribe((targetTab) => {
      if (targetTab === tabKey) {
        startLoading();
      }
    });
    return () => {
      unsubscribe();
    };
  }, [tabKey, startLoading]);

  return isLoading;
}
