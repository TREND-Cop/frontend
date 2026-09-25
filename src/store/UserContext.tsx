import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  fullName: 'Fabulous User',
  phone: '+234 8019238946',
  email: 'saulgoodman@gmail.com',
  username: 'fabulous_nails',
  avatarUri: null,
  location: 'Jabi, Lake Mall, Abuja',
  gender: 'Female',
  isLoggedIn: true,
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

  // Load saved profile on startup
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const stored = await AsyncStorage.getItem(USER_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setProfileData({
            ...DEFAULT_PROFILE,
            ...parsed,
            notificationSettings: {
              ...DEFAULT_PROFILE.notificationSettings,
              ...(parsed.notificationSettings || {}),
            },
          });
        }
      } catch (err) {
        console.warn('Failed to load user profile from storage:', err);
      }
    };
    loadProfile();
  }, []);

  const updateProfile = useCallback(async (updates: Partial<UserProfileData>) => {
    setProfileData((prev) => {
      const updated = { ...prev, ...updates };
      AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updated)).catch((err) =>
        console.warn('Failed to save user profile:', err)
      );
      return updated;
    });
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
      await AsyncStorage.removeItem(USER_STORAGE_KEY);
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
