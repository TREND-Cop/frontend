import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { useStaffLoginStore } from './StaffLoginContext';

/**
 * Dev-only Bio sample toggle and mock data matching Figma Frame.
 * Setting DEV_USE_STAFF_BIO_SAMPLE to true provides the Figma preview values;
 * setting to false provides the default backend stub (empty/null/false).
 */
export const DEV_USE_STAFF_BIO_SAMPLE = true;

export const DEV_SAMPLE_STAFF_BIO = {
  avatar: require('../../assets/images/staff/james_kalba_avatar.png'),
  workHours: '7:30am - 9:30pm',
  staffRole: 'Nail Artist & Barber',
  experience: '5 Years experience',
  workDays: 'Monday, Wednesday, Fiday',
  breakTime: '7:30am - 9:30pm',
  isVerified: false,
};

export interface StaffBioData {
  avatar: any | string | null;
  workHours: string | null;
  staffRole: string | null;
  experience: string | null;
  workDays: string | null;
  breakTime: string | null;
  isVerified: boolean;
}

export interface StaffProfileContextType {
  fullName: string;
  loginCode: string;
  bio: StaffBioData;
  setBio: (bio: Partial<StaffBioData>) => void;
  clearStaffProfile: () => void;
}

const defaultEmptyBio: StaffBioData = {
  avatar: null,
  workHours: null,
  staffRole: null,
  experience: null,
  workDays: null,
  breakTime: null,
  isVerified: false,
};

const StaffProfileContext = createContext<StaffProfileContextType | undefined>(undefined);

export const StaffProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { fullName: sessionName, verifiedCode: sessionCode } = useStaffLoginStore();

  const [bio, setBioState] = useState<StaffBioData>(() => {
    if (DEV_USE_STAFF_BIO_SAMPLE) {
      return DEV_SAMPLE_STAFF_BIO;
    }
    return defaultEmptyBio;
  });

  const setBio = useCallback((patch: Partial<StaffBioData>) => {
    setBioState((prev) => ({ ...prev, ...patch }));
  }, []);

  const clearStaffProfile = useCallback(() => {
    setBioState(defaultEmptyBio);
  }, []);

  const fullName = sessionName?.trim() || 'James Kalba';
  const loginCode = sessionCode?.trim() || '1234';

  const value = useMemo(
    () => ({
      fullName,
      loginCode,
      bio,
      setBio,
      clearStaffProfile,
    }),
    [fullName, loginCode, bio, setBio, clearStaffProfile]
  );

  return <StaffProfileContext.Provider value={value}>{children}</StaffProfileContext.Provider>;
};

export function useStaffProfile(): StaffProfileContextType {
  const context = useContext(StaffProfileContext);
  if (!context) {
    throw new Error('useStaffProfile must be used within a StaffProfileProvider');
  }
  return context;
}

export default StaffProfileContext;

