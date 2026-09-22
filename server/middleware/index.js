import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';
import { connectDB } from '../db/connect.js';

export class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

/** Wraps async route handlers so thrown errors reach the error middleware. */
export const ah = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

export const withDb = ah(async (_req, _res, next) => {
  await connectDB();
  next();
});

/** Removes keys that could be used for Mongo operator injection ($gt, a.b, …). */
export function sanitize(req, _res, next) {
  const clean = (v) => {
    if (Array.isArray(v)) return v.map(clean);
    if (v && typeof v === 'object' && !(v instanceof Date)) {
      return Object.fromEntries(Object.entries(v).filter(([k]) => !k.startsWith('$') && !k.includes('.')).map(([k, val]) => [k, clean(val)]));
    }
    return v;
  };
  if (req.body) req.body = clean(req.body);
  next();
}

export function requireAdmin(req, _res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return next(new HttpError(401, 'Authentication required'));
  try {
    const payload = jwt.verify(token, env.jwtSecret);
    if (payload.role === 'client') return next(new HttpError(403, 'Admin access required'));
    req.admin = payload;
    return next();
  } catch {
    return next(new HttpError(401, 'Session expired — please sign in again'));
  }
}

/** Client-portal token (role: client). Loads the client and rejects deactivated accounts. */
export const requireClient = ah(async (req, _res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) throw new HttpError(401, 'Please sign in to the client portal');
  let payload;
  try {
    payload = jwt.verify(token, env.jwtSecret);
  } catch {
    throw new HttpError(401, 'Session expired — please sign in again');
  }
  if (payload.role !== 'client') throw new HttpError(403, 'Client portal access required');
  const { Client } = await import('../models/portal.js');
  const client = await Client.findById(payload.sub);
  if (!client || !client.active) throw new HttpError(401, 'This portal account is no longer active');
  req.client = client;
  next();
});

export const validId = (id) => mongoose.isValidObjectId(id);

const limiter = (max, windowMin, message) => rateLimit({
  windowMs: windowMin * 60 * 1000, max, standardHeaders: 'draft-7', legacyHeaders: false,
  message: { error: message },
  skip: () => process.env.DISABLE_RATE_LIMIT === '1',
});

export const publicLimiter = limiter(40, 15, 'Too many submissions from this network — please try again in a few minutes.');
export const loginLimiter = limiter(10, 15, 'Too many login attempts — please wait 15 minutes.');

export function notFound(req, _res, next) {
  next(new HttpError(404, `No API route for ${req.method} ${req.originalUrl}`));
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  if (err instanceof mongoose.Error.ValidationError) {
    const fields = Object.fromEntries(Object.entries(err.errors).map(([k, e]) => [k, e.message]));
    return res.status(400).json({ error: Object.values(fields)[0] || 'Invalid data', fields });
  }
  if (err?.code === 11000) return res.status(409).json({ error: 'This record already exists' });
  if (err?.type === 'entity.parse.failed') return res.status(400).json({ error: 'Invalid JSON body' });
  if (err?.name === 'MulterError') return res.status(400).json({ error: err.code === 'LIMIT_FILE_SIZE' ? 'File is larger than 2 MB' : err.message });
  const status = err.status || 500;
  if (status >= 500) console.error('[api]', err);
  return res.status(status).json({ error: status >= 500 && env.isProd ? 'Something went wrong' : err.message, ...(err.details ? { details: err.details } : {}) });
}
