/**
 * Supabase client is commented out for frontend-only mode.
 * Frontend UI navigation and forms work seamlessly with the mock client below.
 */

/*
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

// In-memory fallback if storage is inaccessible or in SSR/headless mode
const memoryStore: Record<string, string> = {};

const customStorage = {
  getItem: async (key: string): Promise<string | null> => {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          return window.localStorage.getItem(key);
        } catch {
          return memoryStore[key] ?? null;
        }
      }
      return memoryStore[key] ?? null;
    }

    try {
      return await AsyncStorage.getItem(key);
    } catch {
      return memoryStore[key] ?? null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          window.localStorage.setItem(key, value);
          return;
        } catch {
          memoryStore[key] = value;
          return;
        }
      }
      memoryStore[key] = value;
      return;
    }

    try {
      await AsyncStorage.setItem(key, value);
    } catch {
      memoryStore[key] = value;
    }
  },
  removeItem: async (key: string): Promise<void> => {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          window.localStorage.removeItem(key);
          return;
        } catch {
          delete memoryStore[key];
          return;
        }
      }
      delete memoryStore[key];
      return;
    }

    try {
      await AsyncStorage.removeItem(key);
    } catch {
      delete memoryStore[key];
    }
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: customStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
*/

// Mock Supabase client for pure frontend development
export const supabase = {
  auth: {
    signInWithPassword: async (_credentials: any) => {
      return {
        data: {
          user: { id: 'mock-user-1', email: 'demo@trend.com' },
          session: { access_token: 'mock-token', refresh_token: 'mock-refresh' },
        },
        error: null,
      };
    },
    signUp: async (_credentials: any) => {
      return {
        data: {
          user: { id: 'mock-user-1', phone: '+2348012345678' },
          session: { access_token: 'mock-token', refresh_token: 'mock-refresh' },
        },
        error: null,
      };
    },
    signOut: async () => {
      return { error: null };
    },
    getSession: async () => {
      return { data: { session: null }, error: null };
    },
    onAuthStateChange: () => {
      return { data: { subscription: { unsubscribe: () => {} } } };
    },
  },
  from: (_table: string) => ({
    select: () => ({
      eq: () => ({
        single: async () => ({ data: null, error: null }),
      }),
    }),
  }),
} as any;
