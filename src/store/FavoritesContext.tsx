import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { trendApi, getAuthToken, extractArray } from '../api/trendApi';

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

  // Load favorites from AsyncStorage on mount and hydrate from live backend wishlist
  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const stored = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
        let localItems: FavoriteItem[] = [];
        if (stored) {
          localItems = JSON.parse(stored);
          setFavorites(localItems);
        }

        const token = await getAuthToken();
        if (token) {
          const res = await trendApi.wishlist.list();
          if (res.ok && res.data) {
            const remoteRows = extractArray<any>(res.data, ['wishlist', 'services']);
            if (remoteRows.length > 0) {
              const mapped: FavoriteItem[] = remoteRows.map((row) => ({
                id: String(row.service_id || row.id || ''),
                name: row.name || row.service_name || 'Service',
                category: row.category,
                location: row.location || row.address,
                rating: row.rating ? String(row.rating) : undefined,
                reviewsCount: row.reviews_count ? String(row.reviews_count) : undefined,
                price: typeof row.price === 'number' ? row.price : undefined,
                imageUri:
                  Array.isArray(row.images) && row.images.length > 0
                    ? row.images[0]
                    : row.image || row.image_url,
                images: Array.isArray(row.images) ? row.images : undefined,
              }));
              const validMapped = mapped.filter((item) => item.id.length > 0);
              if (validMapped.length > 0) {
                setFavorites(validMapped);
                AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(validMapped)).catch(
                  () => {}
                );
              }
            }
          }
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
      getAuthToken()
        .then((token) => {
          if (!token) return null;
          return exists ? trendApi.wishlist.remove(item.id) : trendApi.wishlist.add(item.id);
        })
        .catch(() => {});
    },
    [favorites, persistFavorites]
  );

  const removeFavorite = useCallback(
    async (id: string) => {
      const updated = favorites.filter((fav) => fav.id !== id);
      await persistFavorites(updated);
      getAuthToken()
        .then((token) => {
          if (!token) return null;
          return trendApi.wishlist.remove(id);
        })
        .catch(() => {});
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
