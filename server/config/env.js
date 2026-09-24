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
  siteUrl: (process.env.SITE_URL || '').replace(/\/+$/, ''),
  // Renewal reminders
  remindDays: Number(process.env.RENEWAL_REMIND_DAYS) || 5,
  reminderTz: process.env.REMINDER_TZ || 'Asia/Kolkata',
  reminderHour: Number(process.env.REMINDER_HOUR ?? 9),
  reminderEmailTo: (process.env.REMINDER_EMAIL_TO || process.env.ADMIN_EMAIL || '').trim(),
  cronSecret: process.env.CRON_SECRET || '',
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: Number(process.env.SMTP_PORT) || 587,
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.MAIL_FROM || '',
  },
};
