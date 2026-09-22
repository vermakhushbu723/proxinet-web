// Admin management of client-portal data: clients, assets, licences, documents, ticket replies.
import { Router } from 'express';
import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { Ticket } from '../models/index.js';
import { Client, Asset, Licence, Document, DEFAULT_ESCALATION, daysUntil } from '../models/portal.js';
import { ah, HttpError, requireAdmin, validId } from '../middleware/index.js';
import { documentUpload, saveFile, streamFile, deleteFile } from '../services/files.js';

const router = Router();
router.use(['/clients', '/assets', '/licences', '/documents', '/tickets'], requireAdmin);

const genPassword = () => `Px${crypto.randomBytes(7).toString('base64url')}#${Math.floor(10 + Math.random() * 89)}`;
const idOf = (req) => { if (!validId(req.params.id)) throw new HttpError(404, 'Record not found'); return req.params.id; };
const pick = (body = {}, keys) => Object.fromEntries(keys.filter((k) => body[k] !== undefined).map((k) => [k, body[k]]));
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Login emails are unique — checked explicitly so it holds even before the DB index exists. */
async function assertEmailFree(email, exceptId) {
  if (!email) return;
  const clash = await Client.findOne({ email: String(email).trim().toLowerCase(), ...(exceptId ? { _id: { $ne: exceptId } } : {}) }).lean();
  if (clash) throw new HttpError(409, 'Another client already uses this login email');
}

async function assertClient(id) {
  if (!validId(id)) throw new HttpError(400, 'Choose a client');
  const c = await Client.findById(id).lean();
  if (!c) throw new HttpError(400, 'Client not found');
  return c;
}

/* ================= clients ================= */
const CLIENT_FIELDS = ['company', 'contactName', 'email', 'phone', 'plan', 'coverage', 'accountEngineer', 'active', 'metrics', 'escalation'];

router.get('/clients', ah(async (_req, res) => {
  const clients = await Client.find().sort({ company: 1 });
  const ids = clients.map((c) => c._id);
  const count = async (model, field, extra = {}) => Object.fromEntries(
    (await model.aggregate([{ $match: { [field]: { $in: ids }, ...extra } }, { $group: { _id: `$${field}`, n: { $sum: 1 } } }])).map((r) => [String(r._id), r.n]),
  );
  const [assets, licences, docs, openTickets] = await Promise.all([
    count(Asset, 'client'), count(Licence, 'client'), count(Document, 'client'),
    count(Ticket, 'clientId', { status: { $in: ['Open', 'In progress'] } }),
  ]);
  res.json({
    items: clients.map((c) => {
      const id = String(c._id);
      return { ...c.toJSON(), counts: { assets: assets[id] || 0, licences: licences[id] || 0, documents: docs[id] || 0, openTickets: openTickets[id] || 0 } };
    }),
  });
}));

router.post('/clients', ah(async (req, res) => {
  const password = String(req.body?.password || '') || genPassword();
  if (password.length < 8) throw new HttpError(400, 'Password must be at least 8 characters');
  await assertEmailFree(req.body?.email);
  const c = new Client({
    escalation: DEFAULT_ESCALATION,
    ...pick(req.body, CLIENT_FIELDS),
    passwordHash: await bcrypt.hash(password, 12),
  });
  await c.save();
  res.status(201).json({ client: c.toJSON(), password });
}));

router.patch('/clients/:id', ah(async (req, res) => {
  const c = await Client.findById(idOf(req));
  if (!c) throw new HttpError(404, 'Client not found');
  const patch = pick(req.body, CLIENT_FIELDS);
  await assertEmailFree(patch.email, c._id);
  if (patch.metrics) patch.metrics = { ...c.metrics.toObject(), ...patch.metrics };
  c.set(patch);
  await c.save();
  if (patch.company) await Ticket.updateMany({ clientId: c._id }, { $set: { client: c.company } });
  res.json(c.toJSON());
}));

router.post('/clients/:id/password', ah(async (req, res) => {
  const c = await Client.findById(idOf(req));
  if (!c) throw new HttpError(404, 'Client not found');
  const password = String(req.body?.password || '') || genPassword();
  if (password.length < 8) throw new HttpError(400, 'Password must be at least 8 characters');
  c.passwordHash = await bcrypt.hash(password, 12);
  await c.save();
  res.json({ ok: true, email: c.email, password });
}));

router.delete('/clients/:id', ah(async (req, res) => {
  const id = idOf(req);
  const docs = await Document.find({ client: id }, { file: 1 }).lean();
  await Promise.all(docs.map((d) => deleteFile(d.file?.fileId, 'documents')));
  await Promise.all([Asset.deleteMany({ client: id }), Licence.deleteMany({ client: id }), Document.deleteMany({ client: id })]);
  await Ticket.updateMany({ clientId: id }, { $set: { clientId: null } });
  const r = await Client.deleteOne({ _id: id });
  if (!r.deletedCount) throw new HttpError(404, 'Client not found');
  res.json({ ok: true });
}));

/* ================= generic client-scoped CRUD: assets & licences ================= */
function crud(path, Model, fields, search, view = (d) => d.toJSON()) {
  router.get(`/${path}`, ah(async (req, res) => {
    const q = {};
    if (req.query.client) q.client = String(req.query.client);
    if (req.query.q) {
      const re = new RegExp(escapeRe(String(req.query.q)), 'i');
      q.$or = search.map((f) => ({ [f]: re }));
    }
    const items = await Model.find(q).sort({ createdAt: -1 }).limit(1000).populate('client', 'company');
    res.json({ items: items.map((d) => ({ ...view(d), clientName: d.client?.company || '—', client: d.client?._id ? String(d.client._id) : null })) });
  }));
  router.post(`/${path}`, ah(async (req, res) => {
    await assertClient(req.body?.client);
    const d = new Model(pick(req.body, ['client', ...fields]));
    await d.save();
    res.status(201).json(view(d));
  }));
  router.patch(`/${path}/:id`, ah(async (req, res) => {
    const d = await Model.findById(idOf(req));
    if (!d) throw new HttpError(404, 'Record not found');
    if (req.body?.client) await assertClient(req.body.client);
    d.set(pick(req.body, ['client', ...fields]));
    await d.save();
    res.json(view(d));
  }));
  router.delete(`/${path}/:id`, ah(async (req, res) => {
    const r = await Model.deleteOne({ _id: idOf(req) });
    if (!r.deletedCount) throw new HttpError(404, 'Record not found');
    res.json({ ok: true });
  }));
}
crud('assets', Asset, ['name', 'type', 'model', 'serial', 'location', 'warranty', 'status', 'notes'], ['name', 'model', 'serial', 'location', 'type'],
  (d) => ({ ...d.toJSON(), warrantyDays: daysUntil(d.warranty) }));
crud('licences', Licence, ['name', 'vendor', 'qty', 'renew', 'notes'], ['name', 'vendor'],
  (d) => ({ ...d.toJSON(), days: daysUntil(d.renew) }));

/* ================= documents (file upload to GridFS) ================= */
router.get('/documents', ah(async (req, res) => {
  const q = req.query.client ? { client: String(req.query.client) } : {};
  const items = await Document.find(q).sort({ createdAt: -1 }).limit(1000).populate('client', 'company');
  res.json({ items: items.map((d) => ({ ...d.toJSON(), clientName: d.client?.company || '—', client: d.client?._id ? String(d.client._id) : null })) });
}));

router.post('/documents', (req, res, next) => documentUpload(req, res, (err) => (err ? next(err) : next())), ah(async (req, res) => {
  if (!req.file) throw new HttpError(400, 'Choose a file to upload');
  await assertClient(req.body?.client);
  const d = new Document({
    client: req.body.client, title: req.body.title || req.file.originalname, category: req.body.category || 'Other',
    visible: req.body.visible !== 'false', file: { fileId: undefined },
  });
  d.file = await saveFile(req.file, 'documents');
  try {
    await d.save();
  } catch (e) {
    await deleteFile(d.file.fileId, 'documents');
    throw e;
  }
  res.status(201).json(d.toJSON());
}));

router.patch('/documents/:id', ah(async (req, res) => {
  const d = await Document.findById(idOf(req));
  if (!d) throw new HttpError(404, 'Document not found');
  d.set(pick(req.body, ['title', 'category', 'visible']));
  await d.save();
  res.json(d.toJSON());
}));

router.get('/documents/:id/download', ah(async (req, res) => {
  const d = await Document.findById(idOf(req)).lean();
  if (!d) throw new HttpError(404, 'Document not found');
  await streamFile(d.file.fileId, res, 'documents');
}));

router.delete('/documents/:id', ah(async (req, res) => {
  const d = await Document.findById(idOf(req)).lean();
  if (!d) throw new HttpError(404, 'Document not found');
  await deleteFile(d.file?.fileId, 'documents');
  await Document.deleteOne({ _id: d._id });
  res.json({ ok: true });
}));

/* ================= ticket reply visible to the client ================= */
router.post('/tickets/:id/reply', ah(async (req, res) => {
  const text = String(req.body?.text || '').trim();
  if (!text) throw new HttpError(400, 'Reply text is required');
  const t = await Ticket.findById(idOf(req));
  if (!t) throw new HttpError(404, 'Ticket not found');
  t.updates.push({ from: 'team', by: req.admin.name || 'ProXinet team', text: text.slice(0, 3000) });
  if (req.body?.status) {
    t.status = req.body.status;
    t.resolvedAt = ['Resolved', 'Closed'].includes(t.status) ? new Date() : null;
  }
  if (req.body?.owner !== undefined) t.owner = String(req.body.owner).slice(0, 80);
  t.read = true;
  await t.save();
  const out = t.toJSON();
  res.json(out);
}));

export default router;
