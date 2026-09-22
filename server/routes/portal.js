// Client portal API — every route (except login) is scoped to the signed-in client.
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { Ticket } from '../models/index.js';
import { Client, Asset, Licence, Document, DEFAULT_ESCALATION, daysUntil } from '../models/portal.js';
import { ah, HttpError, loginLimiter, publicLimiter, requireClient, validId } from '../middleware/index.js';
import { streamFile } from '../services/files.js';

const router = Router();
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const publicClient = (c) => ({
  id: String(c._id), company: c.company, contactName: c.contactName, email: c.email, phone: c.phone,
  plan: c.plan, coverage: c.coverage, accountEngineer: c.accountEngineer,
});

const ticketView = (t) => ({
  id: String(t._id), code: t.code, subject: t.subject, pri: t.pri, cat: t.cat, desc: t.desc,
  status: t.status, owner: t.owner, createdAt: t.createdAt, updatedAt: t.updatedAt, resolvedAt: t.resolvedAt,
  updates: t.updates || [],
});
const licenceView = (l) => ({ ...l.toJSON(), days: daysUntil(l.renew) });
const assetView = (a) => ({ ...a.toJSON(), warrantyDays: daysUntil(a.warranty) });

/* ---------------- auth ---------------- */
router.post('/login', loginLimiter, ah(async (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const password = String(req.body?.password || '');
  if (!email || !password) throw new HttpError(400, 'Email and password are required');
  const client = await Client.findOne({ email });
  const ok = client && await bcrypt.compare(password, client.passwordHash);
  if (!ok) throw new HttpError(401, 'Incorrect email or password');
  if (!client.active) throw new HttpError(403, 'This portal account has been deactivated — contact your account manager');
  client.lastLoginAt = new Date();
  await client.save();
  const token = jwt.sign({ sub: String(client._id), email: client.email, role: 'client' }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
  res.json({ token, client: publicClient(client) });
}));

router.post('/forgot-password', publicLimiter, ah(async (req, res) => {
  // Never reveal whether the email exists; the request is logged as a ticket for the team when it does.
  const email = String(req.body?.email || '').trim().toLowerCase();
  const client = email && await Client.findOne({ email });
  if (client) {
    await new Ticket({
      subject: 'Portal password reset requested', pri: 'P3', cat: 'Portal access',
      desc: `Password reset requested for ${client.email} from the portal login page.`,
      client: client.company, clientId: client._id, source: '/portal/login',
    }).save();
  }
  res.json({ ok: true });
}));

router.use(requireClient);

router.get('/me', (req, res) => res.json({ client: publicClient(req.client) }));

router.post('/change-password', ah(async (req, res) => {
  const { currentPassword = '', newPassword = '' } = req.body || {};
  if (String(newPassword).length < 8) throw new HttpError(400, 'New password must be at least 8 characters');
  if (!(await bcrypt.compare(String(currentPassword), req.client.passwordHash))) throw new HttpError(401, 'Current password is incorrect');
  req.client.passwordHash = await bcrypt.hash(String(newPassword), 12);
  await req.client.save();
  res.json({ ok: true });
}));

/* ---------------- overview ---------------- */
router.get('/overview', ah(async (req, res) => {
  const c = req.client;
  const [open, recentTickets, licences] = await Promise.all([
    Ticket.find({ clientId: c._id, status: { $in: ['Open', 'In progress'] } }).sort({ createdAt: -1 }).lean(),
    Ticket.find({ clientId: c._id }).sort({ updatedAt: -1 }).limit(5).lean(),
    Licence.find({ client: c._id }).sort({ renew: 1 }),
  ]);
  const byPri = ['P1', 'P2', 'P3', 'P4'].map((p) => [p, open.filter((t) => t.pri === p).length]).filter(([, n]) => n);
  res.json({
    client: publicClient(c),
    kpis: {
      uptime: c.metrics.uptime, uptimeTarget: c.metrics.uptimeTarget,
      openTickets: open.length, openByPriority: Object.fromEntries(byPri),
      avgResponseMin: c.metrics.avgResponseMin, responseTargetMin: c.metrics.responseTargetMin,
      slaCompliance: c.metrics.slaCompliance,
    },
    openTickets: open.slice(0, 6).map(ticketView),
    recentTickets: recentTickets.map(ticketView),
    renewals: licences.map(licenceView).filter((l) => l.days !== null && l.days <= 120).slice(0, 5),
    counts: {
      assets: await Asset.countDocuments({ client: c._id }),
      licences: licences.length,
      documents: await Document.countDocuments({ client: c._id, visible: true }),
    },
  });
}));

/* ---------------- tickets ---------------- */
router.get('/tickets', ah(async (req, res) => {
  const q = { clientId: req.client._id };
  if (req.query.status) q.status = String(req.query.status);
  const items = await Ticket.find(q).sort({ createdAt: -1 }).limit(500).lean();
  res.json({ items: items.map(ticketView) });
}));

router.post('/tickets', publicLimiter, ah(async (req, res) => {
  const b = req.body || {};
  const t = new Ticket({
    subject: typeof b.subject === 'string' ? b.subject : '',
    pri: typeof b.pri === 'string' ? b.pri : 'P3',
    cat: typeof b.cat === 'string' ? b.cat : 'Other',
    desc: typeof b.desc === 'string' ? b.desc : '',
    client: req.client.company, clientId: req.client._id, source: '/portal/dashboard',
  });
  await t.save();
  res.status(201).json(ticketView(t.toObject()));
}));

async function ownTicket(req) {
  if (!validId(req.params.id)) throw new HttpError(404, 'Ticket not found');
  const t = await Ticket.findOne({ _id: req.params.id, clientId: req.client._id });
  if (!t) throw new HttpError(404, 'Ticket not found');
  return t;
}

router.get('/tickets/:id', ah(async (req, res) => res.json(ticketView((await ownTicket(req)).toObject()))));

router.post('/tickets/:id/comments', ah(async (req, res) => {
  const text = String(req.body?.text || '').trim();
  if (!text) throw new HttpError(400, 'Comment text is required');
  const t = await ownTicket(req);
  if (t.status === 'Closed') throw new HttpError(400, 'This ticket is closed — raise a new ticket instead');
  t.updates.push({ from: 'client', by: req.client.contactName || req.client.company, text: text.slice(0, 3000) });
  t.read = false;
  if (t.status === 'Resolved') { t.status = 'Open'; t.resolvedAt = null; }
  await t.save();
  res.status(201).json(ticketView(t.toObject()));
}));

/* ---------------- assets, licences, documents ---------------- */
router.get('/assets', ah(async (req, res) => {
  const items = await Asset.find({ client: req.client._id, status: { $ne: 'Retired' } }).sort({ type: 1, name: 1 });
  res.json({ items: items.map(assetView) });
}));

router.get('/licences', ah(async (req, res) => {
  const items = await Licence.find({ client: req.client._id }).sort({ renew: 1 });
  res.json({ items: items.map(licenceView) });
}));

router.post('/licences/:id/renewal-quote', publicLimiter, ah(async (req, res) => {
  if (!validId(req.params.id)) throw new HttpError(404, 'Licence not found');
  const l = await Licence.findOne({ _id: req.params.id, client: req.client._id });
  if (!l) throw new HttpError(404, 'Licence not found');
  const existing = await Ticket.findOne({ clientId: req.client._id, cat: 'Licensing', subject: `Renewal quote: ${l.name}`, status: { $in: ['Open', 'In progress'] } });
  if (existing) return res.json({ ok: true, ticket: ticketView(existing.toObject()), alreadyRequested: true });
  const t = new Ticket({
    subject: `Renewal quote: ${l.name}`, pri: 'P4', cat: 'Licensing',
    desc: `Please send a renewal quote for ${l.qty} × ${l.name}${l.vendor ? ` (${l.vendor})` : ''}, renewing on ${l.renew}.`,
    client: req.client.company, clientId: req.client._id, source: '/portal/dashboard',
  });
  await t.save();
  return res.status(201).json({ ok: true, ticket: ticketView(t.toObject()) });
}));

router.get('/documents', ah(async (req, res) => {
  const items = await Document.find({ client: req.client._id, visible: true }).sort({ createdAt: -1 });
  res.json({ items: items.map((d) => d.toJSON()) });
}));

router.get('/documents/:id/download', ah(async (req, res) => {
  if (!validId(req.params.id)) throw new HttpError(404, 'Document not found');
  const d = await Document.findOne({ _id: req.params.id, client: req.client._id, visible: true }).lean();
  if (!d) throw new HttpError(404, 'Document not found');
  await streamFile(d.file.fileId, res, 'documents');
}));

/* ---------------- escalation, search, SLA report ---------------- */
router.get('/escalation', (req, res) => {
  const c = req.client;
  res.json({
    accountEngineer: c.accountEngineer, plan: c.plan, coverage: c.coverage,
    levels: c.escalation?.length ? c.escalation : DEFAULT_ESCALATION,
  });
});

router.get('/search', ah(async (req, res) => {
  const q = String(req.query.q || '').trim();
  if (q.length < 2) return res.json({ items: [] });
  const re = new RegExp(escapeRe(q), 'i');
  const id = req.client._id;
  const [tickets, assets, licences, docs] = await Promise.all([
    Ticket.find({ clientId: id, $or: [{ code: re }, { subject: re }, { desc: re }, { cat: re }] }).limit(8).lean(),
    Asset.find({ client: id, $or: [{ name: re }, { model: re }, { serial: re }, { type: re }, { location: re }] }).limit(8).lean(),
    Licence.find({ client: id, $or: [{ name: re }, { vendor: re }] }).limit(8).lean(),
    Document.find({ client: id, visible: true, $or: [{ title: re }, { category: re }] }).limit(8).lean(),
  ]);
  return res.json({
    items: [
      ...tickets.map((t) => ({ kind: 'ticket', id: String(t._id), title: `${t.code} · ${t.subject}`, sub: `${t.status} · ${t.pri}` })),
      ...assets.map((a) => ({ kind: 'asset', id: String(a._id), title: a.name, sub: `${a.type} · ${a.model}` })),
      ...licences.map((l) => ({ kind: 'licence', id: String(l._id), title: l.name, sub: `Renews ${l.renew}` })),
      ...docs.map((d) => ({ kind: 'document', id: String(d._id), title: d.title, sub: d.category })),
    ],
  });
}));

router.get('/sla-report', ah(async (req, res) => {
  const c = req.client;
  const since = new Date(Date.now() - 30 * 86400000);
  const tickets = await Ticket.find({ clientId: c._id, createdAt: { $gte: since } }).sort({ createdAt: -1 }).lean();
  const esc = (v) => { const s = String(v ?? ''); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
  const lines = [
    ['SLA report', c.company], ['Period', `${since.toISOString().slice(0, 10)} to ${new Date().toISOString().slice(0, 10)}`],
    ['Plan', `${c.plan} · ${c.coverage}`], ['Uptime', `${c.metrics.uptime}% (target ${c.metrics.uptimeTarget}%)`],
    ['Average response', `${c.metrics.avgResponseMin} min (target ${c.metrics.responseTargetMin} min)`],
    ['SLA compliance', `${c.metrics.slaCompliance}%`], [],
    ['Ticket', 'Subject', 'Priority', 'Category', 'Status', 'Raised', 'Resolved'],
    ...tickets.map((t) => [t.code, t.subject, t.pri, t.cat, t.status, t.createdAt.toISOString().slice(0, 16).replace('T', ' '), t.resolvedAt ? t.resolvedAt.toISOString().slice(0, 16).replace('T', ' ') : '']),
  ];
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="SLA-report-${new Date().toISOString().slice(0, 7)}.csv"`);
  res.send(`﻿${lines.map((l) => l.map(esc).join(',')).join('\n')}`);
}));

export default router;
