import { BackHandler, Platform } from 'react-native';
import { useCallback, useState, useEffect } from 'react';
import { useFocusEffect } from 'expo-router';

type ExitDialogListener = (visible: boolean) => void;
const exitDialogListeners = new Set<ExitDialogListener>();

let isExitDialogShowing = false;

/**
 * Triggers the custom in-app exit confirmation dialog (matching Figma confirmation pattern).
 * Displays a clean pop-up prompting "Are you sure you want to quit this application?".
 */
export function showExitConfirmationDialog(onCancel?: () => void): void {
  if (Platform.OS !== 'android') return;
  if (isExitDialogShowing) return;

  isExitDialogShowing = true;
  exitDialogListeners.forEach((fn) => fn(true));
}

export function hideExitConfirmationDialog(): void {
  isExitDialogShowing = false;
  exitDialogListeners.forEach((fn) => fn(false));
}

export function useExitDialogVisible(): boolean {
  const [visible, setVisible] = useState(isExitDialogShowing);

  useEffect(() => {
    const listener: ExitDialogListener = (v) => setVisible(v);
    exitDialogListeners.add(listener);
    return () => {
      exitDialogListeners.delete(listener);
    };
  }, []);

  return visible;
}

export interface NativeBackExitGuardOptions {
  /**
   * Optional callback to check if an in-app modal, sheet, or search overlay is open.
   * If it returns true (meaning it handled/closed the modal), the exit dialog is suppressed.
   */
  closeActiveModal?: () => boolean;
}

/**
 * Hook to guard the device native back button across authenticated screens.
 * Strictly consumes the native back event so the navigation stack is never popped
 * and the user is never logged out or returned to auth screens.
 */
export function useNativeBackExitGuard(options?: NativeBackExitGuardOptions) {
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (options?.closeActiveModal && options.closeActiveModal()) {
          return true;
        }
        showExitConfirmationDialog();
        return true;
      };

      const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => sub.remove();
    }, [options?.closeActiveModal])
  );
}
