// Customer renewals + reminder API tests (separate MongoDB database, dropped afterwards).
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';

process.env.MONGODB_DB = `${process.env.MONGODB_DB_TEST || 'proxinet'}_renewals_test`;
process.env.DISABLE_RATE_LIMIT = '1';
process.env.CRON_SECRET = 'test-cron-secret';
process.env.SMTP_HOST = '';

let base; let server; let mongoose; let adminToken; let todayYmd;
const ids = {};

const api = async (method, path, { body, token } = {}) => {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const res = await fetch(base + path, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
  return { status: res.status, data: await res.json() };
};
const admin = (m, p, o = {}) => api(m, `/api/admin${p}`, { ...o, token: adminToken });
const inDays = (n) => {
  const d = new Date(`${todayYmd()}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};
const make = (customer, endIn, extra = {}) => admin('POST', '/renewals', {
  body: { customer, description: 'Veeam Backup for O365', qty: 50, endDate: inDays(endIn), startDate: inDays(endIn - 364), salePrice: 2134, priceBasis: 'Per unit', ...extra },
});

before(async () => {
  const { default: app } = await import('../app.js');
  const db = await import('../db/connect.js');
  ({ todayYmd } = await import('../services/renewals.js'));
  mongoose = (await import('mongoose')).default;
  await db.connectDB();
  await mongoose.connection.db.dropDatabase();
  server = await new Promise((r) => { const s = app.listen(0, () => r(s)); });
  base = `http://127.0.0.1:${server.address().port}`;
  const login = await api('POST', '/api/auth/login', { body: { email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD } });
  adminToken = login.data.token;
});

after(async () => {
  await mongoose.connection.db.dropDatabase();
  await (await import('../db/connect.js')).disconnectDB();
  await new Promise((r) => server.close(r));
});

test('renewal routes need an admin token', async () => {
  assert.equal((await api('GET', '/api/admin/renewals')).status, 401);
  assert.equal((await api('GET', '/api/cron/renewal-reminders')).status, 401);
});

test('admin creates renewals; required fields and term are validated', async () => {
  const a = await make('Sunrise Sports (I) P. Ltd', 3, { poNo: 'SSIPL-PO-21/25-26', invoiceNo: 'PTPL/FY25-26/263', phone: '9811001122' });
  assert.equal(a.status, 201, JSON.stringify(a.data));
  assert.match(a.data.code, /^RN-\d+$/);
  assert.equal(a.data.daysLeft, 3);
  ids.due = a.data.id;

  assert.equal((await admin('POST', '/renewals', { body: { description: 'x', endDate: inDays(5) } })).status, 400, 'customer required');
  assert.equal((await admin('POST', '/renewals', { body: { customer: 'x', description: 'x' } })).status, 400, 'end date required');
  const bad = await admin('POST', '/renewals', { body: { customer: 'x', description: 'x', startDate: inDays(10), endDate: inDays(1) } });
  assert.equal(bad.status, 400);
  assert.match(bad.data.error, /after the start date/);
});

test('reminders list plans ending within 5 days and expired open ones, most urgent first', async () => {
  ids.expired = (await make('Old Expired Co', -2)).data.id;
  ids.today = (await make('Ends Today Ltd', 0)).data.id;
  ids.edge = (await make('Five Days Ltd', 5)).data.id;
  ids.later = (await make('Six Days Ltd', 6)).data.id;
  ids.closed = (await make('Closed Co', 1, { status: 'Not renewing' })).data.id;

  const r = await admin('GET', '/renewals/reminders');
  assert.equal(r.status, 200);
  assert.equal(r.data.remindDays, 5);
  assert.deepEqual(r.data.items.map((i) => i.customer), ['Old Expired Co', 'Ends Today Ltd', 'Sunrise Sports (I) P. Ltd', 'Five Days Ltd']);
  assert.deepEqual(r.data.items.map((i) => i.daysLeft), [-2, 0, 3, 5]);
  assert.equal(r.data.expired, 1);

  const all = await admin('GET', '/renewals');
  assert.equal(all.data.items.length, 6);
});

test('notes log follow-up and can mark the renewal contacted (it keeps reminding until closed)', async () => {
  const r = await admin('POST', `/renewals/${ids.due}/notes`, { body: { text: 'Called — PO next week', contacted: true } });
  assert.equal(r.status, 201);
  assert.equal(r.data.status, 'Contacted');
  assert.equal(r.data.notes.at(-1).text, 'Called — PO next week');
  const rem = await admin('GET', '/renewals/reminders');
  assert.ok(rem.data.items.some((i) => i.id === ids.due), 'contacted is still open');
});

test('renew closes the term and opens the next one with carried-over details', async () => {
  const r = await admin('POST', `/renewals/${ids.due}/renew`, { body: { startDate: inDays(4), endDate: inDays(368), poNo: 'PO-NEW-1', invoiceNo: 'INV-NEW-1', salePrice: 2200 } });
  assert.equal(r.status, 201, JSON.stringify(r.data));
  assert.equal(r.data.previous.status, 'Renewed');
  assert.equal(r.data.renewal.customer, 'Sunrise Sports (I) P. Ltd');
  assert.equal(r.data.renewal.phone, '9811001122');
  assert.equal(r.data.renewal.qty, 50);
  assert.equal(r.data.renewal.priceBasis, 'Per unit');
  assert.equal(r.data.renewal.salePrice, 2200);
  assert.equal(r.data.renewal.poNo, 'PO-NEW-1');
  assert.equal(r.data.renewal.renewedFrom, ids.due);
  assert.equal((await admin('POST', `/renewals/${ids.due}/renew`, { body: { endDate: inDays(400) } })).status, 409);

  const rem = await admin('GET', '/renewals/reminders');
  assert.ok(!rem.data.items.some((i) => i.id === ids.due), 'renewed term no longer reminds');
  assert.ok(!rem.data.items.some((i) => i.id === r.data.renewal.id), 'new term is a year away');
});

test('status changes are logged; delete works', async () => {
  const r = await admin('PATCH', `/renewals/${ids.expired}`, { body: { status: 'Not renewing' } });
  assert.equal(r.status, 200);
  assert.match(r.data.notes.at(-1).text, /Active → Not renewing/);
  assert.equal((await admin('PATCH', `/renewals/${ids.expired}`, { body: { status: 'Bogus' } })).status, 400);
  assert.equal((await admin('DELETE', `/renewals/${ids.later}`)).status, 200);
  assert.equal((await admin('DELETE', `/renewals/${ids.later}`)).status, 404);
});

test('bulk import saves valid rows and reports the bad ones', async () => {
  const r = await admin('POST', '/renewals/import', {
    body: {
      items: [
        { customer: 'Euronics Industries Pvt. Ltd.', description: 'SONICWALL LOG ANALYTICS E1N3J5HF', qty: 1, poNo: 'PO/EXP/23-24/463', invoiceNo: 'PTPL/FY23-24/230', startDate: '2023-10-06', endDate: '2026-10-04', salePrice: 30000, purchasePrice: 208000 },
        { customer: '', description: 'no customer', endDate: '2026-10-10' },
      ],
    },
  });
  assert.equal(r.status, 200);
  assert.equal(r.data.created, 1);
  assert.equal(r.data.errors.length, 1);
  assert.equal(r.data.errors[0].row, 2);
});

test('reminder email reports missing SMTP; cron accepts the secret', async () => {
  const send = await admin('POST', '/renewals/reminders/send');
  assert.equal(send.status, 200);
  assert.equal(send.data.sent, false);
  assert.match(send.data.reason, /not configured/);
  const cron = await api('GET', '/api/cron/renewal-reminders', { token: 'test-cron-secret' });
  assert.equal(cron.status, 200);
  assert.equal(cron.data.sent, false);
});
