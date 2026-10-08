import React from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { Button, Collapse } from 'antd';
import { CrownFilled } from '@ant-design/icons';
import { services, findService, slaPlans } from '../data/services';
import { Reveal, Stagger, StaggerItem } from '../components/ui';
import { PageHero, CTABand, InfoCard, SplitFeature } from '../components/blocks';
import { serviceImg } from '../data/images';
import liveContent from '../data/liveContent.json';

/* Content from proxinet.in/services */
const liveBlocks = [
  {
    title: 'Project Management',
    groups: [
      { h: 'We plan every project around', items: ['Scope – size, goals, requirements', 'Resources – staff, equipment, material', 'Time – start and end, task durations, dependencies', 'Money – costs, contingencies and profit'] },
      { h: 'So that we', items: ['Improve productivity and quality of work', 'Encourage consistent communication amongst staff, suppliers and clients', 'Satisfy the needs of the project’s stakeholders', 'Mitigate the risk of a project failing', 'Increase customer satisfaction'] },
    ],
  },
  {
    title: 'Support & Services',
    groups: [
      { h: 'Governance', items: ['Service Level Agreement based delivery model', '24×7 support available', 'Standardised & established processes to meet changes & escalations'] },
      { h: 'Resource Pool', items: ['Capable pool of technical resources', 'ITIL 4 based service management', 'Experience of service delivery with enterprise customers'] },
      { h: 'Knowledge Management', items: ['Client-specific knowledge repository', 'Up-to-date knowledge base and documented runbooks', 'Plans for redundancy'] },
      { h: 'Information Security', items: ['Customer data confidentiality', 'Regulatory compliance, including the DPDP Act 2023', 'Support for perimeter, endpoint, identity and cloud security'] },
    ],
  },
];

/* =================== HUB =================== */
export function ServicesHub() {
  return (
    <>
      <PageHero
        eyebrow="Services"
        title="Not just supply — the whole lifecycle"
        sub="Consulting, deployment, 24/7 support and lifecycle care."
        crumbs={[{ label: 'Services' }]}
      />

      {/* From proxinet.in/services */}
      <section className="px-container pt-16 sm:pt-20">
        <div className="grid gap-6 lg:grid-cols-2">
          {liveBlocks.map((b) => (
            <Reveal key={b.title}>
              <div className="h-full rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.10)] sm:p-8 dark:border-white/10 dark:bg-ink-900">
                <h2 className="font-display text-[1.45rem] font-extrabold tracking-tight text-slate-900 dark:text-white">{b.title}</h2>
                <div className="mt-5 space-y-4">
                  {b.groups.map((g) => (
                    <div key={g.h}>
                      {g.h && <p className="font-display text-[15px] font-bold text-slate-800 dark:text-slate-100">{g.h}</p>}
                      <ul className="mt-1.5 list-disc space-y-1 pl-5 marker:text-brand-500">
                        {g.items.map((it) => (
                          <li key={it} className="text-[14px] leading-relaxed text-slate-600 dark:text-slate-300">{it}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="px-container px-section">
        <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <StaggerItem key={s.slug}>
              <InfoCard
                to={`/services/${s.slug}`} image={serviceImg(s.slug, 800)} as="h2"
                title={s.name} meta="Managed service" text={s.blurb} cta="View service"
              />
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

  return (
    <>
      <PageHero
        title={s.name} sub={liveContent[`svc:${s.slug}`] ? null : s.hero}
        crumbs={[{ label: 'Services', to: '/services' }, { label: s.name }]}
      />

      <div className="px-container px-section">
        <div className="min-w-0">
          <SplitFeature
            image={serviceImg(s.slug, 800)} alt={s.name}
            title={liveContent[`svc:${s.slug}`]?.blocks[0]?.h || 'What is included'} intro={s.blurb}
            blocks={liveContent[`svc:${s.slug}`]?.blocks}
            points={s.deliverables}
          />

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
      </div>

      <CTABand />
    </>
  );
}

/* =================== SLA PLANS =================== */
export function SLAPlans() {
  return (
    <>
      <PageHero
        eyebrow="Managed services"
        title="SLA & Support Plans"
        sub="Three clear tiers — defined scope, response times and pricing."
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
                <Link to="/contact" className="mt-6 block">
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

      <CTABand title="Not sure which plan fits?" sub="Tell us your endpoints and sites — we will recommend the right plan." />
    </>
  );
}
