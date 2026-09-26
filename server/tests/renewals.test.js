// Customer renewals + reminder API tests (separate MongoDB database, dropped afterwards).
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';

process.env.MONGODB_DB = `${process.env.MONGODB_DB_TEST || 'proxinet'}_renewals_test`;
process.env.DISABLE_RATE_LIMIT = '1';
process.env.CRON_SECRET = 'test-cron-secret';
process.env.SMTP_HOST = '';
process.env.MAIL_DRY_RUN = '1'; // emails are built but not delivered
process.env.SMS_PROVIDER = 'webhook'; // SMS go to the mock gateway below
process.env.REMINDER_EMAIL_TO = 'boss@proxinet.test';

let base; let server; let mongoose; let adminToken; let todayYmd; let gateway;
const smsInbox = [];
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
  const http = await import('node:http');
  gateway = await new Promise((r) => {
    const g = http.createServer((req, res) => {
      let body = '';
      req.on('data', (c) => { body += c; });
      req.on('end', () => { smsInbox.push(JSON.parse(body)); res.end('{"ok":true}'); });
    }).listen(0, () => r(g));
  });
  process.env.SMS_WEBHOOK_URL = `http://127.0.0.1:${gateway.address().port}/sms`;
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
  await new Promise((r) => gateway.close(r));
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

test('cron needs CRON_SECRET', async () => {
  assert.equal((await api('GET', '/api/cron/renewal-reminders', { token: 'wrong' })).status, 401);
  assert.equal((await api('GET', '/api/cron/renewal-reminders', { token: 'test-cron-secret' })).status, 200);
});

test('vendor is saved, and carried over on renew', async () => {
  const a = await make('Vendor Co', 40, { vendor: 'Ingram Micro' });
  assert.equal(a.data.vendor, 'Ingram Micro');
  const r = await admin('POST', `/renewals/${a.data.id}/renew`, { body: { startDate: inDays(41), endDate: inDays(405) } });
  assert.equal(r.data.renewal.vendor, 'Ingram Micro');
});

test('reminder team: add members, validation, test message', async () => {
  const a = await admin('POST', '/renewal-team', { body: { name: 'Rahul', designation: 'Account Manager', phone: '98100 11122', email: 'Rahul@ProXinet.test' } });
  assert.equal(a.status, 201, JSON.stringify(a.data));
  assert.equal(a.data.email, 'rahul@proxinet.test');
  ids.rahul = a.data.id;
  const b = await admin('POST', '/renewal-team', { body: { name: 'Neha', phone: '9822233344' } });
  assert.equal(b.status, 201);
  ids.neha = b.data.id;
  assert.equal((await admin('POST', '/renewal-team', { body: { name: 'No contact' } })).status, 400, 'needs phone or email');
  assert.equal((await admin('POST', '/renewal-team', { body: { name: 'Bad', phone: 'abc' } })).status, 400);

  smsInbox.length = 0;
  const t = await admin('POST', `/renewal-team/${ids.rahul}/test`);
  assert.deepEqual(t.data.results.map((r) => [r.channel, r.status]), [['email', 'sent'], ['sms', 'sent']]);
  assert.equal(smsInbox[0].to, '+919810011122');
  assert.equal(smsInbox[0].mobile, '9810011122');

  const list = await admin('GET', '/renewal-team');
  assert.equal(list.data.items.length, 2);
  assert.equal(list.data.channels.sms, true);
});

test('custom reminder rules: days before and exact dates, validated', async () => {
  const d = await make('Custom Days Co', 30, { reminder: { mode: 'days', days: [30, 7, '1'] } });
  assert.equal(d.status, 201, JSON.stringify(d.data));
  assert.deepEqual(d.data.reminder.days, [30, 7, 1]);
  assert.equal(d.data.remindToday, true, 'reminds today: exactly 30 days before');
  assert.equal(d.data.nextReminder, inDays(0));
  assert.match(d.data.ruleText, /30, 7, 1 days before expiry.*\(custom\)/);
  ids.customDays = d.data.id;

  const x = await make('Custom Dates Co', 200, { reminder: { mode: 'dates', dates: [inDays(12), inDays(3)] } });
  assert.equal(x.status, 201);
  assert.deepEqual(x.data.reminder.dates, [inDays(3), inDays(12)]);
  assert.equal(x.data.remindToday, false);
  assert.equal(x.data.nextReminder, inDays(3));
  ids.customDates = x.data.id;

  assert.equal((await make('Empty rule', 10, { reminder: { mode: 'days', days: [] } })).status, 400);
  assert.equal((await make('Bad date', 10, { reminder: { mode: 'dates', dates: ['12/10/2026'] } })).status, 400);

  // a 6-day plan with the default rule does not remind; switching it to "6 days before" does
  const six = await make('Six Custom Co', 6);
  assert.equal(six.data.remindToday, false);
  const upd = await admin('PATCH', `/renewals/${six.data.id}`, { body: { reminder: { mode: 'days', days: [6] }, notify: [ids.neha] } });
  assert.equal(upd.data.remindToday, true);
  assert.deepEqual(upd.data.notify, [ids.neha]);
  ids.sixCustom = six.data.id;
});

test('schedule settings change the default rule and are validated', async () => {
  const g = await admin('GET', '/renewal-settings');
  assert.equal(g.data.settings.mode, 'daily');
  assert.equal(g.data.settings.windowDays, 5);

  assert.equal((await admin('PUT', '/renewal-settings', { body: { mode: 'days', days: [] } })).status, 400);
  assert.equal((await admin('PUT', '/renewal-settings', { body: { sendTime: '25:00' } })).status, 400);

  const s = await admin('PUT', '/renewal-settings', { body: { mode: 'days', days: [10, 3], sendTime: '08:30' } });
  assert.equal(s.status, 200, JSON.stringify(s.data));
  assert.deepEqual(s.data.settings.days, [10, 3]);
  const three = (await make('Three Default Co', 3)).data;
  const five = (await make('Five Default Co', 5)).data;
  assert.equal(three.remindToday, true, '3 days before is in [10, 3]');
  assert.equal(five.remindToday, false, '5 days before is not');
  assert.equal(five.nextReminder, inDays(2), 'next reminder when 3 days are left');

  // back to daily for the rest
  await admin('PUT', '/renewal-settings', { body: { mode: 'daily', windowDays: 5, sendTime: '09:00' } });
});

test('upcoming-reminders calendar shows dates, customers and recipients', async () => {
  const r = await admin('GET', '/renewals/schedule?days=15');
  assert.equal(r.status, 200);
  const day3 = r.data.days.find((d) => d.date === inDays(3));
  const dates = day3.items.find((i) => i.id === ids.customDates);
  assert.ok(dates && dates.custom, 'custom date reminder appears on its date');
  const today = r.data.days.find((d) => d.date === inDays(0));
  const six = today.items.find((i) => i.id === ids.sixCustom);
  assert.deepEqual(six.recipients, ['Neha'], 'assigned renewals go only to their members');
  const custom = today.items.find((i) => i.id === ids.customDays);
  assert.deepEqual(custom.recipients.sort(), ['Neha', 'Rahul'], 'unassigned renewals go to everyone');
});

test('daily job: each member gets email + SMS for their renewals, admin gets all, runs once a day', async () => {
  smsInbox.length = 0;
  const run = await admin('POST', '/renewals/reminders/send');
  assert.equal(run.status, 200, JSON.stringify(run.data));
  const due = (await admin('GET', '/renewals/reminders')).data.items;
  assert.equal(run.data.due, due.length);

  const by = (name, ch) => run.data.results.find((r) => r.name === name && r.channel === ch);
  assert.equal(by('Rahul', 'email').status, 'sent');
  assert.equal(by('Rahul', 'sms').status, 'sent');
  assert.ok(!by('Rahul', 'email').customers.includes('Six Custom Co'), 'not assigned to Rahul');
  assert.ok(by('Neha', 'sms').customers.includes('Six Custom Co'));
  assert.equal(by('Neha', 'email'), undefined, 'Neha has no email');
  assert.equal(by('Admin', 'email').count, due.length, 'admin copy has every due renewal');
  assert.equal(smsInbox.length, 2);
  assert.match(smsInbox.find((m) => m.mobile === '9822233344').message, /ProXinet renewal reminder/);

  const logs = await admin('GET', '/renewals/notifications');
  assert.ok(logs.data.items.length >= 5);

  // turning SMS off in settings stops SMS
  await admin('PUT', '/renewal-settings', { body: { smsOn: false } });
  smsInbox.length = 0;
  const again = await admin('POST', '/renewals/reminders/send');
  assert.ok(again.data.results.every((r) => r.channel === 'email'));
  assert.equal(smsInbox.length, 0);
  await admin('PUT', '/renewal-settings', { body: { smsOn: true } });

  // the automatic job (not forced) runs once a day
  const services = await import('../services/renewals.js');
  const auto = await services.sendReminders();
  assert.equal(auto.done, false);
  assert.equal(auto.reason, 'Already sent today');
});

test('deleting a member removes them from renewal assignments', async () => {
  assert.equal((await admin('DELETE', `/renewal-team/${ids.neha}`)).status, 200);
  const r = (await admin('GET', '/renewals')).data.items.find((x) => x.id === ids.sixCustom);
  assert.deepEqual(r.notify, []);
});
