// npm run seed — replaces all submissions with demo data (admin accounts are kept)
import '../models/index.js';
import { connectDB, disconnectDB } from '../db/connect.js';
import { ensureAdmin } from '../routes/auth.js';
import { seedDemoData } from './seed.js';
import { env } from '../config/env.js';

await connectDB();
await ensureAdmin();
const counts = await seedDemoData();
console.log(`Seeded demo data into "${env.dbName}":`, counts);
await disconnectDB();
