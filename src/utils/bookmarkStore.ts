import { useState, useEffect } from 'react';

export interface BookmarkOptions {
  serviceName: string;
  images: any[];
}

let globalIsBookmarkOpen = false;
let globalBookmarkOptions: BookmarkOptions = {
  serviceName: '',
  images: [],
};

const listeners = new Set<() => void>();

const emitChange = () => {
  listeners.forEach((listener) => listener());
};

export const bookmarkStore = {
  isOpen: () => globalIsBookmarkOpen,
  getOptions: () => globalBookmarkOptions,

  openBookmark: (options: BookmarkOptions) => {
    globalBookmarkOptions = options;
    globalIsBookmarkOpen = true;
    emitChange();
  },

  closeBookmark: () => {
    globalIsBookmarkOpen = false;
    emitChange();
  },

  subscribe: (listener: () => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};

export const useBookmarkStore = () => {
  const [isOpen, setIsOpen] = useState(bookmarkStore.isOpen());
  const [options, setOptions] = useState(bookmarkStore.getOptions());

  useEffect(() => {
    return bookmarkStore.subscribe(() => {
      setIsOpen(bookmarkStore.isOpen());
      setOptions(bookmarkStore.getOptions());
    });
  }, []);

  return {
    isOpen,
    options,
    openBookmark: bookmarkStore.openBookmark,
    closeBookmark: bookmarkStore.closeBookmark,
  };
};
