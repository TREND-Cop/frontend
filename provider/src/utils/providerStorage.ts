import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Provider Platform Local Storage & Browser Memory Keys
 * Namespaced with `@trend_provider_` to avoid any collision with customer app keys.
 */
export const STORAGE_KEYS = {
  SERVICE_DRAFT: '@trend_provider_service_draft',
  SERVICES_LIST: '@trend_provider_services_list',
  STAFF_LIST: '@trend_provider_staff_list',
  WORK_PHOTOS: '@trend_provider_work_photos',
  STAFF_WORK_PHOTOS: '@trend_provider_staff_work_photos',
  PROVIDER_CONVERSATIONS: '@trend_provider_conversations',
  PROVIDER_MESSAGES_MAP: '@trend_provider_messages_map',
  STAFF_MESSAGES_CONVERSATIONS: '@trend_provider_staff_messages_conversations',
  STAFF_MESSAGES_MAP: '@trend_provider_staff_messages_map',
  STAFF_APPOINTMENTS: '@trend_provider_staff_appointments',
  STAFF_SESSION: '@trend_provider_staff_session',
  STAFF_HAS_COMPLETED_TUTORIAL: '@trend_staff_has_completed_tutorial',
  PROVIDER_HAS_COMPLETED_TUTORIAL: '@trend_provider_has_completed_tutorial',
  PROVIDER_TUTORIAL_COMPLETED_AT: '@trend_provider_tutorial_completed_at',
  PROVIDER_PAYOUT_MODAL_DISMISSED: '@trend_provider_payout_modal_dismissed',
  PROVIDER_PAYOUT_MODAL_SHOWN: '@trend_provider_payout_modal_shown',
} as const;

/**
 * Loads and parses JSON data from AsyncStorage / browser localStorage.
 * Returns the fallback value if key does not exist or parsing fails.
 */
export async function loadFromStorage<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) {
      return fallback;
    }
    return JSON.parse(raw) as T;
  } catch (err) {
    console.warn(`[providerStorage] Failed to load key "${key}":`, err);
    return fallback;
  }
}

/**
 * Serializes and saves data to AsyncStorage / browser localStorage.
 */
export async function saveToStorage<T>(key: string, value: T): Promise<void> {
  try {
    const serialized = JSON.stringify(value);
    await AsyncStorage.setItem(key, serialized);
  } catch (err) {
    console.warn(`[providerStorage] Failed to save key "${key}":`, err);
  }
}

/**
 * Removes a specific key from AsyncStorage / browser localStorage.
 */
export async function removeFromStorage(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch (err) {
    console.warn(`[providerStorage] Failed to remove key "${key}":`, err);
  }
}

/**
 * Resets all provider-scoped storage keys. Useful for log out, testing, or resetting mock data.
 */
export async function clearAllProviderStorage(): Promise<void> {
  try {
    const allKeys = Object.values(STORAGE_KEYS);
    await Promise.all(allKeys.map((key) => AsyncStorage.removeItem(key)));
  } catch (err) {
    console.warn('[providerStorage] Failed to clear provider storage:', err);
  }
}

