import React from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { Button, Collapse } from 'antd';
import { CrownFilled } from '@ant-design/icons';
import { services, findService, slaPlans } from '../data/services';
import { Reveal, Stagger, StaggerItem } from '../components/ui';
import { PageHero, CTABand, InfoCard, SplitFeature } from '../components/blocks';
import { serviceImg } from '../data/images';

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
        eyebrow="Service" title={s.name} sub={s.hero}
        crumbs={[{ label: 'Services', to: '/services' }, { label: s.name }]}
      />

      <div className="px-container px-section">
        <div className="min-w-0">
          <SplitFeature
            image={serviceImg(s.slug, 800)} alt={s.name}
            eyebrow="Service" title="What is included" intro={s.blurb}
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
