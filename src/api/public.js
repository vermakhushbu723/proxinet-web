// Website → API. Every public form on the site submits through these functions.
import { message } from 'antd';
import { request } from './http';

const routes = {
  leads: 'leads', assessments: 'assessments', tickets: 'tickets', downloads: 'downloads',
  toolReports: 'tool-reports', procurement: 'procurement',
};

const source = () => (typeof window !== 'undefined' ? window.location.pathname : '');

/** Creates a lead, assessment booking, ticket, download, tool report or procurement request. */
export const submitForm = (key, data) => request('POST', `/${routes[key]}`, { ...data, source: source() });

/** Newsletter — resolves with { alreadySubscribed } when the email was already on the list. */
export const subscribeEmail = (email) => request('POST', '/subscribers', { email, source: source() });

/** Careers — multipart with the resume file under "resume". */
export function submitApplication(fields, file) {
  const fd = new FormData();
  Object.entries({ ...fields, source: source() }).forEach(([k, v]) => fd.append(k, v ?? ''));
  if (file) fd.append('resume', file, file.name);
  return request('POST', '/applications', fd);
}

export const startChat = (text) => request('POST', '/chats', { text, source: source() });
export const sendChatMessage = (chatId, from, text) => request('POST', `/chats/${chatId}/messages`, { from, text });

/** Shows server-side validation errors on the matching antd form fields, plus a toast. */
export function showSubmitError(err, form) {
  if (form && err?.fields) {
    const known = new Set(Object.keys(form.getFieldsValue(true)));
    const list = Object.entries(err.fields).filter(([name]) => known.has(name)).map(([name, msg]) => ({ name, errors: [msg] }));
    if (list.length) form.setFields(list);
  }
  message.error(err?.message || 'Something went wrong. Please try again.');
}
