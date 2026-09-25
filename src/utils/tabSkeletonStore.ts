import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';

type TabKey = 'home' | 'category' | 'explore' | 'bookings' | 'messages';
type Listener = (tab: TabKey) => void;

class TabSkeletonStore {
  private lastTriggeredTab: TabKey | null = null;
  private listeners: Set<Listener> = new Set();

  triggerTab(tab: TabKey) {
    this.lastTriggeredTab = tab;
    this.notify(tab);
  }

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
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
 * Hook to manage animated skeleton loading cadence whenever a tab is clicked or focused.
 * Shows the animated shimmer skeleton for ~1100ms on tab entry or tab click.
 */
export function useTabSkeleton(tabKey: TabKey, durationMs: number = 1100) {
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Trigger when tab gains focus (e.g. navigating/switching tabs)
  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, durationMs);
      return () => clearTimeout(timer);
    }, [durationMs])
  );

  // Trigger when the user taps the tab button (including tapping the currently active tab)
  useEffect(() => {
    const unsubscribe = tabSkeletonStore.subscribe((targetTab) => {
      if (targetTab === tabKey) {
        setIsLoading(true);
        const timer = setTimeout(() => {
          setIsLoading(false);
        }, durationMs);
      }
    });
    return () => {
      unsubscribe();
    };
  }, [tabKey, durationMs]);

  return isLoading;
}
