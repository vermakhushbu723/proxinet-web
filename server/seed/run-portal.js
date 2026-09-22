// npm run seed:portal — creates the demo portal clients (and their assets, licences, documents)
// without touching any other data. Existing demo clients keep their passwords.
import '../models/index.js';
import { connectDB, disconnectDB } from '../db/connect.js';
import { seedPortalDemo } from './seed.js';
import { env } from '../config/env.js';

await connectDB();
const r = await seedPortalDemo();
console.log(`Portal demo data refreshed in "${env.dbName}" (${r.clients} clients).`);
if (r.created.length) {
  console.log('\nNew client-portal logins (shown once — save them):');
  r.created.forEach((c) => console.log(`  ${c.company}: ${c.email} / ${c.password}`));
} else {
  console.log('Demo clients already existed — their passwords were kept (reset them from Admin → Clients).');
}
await disconnectDB();
