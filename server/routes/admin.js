import { Router } from 'express';
import { collections, collectionKeys } from '../collections.js';
import { Application, Chat } from '../models/index.js';
import { serialize } from '../models/helpers.js';
import { ah, HttpError, requireAdmin, validId } from '../middleware/index.js';
import { dashboardStats, unreadSummary } from '../services/stats.js';
import { streamFile, deleteFile } from '../services/files.js';
import { seedDemoData, clearAllData } from '../seed/seed.js';

const router = Router();
router.use(requireAdmin);

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function collectionOf(req) {
  const cfg = collections[req.params.key];
  if (!cfg) throw new HttpError(404, `Unknown collection "${req.params.key}"`);
  return cfg;
}

function idOf(req) {
  if (!validId(req.params.id)) throw new HttpError(404, 'Record not found');
  return req.params.id;
}

/** Only workflow fields can be changed from the admin — never the visitor's submitted data. */
function workflowPatch(cfg, body = {}) {
  const patch = {};
  if (body.status !== undefined) {
    const allowed = cfg.model.schema.path('status').enumValues;
    if (!allowed.includes(body.status)) throw new HttpError(400, `Status must be one of: ${allowed.join(', ')}`);
    patch.status = body.status;
  }
  if (body.read !== undefined) patch.read = Boolean(body.read);
  if (!Object.keys(patch).length) throw new HttpError(400, 'Nothing to update — send status and/or read');
  return patch;
}

function idsOf(body) {
  const ids = Array.isArray(body?.ids) ? body.ids.filter(validId) : [];
  if (!ids.length) throw new HttpError(400, 'Send a non-empty "ids" array');
  if (ids.length > 1000) throw new HttpError(400, 'Too many ids in one request');
  return ids;
}

/* ---------------- dashboard ---------------- */
router.get('/stats', ah(async (req, res) => res.json(await dashboardStats({ tz: req.query.tz || 'Asia/Kolkata' }))));
router.get('/unread', ah(async (_req, res) => res.json(await unreadSummary())));

router.get('/export', ah(async (_req, res) => {
  const data = Object.fromEntries(await Promise.all(collectionKeys.map(async (k) => [k, (await collections[k].model.find().sort({ createdAt: -1 }).lean()).map(serialize)])));
  res.setHeader('Content-Disposition', `attachment; filename="proxinet-backup-${new Date().toISOString().slice(0, 10)}.json"`);
  res.json({ exportedAt: new Date().toISOString(), data });
}));

router.post('/demo-data', ah(async (_req, res) => res.json({ ok: true, counts: await seedDemoData() })));
router.delete('/data', ah(async (_req, res) => { await clearAllData(); res.json({ ok: true }); }));

/* ---------------- special actions ---------------- */
router.get('/collections/applications/:id/resume', ah(async (req, res) => {
  const app = await Application.findById(idOf(req)).lean();
  if (!app?.resume?.fileId) throw new HttpError(404, 'No resume file for this application');
  await streamFile(app.resume.fileId, res);
}));

router.post('/collections/chats/:id/reply', ah(async (req, res) => {
  const text = String(req.body?.text || '').trim();
  if (!text) throw new HttpError(400, 'Reply text is required');
  const chat = await Chat.findById(idOf(req));
  if (!chat) throw new HttpError(404, 'Conversation not found');
  chat.messages.push({ from: 'agent', text: text.slice(0, 2000) });
  chat.read = true;
  await chat.save();
  res.json(chat.toJSON());
}));

/* ---------------- generic CRUD for every form ---------------- */
router.get('/collections/:key', ah(async (req, res) => {
  const cfg = collectionOf(req);
  const { q = '', status, filter, unread } = req.query;
  const limit = Math.min(Math.max(Number(req.query.limit) || 500, 1), 1000);
  const page = Math.max(Number(req.query.page) || 1, 1);

  const query = {};
  if (status) query.status = String(status);
  if (unread === '1' || unread === 'true') query.read = false;
  if (filter && cfg.filter) query[cfg.filter] = String(filter);
  if (String(q).trim()) {
    const re = new RegExp(escapeRe(String(q).trim()), 'i');
    query.$or = cfg.search.map((f) => ({ [f]: re }));
  }

  const [items, total] = await Promise.all([
    cfg.model.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    cfg.model.countDocuments(query),
  ]);
  res.json({ items: items.map(serialize), total, page, limit, statuses: cfg.model.schema.path('status').enumValues });
}));

router.get('/collections/:key/:id', ah(async (req, res) => {
  const cfg = collectionOf(req);
  const doc = await cfg.model.findById(idOf(req)).lean();
  if (!doc) throw new HttpError(404, 'Record not found');
  res.json(serialize(doc));
}));

router.patch('/collections/:key/:id', ah(async (req, res) => {
  const cfg = collectionOf(req);
  const doc = await cfg.model.findByIdAndUpdate(idOf(req), { $set: workflowPatch(cfg, req.body) }, { new: true, runValidators: true }).lean();
  if (!doc) throw new HttpError(404, 'Record not found');
  res.json(serialize(doc));
}));

router.patch('/collections/:key', ah(async (req, res) => {
  const cfg = collectionOf(req);
  const ids = idsOf(req.body);
  const r = await cfg.model.updateMany({ _id: { $in: ids } }, { $set: workflowPatch(cfg, req.body) }, { runValidators: true });
  res.json({ ok: true, matched: r.matchedCount, modified: r.modifiedCount });
}));

router.post('/collections/:key/:id/notes', ah(async (req, res) => {
  const cfg = collectionOf(req);
  const text = String(req.body?.text || '').trim();
  if (!text) throw new HttpError(400, 'Note text is required');
  const doc = await cfg.model.findByIdAndUpdate(
    idOf(req),
    { $push: { notes: { text: text.slice(0, 2000), by: req.admin.name || req.admin.email, at: new Date() } } },
    { new: true, runValidators: true },
  ).lean();
  if (!doc) throw new HttpError(404, 'Record not found');
  res.status(201).json(serialize(doc));
}));

async function removeFilesFor(key, ids) {
  if (key !== 'applications') return;
  const apps = await Application.find({ _id: { $in: ids } }, { resume: 1 }).lean();
  await Promise.all(apps.map((a) => deleteFile(a.resume?.fileId)));
}

router.delete('/collections/:key/:id', ah(async (req, res) => {
  const cfg = collectionOf(req);
  const id = idOf(req);
  await removeFilesFor(req.params.key, [id]);
  const r = await cfg.model.deleteOne({ _id: id });
  if (!r.deletedCount) throw new HttpError(404, 'Record not found');
  res.json({ ok: true });
}));

router.post('/collections/:key/bulk-delete', ah(async (req, res) => {
  const cfg = collectionOf(req);
  const ids = idsOf(req.body);
  await removeFilesFor(req.params.key, ids);
  const r = await cfg.model.deleteMany({ _id: { $in: ids } });
  res.json({ ok: true, deleted: r.deletedCount });
}));

export default router;
