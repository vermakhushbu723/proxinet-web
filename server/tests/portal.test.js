// Client portal + admin portal-management API tests (separate MongoDB database, dropped afterwards).
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';

process.env.MONGODB_DB = `${process.env.MONGODB_DB_TEST || 'proxinet'}_portal_test`;
process.env.DISABLE_RATE_LIMIT = '1';

let base; let server; let mongoose;
let adminToken; let tokenA; let tokenB;
const ids = {};

const api = async (method, path, { body, token, form } = {}) => {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  let payload;
  if (form) payload = form;
  else if (body !== undefined) { headers['Content-Type'] = 'application/json'; payload = JSON.stringify(body); }
  const res = await fetch(base + path, { method, headers, body: payload });
  const type = res.headers.get('content-type') || '';
  const data = type.includes('json') ? await res.json() : Buffer.from(await res.arrayBuffer());
  return { status: res.status, data, headers: res.headers };
};
const admin = (m, p, o = {}) => api(m, `/api/admin${p}`, { ...o, token: adminToken });
const portalA = (m, p, o = {}) => api(m, `/api/portal${p}`, { ...o, token: tokenA });
const portalB = (m, p, o = {}) => api(m, `/api/portal${p}`, { ...o, token: tokenB });

before(async () => {
  const { default: app } = await import('../app.js');
  const db = await import('../db/connect.js');
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

/* ================= admin: clients ================= */
test('admin creates clients (generated or chosen password) and validates input', async () => {
  const a = await admin('POST', '/clients', { body: { company: 'Acme Plant', contactName: 'Ravi', email: 'IT@Acme.in', plan: 'Gold', coverage: '24×7', accountEngineer: 'Neha' } });
  assert.equal(a.status, 201, JSON.stringify(a.data));
  assert.ok(a.data.password.length >= 10);
  assert.equal(a.data.client.email, 'it@acme.in');
  assert.equal(a.data.client.passwordHash, undefined, 'hash is never returned');
  assert.equal(a.data.client.escalation.length, 4, 'default escalation matrix');
  ids.clientA = a.data.client.id; ids.passA = a.data.password;

  const b = await admin('POST', '/clients', { body: { company: 'Beta Bank', email: 'it@beta.in', password: 'BetaPass#123' } });
  assert.equal(b.status, 201);
  assert.equal(b.data.password, 'BetaPass#123');
  ids.clientB = b.data.client.id;

  assert.equal((await admin('POST', '/clients', { body: { company: 'Dup', email: 'it@acme.in' } })).status, 409);
  assert.equal((await admin('POST', '/clients', { body: { email: 'x@y.in' } })).status, 400);
  assert.equal((await admin('POST', '/clients', { body: { company: 'X', email: 'bad' } })).status, 400);
  assert.equal((await admin('POST', '/clients', { body: { company: 'X', email: 'x@z.in', password: 'short' } })).status, 400);
});

test('admin portal routes require an admin token', async () => {
  assert.equal((await api('GET', '/api/admin/clients')).status, 401);
  const list = await admin('GET', '/clients');
  assert.equal(list.status, 200);
  assert.equal(list.data.items.length, 2);
  assert.ok(list.data.items.every((c) => c.counts && c.passwordHash === undefined));
});

test('admin updates client details, metrics and escalation', async () => {
  const r = await admin('PATCH', `/clients/${ids.clientA}`, {
    body: { metrics: { uptime: 99.97, slaCompliance: 98 }, escalation: [{ level: 'L1', title: 'Desk', detail: 'first', contact: 'x' }], passwordHash: 'hack' },
  });
  assert.equal(r.status, 200);
  assert.equal(r.data.metrics.uptime, 99.97);
  assert.equal(r.data.metrics.responseTargetMin, 15, 'other metrics kept');
  assert.equal(r.data.escalation.length, 1);
  assert.equal((await admin('PATCH', `/clients/${ids.clientA}`, { body: { plan: 'Platinum' } })).status, 400);
  assert.equal((await admin('PATCH', '/clients/64b7f0000000000000000000', { body: { plan: 'Gold' } })).status, 404);
});

/* ================= client login ================= */
test('client login: validation, wrong password, success, role separation', async () => {
  assert.equal((await api('POST', '/api/portal/login', { body: {} })).status, 400);
  assert.equal((await api('POST', '/api/portal/login', { body: { email: 'it@acme.in', password: 'nope' } })).status, 401);
  const a = await api('POST', '/api/portal/login', { body: { email: 'IT@acme.in', password: ids.passA } });
  assert.equal(a.status, 200);
  assert.equal(a.data.client.company, 'Acme Plant');
  tokenA = a.data.token;
  tokenB = (await api('POST', '/api/portal/login', { body: { email: 'it@beta.in', password: 'BetaPass#123' } })).data.token;

  assert.equal((await api('GET', '/api/portal/overview')).status, 401);
  assert.equal((await api('GET', '/api/portal/overview', { token: adminToken })).status, 403, 'admin token is not a client token');
  assert.equal((await api('GET', '/api/admin/stats', { token: tokenA })).status, 403, 'client token cannot open admin');
  assert.equal((await api('GET', '/api/admin/clients', { token: tokenA })).status, 403);
  assert.equal((await portalA('GET', '/me')).data.client.email, 'it@acme.in');
});

/* ================= admin: assets, licences, documents ================= */
test('admin CRUD for assets and licences (client scoped, validated)', async () => {
  const asset = await admin('POST', '/assets', { body: { client: ids.clientA, name: 'SRV-01', type: 'Server', model: 'Dell R650', warranty: '2030-01-01', status: 'Healthy' } });
  assert.equal(asset.status, 201, JSON.stringify(asset.data));
  assert.ok(asset.data.warrantyDays > 0);
  ids.asset = asset.data.id;
  await admin('POST', '/assets', { body: { client: ids.clientB, name: 'BETA-FW', type: 'Firewall' } });
  assert.equal((await admin('POST', '/assets', { body: { name: 'no client' } })).status, 400);
  assert.equal((await admin('POST', '/assets', { body: { client: ids.clientA, name: 'x', type: 'Toaster' } })).status, 400);
  assert.equal((await admin('POST', '/assets', { body: { client: ids.clientA, name: 'x', warranty: '01/01/2030' } })).status, 400);
  assert.equal((await admin('PATCH', `/assets/${ids.asset}`, { body: { status: 'Warning' } })).data.status, 'Warning');
  const listA = await admin('GET', `/assets?client=${ids.clientA}`);
  assert.equal(listA.data.items.length, 1);
  assert.equal(listA.data.items[0].clientName, 'Acme Plant');

  const lic = await admin('POST', '/licences', { body: { client: ids.clientA, name: 'Microsoft 365', vendor: 'Microsoft', qty: 50, renew: new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 10) } });
  assert.equal(lic.status, 201);
  assert.ok(lic.data.days >= 29 && lic.data.days <= 30);
  ids.licence = lic.data.id;
  assert.equal((await admin('POST', '/licences', { body: { client: ids.clientA, name: 'x', qty: 0, renew: '2030-01-01' } })).status, 400);
  assert.equal((await admin('POST', '/licences', { body: { client: ids.clientA, name: 'x' } })).status, 400);
  const tmp = await admin('POST', '/licences', { body: { client: ids.clientA, name: 'Temp', renew: '2031-01-01' } });
  assert.equal((await admin('DELETE', `/licences/${tmp.data.id}`)).status, 200);
  assert.equal((await admin('DELETE', `/licences/${tmp.data.id}`)).status, 404);
});

test('admin uploads documents to GridFS, rejects bad files', async () => {
  const fd = new FormData();
  fd.append('client', ids.clientA); fd.append('title', 'SLA Report — August'); fd.append('category', 'SLA report');
  fd.append('file', new Blob([Buffer.from('%PDF-1.4 test report')], { type: 'application/pdf' }), 'sla-aug.pdf');
  const r = await admin('POST', '/documents', { form: fd });
  assert.equal(r.status, 201, JSON.stringify(r.data));
  assert.equal(r.data.file.filename, 'sla-aug.pdf');
  ids.doc = r.data.id;

  const hidden = new FormData();
  hidden.append('client', ids.clientA); hidden.append('title', 'Internal only'); hidden.append('visible', 'false');
  hidden.append('file', new Blob([Buffer.from('secret')], { type: 'text/plain' }), 'internal.txt');
  ids.hiddenDoc = (await admin('POST', '/documents', { form: hidden })).data.id;

  const exe = new FormData();
  exe.append('client', ids.clientA);
  exe.append('file', new Blob([Buffer.from('MZ')]), 'tool.exe');
  assert.equal((await admin('POST', '/documents', { form: exe })).status, 400);
  const noClient = new FormData();
  noClient.append('file', new Blob([Buffer.from('x')]), 'a.pdf');
  assert.equal((await admin('POST', '/documents', { form: noClient })).status, 400);
  assert.equal(await mongoose.connection.db.collection('documents.files').countDocuments(), 2, 'rejected uploads leave no files');

  const dl = await admin('GET', `/documents/${ids.doc}/download`);
  assert.equal(dl.status, 200);
  assert.equal(dl.data.toString(), '%PDF-1.4 test report');
});

/* ================= client portal ================= */
test('client raises tickets; validation; tickets are linked to the client', async () => {
  const t = await portalA('POST', '/tickets', { body: { subject: 'VPN down', pri: 'P1', cat: 'Network', desc: 'Branch VPN drops', clientId: ids.clientB, client: 'Beta Bank' } });
  assert.equal(t.status, 201, JSON.stringify(t.data));
  assert.match(t.data.code, /^TK-/);
  ids.ticket = t.data.id;
  assert.equal((await portalA('POST', '/tickets', { body: { subject: '', desc: '' } })).status, 400);
  assert.equal((await portalA('POST', '/tickets', { body: { subject: 'x', desc: 'y', pri: 'P9' } })).status, 400);
  const inAdmin = await admin('GET', `/collections/tickets/${ids.ticket}`);
  assert.equal(inAdmin.data.client, 'Acme Plant', 'company comes from the login, not the request body');
  assert.equal(String(inAdmin.data.clientId), ids.clientA);
  await portalB('POST', '/tickets', { body: { subject: 'Beta issue', desc: 'mail', pri: 'P3' } });
});

test('overview returns KPIs, open tickets, renewals and counts for the signed-in client only', async () => {
  const r = await portalA('GET', '/overview');
  assert.equal(r.status, 200);
  assert.equal(r.data.client.company, 'Acme Plant');
  assert.equal(r.data.kpis.uptime, 99.97);
  assert.equal(r.data.kpis.openTickets, 1);
  assert.deepEqual(r.data.kpis.openByPriority, { P1: 1 });
  assert.equal(r.data.renewals.length, 1);
  assert.deepEqual(r.data.counts, { assets: 1, licences: 1, documents: 1 });
});

test('tenant isolation: client B never sees client A data', async () => {
  const bt = await portalB('GET', '/tickets');
  assert.equal(bt.data.items.length, 1);
  assert.equal(bt.data.items[0].subject, 'Beta issue');
  assert.equal((await portalB('GET', `/tickets/${ids.ticket}`)).status, 404);
  assert.equal((await portalB('POST', `/tickets/${ids.ticket}/comments`, { body: { text: 'hi' } })).status, 404);
  assert.equal((await portalB('GET', `/documents/${ids.doc}/download`)).status, 404);
  assert.equal((await portalB('POST', `/licences/${ids.licence}/renewal-quote`)).status, 404);
  assert.equal((await portalB('GET', '/assets')).data.items.map((a) => a.name).join(), 'BETA-FW');
  assert.equal((await portalB('GET', '/search?q=SRV')).data.items.length, 0);
});

test('ticket thread: client comment ↔ admin reply, resolve and reopen', async () => {
  const c = await portalA('POST', `/tickets/${ids.ticket}/comments`, { body: { text: 'Still dropping at 3pm' } });
  assert.equal(c.status, 201);
  assert.equal(c.data.updates.at(-1).from, 'client');
  assert.equal((await portalA('POST', `/tickets/${ids.ticket}/comments`, { body: { text: ' ' } })).status, 400);

  const reply = await admin('POST', `/tickets/${ids.ticket}/reply`, { body: { text: 'Engineer on the way', status: 'Resolved', owner: 'L3 · Network' } });
  assert.equal(reply.status, 200);
  const seen = await portalA('GET', `/tickets/${ids.ticket}`);
  assert.equal(seen.data.status, 'Resolved');
  assert.equal(seen.data.owner, 'L3 · Network');
  assert.ok(seen.data.resolvedAt);
  assert.equal(seen.data.updates.at(-1).text, 'Engineer on the way');
  assert.equal(seen.data.updates.at(-1).from, 'team');

  const reopen = await portalA('POST', `/tickets/${ids.ticket}/comments`, { body: { text: 'Happened again' } });
  assert.equal(reopen.data.status, 'Open', 'client comment reopens a resolved ticket');
  await admin('PATCH', `/collections/tickets/${ids.ticket}`, { body: { status: 'Closed' } });
  assert.equal((await portalA('POST', `/tickets/${ids.ticket}/comments`, { body: { text: 'x' } })).status, 400, 'closed tickets take no comments');
  assert.equal((await admin('POST', '/tickets/64b7f0000000000000000000/reply', { body: { text: 'x' } })).status, 404);
});

test('assets, licences, documents, escalation for the client', async () => {
  const assets = await portalA('GET', '/assets');
  assert.equal(assets.data.items.length, 1);
  assert.ok('warrantyDays' in assets.data.items[0]);
  const lic = await portalA('GET', '/licences');
  assert.equal(lic.data.items[0].name, 'Microsoft 365');
  const docs = await portalA('GET', '/documents');
  assert.deepEqual(docs.data.items.map((d) => d.title), ['SLA Report — August'], 'hidden documents are not listed');
  const dl = await portalA('GET', `/documents/${ids.doc}/download`);
  assert.equal(dl.status, 200);
  assert.match(dl.headers.get('content-disposition'), /sla-aug\.pdf/);
  assert.equal((await portalA('GET', `/documents/${ids.hiddenDoc}/download`)).status, 404);
  const esc = await portalA('GET', '/escalation');
  assert.equal(esc.data.levels[0].title, 'Desk');
  assert.equal(esc.data.accountEngineer, 'Neha');
});

test('renewal quote request creates one licensing ticket (no duplicates)', async () => {
  const first = await portalA('POST', `/licences/${ids.licence}/renewal-quote`);
  assert.equal(first.status, 201);
  assert.equal(first.data.ticket.cat, 'Licensing');
  const again = await portalA('POST', `/licences/${ids.licence}/renewal-quote`);
  assert.equal(again.data.alreadyRequested, true);
  const list = await portalA('GET', '/tickets');
  assert.equal(list.data.items.filter((t) => t.cat === 'Licensing').length, 1);
});

test('search finds tickets, assets, licences and documents', async () => {
  assert.deepEqual((await portalA('GET', '/search?q=VPN')).data.items.map((i) => i.kind), ['ticket']);
  assert.deepEqual((await portalA('GET', '/search?q=srv-01')).data.items.map((i) => i.kind), ['asset']);
  assert.ok((await portalA('GET', '/search?q=microsoft')).data.items.some((i) => i.kind === 'licence'));
  assert.deepEqual((await portalA('GET', '/search?q=august')).data.items.map((i) => i.kind), ['document']);
  assert.equal((await portalA('GET', '/search?q=a')).data.items.length, 0, 'min 2 characters');
  assert.equal((await portalA('GET', '/search?q=(')).status, 200, 'regex characters escaped');
});

test('SLA report downloads as CSV with the client metrics and tickets', async () => {
  const r = await portalA('GET', '/sla-report');
  assert.equal(r.status, 200);
  assert.match(r.headers.get('content-type'), /text\/csv/);
  const csv = r.data.toString();
  assert.match(csv, /Acme Plant/);
  assert.match(csv, /99\.97%/);
  assert.match(csv, /VPN down/);
  assert.doesNotMatch(csv, /Beta issue/);
});

test('client changes password; forgot-password never reveals accounts', async () => {
  assert.equal((await portalA('POST', '/change-password', { body: { currentPassword: 'wrong', newPassword: 'NewPass#2026' } })).status, 401);
  assert.equal((await portalA('POST', '/change-password', { body: { currentPassword: ids.passA, newPassword: 'short' } })).status, 400);
  assert.equal((await portalA('POST', '/change-password', { body: { currentPassword: ids.passA, newPassword: 'NewPass#2026' } })).status, 200);
  assert.equal((await api('POST', '/api/portal/login', { body: { email: 'it@acme.in', password: 'NewPass#2026' } })).status, 200);

  const known = await api('POST', '/api/portal/forgot-password', { body: { email: 'it@acme.in' } });
  const unknown = await api('POST', '/api/portal/forgot-password', { body: { email: 'nobody@x.in' } });
  assert.deepEqual([known.status, unknown.status, known.data.ok, unknown.data.ok], [200, 200, true, true]);
  const tickets = await admin('GET', '/collections/tickets?q=password reset');
  assert.equal(tickets.data.total, 1, 'a reset request ticket is logged for the known account only');
});

test('admin resets a client password; deactivated clients are locked out', async () => {
  const r = await admin('POST', `/clients/${ids.clientB}/password`);
  assert.equal(r.status, 200);
  assert.equal((await api('POST', '/api/portal/login', { body: { email: 'it@beta.in', password: 'BetaPass#123' } })).status, 401);
  assert.equal((await api('POST', '/api/portal/login', { body: { email: 'it@beta.in', password: r.data.password } })).status, 200);

  await admin('PATCH', `/clients/${ids.clientB}`, { body: { active: false } });
  assert.equal((await portalB('GET', '/overview')).status, 401, 'existing session stops working');
  assert.equal((await api('POST', '/api/portal/login', { body: { email: 'it@beta.in', password: r.data.password } })).status, 403);
});

test('deleting a client removes its assets, licences and document files', async () => {
  assert.equal((await admin('DELETE', `/clients/${ids.clientA}`)).status, 200);
  assert.equal((await admin('GET', `/assets?client=${ids.clientA}`)).data.items.length, 0);
  assert.equal(await mongoose.connection.db.collection('documents.files').countDocuments(), 0);
  assert.equal((await portalA('GET', '/overview')).status, 401);
  assert.equal((await admin('DELETE', `/clients/${ids.clientA}`)).status, 404);
});
