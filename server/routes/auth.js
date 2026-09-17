import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { Admin } from '../models/index.js';
import { ah, HttpError, loginLimiter, requireAdmin } from '../middleware/index.js';

const router = Router();

/** Creates the first admin from ADMIN_EMAIL / ADMIN_PASSWORD when none exists yet. */
export async function ensureAdmin() {
  if (await Admin.estimatedDocumentCount() > 0) return;
  if (!env.adminEmail || !env.adminPassword) return;
  await Admin.updateOne(
    { email: env.adminEmail },
    { $setOnInsert: { email: env.adminEmail, name: 'Admin', passwordHash: await bcrypt.hash(env.adminPassword, 12) } },
    { upsert: true },
  );
}

const publicAdmin = (a) => ({ id: String(a._id), email: a.email, name: a.name });

router.post('/login', loginLimiter, ah(async (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const password = String(req.body?.password || '');
  if (!email || !password) throw new HttpError(400, 'Email and password are required');

  await ensureAdmin();
  const admin = await Admin.findOne({ email });
  const ok = admin && await bcrypt.compare(password, admin.passwordHash);
  if (!ok) throw new HttpError(401, 'Incorrect email or password');

  admin.lastLoginAt = new Date();
  await admin.save();
  const token = jwt.sign({ sub: String(admin._id), email: admin.email, name: admin.name }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
  res.json({ token, admin: publicAdmin(admin) });
}));

router.get('/me', requireAdmin, ah(async (req, res) => {
  const admin = await Admin.findById(req.admin.sub);
  if (!admin) throw new HttpError(401, 'Account no longer exists');
  res.json({ admin: publicAdmin(admin) });
}));

router.post('/change-password', requireAdmin, ah(async (req, res) => {
  const { currentPassword = '', newPassword = '' } = req.body || {};
  if (String(newPassword).length < 8) throw new HttpError(400, 'New password must be at least 8 characters');
  const admin = await Admin.findById(req.admin.sub);
  if (!admin || !(await bcrypt.compare(String(currentPassword), admin.passwordHash))) throw new HttpError(401, 'Current password is incorrect');
  admin.passwordHash = await bcrypt.hash(String(newPassword), 12);
  await admin.save();
  res.json({ ok: true });
}));

export default router;
