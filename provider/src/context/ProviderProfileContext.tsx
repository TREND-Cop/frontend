import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const PROFILE_STORAGE_KEY = '@trend_provider_profile_data';

export interface ProviderProfileState {
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  ownerRole: string;
  ownerPhoto: string | null;
  unreadNotificationsCount: number;
  pushNotificationsEnabled: boolean;
  emailNotificationsEnabled: boolean;
  nameChangedAt: number | null; // Timestamp in milliseconds
  isNameLocked: boolean;
  nameChangeLockDaysRemaining: number;
  updateOwnerName: (newName: string) => Promise<{ success: boolean; error?: string }>;
  updateOwnerPhoto: (uri: string) => Promise<void>;
  updateOwnerPhone: (newPhone: string) => Promise<void>;
  updateOwnerEmail: (newEmail: string) => Promise<void>;
  updateNotificationSettings: (push: boolean, email: boolean) => Promise<void>;
  clearProfile: () => Promise<void>;
}

const SIX_MONTHS_MS = 180 * 24 * 60 * 60 * 1000;

// Default initial state matching Figma design handoff
const defaultProfile = {
  ownerName: 'James Kalba',
  ownerEmail: 'Ghost99@gmail.com',
  ownerPhone: '+234 90 786 850 68',
  ownerRole: 'Business Owner',
  ownerPhoto: null,
  unreadNotificationsCount: 1,
  pushNotificationsEnabled: false,
  emailNotificationsEnabled: false,
  nameChangedAt: null,
};

const ProviderProfileContext = createContext<ProviderProfileState>({
  ...defaultProfile,
  isNameLocked: false,
  nameChangeLockDaysRemaining: 0,
  updateOwnerName: async () => ({ success: false }),
  updateOwnerPhoto: async () => {},
  updateOwnerPhone: async () => {},
  updateOwnerEmail: async () => {},
  updateNotificationSettings: async () => {},
  clearProfile: async () => {},
});

export const ProviderProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [ownerName, setOwnerName] = useState<string>(defaultProfile.ownerName);
  const [ownerEmail, setOwnerEmail] = useState<string>(defaultProfile.ownerEmail);
  const [ownerPhone, setOwnerPhone] = useState<string>(defaultProfile.ownerPhone);
  const [ownerRole, setOwnerRole] = useState<string>(defaultProfile.ownerRole);
  const [ownerPhoto, setOwnerPhoto] = useState<string | null>(defaultProfile.ownerPhoto);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState<number>(defaultProfile.unreadNotificationsCount);
  const [pushNotificationsEnabled, setPushNotificationsEnabled] = useState<boolean>(defaultProfile.pushNotificationsEnabled);
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState<boolean>(defaultProfile.emailNotificationsEnabled);
  const [nameChangedAt, setNameChangedAt] = useState<number | null>(defaultProfile.nameChangedAt);

  // Load persisted profile on mount
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(PROFILE_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.ownerName) setOwnerName(parsed.ownerName);
          if (parsed.ownerEmail) setOwnerEmail(parsed.ownerEmail);
          if (parsed.ownerPhone) setOwnerPhone(parsed.ownerPhone);
          if (parsed.ownerRole) setOwnerRole(parsed.ownerRole);
          if (parsed.ownerPhoto !== undefined) setOwnerPhoto(parsed.ownerPhoto);
          if (typeof parsed.unreadNotificationsCount === 'number') setUnreadNotificationsCount(parsed.unreadNotificationsCount);
          if (typeof parsed.pushNotificationsEnabled === 'boolean') setPushNotificationsEnabled(parsed.pushNotificationsEnabled);
          if (typeof parsed.emailNotificationsEnabled === 'boolean') setEmailNotificationsEnabled(parsed.emailNotificationsEnabled);
          if (parsed.nameChangedAt) setNameChangedAt(parsed.nameChangedAt);
        }
      } catch (err) {
        // Fallback to defaults
      }
    })();
  }, []);

  const persistState = useCallback(async (updated: Record<string, any>) => {
    try {
      const existing = await AsyncStorage.getItem(PROFILE_STORAGE_KEY);
      const current = existing ? JSON.parse(existing) : {};
      const merged = { ...current, ...updated };
      await AsyncStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(merged));
    } catch (err) {
      // Storage error ignored
    }
  }, []);

  // Compute 6-month lock state
  const { isNameLocked, nameChangeLockDaysRemaining } = useMemo(() => {
    if (!nameChangedAt) {
      return { isNameLocked: false, nameChangeLockDaysRemaining: 0 };
    }
    const elapsed = Date.now() - nameChangedAt;
    if (elapsed < SIX_MONTHS_MS) {
      const remainingMs = SIX_MONTHS_MS - elapsed;
      const days = Math.ceil(remainingMs / (24 * 60 * 60 * 1000));
      return { isNameLocked: true, nameChangeLockDaysRemaining: days };
    }
    return { isNameLocked: false, nameChangeLockDaysRemaining: 0 };
  }, [nameChangedAt]);

  const updateOwnerName = useCallback(
    async (newName: string): Promise<{ success: boolean; error?: string }> => {
      const trimmed = newName.trim();
      if (!trimmed) {
        return { success: false, error: 'Name cannot be empty' };
      }
      // Reserved usernames / existing check (Figma spec: "JohnDoe" or taken names show error)
      const takenUsernames = ['johndoe', 'admin', 'trend', 'kalba'];
      if (takenUsernames.includes(trimmed.toLowerCase()) && trimmed.toLowerCase() !== ownerName.toLowerCase()) {
        return { success: false, error: 'Username already in use' };
      }

      const now = Date.now();
      setOwnerName(trimmed);
      setNameChangedAt(now);
      await persistState({ ownerName: trimmed, nameChangedAt: now });
      return { success: true };
    },
    [ownerName, persistState]
  );

  const updateOwnerPhoto = useCallback(
    async (uri: string) => {
      setOwnerPhoto(uri);
      await persistState({ ownerPhoto: uri });
    },
    [persistState]
  );

  const updateOwnerPhone = useCallback(
    async (newPhone: string) => {
      const trimmed = newPhone.trim();
      setOwnerPhone(trimmed);
      await persistState({ ownerPhone: trimmed });
    },
    [persistState]
  );

  const updateOwnerEmail = useCallback(
    async (newEmail: string) => {
      const trimmed = newEmail.trim();
      setOwnerEmail(trimmed);
      await persistState({ ownerEmail: trimmed });
    },
    [persistState]
  );

  const updateNotificationSettings = useCallback(
    async (push: boolean, email: boolean) => {
      setPushNotificationsEnabled(push);
      setEmailNotificationsEnabled(email);
      await persistState({
        pushNotificationsEnabled: push,
        emailNotificationsEnabled: email,
      });
    },
    [persistState]
  );

  const clearProfile = useCallback(async () => {
    await AsyncStorage.removeItem(PROFILE_STORAGE_KEY);
    setOwnerName(defaultProfile.ownerName);
    setOwnerEmail(defaultProfile.ownerEmail);
    setOwnerPhone(defaultProfile.ownerPhone);
    setOwnerRole(defaultProfile.ownerRole);
    setOwnerPhoto(defaultProfile.ownerPhoto);
    setUnreadNotificationsCount(defaultProfile.unreadNotificationsCount);
    setPushNotificationsEnabled(defaultProfile.pushNotificationsEnabled);
    setEmailNotificationsEnabled(defaultProfile.emailNotificationsEnabled);
    setNameChangedAt(null);
  }, []);

  return (
    <ProviderProfileContext.Provider
      value={{
        ownerName,
        ownerEmail,
        ownerPhone,
        ownerRole,
        ownerPhoto,
        unreadNotificationsCount,
        pushNotificationsEnabled,
        emailNotificationsEnabled,
        nameChangedAt,
        isNameLocked,
        nameChangeLockDaysRemaining,
        updateOwnerName,
        updateOwnerPhoto,
        updateOwnerPhone,
        updateOwnerEmail,
        updateNotificationSettings,
        clearProfile,
      }}
    >
      {children}
    </ProviderProfileContext.Provider>
  );
};

export const useProviderProfile = () => useContext(ProviderProfileContext);
