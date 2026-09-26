# Admin panel

Open `/admin` and sign in with `ADMIN_EMAIL` / `ADMIN_PASSWORD` from `.env`
(the first admin account is created from those values on the first login attempt).

```
admin/
├── AdminApp.jsx           routes + login guard + compact admin theme for /admin/*
├── api/
│   ├── auth.js            JWT login/logout, session, change password
│   └── store.js           every admin API call + useApi/useCollection hooks (auto-refresh & polling)
├── config/
│   └── collections.jsx    one entry per website form: statuses, columns, fields, sidebar group
├── components/            SubmissionsPage (list), RecordDrawer (detail, notes, resume, chat reply), Charts, Panel, StatusTag
├── layout/AdminLayout.jsx sidebar, header, unread bell, "new submission" toasts (15 s polling)
└── pages/                 Dashboard, Settings, Login and one page per form
```

Website forms submit through `src/api/public.js`; the backend lives in `/server` (see the root README).

| Website form | Where | API | Admin page |
|---|---|---|---|
| Lead form | Home, /contact | `POST /api/leads` | Leads |
| Book free assessment | /book-assessment | `POST /api/assessments` | Assessments |
| Raise a ticket | /portal/dashboard | `POST /api/tickets` | Tickets |
| Chat assistant | floating chat button | `POST /api/chats`, `POST /api/chats/:id/messages` | Chats |
| Whitepaper download | /resources/whitepapers | `POST /api/downloads` | Downloads |
| Email me the result | /tools/* | `POST /api/tool-reports` | Tool reports |
| Newsletter | footer | `POST /api/subscribers` | Subscribers |
| Apply (with resume) | /careers | `POST /api/applications` (multipart) | Applications |
| Request the pack | /procurement | `POST /api/procurement` | Procurement |

## Customer renewals (`/admin/renewals`)

Tracks every product/subscription sold (customer, description, qty, PO no, invoice no, start/end date,
last sale and purchase price) and reminds the admin to contact the customer before it expires.

- **Reminders** start `RENEWAL_REMIND_DAYS` (default 5) days before the end date and repeat **every day**
  until the record is marked *Renewed* or *Not renewing* (expired-but-open plans keep reminding):
  daily popup on opening the panel, bell + sidebar badge, dashboard panel, and an optional daily email digest
  (set `SMTP_*` / `REMINDER_EMAIL_TO`; on Vercel the cron in `vercel.json` calls `/api/cron/renewal-reminders` with `CRON_SECRET`).
- **Renew** closes the current term and opens the next one (customer, contact and product carry over).
- **Import**: save the Excel sheet as CSV — columns are matched by header name, month rows like "Oct Renewal" are skipped.

API: `GET/POST /api/admin/renewals`, `PATCH/DELETE /api/admin/renewals/:id`, `POST /:id/notes`, `POST /:id/renew`,
`POST /api/admin/renewals/import`, `GET /api/admin/renewals/reminders`, `POST /api/admin/renewals/reminders/send`.

### Reminder team & schedule
- **Sales → Reminder team** (`/admin/renewal-team`): employees (name, designation, mobile, email) who get reminders by
  email and SMS/WhatsApp; per-person email/SMS switches and a "send test" button. A renewal can be assigned to specific
  people (Renewals → Edit → "Send reminder to"); unassigned renewals go to every active member.
- **Sales → Reminder schedule** (`/admin/renewal-schedule`): default rule (daily from N days before expiry, or only on
  chosen days before), send time, after-expiry behaviour, email/SMS switches, a calendar of upcoming reminders and the
  delivery log. A renewal can override the rule with its own days before expiry or exact dates.
- SMS: set `SMS_PROVIDER` (fast2sms | twilio | webhook) and its keys in `.env` — see `.env.example`.
