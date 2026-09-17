// Admin authentication — JWT issued by POST /api/auth/login, kept in localStorage.
import { request } from '../../api/http';

const KEY = 'px-admin-session';

function tokenExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return payload.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
}

/** { token, id, email, name } or null when signed out / expired. */
export function getSession() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY));
    if (!s?.token || tokenExpired(s.token)) {
      localStorage.removeItem(KEY);
      return null;
    }
    return s;
  } catch {
    return null;
  }
}

export function logout() {
  try { localStorage.removeItem(KEY); } catch { /* ignore */ }
}

export async function login(email, password) {
  const r = await request('POST', '/auth/login', { email, password });
  localStorage.setItem(KEY, JSON.stringify({ token: r.token, ...r.admin }));
  return r.admin;
}

/** Authenticated request; an expired/invalid session sends the admin back to the login page. */
export async function adminRequest(method, path, body) {
  try {
    return await request(method, path, body, { token: getSession()?.token });
  } catch (err) {
    if (err.status === 401 && !path.startsWith('/auth/change-password')) {
      logout();
      if (!window.location.pathname.startsWith('/admin/login')) {
        window.location.assign(`/admin/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      }
    }
    throw err;
  }
}

export const changePassword = (currentPassword, newPassword) =>
  adminRequest('POST', '/auth/change-password', { currentPassword, newPassword });
