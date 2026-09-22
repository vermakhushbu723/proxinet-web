// Public service-status page. The client portal itself lives in src/portal/.
import React from 'react';
import { Tag, Timeline } from 'antd';
import { CheckCircleFilled, ClockCircleOutlined, WarningFilled } from '@ant-design/icons';
import { Reveal, SectionHead } from '../components/ui';
import { PageHero } from '../components/blocks';

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
