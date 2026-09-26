/**
 * Admin data layer — every read and write goes to the Express/MongoDB API.
 * Mutations broadcast a change so all mounted screens (list, bell, dashboard) refetch.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { request } from '../../api/http';
import { adminRequest } from './auth';

/* ---------------- change notifications ---------------- */
const listeners = new Set();
export const onChange = (fn) => { listeners.add(fn); return () => listeners.delete(fn); };
const mutate = async (promise) => {
  const result = await promise;
  listeners.forEach((fn) => fn());
  return result;
};

const C = (col, rest = '') => `/admin/collections/${col}${rest}`;

/* ---------------- reads ---------------- */
export const listRecords = (col) => adminRequest('GET', C(col, '?limit=1000'));
export const getRecord = (col, id) => adminRequest('GET', C(col, `/${id}`));
export const getStats = () =>
  adminRequest('GET', `/admin/stats?tz=${encodeURIComponent(Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata')}`);
export const getUnread = () => adminRequest('GET', '/admin/unread');
export const getHealth = () => request('GET', '/health');

/* ---------------- writes ---------------- */
export const updateRecord = (col, id, patch) => mutate(adminRequest('PATCH', C(col, `/${id}`), patch));
export const updateMany = (col, ids, patch) => mutate(adminRequest('PATCH', C(col), { ids, ...patch }));
export const addNote = (col, id, text) => mutate(adminRequest('POST', C(col, `/${id}/notes`), { text }));
export const replyToChat = (id, text) => mutate(adminRequest('POST', C('chats', `/${id}/reply`), { text }));

export function removeRecords(col, ids) {
  const list = Array.isArray(ids) ? ids : [ids];
  return mutate(list.length === 1
    ? adminRequest('DELETE', C(col, `/${list[0]}`))
    : adminRequest('POST', C(col, '/bulk-delete'), { ids: list }));
}

export const resetDemoData = () => mutate(adminRequest('POST', '/admin/demo-data'));
export const clearAllData = () => mutate(adminRequest('DELETE', '/admin/data'));

/* ---------------- downloads ---------------- */
function saveBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function downloadResume(applicationId, filename = 'resume') {
  const res = await adminRequest('GET', C('applications', `/${applicationId}/resume`));
  saveBlob(await res.blob(), filename);
}

export async function downloadBackup() {
  const data = await adminRequest('GET', '/admin/export');
  saveBlob(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }), `proxinet-backup-${new Date().toISOString().slice(0, 10)}.json`);
}

/* ---------------- React hooks ---------------- */
/**
 * Runs `fetcher` on mount, whenever `deps` change, after any admin mutation,
 * and every `poll` ms while the tab is visible.
 */
export function useApi(fetcher, deps = [], { poll = 0 } = {}) {
  const [state, setState] = useState({ data: undefined, loading: true, error: null });
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const load = useCallback(async () => {
    try {
      const data = await fetcherRef.current();
      setState({ data, loading: false, error: null });
    } catch (error) {
      setState((s) => ({ ...s, loading: false, error }));
    }
  }, []);

  useEffect(() => {
    setState({ data: undefined, loading: true, error: null });
    load();
    const off = onChange(load);
    const timer = poll ? setInterval(() => { if (document.visibilityState === 'visible') load(); }, poll) : null;
    return () => {
      off();
      if (timer) clearInterval(timer);
    };
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps

  return { ...state, reload: load };
}

export function useCollection(col) {
  const r = useApi(() => listRecords(col), [col], { poll: 20000 });
  return { rows: r.data?.items || [], loading: r.loading, error: r.error, reload: r.reload };
}

/* ---------------- client portal management ---------------- */
export const listClients = () => adminRequest('GET', '/admin/clients');
export const createClient = (data) => mutate(adminRequest('POST', '/admin/clients', data));
export const updateClient = (id, data) => mutate(adminRequest('PATCH', `/admin/clients/${id}`, data));
export const resetClientPassword = (id, password) => mutate(adminRequest('POST', `/admin/clients/${id}/password`, password ? { password } : {}));
export const deleteClient = (id) => mutate(adminRequest('DELETE', `/admin/clients/${id}`));

/** kind: 'assets' | 'licences' | 'documents' */
export const listPortalItems = (kind, client) => adminRequest('GET', `/admin/${kind}${client ? `?client=${client}` : ''}`);
export const createPortalItem = (kind, data) => mutate(adminRequest('POST', `/admin/${kind}`, data));
export const updatePortalItem = (kind, id, data) => mutate(adminRequest('PATCH', `/admin/${kind}/${id}`, data));
export const deletePortalItem = (kind, id) => mutate(adminRequest('DELETE', `/admin/${kind}/${id}`));
export async function downloadClientDocument(id, filename) {
  const res = await adminRequest('GET', `/admin/documents/${id}/download`);
  saveBlob(await res.blob(), filename);
}

/** Reply on a portal ticket — visible to the client in their ticket thread. */
export const replyToTicket = (id, { text, status, owner }) => mutate(adminRequest('POST', `/admin/tickets/${id}/reply`, { text, status, owner }));

/* ---------------- customer renewals ---------------- */
export const listRenewals = () => adminRequest('GET', '/admin/renewals');
export const getRenewalReminders = () => adminRequest('GET', '/admin/renewals/reminders');
export const createRenewal = (data) => mutate(adminRequest('POST', '/admin/renewals', data));
export const importRenewals = (items) => mutate(adminRequest('POST', '/admin/renewals/import', { items }));
export const updateRenewal = (id, data) => mutate(adminRequest('PATCH', `/admin/renewals/${id}`, data));
export const addRenewalNote = (id, text, contacted = false) => mutate(adminRequest('POST', `/admin/renewals/${id}/notes`, { text, contacted }));
export const renewRenewal = (id, data) => mutate(adminRequest('POST', `/admin/renewals/${id}/renew`, data));
export const deleteRenewal = (id) => mutate(adminRequest('DELETE', `/admin/renewals/${id}`));

/* ---------------- renewal reminder team & schedule ---------------- */
export const listTeam = () => adminRequest('GET', '/admin/renewal-team');
export const createTeamMember = (data) => mutate(adminRequest('POST', '/admin/renewal-team', data));
export const updateTeamMember = (id, data) => mutate(adminRequest('PATCH', `/admin/renewal-team/${id}`, data));
export const deleteTeamMember = (id) => mutate(adminRequest('DELETE', `/admin/renewal-team/${id}`));
export const testTeamMember = (id) => mutate(adminRequest('POST', `/admin/renewal-team/${id}/test`));
export const getReminderSettings = () => adminRequest('GET', '/admin/renewal-settings');
export const saveReminderSettings = (data) => mutate(adminRequest('PUT', '/admin/renewal-settings', data));
export const getReminderSchedule = (days = 30) => adminRequest('GET', `/admin/renewals/schedule?days=${days}`);
export const listReminderLog = () => adminRequest('GET', '/admin/renewals/notifications');
export const runRemindersNow = () => mutate(adminRequest('POST', '/admin/renewals/reminders/send'));
