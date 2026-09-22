import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import {
  AutoComplete, Alert, Avatar, Badge, Button, ConfigProvider, Drawer, Dropdown, Empty, Form, Input,
  Modal, Segmented, Select, Skeleton, Table, Tag, Timeline, Tooltip, message,
} from 'antd';
import {
  DashboardOutlined, CustomerServiceOutlined, DesktopOutlined, SafetyCertificateOutlined, FileTextOutlined,
  ApartmentOutlined, MenuFoldOutlined, MenuUnfoldOutlined, SearchOutlined, SunOutlined, MoonOutlined,
  LogoutOutlined, HomeOutlined, PlusOutlined, DownloadOutlined, LockOutlined, SendOutlined,
  CheckCircleFilled, ClockCircleOutlined, ThunderboltOutlined, UserOutlined,
} from '@ant-design/icons';
import Logo from '../components/Logo';
import { useTheme } from '../components/ui';
import { company } from '../data/company';
import {
  getSession, logout, usePortal, getOverview, listTickets, createTicket, commentTicket, listAssets,
  listLicences, requestRenewal, listDocuments, downloadDocument, getEscalation, searchPortal,
  downloadSlaReport, changePassword,
} from './api';

/* Compact, app-style sizing (the marketing site keeps its larger scale) */
const portalTheme = {
  token: { fontSize: 13, fontSizeSM: 12, fontSizeLG: 14, controlHeight: 32, controlHeightSM: 26, controlHeightLG: 36, borderRadius: 8, borderRadiusLG: 10 },
  components: {
    Button: { fontWeight: 500, primaryShadow: 'none', defaultShadow: 'none', paddingInline: 12 },
    Input: { paddingBlock: 4, paddingInline: 10 },
    Table: { cellPaddingBlock: 9, cellPaddingInline: 12, cellPaddingBlockSM: 8, cellPaddingInlineSM: 10, cellFontSize: 13 },
    Form: { itemMarginBottom: 14, verticalLabelPadding: '0 0 4px' },
    Modal: { titleFontSize: 15 },
  },
};

const SECTIONS = [
  { key: 'overview', label: 'Overview', icon: <DashboardOutlined /> },
  { key: 'tickets', label: 'Tickets', icon: <CustomerServiceOutlined /> },
  { key: 'assets', label: 'Assets', icon: <DesktopOutlined /> },
  { key: 'licences', label: 'Licences', icon: <SafetyCertificateOutlined /> },
  { key: 'docs', label: 'Reports & Docs', icon: <FileTextOutlined /> },
  { key: 'escalation', label: 'Escalation', icon: <ApartmentOutlined /> },
];

const priColor = { P1: 'red', P2: 'orange', P3: 'gold', P4: 'default' };
const statusBadge = { Open: 'error', 'In progress': 'processing', Resolved: 'success', Closed: 'default' };
const assetColor = { Healthy: 'green', Warning: 'orange', Critical: 'red', Retired: 'default' };
const card = 'min-w-0 rounded-xl border border-slate-200 bg-white dark:border-white/10 dark:bg-[#101d2b]';
const fail = (err) => message.error(err?.message || 'Something went wrong');
const fmt = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—');
const fmtTime = (d) => (d ? new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }) : '—');
const daysTag = (days, soon = 45) => {
  if (days === null || days === undefined) return <span className="text-slate-400">—</span>;
  if (days < 0) return <Tag color="red" className="!m-0">Expired {Math.abs(days)}d ago</Tag>;
  return <Tag color={days < soon ? 'red' : days < 90 ? 'orange' : 'green'} className="!m-0">{days} days left</Tag>;
};

function Panel({ title, extra, children, className = '', bodyClass = 'p-4' }) {
  return (
    <section className={`${card} ${className}`}>
      {title && (
        <header className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-2.5 dark:border-white/10">
          <h2 className="m-0 text-[13.5px] font-semibold text-slate-900 dark:text-white">{title}</h2>
          {extra}
        </header>
      )}
      <div className={bodyClass}>{children}</div>
    </section>
  );
}

function Heading({ title, sub, extra }) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div className="min-w-0">
        <h1 className="m-0 text-[18px] font-semibold leading-tight text-slate-900 dark:text-white">{title}</h1>
        {sub && <p className="m-0 mt-0.5 text-[12.5px] text-slate-500">{sub}</p>}
      </div>
      {extra && <div className="flex flex-wrap gap-2">{extra}</div>}
    </div>
  );
}

const LoadError = ({ error, reload }) => (error ? <Alert className="!mb-3" type="error" showIcon message="Could not load data" description={error.message} action={<Button size="small" onClick={reload}>Retry</Button>} /> : null);

/* ================= Tickets table + detail drawer ================= */
function TicketsTable({ rows, loading, onOpen, compact = false }) {
  return (
    <Table
      rowKey="id" size="small" loading={loading} dataSource={rows} scroll={{ x: compact ? 620 : 820 }}
      pagination={compact ? false : { pageSize: 12, hideOnSinglePage: true, showSizeChanger: false }}
      onRow={(r) => ({ onClick: () => onOpen(r.id), className: 'cursor-pointer' })}
      locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No tickets" /> }}
      columns={[
        { title: 'ID', dataIndex: 'code', width: 90, render: (v) => <span className="font-mono text-[11.5px] font-semibold text-brand-600">{v}</span> },
        { title: 'Subject', dataIndex: 'subject', ellipsis: true },
        { title: 'Priority', dataIndex: 'pri', width: 80, render: (v) => <Tag color={priColor[v]} className="!m-0">{v}</Tag> },
        { title: 'Status', dataIndex: 'status', width: 120, render: (v) => <Badge status={statusBadge[v]} text={v} /> },
        ...(compact ? [] : [
          { title: 'Category', dataIndex: 'cat', width: 120, responsive: ['lg'] },
          { title: 'Assigned', dataIndex: 'owner', width: 130, responsive: ['xl'], render: (v) => v || <span className="text-slate-400">Service desk</span> },
        ]),
        { title: 'Updated', dataIndex: 'updatedAt', width: 120, render: (v) => <span className="whitespace-nowrap text-[12px] text-slate-500">{fmtTime(v)}</span> },
      ]}
    />
  );
}

function TicketDrawer({ ticket, onClose }) {
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const open = !!ticket;
  const t = ticket || {};
  const send = async () => {
    if (!text.trim()) return;
    setBusy(true);
    try {
      await commentTicket(t.id, text.trim());
      setText('');
      message.success('Update sent to our team');
    } catch (err) {
      fail(err);
    } finally {
      setBusy(false);
    }
  };
  const thread = [
    { from: 'client', by: 'You', text: t.desc, at: t.createdAt, first: true },
    ...(t.updates || []),
  ];
  return (
    <Drawer
      open={open} onClose={onClose} width={480} destroyOnClose rootClassName="px-admin-drawer"
      styles={{ header: { padding: '12px 20px' } }}
      title={open && (
        <div className="min-w-0">
          <p className="m-0 truncate text-[14px] font-semibold">{t.subject}</p>
          <p className="m-0 font-mono text-[10.5px] font-normal text-slate-400">{t.code} · raised {fmtTime(t.createdAt)}</p>
        </div>
      )}
    >
      {open && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Tag color={priColor[t.pri]} className="!m-0">{t.pri}</Tag>
            <Badge status={statusBadge[t.status]} text={t.status} />
            <span className="text-[12px] text-slate-500">· {t.cat}</span>
            <span className="text-[12px] text-slate-500">· {t.owner || 'Service desk'}</span>
          </div>

          <div className="space-y-2.5 rounded-xl bg-slate-50 p-3 dark:bg-white/[0.03]">
            {thread.map((m, i) => {
              const mine = m.from === 'client';
              return (
                <div key={i} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-[12.5px] leading-relaxed ${
                    mine ? 'rounded-br-sm bg-brand-500 text-white'
                      : 'rounded-bl-sm border border-emerald-200 bg-emerald-50 text-slate-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-slate-200'
                  }`}>
                    <span className="whitespace-pre-wrap">{m.text}</span>
                    <span className={`mt-1 block text-[10.5px] ${mine ? 'text-white/70' : 'text-slate-400'}`}>
                      {m.first ? 'Original request' : mine ? 'You' : m.by || 'ProXinet team'} · {fmtTime(m.at)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {t.status === 'Closed' ? (
            <Alert type="info" showIcon message="This ticket is closed. Raise a new ticket if the issue comes back." />
          ) : (
            <div>
              <Input.TextArea
                rows={3} value={text} onChange={(e) => setText(e.target.value)} maxLength={3000}
                placeholder={t.status === 'Resolved' ? 'Still an issue? Reply to reopen this ticket…' : 'Add an update for our engineers…'}
              />
              <div className="mt-2 flex justify-end">
                <Button type="primary" icon={<SendOutlined />} loading={busy} disabled={!text.trim()} onClick={send}>Send update</Button>
              </div>
            </div>
          )}
        </div>
      )}
    </Drawer>
  );
}

function NewTicketModal({ open, onClose, onCreated }) {
  const [form] = Form.useForm();
  const [busy, setBusy] = useState(false);
  const submit = async (v) => {
    setBusy(true);
    try {
      const t = await createTicket(v);
      message.success(`Ticket ${t.code} created — the SLA timer has started.`);
      form.resetFields();
      onClose();
      onCreated?.(t);
    } catch (err) {
      if (err.fields) form.setFields(Object.entries(err.fields).map(([name, e]) => ({ name, errors: [e] })));
      fail(err);
    } finally {
      setBusy(false);
    }
  };
  return (
    <Modal open={open} onCancel={onClose} footer={null} title="Raise a ticket" destroyOnClose width={520}>
      <Form form={form} layout="vertical" requiredMark={false} onFinish={submit} initialValues={{ pri: 'P3', cat: 'Network' }}>
        <Form.Item name="subject" label="Subject" rules={[{ required: true, message: 'Subject is required' }, { max: 200 }]}>
          <Input placeholder="What is the issue?" />
        </Form.Item>
        <div className="grid gap-x-3 sm:grid-cols-2">
          <Form.Item name="pri" label="Priority">
            <Select options={[
              { value: 'P1', label: 'P1 — Business stopped' }, { value: 'P2', label: 'P2 — Major impact' },
              { value: 'P3', label: 'P3 — Minor impact' }, { value: 'P4', label: 'P4 — Request / change' },
            ]} />
          </Form.Item>
          <Form.Item name="cat" label="Category">
            <Select options={['Network', 'Server', 'Endpoint', 'Cloud / M365', 'Security', 'Backup', 'Licensing', 'Other'].map((v) => ({ value: v, label: v }))} />
          </Form.Item>
        </div>
        <Form.Item name="desc" label="Description" rules={[{ required: true, message: 'Please add some detail' }]}>
          <Input.TextArea rows={4} maxLength={5000} placeholder="When it started, how many users are affected, any error message…" />
        </Form.Item>
        <Button type="primary" htmlType="submit" block loading={busy}>Create ticket</Button>
      </Form>
    </Modal>
  );
}

/* ================= Sections ================= */
function Overview({ go, openTicket, onNewTicket }) {
  const { data, loading, error, reload } = usePortal(getOverview, [], { poll: 30000 });
  const [busy, setBusy] = useState(false);
  if (loading && !data) return <div className={`${card} p-4`}><Skeleton active paragraph={{ rows: 8 }} /></div>;
  if (!data) return <LoadError error={error} reload={reload} />;
  const k = data.kpis;
  const kpis = [
    { label: 'Uptime this month', value: `${k.uptime}%`, sub: `SLA target ${k.uptimeTarget}%`, ok: k.uptime >= k.uptimeTarget, icon: <CheckCircleFilled /> },
    { label: 'Open tickets', value: k.openTickets, sub: Object.entries(k.openByPriority).map(([p, n]) => `${n} ${p}`).join(', ') || 'Nothing open', icon: <CustomerServiceOutlined />, to: 'tickets' },
    { label: 'Avg response', value: `${k.avgResponseMin} min`, sub: `SLA target ${k.responseTargetMin} min`, ok: k.avgResponseMin <= k.responseTargetMin, icon: <ClockCircleOutlined /> },
    { label: 'SLA compliance', value: `${k.slaCompliance}%`, sub: 'last 30 days', ok: k.slaCompliance >= 95, icon: <ThunderboltOutlined /> },
  ];

  return (
    <>
      <Heading
        title={`Welcome back, ${data.client.company}`}
        sub={`${data.client.plan} plan · ${data.client.coverage} coverage${data.client.accountEngineer ? ` · Account engineer: ${data.client.accountEngineer}` : ''}`}
        extra={(
          <>
            <Button type="primary" icon={<PlusOutlined />} onClick={onNewTicket}>Raise a ticket</Button>
            <Button icon={<DownloadOutlined />} loading={busy} onClick={() => { setBusy(true); downloadSlaReport().catch(fail).finally(() => setBusy(false)); }}>SLA report</Button>
          </>
        )}
      />
      <LoadError error={error} reload={reload} />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {kpis.map((x) => (
          <button
            key={x.label} type="button" onClick={() => x.to && go(x.to)}
            className={`${card} border-solid p-3.5 text-left ${x.to ? 'cursor-pointer hover:shadow-soft' : 'cursor-default'}`}
          >
            <div className="flex items-start justify-between gap-2">
              <span className="text-[12px] font-medium text-slate-500">{x.label}</span>
              <span className={`grid h-7 w-7 place-items-center rounded-md text-[13px] ${x.ok === false ? 'bg-amber-50 text-amber-500' : 'bg-brand-50 text-brand-500'} dark:bg-white/5`}>{x.icon}</span>
            </div>
            <p className={`m-0 mt-1.5 text-[22px] font-semibold leading-none tabular-nums ${x.ok === false ? 'text-amber-600' : x.ok ? 'text-emerald-600' : 'text-slate-900 dark:text-white'}`}>{x.value}</p>
            <p className="m-0 mt-1.5 text-[11.5px] text-slate-400">{x.sub}</p>
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Panel className="xl:col-span-2" title="Open tickets" bodyClass="p-0" extra={<Button type="link" size="small" onClick={() => go('tickets')}>View all</Button>}>
          <TicketsTable rows={data.openTickets} onOpen={openTicket} compact />
        </Panel>
        <div className="min-w-0 space-y-4">
          <Panel title="Upcoming renewals" extra={<Button type="link" size="small" onClick={() => go('licences')}>View all</Button>}>
            {data.renewals.length === 0 ? <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Nothing due in 120 days" /> : (
              <ul className="m-0 list-none space-y-3 p-0">
                {data.renewals.map((l) => (
                  <li key={l.id} className="flex items-center justify-between gap-2">
                    <span className="min-w-0">
                      <span className="block truncate text-[13px] font-medium text-slate-800 dark:text-slate-100">{l.name}</span>
                      <span className="block text-[11.5px] text-slate-500">{l.qty} licence{l.qty === 1 ? '' : 's'} · renews {fmt(l.renew)}</span>
                    </span>
                    {daysTag(l.days)}
                  </li>
                ))}
              </ul>
            )}
          </Panel>
          <Panel title="At a glance">
            <div className="grid grid-cols-3 gap-2 text-center">
              {[['assets', 'Assets', data.counts.assets], ['licences', 'Licences', data.counts.licences], ['docs', 'Documents', data.counts.documents]].map(([key, label, n]) => (
                <button key={key} type="button" onClick={() => go(key)} className="cursor-pointer rounded-lg border border-solid border-slate-200 bg-transparent py-2.5 hover:border-brand-300 dark:border-white/10">
                  <span className="block text-[18px] font-semibold text-slate-900 dark:text-white">{n}</span>
                  <span className="block text-[11.5px] text-slate-500">{label}</span>
                </button>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </>
  );
}

function Tickets({ openTicket, onNewTicket }) {
  const { data, loading, error, reload } = usePortal(listTickets, [], { poll: 30000 });
  const [status, setStatus] = useState('all');
  const [q, setQ] = useState('');
  const rows = data?.items || [];
  const list = rows.filter((t) => (status === 'all' || (status === 'active' ? ['Open', 'In progress'].includes(t.status) : t.status === status))
    && (!q.trim() || `${t.code} ${t.subject} ${t.cat}`.toLowerCase().includes(q.trim().toLowerCase())));
  const count = (fn) => rows.filter(fn).length;
  return (
    <>
      <Heading title="Tickets" sub={`${rows.length} tickets · ${count((t) => ['Open', 'In progress'].includes(t.status))} active`} extra={<Button type="primary" icon={<PlusOutlined />} onClick={onNewTicket}>Raise a ticket</Button>} />
      <LoadError error={error} reload={reload} />
      <Panel bodyClass="p-0">
        <div className="flex flex-col gap-2.5 border-b border-slate-200 p-3 dark:border-white/10 md:flex-row md:items-center md:justify-between">
          <div className="-mx-1 overflow-x-auto px-1">
            <Segmented
              size="small" value={status} onChange={setStatus}
              options={[
                { label: `All (${rows.length})`, value: 'all' },
                { label: `Active (${count((t) => ['Open', 'In progress'].includes(t.status))})`, value: 'active' },
                { label: `Resolved (${count((t) => t.status === 'Resolved')})`, value: 'Resolved' },
                { label: `Closed (${count((t) => t.status === 'Closed')})`, value: 'Closed' },
              ]}
            />
          </div>
          <Input allowClear value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search tickets…" prefix={<SearchOutlined className="text-slate-400" />} className="md:!w-60" />
        </div>
        <TicketsTable rows={list} loading={loading} onOpen={openTicket} />
      </Panel>
    </>
  );
}

function Assets() {
  const { data, loading, error, reload } = usePortal(listAssets);
  const [type, setType] = useState('all');
  const [q, setQ] = useState('');
  const rows = data?.items || [];
  const types = [...new Set(rows.map((a) => a.type))];
  const list = rows.filter((a) => (type === 'all' || a.type === type) && (!q.trim() || `${a.name} ${a.model} ${a.serial} ${a.location}`.toLowerCase().includes(q.trim().toLowerCase())));
  const needAttention = rows.filter((a) => a.status !== 'Healthy' || (a.warrantyDays !== null && a.warrantyDays < 60)).length;
  return (
    <>
      <Heading title="Assets" sub={`${rows.length} managed assets${needAttention ? ` · ${needAttention} need attention` : ''}`} />
      <LoadError error={error} reload={reload} />
      <Panel bodyClass="p-0">
        <div className="flex flex-col gap-2.5 border-b border-slate-200 p-3 dark:border-white/10 md:flex-row md:items-center md:justify-between">
          <Select value={type} onChange={setType} style={{ minWidth: 160 }} options={[{ value: 'all', label: 'All types' }, ...types.map((t) => ({ value: t, label: t }))]} />
          <Input allowClear value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, model, serial…" prefix={<SearchOutlined className="text-slate-400" />} className="md:!w-64" />
        </div>
        <Table
          rowKey="id" size="small" loading={loading} dataSource={list} scroll={{ x: 820 }}
          pagination={{ pageSize: 15, hideOnSinglePage: true, showSizeChanger: false }}
          locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No assets listed yet" /> }}
          columns={[
            { title: 'Asset', dataIndex: 'name', render: (v, a) => <span><span className="block font-mono text-[12px] font-semibold text-slate-800 dark:text-slate-100">{v}</span><span className="block text-[11.5px] text-slate-500">{a.location}</span></span> },
            { title: 'Type', dataIndex: 'type', width: 110 },
            { title: 'Model', dataIndex: 'model' },
            { title: 'Serial', dataIndex: 'serial', width: 130, responsive: ['xl'], render: (v) => <span className="font-mono text-[11.5px]">{v || '—'}</span> },
            { title: 'Warranty', dataIndex: 'warranty', width: 190, render: (v, a) => (v ? <span className="flex items-center gap-2"><span className="whitespace-nowrap text-[12px]">{fmt(v)}</span>{daysTag(a.warrantyDays, 60)}</span> : '—') },
            { title: 'Status', dataIndex: 'status', width: 100, render: (v) => <Tag color={assetColor[v]} className="!m-0">{v}</Tag> },
          ]}
        />
      </Panel>
    </>
  );
}

function Licences() {
  const { data, loading, error, reload } = usePortal(listLicences);
  const [busyId, setBusyId] = useState(null);
  const rows = data?.items || [];
  const dueSoon = rows.filter((l) => l.days !== null && l.days < 45).length;
  const ask = async (l) => {
    setBusyId(l.id);
    try {
      const r = await requestRenewal(l.id);
      message.success(r.alreadyRequested ? `A renewal quote is already in progress (${r.ticket.code})` : `Renewal quote requested — ticket ${r.ticket.code}`);
    } catch (err) {
      fail(err);
    } finally {
      setBusyId(null);
    }
  };
  return (
    <>
      <Heading title="Licences" sub={`${rows.length} subscriptions tracked`} />
      <LoadError error={error} reload={reload} />
      {dueSoon > 0 && (
        <Alert className="!mb-3" type="warning" showIcon message={`${dueSoon} renewal${dueSoon > 1 ? 's' : ''} due in the next 45 days`} description="Request a renewal quote — if a licence lapses, support and updates stop." />
      )}
      <Panel bodyClass="p-0">
        <Table
          rowKey="id" size="small" loading={loading} dataSource={rows} scroll={{ x: 720 }} pagination={false}
          locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No licences listed yet" /> }}
          columns={[
            { title: 'Licence', dataIndex: 'name', render: (v, l) => <span><span className="block text-[13px] font-medium text-slate-800 dark:text-slate-100">{v}</span><span className="block text-[11.5px] text-slate-500">{l.vendor}</span></span> },
            { title: 'Qty', dataIndex: 'qty', width: 70 },
            { title: 'Renews', dataIndex: 'renew', width: 120, render: fmt },
            { title: 'Time left', dataIndex: 'days', width: 130, render: (d) => daysTag(d) },
            { key: 'a', width: 180, render: (_, l) => <Button size="small" loading={busyId === l.id} onClick={() => ask(l)}>Request renewal quote</Button> },
          ]}
        />
      </Panel>
    </>
  );
}

function Docs() {
  const { data, loading, error, reload } = usePortal(listDocuments);
  const [cat, setCat] = useState('All');
  const [busyId, setBusyId] = useState(null);
  const rows = data?.items || [];
  const cats = ['All', ...new Set(rows.map((d) => d.category))];
  const list = cat === 'All' ? rows : rows.filter((d) => d.category === cat);
  const get = (d) => { setBusyId(d.id); downloadDocument(d.id, d.file.filename).catch(fail).finally(() => setBusyId(null)); };
  return (
    <>
      <Heading title="Reports & Docs" sub={`${rows.length} documents shared with you`} extra={<Button icon={<DownloadOutlined />} onClick={() => downloadSlaReport().catch(fail)}>Live SLA report (CSV)</Button>} />
      <LoadError error={error} reload={reload} />
      <div className="-mx-1 mb-3 overflow-x-auto px-1"><Segmented size="small" value={cat} onChange={setCat} options={cats} /></div>
      {loading && !data ? <div className={`${card} p-4`}><Skeleton active /></div> : list.length === 0 ? (
        <div className={`${card} py-10`}><Empty description="No documents yet" /></div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((d) => (
            <div key={d.id} className={`${card} flex items-center gap-3 p-3`}>
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-500 dark:bg-white/5"><FileTextOutlined /></span>
              <div className="min-w-0 flex-1">
                <p className="m-0 truncate text-[13px] font-medium text-slate-800 dark:text-slate-100">{d.title}</p>
                <p className="m-0 text-[11.5px] text-slate-500">{d.category} · {fmt(d.createdAt)} · {Math.max(1, Math.round((d.file.size || 0) / 1024))} KB</p>
              </div>
              <Tooltip title="Download"><Button type="text" icon={<DownloadOutlined />} loading={busyId === d.id} onClick={() => get(d)} aria-label={`Download ${d.title}`} /></Tooltip>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function Escalation() {
  const { data, loading, error, reload } = usePortal(getEscalation);
  const colors = ['#d62b1f', '#d62b1f', '#d18700', '#8f1d1d'];
  return (
    <>
      <Heading title="Escalation matrix" sub="Who to contact, and when a ticket moves up automatically" />
      <LoadError error={error} reload={reload} />
      {loading && !data ? <div className={`${card} p-4`}><Skeleton active /></div> : data && (
        <div className="grid gap-4 xl:grid-cols-3">
          <Panel className="xl:col-span-2" title="Escalation path">
            <Timeline
              items={data.levels.map((l, i) => ({
                color: colors[Math.min(i, colors.length - 1)],
                children: (
                  <div className="pb-1">
                    <p className="m-0 text-[13px] font-semibold text-slate-900 dark:text-white">{l.level ? `${l.level} — ` : ''}{l.title}</p>
                    {l.detail && <p className="m-0 mt-0.5 text-[12.5px] text-slate-500">{l.detail}</p>}
                    {l.contact && <p className="m-0 mt-0.5 text-[12.5px] font-medium text-brand-600 dark:text-brand-300">{l.contact}</p>}
                  </div>
                ),
              }))}
            />
          </Panel>
          <Panel title="Your coverage">
            <dl className="m-0 space-y-2.5 text-[13px]">
              {[['Plan', data.plan], ['Coverage', data.coverage], ['Account engineer', data.accountEngineer || '—'], ['24×7 NOC', company.phones[0]], ['Email', company.email]].map(([k, v]) => (
                <div key={k}>
                  <dt className="text-[11.5px] text-slate-400">{k}</dt>
                  <dd className="m-0 font-medium text-slate-800 dark:text-slate-100">{v}</dd>
                </div>
              ))}
            </dl>
          </Panel>
        </div>
      )}
    </>
  );
}

/* ================= Search ================= */
function PortalSearch({ onPick }) {
  const [q, setQ] = useState('');
  const [items, setItems] = useState([]);
  const timer = useRef(null);
  useEffect(() => {
    clearTimeout(timer.current);
    if (q.trim().length < 2) { setItems([]); return undefined; }
    timer.current = setTimeout(() => searchPortal(q.trim()).then((r) => setItems(r.items)).catch(() => setItems([])), 250);
    return () => clearTimeout(timer.current);
  }, [q]);
  const label = { ticket: 'Ticket', asset: 'Asset', licence: 'Licence', document: 'Document' };
  return (
    <AutoComplete
      value={q} onChange={setQ} className="w-full" popupMatchSelectWidth={360}
      notFoundContent={q.trim().length >= 2 ? 'No matches' : null}
      onSelect={(_, opt) => { onPick(opt.item); setQ(''); }}
      options={items.map((i) => ({
        value: `${i.kind}-${i.id}`, item: i,
        label: (
          <span className="flex items-center justify-between gap-3">
            <span className="min-w-0">
              <span className="block truncate text-[12.5px] font-medium">{i.title}</span>
              <span className="block truncate text-[11px] text-slate-400">{i.sub}</span>
            </span>
            <Tag className="!m-0 !text-[10.5px]">{label[i.kind]}</Tag>
          </span>
        ),
      }))}
    >
      <Input prefix={<SearchOutlined className="text-slate-400" />} placeholder="Search tickets, assets, licences, documents…" allowClear />
    </AutoComplete>
  );
}

/* ================= Shell ================= */
function PasswordModal({ open, onClose }) {
  const [form] = Form.useForm();
  const [busy, setBusy] = useState(false);
  const save = async ({ currentPassword, newPassword }) => {
    setBusy(true);
    try {
      await changePassword(currentPassword, newPassword);
      message.success('Password updated');
      form.resetFields();
      onClose();
    } catch (err) {
      if (err.status === 401) form.setFields([{ name: 'currentPassword', errors: [err.message] }]);
      else fail(err);
    } finally {
      setBusy(false);
    }
  };
  return (
    <Modal open={open} onCancel={onClose} footer={null} title="Change password" destroyOnClose width={400}>
      <Form form={form} layout="vertical" requiredMark={false} onFinish={save}>
        <Form.Item name="currentPassword" label="Current password" rules={[{ required: true, message: 'Enter your current password' }]}><Input.Password prefix={<LockOutlined className="text-slate-400" />} autoComplete="current-password" /></Form.Item>
        <Form.Item name="newPassword" label="New password" rules={[{ required: true, min: 8, message: 'At least 8 characters' }]}><Input.Password prefix={<LockOutlined className="text-slate-400" />} autoComplete="new-password" /></Form.Item>
        <Form.Item
          name="confirm" label="Confirm new password" dependencies={['newPassword']}
          rules={[{ required: true, message: 'Confirm the new password' }, ({ getFieldValue }) => ({ validator: (_, v) => (!v || v === getFieldValue('newPassword') ? Promise.resolve() : Promise.reject(new Error('Passwords do not match'))) })]}
        >
          <Input.Password prefix={<LockOutlined className="text-slate-400" />} autoComplete="new-password" />
        </Form.Item>
        <Button type="primary" htmlType="submit" block loading={busy}>Update password</Button>
      </Form>
    </Modal>
  );
}

function SideNav({ active, onSelect, collapsed = false, openCount }) {
  return (
    <div className="flex h-full flex-col">
      <div className={`flex h-14 shrink-0 items-center border-b border-slate-200 dark:border-white/10 ${collapsed ? 'justify-center px-2' : 'px-5'}`}>
        <Link to="/" aria-label="ProXinet home"><Logo compact={collapsed} /></Link>
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-2.5 py-3">
        {!collapsed && <p className="m-0 mb-1 px-2.5 text-[10.5px] font-semibold uppercase tracking-wide text-slate-400">Client portal</p>}
        {SECTIONS.map((s) => {
          const on = s.key === active;
          const count = s.key === 'tickets' ? openCount : 0;
          return (
            <button
              key={s.key} type="button" onClick={() => onSelect(s.key)} title={collapsed ? s.label : undefined}
              className={`flex w-full cursor-pointer items-center gap-2.5 rounded-md border-0 px-2.5 py-1.5 text-left text-[13px] font-medium transition-colors ${
                on ? 'bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300' : 'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/5'
              } ${collapsed ? 'justify-center' : ''}`}
            >
              <span className="text-[14px]">{s.icon}</span>
              {!collapsed && <span className="flex-1 truncate">{s.label}</span>}
              {!collapsed && count > 0 && <span className="min-w-[18px] rounded-full bg-brand-500 px-1.5 text-center text-[10px] font-semibold leading-[18px] text-white">{count}</span>}
            </button>
          );
        })}
      </nav>
      {!collapsed && (
        <div className="m-2.5 rounded-lg bg-brand-50 p-3 text-[12px] dark:bg-white/5">
          <p className="m-0 font-semibold text-slate-800 dark:text-slate-100">24×7 NOC</p>
          <a href={`tel:${company.phones[0]}`} className="text-slate-500">{company.phones[0]}</a>
        </div>
      )}
    </div>
  );
}

export default function PortalApp() {
  const nav = useNavigate();
  const { dark, toggle } = useTheme();
  const [params, setParams] = useSearchParams();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [newTicket, setNewTicket] = useState(false);
  const [pwOpen, setPwOpen] = useState(false);
  const session = getSession();
  const section = SECTIONS.some((s) => s.key === params.get('s')) ? params.get('s') : 'overview';
  const ticketId = params.get('ticket');
  const tickets = usePortal(listTickets, [], { poll: 30000 });
  const openTicket = useMemo(() => tickets.data?.items.find((t) => t.id === ticketId), [tickets.data, ticketId]);
  const openCount = (tickets.data?.items || []).filter((t) => ['Open', 'In progress'].includes(t.status)).length;

  useEffect(() => { document.title = 'Client Portal · ProXinet'; }, []);
  useEffect(() => { document.querySelector('#portal-main')?.scrollTo(0, 0); }, [section]);

  if (!session) return <Navigate to={`/portal/login?next=${encodeURIComponent('/portal/dashboard')}`} replace />;

  const go = (s, extra = {}) => { setParams({ s, ...extra }); setMobileOpen(false); };
  const showTicket = (id) => setParams({ s: section, ticket: id });
  const closeTicket = () => setParams({ s: section });
  const pick = (item) => {
    if (item.kind === 'ticket') go('tickets', { ticket: item.id });
    if (item.kind === 'asset') go('assets');
    if (item.kind === 'licence') go('licences');
    if (item.kind === 'document') go('docs');
  };
  const signOut = () => { logout(); nav('/portal/login', { replace: true }); };

  const content = {
    overview: <Overview go={go} openTicket={showTicket} onNewTicket={() => setNewTicket(true)} />,
    tickets: <Tickets openTicket={showTicket} onNewTicket={() => setNewTicket(true)} />,
    assets: <Assets />,
    licences: <Licences />,
    docs: <Docs />,
    escalation: <Escalation />,
  }[section];

  return (
    <ConfigProvider theme={portalTheme}>
      <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-[#0a1520]">
        <aside className={`hidden shrink-0 border-e border-slate-200 bg-white transition-[width] duration-200 dark:border-white/10 dark:bg-[#101d2b] lg:block ${collapsed ? 'w-[60px]' : 'w-56'}`}>
          <SideNav active={section} onSelect={go} collapsed={collapsed} openCount={openCount} />
        </aside>
        <Drawer placement="left" open={mobileOpen} onClose={() => setMobileOpen(false)} width={236} closable={false} styles={{ body: { padding: 0 } }}>
          <SideNav active={section} onSelect={go} openCount={openCount} />
        </Drawer>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-14 shrink-0 items-center gap-2 border-b border-slate-200 bg-white px-3 dark:border-white/10 dark:bg-[#101d2b] sm:px-5">
            <Button type="text" className="lg:!hidden" icon={<MenuUnfoldOutlined />} onClick={() => setMobileOpen(true)} aria-label="Open menu" />
            <Button type="text" className="!hidden lg:!inline-flex" icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />} onClick={() => setCollapsed((c) => !c)} aria-label="Collapse sidebar" />
            <div className="hidden w-full max-w-sm md:block"><PortalSearch onPick={pick} /></div>
            <div className="ms-auto flex items-center gap-1 sm:gap-2">
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setNewTicket(true)} className="!hidden sm:!inline-flex">Raise a ticket</Button>
              <Button type="text" aria-label="Toggle theme" icon={dark ? <SunOutlined /> : <MoonOutlined />} onClick={toggle} />
              <Dropdown
                trigger={['click']} placement="bottomRight"
                menu={{
                  items: [
                    { key: 'pw', icon: <LockOutlined />, label: 'Change password' },
                    { key: 'site', icon: <HomeOutlined />, label: 'Back to website' },
                    { type: 'divider' },
                    { key: 'logout', icon: <LogoutOutlined />, label: 'Log out', danger: true },
                  ],
                  onClick: ({ key }) => { if (key === 'pw') setPwOpen(true); if (key === 'site') nav('/'); if (key === 'logout') signOut(); },
                }}
              >
                <button type="button" className="flex cursor-pointer items-center gap-2 rounded-lg border-0 bg-transparent px-2 py-1 hover:bg-slate-100 dark:hover:bg-white/5">
                  <Avatar size={28} className="!bg-brand-500 !text-[12px]" icon={<UserOutlined />} />
                  <span className="hidden text-start leading-tight md:block">
                    <span className="block max-w-[180px] truncate text-[12.5px] font-medium text-slate-800 dark:text-slate-100">{session.company}</span>
                    <span className="block text-[11px] text-slate-500">{session.plan} plan</span>
                  </span>
                </button>
              </Dropdown>
            </div>
          </header>

          <main id="portal-main" className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-5">
            <div className="mb-3 md:hidden"><PortalSearch onPick={pick} /></div>
            {content}
          </main>
        </div>

        <NewTicketModal open={newTicket} onClose={() => setNewTicket(false)} onCreated={(t) => go('tickets', { ticket: t.id })} />
        <TicketDrawer ticket={openTicket} onClose={closeTicket} />
        <PasswordModal open={pwOpen} onClose={() => setPwOpen(false)} />
      </div>
    </ConfigProvider>
  );
}

