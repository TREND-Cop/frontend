import { useState, useEffect } from 'react';
import { Platform, Dimensions, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export interface NativeDockInfo {
  /** True strictly when a physical or software native dock (Android 3-button nav or iOS home bar) is active */
  hasDock: boolean;
  /** Height in dp of the native dock (typically 48–56 on Android 3-button dock, ~34 on iOS). 0 if gesture navigation / no dock. */
  dockHeight: number;
}

/**
 * Calculates whether the device currently has an active native navigation dock.
 * On Android, checks the difference between physical screen height and window height (excluding status bar).
 * On gesture navigation devices (where the user has no 3-button dock), returns hasDock = false, dockHeight = 0.
 */
export function calculateNativeDock(insetsBottom: number = 0): NativeDockInfo {
  if (Platform.OS === 'ios') {
    const hasDock = insetsBottom > 0;
    return {
      hasDock,
      dockHeight: insetsBottom,
    };
  }

  if (Platform.OS === 'android') {
    try {
      const screenHeight = Dimensions.get('screen').height;
      const windowHeight = Dimensions.get('window').height;
      const statusBarHeight = StatusBar.currentHeight || 0;

      // Difference between physical screen and application window
      const navBarHeight = Math.round(screenHeight - windowHeight - statusBarHeight);

      // On Android with 3-button dock, navBarHeight or insetsBottom is typically >= 40dp (standard is 48dp or 56dp).
      // On gesture navigation devices, navBarHeight is <= 0 or ~12dp (gesture pill) and insetsBottom is <= 15.
      const hasDock = (insetsBottom > 24) || (navBarHeight > 24);
      const detectedHeight = Math.max(insetsBottom, navBarHeight);

      return {
        hasDock,
        dockHeight: hasDock ? Math.max(detectedHeight, 48) : 0,
      };
    } catch {
      const hasDock = insetsBottom > 24;
      return {
        hasDock,
        dockHeight: hasDock ? Math.max(insetsBottom, 48) : 0,
      };
    }
  }

  return {
    hasDock: false,
    dockHeight: 0,
  };
}

/**
 * Hook that reactively returns native dock state and height.
 */
export function useNativeDock(): NativeDockInfo {
  const insets = useSafeAreaInsets();
  const [dockInfo, setDockInfo] = useState<NativeDockInfo>(() =>
    calculateNativeDock(insets.bottom)
  );

  useEffect(() => {
    setDockInfo(calculateNativeDock(insets.bottom));

    const subscription = Dimensions.addEventListener('change', () => {
      setDockInfo(calculateNativeDock(insets.bottom));
    });

    return () => {
      subscription.remove();
    };
  }, [insets.bottom]);

  return dockInfo;
}

export default useNativeDock;
