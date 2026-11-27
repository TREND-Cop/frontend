import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { DEV_SAMPLE_WORK_PHOTOS } from '../constants/postWork.config';
import { loadFromStorage, saveToStorage, STORAGE_KEYS } from '../utils/providerStorage';

// TODO (Backend): shape to confirm
export interface WorkPhoto {
  id: string;
  uri: any; // string URI from picker or require() asset source
  isNew?: boolean;
}

// Sample haircut asset matching Figma frames S1-S3
// TODO (Asset): Export 4 sample photos from Figma (format: PNG/JPG, square aspect ratio 171x171 or 358x358)
const SAMPLE_HAIRCUT_IMAGE = require('../../assets/images/appointments/hair_cut.jpg');

const INITIAL_DEV_PHOTOS: WorkPhoto[] = [
  { id: 'sample-1', uri: SAMPLE_HAIRCUT_IMAGE, isNew: false },
  { id: 'sample-2', uri: SAMPLE_HAIRCUT_IMAGE, isNew: false },
  { id: 'sample-3', uri: SAMPLE_HAIRCUT_IMAGE, isNew: false },
  { id: 'sample-4', uri: SAMPLE_HAIRCUT_IMAGE, isNew: false },
];

export interface WorkPhotosContextType {
  photos: WorkPhoto[];
  uploadWorkPhoto: (uri: string) => Promise<WorkPhoto>;
  deleteWorkPhotos: (ids: string[]) => Promise<void>;
  clearNewStatus: (id: string) => void;
}

const WorkPhotosContext = createContext<WorkPhotosContextType | null>(null);

export const WorkPhotosProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Store starts empty by default; preloads 4 sample photos only if DEV_SAMPLE_WORK_PHOTOS === true
  const [photos, setPhotos] = useState<WorkPhoto[]>(() => {
    return DEV_SAMPLE_WORK_PHOTOS ? INITIAL_DEV_PHOTOS : [];
  });

  // Hydrate work photos from storage on mount
  useEffect(() => {
    let isMounted = true;
    loadFromStorage<WorkPhoto[] | null>(STORAGE_KEYS.WORK_PHOTOS, null).then((saved) => {
      if (isMounted && saved && saved.length > 0) {
        setPhotos(saved);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Persist work photos on updates
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.WORK_PHOTOS, photos);
  }, [photos]);

  // Mock upload stub
  const uploadWorkPhoto = useCallback(async (uri: string): Promise<WorkPhoto> => {
    // TODO (Backend): replace with actual Supabase / storage bucket upload call
    await new Promise((resolve) => setTimeout(resolve, 1200));

    const newPhoto: WorkPhoto = {
      id: `work-photo-${Date.now()}`,
      uri,
      isNew: true,
    };

    setPhotos((prev) => [newPhoto, ...prev]);
    return newPhoto;
  }, []);

  // Mock delete stub
  const deleteWorkPhotos = useCallback(async (ids: string[]): Promise<void> => {
    // TODO (Backend): replace with actual Supabase / backend delete call
    await new Promise((resolve) => setTimeout(resolve, 400));

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
      uploadWorkPhoto,
      deleteWorkPhotos,
      clearNewStatus,
    }),
    [photos, uploadWorkPhoto, deleteWorkPhotos, clearNewStatus]
  );

  return (
    <WorkPhotosContext.Provider value={value}>
      {children}
    </WorkPhotosContext.Provider>
  );
};

export const useWorkPhotos = (): WorkPhotosContextType => {
  const context = useContext(WorkPhotosContext);
  if (!context) {
    throw new Error('useWorkPhotos must be used within a WorkPhotosProvider');
  }
  return context;
};
