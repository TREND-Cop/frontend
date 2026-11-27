import React, { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react';
import { DEV_SAMPLE_STAFF, MOCK_SAMPLE_STAFF } from '../constants/staff.config';
import { loadFromStorage, saveToStorage, STORAGE_KEYS } from '../utils/providerStorage';
import { addStaffMember as addStoreStaffMember } from '../store/staffStore';
import { trendApi, getAuthToken, extractArray } from '../api/trendApi';

function syncMemberToStore(member: StaffMember) {
  try {
    const rawPhoto = member.photoUri ?? member.avatarUri;
    const avatar = rawPhoto
      ? (typeof rawPhoto === 'string' ? { uri: rawPhoto } : rawPhoto)
      : require('../../assets/images/profile/1007604716.jpg');

    addStoreStaffMember({
      id: member.id,
      name: member.name,
      role: member.role || (member.roles && member.roles[0]) || 'Barber',
      status: 'Available',
      statusCode: 'available',
      hours: member.workHours ? `${member.workHours.start} - ${member.workHours.end}` : '8am - 10pm',
      avatar,
      gender: 'Male',
      experience: `${member.experienceYears || 1} Years experience`,
      client: {
        name: 'Client',
        badge: 'Regular',
        avatar,
        gender: 'Male',
        badgeStatus: 'active',
        membership: 'Standard',
      },
      service: {
        title: 'Professional Service',
        rating: '5.0',
        duration: '1hr',
        price: '₦10,000',
        image: avatar,
      },
      appointmentInfo: {
        date: 'Today',
        time: '12:00 PM',
        type: 'Walk-in',
      },
      addOn: {
        title: 'Package Add-on',
        price: '₦2,500',
        duration: '15 mins',
        rating: '5.0',
        image: avatar,
      },
      note: {
        text: 'Staff specialist',
        count: '1',
      },
      package: {
        price: '₦12,500',
        images: [avatar],
        items: ['Service'],
      },
      summary: {
        appointmentCost: '₦10,000',
        paymentType: 'Card',
        total: '₦12,500',
      },
    });
  } catch (err) {
    console.warn('[StaffContext] Failed to sync member to store:', err);
  }
}

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
  isAtWork?: boolean;
  portfolio?: PortfolioPhoto[];
}

export interface StaffContextType {
  staff: StaffMember[];
  ownerIsProvider: boolean;
  addStaff: (member: Omit<StaffMember, 'id'> | StaffMember) => Promise<StaffMember>;
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

  // Hydrate staff list from storage and live backend on mount
  useEffect(() => {
    let isMounted = true;
    const hydrateStaff = async () => {
      const saved = await loadFromStorage<StaffMember[] | null>(STORAGE_KEYS.STAFF_LIST, null);
      const base = DEV_SAMPLE_STAFF ? MOCK_SAMPLE_STAFF : [];
      let localList: StaffMember[] = base;

      if (isMounted && saved) {
        const normalizedSaved = saved.map((s) => ({
          ...s,
          loginCode: s.loginCode ?? null,
        }));
        const existingIds = new Set(normalizedSaved.map((s) => s.id));
        localList = [...normalizedSaved, ...base.filter((s) => !existingIds.has(s.id))];
        setStaff(localList);
        normalizedSaved.forEach((m) => syncMemberToStore(m));
      }

      try {
        const token = await getAuthToken('business');
        if (!token || !isMounted) return;
        const res = await trendApi.business.listStaff();
        if (!res.ok || !res.data || !isMounted) return;
        const remoteRows = extractArray<any>(res.data, ['staff']);
        if (remoteRows.length === 0) return;

        const mappedRemote: StaffMember[] = remoteRows.map((row: any) => ({
          id: String(row.id || `staff_${Date.now()}`),
          name: row.name || 'Staff Member',
          role: row.title || row.role || 'Specialist',
          roles: [row.title || row.role || 'Specialist'],
          photoUri: row.image || null,
          avatarUri: row.image || null,
          experienceYears: Number(row.experience_years || 1),
          yearsExperience: Number(row.experience_years || 1),
          workHours: null,
          breakHours: null,
          workDays: [],
          loginCode: row.login_code || row.code || null,
          isVerified: Boolean(row.verified ?? row.is_verified ?? true),
        }));
        const remoteIds = new Set(mappedRemote.map((m) => m.id));
        const merged = [...mappedRemote, ...localList.filter((m) => !remoteIds.has(m.id))];
        setStaff(merged);
        mappedRemote.forEach((m) => syncMemberToStore(m));
      } catch {
        // Keep local list intact
      }
    };
    hydrateStaff();
    return () => {
      isMounted = false;
    };
  }, []);

  // Persist staff list on updates
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.STAFF_LIST, staff);
  }, [staff]);

  const addStaff = useCallback(async (member: Omit<StaffMember, 'id'> | StaffMember): Promise<StaffMember> => {
    const id = 'id' in member && member.id ? member.id : `staff_${Date.now()}`;
    const roles = member.roles || (member.role ? [member.role] : []);
    const role = member.role || (roles.length > 0 ? roles[0] : '');
    const experienceYears = member.experienceYears ?? member.yearsExperience ?? 0;
    const photoUri = member.photoUri ?? member.avatarUri ?? null;

    let finalMember: StaffMember = {
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

    try {
      const token = await getAuthToken('business');
      if (token) {
        let uploadedPhotoUrl: string | undefined;
        if (photoUri && !photoUri.startsWith('http')) {
          const up = await trendApi.uploads
            .uploadMedia(photoUri, 'staff_avatar.jpg', 'image/jpeg', 'business')
            .catch(() => null);
          uploadedPhotoUrl = up?.data?.url || up?.data?.secure_url;
        }
        const res = await trendApi.business.addStaff({
          name: finalMember.name,
          phone: (finalMember as any).phone || '',
          title: finalMember.role || 'Specialist',
        });
        if (res.ok && res.data) {
          const remoteStaff = res.data.staff || res.data;
          const remoteId = remoteStaff?.id ? String(remoteStaff.id) : id;
          const remoteCode = remoteStaff?.login_code || remoteStaff?.code || finalMember.loginCode;
          finalMember = {
            ...finalMember,
            id: remoteId,
            photoUri: uploadedPhotoUrl || finalMember.photoUri,
            avatarUri: uploadedPhotoUrl || finalMember.avatarUri,
            loginCode: remoteCode ?? finalMember.loginCode,
          };
          if (uploadedPhotoUrl) {
            trendApi.business
              .updateStaff(remoteId, { image: uploadedPhotoUrl })
              .catch(() => {});
          }
        }
      }
    } catch {
      // Keep local member if offline
    }

    setStaff((prev) => [finalMember, ...prev.filter((item) => item.id !== finalMember.id && item.id !== id)]);
    syncMemberToStore(finalMember);
    return finalMember;
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
    getAuthToken('business')
      .then((token) => {
        if (!token) return null;
        const payload: Record<string, any> = {};
        if (updates.name) payload.name = updates.name;
        if (updates.role || (updates.roles && updates.roles[0])) {
          payload.title = updates.role || updates.roles?.[0];
        }
        if ((updates as any).phone) payload.phone = (updates as any).phone;
        if (Object.keys(payload).length === 0) return null;
        return trendApi.business.updateStaff(id, payload);
      })
      .catch(() => {});
  }, []);

  const removeStaff = useCallback((id: string) => {
    setStaff((prev) => prev.filter((item) => item.id !== id));
    getAuthToken('business')
      .then((token) => (token ? trendApi.business.deleteStaff(id) : null))
      .catch(() => {});
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

