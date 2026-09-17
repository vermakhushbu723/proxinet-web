// Shared fetch wrapper for the website and the admin panel.
// In development Vite proxies /api to the Express server; on Vercel /api is a serverless function.
export const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '') + '/api';

export class ApiError extends Error {
  constructor(status, message, fields) {
    super(message);
    this.status = status;
    this.fields = fields;
  }
}

/**
 * @param body  plain object (sent as JSON) or FormData (multipart)
 * @returns parsed JSON, or the raw Response for file downloads
 */
export async function request(method, path, body, { token, signal } = {}) {
  const headers = {};
  let payload;
  if (body instanceof FormData) payload = body;
  else if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(API_BASE + path, { method, headers, body: payload, signal });
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    throw new ApiError(0, 'Could not reach the server. Check your connection and try again.');
  }

  const isJson = (res.headers.get('content-type') || '').includes('application/json');
  if (!res.ok) {
    const data = isJson ? await res.json().catch(() => ({})) : {};
    throw new ApiError(res.status, data.error || `Request failed (${res.status})`, data.fields || data.details?.fields);
  }
  return isJson ? res.json() : res;
}
