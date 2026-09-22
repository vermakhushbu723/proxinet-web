import { Router } from 'express';
import { collections } from '../collections.js';
import { Chat, Subscriber, Application } from '../models/index.js';
import { ah, HttpError, publicLimiter, validId } from '../middleware/index.js';
import { resumeUpload, saveFile, deleteFile } from '../services/files.js';

const router = Router();

/** Keeps only whitelisted keys with plain scalar values — objects/arrays are dropped, never stringified. */
const pick = (body = {}, keys) => Object.fromEntries(keys
  .filter((k) => ['string', 'number', 'boolean'].includes(typeof body[k]))
  .map((k) => [k, String(body[k])]));

const sourceOf = (req) => String(req.body?.source || req.get('referer') || '').replace(/^https?:\/\/[^/]+/, '').slice(0, 300);

const created = (res, doc) => res.status(201).json({ ok: true, id: String(doc._id), code: doc.code });

/* Generic form endpoints: leads, assessments, downloads, tool-reports, procurement
   (support tickets are created through the authenticated client portal — /api/portal/tickets) */
['leads', 'assessments', 'downloads', 'toolReports', 'procurement'].forEach((key) => {
  const cfg = collections[key];
  router.post(`/${cfg.route}`, publicLimiter, ah(async (req, res) => {
    const doc = new cfg.model({ ...pick(req.body, cfg.publicFields), source: sourceOf(req) });
    await doc.save();
    created(res, doc);
  }));
});

/* Newsletter — idempotent: re-subscribing an existing email is not an error */
router.post('/subscribers', publicLimiter, ah(async (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const existing = email && await Subscriber.findOne({ email });
  if (existing) {
    if (existing.status !== 'Active') {
      existing.status = 'Active';
      existing.read = false;
      await existing.save();
      return res.status(200).json({ ok: true, id: String(existing._id), code: existing.code, resubscribed: true });
    }
    return res.status(200).json({ ok: true, id: String(existing._id), code: existing.code, alreadySubscribed: true });
  }
  const doc = new Subscriber({ email, source: sourceOf(req) });
  await doc.save();
  return created(res, doc);
}));

/* Careers — multipart form with the resume file */
router.post('/applications', publicLimiter, (req, res, next) => resumeUpload(req, res, (err) => (err ? next(err) : next())), ah(async (req, res) => {
  if (!req.file) throw new HttpError(400, 'Please attach your resume', { fields: { resume: 'Please attach your resume' } });
  const doc = new Application({ ...pick(req.body, collections.applications.publicFields), source: sourceOf(req) });
  await doc.validate(); // validate text fields before storing the file
  doc.resume = await saveFile(req.file);
  try {
    await doc.save();
  } catch (e) {
    await deleteFile(doc.resume.fileId);
    throw e;
  }
  created(res, doc);
}));

/* Chat assistant — start a conversation, then append messages */
router.post('/chats', publicLimiter, ah(async (req, res) => {
  const text = String(req.body?.text || '').trim();
  const doc = new Chat({ firstMessage: text, messages: [{ from: 'me', text }], source: sourceOf(req) });
  await doc.save();
  created(res, doc);
}));

router.post('/chats/:id/messages', ah(async (req, res) => {
  if (!validId(req.params.id)) throw new HttpError(404, 'Conversation not found');
  const from = req.body?.from === 'bot' ? 'bot' : 'me';
  const text = String(req.body?.text || '').trim();
  if (!text) throw new HttpError(400, 'Message is required');
  const chat = await Chat.findById(req.params.id);
  if (!chat) throw new HttpError(404, 'Conversation not found');
  if (Date.now() - chat.updatedAt.getTime() > 24 * 3600 * 1000) throw new HttpError(410, 'This conversation has expired — start a new one');
  if (chat.messages.length >= 200) throw new HttpError(400, 'Conversation is too long');
  chat.messages.push({ from, text: text.slice(0, 2000) });
  if (from === 'me') {
    chat.read = false;
    if (chat.status === 'Handled') chat.status = 'Open';
  }
  await chat.save();
  res.status(201).json({ ok: true, messages: chat.messages.length });
}));

export default router;
