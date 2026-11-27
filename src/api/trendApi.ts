import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const DEFAULT_API_BASE_URL = 'https://backend.trend-api.workers.dev';

export const API_BASE_URL = (
  process.env.EXPO_PUBLIC_API_BASE_URL || DEFAULT_API_BASE_URL
).replace(/\/+$/, '');

const CUSTOMER_TOKEN_KEY = '@trend_customer_auth_token';

let cachedToken: string | null | undefined = undefined;

/** Ephemeral in-memory draft for multi-step auth/reset flows (never persisted to disk). */
interface CustomerAuthDraft {
  phone?: string;
  email?: string;
  password?: string;
  name?: string;
  resetPassword?: string;
  resetIdentifier?: string;
}

let pendingAuthDraft: CustomerAuthDraft = {};

export function setPendingAuthDraft(partial: Partial<CustomerAuthDraft>): void {
  pendingAuthDraft = { ...pendingAuthDraft, ...partial };
}

export function getPendingAuthDraft(): CustomerAuthDraft {
  return pendingAuthDraft;
}

export function clearPendingAuthDraft(): void {
  pendingAuthDraft = {};
}

export async function getAuthToken(): Promise<string | null> {
  if (cachedToken !== undefined) {
    return cachedToken;
  }
  try {
    const token = await AsyncStorage.getItem(CUSTOMER_TOKEN_KEY);
    cachedToken = token || null;
    return cachedToken;
  } catch {
    cachedToken = null;
    return null;
  }
}

export async function setAuthToken(token: string | null): Promise<void> {
  cachedToken = token || null;
  try {
    if (token) {
      await AsyncStorage.setItem(CUSTOMER_TOKEN_KEY, token);
    } else {
      await AsyncStorage.removeItem(CUSTOMER_TOKEN_KEY);
    }
  } catch {
    // Non-fatal storage error
  }
}

export async function clearAuthToken(): Promise<void> {
  await setAuthToken(null);
}

export interface ApiResponse<T = any> {
  ok: boolean;
  status: number;
  data: T | null;
  error?: string;
  detail?: string;
}

export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: any;
  query?: Record<string, string | number | boolean | undefined | null>;
  auth?: boolean;
  headers?: Record<string, string>;
  timeoutMs?: number;
}

function buildUrl(
  path: string,
  query?: Record<string, string | number | boolean | undefined | null>
): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  let url = `${API_BASE_URL}${normalizedPath}`;
  if (query) {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== null && String(v).length > 0) {
        params.append(k, String(v));
      }
    });
    const qs = params.toString();
    if (qs) {
      url += (url.includes('?') ? '&' : '?') + qs;
    }
  }
  return url;
}

function safeParseJson(raw: string): any {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  try {
    return JSON.parse(trimmed);
  } catch {
    return null;
  }
}

export async function apiRequest<T = any>(
  path: string,
  options: ApiRequestOptions = {}
): Promise<ApiResponse<T>> {
  const {
    method = 'GET',
    body,
    query,
    auth = true,
    headers = {},
    timeoutMs = 15000,
  } = options;

  const url = buildUrl(path, query);
  const requestHeaders: Record<string, string> = {
    Accept: 'application/json',
    ...headers,
  };

  if (auth) {
    const token = await getAuthToken();
    if (token) {
      requestHeaders.Authorization = `Bearer ${token}`;
    }
  }

  let fetchBody: any = undefined;
  if (body !== undefined && body !== null) {
    if (typeof FormData !== 'undefined' && body instanceof FormData) {
      fetchBody = body;
    } else {
      requestHeaders['Content-Type'] = 'application/json';
      fetchBody = JSON.stringify(body);
    }
  }

  const controller = typeof AbortController !== 'undefined' ? new AbortController() : undefined;
  const timer =
    controller && timeoutMs > 0
      ? setTimeout(() => {
          controller.abort();
        }, timeoutMs)
      : undefined;

  try {
    const res = await fetch(url, {
      method,
      headers: requestHeaders,
      body: fetchBody,
      signal: controller?.signal,
    });

    const rawText = await res.text();
    const parsed = safeParseJson(rawText);

    if (!res.ok) {
      const errorMsg =
        (parsed && (parsed.error || parsed.message)) ||
        (rawText && rawText.length < 200 ? rawText : `Request failed (${res.status})`);
      const detail = parsed?.detail ? String(parsed.detail) : undefined;
      return {
        ok: false,
        status: res.status,
        data: parsed,
        error: String(errorMsg),
        detail,
      };
    }

    return {
      ok: true,
      status: res.status,
      data: parsed as T | null,
    };
  } catch (err: any) {
    const isAbort = err?.name === 'AbortError';
    return {
      ok: false,
      status: 0,
      data: null,
      error: isAbort ? 'Request timed out' : err?.message || 'Network error',
    };
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export function extractToken(data: any): string | null {
  if (!data || typeof data !== 'object') return null;
  const candidate =
    data.token ||
    data.access_token ||
    data.accessToken ||
    data.jwt ||
    data.data?.token ||
    data.data?.access_token;
  return typeof candidate === 'string' && candidate.length > 0 ? candidate : null;
}

export function extractArray<T = any>(data: any, keys: string[] = []): T[] {
  if (Array.isArray(data)) return data as T[];
  if (!data || typeof data !== 'object') return [];
  const searchKeys = [...keys, 'items', 'data', 'results'];
  for (const key of searchKeys) {
    if (Array.isArray(data[key])) {
      return data[key] as T[];
    }
  }
  return [];
}

export interface BankDetailsResponse {
  bank_name?: string;
  account_number?: string;
  account_name?: string;
}

export const trendApi = {
  baseUrl: API_BASE_URL,

  health: () => apiRequest<{ ok: boolean; time?: string }>('/api/health', { auth: false }),

  auth: {
    register: async (payload: {
      role?: 'client' | 'business';
      name: string;
      email?: string;
      phone?: string;
      password: string;
    }) => {
      const res = await apiRequest<any>('/api/auth/register', {
        method: 'POST',
        auth: false,
        body: { role: 'client', ...payload },
      });
      const token = res.ok ? extractToken(res.data) : null;
      if (token) {
        await setAuthToken(token);
      }
      return res;
    },

    login: async (payload: { identifier: string; password: string }) => {
      const res = await apiRequest<any>('/api/auth/login', {
        method: 'POST',
        auth: false,
        body: payload,
      });
      const token = res.ok ? extractToken(res.data) : null;
      if (token) {
        await setAuthToken(token);
      }
      return res;
    },

    google: async (payload: { id_token: string; role?: 'client' | 'business' }) => {
      const res = await apiRequest<any>('/api/auth/google', {
        method: 'POST',
        auth: false,
        body: { role: 'client', ...payload },
      });
      const token = res.ok ? extractToken(res.data) : null;
      if (token) {
        await setAuthToken(token);
      }
      return res;
    },

    otpSend: (payload: { target: string }) =>
      apiRequest<any>('/api/auth/otp/send', {
        method: 'POST',
        auth: false,
        body: payload,
      }),

    otpVerify: (payload: { target: string; code: string }) =>
      apiRequest<any>('/api/auth/otp/verify', {
        method: 'POST',
        auth: false,
        body: payload,
      }),

    forgotPassword: (payload: { identifier: string }) =>
      apiRequest<any>('/api/auth/password/forgot', {
        method: 'POST',
        auth: false,
        body: payload,
      }),

    resetPassword: (payload: { identifier: string; code: string; new_password: string }) =>
      apiRequest<any>('/api/auth/password/reset', {
        method: 'POST',
        auth: false,
        body: payload,
      }),

    me: () => apiRequest<any>('/api/auth/me', { method: 'GET', auth: true }),

    deleteAccount: async () => {
      const res = await apiRequest<any>('/api/auth/me', { method: 'DELETE', auth: true });
      if (res.ok) {
        await clearAuthToken();
      }
      return res;
    },
  },

  profile: {
    update: (payload: {
      name?: string;
      email?: string;
      phone?: string;
      image?: string;
      settings?: { sms?: boolean; email?: boolean };
      [key: string]: any;
    }) =>
      apiRequest<any>('/api/profile', {
        method: 'PUT',
        auth: true,
        body: payload,
      }),
  },

  uploads: {
    uploadMedia: async (uri: string, filename = 'upload.jpg', mimeType = 'image/jpeg') => {
      if (!uri) {
        return { ok: false, status: 0, data: null, error: 'Missing file URI' } as ApiResponse<any>;
      }
      if (/^https?:\/\//i.test(uri)) {
        return { ok: true, status: 200, data: { url: uri } } as ApiResponse<{ url: string }>;
      }
      const formData = new FormData();
      if (Platform.OS === 'web') {
        try {
          const blobRes = await fetch(uri);
          const blob = await blobRes.blob();
          formData.append('file', blob, filename);
        } catch {
          return { ok: false, status: 0, data: null, error: 'Unable to read local file' };
        }
      } else {
        formData.append('file', {
          uri,
          name: filename,
          type: mimeType,
        } as any);
      }
      return apiRequest<{ url?: string; secure_url?: string }>('/api/uploads', {
        method: 'POST',
        auth: true,
        body: formData,
        timeoutMs: 30000,
      });
    },
  },

  categories: {
    list: () => apiRequest<any>('/api/categories', { method: 'GET', auth: false }),
  },

  services: {
    list: (query?: { category?: string; business_id?: string; q?: string }) =>
      apiRequest<any>('/api/services', { method: 'GET', auth: false, query }),

    getById: (id: string) =>
      apiRequest<any>(`/api/services/${encodeURIComponent(id)}`, { method: 'GET', auth: false }),

    getReviews: (id: string) =>
      apiRequest<any>(`/api/services/${encodeURIComponent(id)}/reviews`, {
        method: 'GET',
        auth: false,
      }),

    createReview: (
      id: string,
      payload: { booking_id: string; rating: number; comment: string }
    ) =>
      apiRequest<any>(`/api/services/${encodeURIComponent(id)}/reviews`, {
        method: 'POST',
        auth: true,
        body: payload,
      }),

    getSpecialists: (id: string) =>
      apiRequest<any>(`/api/services/${encodeURIComponent(id)}/specialists`, {
        method: 'GET',
        auth: false,
      }),
  },

  availability: {
    get: (query: {
      service_id: string;
      date: string;
      staff_id?: string;
      addons?: string;
    }) => apiRequest<any>('/api/availability', { method: 'GET', auth: false, query }),
  },

  wishlist: {
    list: () => apiRequest<any>('/api/wishlist', { method: 'GET', auth: true }),

    add: (service_id: string) =>
      apiRequest<any>('/api/wishlist', {
        method: 'POST',
        auth: true,
        body: { service_id },
      }),

    remove: (service_id: string) =>
      apiRequest<any>(`/api/wishlist/${encodeURIComponent(service_id)}`, {
        method: 'DELETE',
        auth: true,
      }),
  },

  bookings: {
    create: (payload: {
      service_id: string;
      date: string;
      start: string;
      staff_id?: string;
      addons?: string[];
      appointment_type?: string;
      notes?: string;
    }) =>
      apiRequest<any>('/api/bookings', {
        method: 'POST',
        auth: true,
        body: payload,
      }),

    list: (query?: { status?: string; from?: string; to?: string; q?: string }) =>
      apiRequest<any>('/api/bookings', { method: 'GET', auth: true, query }),

    getById: (id: string) =>
      apiRequest<any>(`/api/bookings/${encodeURIComponent(id)}`, { method: 'GET', auth: true }),

    cancel: (id: string, reason = 'Cancelled by customer') =>
      apiRequest<any>(`/api/bookings/${encodeURIComponent(id)}/cancel`, {
        method: 'POST',
        auth: true,
        body: { reason },
      }),

    reschedule: (id: string, payload: { date: string; start: string }) =>
      apiRequest<any>(`/api/bookings/${encodeURIComponent(id)}/reschedule`, {
        method: 'POST',
        auth: true,
        body: payload,
      }),

    approve: (id: string) =>
      apiRequest<any>(`/api/bookings/${encodeURIComponent(id)}/approve`, {
        method: 'POST',
        auth: true,
      }),
  },

  conversations: {
    list: () => apiRequest<any>('/api/conversations', { method: 'GET', auth: true }),
  },

  messages: {
    list: (withUserId: string) =>
      apiRequest<any>('/api/messages', {
        method: 'GET',
        auth: true,
        query: { with: withUserId },
      }),

    send: (payload: { to: string; body: string; media_url?: string }) =>
      apiRequest<any>('/api/messages', {
        method: 'POST',
        auth: true,
        body: { media_url: '', ...payload },
      }),
  },

  notifications: {
    list: () => apiRequest<any>('/api/notifications', { method: 'GET', auth: true }),

    markRead: (id: string) =>
      apiRequest<any>(`/api/notifications/${encodeURIComponent(id)}/read`, {
        method: 'POST',
        auth: true,
      }),
  },

  settings: {
    updateNotifications: (payload: { sms: boolean; email: boolean }) =>
      apiRequest<any>('/api/settings/notifications', {
        method: 'PUT',
        auth: true,
        body: payload,
      }),
  },

  payments: {
    getBankDetails: () =>
      apiRequest<BankDetailsResponse>('/api/payments/bank-details', {
        method: 'GET',
        auth: false,
      }),

    submit: (payload: {
      booking_id: string;
      amount: number;
      method: string;
      reference?: string;
      proof_url?: string;
    }) =>
      apiRequest<any>('/api/payments', {
        method: 'POST',
        auth: true,
        body: payload,
      }),

    list: (query?: { status?: string }) =>
      apiRequest<any>('/api/payments', { method: 'GET', auth: true, query }),
  },
};
