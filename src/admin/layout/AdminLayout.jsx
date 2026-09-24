import React, { useEffect, useRef, useState } from 'react';
import { NavLink, Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Button, Badge, Drawer, Dropdown, Avatar, Empty, notification } from 'antd';
import {
  DashboardOutlined, SettingOutlined, MenuFoldOutlined, MenuUnfoldOutlined, BellOutlined,
  SunOutlined, MoonOutlined, LogoutOutlined, GlobalOutlined, TeamOutlined, DesktopOutlined,
  SafetyCertificateOutlined, FolderOpenOutlined, SyncOutlined,
} from '@ant-design/icons';
import Logo from '../../components/Logo';
import { useTheme } from '../../components/ui';
import { collections, collectionKeys, navGroups } from '../config/collections';
import { useApi, getUnread, getRenewalReminders } from '../api/store';
import RenewalReminderModal from '../renewals/ReminderModal';
import { daysText } from '../renewals/shared';
import { logout, getSession } from '../api/auth';
import { timeAgo } from '../utils';

const POLL_MS = 15000;

// Data the admin manages for each client's portal (/portal/dashboard)
const PORTAL_NAV = [
  ['/admin/clients', <TeamOutlined key="c" />, 'Clients'],
  ['/admin/client-assets', <DesktopOutlined key="a" />, 'Assets'],
  ['/admin/client-licences', <SafetyCertificateOutlined key="l" />, 'Licences'],
  ['/admin/client-documents', <FolderOpenOutlined key="d" />, 'Documents'],
];

function SideNav({ collapsed, counts, renewalsDue = 0, onNavigate }) {
  const item = (to, icon, label, count) => (
    <NavLink
      key={to} to={to} onClick={onNavigate} title={collapsed ? label : undefined}
      className={({ isActive }) => `group flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] font-medium transition-colors ${
        isActive
          ? 'bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white'
      } ${collapsed ? 'justify-center' : ''}`}
    >
      <span className="relative text-[14px]">
        {icon}
        {collapsed && count > 0 && <span className="absolute -right-1.5 -top-1 h-2 w-2 rounded-full bg-brand-500" />}
      </span>
      {!collapsed && <span className="flex-1 truncate">{label}</span>}
      {!collapsed && count > 0 && (
        <span className="min-w-[18px] rounded-full bg-brand-500 px-1.5 text-center text-[10px] font-semibold leading-[18px] text-white">{count}</span>
      )}
    </NavLink>
  );

  return (
    <div className="flex h-full flex-col">
      <div className={`flex h-14 shrink-0 items-center border-b border-slate-200 dark:border-white/10 ${collapsed ? 'justify-center px-2' : 'px-5'}`}>
        <Link to="/admin/dashboard" aria-label="Admin home" className="flex items-center gap-2">
          <Logo compact={collapsed} />
        </Link>
      </div>
      <nav className="flex-1 space-y-4 overflow-y-auto px-2.5 py-3">
        <div className="space-y-0.5">{item('/admin/dashboard', <DashboardOutlined />, 'Dashboard', 0)}</div>
        {navGroups.map((g) => (
          <div key={g} className="space-y-0.5">
            {!collapsed && <p className="m-0 mb-1 px-2.5 text-[10.5px] font-semibold uppercase tracking-wide text-slate-400">{g}</p>}
            {collectionKeys.filter((k) => collections[k].group === g).map((k) =>
              item(collections[k].path, collections[k].icon, collections[k].nav, counts[k] || 0))}
          </div>
        ))}
        <div className="space-y-0.5">
          {!collapsed && <p className="m-0 mb-1 px-2.5 text-[10.5px] font-semibold uppercase tracking-wide text-slate-400">Sales</p>}
          {item('/admin/renewals', <SyncOutlined />, 'Renewals', renewalsDue)}
        </div>
        <div className="space-y-0.5">
          {!collapsed && <p className="m-0 mb-1 px-2.5 text-[10.5px] font-semibold uppercase tracking-wide text-slate-400">Client portal</p>}
          {PORTAL_NAV.map(([to, icon, label]) => item(to, icon, label, 0))}
        </div>
        <div className="space-y-0.5 border-t border-slate-200 pt-3 dark:border-white/10">
          {item('/admin/settings', <SettingOutlined />, 'Settings', 0)}
        </div>
      </nav>
    </div>
  );
}

/* Shows a toast for every new submission that arrives while the panel is open. */
function useNewSubmissionAlerts(items) {
  const nav = useNavigate();
  // Only records created after the panel was opened count as "new" — older unread items
  // that scroll into the unread list later must not trigger a toast.
  const openedAt = useRef(Date.now());
  const seen = useRef(new Set());
  useEffect(() => {
    if (!items) return;
    items.filter((i) => new Date(i.createdAt).getTime() > openedAt.current && !seen.current.has(i.id)).reverse().forEach((r) => {
      seen.current.add(r.id);
      const cfg = collections[r.col];
      notification.open({
        key: r.id, placement: 'bottomRight', duration: 8,
        icon: <span className="text-brand-500">{cfg.icon}</span>,
        message: `New ${cfg.singular}`,
        description: `${cfg.primary(r)}${cfg.secondary(r) ? ` — ${cfg.secondary(r)}` : ''}`,
        onClick: () => { notification.destroy(r.id); nav(`${cfg.path}?id=${r.id}`); },
        className: 'cursor-pointer',
      });
    });
  }, [items, nav]);
}

export default function AdminLayout() {
  const nav = useNavigate();
  const { pathname } = useLocation();
  const { dark, toggle } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const session = getSession();
  const { data: unread } = useApi(getUnread, [], { poll: POLL_MS });
  useNewSubmissionAlerts(unread?.items);
  const { data: renewals } = useApi(getRenewalReminders, [], { poll: 5 * 60000 });
  const due = renewals?.items || [];

  useEffect(() => { document.title = 'Admin · ProXinet'; }, []);
  useEffect(() => { document.querySelector('#admin-main')?.scrollTo(0, 0); }, [pathname]);

  const counts = unread?.counts || {};
  const items = unread?.items || [];

  const bell = (
    <div className="w-[320px] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lift dark:border-white/10 dark:bg-ink-800">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-white/10">
        <span className="text-[13px] font-semibold text-slate-900 dark:text-white">Unread ({unread?.total ?? 0})</span>
      </div>
      {due.length > 0 && (
        <div className="border-b border-slate-200 bg-orange-50/60 dark:border-white/10 dark:bg-orange-500/[0.06]">
          <button
            type="button" onClick={() => nav('/admin/renewals?view=due')}
            className="flex w-full cursor-pointer items-center justify-between border-0 bg-transparent px-3.5 pt-2.5 text-left text-[12px] font-semibold text-orange-700 dark:text-orange-300"
          >
            <span>Renewals due ({due.length})</span><span className="font-normal">View all</span>
          </button>
          <ul className="m-0 list-none p-0 pb-1.5">
            {due.slice(0, 5).map((r) => (
              <li key={r.id}>
                <button
                  type="button" onClick={() => nav(`/admin/renewals?view=due&id=${r.id}`)}
                  className="flex w-full cursor-pointer items-start gap-3 border-0 bg-transparent px-3.5 py-1.5 text-left hover:bg-orange-100/50 dark:hover:bg-white/5"
                >
                  <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-md bg-orange-100 text-[13px] text-orange-600 dark:bg-white/5"><SyncOutlined /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[12.5px] font-medium text-slate-800 dark:text-slate-100">{r.customer}</span>
                    <span className="block truncate text-[11.5px] text-slate-500">{r.description} · {daysText(r.daysLeft)}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      {items.length === 0 ? (due.length > 0 ? null : (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="You're all caught up" className="!py-6" />
      )) : (
        <ul className="m-0 max-h-[360px] list-none overflow-y-auto p-0">
          {items.slice(0, 15).map((r) => {
            const cfg = collections[r.col];
            return (
              <li key={r.id}>
                <button
                  type="button" onClick={() => nav(`${cfg.path}?id=${r.id}`)}
                  className="flex w-full cursor-pointer items-start gap-3 border-0 border-b border-slate-100 bg-transparent px-3.5 py-2.5 text-left hover:bg-slate-50 dark:border-white/5 dark:hover:bg-white/5"
                >
                  <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-md bg-brand-50 text-[13px] text-brand-500 dark:bg-white/5">{cfg.icon}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[12.5px] font-medium text-slate-800 dark:text-slate-100">{cfg.primary(r)}</span>
                    <span className="block truncate text-[11.5px] text-slate-500">New {cfg.singular} · {timeAgo(r.createdAt)}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-[#0a1520]">
      <aside className={`hidden shrink-0 border-e border-slate-200 bg-white transition-[width] duration-200 dark:border-white/10 dark:bg-[#101d2b] lg:block ${collapsed ? 'w-[60px]' : 'w-56'}`}>
        <SideNav collapsed={collapsed} counts={counts} renewalsDue={due.length} />
      </aside>

      <Drawer placement="left" open={mobileOpen} onClose={() => setMobileOpen(false)} width={236} closable={false} styles={{ body: { padding: 0 } }}>
        <SideNav counts={counts} renewalsDue={due.length} onNavigate={() => setMobileOpen(false)} />
      </Drawer>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-slate-200 bg-white px-4 dark:border-white/10 dark:bg-[#101d2b] sm:px-6">
          <Button type="text" className="lg:!hidden" icon={<MenuUnfoldOutlined />} onClick={() => setMobileOpen(true)} aria-label="Open menu" />
          <Button
            type="text" className="!hidden lg:!inline-flex" aria-label="Collapse sidebar"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />} onClick={() => setCollapsed((c) => !c)}
          />
          <span className="hidden rounded-md bg-brand-50 px-2 py-0.5 text-[11px] font-semibold text-brand-600 dark:bg-brand-500/15 dark:text-brand-300 sm:inline">
            Admin panel
          </span>

          <div className="ms-auto flex items-center gap-1 sm:gap-2">
            <Link to="/" target="_blank">
              <Button type="text" icon={<GlobalOutlined />}><span className="hidden sm:inline">View website</span></Button>
            </Link>
            <Button type="text" aria-label="Toggle theme" icon={dark ? <SunOutlined /> : <MoonOutlined />} onClick={toggle} />
            <Dropdown dropdownRender={() => bell} trigger={['click']} placement="bottomRight">
              <Badge count={(unread?.total || 0) + due.length} size="small" offset={[-4, 4]}>
                <Button type="text" aria-label="Notifications" icon={<BellOutlined />} />
              </Badge>
            </Dropdown>
            <Dropdown
              trigger={['click']} placement="bottomRight"
              menu={{
                items: [
                  { key: 'settings', icon: <SettingOutlined />, label: 'Settings' },
                  { type: 'divider' },
                  { key: 'logout', icon: <LogoutOutlined />, label: 'Log out', danger: true },
                ],
                onClick: ({ key }) => {
                  if (key === 'settings') nav('/admin/settings');
                  if (key === 'logout') { logout(); nav('/admin/login', { replace: true }); }
                },
              }}
            >
              <button type="button" className="flex cursor-pointer items-center gap-2 rounded-lg border-0 bg-transparent px-2 py-1 hover:bg-slate-100 dark:hover:bg-white/5">
                <Avatar size={28} className="!bg-brand-500 !text-[12px]">{(session?.name || 'A').charAt(0).toUpperCase()}</Avatar>
                <span className="hidden text-start leading-tight md:block">
                  <span className="block text-[12.5px] font-medium text-slate-800 dark:text-slate-100">{session?.name || 'Admin'}</span>
                  <span className="block text-[11px] text-slate-500">{session?.email}</span>
                </span>
              </button>
            </Dropdown>
          </div>
        </header>

        <main id="admin-main" className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-5">
          <Outlet />
        </main>
        <RenewalReminderModal data={renewals} />
      </div>
    </div>
  );
}
