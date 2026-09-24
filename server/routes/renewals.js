// Admin: customer renewals (products/subscriptions sold, their term, and follow-up) + the reminder cron.
import { Router } from 'express';
import { env } from '../config/env.js';
import { Renewal, RENEWAL_STATUSES } from '../models/renewal.js';
import { ah, HttpError, requireAdmin, validId } from '../middleware/index.js';
import { todayYmd, withDays, dueRenewals, sendDailyReminder } from '../services/renewals.js';

const router = Router();

const FIELDS = ['customer', 'contactName', 'email', 'phone', 'description', 'serialNo', 'qty', 'poNo', 'invoiceNo',
  'startDate', 'endDate', 'salePrice', 'purchasePrice', 'priceBasis', 'plusGst', 'status'];
const pick = (body = {}, keys = FIELDS) => Object.fromEntries(keys.filter((k) => body[k] !== undefined).map((k) => [k, body[k]]));
const idOf = (req) => { if (!validId(req.params.id)) throw new HttpError(404, 'Renewal not found'); return req.params.id; };
async function load(req) {
  const r = await Renewal.findById(idOf(req));
  if (!r) throw new HttpError(404, 'Renewal not found');
  return r;
}
const note = (req, text) => ({ text: String(text).slice(0, 2000), by: req.admin?.name || req.admin?.email || 'Admin', at: new Date() });

/* ---------------- Vercel cron (no admin token — protected by CRON_SECRET) ---------------- */
router.get('/cron/renewal-reminders', ah(async (req, res) => {
  if (!env.cronSecret || req.headers.authorization !== `Bearer ${env.cronSecret}`) throw new HttpError(401, 'Unauthorized');
  res.json(await sendDailyReminder());
}));

/* ---------------- admin ---------------- */
router.use('/admin/renewals', requireAdmin);

router.get('/admin/renewals', ah(async (_req, res) => {
  const today = todayYmd();
  const items = await Renewal.find().sort({ endDate: 1, customer: 1 }).limit(5000);
  res.json({ items: items.map((d) => withDays(d, today)), today, remindDays: env.remindDays, statuses: RENEWAL_STATUSES });
}));

router.get('/admin/renewals/reminders', ah(async (_req, res) => {
  const today = todayYmd();
  const items = await dueRenewals(today);
  res.json({
    today, remindDays: env.remindDays, items,
    expired: items.filter((i) => i.daysLeft < 0).length,
    emailConfigured: Boolean(env.smtp.host && env.reminderEmailTo),
  });
}));

router.post('/admin/renewals/reminders/send', ah(async (_req, res) => res.json(await sendDailyReminder({ force: true }))));

router.post('/admin/renewals', ah(async (req, res) => {
  const r = new Renewal(pick(req.body));
  await r.save();
  res.status(201).json(withDays(r));
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
      await new Renewal(pick(row)).save();
      created += 1;
    } catch (e) {
      errors.push({ row: i + 1, customer: row?.customer || '', error: e.errors ? Object.values(e.errors)[0].message : e.message });
    }
  }
  res.json({ created, errors });
}));

router.patch('/admin/renewals/:id', ah(async (req, res) => {
  const r = await load(req);
  const patch = pick(req.body);
  if (patch.status && patch.status !== r.status) r.notes.push(note(req, `Status changed: ${r.status} → ${patch.status}`));
  r.set(patch);
  await r.save();
  res.json(withDays(r));
}));

router.post('/admin/renewals/:id/notes', ah(async (req, res) => {
  const text = String(req.body?.text || '').trim();
  if (!text) throw new HttpError(400, 'Note text is required');
  const r = await load(req);
  r.notes.push(note(req, text));
  if (req.body?.contacted && r.status === 'Active') r.status = 'Contacted';
  await r.save();
  res.status(201).json(withDays(r));
}));

/**
 * Customer renewed: closes this term (status Renewed) and opens the next one with the new
 * dates, PO, invoice and prices. Customer, contact and product details carry over.
 */
router.post('/admin/renewals/:id/renew', ah(async (req, res) => {
  const old = await load(req);
  if (old.renewedTo) throw new HttpError(409, 'This term has already been renewed');
  const carry = pick(old.toObject(), ['customer', 'contactName', 'email', 'phone', 'description', 'serialNo', 'qty', 'salePrice', 'purchasePrice', 'priceBasis', 'plusGst']);
  const next = new Renewal({ ...carry, ...pick(req.body), status: 'Active', renewedFrom: old._id });
  await next.validate();
  await next.save();
  old.status = 'Renewed';
  old.renewedTo = next._id;
  old.notes.push(note(req, `Renewed till ${next.endDate} → ${next.code}`));
  await old.save();
  res.status(201).json({ previous: withDays(old), renewal: withDays(next) });
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
