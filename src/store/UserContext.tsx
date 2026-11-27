import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { trendApi, getAuthToken, clearAuthToken } from '../api/trendApi';

const USER_STORAGE_KEY = '@trend_user_profile';

export interface NotificationSettings {
  push: boolean;
  email: boolean;
  promotional: boolean;
}

export interface UserProfileData {
  fullName: string | null;
  phone: string | null;
  email: string | null;
  username: string | null;
  avatarUri: string | null;
  location: string | null;
  gender: string | null;
  isLoggedIn: boolean;
  signupMethod: 'phone' | 'email';
  joinedAt: number;
  notificationSettings: NotificationSettings;
  twoStepEnabled: boolean;
  biometricsEnabled: boolean;
}

const DEFAULT_PROFILE: UserProfileData = {
  fullName: null,
  phone: null,
  email: null,
  username: null,
  avatarUri: null,
  location: null,
  gender: null,
  isLoggedIn: false,
  signupMethod: 'phone',
  joinedAt: Date.now() - 86400000 * 2, // 2 days ago default
  notificationSettings: {
    push: true,
    email: false,
    promotional: false,
  },
  twoStepEnabled: false,
  biometricsEnabled: false,
};

interface UserContextType {
  profileData: UserProfileData;
  updateProfile: (updates: Partial<UserProfileData>) => Promise<void>;
  setAvatarUri: (uri: string) => void;
  setLocation: (location: string) => void;
  setUsername: (username: string) => void;
  setPhone: (phone: string) => void;
  setEmail: (email: string) => void;
  setGender: (gender: string) => void;
  setNotificationSettings: (settings: Partial<NotificationSettings>) => void;
  setTwoStepEnabled: (enabled: boolean) => void;
  setBiometricsEnabled: (enabled: boolean) => void;
  logout: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profileData, setProfileData] = useState<UserProfileData>(DEFAULT_PROFILE);

  // Load saved profile on startup and hydrate from live backend when authenticated
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const stored = await AsyncStorage.getItem(USER_STORAGE_KEY);
        let initialProfile = DEFAULT_PROFILE;
        if (stored) {
          const parsed = JSON.parse(stored);
          initialProfile = {
            ...DEFAULT_PROFILE,
            ...parsed,
            notificationSettings: {
              ...DEFAULT_PROFILE.notificationSettings,
              ...(parsed.notificationSettings || {}),
            },
          };
          setProfileData(initialProfile);
        }

        const token = await getAuthToken();
        if (token) {
          const res = await trendApi.auth.me();
          if (res.ok && res.data) {
            const user = res.data.user || res.data;
            const merged: UserProfileData = {
              ...initialProfile,
              fullName: user.name ?? initialProfile.fullName,
              username: user.username ?? user.name ?? initialProfile.username,
              phone: user.phone ?? initialProfile.phone,
              email: user.email ?? initialProfile.email,
              avatarUri: user.image ?? initialProfile.avatarUri,
              isLoggedIn: true,
              notificationSettings: {
                ...initialProfile.notificationSettings,
                ...(typeof user.settings?.sms === 'boolean' ? { push: user.settings.sms } : {}),
                ...(typeof user.settings?.email === 'boolean' ? { email: user.settings.email } : {}),
              },
            };
            setProfileData(merged);
            AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(merged)).catch(() => {});
          } else if (res.status === 401) {
            await clearAuthToken();
            await AsyncStorage.removeItem(USER_STORAGE_KEY);
            setProfileData({ ...DEFAULT_PROFILE, isLoggedIn: false });
          }
        }
      } catch (err) {
        console.warn('Failed to load user profile from storage:', err);
      }
    };
    loadProfile();
  }, []);

  const updateProfile = useCallback(async (updates: Partial<UserProfileData>) => {
    let nextProfile: UserProfileData | null = null;
    setProfileData((prev) => {
      const updated = { ...prev, ...updates };
      nextProfile = updated;
      AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updated)).catch((err) =>
        console.warn('Failed to save user profile:', err)
      );
      return updated;
    });

    const hasRemoteFields =
      updates.fullName !== undefined ||
      updates.username !== undefined ||
      updates.phone !== undefined ||
      updates.email !== undefined ||
      updates.avatarUri !== undefined ||
      updates.notificationSettings !== undefined;

    if (!hasRemoteFields) return;

    try {
      const token = await getAuthToken();
      if (!token) return;

      const payload: Record<string, any> = {};
      if (updates.fullName !== undefined || updates.username !== undefined) {
        payload.name = updates.fullName || updates.username || undefined;
      }
      if (updates.email !== undefined && updates.email) {
        payload.email = updates.email;
      }
      if (updates.phone !== undefined && updates.phone) {
        payload.phone = updates.phone;
      }
      if (updates.avatarUri) {
        const uploadRes = await trendApi.uploads.uploadMedia(updates.avatarUri, 'avatar.jpg');
        const uploadedUrl = uploadRes.data?.url || uploadRes.data?.secure_url;
        if (uploadRes.ok && uploadedUrl) {
          payload.image = uploadedUrl;
        }
      }
      if (updates.notificationSettings) {
        payload.settings = {
          sms: updates.notificationSettings.push,
          email: updates.notificationSettings.email,
        };
      }
      if (Object.keys(payload).length > 0) {
        await trendApi.profile.update(payload);
      }
    } catch {
      // Keep local profile intact if offline
    }
    void nextProfile;
  }, []);

  const setAvatarUri = (uri: string) => {
    updateProfile({ avatarUri: uri });
  };

  const setLocation = (location: string) => {
    updateProfile({ location });
  };

  const setUsername = (username: string) => {
    updateProfile({ username });
  };

  const setPhone = (phone: string) => {
    updateProfile({ phone });
  };

  const setEmail = (email: string) => {
    updateProfile({ email });
  };

  const setGender = (gender: string) => {
    updateProfile({ gender });
  };

  const setNotificationSettings = (settings: Partial<NotificationSettings>) => {
    setProfileData((prev) => {
      const updated = {
        ...prev,
        notificationSettings: {
          ...prev.notificationSettings,
          ...settings,
        },
      };
      AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updated)).catch((err) =>
        console.warn('Failed to save user profile:', err)
      );
      getAuthToken()
        .then((token) => {
          if (token) {
            return trendApi.settings.updateNotifications({
              sms: updated.notificationSettings.push,
              email: updated.notificationSettings.email,
            });
          }
          return null;
        })
        .catch(() => {});
      return updated;
    });
  };

  const setTwoStepEnabled = (enabled: boolean) => {
    updateProfile({ twoStepEnabled: enabled });
  };

  const setBiometricsEnabled = (enabled: boolean) => {
    updateProfile({ biometricsEnabled: enabled });
  };

  const logout = async () => {
    try {
      await clearAuthToken();
      await Promise.all([
        AsyncStorage.removeItem(USER_STORAGE_KEY),
        AsyncStorage.removeItem('@trend_appointments_v3'),
        AsyncStorage.removeItem('@trend_favorites'),
        AsyncStorage.removeItem('@trend_conversations_v2'),
        AsyncStorage.removeItem('@trend_messages_v2'),
      ]);
      setProfileData({ ...DEFAULT_PROFILE, isLoggedIn: false });
    } catch (err) {
      console.warn('Failed to logout:', err);
    }
  };

  return (
    <UserContext.Provider
      value={{
        profileData,
        updateProfile,
        setAvatarUri,
        setLocation,
        setUsername,
        setPhone,
        setEmail,
        setGender,
        setNotificationSettings,
        setTwoStepEnabled,
        setBiometricsEnabled,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  return context;
};
