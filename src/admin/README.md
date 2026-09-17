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
