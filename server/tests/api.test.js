// Full API test suite — runs the real Express app against a separate MongoDB database.
//   npm run test:api
// Uses MONGODB_DB=<your db>_test so your real data is never touched.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';

process.env.MONGODB_DB = `${process.env.MONGODB_DB_TEST || 'proxinet'}_test`;
process.env.DISABLE_RATE_LIMIT = '1';

let base;
let server;
let token;
let mongoose;
const created = {};

const api = async (method, path, { body, auth, headers = {}, form } = {}) => {
  const h = { ...headers };
  if (auth === true && token) h.Authorization = `Bearer ${token}`;
  else if (typeof auth === 'string') h.Authorization = `Bearer ${auth}`;
  let payload;
  if (form) payload = form;
  else if (body !== undefined) {
    h['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }
  const res = await fetch(base + path, { method, headers: h, body: payload });
  const type = res.headers.get('content-type') || '';
  const data = type.includes('json') ? await res.json() : Buffer.from(await res.arrayBuffer());
  return { status: res.status, data, headers: res.headers };
};
const adminGet = (path) => api('GET', `/api/admin${path}`, { auth: true });

const pdf = (bytes = 1200) => {
  const head = Buffer.from('%PDF-1.4\n% test resume\n');
  return Buffer.concat([head, Buffer.alloc(Math.max(0, bytes - head.length), 0x20)]);
};
const applicationForm = (file = pdf(), filename = 'Test_Resume.pdf', type = 'application/pdf', overrides = {}) => {
  const fd = new FormData();
  const fields = { name: 'Test Candidate', email: 'candidate@example.com', phone: '9876543210', role: 'network-engineer', roleTitle: 'Network Engineer', message: 'CCNA', ...overrides };
  Object.entries(fields).forEach(([k, v]) => fd.append(k, v));
  if (file) fd.append('resume', new Blob([file], { type }), filename);
  return fd;
};

before(async () => {
  const { default: app } = await import('../app.js');
  const db = await import('../db/connect.js');
  mongoose = (await import('mongoose')).default;
  await db.connectDB();
  await mongoose.connection.db.dropDatabase();
  server = await new Promise((resolve) => { const s = app.listen(0, () => resolve(s)); });
  base = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await mongoose.connection.db.dropDatabase();
  const db = await import('../db/connect.js');
  await db.disconnectDB();
  await new Promise((r) => server.close(r));
});

/* ============================== basics ============================== */
test('GET /api/health reports DB connection', async () => {
  const r = await api('GET', '/api/health');
  assert.equal(r.status, 200);
  assert.equal(r.data.ok, true);
  assert.equal(r.data.db, 'connected');
});

test('unknown API route returns JSON 404', async () => {
  const r = await api('GET', '/api/does-not-exist');
  assert.equal(r.status, 404);
  assert.match(r.data.error, /No API route/);
});

test('malformed JSON body returns 400', async () => {
  const res = await fetch(`${base}/api/leads`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{bad json' });
  assert.equal(res.status, 400);
});

/* ============================== public forms ============================== */
const validLead = { intent: 'Cyber security', size: '26–100 users', timeline: 'Immediately', name: 'Test Lead', company: 'Acme Ltd', email: 'Lead@Example.com', phone: '9811023456', message: 'Need EDR', source: '/contact' };

test('POST /api/leads creates a lead with a readable code', async () => {
  const r = await api('POST', '/api/leads', { body: validLead });
  assert.equal(r.status, 201);
  assert.match(r.data.code, /^LD-\d{4}$/);
  created.lead = r.data.id;
});

test('POST /api/leads rejects invalid email and missing fields with field errors', async () => {
  const bad = await api('POST', '/api/leads', { body: { ...validLead, email: 'not-an-email' } });
  assert.equal(bad.status, 400);
  assert.ok(bad.data.fields.email);
  const missing = await api('POST', '/api/leads', { body: { intent: 'x' } });
  assert.equal(missing.status, 400);
  for (const f of ['name', 'company', 'email', 'phone']) assert.ok(missing.data.fields[f], `expected error for ${f}`);
});

test('POST /api/leads ignores workflow fields and operator injection', async () => {
  const r = await api('POST', '/api/leads', { body: { ...validLead, status: 'Won', read: true, notes: [{ text: 'x' }], code: 'LD-1' } });
  assert.equal(r.status, 201);
  assert.notEqual(r.data.code, 'LD-1');
  created.leadInjected = r.data.id;
  const inj = await api('POST', '/api/leads', { body: { ...validLead, name: { $gt: '' } } });
  assert.equal(inj.status, 400);
  assert.ok(inj.data.fields.name);
});

test('POST /api/assessments validates date/time and stores context', async () => {
  const body = { name: 'A', company: 'B', email: 'a@b.in', phone: '9811000000', focus: 'Security posture', date: '2030-01-15', time: '11:30', mode: 'onsite', context: 'Audit next month' };
  const ok = await api('POST', '/api/assessments', { body });
  assert.equal(ok.status, 201);
  assert.match(ok.data.code, /^AS-/);
  created.assessment = ok.data.id;
  const bad = await api('POST', '/api/assessments', { body: { ...body, date: '15/01/2030' } });
  assert.equal(bad.status, 400);
  assert.ok(bad.data.fields.date);
});

test('POST /api/tickets validates priority', async () => {
  const ok = await api('POST', '/api/tickets', { body: { subject: 'VPN down', pri: 'P1', cat: 'Network', desc: 'Branch VPN drops', client: 'Auto Components Mfg.' } });
  assert.equal(ok.status, 201);
  created.ticket = ok.data.id;
  const bad = await api('POST', '/api/tickets', { body: { subject: 'x', pri: 'P9', desc: 'y' } });
  assert.equal(bad.status, 400);
  assert.ok(bad.data.fields.pri);
});

test('POST /api/downloads, /api/tool-reports, /api/procurement create records', async () => {
  const d = await api('POST', '/api/downloads', { body: { name: 'Reader', email: 'r@x.in', company: 'X', asset: 'Ransomware Playbook' } });
  const t = await api('POST', '/api/tool-reports', { body: { email: 't@x.in', tool: 'Cloud Cost Calculator' } });
  const p = await api('POST', '/api/procurement', { body: { name: 'Buyer', company: 'Y', email: 'b@y.in', purpose: 'Vendor registration' } });
  assert.deepEqual([d.status, t.status, p.status], [201, 201, 201]);
  assert.match(d.data.code, /^DL-/);
  assert.match(t.data.code, /^TR-/);
  assert.match(p.data.code, /^PR-/);
  Object.assign(created, { download: d.data.id, toolReport: t.data.id, procurement: p.data.id });
  const bad = await api('POST', '/api/tool-reports', { body: { email: 't@x.in' } });
  assert.equal(bad.status, 400);
});

test('POST /api/subscribers is idempotent per email', async () => {
  const first = await api('POST', '/api/subscribers', { body: { email: 'News@Example.com' } });
  assert.equal(first.status, 201);
  created.subscriber = first.data.id;
  const again = await api('POST', '/api/subscribers', { body: { email: 'news@example.com' } });
  assert.equal(again.status, 200);
  assert.equal(again.data.alreadySubscribed, true);
  assert.equal(again.data.id, first.data.id);
  const bad = await api('POST', '/api/subscribers', { body: { email: 'nope' } });
  assert.equal(bad.status, 400);
});

test('POST /api/applications stores the resume file in MongoDB', async () => {
  const r = await api('POST', '/api/applications', { form: applicationForm() });
  assert.equal(r.status, 201, JSON.stringify(r.data));
  assert.match(r.data.code, /^AP-/);
  created.application = r.data.id;
  const files = await mongoose.connection.db.collection('resumes.files').countDocuments();
  assert.equal(files, 1);
});

test('POST /api/applications rejects missing, wrong-type and oversized resumes', async () => {
  const none = await api('POST', '/api/applications', { form: applicationForm(null) });
  assert.equal(none.status, 400);
  assert.match(none.data.error, /resume/i);
  const exe = await api('POST', '/api/applications', { form: applicationForm(Buffer.from('MZ'), 'virus.exe', 'application/x-msdownload') });
  assert.equal(exe.status, 400);
  const big = await api('POST', '/api/applications', { form: applicationForm(pdf(2 * 1024 * 1024 + 10)) });
  assert.equal(big.status, 400);
  assert.match(big.data.error, /2 MB/);
  const badFields = await api('POST', '/api/applications', { form: applicationForm(pdf(), 'cv.pdf', 'application/pdf', { email: 'bad' }) });
  assert.equal(badFields.status, 400);
  const files = await mongoose.connection.db.collection('resumes.files').countDocuments();
  assert.equal(files, 1, 'rejected uploads must not leave files behind');
});

test('chat: start conversation, append visitor and bot messages', async () => {
  const start = await api('POST', '/api/chats', { body: { text: 'Do you do CCTV?' } });
  assert.equal(start.status, 201);
  created.chat = start.data.id;
  const me = await api('POST', `/api/chats/${created.chat}/messages`, { body: { from: 'me', text: 'For 3 floors' } });
  const bot = await api('POST', `/api/chats/${created.chat}/messages`, { body: { from: 'bot', text: 'Yes, we do.' } });
  assert.equal(me.status, 201);
  assert.equal(bot.data.messages, 3);
  assert.equal((await api('POST', '/api/chats', { body: { text: '' } })).status, 400);
  assert.equal((await api('POST', `/api/chats/${created.chat}/messages`, { body: { text: '' } })).status, 400);
  assert.equal((await api('POST', '/api/chats/not-an-id/messages', { body: { text: 'hi' } })).status, 404);
  assert.equal((await api('POST', '/api/chats/64b7f0000000000000000000/messages', { body: { text: 'hi' } })).status, 404);
});

/* ============================== auth ============================== */
test('admin routes require a valid token', async () => {
  assert.equal((await api('GET', '/api/admin/stats')).status, 401);
  assert.equal((await api('GET', '/api/admin/stats', { auth: 'garbage.token.value' })).status, 401);
  assert.equal((await api('GET', '/api/auth/me')).status, 401);
});

test('POST /api/auth/login validates credentials and returns a JWT', async () => {
  assert.equal((await api('POST', '/api/auth/login', { body: {} })).status, 400);
  assert.equal((await api('POST', '/api/auth/login', { body: { email: process.env.ADMIN_EMAIL, password: 'wrong-password' } })).status, 401);
  const ok = await api('POST', '/api/auth/login', { body: { email: process.env.ADMIN_EMAIL.toUpperCase(), password: process.env.ADMIN_PASSWORD } });
  assert.equal(ok.status, 200);
  assert.ok(ok.data.token);
  assert.equal(ok.data.admin.email, process.env.ADMIN_EMAIL.toLowerCase());
  token = ok.data.token;
  const me = await api('GET', '/api/auth/me', { auth: true });
  assert.equal(me.status, 200);
  assert.equal(me.data.admin.email, process.env.ADMIN_EMAIL.toLowerCase());
  const doc = await mongoose.connection.db.collection('admins').findOne({});
  assert.ok(doc.passwordHash.startsWith('$2'), 'password must be stored as a bcrypt hash');
});

test('POST /api/auth/change-password validates and updates the password', async () => {
  const pw = process.env.ADMIN_PASSWORD;
  assert.equal((await api('POST', '/api/auth/change-password', { auth: true, body: { currentPassword: 'wrong', newPassword: 'abcdefgh1' } })).status, 401);
  assert.equal((await api('POST', '/api/auth/change-password', { auth: true, body: { currentPassword: pw, newPassword: 'short' } })).status, 400);
  assert.equal((await api('POST', '/api/auth/change-password', { auth: true, body: { currentPassword: pw, newPassword: 'NewPass#2026' } })).status, 200);
  assert.equal((await api('POST', '/api/auth/login', { body: { email: process.env.ADMIN_EMAIL, password: 'NewPass#2026' } })).status, 200);
  assert.equal((await api('POST', '/api/auth/change-password', { auth: true, body: { currentPassword: 'NewPass#2026', newPassword: pw } })).status, 200);
});

/* ============================== admin: lists & records ============================== */
test('GET /api/admin/collections/:key lists every form', async () => {
  const expect = { leads: 2, assessments: 1, tickets: 1, chats: 1, downloads: 1, toolReports: 1, subscribers: 1, applications: 1, procurement: 1 };
  for (const [key, n] of Object.entries(expect)) {
    const r = await adminGet(`/collections/${key}`);
    assert.equal(r.status, 200, key);
    assert.equal(r.data.total, n, `${key} total`);
    assert.ok(Array.isArray(r.data.statuses) && r.data.statuses.length > 0);
    assert.ok(r.data.items.every((i) => i.id && i.code && i.createdAt && typeof i.read === 'boolean'));
  }
  assert.equal((await adminGet('/collections/nope')).status, 404);
});

test('list supports search, status, filter, unread and pagination', async () => {
  assert.equal((await adminGet('/collections/leads?q=acme')).data.total, 2);
  assert.equal((await adminGet('/collections/leads?q=zzz-not-found')).data.total, 0);
  assert.equal((await adminGet('/collections/leads?q=(unclosed')).status, 200, 'regex characters are escaped');
  assert.equal((await adminGet('/collections/leads?status=New')).data.total, 2);
  assert.equal((await adminGet('/collections/leads?filter=Cyber%20security')).data.total, 2);
  assert.equal((await adminGet('/collections/leads?unread=1')).data.total, 2);
  const page = await adminGet('/collections/leads?limit=1&page=2');
  assert.equal(page.data.items.length, 1);
  assert.equal(page.data.page, 2);
});

test('submitted data is stored exactly and workflow fields default correctly', async () => {
  const r = await adminGet(`/collections/leads/${created.leadInjected}`);
  assert.equal(r.status, 200);
  assert.equal(r.data.status, 'New');
  assert.equal(r.data.read, false);
  assert.deepEqual(r.data.notes, []);
  assert.equal(r.data.email, 'lead@example.com');
  assert.equal(r.data.source, '/contact');
  const a = await adminGet(`/collections/assessments/${created.assessment}`);
  assert.equal(a.data.context, 'Audit next month');
  assert.equal((await adminGet('/collections/leads/not-an-id')).status, 404);
  assert.equal((await adminGet('/collections/leads/64b7f0000000000000000000')).status, 404);
});

test('PATCH record updates only status/read', async () => {
  const r = await api('PATCH', `/api/admin/collections/leads/${created.lead}`, { auth: true, body: { status: 'Qualified', read: true, name: 'Hacked' } });
  assert.equal(r.status, 200);
  assert.equal(r.data.status, 'Qualified');
  assert.equal(r.data.read, true);
  assert.equal(r.data.name, 'Test Lead');
  assert.equal((await api('PATCH', `/api/admin/collections/leads/${created.lead}`, { auth: true, body: { status: 'Bogus' } })).status, 400);
  assert.equal((await api('PATCH', `/api/admin/collections/leads/${created.lead}`, { auth: true, body: {} })).status, 400);
  assert.equal((await api('PATCH', '/api/admin/collections/leads/64b7f0000000000000000000', { auth: true, body: { read: true } })).status, 404);
});

test('PATCH bulk marks many records', async () => {
  const r = await api('PATCH', '/api/admin/collections/leads', { auth: true, body: { ids: [created.lead, created.leadInjected], read: false, status: 'Contacted' } });
  assert.equal(r.status, 200);
  assert.equal(r.data.matched, 2);
  assert.equal((await adminGet('/collections/leads?status=Contacted')).data.total, 2);
  assert.equal((await api('PATCH', '/api/admin/collections/leads', { auth: true, body: { ids: [], read: true } })).status, 400);
});

test('POST notes appends an attributed note', async () => {
  const r = await api('POST', `/api/admin/collections/tickets/${created.ticket}/notes`, { auth: true, body: { text: 'Called client' } });
  assert.equal(r.status, 201);
  assert.equal(r.data.notes.length, 1);
  assert.equal(r.data.notes[0].text, 'Called client');
  assert.ok(r.data.notes[0].by);
  assert.equal((await api('POST', `/api/admin/collections/tickets/${created.ticket}/notes`, { auth: true, body: { text: '  ' } })).status, 400);
});

test('POST chat reply adds an agent message', async () => {
  const r = await api('POST', `/api/admin/collections/chats/${created.chat}/reply`, { auth: true, body: { text: 'An engineer will call you.' } });
  assert.equal(r.status, 200);
  assert.equal(r.data.messages.at(-1).from, 'agent');
  assert.equal((await api('POST', `/api/admin/collections/chats/${created.chat}/reply`, { auth: true, body: { text: '' } })).status, 400);
});

test('GET resume downloads the exact uploaded file', async () => {
  const r = await api('GET', `/api/admin/collections/applications/${created.application}/resume`, { auth: true });
  assert.equal(r.status, 200);
  assert.equal(r.headers.get('content-type'), 'application/pdf');
  assert.match(r.headers.get('content-disposition'), /Test_Resume\.pdf/);
  assert.ok(Buffer.compare(r.data, pdf()) === 0, 'downloaded bytes must match upload');
  assert.equal((await api('GET', `/api/admin/collections/applications/${created.application}/resume`)).status, 401);
});

/* ============================== admin: dashboard ============================== */
test('GET /api/admin/stats returns dashboard aggregates', async () => {
  const r = await adminGet('/stats');
  assert.equal(r.status, 200);
  assert.equal(r.data.total, 10);
  assert.equal(r.data.today, 10);
  assert.equal(r.data.days.length, 14);
  assert.equal(r.data.days.at(-1).value, 10);
  assert.equal(r.data.byForm.leads.total, 2);
  assert.equal(r.data.openTickets, 1);
  assert.equal(r.data.p1, 1);
  assert.equal(r.data.recent.length, 8);
  assert.ok(r.data.recent.every((x) => x.col && x.code));
  assert.equal(r.data.pipeline.find((p) => p.key === 'Contacted').value, 2);
  assert.equal(r.data.upcoming.length, 1);
});

test('GET /api/admin/unread returns counts and newest unread items', async () => {
  const r = await adminGet('/unread');
  assert.equal(r.status, 200);
  assert.equal(r.data.counts.leads, 2);
  assert.equal(r.data.total, r.data.items.length);
  assert.ok(r.data.items.every((i) => i.read === false && i.col));
});

test('GET /api/admin/export returns every collection', async () => {
  const r = await adminGet('/export');
  assert.equal(r.status, 200);
  assert.equal(Object.keys(r.data.data).length, 9);
  assert.equal(r.data.data.leads.length, 2);
});

/* ============================== admin: deletes ============================== */
test('DELETE single record, then 404 on repeat', async () => {
  assert.equal((await api('DELETE', `/api/admin/collections/downloads/${created.download}`, { auth: true })).status, 200);
  assert.equal((await api('DELETE', `/api/admin/collections/downloads/${created.download}`, { auth: true })).status, 404);
});

test('bulk delete removes records and their resume files', async () => {
  const r = await api('POST', '/api/admin/collections/applications/bulk-delete', { auth: true, body: { ids: [created.application] } });
  assert.equal(r.status, 200);
  assert.equal(r.data.deleted, 1);
  assert.equal(await mongoose.connection.db.collection('resumes.files').countDocuments(), 0);
  assert.equal((await api('POST', '/api/admin/collections/leads/bulk-delete', { auth: true, body: { ids: 'x' } })).status, 400);
});

/* ============================== admin: data management ============================== */
test('POST /api/admin/demo-data seeds demo records; new codes continue after them', async () => {
  const r = await api('POST', '/api/admin/demo-data', { auth: true });
  assert.equal(r.status, 200);
  assert.equal(r.data.counts.leads, 12);
  assert.equal((await adminGet('/collections/leads')).data.total, 12);
  const next = await api('POST', '/api/leads', { body: validLead });
  assert.equal(next.data.code, 'LD-1042');
});

test('DELETE /api/admin/data clears all submissions but keeps the admin', async () => {
  assert.equal((await api('DELETE', '/api/admin/data', { auth: true })).status, 200);
  assert.equal((await adminGet('/stats')).data.total, 0);
  assert.equal((await api('GET', '/api/auth/me', { auth: true })).status, 200);
});

/* ============================== hardening ============================== */
test('CORS follows CORS_ORIGIN (* = every origin, list = only those)', async () => {
  const list = (process.env.CORS_ORIGIN || '').split(',').map((s) => s.trim()).filter(Boolean);
  const other = await api('GET', '/api/health', { headers: { Origin: 'https://another-site.example' } });
  if (list.length === 0 || list.includes('*')) {
    assert.equal(other.headers.get('access-control-allow-origin'), 'https://another-site.example');
  } else {
    const ok = await api('GET', '/api/health', { headers: { Origin: list[0] } });
    assert.equal(ok.headers.get('access-control-allow-origin'), list[0]);
    assert.equal(other.headers.get('access-control-allow-origin'), null);
  }
  const noToken = await api('GET', '/api/admin/stats', { headers: { Origin: 'https://another-site.example' } });
  assert.equal(noToken.status, 401, 'admin data still needs a login token from any origin');
});

test('security headers are set', async () => {
  const r = await api('GET', '/api/health');
  assert.equal(r.headers.get('x-powered-by'), null);
  assert.equal(r.headers.get('x-content-type-options'), 'nosniff');
});

test('login is rate limited after repeated attempts', async () => {
  process.env.DISABLE_RATE_LIMIT = '0';
  const statuses = [];
  for (let i = 0; i < 12; i++) {
    statuses.push((await api('POST', '/api/auth/login', { body: { email: 'x@y.in', password: 'wrong' } })).status);
  }
  process.env.DISABLE_RATE_LIMIT = '1';
  assert.ok(statuses.includes(429), `expected a 429, got ${statuses.join(',')}`);
});
