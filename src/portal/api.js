// Client portal → API. Session is a client JWT from POST /api/portal/login.
import { useCallback, useEffect, useRef, useState } from 'react';
import { request } from '../api/http';

const KEY = 'px-portal-session';

function expired(token) {
  try {
    return JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))).exp * 1000 <= Date.now();
  } catch {
    return true;
  }
}

export function getSession() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY));
    if (!s?.token || expired(s.token)) { localStorage.removeItem(KEY); return null; }
    return s;
  } catch {
    return null;
  }
}

export const logout = () => { try { localStorage.removeItem(KEY); } catch { /* ignore */ } };

export async function login(email, password) {
  const r = await request('POST', '/portal/login', { email, password });
  localStorage.setItem(KEY, JSON.stringify({ token: r.token, ...r.client }));
  return r.client;
}

export const forgotPassword = (email) => request('POST', '/portal/forgot-password', { email });

async function call(method, path, body) {
  try {
    return await request(method, `/portal${path}`, body, { token: getSession()?.token });
  } catch (err) {
    if (err.status === 401 && path !== '/change-password') {
      logout();
      if (!window.location.pathname.startsWith('/portal/login')) {
        window.location.assign(`/portal/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      }
    }
    throw err;
  }
}

/* ---------------- change bus so every section refreshes after a write ---------------- */
const listeners = new Set();
const changed = () => listeners.forEach((fn) => fn());
const mutate = async (p) => { const r = await p; changed(); return r; };

export const getOverview = () => call('GET', '/overview');
export const listTickets = () => call('GET', '/tickets');
export const getTicket = (id) => call('GET', `/tickets/${id}`);
export const createTicket = (data) => mutate(call('POST', '/tickets', data));
export const commentTicket = (id, text) => mutate(call('POST', `/tickets/${id}/comments`, { text }));
export const listAssets = () => call('GET', '/assets');
export const listLicences = () => call('GET', '/licences');
export const requestRenewal = (id) => mutate(call('POST', `/licences/${id}/renewal-quote`));
export const listDocuments = () => call('GET', '/documents');
export const getEscalation = () => call('GET', '/escalation');
export const searchPortal = (q) => call('GET', `/search?q=${encodeURIComponent(q)}`);
export const changePassword = (currentPassword, newPassword) => call('POST', '/change-password', { currentPassword, newPassword });

function saveBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export async function downloadDocument(id, filename) {
  const res = await call('GET', `/documents/${id}/download`);
  saveBlob(await res.blob(), filename);
}
export async function downloadSlaReport() {
  const res = await call('GET', '/sla-report');
  saveBlob(await res.blob(), `SLA-report-${new Date().toISOString().slice(0, 7)}.csv`);
}

/** Loads on mount, after any portal write, and every `poll` ms while visible. */
export function usePortal(fetcher, deps = [], { poll = 0 } = {}) {
  const [state, setState] = useState({ data: undefined, loading: true, error: null });
  const ref = useRef(fetcher);
  ref.current = fetcher;
  const load = useCallback(async () => {
    try {
      setState({ data: await ref.current(), loading: false, error: null });
    } catch (error) {
      setState((s) => ({ ...s, loading: false, error }));
    }
  }, []);
  useEffect(() => {
    setState((s) => ({ ...s, loading: true }));
    load();
    listeners.add(load);
    const t = poll ? setInterval(() => { if (document.visibilityState === 'visible') load(); }, poll) : null;
    return () => { listeners.delete(load); if (t) clearInterval(t); };
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps
  return { ...state, reload: load };
}
