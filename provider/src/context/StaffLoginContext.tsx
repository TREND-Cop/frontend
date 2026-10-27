import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';

/**
 * In-memory Staff Login State
 *
 * Holds verified code, full name, and business name during the login flow.
 * In-memory only; never logged, never persisted.
 * Cleared when navigating back to the entry screen.
 */
export interface StaffLoginContextType {
  verifiedCode: string | null;
  fullName: string | null;
  businessName: string | null;
  setVerifiedCode: (code: string | null) => void;
  setStaffDetails: (fullName: string, businessName: string) => void;
  clearStaffLogin: () => void;
}

const StaffLoginContext = createContext<StaffLoginContextType | undefined>(undefined);

export const StaffLoginProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [verifiedCode, setVerifiedCode] = useState<string | null>(null);
  const [fullName, setFullName] = useState<string | null>(null);
  const [businessName, setBusinessName] = useState<string | null>(null);

  const setStaffDetails = useCallback((name: string, business: string) => {
    setFullName(name);
    setBusinessName(business);
  }, []);

  const clearStaffLogin = useCallback(() => {
    setVerifiedCode(null);
    setFullName(null);
    setBusinessName(null);
  }, []);

  const value = useMemo(
    () => ({
      verifiedCode,
      fullName,
      businessName,
      setVerifiedCode,
      setStaffDetails,
      clearStaffLogin,
    }),
    [verifiedCode, fullName, businessName, setStaffDetails, clearStaffLogin]
  );

  return <StaffLoginContext.Provider value={value}>{children}</StaffLoginContext.Provider>;
};

export function useStaffLoginStore(): StaffLoginContextType {
  const context = useContext(StaffLoginContext);
  if (!context) {
    throw new Error('useStaffLoginStore must be used within a StaffLoginProvider');
  }
  return context;
}

export default StaffLoginContext;
