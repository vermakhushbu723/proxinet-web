// Admin: customer renewals, the reminder team, the reminder schedule + the reminder cron.
import { Router } from 'express';
import { env } from '../config/env.js';
import {
  Renewal, RENEWAL_STATUSES, TeamMember, RenewalSettings, NotificationLog,
} from '../models/renewal.js';
import { ah, HttpError, requireAdmin, validId } from '../middleware/index.js';
import {
  todayYmd, withDays, dueRenewals, sendReminders, sendTest, getSettings, schedulePreview, channelStatus,
} from '../services/renewals.js';

const router = Router();

const FIELDS = ['customer', 'contactName', 'email', 'phone', 'description', 'serialNo', 'qty', 'poNo', 'invoiceNo',
  'startDate', 'endDate', 'salePrice', 'purchasePrice', 'vendor', 'priceBasis', 'plusGst', 'status', 'reminder', 'notify'];
const pick = (body = {}, keys = FIELDS) => Object.fromEntries(keys.filter((k) => body[k] !== undefined).map((k) => [k, body[k]]));
const idOf = (req) => { if (!validId(req.params.id)) throw new HttpError(404, 'Record not found'); return req.params.id; };
const note = (req, text) => ({ text: String(text).slice(0, 2000), by: req.admin?.name || req.admin?.email || 'Admin', at: new Date() });

/** Renewal body from the admin UI: validates the reminder rule and team assignment. */
function renewalBody(body) {
  const out = pick(body);
  if (out.reminder !== undefined) {
    const r = out.reminder || {};
    const mode = ['default', 'days', 'dates'].includes(r.mode) ? r.mode : 'default';
    out.reminder = {
      mode,
      days: mode === 'days' ? (Array.isArray(r.days) ? r.days : []).map(Number).filter((n) => Number.isInteger(n) && n >= 0 && n <= 365) : [],
      dates: mode === 'dates' ? (Array.isArray(r.dates) ? r.dates : []).map(String) : [],
    };
  }
  if (out.notify !== undefined) out.notify = (Array.isArray(out.notify) ? out.notify : []).filter(validId);
  return out;
}

async function load(req) {
  const r = await Renewal.findById(idOf(req));
  if (!r) throw new HttpError(404, 'Renewal not found');
  return r;
}
const view = async (doc) => withDays(doc, todayYmd(), await getSettings());

/* ---------------- Vercel cron (no admin token — protected by CRON_SECRET) ---------------- */
router.get('/cron/renewal-reminders', ah(async (req, res) => {
  if (!env.cronSecret || req.headers.authorization !== `Bearer ${env.cronSecret}`) throw new HttpError(401, 'Unauthorized');
  res.json(await sendReminders());
}));

router.use(['/admin/renewals', '/admin/renewal-team', '/admin/renewal-settings'], requireAdmin);

/* ================= reminder team ================= */
const MEMBER_FIELDS = ['name', 'designation', 'phone', 'email', 'notifyEmail', 'notifySms', 'active'];

router.get('/admin/renewal-team', ah(async (_req, res) => {
  const [members, assigned] = await Promise.all([
    TeamMember.find().sort({ active: -1, name: 1 }),
    Renewal.aggregate([{ $match: { status: { $in: ['Active', 'Contacted'] } } }, { $unwind: '$notify' }, { $group: { _id: '$notify', n: { $sum: 1 } } }]),
  ]);
  const counts = Object.fromEntries(assigned.map((a) => [String(a._id), a.n]));
  res.json({ items: members.map((m) => ({ ...m.toJSON(), assigned: counts[String(m._id)] || 0 })), channels: channelStatus() });
}));

router.post('/admin/renewal-team', ah(async (req, res) => {
  const m = new TeamMember(pick(req.body, MEMBER_FIELDS));
  await m.save();
  res.status(201).json(m.toJSON());
}));

router.patch('/admin/renewal-team/:id', ah(async (req, res) => {
  const m = await TeamMember.findById(idOf(req));
  if (!m) throw new HttpError(404, 'Team member not found');
  m.set(pick(req.body, MEMBER_FIELDS));
  await m.save();
  res.json(m.toJSON());
}));

router.delete('/admin/renewal-team/:id', ah(async (req, res) => {
  const m = await TeamMember.findByIdAndDelete(idOf(req));
  if (!m) throw new HttpError(404, 'Team member not found');
  await Renewal.updateMany({ notify: m._id }, { $pull: { notify: m._id } });
  res.json({ ok: true });
}));

router.post('/admin/renewal-team/:id/test', ah(async (req, res) => {
  const m = await TeamMember.findById(idOf(req)).lean();
  if (!m) throw new HttpError(404, 'Team member not found');
  res.json({ results: await sendTest(m) });
}));

/* ================= reminder schedule settings ================= */
router.get('/admin/renewal-settings', ah(async (_req, res) => {
  res.json({ settings: await getSettings(), channels: channelStatus(), today: todayYmd(), timezone: env.reminderTz });
}));

router.put('/admin/renewal-settings', ah(async (req, res) => {
  const b = pick(req.body, ['mode', 'windowDays', 'days', 'afterExpiry', 'sendTime', 'emailOn', 'smsOn', 'notifyAdmin']);
  if (b.days !== undefined) {
    b.days = [...new Set((Array.isArray(b.days) ? b.days : []).map(Number).filter((n) => Number.isInteger(n) && n >= 0 && n <= 365))].sort((x, y) => y - x);
  }
  const next = { ...(await getSettings()), ...b };
  if (next.mode === 'days' && !next.days.length) throw new HttpError(400, 'Add at least one "days before expiry" value');
  const saved = await RenewalSettings.findByIdAndUpdate('renewals', { $set: next }, { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }).lean();
  const { _id, createdAt, updatedAt, ...settings } = saved;
  res.json({ settings, channels: channelStatus() });
}));

/* ================= renewals ================= */
router.get('/admin/renewals', ah(async (_req, res) => {
  const [today, s] = [todayYmd(), await getSettings()];
  const items = await Renewal.find().sort({ endDate: 1, customer: 1 }).limit(5000);
  res.json({ items: items.map((d) => withDays(d, today, s)), today, remindDays: s.windowDays, settings: s, statuses: RENEWAL_STATUSES });
}));

router.get('/admin/renewals/reminders', ah(async (_req, res) => {
  const [today, s] = [todayYmd(), await getSettings()];
  const items = await dueRenewals(today, s);
  const channels = channelStatus();
  res.json({
    today, remindDays: s.windowDays, settings: s, items,
    expired: items.filter((i) => i.daysLeft < 0).length,
    channels, emailConfigured: channels.email,
  });
}));

router.get('/admin/renewals/schedule', ah(async (req, res) => {
  res.json(await schedulePreview(Math.min(Math.max(Number(req.query.days) || 30, 1), 365)));
}));

router.get('/admin/renewals/notifications', ah(async (_req, res) => {
  const items = await NotificationLog.find().sort({ createdAt: -1 }).limit(200).lean();
  res.json({ items: items.map(({ _id, ...r }) => ({ id: String(_id), ...r })) });
}));

router.post('/admin/renewals/reminders/send', ah(async (_req, res) => res.json(await sendReminders({ force: true }))));

router.post('/admin/renewals', ah(async (req, res) => {
  const r = new Renewal(renewalBody(req.body));
  await r.save();
  res.status(201).json(await view(r));
}));

/** Bulk import (rows already mapped to our field names by the admin UI). */
router.post('/admin/renewals/import', ah(async (req, res) => {
  const rows = Array.isArray(req.body?.items) ? req.body.items : [];
  if (!rows.length) throw new HttpError(400, 'No rows to import');
  if (rows.length > 2000) throw new HttpError(400, 'Import at most 2000 rows at a time');
  let created = 0;
  const errors = [];
  for (const [i, row] of rows.entries()) {
    try {
      await new Renewal(renewalBody(row)).save();
      created += 1;
    } catch (e) {
      errors.push({ row: i + 1, customer: row?.customer || '', error: e.errors ? Object.values(e.errors)[0].message : e.message });
    }
  }
  res.json({ created, errors });
}));

router.patch('/admin/renewals/:id', ah(async (req, res) => {
  const r = await load(req);
  const patch = renewalBody(req.body);
  if (patch.status && patch.status !== r.status) r.notes.push(note(req, `Status changed: ${r.status} → ${patch.status}`));
  r.set(patch);
  await r.save();
  res.json(await view(r));
}));

router.post('/admin/renewals/:id/notes', ah(async (req, res) => {
  const text = String(req.body?.text || '').trim();
  if (!text) throw new HttpError(400, 'Note text is required');
  const r = await load(req);
  r.notes.push(note(req, text));
  if (req.body?.contacted && r.status === 'Active') r.status = 'Contacted';
  await r.save();
  res.status(201).json(await view(r));
}));

/**
 * Customer renewed: closes this term (status Renewed) and opens the next one with the new
 * dates, PO, invoice and prices. Customer, contact, product, vendor and reminder setup carry over.
 */
router.post('/admin/renewals/:id/renew', ah(async (req, res) => {
  const old = await load(req);
  if (old.renewedTo) throw new HttpError(409, 'This term has already been renewed');
  const o = old.toObject();
  const carry = pick(o, ['customer', 'contactName', 'email', 'phone', 'description', 'serialNo', 'qty', 'salePrice', 'purchasePrice', 'vendor', 'priceBasis', 'plusGst', 'notify']);
  // custom reminder *days* still make sense for the new term; fixed *dates* belonged to the old one
  carry.reminder = o.reminder?.mode === 'days' ? { mode: 'days', days: o.reminder.days, dates: [] } : { mode: 'default', days: [], dates: [] };
  const next = new Renewal({ ...carry, ...renewalBody(req.body), status: 'Active', renewedFrom: old._id });
  await next.validate();
  await next.save();
  old.status = 'Renewed';
  old.renewedTo = next._id;
  old.notes.push(note(req, `Renewed till ${next.endDate} → ${next.code}`));
  await old.save();
  res.status(201).json({ previous: await view(old), renewal: await view(next) });
}));

router.delete('/admin/renewals/:id', ah(async (req, res) => {
  const r = await Renewal.findByIdAndDelete(idOf(req));
  if (!r) throw new HttpError(404, 'Renewal not found');
  await Promise.all([
    Renewal.updateMany({ renewedTo: r._id }, { $set: { renewedTo: null } }),
    Renewal.updateMany({ renewedFrom: r._id }, { $set: { renewedFrom: null } }),
  ]);
  res.json({ ok: true });
}));

export default router;
