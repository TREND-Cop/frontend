import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  loadFromStorage,
  saveToStorage,
  STORAGE_KEYS,
} from '../utils/providerStorage';
import { StaffMember } from './useStaff';
import { ServicePackageItem, AddOnItem } from '../context/ServiceDraftContext';
import { trendApi, getAuthToken, extractArray } from '../api/trendApi';

function parseDurationToMinutes(duration?: string): number {
  if (!duration) return 60;
  const lower = duration.toLowerCase();
  const colonMatch = lower.match(/(\d+):(\d+)/);
  if (colonMatch) {
    return parseInt(colonMatch[1], 10) * 60 + parseInt(colonMatch[2], 10);
  }
  const hrMatch = lower.match(/(\d+(?:\.\d+)?)\s*h/);
  const minMatch = lower.match(/(\d+)\s*m/);
  let total = 0;
  if (hrMatch) total += Math.round(parseFloat(hrMatch[1]) * 60);
  if (minMatch) total += parseInt(minMatch[1], 10);
  if (total > 0) return total;
  const num = parseInt(lower.replace(/[^0-9]/g, ''), 10);
  return Number.isFinite(num) && num > 0 ? num : 60;
}

function mapBackendService(row: any): Service {
  const images = Array.isArray(row.images) ? row.images : [];
  const firstImg = images[0] || row.image || row.image_url || MEN_BRADE_IMG;
  const mins = Number(row.duration || 60);
  const durationLabel =
    mins >= 60
      ? mins % 60 === 0
        ? `${mins / 60}hr`
        : `${Math.floor(mins / 60)}:${String(mins % 60).padStart(2, '0')} hr`
      : `${mins}min`;
  return {
    id: String(row.id || `svc_${Date.now()}`),
    name: row.name || 'Service',
    imageUri: firstImg,
    images: images.length > 0 ? images : [firstImg],
    createdAt: row.created_at || new Date().toISOString(),
    isNew: Boolean(row.is_new),
    price: row.price !== undefined ? Number(row.price) : null,
    duration: durationLabel,
    discount: row.discount !== undefined ? Number(row.discount) : null,
    category: row.category,
    description: row.description,
    addOns: Array.isArray(row.addons)
      ? row.addons.map((a: any, idx: number) => ({
          id: String(a.id || idx),
          imageUri: a.image || '',
          name: a.name || 'Add-on',
          description: a.description || '',
          price: Number(a.price || 0),
          priceRaw: String(a.price || 0),
          duration: a.duration ? `${a.duration}min` : '15min',
        }))
      : [],
  };
}

/**
 * Service View-Model
 * Supports both grid list metadata and full service details.
 */
export interface Service {
  id: string;
  name: string;
  imageUri: any;
  images?: any[];
  createdAt: string; // ISO string in UTC or local timezone
  isNew?: boolean;
  price?: number | null;
  duration?: string;
  discount?: number | null;
  category?: any;
  description?: string;
  staff?: StaffMember[];
  addOns?: AddOnItem[];
  packages?: ServicePackageItem[];
}

const MEN_BRADE_IMG = require('../../assets/images/services/pop_men_haircut.png');
const TAPPER_FADE_IMG = require('../../assets/images/services/men_haircut.png');

/**
 * DEV ONLY flag:
 * Set to true to preview sample services from the design ('Men Brade' and 'Tapper Fade').
 */
export const DEV_SAMPLE_SERVICES: boolean = false;

/**
 * Generates sample services matching Figma frame F2 with dynamic, non-hardcoded dates.
 */
function getDevSampleServices(): Service[] {
  const now = new Date();
  const currentYear = now.getFullYear();

  // "11th 03, [currentYear]" per design demonstration
  const menBradeDate = new Date(currentYear, 2, 11, 10, 30, 0); // March 11
  const tapperFadeDate = new Date(currentYear, 2, 11, 14, 15, 0); // March 11

  return [
    {
      id: 'service-men-brade',
      name: 'Men Brade',
      imageUri: MEN_BRADE_IMG,
      images: [MEN_BRADE_IMG],
      createdAt: menBradeDate.toISOString(),
      isNew: false,
      price: 14200,
      duration: '1hr',
      discount: null,
      staff: [
        {
          id: 'staff-annabelle',
          name: 'Annabelle Gideon',
          role: 'Barber',
          yearsExperience: 5,
          avatarUri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
        },
        {
          id: 'staff-udoka',
          name: 'Udoka Oyemechi',
          role: 'Barber',
          yearsExperience: 5,
          avatarUri: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400',
        },
      ],
      addOns: [
        {
          id: 'addon-dry-wow',
          imageUri: 'https://images.unsplash.com/photo-1512690459411-b9245aed614b?w=400',
          name: 'Dry Wow Shampoo',
          description: 'After Shave treatment and hair refresh',
          price: 22700,
          priceRaw: '22700',
          duration: '24min',
        },
      ],
      packages: [
        {
          id: 'pkg-men-brade',
          images: [
            'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400',
            'https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?w=400',
            'https://images.unsplash.com/photo-1512290900672-1f416e910bd6?w=400',
          ],
          contents: 'Hair Washing\nConditioning & Wash\nManicure',
          price: 4500,
          priceRaw: '4500',
          duration: '1:30 hr',
        },
      ],
    },
    {
      id: 'service-tapper-fade',
      name: 'Tapper Fade',
      imageUri: TAPPER_FADE_IMG,
      images: [TAPPER_FADE_IMG],
      createdAt: tapperFadeDate.toISOString(),
      isNew: true, // Shows green "New" tag
      price: 8500,
      duration: '45min',
      discount: null,
      staff: [
        {
          id: 'staff-annabelle',
          name: 'Annabelle Gideon',
          role: 'Barber',
          yearsExperience: 5,
          avatarUri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
        },
      ],
      addOns: [],
      packages: [],
    },
  ];
}

type ServiceListener = () => void;
const serviceListeners: Set<ServiceListener> = new Set();

export function notifyServicesChanged() {
  serviceListeners.forEach((listener) => {
    try {
      listener();
    } catch (e) {
      console.warn('Error in service change listener:', e);
    }
  });
}

/**
 * Persists a newly created or updated service into browser memory / AsyncStorage.
 */
export async function addCreatedService(service: Service): Promise<void> {
  let finalService = service;
  try {
    const token = await getAuthToken('business');
    if (token) {
      const rawImages = (service.images && service.images.length > 0
        ? service.images
        : service.imageUri
        ? [service.imageUri]
        : []
      ).filter((img): img is string => typeof img === 'string' && img.length > 0);

      const uploadedUrls: string[] = [];
      for (let i = 0; i < rawImages.length; i++) {
        const up = await trendApi.uploads.uploadMedia(
          rawImages[i],
          `service_${i + 1}.jpg`,
          'image/jpeg',
          'business'
        );
        const url = up.data?.url || up.data?.secure_url;
        if (up.ok && url) {
          uploadedUrls.push(url);
        }
      }

      const categoryName =
        typeof service.category === 'string'
          ? service.category
          : (service.category as any)?.itemName ||
            (service.category as any)?.groupName ||
            service.category?.name ||
            service.category?.label ||
            'General';

      const createRes = await trendApi.business.createService({
        name: service.name,
        category: categoryName,
        description: service.description || '',
        price: Number(service.price || 0),
        duration: parseDurationToMinutes(service.duration),
        kind: 'service',
        images: uploadedUrls,
        addons: (service.addOns || []).map((a) => ({
          name: a.name,
          price: Number(a.price || 0),
          duration: parseDurationToMinutes(a.duration),
        })),
      });

      const createdId = createRes.data?.id || createRes.data?.service?.id;
      if (createRes.ok && createdId) {
        finalService = {
          ...service,
          id: String(createdId),
          images: uploadedUrls.length > 0 ? uploadedUrls : service.images,
          imageUri: uploadedUrls[0] || service.imageUri,
        };
      }
    }
  } catch {
    // Keep local creation intact if offline
  }

  const existing = await loadFromStorage<Service[]>(STORAGE_KEYS.SERVICES_LIST, []);
  const updated = [finalService, ...existing.filter((s) => s.id !== finalService.id && s.id !== service.id)];
  await saveToStorage(STORAGE_KEYS.SERVICES_LIST, updated);
  notifyServicesChanged();
}

/**
 * Hook to retrieve business services.
 * Automatically loads and syncs with browser memory / AsyncStorage.
 */
export function useServices(options?: { devSample?: boolean }): {
  services: Service[];
  isLoading: boolean;
  addService: (service: Service) => Promise<void>;
  deleteService: (id: string) => Promise<void>;
  deleteServices: (ids: string[]) => Promise<void>;
  reloadServices: () => Promise<void>;
} {
  const useDev = options?.devSample ?? DEV_SAMPLE_SERVICES;
  const [persistedServices, setPersistedServices] = useState<Service[]>([]);
  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const reloadServices = useCallback(async () => {
    const [stored, deleted] = await Promise.all([
      loadFromStorage<Service[]>(STORAGE_KEYS.SERVICES_LIST, []),
      loadFromStorage<string[]>('@trend_provider_deleted_services_ids', []),
    ]);
    let combined = stored.filter((s) => !deleted.includes(s.id));
    setPersistedServices(combined);
    setDeletedIds(deleted);
    setIsLoading(false);

    try {
      const token = await getAuthToken('business');
      if (token) {
        const res = await trendApi.business.listServices();
        if (res.ok && res.data) {
          const remoteRows = extractArray<any>(res.data, ['services']);
          if (remoteRows.length > 0) {
            const remoteMapped = remoteRows
              .map(mapBackendService)
              .filter((s) => !deleted.includes(s.id));
            const remoteIds = new Set(remoteMapped.map((s) => s.id));
            combined = [...remoteMapped, ...combined.filter((s) => !remoteIds.has(s.id))];
            setPersistedServices(combined);
            await saveToStorage(STORAGE_KEYS.SERVICES_LIST, combined);
          }
        }
      }
    } catch {
      // Keep local list intact
    }
  }, []);

  // Load persisted services on mount and subscribe to global changes
  useEffect(() => {
    let isMounted = true;
    reloadServices();

    const handleUpdate = () => {
      if (isMounted) {
        reloadServices();
      }
    };

    serviceListeners.add(handleUpdate);
    return () => {
      isMounted = false;
      serviceListeners.delete(handleUpdate);
    };
  }, [reloadServices]);

  const addService = useCallback(async (service: Service) => {
    setPersistedServices((prev) => [service, ...prev.filter((s) => s.id !== service.id)]);
    await addCreatedService(service);
  }, []);

  const deleteServices = useCallback(async (ids: string[]) => {
    const [existing, currentDeleted] = await Promise.all([
      loadFromStorage<Service[]>(STORAGE_KEYS.SERVICES_LIST, []),
      loadFromStorage<string[]>('@trend_provider_deleted_services_ids', []),
    ]);
    const updatedDeleted = Array.from(new Set([...currentDeleted, ...ids]));
    const filtered = existing.filter((s) => !ids.includes(s.id));
    await Promise.all([
      saveToStorage(STORAGE_KEYS.SERVICES_LIST, filtered),
      saveToStorage('@trend_provider_deleted_services_ids', updatedDeleted),
    ]);
    setDeletedIds(updatedDeleted);
    setPersistedServices(filtered);
    notifyServicesChanged();

    getAuthToken('business')
      .then((token) => {
        if (!token) return;
        ids.forEach((id) => {
          trendApi.business.deleteService(id).catch(() => {});
        });
      })
      .catch(() => {});
  }, []);

  const deleteService = useCallback(async (id: string) => {
    await deleteServices([id]);
  }, [deleteServices]);

  const services = useMemo(() => {
    const list: Service[] = [];
    const existingIds = new Set<string>();

    // 1. Newly created / persisted services go to the front
    for (const item of persistedServices) {
      if (!deletedIds.includes(item.id)) {
        list.push(item);
        existingIds.add(item.id);
      }
    }

    // 2. Sample services follow
    if (useDev) {
      for (const sample of getDevSampleServices()) {
        if (!existingIds.has(sample.id) && !deletedIds.includes(sample.id)) {
          list.push(sample);
        }
      }
    }

    return list;
  }, [useDev, persistedServices, deletedIds]);

  return {
    services,
    isLoading,
    addService,
    deleteService,
    deleteServices,
    reloadServices,
  };
}

export default useServices;
