import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';
import { env } from './config/env.js';
import { withDb, sanitize, notFound, errorHandler } from './middleware/index.js';
import publicRoutes from './routes/public.js';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';

const app = express();

app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } })); // API responses readable from any allowed origin
app.use(cors({
  origin: (origin, cb) => {
    // same-origin requests (the site calling its own /api) send no Origin header
    // CORS_ORIGIN=* (or empty) allows every origin; admin routes still require a Bearer token
    if (!origin || env.corsOrigins.length === 0 || env.corsOrigins.includes('*') || env.corsOrigins.includes(origin)) return cb(null, true);
    return cb(null, false);
  },
}));
app.use(express.json({ limit: '200kb' }));
app.use(express.urlencoded({ extended: false, limit: '200kb' }));
app.use(sanitize);

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, db: ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection.readyState] || 'unknown', time: new Date().toISOString() });
});

app.use('/api', withDb);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', publicRoutes);

app.use('/api', notFound);
app.use(errorHandler);

export default app;
