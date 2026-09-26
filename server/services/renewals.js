// Renewal reminders: which renewals remind on a given day (default schedule or a per-renewal custom rule),
// and the daily job that emails / SMSes each team member the renewals they need to follow up.
import { env } from '../config/env.js';
import {
  Renewal, ReminderLog, RenewalSettings, TeamMember, NotificationLog, CLOSED_STATUSES,
} from '../models/renewal.js';
import { sendEmail, sendSms, emailConfigured, smsConfigured, smsLabel } from './notify.js';

/** Today as YYYY-MM-DD in the business time zone (IST by default). */
export const todayYmd = (tz = env.reminderTz) => new Date().toLocaleDateString('en-CA', { timeZone: tz });

const utc = (s) => { const [y, m, d] = s.split('-').map(Number); return Date.UTC(y, m - 1, d); };
/** Whole days from `today` until a YYYY-MM-DD date (0 = expires today, negative = expired). */
export const daysBetween = (today, ymd) => (ymd ? Math.round((utc(ymd) - utc(today)) / 86400000) : null);
export const addDays = (ymd, n) => new Date(utc(ymd) + n * 86400000).toISOString().slice(0, 10);

/* ---------------- settings ---------------- */
const pad = (n) => String(n).padStart(2, '0');
export const defaultSettings = () => ({
  mode: 'daily', windowDays: env.remindDays, days: [30, 15, 7, 3, 1, 0], afterExpiry: true,
  sendTime: `${pad(Math.min(23, Math.max(0, env.reminderHour)))}:00`, emailOn: true, smsOn: true, notifyAdmin: true,
});
export async function getSettings() {
  const saved = await RenewalSettings.findById('renewals').lean();
  const { _id, createdAt, updatedAt, ...rest } = saved || {};
  return { ...defaultSettings(), ...rest };
}

/* ---------------- schedule rules ---------------- */
const fmtDate = (ymd) => (ymd ? new Date(`${ymd}T12:00:00Z`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—');
const listDays = (days) => days.map((d) => (d === 0 ? 'expiry day' : `${d}`)).join(', ');

/** The rule a renewal follows: its own custom rule, or the default schedule. */
export function ruleOf(r, s) {
  const mode = r.reminder?.mode || 'default';
  if (mode === 'days' && r.reminder.days?.length) return { type: 'days', days: r.reminder.days, custom: true };
  if (mode === 'dates' && r.reminder.dates?.length) return { type: 'dates', dates: r.reminder.dates, custom: true };
  return s.mode === 'days' ? { type: 'days', days: s.days, custom: false } : { type: 'daily', window: s.windowDays, custom: false };
}

export function ruleText(r, s) {
  const rule = ruleOf(r, s);
  const base = rule.type === 'daily'
    ? `Daily from ${rule.window} day${rule.window === 1 ? '' : 's'} before expiry`
    : rule.type === 'days'
      ? `${rule.days.filter((d) => d > 0).length ? `${listDays(rule.days.filter((d) => d > 0))} days before expiry` : ''}${rule.days.includes(0) ? `${rule.days.some((d) => d > 0) ? ' + ' : 'On '}expiry day` : ''}`
      : `On ${rule.dates.map(fmtDate).join(', ')}`;
  return `${base}${s.afterExpiry ? ', then daily after expiry until closed' : ''}${rule.custom ? ' (custom)' : ''}`;
}

/** Does this renewal send a reminder on `day`? */
export function remindsOn(r, s, day) {
  if (CLOSED_STATUSES.includes(r.status) || !r.endDate) return false;
  const rule = ruleOf(r, s);
  if (rule.type === 'dates' && rule.dates.includes(day)) return true;
  const left = daysBetween(day, r.endDate);
  if (left < 0) return Boolean(s.afterExpiry);
  if (rule.type === 'daily') return left <= rule.window;
  if (rule.type === 'days') return rule.days.includes(left);
  return false;
}

/** Next day (from today) this renewal will remind, or null. */
export function nextReminder(r, s, today) {
  if (CLOSED_STATUSES.includes(r.status)) return null;
  const last = Math.max(daysBetween(today, r.endDate) ?? 0, ...(r.reminder?.dates || []).map((d) => daysBetween(today, d)), 0);
  for (let i = 0; i <= Math.min(last + 1, 730); i += 1) {
    const day = addDays(today, i);
    if (remindsOn(r, s, day)) return day;
  }
  return null;
}

const plain = (doc) => (typeof doc.toJSON === 'function' ? doc.toJSON() : doc);
export const withDays = (doc, today = todayYmd(), s = null) => {
  const r = plain(doc);
  const out = { ...r, notify: (r.notify || []).map(String), daysLeft: daysBetween(today, r.endDate) };
  if (s) Object.assign(out, { remindToday: remindsOn(r, s, today), nextReminder: nextReminder(r, s, today), ruleText: ruleText(r, s) });
  return out;
};

/** Open renewals that remind today, most urgent first. */
export async function dueRenewals(today = todayYmd(), s = null) {
  const settings = s || await getSettings();
  const docs = await Renewal.find({ status: { $nin: CLOSED_STATUSES }, endDate: { $ne: '' } }).sort({ endDate: 1 });
  return docs.filter((d) => remindsOn(d, settings, today)).map((d) => withDays(d, today, settings));
}

/** Active team members who get a renewal's reminder (its assigned members, or everyone). */
const recipientsOf = (r, members) => {
  const ids = (r.notify || []).map(String);
  return ids.length ? members.filter((m) => ids.includes(String(m._id))) : members;
};

/** Calendar of upcoming reminders: [{ date, items: [{ id, customer, …, recipients }] }]. */
export async function schedulePreview(days = 30) {
  const [s, members, docs] = await Promise.all([
    getSettings(),
    TeamMember.find({ active: true }).lean(),
    Renewal.find({ status: { $nin: CLOSED_STATUSES }, endDate: { $ne: '' } }).sort({ endDate: 1 }).lean(),
  ]);
  const today = todayYmd();
  const out = [];
  for (let i = 0; i <= days; i += 1) {
    const day = addDays(today, i);
    const items = docs.filter((r) => remindsOn(r, s, day)).map((r) => ({
      id: String(r._id), code: r.code, customer: r.customer, description: r.description, endDate: r.endDate,
      daysLeft: daysBetween(day, r.endDate), custom: ruleOf(r, s).custom,
      recipients: recipientsOf(r, members).map((m) => m.name),
    }));
    if (items.length) out.push({ date: day, items });
  }
  return { today, sendTime: s.sendTime, days: out };
}

/* ---------------- messages ---------------- */
const esc = (v) => String(v ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
export const whenText = (d) => (d < 0 ? `Expired ${-d} day${d === -1 ? '' : 's'} ago` : d === 0 ? 'Expires today' : `${d} day${d === 1 ? '' : 's'} left`);

function emailDigest(items, today, name) {
  const rows = items.map((r) => `
    <tr>
      <td style="padding:8px;border-bottom:1px solid #eee"><b>${esc(r.customer)}</b><br><span style="color:#666">${esc([r.contactName, r.phone, r.email].filter(Boolean).join(' · '))}</span></td>
      <td style="padding:8px;border-bottom:1px solid #eee">${esc(r.description)}${r.qty > 1 ? ` × ${r.qty}` : ''}${r.vendor ? `<br><span style="color:#666">Vendor: ${esc(r.vendor)}</span>` : ''}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;white-space:nowrap">${fmtDate(r.endDate)}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;white-space:nowrap;color:${r.daysLeft < 0 ? '#b91c1c' : '#c2410c'}"><b>${whenText(r.daysLeft)}</b></td>
    </tr>`).join('');
  const link = env.siteUrl ? `<p><a href="${esc(env.siteUrl)}/admin/renewals?view=due">Open renewals in the admin panel</a></p>` : '';
  return {
    subject: `Renewal reminder: ${items.length} plan${items.length === 1 ? '' : 's'} to follow up (${fmtDate(today)})`,
    text: `Hi ${name},\n\n${items.map((r) => `${r.customer} — ${r.description} — ends ${fmtDate(r.endDate)} (${whenText(r.daysLeft)}) ${r.phone || ''} ${r.email || ''}`).join('\n')}`,
    html: `<div style="font-family:Arial,sans-serif;font-size:14px;color:#222">
      <p>Hi ${esc(name)},</p>
      <p>These customer plans are due for renewal. Please contact the customers:</p>
      <table style="border-collapse:collapse;width:100%"><thead><tr style="background:#f6f6f6;text-align:left">
        <th style="padding:8px">Customer</th><th style="padding:8px">Product</th><th style="padding:8px">End date</th><th style="padding:8px">Status</th>
      </tr></thead><tbody>${rows}</tbody></table>${link}
      <p style="color:#888;font-size:12px">Sent by the ProXinet renewal reminder. Reminders stop once a plan is marked Renewed or Not renewing.</p></div>`,
  };
}

function smsText(items) {
  const short = (r) => `${r.customer} (${r.description}) ${r.daysLeft < 0 ? `expired ${fmtDate(r.endDate)}` : `ends ${fmtDate(r.endDate)}`}`;
  const head = `ProXinet renewal reminder: ${items.length} plan${items.length === 1 ? '' : 's'} due. `;
  const body = items.slice(0, 3).map(short).join('; ') + (items.length > 3 ? `; +${items.length - 3} more` : '');
  return `${head}${body}. Please contact the customer${items.length === 1 ? '' : 's'}.`.slice(0, 600);
}

/* ---------------- the daily job ---------------- */
export const channelStatus = () => ({
  email: emailConfigured(), sms: smsConfigured(), smsProvider: smsLabel(), adminEmail: env.reminderEmailTo,
});

/**
 * Sends today's reminders once per day (force = send again). Each active team member gets the
 * renewals assigned to them (or all of them when a renewal has no assignment) by email and SMS;
 * the admin email gets the full list. Every attempt is written to NotificationLog.
 */
export async function sendReminders({ force = false, today = todayYmd() } = {}) {
  const logId = `renewals:${today}`;
  if (!force && await ReminderLog.exists({ _id: logId })) return { day: today, done: false, reason: 'Already sent today', due: 0, results: [] };

  const s = await getSettings();
  const due = await dueRenewals(today, s);
  const members = await TeamMember.find({ active: true }).lean();

  const targets = members.map((m) => ({ ...m, items: due.filter((r) => recipientsOf(r, members).some((x) => String(x._id) === String(m._id))) }));
  if (s.notifyAdmin && env.reminderEmailTo) {
    const same = targets.find((t) => t.email && t.email === env.reminderEmailTo.toLowerCase());
    if (same) same.items = due;
    else targets.push({ name: 'Admin', email: env.reminderEmailTo, phone: '', notifyEmail: true, notifySms: false, items: due });
  }

  const logs = [];
  for (const t of targets.filter((x) => x.items.length)) {
    const customers = t.items.map((r) => r.customer);
    if (s.emailOn && t.notifyEmail && t.email) {
      const r = await sendEmail({ to: t.email, ...emailDigest(t.items, today, t.name) });
      logs.push({ day: today, channel: 'email', to: t.email, name: t.name, count: t.items.length, customers, ...r });
    }
    if (s.smsOn && t.notifySms && t.phone) {
      const r = await sendSms(t.phone, smsText(t.items));
      logs.push({ day: today, channel: 'sms', to: t.phone, name: t.name, count: t.items.length, customers, ...r });
    }
  }
  // only a day that actually produced messages counts as done — otherwise a renewal added (or a member
  // assigned) later in the day is still picked up by the next scheduler tick
  if (logs.length) {
    await NotificationLog.insertMany(logs);
    await ReminderLog.updateOne({ _id: logId }, { $set: { sentAt: new Date(), count: due.length } }, { upsert: true });
  }
  if (logs.some((l) => l.status === 'sent')) await Renewal.updateMany({ _id: { $in: due.map((i) => i.id) } }, { $set: { lastRemindedOn: today } });

  return {
    day: today, done: logs.length > 0, due: due.length,
    reason: !due.length ? 'No renewal reminds today' : !logs.length ? 'No recipients — add team members or enable email/SMS' : undefined,
    sent: logs.filter((l) => l.status === 'sent').length,
    results: logs,
  };
}

/** Test message to one team member so the admin can check their email / mobile works. */
export async function sendTest(member) {
  const today = todayYmd();
  const logs = [];
  if (member.email) {
    const r = await sendEmail({
      to: member.email,
      subject: 'Test: ProXinet renewal reminders',
      text: `Hi ${member.name}, this is a test. You will receive renewal reminders at this address.`,
      html: `<p>Hi ${esc(member.name)},</p><p>This is a test. You will receive ProXinet renewal reminders at this address.</p>`,
    });
    logs.push({ day: today, channel: 'email', to: member.email, name: member.name, count: 0, customers: [], kind: 'test', ...r });
  }
  if (member.phone) {
    const r = await sendSms(member.phone, `Hi ${member.name}, this is a test from ProXinet. You will get renewal reminders on this number.`);
    logs.push({ day: today, channel: 'sms', to: member.phone, name: member.name, count: 0, customers: [], kind: 'test', ...r });
  }
  if (logs.length) await NotificationLog.insertMany(logs);
  return logs;
}

/**
 * Long-running server only (npm run dev / start:api): every 5 minutes, sends today's reminders once
 * the configured send time has passed. On Vercel the cron in vercel.json calls the job instead.
 */
export function startReminderScheduler() {
  const tick = async () => {
    try {
      const s = await getSettings();
      const now = new Date().toLocaleTimeString('en-GB', { timeZone: env.reminderTz, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
      if (now < s.sendTime) return;
      const r = await sendReminders();
      if (r.done) console.log(`[renewals] ${r.day}: ${r.due} due, ${r.sent} message(s) sent${r.reason ? ` — ${r.reason}` : ''}`);
    } catch (err) {
      console.error('[renewals] reminder job failed:', err.message);
    }
  };
  setTimeout(tick, 15_000).unref();
  setInterval(tick, 5 * 60_000).unref();
}
