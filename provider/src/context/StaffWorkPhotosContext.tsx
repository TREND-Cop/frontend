import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import {
  DEV_SAMPLE_STAFF_WORK_PHOTOS,
  DEV_STAFF_UPLOAD_STATUS,
  INITIAL_DEV_STAFF_PHOTOS,
  StaffWorkPhoto,
} from '../constants/staffWorkPhotos.config';
import { loadFromStorage, saveToStorage, STORAGE_KEYS } from '../utils/providerStorage';
import { trendApi, getAuthToken, extractArray } from '../api/trendApi';

export interface StaffWorkPhotosContextType {
  photos: StaffWorkPhoto[];
  uploadStaffWorkPhoto: (uri: string) => Promise<StaffWorkPhoto>;
  deleteStaffWorkPhotos: (ids: string[]) => Promise<void>;
  clearNewStatus: (id: string) => void;
}

const StaffWorkPhotosContext = createContext<StaffWorkPhotosContextType | null>(null);

export const StaffWorkPhotosProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Store starts empty by default; preloads sample photos only if DEV_SAMPLE_STAFF_WORK_PHOTOS === true
  const [photos, setPhotos] = useState<StaffWorkPhoto[]>(() => {
    return DEV_SAMPLE_STAFF_WORK_PHOTOS ? INITIAL_DEV_STAFF_PHOTOS : [];
  });

  // Hydrate staff photos from storage and live backend on mount
  useEffect(() => {
    let isMounted = true;
    const hydrate = async () => {
      const saved = await loadFromStorage<StaffWorkPhoto[] | null>(
        STORAGE_KEYS.STAFF_WORK_PHOTOS,
        null
      );
      if (isMounted && saved && saved.length > 0) {
        setPhotos(saved);
      }

      try {
        const token = await getAuthToken('staff');
        if (!token || !isMounted) return;
        const res = await trendApi.staff.listPortfolio();
        if (!res.ok || !res.data || !isMounted) return;
        const rows = extractArray<any>(res.data, ['portfolio', 'photos']);
        if (rows.length === 0) return;

        const mapped: StaffWorkPhoto[] = rows
          .filter((r: any) => Boolean(r.url || r.image))
          .map((r: any, idx: number) => ({
            id: String(r.id || `remote_photo_${idx}`),
            uri: r.url || r.image,
            isNew: false,
            approvalStatus: r.approved ? 'approved' : 'pending',
            createdAt: r.created_at || new Date().toISOString(),
          }));

        if (mapped.length > 0) {
          setPhotos((prev) => {
            const ids = new Set(mapped.map((m) => m.id));
            return [...mapped, ...prev.filter((p) => !ids.has(p.id))];
          });
        }
      } catch {
        // Keep local photos intact
      }
    };
    hydrate();
    return () => {
      isMounted = false;
    };
  }, []);

  // Persist staff photos on updates
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.STAFF_WORK_PHOTOS, photos);
  }, [photos]);

  // Upload staff portfolio photo via Cloudinary /api/uploads + /api/staff/portfolio
  const uploadStaffWorkPhoto = useCallback(async (uri: string): Promise<StaffWorkPhoto> => {
    let finalUri = uri;
    let finalId = `staff-work-photo-${Date.now()}`;

    try {
      const token = await getAuthToken('staff');
      if (token) {
        const up = await trendApi.uploads.uploadMedia(uri, 'staff_work.jpg', 'image/jpeg', 'staff');
        const uploadedUrl = up.data?.url || up.data?.secure_url;
        if (up.ok && uploadedUrl) {
          finalUri = uploadedUrl;
          const addRes = await trendApi.staff.addPortfolio(uploadedUrl);
          const createdId = addRes.data?.id || addRes.data?.portfolio?.id;
          if (addRes.ok && createdId) {
            finalId = String(createdId);
          }
        }
      } else {
        await new Promise((resolve) => setTimeout(resolve, 600));
      }
    } catch {
      // Keep local upload resilient if offline
    }

    const newPhoto: StaffWorkPhoto = {
      id: finalId,
      uri: finalUri,
      isNew: true,
      approvalStatus: DEV_STAFF_UPLOAD_STATUS,
      createdAt: new Date().toISOString(),
    };

    setPhotos((prev) => [newPhoto, ...prev]);
    return newPhoto;
  }, []);

  const deleteStaffWorkPhotos = useCallback(async (ids: string[]): Promise<void> => {
    try {
      const token = await getAuthToken('staff');
      if (token) {
        await Promise.all(
          ids.map((id) => trendApi.staff.deletePortfolio(id).catch(() => null))
        );
      } else {
        await new Promise((resolve) => setTimeout(resolve, 400));
      }
    } catch {
      // Keep local deletion resilient
    }

    const idSet = new Set(ids);
    setPhotos((prev) => prev.filter((p) => !idSet.has(p.id)));
  }, []);

  // Clear new badge status
  const clearNewStatus = useCallback((id: string) => {
    setPhotos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isNew: false } : p))
    );
  }, []);

  const value = useMemo(
    () => ({
      photos,
      uploadStaffWorkPhoto,
      deleteStaffWorkPhotos,
      clearNewStatus,
    }),
    [photos, uploadStaffWorkPhoto, deleteStaffWorkPhotos, clearNewStatus]
  );

  return (
    <StaffWorkPhotosContext.Provider value={value}>
      {children}
    </StaffWorkPhotosContext.Provider>
  );
};

export const useStaffWorkPhotos = (): StaffWorkPhotosContextType => {
  const context = useContext(StaffWorkPhotosContext);
  if (!context) {
    // Safe fallback if called outside provider
    return {
      photos: [],
      uploadStaffWorkPhoto: async () => ({
        id: '',
        uri: '',
        approvalStatus: 'pending',
        createdAt: '',
      }),
      deleteStaffWorkPhotos: async () => {},
      clearNewStatus: () => {},
    };
  }
  return context;
};
