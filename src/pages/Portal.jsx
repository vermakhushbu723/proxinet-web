import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Button, Form, Input, Checkbox, Alert, Tabs, Table, Tag, Progress, Statistic,
  Timeline, Modal, Select, message, Badge, Menu, Drawer, Dropdown, Avatar,
} from 'antd';
import {
  LockOutlined, UserOutlined, PlusOutlined, CheckCircleFilled,
  WarningFilled, ClockCircleOutlined, FileTextOutlined, DesktopOutlined,
  SafetyCertificateOutlined, DownloadOutlined, DashboardOutlined, CustomerServiceOutlined,
  ApartmentOutlined, MenuFoldOutlined, MenuUnfoldOutlined, SearchOutlined, BellOutlined,
  SunOutlined, MoonOutlined, LogoutOutlined, HomeOutlined,
} from '@ant-design/icons';
import { Reveal, SectionHead, useTheme } from '../components/ui';
import { PageHero } from '../components/blocks';
import { company } from '../data/company';
import Logo from '../components/Logo';
import { img, photos } from '../data/images';

/* ---------------- demo data ---------------- */
const tickets = [
  { id: 'PXN-4821', subject: 'Exchange Online mail delay for finance team', pri: 'P2', status: 'In progress', owner: 'L2 · Cloud', age: '3h 12m', sla: 72 },
  { id: 'PXN-4818', subject: 'Branch VPN drops every 40 minutes', pri: 'P1', status: 'In progress', owner: 'L3 · Network', age: '48m', sla: 34 },
  { id: 'PXN-4814', subject: 'New laptop imaging — 4 units', pri: 'P4', status: 'Scheduled', owner: 'L1 · Field', age: '2d', sla: 20 },
  { id: 'PXN-4809', subject: 'Backup job failed on FILESRV02', pri: 'P2', status: 'Resolved', owner: 'L2 · Backup', age: '4d', sla: 100 },
  { id: 'PXN-4801', subject: 'Add 12 users to Intune compliance policy', pri: 'P3', status: 'Resolved', owner: 'L2 · Endpoint', age: '6d', sla: 100 },
];

const assets = [
  { name: 'DC-SRV-01', type: 'Server', model: 'Dell PowerEdge R650', warranty: '2027-04-18', status: 'Healthy' },
  { name: 'DC-SRV-02', type: 'Server', model: 'Dell PowerEdge R650', warranty: '2027-04-18', status: 'Healthy' },
  { name: 'FILESRV02', type: 'Server', model: 'HPE ProLiant DL380', warranty: '2026-11-02', status: 'Warning' },
  { name: 'FW-EDGE-01', type: 'Firewall', model: 'Fortinet FortiGate 100F', warranty: '2027-01-30', status: 'Healthy' },
  { name: 'SAN-01', type: 'Storage', model: 'Dell PowerVault ME5', warranty: '2028-03-12', status: 'Healthy' },
  { name: 'SW-CORE-01', type: 'Switch', model: 'Cisco Catalyst 9200', warranty: '2026-09-28', status: 'Expiring' },
];

const licences = [
  { name: 'Microsoft 365 Business Premium', qty: 128, renew: '2026-11-30', days: 83 },
  { name: 'Veeam Backup Essentials', qty: 6, renew: '2026-10-15', days: 37 },
  { name: 'Fortinet FortiGate UTP Bundle', qty: 1, renew: '2026-09-28', days: 20 },
  { name: 'Sophos Intercept X Advanced', qty: 140, renew: '2027-02-14', days: 159 },
];

const priColor = { P1: 'red', P2: 'orange', P3: 'gold', P4: 'default' };
const statusColor = { 'In progress': 'processing', Scheduled: 'default', Resolved: 'success' };

/* =================== LOGIN =================== */
export function PortalLogin() {
  const nav = useNavigate();
  return (
    <div className="grid min-h-[calc(100vh-108px)] lg:grid-cols-2">
      {/* left: brand panel */}
      <div className="relative hidden overflow-hidden bg-ink-900 p-12 lg:flex lg:flex-col lg:justify-between">
        <img src={img(photos.dcEngineer, 1400)} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-brand-700/90 via-brand-800/80 to-ink-900/90" aria-hidden="true" />
        <div
          className="absolute inset-0 opacity-15" aria-hidden="true"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.4) 1px, transparent 1px)',
            backgroundSize: '46px 46px',
          }}
        />
        <div className="relative">
          <h2 className="font-display text-3xl font-bold leading-tight text-white">
            Your whole infrastructure on one screen
          </h2>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-white/85">
            Tickets, asset inventory, licence renewals, SLA reports and invoices.
            No need to email anyone just to find something out.
          </p>
          <ul className="mt-8 space-y-3">
            {[
              'Raise a ticket — the SLA timer starts immediately',
              'Asset warranty and EOL dates',
              'Licence renewal alerts at 90, 60 and 30 days',
              'Live SLA dashboard and monthly reports',
              'Invoices and handover documents',
            ].map((t) => (
              <li key={t} className="flex items-center gap-2.5 text-[14.5px] text-white/90">
                <CheckCircleFilled className="text-emerald-300" /> {t}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative font-mono text-[11px] uppercase tracking-wider text-white/60">
          24×7 NOC · {company.phones[0]}
        </p>
      </div>

      {/* right: form */}
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm">
          <Logo />
          <h1 className="px-h3 mt-8 text-slate-900 dark:text-white">Client Portal login</h1>
          <p className="px-body mt-2">For managed services clients.</p>

          <Alert
            className="!my-5" type="info" showIcon
            message="Demo mode"
            description="Enter any email and password — the dashboard opens with demo data."
          />

          <Form layout="vertical" requiredMark={false} onFinish={() => nav('/portal/dashboard')}>
            <Form.Item name="email" label="Work email" rules={[{ required: true, type: 'email', message: 'Enter a valid email address' }]}>
              <Input size="large" prefix={<UserOutlined className="text-slate-400" />} placeholder="you@company.com" />
            </Form.Item>
            <Form.Item name="password" label="Password" rules={[{ required: true, message: 'Enter your password' }]}>
              <Input.Password size="large" prefix={<LockOutlined className="text-slate-400" />} placeholder="••••••••" />
            </Form.Item>
            <div className="mb-5 flex items-center justify-between">
              <Checkbox>Remember me</Checkbox>
              <a href="#" className="text-[13.5px] font-medium text-brand-600 dark:text-brand-300">Forgot password?</a>
            </div>
            <Button type="primary" size="large" htmlType="submit" block>Sign in</Button>
          </Form>

          <p className="mt-6 text-center text-[13.5px] text-slate-500">
            Not a client yet? <Link to="/book-assessment" className="font-semibold text-brand-600 dark:text-brand-300">Book a free assessment</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

/* =================== DASHBOARD (admin-style layout) =================== */
const navItems = [
  { key: 'overview', icon: <DashboardOutlined />, label: 'Overview' },
  { key: 'tickets', icon: <CustomerServiceOutlined />, label: 'Tickets' },
  { key: 'assets', icon: <DesktopOutlined />, label: 'Assets' },
  { key: 'licences', icon: <SafetyCertificateOutlined />, label: 'Licences' },
  { key: 'reports', icon: <FileTextOutlined />, label: 'Reports & Docs' },
  { key: 'escalation', icon: <ApartmentOutlined />, label: 'Escalation' },
];

const cardCls = 'rounded-xl border border-slate-200 bg-white dark:border-white/10 dark:bg-[#101d2b]';

function TicketsTable({ rows = tickets }) {
  return (
    <Table
      dataSource={rows.map((t) => ({ ...t, key: t.id }))} pagination={false} scroll={{ x: 820 }}
      columns={[
        { title: 'ID', dataIndex: 'id', render: (v) => <span className="font-mono text-[13px] font-semibold text-brand-600">{v}</span> },
        { title: 'Subject', dataIndex: 'subject', width: 300 },
        { title: 'Priority', dataIndex: 'pri', render: (v) => <Tag color={priColor[v]}>{v}</Tag> },
        { title: 'Status', dataIndex: 'status', render: (v) => <Badge status={statusColor[v]} text={v} /> },
        { title: 'Assigned', dataIndex: 'owner' },
        { title: 'Age', dataIndex: 'age' },
        {
          title: 'SLA', dataIndex: 'sla', width: 130,
          render: (v) => (
            <Progress
              percent={v} size="small"
              strokeColor={v >= 100 ? '#12a06a' : v > 60 ? '#d18700' : '#d62b1f'}
              format={(p) => (p >= 100 ? 'Met' : `${p}%`)}
            />
          ),
        },
      ]}
    />
  );
}

function Panel({ title, extra, children, className = '' }) {
  return (
    <div className={`${cardCls} ${className}`}>
      {title && (
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-3.5 dark:border-white/10">
          <h2 className="font-display text-[15px] font-semibold text-slate-900 dark:text-white">{title}</h2>
          {extra}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}

function SideNav({ active, onSelect, collapsed = false }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 shrink-0 items-center border-b border-slate-200 px-5 dark:border-white/10">
        <Link to="/" aria-label="ProXinet home"><Logo compact={collapsed} /></Link>
      </div>
      <Menu
        mode="inline" inlineCollapsed={collapsed} selectedKeys={[active]}
        items={navItems} onClick={({ key }) => onSelect(key)}
        className="!flex-1 !border-e-0 !px-2 !pt-3"
      />
      {!collapsed && (
        <div className="m-3 rounded-lg bg-brand-50 p-3 text-[12.5px] dark:bg-white/5">
          <p className="font-semibold text-slate-800 dark:text-slate-100">24×7 NOC</p>
          <p className="text-slate-500">{company.phones[0]}</p>
        </div>
      )}
    </div>
  );
}

export function PortalDashboard() {
  const nav = useNavigate();
  const { dark, toggle } = useTheme();
  const [section, setSection] = useState('overview');
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [newTicket, setNewTicket] = useState(false);

  const go = (key) => { setSection(key); setMobileOpen(false); };
  const current = navItems.find((n) => n.key === section);

  const kpis = [
    { k: 'Uptime this month', v: '99.94%', tone: 'text-emerald-500', sub: 'SLA target 99.5%', icon: <CheckCircleFilled /> },
    { k: 'Open tickets', v: '3', tone: 'text-slate-900 dark:text-white', sub: '1 P1, 1 P2, 1 P4', icon: <CustomerServiceOutlined /> },
    { k: 'Avg response', v: '11 min', tone: 'text-brand-500', sub: 'SLA target 15 min', icon: <ClockCircleOutlined /> },
    { k: 'SLA compliance', v: '100%', tone: 'text-emerald-500', sub: 'last 30 days', icon: <SafetyCertificateOutlined /> },
  ];

  const userMenu = {
    items: [
      { key: 'site', icon: <HomeOutlined />, label: 'Back to website' },
      { type: 'divider' },
      { key: 'logout', icon: <LogoutOutlined />, label: 'Log out', danger: true },
    ],
    onClick: ({ key }) => {
      if (key === 'logout') nav('/portal/login');
      if (key === 'site') nav('/');
    },
  };

  const sections = {
    overview: (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {kpis.map((k) => (
            <div key={k.k} className={`${cardCls} p-5`}>
              <div className="flex items-start justify-between">
                <p className="font-mono text-[11px] uppercase tracking-wider text-slate-400">{k.k}</p>
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-50 text-brand-500 dark:bg-white/5">{k.icon}</span>
              </div>
              <p className={`mt-1 font-display text-3xl font-bold tabular-nums ${k.tone}`}>{k.v}</p>
              <p className="mt-0.5 text-[12.5px] text-slate-500">{k.sub}</p>
            </div>
          ))}
        </div>
        <div className="grid gap-6 xl:grid-cols-3">
          <Panel
            className="min-w-0 xl:col-span-2" title="Open tickets"
            extra={<Button type="link" size="small" onClick={() => go('tickets')}>View all</Button>}
          >
            <div className="overflow-x-auto"><TicketsTable rows={tickets.filter((t) => t.status !== 'Resolved')} /></div>
          </Panel>
          <Panel title="Upcoming renewals" extra={<Button type="link" size="small" onClick={() => go('licences')}>View all</Button>}>
            <div className="space-y-4">
              {[...licences].sort((a, b) => a.days - b.days).slice(0, 3).map((l) => (
                <div key={l.name}>
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-[13.5px] font-medium text-slate-800 dark:text-slate-100">{l.name}</p>
                    <Tag color={l.days < 45 ? 'red' : l.days < 90 ? 'orange' : 'green'}>{l.days}d</Tag>
                  </div>
                  <p className="text-[12px] text-slate-500">Renews {l.renew}</p>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    ),
    tickets: (
      <Panel title="All tickets" extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => setNewTicket(true)}>New ticket</Button>}>
        <div className="overflow-x-auto"><TicketsTable /></div>
      </Panel>
    ),
    assets: (
      <Panel title="Asset inventory">
        <div className="overflow-x-auto">
          <Table
            dataSource={assets.map((a) => ({ ...a, key: a.name }))} pagination={false} scroll={{ x: 700 }}
            columns={[
              { title: 'Asset', dataIndex: 'name', render: (v) => <span className="font-mono text-[13px] font-semibold">{v}</span> },
              { title: 'Type', dataIndex: 'type' },
              { title: 'Model', dataIndex: 'model' },
              { title: 'Warranty until', dataIndex: 'warranty' },
              {
                title: 'Status', dataIndex: 'status',
                render: (v) => <Tag color={v === 'Healthy' ? 'green' : v === 'Warning' ? 'orange' : 'red'}>{v}</Tag>,
              },
            ]}
          />
        </div>
      </Panel>
    ),
    licences: (
      <div className="space-y-3">
        <Alert
          type="warning" showIcon
          message="Two renewals fall due in the next 45 days"
          description="Request a renewal quote — if a licence lapses, support and updates stop."
        />
        {licences.map((l) => (
          <div key={l.name} className={`${cardCls} flex flex-wrap items-center justify-between gap-4 p-5`}>
            <div className="min-w-0">
              <p className="font-display font-semibold text-slate-900 dark:text-white">{l.name}</p>
              <p className="mt-0.5 text-[13px] text-slate-500">{l.qty} licences · renews {l.renew}</p>
            </div>
            <div className="flex items-center gap-4">
              <Tag color={l.days < 45 ? 'red' : l.days < 90 ? 'orange' : 'green'}>{l.days} days left</Tag>
              <Button size="small">Request renewal quote</Button>
            </div>
          </div>
        ))}
      </div>
    ),
    reports: (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[
          'SLA Report — August 2026', 'SLA Report — July 2026', 'Quarterly Business Review Q2',
          'Network as-built documentation', 'Backup policy document', 'Escalation matrix (current)',
          'Invoice INV-2026-0842', 'Invoice INV-2026-0796', 'Annual security posture review',
        ].map((d) => (
          <div key={d} className={`${cardCls} flex items-center gap-3 p-4`}>
            <FileTextOutlined className="text-xl text-brand-500" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px] font-medium text-slate-800 dark:text-slate-100">{d}</p>
              <p className="font-mono text-[11px] uppercase tracking-wider text-slate-400">PDF</p>
            </div>
            <Button type="text" icon={<DownloadOutlined />} aria-label={`Download ${d}`} />
          </div>
        ))}
      </div>
    ),
    escalation: (
      <Panel title="Escalation matrix" className="max-w-3xl">
        <Timeline
          items={[
            { color: '#d62b1f', children: <><p className="font-semibold">L1 — Service Desk</p><p className="px-body">First response · {company.phones[0]} · support@proxinet.in</p></> },
            { color: '#d62b1f', children: <><p className="font-semibold">L2 — Practice Engineer</p><p className="px-body">Escalated after 30 minutes if L1 cannot resolve it</p></> },
            { color: '#d18700', children: <><p className="font-semibold">L3 — Practice Lead</p><p className="px-body">After one hour on a P1, or on customer request</p></> },
            { color: '#d2453c', children: <><p className="font-semibold">Management — Service Delivery Manager</p><p className="px-body">After two hours on a P1 · {company.phones[1]}</p></> },
          ]}
        />
      </Panel>
    ),
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-[#0a1520]">
      {/* Desktop sidebar */}
      <aside
        className={`hidden shrink-0 border-e border-slate-200 bg-white transition-[width] duration-200 dark:border-white/10 dark:bg-[#101d2b] lg:block ${collapsed ? 'w-20' : 'w-64'}`}
      >
        <SideNav active={section} onSelect={go} collapsed={collapsed} />
      </aside>

      {/* Mobile sidebar */}
      <Drawer
        placement="left" open={mobileOpen} onClose={() => setMobileOpen(false)}
        width={260} closable={false} styles={{ body: { padding: 0 } }}
      >
        <SideNav active={section} onSelect={go} />
      </Drawer>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top header */}
        <header className="flex h-16 shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-4 dark:border-white/10 dark:bg-[#101d2b] sm:px-6">
          <Button
            type="text" aria-label="Open menu" className="lg:!hidden"
            icon={<MenuUnfoldOutlined />} onClick={() => setMobileOpen(true)}
          />
          <Button
            type="text" aria-label="Collapse sidebar" className="!hidden lg:!inline-flex"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />} onClick={() => setCollapsed((c) => !c)}
          />
          <div className="hidden w-full max-w-xs md:block">
            <Input prefix={<SearchOutlined className="text-slate-400" />} placeholder="Search tickets, assets…" />
          </div>
          <div className="ms-auto flex items-center gap-1 sm:gap-2">
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setNewTicket(true)} className="!hidden sm:!inline-flex">
              Raise a ticket
            </Button>
            <Button type="text" aria-label="Toggle theme" icon={dark ? <SunOutlined /> : <MoonOutlined />} onClick={toggle} />
            <Badge count={2} size="small" offset={[-4, 4]}>
              <Button type="text" aria-label="Notifications" icon={<BellOutlined />} />
            </Badge>
            <Dropdown menu={userMenu} trigger={['click']} placement="bottomRight">
              <button type="button" className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-slate-100 dark:hover:bg-white/5">
                <Avatar size={32} className="!bg-brand-500">AC</Avatar>
                <span className="hidden text-start leading-tight md:block">
                  <span className="block text-[13px] font-semibold text-slate-800 dark:text-slate-100">Auto Components Mfg.</span>
                  <span className="block text-[11.5px] text-slate-500">Gold plan</span>
                </span>
              </button>
            </Dropdown>
          </div>
        </header>

        {/* Content */}
        <main id="main" className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
                {section === 'overview' ? 'Welcome back, Auto Components Mfg.' : current.label}
              </h1>
              <p className="mt-1 text-[13.5px] text-slate-500">Gold plan · 24×7×365 coverage · Account engineer: Technical Director</p>
            </div>
            {section === 'overview' && <Button icon={<DownloadOutlined />}>Download SLA report</Button>}
          </div>
          {sections[section]}
        </main>
      </div>

      <Modal
        open={newTicket} onCancel={() => setNewTicket(false)} footer={null} title="Raise a ticket" destroyOnClose
      >
        <Form
          layout="vertical" requiredMark={false}
          onFinish={(v) => { console.info('TICKET →', v); message.success('Ticket created — the SLA timer has started.'); setNewTicket(false); }}
        >
          <Form.Item name="subject" label="Subject" rules={[{ required: true, message: 'Subject is required' }]}>
            <Input size="large" placeholder="What is the issue?" />
          </Form.Item>
          <div className="grid gap-x-4 sm:grid-cols-2">
            <Form.Item name="pri" label="Priority" initialValue="P3">
              <Select
                size="large"
                options={[
                  { value: 'P1', label: 'P1 — Business stopped' },
                  { value: 'P2', label: 'P2 — Major impact' },
                  { value: 'P3', label: 'P3 — Minor impact' },
                  { value: 'P4', label: 'P4 — Request / change' },
                ]}
              />
            </Form.Item>
            <Form.Item name="cat" label="Category" initialValue="Network">
              <Select size="large" options={['Network', 'Server', 'Endpoint', 'Cloud / M365', 'Security', 'Backup', 'Other'].map((v) => ({ value: v, label: v }))} />
            </Form.Item>
          </div>
          <Form.Item name="desc" label="Description" rules={[{ required: true, message: 'Please add some detail' }]}>
            <Input.TextArea rows={4} placeholder="When it started, how many users are affected, any error message…" />
          </Form.Item>
          <Button type="primary" size="large" htmlType="submit" block>Create ticket</Button>
        </Form>
      </Modal>
    </div>
  );
}

/* =================== PUBLIC STATUS PAGE =================== */
export function StatusPage() {
  const systems = [
    { s: 'Client Portal', st: 'Operational' },
    { s: 'Service Desk (ticketing)', st: 'Operational' },
    { s: 'NOC Monitoring', st: 'Operational' },
    { s: 'Remote Support Gateway', st: 'Operational' },
    { s: 'Backup Orchestration', st: 'Maintenance' },
    { s: 'Email & Notifications', st: 'Operational' },
  ];
  const tone = { Operational: ['green', <CheckCircleFilled key="i" />], Maintenance: ['orange', <ClockCircleOutlined key="i" />], Degraded: ['red', <WarningFilled key="i" />] };

  return (
    <>
      <PageHero
        eyebrow="Service status" title="System status"
        sub="Real-time status of ProXinet managed platforms. Planned maintenance is announced here first."
        crumbs={[{ label: 'Status' }]}
      />
      <section className="px-container px-section">
        <Reveal>
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-500/25 dark:bg-emerald-500/5">
            <CheckCircleFilled className="text-2xl text-emerald-500" />
            <div>
              <p className="font-display text-lg font-semibold text-slate-900 dark:text-white">All core systems operational</p>
              <p className="text-[13.5px] text-slate-500">Last checked: just now · Refreshes every 60 seconds</p>
            </div>
          </div>
        </Reveal>

        <div className="space-y-2.5">
          {systems.map((x, i) => {
            const [color, icon] = tone[x.st];
            return (
              <Reveal key={x.s} delay={i * 0.04}>
                <div className="px-card flex items-center justify-between !py-4">
                  <span className="font-medium text-slate-800 dark:text-slate-100">{x.s}</span>
                  <Tag color={color} icon={icon}>{x.st}</Tag>
                </div>
              </Reveal>
            );
          })}
        </div>

        <Reveal className="mt-10">
          <SectionHead eyebrow="Recent" title="Maintenance & incident history" />
          <Timeline
            className="!mt-6"
            items={[
              { color: '#d18700', children: <><p className="font-semibold">Scheduled: Backup orchestration upgrade</p><p className="px-body">08 Sep 2026, 11:00 PM – 02:00 AM IST. Backup jobs will queue during this window; no data will be lost.</p></> },
              { color: '#12a06a', children: <><p className="font-semibold">Resolved: Portal login latency</p><p className="px-body">02 Sep 2026 — logins were slow for 40 minutes. Root cause: authentication cache. Fix deployed.</p></> },
              { color: '#12a06a', children: <><p className="font-semibold">Completed: NOC monitoring platform update</p><p className="px-body">24 Aug 2026 — completed within the planned window with no client impact.</p></> },
            ]}
          />
        </Reveal>
      </section>
    </>
  );
}
