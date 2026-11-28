import { useState, useEffect, useCallback } from 'react';
import { trendApi, extractArray } from '../api/trendApi';
import type { SalonItem } from '../screens/home/mockSalons';

export interface LiveBackendService {
  id: string;
  business_id: string;
  owner_id?: string;
  business_name?: string;
  business_address?: string;
  business_city?: string;
  business_photos?: string[];
  category?: string;
  name: string;
  description?: string;
  price: number;
  duration: number;
  kind?: string;
  images: string[];
  rating?: number | null;
}

export interface LiveFeedCard {
  id: string;
  serviceId: string;
  businessId: string;
  salonName: string;
  image: any;
  title: string;
  price: number;
  rating: number;
  audience: string;
  providerLocation: string;
  location: string;
  duration: string;
  category: string;
  onPress: () => void;
}

const FALLBACK_SERVICE_IMAGE =
  'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80';

let cachedServices: LiveBackendService[] = [];
let cachedAt = 0;
const CACHE_TTL_MS = 30_000;

function formatNaira(n: number): string {
  return `₦${Math.round(Number(n || 0)).toLocaleString()}`;
}

function formatDuration(mins: number): string {
  const m = Number(mins || 60);
  if (m >= 60) {
    const h = Math.floor(m / 60);
    const rem = m % 60;
    return rem === 0 ? `${h}hr` : `${h}hr ${rem}min`;
  }
  return `${m} min`;
}

function normalizeServiceRow(row: any): LiveBackendService {
  let images: string[] = [];
  if (Array.isArray(row.images)) {
    images = row.images.filter((u: any) => typeof u === 'string' && u.length > 0);
  } else if (typeof row.images === 'string') {
    try {
      const parsed = JSON.parse(row.images);
      if (Array.isArray(parsed)) images = parsed;
    } catch {}
  }
  let businessPhotos: string[] = [];
  if (Array.isArray(row.business_photos)) {
    businessPhotos = row.business_photos.filter((u: any) => typeof u === 'string' && u.length > 0);
  } else if (typeof row.business_photos === 'string') {
    try {
      const parsed = JSON.parse(row.business_photos);
      if (Array.isArray(parsed)) businessPhotos = parsed;
    } catch {}
  }
  return {
    id: String(row.id || ''),
    business_id: String(row.business_id || row.id || ''),
    owner_id: row.owner_id ? String(row.owner_id) : undefined,
    business_name: row.business_name || 'TREND Salon',
    business_address: row.business_address || row.address || '',
    business_city: row.business_city || row.city || '',
    business_photos: businessPhotos,
    category: row.category || 'Hair',
    name: row.name || 'Service',
    description: row.description || '',
    price: Number(row.price || 0),
    duration: Number(row.duration || 60),
    kind: row.kind || 'service',
    images,
    rating: row.rating !== undefined && row.rating !== null ? Number(row.rating) : 4.8,
  };
}

export function mapServicesToFeedCards(services: LiveBackendService[]): LiveFeedCard[] {
  return services.map((s) => {
    const location =
      [s.business_address, s.business_city].filter(Boolean).join(', ') || 'Abuja';
    return {
      id: s.id,
      serviceId: s.id,
      businessId: s.business_id,
      salonName: s.business_name || 'TREND Salon',
      image: s.images[0] || FALLBACK_SERVICE_IMAGE,
      title: s.name,
      price: s.price,
      rating: s.rating || 4.8,
      audience: 'Male & Female',
      providerLocation: location,
      location,
      duration: formatDuration(s.duration),
      category: s.category || 'Hair',
      onPress: () => {},
    };
  });
}

export function mapServicesToSalons(services: LiveBackendService[]): SalonItem[] {
  const byBiz = new Map<string, LiveBackendService[]>();
  for (const s of services) {
    const key = s.business_id || s.id;
    const list = byBiz.get(key) || [];
    list.push(s);
    byBiz.set(key, list);
  }

  const salons: SalonItem[] = [];
  byBiz.forEach((bizServices, bizId) => {
    const first = bizServices[0];
    const prices = bizServices.map((s) => s.price).filter((p) => p > 0);
    const minPrice = prices.length ? Math.min(...prices) : 0;
    const maxPrice = prices.length ? Math.max(...prices) : minPrice;
    const images = Array.from(
      new Set([
        ...(first.business_photos || []),
        ...bizServices.flatMap((s) => s.images),
      ].filter(Boolean))
    );
    const categories = Array.from(
      new Set(bizServices.map((s) => s.category || 'Hair'))
    );
    const ratings = bizServices.map((s) => s.rating || 4.8);
    const avgRating =
      Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10;
    const location =
      [first.business_address, first.business_city].filter(Boolean).join(', ') ||
      'Abuja';

    salons.push({
      id: bizId,
      ownerId: first.owner_id,
      name: first.business_name || 'TREND Salon',
      rating: avgRating,
      reviews: bizServices.length * 12,
      distance: '2.5 km',
      numericDistance: 2.5,
      isOpen: true,
      location,
      time: '9am - 6pm',
      workDays: 'Monday - Saturday',
      workTime: '9am - 6pm',
      priceFrom: formatNaira(minPrice),
      priceTo: formatNaira(maxPrice),
      numericMinPrice: minPrice,
      numericMaxPrice: maxPrice,
      promoText: (first.name || 'BOOK NOW').toUpperCase(),
      isVerified: true,
      amenities: ['Wifi', 'Air Condition'],
      gender: 'unisex',
      openingTime: '9:00am',
      closingTime: '6:00pm',
      images: images.length > 0 ? images : [FALLBACK_SERVICE_IMAGE],
      categories,
    });
  });

  return salons;
}

export function useLiveCatalog(query?: { category?: string; business_id?: string; q?: string }) {
  const hasFilter = Boolean(query?.category || query?.business_id || query?.q);
  const [services, setServices] = useState<LiveBackendService[]>(() =>
    !hasFilter && cachedServices.length > 0 ? cachedServices : []
  );
  const [isLoading, setIsLoading] = useState(false);

  const fetchCatalog = useCallback(async () => {
    if (!hasFilter && cachedServices.length > 0 && Date.now() - cachedAt < CACHE_TTL_MS) {
      setServices(cachedServices);
      return;
    }
    setIsLoading(true);
    try {
      const res = await trendApi.services.list(query);
      if (res.ok && res.data) {
        const rows = extractArray<any>(res.data, ['services']).map(normalizeServiceRow);
        if (!hasFilter) {
          cachedServices = rows;
          cachedAt = Date.now();
        }
        setServices(rows);
      }
    } catch {
      // Keep graceful empty fallback
    } finally {
      setIsLoading(false);
    }
  }, [hasFilter, query?.category, query?.business_id, query?.q]);

  useEffect(() => {
    fetchCatalog();
  }, [fetchCatalog]);

  return {
    services,
    feedCards: mapServicesToFeedCards(services),
    salons: mapServicesToSalons(services),
    isLoading,
    refresh: fetchCatalog,
  };
}
