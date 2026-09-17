import app from './app.js';
import { env } from './config/env.js';
import { connectDB } from './db/connect.js';
import { ensureAdmin } from './routes/auth.js';

try {
  await connectDB();
  await ensureAdmin();
  console.log(`[api] MongoDB connected (db: ${env.dbName})`);
} catch (err) {
  console.error('[api] MongoDB connection failed:', err.message);
}

app.listen(env.port, () => console.log(`[api] listening on http://localhost:${env.port}`));
