import { useState, useEffect } from 'react';
import { ImageSourcePropType } from 'react-native';

export interface ShareOptions {
  title?: string;
  subtitle?: string;
  status?: string;
  statusColor?: string;
  url?: string;
  avatar?: ImageSourcePropType | string;
}

let globalIsShareOpen = false;
let globalShareOptions: ShareOptions = {
  title: 'Beauty in white salon',
  status: 'Closed',
  statusColor: 'rgba(204, 41, 41, 0.9)',
  url: 'https://pin.it/1n5aDO4QX',
  avatar: require('../../assets/images/profile/882a99380ae2d750b39f897365bd1d6083664a3b.jpg'),
};

const listeners = new Set<() => void>();

const emitChange = () => {
  listeners.forEach((listener) => listener());
};

export const shareStore = {
  isOpen: () => globalIsShareOpen,
  getOptions: () => globalShareOptions,

  openShare: (options?: Partial<ShareOptions>) => {
    globalShareOptions = {
      title: options?.title || 'Beauty in white salon',
      subtitle: options?.subtitle,
      status: options?.status || 'Closed',
      statusColor: options?.statusColor || (options?.status === 'Available' ? 'rgba(12, 121, 12, 0.96)' : 'rgba(204, 41, 41, 0.9)'),
      url: options?.url || 'https://pin.it/1n5aDO4QX',
      avatar: options?.avatar || require('../../assets/images/profile/882a99380ae2d750b39f897365bd1d6083664a3b.jpg'),
    };
    globalIsShareOpen = true;
    emitChange();
  },

  closeShare: () => {
    globalIsShareOpen = false;
    emitChange();
  },

  subscribe: (listener: () => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};

export const useShareStore = () => {
  const [isOpen, setIsOpen] = useState(shareStore.isOpen());
  const [options, setOptions] = useState(shareStore.getOptions());

  useEffect(() => {
    const unsubscribe = shareStore.subscribe(() => {
      setIsOpen(shareStore.isOpen());
      setOptions(shareStore.getOptions());
    });
    return unsubscribe;
  }, []);

  return {
    isOpen,
    options,
    openShare: shareStore.openShare,
    closeShare: shareStore.closeShare,
  };
};
