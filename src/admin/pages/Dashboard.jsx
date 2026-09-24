import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Alert, Button, Empty, Skeleton, Tag } from 'antd';
import {
  InboxOutlined, UserAddOutlined, CalendarOutlined, CustomerServiceOutlined,
  TrophyOutlined, ArrowRightOutlined, ThunderboltOutlined, SyncOutlined,
} from '@ant-design/icons';
import { useApi, getStats, getRenewalReminders } from '../api/store';
import { fmtYmd, daysText } from '../renewals/shared';
import { collections, collectionKeys } from '../config/collections';
import { ColumnChart, BarList } from '../components/Charts';
import Panel, { PageHeader, cardCls } from '../components/Panel';
import StatusTag from '../components/StatusTag';
import { timeAgo } from '../utils';

function Kpi({ icon, label, value, sub, to }) {
  const body = (
    <div className={`${cardCls} h-full p-3.5 transition-shadow hover:shadow-soft`}>
      <div className="flex items-start justify-between gap-3">
        <p className="m-0 text-[12px] font-medium text-slate-500">{label}</p>
        <span className="grid h-7 w-7 place-items-center rounded-md bg-brand-50 text-[13px] text-brand-500 dark:bg-white/5">{icon}</span>
      </div>
      <p className="m-0 mt-1.5 text-[22px] font-semibold leading-none tabular-nums text-slate-900 dark:text-white">{value}</p>
      <p className="m-0 mt-1.5 text-[11.5px] text-slate-400">{sub}</p>
    </div>
  );
  return to ? <Link to={to} className="block h-full">{body}</Link> : body;
}

const localDate = (ymd) => new Date(`${ymd}T12:00:00`);

export default function Dashboard() {
  const nav = useNavigate();
  const { data: stats, loading, error, reload } = useApi(getStats, [], { poll: 30000 });
  const { data: renewals } = useApi(getRenewalReminders, []);

  const s = useMemo(() => {
    if (!stats) return null;
    return {
      ...stats,
      days: stats.days.map((d) => ({
        ...d,
        label: localDate(d.key).toLocaleDateString('en-IN', { day: 'numeric' }),
        full: localDate(d.key).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }),
      })),
      byForm: collectionKeys
        .map((k) => ({ key: k, label: collections[k].title, icon: collections[k].icon, value: stats.byForm[k]?.total || 0 }))
        .sort((a, b) => b.value - a.value),
      pipeline: stats.pipeline.map((p) => ({ ...p, label: p.key })),
    };
  }, [stats]);

  return (
    <>
      <PageHeader
        title="Dashboard"
        sub={s ? `Every form on the website feeds this panel · ${s.total} records in total` : 'Loading live data…'}
        extra={<Link to="/admin/leads"><Button type="primary" icon={<InboxOutlined />}>Open inbox</Button></Link>}
      />

      {error && <Alert className="!mb-3" type="error" showIcon message="Could not load the dashboard" description={error.message} action={<Button size="small" onClick={reload}>Retry</Button>} />}

      {loading && !s ? (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {[0, 1, 2, 3, 4].map((i) => <div key={i} className={`${cardCls} p-3.5`}><Skeleton active paragraph={{ rows: 1 }} title={{ width: '50%' }} /></div>)}
          </div>
          <div className={`${cardCls} p-4`}><Skeleton active paragraph={{ rows: 6 }} /></div>
        </div>
      ) : s && (
        <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <Kpi icon={<ThunderboltOutlined />} label="Requests today" value={s.today} sub={`${s.week} in the last 7 days`} />
            <Kpi icon={<InboxOutlined />} label="Unread" value={s.unread} sub="across all forms" />
            <Kpi icon={<UserAddOutlined />} label="Open leads" value={s.openLeads} sub={`${s.newLeads} not contacted yet`} to="/admin/leads" />
            <Kpi icon={<CalendarOutlined />} label="Upcoming assessments" value={s.upcoming.length} sub="requested or confirmed" to="/admin/assessments" />
            <Kpi icon={<CustomerServiceOutlined />} label="Open tickets" value={s.openTickets} sub={`${s.p1} at P1 priority`} to="/admin/tickets" />
          </div>

          <div className="mt-4 grid gap-4 xl:grid-cols-3">
            <Panel className="min-w-0 xl:col-span-2" title="Submissions — last 14 days">
              <ColumnChart data={s.days} height={250} />
            </Panel>
            <Panel title="By form">
              <BarList items={s.byForm} onClick={(it) => nav(collections[it.key].path)} />
            </Panel>
          </div>

          <div className="mt-4 grid gap-4 xl:grid-cols-3">
            <Panel
              className="min-w-0 xl:col-span-2" title="Recent activity"
              extra={<span className="text-[12px] text-slate-400">Refreshes every 30 s</span>} bodyClass="p-0"
            >
              {s.recent.length === 0 ? <Empty className="!py-10" description="No submissions yet" /> : (
                <ul className="m-0 list-none p-0">
                  {s.recent.map((r) => {
                    const cfg = collections[r.col];
                    return (
                      <li key={`${r.col}-${r.id}`}>
                        <Link to={`${cfg.path}?id=${r.id}`} className="flex items-center gap-3 border-b border-slate-100 px-4 py-2.5 last:border-0 hover:bg-slate-50 dark:border-white/5 dark:hover:bg-white/[0.03]">
                          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-brand-50 text-[13px] text-brand-500 dark:bg-white/5">{cfg.icon}</span>
                          <span className="min-w-0 flex-1">
                            <span className={`block truncate text-[13px] ${r.read ? 'font-medium text-slate-700 dark:text-slate-200' : 'font-semibold text-slate-900 dark:text-white'}`}>
                              {cfg.primary(r)}
                            </span>
                            <span className="block truncate text-[11.5px] text-slate-500">{cfg.title} · {cfg.secondary(r)}</span>
                          </span>
                          <span className="hidden sm:block"><StatusTag color={cfg.statuses[r.status]}>{r.status}</StatusTag></span>
                          <span className="w-16 shrink-0 text-right text-[11.5px] text-slate-400">{timeAgo(r.createdAt)}</span>
                          {!r.read && <span className="h-2 w-2 shrink-0 rounded-full bg-brand-500" />}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Panel>

            <div className="min-w-0 space-y-4">
              <Panel
                title={`Renewals due${renewals?.items?.length ? ` (${renewals.items.length})` : ''}`}
                extra={<Link to="/admin/renewals" className="text-[12.5px] text-brand-600">All renewals <ArrowRightOutlined className="text-[10px]" /></Link>}
              >
                {!renewals?.items?.length ? <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={`No plan ends in the next ${renewals?.remindDays || 5} days`} /> : (
                  <ul className="m-0 list-none space-y-2.5 p-0">
                    {renewals.items.slice(0, 5).map((r) => (
                      <li key={r.id}>
                        <Link to={`/admin/renewals?view=due&id=${r.id}`} className="flex items-center gap-3">
                          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-orange-50 text-orange-600 dark:bg-white/5"><SyncOutlined /></span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[13px] font-medium text-slate-800 dark:text-slate-100">{r.customer}</span>
                            <span className="block truncate text-[11.5px] text-slate-500">{r.description} · ends {fmtYmd(r.endDate)}</span>
                          </span>
                          <Tag color={r.daysLeft < 0 ? 'red' : 'volcano'} className="!m-0">{daysText(r.daysLeft)}</Tag>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </Panel>

              <Panel title="Lead pipeline" extra={<span className="flex items-center gap-1.5 text-[12px] text-slate-500"><TrophyOutlined /> {s.winRate}% win rate</span>}>
                <BarList items={s.pipeline} onClick={() => nav('/admin/leads')} />
              </Panel>

              <Panel title="Upcoming assessments" extra={<Link to="/admin/assessments" className="text-[12.5px] text-brand-600">View all <ArrowRightOutlined className="text-[10px]" /></Link>}>
                {s.upcoming.length === 0 ? <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Nothing scheduled" /> : (
                  <ul className="m-0 list-none space-y-2.5 p-0">
                    {s.upcoming.slice(0, 4).map((a) => (
                      <li key={a.id}>
                        <Link to={`/admin/assessments?id=${a.id}`} className="flex items-center gap-3">
                          <span className="grid w-10 shrink-0 place-items-center rounded-md border border-slate-200 py-0.5 text-center dark:border-white/10">
                            <span className="text-[15px] font-semibold leading-tight text-brand-600 dark:text-brand-300">{localDate(a.date).getDate()}</span>
                            <span className="font-mono text-[9.5px] uppercase text-slate-400">{localDate(a.date).toLocaleDateString('en-IN', { month: 'short' })}</span>
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[13px] font-medium text-slate-800 dark:text-slate-100">{a.company}</span>
                            <span className="block truncate text-[11.5px] text-slate-500">{a.time} · {a.focus} · <span className="capitalize">{a.mode}</span></span>
                          </span>
                          <Tag color={collections.assessments.statuses[a.status]} className="!m-0">{a.status}</Tag>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </Panel>
            </div>
          </div>
        </>
      )}
    </>
  );
}
