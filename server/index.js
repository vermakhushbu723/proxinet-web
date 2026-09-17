import app from './app.js';
import { env } from './config/env.js';
import { connectDB, disconnectDB } from './db/connect.js';
import { ensureAdmin } from './routes/auth.js';

// Open the port immediately — requests that arrive before MongoDB is ready simply wait
// for the connection (withDb middleware) instead of being refused.
const server = app.listen(env.port, () => console.log(`[api] listening on http://localhost:${env.port}`));

// Keep idle connections open longer than the dev proxy's agent reuses them,
// otherwise Node closes a socket the proxy is about to reuse → "read ECONNRESET".
server.keepAliveTimeout = 65_000;
server.headersTimeout = 66_000;

connectDB()
  .then(() => ensureAdmin())
  .then(() => console.log(`[api] MongoDB connected (db: ${env.dbName})`))
  .catch((err) => console.error('[api] MongoDB connection failed (will retry on next request):', err.message));

// Graceful shutdown so `node --watch` restarts don't cut requests mid-flight
let closing = false;
const shutdown = (signal) => {
  if (closing) return;
  closing = true;
  console.log(`[api] ${signal} — finishing open requests…`);
  server.close(() => disconnectDB().finally(() => process.exit(0)));
  setTimeout(() => process.exit(0), 5000).unref();
};
['SIGINT', 'SIGTERM'].forEach((s) => process.on(s, () => shutdown(s)));
