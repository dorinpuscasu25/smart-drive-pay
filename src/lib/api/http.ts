export const VITE_API_URL = import.meta.env.VITE_API_URL;

if (!VITE_API_URL) {
  throw new Error('Missing VITE_API_URL');
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export class ApiError<T = unknown> extends Error {
  status: number;
  details?: T;

  constructor(status: number, message: string, details?: T) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

const BASE_URL = (VITE_API_URL ?? '').replace(/\/+$/, '');

export let getToken: () => Promise<string | null> = async () => null;
export const setAsyncTokenGetter = (fn: () => Promise<string | null>) => {
  getToken = fn;
};

let onUnauthorized: () => void = () => {
};
export const setOnUnauthorized = (fn: () => void) => {
  onUnauthorized = fn;
};

export type Query = Record<string, string | number | boolean | null | undefined>;
type RequestOptions = {
  data?: unknown;
  withAuth?: boolean;
  headers?: Record<string, string>;
  query?: Query;
  signal?: AbortSignal;
};

function normalizeLocale(locale?: string | null) {
  const value = (locale ?? '').trim().toLowerCase().replace('_', '-');
  const primary = value.split('-')[0];

  if (primary === 'ro' || primary === 'ru' || primary === 'en') {
    return primary;
  }

  return 'ro';
}

function resolveLocale() {
  if (typeof window === 'undefined') {
    return 'ro';
  }

  const stored = window.localStorage.getItem('i18nextLng');

  if (stored) {
    return normalizeLocale(stored);
  }

  return normalizeLocale(window.navigator?.language);
}

function qs(q?: Query) {
  if (!q) return '';
  const p = new URLSearchParams();
  Object.entries(q).forEach(([k, v]) => {
    if (v !== undefined && v !== null) p.append(k, String(v));
  });
  const s = p.toString();
  return s ? `?${s}` : '';
}

async function parse<T>(res: Response): Promise<T | null> {
  if (res.status === 204) return null;
  const ct = res.headers.get('content-type') ?? '';
  if (ct.includes('application/json')) return res.json();
  const text = await res.text();
  try {
    return JSON.parse(text) as T;
  } catch {
    return text as T;
  }
}

async function request<T>(method: HttpMethod, url: string, opt: RequestOptions = {}) {
  const { data, withAuth = false, headers = {}, query, signal } = opt;
  const finalUrl = `${BASE_URL}${url.startsWith('/') ? '' : '/'}${url}${qs(query)}`;

  const h = new Headers({ Accept: 'application/json', ...headers });
  const locale = resolveLocale();
  h.set('X-Locale', locale);
  h.set('Accept-Language', locale);

  let body: BodyInit | undefined;
  if (data instanceof FormData) {
    body = data;
  } else if (data !== undefined && method !== 'GET') {
    h.set('Content-Type', 'application/json');
    body = JSON.stringify(data);
  }

  if (withAuth) {
    const token = await getToken();

    if (token) h.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(finalUrl, { method, headers: h, body: method === 'GET' ? undefined : body, signal });

  if (res.status === 401) {
    onUnauthorized();
    throw new ApiError(401, 'Unauthorized');
  }
  if (!res.ok) {
    let details: unknown;
    try {
      details = await res.clone().json();
    } catch {
      try {
        details = await res.text();
      } catch {
        details = undefined;
      }
    }
    const detailRecord = typeof details === 'object' && details ? (details as Record<string, unknown>) : null;
    const msg =
      (detailRecord && typeof detailRecord.message === 'string' && detailRecord.message) ||
      (detailRecord && typeof detailRecord.error === 'string' && detailRecord.error) ||
      `HTTP ${res.status}`;
    throw new ApiError(res.status, msg, details);
  }
  return (await parse<T>(res)) as T;
}

export const http = {
  get: <T>(url: string, withAuth = false, query?: Query, signal?: AbortSignal) =>
    request<T>('GET', url, { withAuth, query, signal }),
  post: <T>(url: string, data?: unknown, withAuth = false, signal?: AbortSignal) =>
    request<T>('POST', url, { data, withAuth, signal }),
  put: <T>(url: string, data?: unknown, withAuth = false, signal?: AbortSignal) =>
    request<T>('PUT', url, { data, withAuth, signal }),
  del: <T>(url: string, withAuth = false, signal?: AbortSignal) =>
    request<T>('DELETE', url, { withAuth, signal })
};
