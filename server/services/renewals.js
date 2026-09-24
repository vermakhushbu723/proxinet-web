// Renewal reminders: which renewals are due, and the once-a-day email digest to the admin.
import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import { Renewal, ReminderLog, CLOSED_STATUSES } from '../models/renewal.js';

/** Today as YYYY-MM-DD in the business time zone (IST by default). */
export const todayYmd = (tz = env.reminderTz) => new Date().toLocaleDateString('en-CA', { timeZone: tz });

/** Whole days from `today` until a YYYY-MM-DD date (0 = expires today, negative = expired). */
export const daysBetween = (today, ymd) => {
  if (!ymd) return null;
  const [a, b] = [today, ymd].map((s) => { const [y, m, d] = s.split('-').map(Number); return Date.UTC(y, m - 1, d); });
  return Math.round((b - a) / 86400000);
};

export const withDays = (doc, today = todayYmd()) => {
  const r = typeof doc.toJSON === 'function' ? doc.toJSON() : doc;
  return { ...r, daysLeft: daysBetween(today, r.endDate) };
};

/**
 * Open renewals that need a call: ending within `env.remindDays` days, or already expired
 * and still not marked Renewed / Not renewing. Sorted most urgent first.
 */
export async function dueRenewals(today = todayYmd()) {
  const until = new Date(`${today}T00:00:00Z`);
  until.setUTCDate(until.getUTCDate() + env.remindDays);
  const docs = await Renewal.find({
    status: { $nin: CLOSED_STATUSES },
    endDate: { $ne: '', $lte: until.toISOString().slice(0, 10) },
  }).sort({ endDate: 1 });
  return docs.map((d) => withDays(d, today));
}

/* ---------------- email ---------------- */
let transport;
const mailer = () => {
  if (!env.smtp.host) return null;
  transport ||= nodemailer.createTransport({
    host: env.smtp.host, port: env.smtp.port, secure: env.smtp.port === 465,
    auth: env.smtp.user ? { user: env.smtp.user, pass: env.smtp.pass } : undefined,
  });
  return transport;
};

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const fmtDate = (ymd) => (ymd ? new Date(`${ymd}T12:00:00Z`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—');
const whenText = (d) => (d < 0 ? `Expired ${-d} day${d === -1 ? '' : 's'} ago` : d === 0 ? 'Expires today' : `${d} day${d === 1 ? '' : 's'} left`);

function digest(items, today) {
  const rows = items.map((r) => `
    <tr>
      <td style="padding:8px;border-bottom:1px solid #eee"><b>${esc(r.customer)}</b><br><span style="color:#666">${esc([r.contactName, r.phone, r.email].filter(Boolean).join(' · '))}</span></td>
      <td style="padding:8px;border-bottom:1px solid #eee">${esc(r.description)}${r.qty > 1 ? ` × ${r.qty}` : ''}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;white-space:nowrap">${fmtDate(r.endDate)}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;white-space:nowrap;color:${r.daysLeft < 0 ? '#b91c1c' : '#c2410c'}"><b>${whenText(r.daysLeft)}</b></td>
    </tr>`).join('');
  const link = env.siteUrl ? `<p><a href="${esc(env.siteUrl)}/admin/renewals">Open renewals in the admin panel</a></p>` : '';
  return {
    subject: `Renewal reminder: ${items.length} customer${items.length === 1 ? '' : 's'} to contact (${fmtDate(today)})`,
    text: items.map((r) => `${r.customer} — ${r.description} — ends ${fmtDate(r.endDate)} (${whenText(r.daysLeft)}) ${r.phone || ''} ${r.email || ''}`).join('\n'),
    html: `<div style="font-family:Arial,sans-serif;font-size:14px;color:#222">
      <p>These plans end within ${env.remindDays} days (or have expired without renewal). Please contact the customers:</p>
      <table style="border-collapse:collapse;width:100%"><thead><tr style="background:#f6f6f6;text-align:left">
        <th style="padding:8px">Customer</th><th style="padding:8px">Product</th><th style="padding:8px">End date</th><th style="padding:8px">Status</th>
      </tr></thead><tbody>${rows}</tbody></table>${link}
      <p style="color:#888;font-size:12px">You get this email every day until each renewal is marked Renewed or Not renewing.</p></div>`,
  };
}

/**
 * Sends today's reminder email once (safe to call repeatedly — from the cron route,
 * the local scheduler, or the admin "send now" button with force).
 */
export async function sendDailyReminder({ force = false } = {}) {
  const today = todayYmd();
  const items = await dueRenewals(today);
  const logId = `renewals:${today}`;
  if (!items.length) return { sent: false, reason: 'Nothing due today', count: 0 };
  if (!force && await ReminderLog.exists({ _id: logId })) return { sent: false, reason: 'Already sent today', count: items.length };

  const to = env.reminderEmailTo;
  const smtp = mailer();
  if (!smtp || !to) return { sent: false, reason: 'Email is not configured (set SMTP_HOST and REMINDER_EMAIL_TO)', count: items.length };

  await smtp.sendMail({ from: env.smtp.from || env.smtp.user, to, ...digest(items, today) });
  await ReminderLog.updateOne({ _id: logId }, { $set: { sentAt: new Date(), count: items.length, to } }, { upsert: true });
  await Renewal.updateMany({ _id: { $in: items.map((i) => i.id) } }, { $set: { lastRemindedOn: today } });
  return { sent: true, count: items.length, to };
}

/**
 * Long-running server only (npm run dev / start:api): checks every 30 minutes and sends
 * the digest once a day after REMINDER_HOUR. On Vercel the cron in vercel.json does this.
 */
export function startReminderScheduler() {
  const tick = async () => {
    const hour = Number(new Date().toLocaleString('en-US', { timeZone: env.reminderTz, hour: 'numeric', hourCycle: 'h23' }));
    if (hour < env.reminderHour) return;
    try {
      const r = await sendDailyReminder();
      if (r.sent) console.log(`[renewals] reminder email sent to ${r.to} (${r.count} due)`);
    } catch (err) {
      console.error('[renewals] reminder email failed:', err.message);
    }
  };
  setTimeout(tick, 15_000).unref();
  setInterval(tick, 30 * 60_000).unref();
}
