import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const DEFAULT_API_BASE_URL = 'https://backend.trend-api.workers.dev';

export const API_BASE_URL = (
  process.env.EXPO_PUBLIC_API_BASE_URL || DEFAULT_API_BASE_URL
).replace(/\/+$/, '');

export type ProviderAuthRole = 'business' | 'staff';

const BUSINESS_TOKEN_KEY = '@trend_provider_auth_token';
const STAFF_TOKEN_KEY = '@trend_staff_auth_token';
const ACTIVE_ROLE_KEY = '@trend_provider_active_role';

let cachedBusinessToken: string | null | undefined = undefined;
let cachedStaffToken: string | null | undefined = undefined;
let cachedActiveRole: ProviderAuthRole | undefined = undefined;

/** Ephemeral in-memory draft for multi-step provider onboarding (never persisted to disk). */
interface ProviderAuthDraft {
  phone?: string;
  email?: string;
  password?: string;
  ownerName?: string;
  businessName?: string;
}

let pendingProviderAuthDraft: ProviderAuthDraft = {};

export function setPendingProviderAuthDraft(partial: Partial<ProviderAuthDraft>): void {
  pendingProviderAuthDraft = { ...pendingProviderAuthDraft, ...partial };
}

export function getPendingProviderAuthDraft(): ProviderAuthDraft {
  return pendingProviderAuthDraft;
}

export function clearPendingProviderAuthDraft(): void {
  pendingProviderAuthDraft = {};
}

export async function getActiveProviderRole(): Promise<ProviderAuthRole> {
  if (cachedActiveRole !== undefined) {
    return cachedActiveRole;
  }
  try {
    const saved = await AsyncStorage.getItem(ACTIVE_ROLE_KEY);
    cachedActiveRole = saved === 'staff' ? 'staff' : 'business';
    return cachedActiveRole;
  } catch {
    cachedActiveRole = 'business';
    return 'business';
  }
}

export async function setActiveProviderRole(role: ProviderAuthRole): Promise<void> {
  cachedActiveRole = role;
  try {
    await AsyncStorage.setItem(ACTIVE_ROLE_KEY, role);
  } catch {
    // Non-fatal storage error
  }
}

export async function getAuthToken(role?: ProviderAuthRole): Promise<string | null> {
  const effectiveRole = role ?? (await getActiveProviderRole());
  if (effectiveRole === 'staff') {
    if (cachedStaffToken !== undefined) return cachedStaffToken;
    try {
      const token = await AsyncStorage.getItem(STAFF_TOKEN_KEY);
      cachedStaffToken = token || null;
      return cachedStaffToken;
    } catch {
      cachedStaffToken = null;
      return null;
    }
  }
  if (cachedBusinessToken !== undefined) return cachedBusinessToken;
  try {
    const token = await AsyncStorage.getItem(BUSINESS_TOKEN_KEY);
    cachedBusinessToken = token || null;
    return cachedBusinessToken;
  } catch {
    cachedBusinessToken = null;
    return null;
  }
}

export async function setAuthToken(
  token: string | null,
  role: ProviderAuthRole = 'business'
): Promise<void> {
  const key = role === 'staff' ? STAFF_TOKEN_KEY : BUSINESS_TOKEN_KEY;
  if (role === 'staff') {
    cachedStaffToken = token || null;
  } else {
    cachedBusinessToken = token || null;
  }
  if (token) {
    await setActiveProviderRole(role);
  }
  try {
    if (token) {
      await AsyncStorage.setItem(key, token);
    } else {
      await AsyncStorage.removeItem(key);
    }
  } catch {
    // Non-fatal storage error
  }
}

export async function clearAuthToken(role?: ProviderAuthRole): Promise<void> {
  if (role) {
    await setAuthToken(null, role);
    return;
  }
  await Promise.all([setAuthToken(null, 'business'), setAuthToken(null, 'staff')]);
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
  role?: ProviderAuthRole;
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
    role,
    headers = {},
    timeoutMs = 15000,
  } = options;

  const url = buildUrl(path, query);
  const requestHeaders: Record<string, string> = {
    Accept: 'application/json',
    ...headers,
  };

  if (auth) {
    const token = await getAuthToken(role);
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
      role?: 'business' | 'client';
      name: string;
      email?: string;
      phone?: string;
      password: string;
    }) => {
      const res = await apiRequest<any>('/api/auth/register', {
        method: 'POST',
        auth: false,
        body: { role: 'business', ...payload },
      });
      const token = res.ok ? extractToken(res.data) : null;
      if (token) {
        await setAuthToken(token, 'business');
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
        await setAuthToken(token, 'business');
      }
      return res;
    },

    google: async (payload: { id_token: string; role?: 'business' | 'client' }) => {
      const res = await apiRequest<any>('/api/auth/google', {
        method: 'POST',
        auth: false,
        body: { role: 'business', ...payload },
      });
      const token = res.ok ? extractToken(res.data) : null;
      if (token) {
        await setAuthToken(token, 'business');
      }
      return res;
    },

    staffLogin: async (payload: { code: string }) => {
      const res = await apiRequest<any>('/api/auth/staff-login', {
        method: 'POST',
        auth: false,
        body: payload,
      });
      const token = res.ok ? extractToken(res.data) : null;
      if (token) {
        await setAuthToken(token, 'staff');
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

    me: (role?: ProviderAuthRole) =>
      apiRequest<any>('/api/auth/me', { method: 'GET', auth: true, role }),

    deleteAccount: async (role: ProviderAuthRole = 'business') => {
      const res = await apiRequest<any>('/api/auth/me', { method: 'DELETE', auth: true, role });
      if (res.ok) {
        await clearAuthToken(role);
      }
      return res;
    },
  },

  profile: {
    update: (
      payload: {
        name?: string;
        email?: string;
        phone?: string;
        image?: string;
        settings?: { sms?: boolean; email?: boolean };
        [key: string]: any;
      },
      role: ProviderAuthRole = 'business'
    ) =>
      apiRequest<any>('/api/profile', {
        method: 'PUT',
        auth: true,
        role,
        body: payload,
      }),
  },

  uploads: {
    uploadMedia: async (
      uri: string,
      filename = 'upload.jpg',
      mimeType = 'image/jpeg',
      role?: ProviderAuthRole
    ) => {
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
        role,
        body: formData,
        timeoutMs: 30000,
      });
    },
  },

  business: {
    register: (payload: {
      name: string;
      category?: string;
      description?: string;
      address?: string;
      city?: string;
      phone?: string;
      hours?: Record<string, [string, string]>;
      [key: string]: any;
    }) =>
      apiRequest<any>('/api/business', {
        method: 'POST',
        auth: true,
        role: 'business',
        body: payload,
      }),

    getMe: (role: ProviderAuthRole = 'business') =>
      apiRequest<any>('/api/business/me', { method: 'GET', auth: true, role }),

    updateMe: (payload: Record<string, any>) =>
      apiRequest<any>('/api/business/me', {
        method: 'PUT',
        auth: true,
        role: 'business',
        body: payload,
      }),

    listServices: () =>
      apiRequest<any>('/api/business/services', {
        method: 'GET',
        auth: true,
        role: 'business',
      }),

    createService: (payload: {
      name: string;
      category: string;
      description?: string;
      price: number;
      duration: number;
      kind?: 'service' | 'package';
      images?: string[];
      addons?: Array<{ name: string; price: number; duration: number }>;
      [key: string]: any;
    }) =>
      apiRequest<any>('/api/business/services', {
        method: 'POST',
        auth: true,
        role: 'business',
        body: payload,
      }),

    updateService: (id: string, payload: Record<string, any>) =>
      apiRequest<any>(`/api/business/services/${encodeURIComponent(id)}`, {
        method: 'PUT',
        auth: true,
        role: 'business',
        body: payload,
      }),

    deleteService: (id: string) =>
      apiRequest<any>(`/api/business/services/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        auth: true,
        role: 'business',
      }),

    addServiceAddon: (
      id: string,
      payload: { name: string; price: number; duration: number }
    ) =>
      apiRequest<any>(`/api/business/services/${encodeURIComponent(id)}/addons`, {
        method: 'POST',
        auth: true,
        role: 'business',
        body: payload,
      }),

    attachServiceImage: (id: string, url: string) =>
      apiRequest<any>(`/api/business/services/${encodeURIComponent(id)}/images`, {
        method: 'POST',
        auth: true,
        role: 'business',
        body: { url },
      }),

    removeServiceImage: (id: string, url: string) =>
      apiRequest<any>(`/api/business/services/${encodeURIComponent(id)}/images`, {
        method: 'DELETE',
        auth: true,
        role: 'business',
        body: { url },
      }),

    listStaff: () =>
      apiRequest<any>('/api/business/staff', {
        method: 'GET',
        auth: true,
        role: 'business',
      }),

    addStaff: (payload: { name: string; phone?: string; title?: string; [key: string]: any }) =>
      apiRequest<any>('/api/business/staff', {
        method: 'POST',
        auth: true,
        role: 'business',
        body: payload,
      }),

    updateStaff: (id: string, payload: Record<string, any>) =>
      apiRequest<any>(`/api/business/staff/${encodeURIComponent(id)}`, {
        method: 'PUT',
        auth: true,
        role: 'business',
        body: payload,
      }),

    deleteStaff: (id: string) =>
      apiRequest<any>(`/api/business/staff/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        auth: true,
        role: 'business',
      }),

    regenerateStaffCode: (id: string) =>
      apiRequest<any>(`/api/business/staff/${encodeURIComponent(id)}/new-code`, {
        method: 'POST',
        auth: true,
        role: 'business',
      }),

    updateStaffSchedule: (
      id: string,
      payload: { schedule: Record<string, [string, string]>; breaks?: Array<[string, string]> }
    ) =>
      apiRequest<any>(`/api/business/staff/${encodeURIComponent(id)}/schedule`, {
        method: 'PUT',
        auth: true,
        role: 'business',
        body: payload,
      }),

    listPendingPortfolio: () =>
      apiRequest<any>('/api/business/portfolio', {
        method: 'GET',
        auth: true,
        role: 'business',
      }),

    approvePortfolio: (id: string) =>
      apiRequest<any>(`/api/business/portfolio/${encodeURIComponent(id)}/approve`, {
        method: 'POST',
        auth: true,
        role: 'business',
      }),

    declinePortfolio: (id: string) =>
      apiRequest<any>(`/api/business/portfolio/${encodeURIComponent(id)}/decline`, {
        method: 'POST',
        auth: true,
        role: 'business',
      }),

    getBalance: () =>
      apiRequest<any>('/api/business/balance', {
        method: 'GET',
        auth: true,
        role: 'business',
      }),

    getPayout: () =>
      apiRequest<any>('/api/business/payout', {
        method: 'GET',
        auth: true,
        role: 'business',
      }),

    updatePayout: (payload: {
      bank_name: string;
      account_number: string;
      account_name: string;
    }) =>
      apiRequest<any>('/api/business/payout', {
        method: 'PUT',
        auth: true,
        role: 'business',
        body: payload,
      }),

    deletePayout: () =>
      apiRequest<any>('/api/business/payout', {
        method: 'DELETE',
        auth: true,
        role: 'business',
      }),
  },

  staff: {
    completeOnboarding: (payload: { name: string; title?: string; image?: string }) =>
      apiRequest<any>('/api/staff/onboarding', {
        method: 'PUT',
        auth: true,
        role: 'staff',
        body: payload,
      }),

    getMe: () =>
      apiRequest<any>('/api/staff/me', {
        method: 'GET',
        auth: true,
        role: 'staff',
      }),

    updateAvailability: (payload: {
      schedule: Record<string, [string, string]>;
      breaks?: Array<[string, string]>;
    }) =>
      apiRequest<any>('/api/staff/availability', {
        method: 'PUT',
        auth: true,
        role: 'staff',
        body: payload,
      }),

    addPortfolio: (url: string) =>
      apiRequest<any>('/api/staff/portfolio', {
        method: 'POST',
        auth: true,
        role: 'staff',
        body: { url },
      }),

    listPortfolio: () =>
      apiRequest<any>('/api/staff/portfolio', {
        method: 'GET',
        auth: true,
        role: 'staff',
      }),

    deletePortfolio: (id: string) =>
      apiRequest<any>(`/api/staff/portfolio/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        auth: true,
        role: 'staff',
      }),

    getStats: (query?: { from?: string; to?: string }) =>
      apiRequest<any>('/api/staff/stats', {
        method: 'GET',
        auth: true,
        role: 'staff',
        query,
      }),
  },

  bookings: {
    list: (
      query?: { status?: string; from?: string; to?: string; q?: string },
      role?: ProviderAuthRole
    ) => apiRequest<any>('/api/bookings', { method: 'GET', auth: true, role, query }),

    getById: (id: string, role?: ProviderAuthRole) =>
      apiRequest<any>(`/api/bookings/${encodeURIComponent(id)}`, {
        method: 'GET',
        auth: true,
        role,
      }),

    accept: (id: string) =>
      apiRequest<any>(`/api/bookings/${encodeURIComponent(id)}/accept`, {
        method: 'POST',
        auth: true,
        role: 'business',
      }),

    decline: (id: string, reason = 'Declined by business') =>
      apiRequest<any>(`/api/bookings/${encodeURIComponent(id)}/decline`, {
        method: 'POST',
        auth: true,
        role: 'business',
        body: { reason },
      }),

    cancel: (id: string, reason = 'Cancelled', role?: ProviderAuthRole) =>
      apiRequest<any>(`/api/bookings/${encodeURIComponent(id)}/cancel`, {
        method: 'POST',
        auth: true,
        role,
        body: { reason },
      }),

    reschedule: (
      id: string,
      payload: { date: string; start: string },
      role?: ProviderAuthRole
    ) =>
      apiRequest<any>(`/api/bookings/${encodeURIComponent(id)}/reschedule`, {
        method: 'POST',
        auth: true,
        role,
        body: payload,
      }),

    updateStatus: (
      id: string,
      status: 'awaiting_arrival' | 'in_progress' | 'cancelled',
      role?: ProviderAuthRole
    ) =>
      apiRequest<any>(`/api/bookings/${encodeURIComponent(id)}/status`, {
        method: 'POST',
        auth: true,
        role,
        body: { status },
      }),

    start: (id: string, role?: ProviderAuthRole) =>
      apiRequest<any>(`/api/bookings/${encodeURIComponent(id)}/start`, {
        method: 'POST',
        auth: true,
        role,
      }),

    complete: (id: string, role?: ProviderAuthRole) =>
      apiRequest<any>(`/api/bookings/${encodeURIComponent(id)}/complete`, {
        method: 'POST',
        auth: true,
        role,
      }),
  },

  conversations: {
    list: (role?: ProviderAuthRole) =>
      apiRequest<any>('/api/conversations', { method: 'GET', auth: true, role }),
  },

  messages: {
    list: (withUserId: string, role?: ProviderAuthRole) =>
      apiRequest<any>('/api/messages', {
        method: 'GET',
        auth: true,
        role,
        query: { with: withUserId },
      }),

    send: (
      payload: { to: string; body: string; media_url?: string },
      role?: ProviderAuthRole
    ) =>
      apiRequest<any>('/api/messages', {
        method: 'POST',
        auth: true,
        role,
        body: { media_url: '', ...payload },
      }),
  },

  notifications: {
    list: (role?: ProviderAuthRole) =>
      apiRequest<any>('/api/notifications', { method: 'GET', auth: true, role }),

    markRead: (id: string, role?: ProviderAuthRole) =>
      apiRequest<any>(`/api/notifications/${encodeURIComponent(id)}/read`, {
        method: 'POST',
        auth: true,
        role,
      }),
  },

  settings: {
    updateNotifications: (payload: { sms: boolean; email: boolean }) =>
      apiRequest<any>('/api/settings/notifications', {
        method: 'PUT',
        auth: true,
        role: 'business',
        body: payload,
      }),
  },

  payments: {
    getBankDetails: () =>
      apiRequest<BankDetailsResponse>('/api/payments/bank-details', {
        method: 'GET',
        auth: false,
      }),

    recordCash: (
      payload: { booking_id: string; amount: number },
      role?: ProviderAuthRole
    ) =>
      apiRequest<any>('/api/payments/cash', {
        method: 'POST',
        auth: true,
        role,
        body: payload,
      }),

    reportBusinessPayment: (payload: {
      amount: number;
      reference?: string;
      proof_url?: string;
    }) =>
      apiRequest<any>('/api/payments/business-report', {
        method: 'POST',
        auth: true,
        role: 'business',
        body: payload,
      }),

    list: (query?: { status?: string }, role?: ProviderAuthRole) =>
      apiRequest<any>('/api/payments', { method: 'GET', auth: true, role, query }),
  },

  stats: {
    getBusiness: (query?: { from?: string; to?: string }) =>
      apiRequest<any>('/api/stats/business', {
        method: 'GET',
        auth: true,
        role: 'business',
        query,
      }),

    getStaffById: (id: string, query?: { from?: string; to?: string }) =>
      apiRequest<any>(`/api/stats/staff/${encodeURIComponent(id)}`, {
        method: 'GET',
        auth: true,
        role: 'business',
        query,
      }),
  },
};
