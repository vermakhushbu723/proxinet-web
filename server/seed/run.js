// npm run seed — replaces all submissions with demo data (admin accounts are kept)
import '../models/index.js';
import { connectDB, disconnectDB } from '../db/connect.js';
import { ensureAdmin } from '../routes/auth.js';
import { seedDemoData } from './seed.js';
import { env } from '../config/env.js';

await connectDB();
await ensureAdmin();
const counts = await seedDemoData();
const { portal, ...rest } = counts;
console.log(`Seeded demo data into "${env.dbName}":`, rest);
if (portal.created.length) {
  console.log('\nNew client-portal logins (shown once — save them):');
  portal.created.forEach((c) => console.log(`  ${c.company}: ${c.email} / ${c.password}`));
} else {
  console.log('\nPortal demo clients already existed — their passwords were kept.');
}
await disconnectDB();
