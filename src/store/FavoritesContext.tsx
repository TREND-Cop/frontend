import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FAVORITES_STORAGE_KEY = '@trend_favorites';

export interface FavoriteItem {
  id: string;
  name: string;
  category?: string;
  location?: string;
  rating?: string;
  reviewsCount?: string;
  price?: number;
  imageUri?: any;
  images?: any[];
}

interface FavoritesContextType {
  favorites: FavoriteItem[];
  isFavorite: (id: string) => boolean;
  toggleFavorite: (item: FavoriteItem) => Promise<void>;
  removeFavorite: (id: string) => Promise<void>;
  favoritesCount: number;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

  // Load favorites from AsyncStorage on mount
  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const stored = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
        if (stored) {
          setFavorites(JSON.parse(stored));
        }
      } catch (err) {
        console.warn('Failed to load favorites from storage:', err);
      }
    };
    loadFavorites();
  }, []);

  const persistFavorites = useCallback(async (newList: FavoriteItem[]) => {
    setFavorites(newList);
    try {
      await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(newList));
    } catch (err) {
      console.warn('Failed to save favorites:', err);
    }
  }, []);

  const isFavorite = useCallback(
    (id: string) => {
      return favorites.some((fav) => fav.id === id);
    },
    [favorites]
  );

  const toggleFavorite = useCallback(
    async (item: FavoriteItem) => {
      const exists = favorites.some((fav) => fav.id === item.id);
      let updated: FavoriteItem[];
      if (exists) {
        updated = favorites.filter((fav) => fav.id !== item.id);
      } else {
        updated = [item, ...favorites];
      }
      await persistFavorites(updated);
    },
    [favorites, persistFavorites]
  );

  const removeFavorite = useCallback(
    async (id: string) => {
      const updated = favorites.filter((fav) => fav.id !== id);
      await persistFavorites(updated);
    },
    [favorites, persistFavorites]
  );

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        isFavorite,
        toggleFavorite,
        removeFavorite,
        favoritesCount: favorites.length,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavoritesContext = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavoritesContext must be used within a FavoritesProvider');
  }
  return context;
};
