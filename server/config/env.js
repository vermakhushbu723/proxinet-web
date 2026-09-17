import 'dotenv/config';
import dns from 'node:dns';

// Some local networks/sandboxes resolve DNS through a stub that refuses SRV lookups (mongodb+srv).
// Set DNS_SERVERS=8.8.8.8,1.1.1.1 in .env to bypass it. Not needed on Vercel.
if (process.env.DNS_SERVERS) dns.setServers(process.env.DNS_SERVERS.split(',').map((s) => s.trim()));

const required = ['MONGODB_URI', 'JWT_SECRET'];
const missing = required.filter((k) => !process.env[k]);
if (missing.length) {
  throw new Error(`Missing environment variables: ${missing.join(', ')} — copy .env.example to .env`);
}

export const env = {
  mongoUri: process.env.MONGODB_URI,
  dbName: process.env.MONGODB_DB || 'proxinet',
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  adminEmail: (process.env.ADMIN_EMAIL || '').trim().toLowerCase(),
  adminPassword: process.env.ADMIN_PASSWORD || '',
  port: Number(process.env.PORT) || 5000,
  corsOrigins: (process.env.CORS_ORIGIN || '').split(',').map((s) => s.trim()).filter(Boolean),
  isProd: process.env.NODE_ENV === 'production',
};
