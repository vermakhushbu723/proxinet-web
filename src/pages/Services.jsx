import React from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { Button, Collapse, Tag, Table } from 'antd';
import { CheckCircleFilled, CloseOutlined, ArrowRightOutlined, CrownFilled } from '@ant-design/icons';
import { services, findService, slaPlans } from '../data/services';
import { Reveal, Stagger, StaggerItem, SectionHead, IconBadge } from '../components/ui';
import { PageHero, CTABand, TickList } from '../components/blocks';

/* =================== HUB =================== */
export function ServicesHub() {
  return (
    <>
      <PageHero
        eyebrow="Services"
        title="Not just supply — the whole lifecycle"
        sub="From consulting and design through deployment, 24/7 support and lifecycle management."
        crumbs={[{ label: 'Services' }]}
      >
        <Link to="/services/plans"><Button type="primary" size="large">Compare SLA plans</Button></Link>
      </PageHero>

      <section className="px-container px-section">
        <Stagger className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <StaggerItem key={s.slug}>
              <Link to={`/services/${s.slug}`} className="group block h-full">
                <div className="px-card px-card-hover flex h-full flex-col">
                  <h2 className="font-display text-[17px] font-semibold text-slate-900 group-hover:text-brand-600 dark:text-white dark:group-hover:text-brand-300">
                    {s.name}
                  </h2>
                  <p className="px-body mt-2 flex-1">{s.blurb}</p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-brand-600 dark:text-brand-300">
                    Details <ArrowRightOutlined className="text-[10px] transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      </section>
      <CTABand />
    </>
  );
}

/* =================== DETAIL =================== */
export function ServiceDetail() {
  const { slug } = useParams();
  const s = findService(slug);
  if (!s) return <Navigate to="/services" replace />;
  const others = services.filter((x) => x.slug !== slug).slice(0, 5);

  return (
    <>
      <PageHero
        eyebrow="Service" title={s.name} sub={s.hero}
        crumbs={[{ label: 'Services', to: '/services' }, { label: s.name }]}
      >
        <div className="flex flex-wrap gap-3">
          <Link to="/book-assessment"><Button type="primary" size="large">Book free assessment</Button></Link>
          <Link to="/services/plans"><Button size="large">See SLA plans</Button></Link>
        </div>
      </PageHero>

      <div className="px-container grid gap-12 px-section lg:grid-cols-[1fr_320px]">
        <div className="min-w-0">
          <Reveal>
            <p className="px-lead">{s.blurb}</p>
            <h2 className="px-h3 mt-10 text-slate-900 dark:text-white">What is included</h2>
            <TickList items={s.deliverables} className="mt-5" />
          </Reveal>

          <Reveal className="mt-12">
            <h2 className="px-h3 text-slate-900 dark:text-white">How to engage</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              {[
                { n: '1', t: 'Assessment', d: 'A free 30-minute review, or a full paid audit.' },
                { n: '2', t: 'Proposal', d: 'Scope, SLA and commercials — all in writing.' },
                { n: '3', t: 'Onboarding', d: 'Inventory, access and escalation matrix setup.' },
              ].map((x) => (
                <div key={x.n} className="rounded-2xl border border-slate-200 p-5 dark:border-white/10">
                  <span className="font-display text-2xl font-bold text-brand-200 dark:text-brand-500/40">{x.n}</span>
                  <p className="mt-1 font-display font-semibold text-slate-900 dark:text-white">{x.t}</p>
                  <p className="px-body mt-1.5">{x.d}</p>
                </div>
              ))}
            </div>
          </Reveal>

          {s.faqs?.length > 0 && (
            <Reveal className="mt-12">
              <h2 className="px-h3 text-slate-900 dark:text-white">FAQs</h2>
              <Collapse
                className="!mt-5" bordered={false} accordion
                items={s.faqs.map((q, i) => ({ key: i, label: <span className="font-medium">{q.q}</span>, children: <p className="px-body">{q.a}</p> }))}
              />
            </Reveal>
          )}
        </div>

        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <div className="px-card">
            <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-white">Talk to us about this service</h3>
            <p className="px-body mt-2">Speak directly to an engineer — 30 minutes, no obligation.</p>
            <Link to="/book-assessment" className="mt-4 block"><Button type="primary" block size="large">Book a call</Button></Link>
          </div>
          <div className="px-card mt-4">
            <p className="font-mono text-[11px] uppercase tracking-wider text-slate-400">Other services</p>
            <ul className="mt-3 space-y-2">
              {others.map((o) => (
                <li key={o.slug}>
                  <Link to={`/services/${o.slug}`} className="flex items-center gap-2 text-[14px] text-slate-600 hover:text-brand-600 dark:text-slate-300">
                    <span className="h-1 w-1 rounded-full bg-brand-400" /> {o.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>

      <CTABand />
    </>
  );
}

/* =================== SLA PLANS =================== */
export function SLAPlans() {
  const rows = slaPlans[0].features.map((f, idx) => ({
    key: idx,
    feature: f.k,
    bronze: slaPlans[0].features[idx].v,
    silver: slaPlans[1].features[idx].v,
    gold: slaPlans[2].features[idx].v,
  }));

  return (
    <>
      <PageHero
        eyebrow="Managed services"
        title="SLA & Support Plans"
        sub="Three tiers with transparent scope, defined response times and indicative pricing. The final quote follows the assessment."
        crumbs={[{ label: 'Services', to: '/services' }, { label: 'SLA Plans' }]}
      />

      {/* cards */}
      <section className="px-container px-section">
        <Stagger className="grid gap-5 lg:grid-cols-3">
          {slaPlans.map((p) => (
            <StaggerItem key={p.tier}>
              <div className={`relative flex h-full flex-col rounded-2xl border p-7 transition-all ${
                p.highlight
                  ? 'border-brand-500 bg-white shadow-glow dark:bg-white/[0.04]'
                  : 'border-slate-200 bg-white dark:border-white/10 dark:bg-white/[0.02]'
              }`}>
                {p.highlight && (
                  <span className="absolute -top-3 left-7 inline-flex items-center gap-1.5 rounded-full bg-brand-500 px-3 py-1 font-mono text-[10.5px] font-semibold uppercase tracking-wider text-white">
                    <CrownFilled /> {p.badge}
                  </span>
                )}
                {!p.highlight && (
                  <span className="font-mono text-[10.5px] uppercase tracking-wider text-slate-400">{p.badge}</span>
                )}
                <h2 className="mt-2 font-display text-2xl font-bold text-slate-900 dark:text-white">{p.tier}</h2>
                <p className="mt-3 font-display text-xl font-semibold text-brand-600 dark:text-brand-300">{p.price}</p>
                <p className="text-[13px] text-slate-500 dark:text-slate-400">{p.unit}</p>
                <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-[13px] text-slate-600 dark:bg-white/5 dark:text-slate-300">
                  Best for: {p.best}
                </p>
                <ul className="mt-5 flex-1 space-y-2.5 border-t border-slate-100 pt-5 dark:border-white/10">
                  {p.features.map((f) => (
                    <li key={f.k} className="flex items-start justify-between gap-3 text-[13.5px]">
                      <span className="text-slate-500 dark:text-slate-400">{f.k}</span>
                      <span className={`text-right font-medium ${f.v === '—' ? 'text-slate-300 dark:text-slate-600' : 'text-slate-800 dark:text-slate-100'}`}>
                        {f.v}
                      </span>
                    </li>
                  ))}
                </ul>
                <Link to="/book-assessment" className="mt-6 block">
                  <Button type={p.highlight ? 'primary' : 'default'} block size="large">Get a quote</Button>
                </Link>
              </div>
            </StaggerItem>
          ))}
        </Stagger>

        <p className="mt-6 text-center text-[13px] text-slate-400">
          Prices are indicative — the actual quote is built on endpoints, sites and coverage.
        </p>
      </section>

      {/* comparison table */}
      <section className="border-t border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-ink-800">
        <div className="px-container px-section">
          <SectionHead eyebrow="Side by side" title="Full comparison" />
          <Reveal className="mt-8 overflow-x-auto">
            <Table
              pagination={false} size="middle" dataSource={rows}
              columns={[
                { title: 'Feature', dataIndex: 'feature', fixed: 'left', width: 180, render: (t) => <span className="font-medium">{t}</span> },
                { title: 'Bronze', dataIndex: 'bronze' },
                { title: <span className="text-brand-600">Silver</span>, dataIndex: 'silver' },
                { title: 'Gold', dataIndex: 'gold' },
              ]}
              scroll={{ x: 700 }}
            />
          </Reveal>
        </div>
      </section>

      <CTABand
        title="Not sure which plan fits?"
        sub="The AMC Plan Selector asks five questions and gives you a recommendation in under a minute."
        primary={{ label: 'Run AMC Plan Selector', to: '/tools/amc-plan-selector' }}
      />
    </>
  );
}
