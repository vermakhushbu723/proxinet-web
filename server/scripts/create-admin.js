// Create an admin or reset an existing admin's password.
//   npm run admin:create -- <email> <password> [name]
import bcrypt from 'bcryptjs';
import { connectDB, disconnectDB } from '../db/connect.js';
import { Admin } from '../models/index.js';
import { env } from '../config/env.js';

const [email, password, name = 'Admin'] = process.argv.slice(2);
if (!email || !password) {
  console.error('Usage: npm run admin:create -- <email> <password> [name]');
  process.exit(1);
}
if (password.length < 8) {
  console.error('Password must be at least 8 characters');
  process.exit(1);
}

await connectDB();
const r = await Admin.updateOne(
  { email: email.trim().toLowerCase() },
  { $set: { passwordHash: await bcrypt.hash(password, 12), name } },
  { upsert: true },
);
console.log(`${r.upsertedCount ? 'Created' : 'Updated'} admin ${email.trim().toLowerCase()} in "${env.dbName}"`);
await disconnectDB();
