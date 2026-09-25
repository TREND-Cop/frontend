import { useState, useEffect } from 'react';

export type ToastType = 'wishlist' | 'success' | 'info' | 'error';

export interface ToastOptions {
  message: string;
  type?: ToastType;
  duration?: number;
  actionText?: string;
  onActionPress?: () => void;
}

let globalIsToastVisible = false;
let globalToastOptions: ToastOptions = {
  message: '',
  type: 'info',
  duration: 2800,
};

const listeners = new Set<() => void>();

const emitChange = () => {
  listeners.forEach((listener) => listener());
};

export const toastStore = {
  isVisible: () => globalIsToastVisible,
  getOptions: () => globalToastOptions,

  showToast: (options: ToastOptions) => {
    globalToastOptions = {
      type: 'info',
      duration: 2800,
      ...options,
    };
    globalIsToastVisible = true;
    emitChange();
  },

  hideToast: () => {
    globalIsToastVisible = false;
    emitChange();
  },

  subscribe: (listener: () => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};

export const useToastStore = () => {
  const [isVisible, setIsVisible] = useState(toastStore.isVisible());
  const [options, setOptions] = useState(toastStore.getOptions());

  useEffect(() => {
    return toastStore.subscribe(() => {
      setIsVisible(toastStore.isVisible());
      setOptions(toastStore.getOptions());
    });
  }, []);

  return {
    isVisible,
    options,
    showToast: toastStore.showToast,
    hideToast: toastStore.hideToast,
  };
};
