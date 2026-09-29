import { http, Query } from './http';

export const api = {
  public: {
    get: http.get,
    post: http.post,
    put: http.put,
    del: http.del,
  },
  authed: {
    get:  <T>(url: string, q?: Query, s?: AbortSignal) => http.get<T>(url, true, q, s),
    post: <T>(url: string, d?: unknown, s?: AbortSignal) => http.post<T>(url, d, true, s),
    put:  <T>(url: string, d?: unknown, s?: AbortSignal) => http.put<T>(url, d, true, s),
    delete:  <T>(url: string, s?: AbortSignal) => http.del<T>(url, true, s),
  },
};
