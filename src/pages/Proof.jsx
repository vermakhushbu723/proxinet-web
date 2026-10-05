import React, { useState } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { Button, Segmented, Alert } from 'antd';
import { StarFilled } from '@ant-design/icons';
import { caseStudies, findCase, testimonials } from '../data/proof';
import { clients, clientSectors } from '../data/clients';
import { industries } from '../data/industries';
import { Reveal, Stagger, StaggerItem } from '../components/ui';
import { PageHero, CTABand, TickList, InfoCard } from '../components/blocks';
import { caseImg } from '../data/images';
import AllianceModal from '../components/AllianceModal';
import { alliances } from '../data/alliances';

const sampleNote = (
  <Alert
    type="info" showIcon className="!mb-8"
    message="Representative content"
    description="The client names and figures below are samples. Replace them with real client details, with written permission, before go-live."
  />
);

/* =================== CLIENTS =================== */
export function Clients() {
  const [filter, setFilter] = useState('All');
  const list = filter === 'All' ? clients : clients.filter((c) => c.sector === filter);

  return (
    <>
      <PageHero
        eyebrow="Client" title="Our prestigious clients"
        sub="Proxinet as a team is keen on working with your esteemed organization to collaborate in adding value to existing IT Infrastructure."
        crumbs={[{ label: 'Clients' }]}
      />

      <section className="px-container px-section">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="px-eyebrow"><span className="inline-block h-px w-6 bg-brand-400" />Trusted by</p>
            <h2 className="mt-2 font-display text-[1.6rem] font-bold text-slate-900 dark:text-white">{clients.length} organisations we serve</h2>
          </div>
        </div>

        <div className="mb-8 mt-6 overflow-x-auto pb-1">
          <Segmented options={['All', ...clientSectors]} value={filter} onChange={setFilter} />
        </div>

        <Stagger key={filter} className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4" gap={0.03}>
          {list.map((c) => (
            <StaggerItem key={c.name}>
              <div className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_12px_30px_rgba(15,23,42,0.10)] transition-all duration-300 hover:-translate-y-2 hover:border-brand-300 hover:shadow-[0_22px_45px_rgba(15,23,42,0.18)] dark:border-white/10 dark:bg-ink-900 dark:hover:border-brand-500/40">
                <span className="flex h-28 items-center justify-center overflow-hidden rounded-xl border border-slate-100 bg-white p-2">
                  <img
                    src={c.logo} alt={c.name} loading="lazy"
                    className="max-h-24 max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                </span>
                <span className="mt-3 block px-1 font-display text-[15px] font-bold leading-snug text-slate-900 transition-colors group-hover:text-brand-600 dark:text-white dark:group-hover:text-brand-400">
                  {c.name}
                </span>
                <span className="mt-1 block px-1 pb-1 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">
                  {c.sector}
                </span>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <CTABand />
    </>
  );
}

/* =================== CASE STUDIES =================== */
export function CaseStudies() {
  const [filter, setFilter] = useState('all');
  const list = filter === 'all' ? caseStudies : caseStudies.filter((c) => c.industry === filter);
  const options = [
    { label: 'All', value: 'all' },
    ...industries.filter((i) => caseStudies.some((c) => c.industry === i.slug)).map((i) => ({ label: i.name, value: i.slug })),
  ];

  return (
    <>
      <PageHero
        eyebrow="Case studies" title="What we built, and what it delivered"
        sub="Challenge, solution and measurable outcome — every time."
        crumbs={[{ label: 'Case Studies' }]}
      />
      <section className="px-container px-section">
        {sampleNote}
        <div className="mb-8 overflow-x-auto pb-1">
          <Segmented options={options} value={filter} onChange={setFilter} />
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {list.map((c) => <CaseCard key={c.slug} c={c} />)}
        </div>
      </section>
      <CTABand />
    </>
  );
}

export function CaseStudyDetail() {
  const { slug } = useParams();
  const c = findCase(slug);
  if (!c) return <Navigate to="/case-studies" replace />;
  const ind = industries.find((i) => i.slug === c.industry);

  return (
    <>
      <PageHero
        eyebrow={ind?.name || 'Case study'} title={c.title} sub={c.size}
        crumbs={[{ label: 'Case Studies', to: '/case-studies' }, { label: c.client }]}
      />

      {/* metrics strip */}
      <section className="border-b border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-ink-800">
        <div className="px-container grid gap-px divide-slate-200 py-8 sm:grid-cols-3 sm:divide-x dark:divide-white/10">
          {c.metrics.map((m, i) => (
            <Reveal key={m.label} delay={i * 0.08} className="px-4 py-2 text-center">
              <p className="font-display text-3xl font-bold text-brand-600 dark:text-brand-300">{m.value}</p>
              <p className="mt-1 text-[13.5px] text-slate-500 dark:text-slate-400">{m.label}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <div className="px-container grid gap-12 px-section lg:grid-cols-[1fr_300px]">
        <div className="min-w-0 space-y-10">
          <Reveal>
            <img src={caseImg(c.slug, 1400)} alt={c.title} className="aspect-[16/9] w-full rounded-3xl object-cover shadow-lift" />
          </Reveal>
          <Reveal>
            <h2 className="px-h3 text-slate-900 dark:text-white">Challenge</h2>
            <p className="px-lead mt-3">{c.challenge}</p>
          </Reveal>
          <Reveal>
            <h2 className="px-h3 text-slate-900 dark:text-white">Solution</h2>
            <p className="px-lead mt-3">{c.solution}</p>
          </Reveal>
          <Reveal>
            <h2 className="px-h3 text-slate-900 dark:text-white">Deployed stack</h2>
            <TickList items={c.stack} className="mt-4" />
          </Reveal>
          <Reveal>
            <h2 className="px-h3 text-slate-900 dark:text-white">Result</h2>
            <p className="px-lead mt-3">{c.result}</p>
          </Reveal>
          <Reveal>
            <blockquote className="rounded-2xl border-l-4 border-brand-500 bg-slate-50 p-6 dark:bg-white/[0.03]">
              <div className="mb-3 flex gap-1 text-amber-400">{[0, 1, 2, 3, 4].map((i) => <StarFilled key={i} />)}</div>
              <p className="font-display text-lg leading-relaxed text-slate-800 dark:text-slate-100">“{c.quote.text}”</p>
              <footer className="mt-4 text-[14px] text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-slate-700 dark:text-slate-200">{c.quote.by}</span> · {c.quote.role}
              </footer>
            </blockquote>
          </Reveal>
        </div>

        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <div className="px-card">
            <p className="font-mono text-[11px] uppercase tracking-wider text-slate-400">Project snapshot</p>
            <dl className="mt-4 space-y-3 text-[14px]">
              {[
                ['Client', c.client], ['Industry', ind?.name || c.industry], ['Size', c.size],
                ['Practice areas', c.tech.join(', ')],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="font-mono text-[10.5px] uppercase tracking-wider text-slate-400">{k}</dt>
                  <dd className="mt-0.5 font-medium capitalize text-slate-700 dark:text-slate-200">{String(v).replace(/-/g, ' ')}</dd>
                </div>
              ))}
            </dl>
            <Link to="/contact" className="mt-5 block">
              <Button type="primary" block size="large">Similar problem? Talk to us</Button>
            </Link>
          </div>
        </aside>
      </div>

      <CTABand />
    </>
  );
}

/* =================== PARTNERS =================== */
export function Partners() {
  const [alliance, setAlliance] = useState(null);

  return (
    <>
      <AllianceModal alliance={alliance} onClose={() => setAlliance(null)} />
      <PageHero
        eyebrow="Alliances" title="Technology Partners"
        sub="OEM alliances for trained engineers and better pricing."
        crumbs={[{ label: 'Partners' }]}
      />

      <section className="px-container px-section">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="px-eyebrow"><span className="inline-block h-px w-6 bg-brand-400" />Technology alliances</p>
            <h2 className="mt-2 font-display text-[1.6rem] font-bold text-slate-900 dark:text-white">{alliances.length} brands we deploy and support</h2>
          </div>
          <p className="text-[13px] text-slate-400">Click a logo for details</p>
        </div>

        <Stagger className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {alliances.map((a) => (
            <StaggerItem key={a.name}>
              <button
                type="button"
                onClick={() => setAlliance(a)}
                aria-label={`${a.name} details`}
                className="group flex h-full w-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 text-left shadow-[0_12px_30px_rgba(15,23,42,0.10)] transition-all duration-300 hover:-translate-y-2 hover:border-brand-300 hover:shadow-[0_22px_45px_rgba(15,23,42,0.18)] dark:border-white/10 dark:bg-ink-900 dark:hover:border-brand-500/40"
              >
                <span className="flex h-28 items-center justify-center rounded-xl border border-slate-100 bg-white p-4">
                  <img
                    src={a.logo} alt={a.name} loading="lazy"
                    className="max-h-20 max-w-full object-contain transition-transform duration-300 group-hover:scale-110"
                  />
                </span>
                <span className="mt-3 block px-1 font-display text-[16px] font-bold leading-snug text-slate-900 transition-colors group-hover:text-brand-600 dark:text-white dark:group-hover:text-brand-400">
                  {a.name}
                </span>
                <span className="mb-3 mt-1 block px-1 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">
                  {a.cat}
                </span>
                <span className="mt-auto flex items-center justify-between border-t border-slate-100 px-1 pt-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 transition-colors group-hover:text-brand-600 dark:border-white/10">
                  View details <span className="text-base transition-transform group-hover:translate-x-1">→</span>
                </span>
              </button>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <CTABand />
    </>
  );
}

/* =================== TESTIMONIALS =================== */
export function Testimonials() {
  return (
    <>
      <PageHero
        eyebrow="Client voices" title="Testimonials"
        sub="What our clients say about working with us."
        crumbs={[{ label: 'Testimonials' }]}
      />
      <section className="px-container px-section">
        {sampleNote}
        <Stagger className="grid gap-5 md:grid-cols-2">
          {testimonials.map((t) => (
            <StaggerItem key={t.by}>
              <blockquote className="px-card h-full">
                <div className="mb-3 flex gap-1 text-amber-400">{[0, 1, 2, 3, 4].map((i) => <StarFilled key={i} />)}</div>
                <p className="font-display text-[17px] leading-relaxed text-slate-800 dark:text-slate-100">“{t.text}”</p>
                <footer className="mt-4 flex items-center gap-3 border-t border-slate-100 pt-4 dark:border-white/10">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-brand-50 font-display font-bold text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
                    {t.by.split(' ').map((w) => w[0]).join('').slice(0, 2)}
                  </span>
                  <span>
                    <span className="block font-semibold text-slate-800 dark:text-slate-100">{t.by}</span>
                    <span className="text-[13px] text-slate-500 dark:text-slate-400">{t.role} · {t.industry}</span>
                  </span>
                </footer>
              </blockquote>
            </StaggerItem>
          ))}
        </Stagger>
      </section>
      <CTABand />
    </>
  );
}
