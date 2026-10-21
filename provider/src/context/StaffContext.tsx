import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { DEV_SAMPLE_STAFF, MOCK_SAMPLE_STAFF } from '../constants/staff.config';

/**
 * StaffMember UI View-Model
 *
 * TODO (Backend): shape to confirm with backend schema
 */
export interface PortfolioPhoto {
  id: string;
  uri: any;
  isNew?: boolean;
}

export interface StaffMember {
  id: string;
  name: string;
  photoUri?: string | null;
  /** Backwards compatibility alias for wizard components */
  avatarUri?: string | null;
  roles?: string[];
  /** Backwards compatibility alias for single role views */
  role?: string;
  experienceYears?: number;
  /** Backwards compatibility alias for wizard components */
  yearsExperience?: number;
  workHours?: { start: string; end: string } | null;
  breakHours?: { start: string; end: string } | null;
  workDays?: string[];
  loginCode?: string | null;
  isVerified?: boolean;
  portfolio?: PortfolioPhoto[];
}

export interface StaffContextType {
  staff: StaffMember[];
  ownerIsProvider: boolean;
  addStaff: (member: Omit<StaffMember, 'id'> | StaffMember) => void;
  updateStaff: (id: string, updates: Partial<StaffMember>) => void;
  removeStaff: (id: string) => void;
  removePortfolioPhotos: (staffId: string, photoIds: string[]) => void;
  setOwnerIsProvider: (value: boolean) => void;
}

const StaffContext = createContext<StaffContextType | undefined>(undefined);

export const StaffProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Starts empty by default, seeded if DEV_SAMPLE_STAFF is true
  const [staff, setStaff] = useState<StaffMember[]>(() => {
    return DEV_SAMPLE_STAFF ? MOCK_SAMPLE_STAFF : [];
  });

  // Business-level flag: the owner chose "I don't have staff"
  const [ownerIsProvider, setOwnerIsProvider] = useState<boolean>(false);

  const addStaff = useCallback((member: Omit<StaffMember, 'id'> | StaffMember) => {
    setStaff((prev) => {
      const id = 'id' in member && member.id ? member.id : `staff_${Date.now()}`;
      const roles = member.roles || (member.role ? [member.role] : []);
      const role = member.role || (roles.length > 0 ? roles[0] : '');
      const experienceYears = member.experienceYears ?? member.yearsExperience ?? 0;
      const photoUri = member.photoUri ?? member.avatarUri ?? null;

      const newMember: StaffMember = {
        ...member,
        id,
        photoUri,
        avatarUri: photoUri,
        roles,
        role,
        experienceYears,
        yearsExperience: experienceYears,
        workHours: member.workHours ?? null,
        breakHours: member.breakHours ?? null,
        workDays: member.workDays ?? [],
        loginCode: member.loginCode ?? null,
        isVerified: member.isVerified ?? false,
      };

      return [...prev, newMember];
    });
  }, []);

  const updateStaff = useCallback((id: string, updates: Partial<StaffMember>) => {
    setStaff((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;

        const photoUri = updates.photoUri !== undefined ? updates.photoUri : (updates.avatarUri ?? item.photoUri);
        const roles = updates.roles ?? (updates.role ? [updates.role] : item.roles);
        const role = updates.role ?? (roles && roles.length > 0 ? roles[0] : item.role);
        const experienceYears = updates.experienceYears ?? updates.yearsExperience ?? item.experienceYears;

        return {
          ...item,
          ...updates,
          photoUri,
          avatarUri: photoUri,
          roles,
          role,
          experienceYears,
          yearsExperience: experienceYears,
        };
      })
    );
  }, []);

  const removeStaff = useCallback((id: string) => {
    setStaff((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const removePortfolioPhotos = useCallback((staffId: string, photoIds: string[]) => {
    setStaff((prev) =>
      prev.map((item) => {
        if (item.id !== staffId) return item;
        const currentPortfolio = item.portfolio || [];
        const updatedPortfolio = currentPortfolio.filter((p) => !photoIds.includes(p.id));
        return {
          ...item,
          portfolio: updatedPortfolio,
        };
      })
    );
  }, []);

  const value = useMemo<StaffContextType>(
    () => ({
      staff,
      ownerIsProvider,
      addStaff,
      updateStaff,
      removeStaff,
      removePortfolioPhotos,
      setOwnerIsProvider,
    }),
    [staff, ownerIsProvider, addStaff, updateStaff, removeStaff, removePortfolioPhotos]
  );

  return <StaffContext.Provider value={value}>{children}</StaffContext.Provider>;
};

/**
 * deleteStaffPhotos Stub
 * TODO (Backend): Connect to real backend photo deletion API
 */
export async function deleteStaffPhotos(
  _staffId: string,
  _photoIds: string[]
): Promise<void> {
  // Mock network delay (800-1200ms per spec)
  await new Promise((resolve) => setTimeout(resolve, 1000));
}

/**
 * useStaffStore Hook
 * Provides direct access to the app-level staff store.
 */
export function useStaffStore(): StaffContextType {
  const context = useContext(StaffContext);
  if (!context) {
    throw new Error('useStaffStore must be used within a StaffProvider');
  }
  return context;
}

export const useStaffContext = useStaffStore;

/**
 * useStaffMember Hook
 * Reads a single member from the staff store by id.
 */
export function useStaffMember(id: string | undefined): StaffMember | undefined {
  const { staff } = useStaffStore();
  return useMemo(() => {
    if (!id) return undefined;
    return staff.find((m) => m.id === id);
  }, [staff, id]);
}

/**
 * useStaffLoading Stub
 * TODO (Backend): Connect to real backend staff fetching lifecycle
 */
export function useStaffLoading(): boolean {
  return false;
}

