import React, { useState } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { Button, Tag, Segmented, Empty, Alert } from 'antd';
import { StarFilled, SafetyCertificateOutlined, CheckCircleFilled, DownloadOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { caseStudies, findCase, clientLogos, partners, testimonials, certifications } from '../data/proof';
import { industries } from '../data/industries';
import { Reveal, Stagger, StaggerItem, SectionHead, Counter } from '../components/ui';
import { PageHero, CTABand, TickList } from '../components/blocks';

const sampleNote = (
  <Alert
    type="info" showIcon className="!mb-8"
    message="Representative content"
    description="The client names and figures below are samples. Replace them with real client details, with written permission, before go-live."
  />
);

/* =================== CLIENTS =================== */
export function Clients() {
  const [filter, setFilter] = useState('all');
  const list = filter === 'all' ? clientLogos : clientLogos.filter((c) => c.industry === filter);
  const options = [
    { label: 'All', value: 'all' },
    ...industries.filter((i) => clientLogos.some((c) => c.industry === i.slug)).map((i) => ({ label: i.name, value: i.slug })),
  ];

  return (
    <>
      <PageHero
        eyebrow="Trusted by" title="Our prestigious clients"
        sub="Over 200 organisations across manufacturing, BFSI, pharma, education, retail, legal and hospitality."
        crumbs={[{ label: 'Clients' }]}
      />

      <section className="px-container px-section">
        {sampleNote}
        <div className="mb-8 overflow-x-auto pb-1">
          <Segmented options={options} value={filter} onChange={setFilter} />
        </div>
        {list.length === 0 ? (
          <Empty description="No logos added for this industry yet" />
        ) : (
          <Stagger className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4" gap={0.04}>
            {list.map((c) => (
              <StaggerItem key={c.name}>
                <div className="flex h-24 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-center transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-soft dark:border-white/10 dark:bg-white/[0.03]">
                  <span className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">{c.name}</span>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        )}
      </section>

      <section className="border-y border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-ink-800">
        <div className="px-container px-section">
          <SectionHead eyebrow="Proof" title="Case studies" sub="Every story covers the challenge, the solution and a measurable result." />
          <div className="mt-9 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {caseStudies.slice(0, 3).map((c) => <CaseCard key={c.slug} c={c} />)}
          </div>
          <div className="mt-8 text-center">
            <Link to="/case-studies"><Button size="large">All case studies <ArrowRightOutlined /></Button></Link>
          </div>
        </div>
      </section>

      <CTABand />
    </>
  );
}

function CaseCard({ c }) {
  const ind = industries.find((i) => i.slug === c.industry);
  return (
    <Reveal>
      <Link to={`/case-studies/${c.slug}`} className="group block h-full">
        <article className="px-card px-card-hover flex h-full flex-col">
          <Tag color="red" className="!mb-3 self-start">{ind?.name || c.industry}</Tag>
          <h3 className="font-display text-[17px] font-semibold leading-snug text-slate-900 group-hover:text-brand-600 dark:text-white dark:group-hover:text-brand-300">
            {c.title}
          </h3>
          <p className="px-body mt-2.5 flex-1">{c.challenge.slice(0, 140)}…</p>
          <div className="mt-5 border-t border-slate-100 pt-4 dark:border-white/10">
            <p className="font-display text-2xl font-bold text-brand-600 dark:text-brand-300">{c.metric.value}</p>
            <p className="text-[12.5px] text-slate-500 dark:text-slate-400">{c.metric.label}</p>
          </div>
        </article>
      </Link>
    </Reveal>
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
        sub="Every case study follows the same format — challenge, solution architecture, deployed stack and measurable outcome."
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
  const more = caseStudies.filter((x) => x.slug !== slug).slice(0, 3);

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
            <Link to="/book-assessment" className="mt-5 block">
              <Button type="primary" block size="large">Similar problem? Talk to us</Button>
            </Link>
          </div>
        </aside>
      </div>

      <section className="border-t border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-ink-800">
        <div className="px-container px-section">
          <SectionHead eyebrow="More" title="Other case studies" />
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {more.map((m) => <CaseCard key={m.slug} c={m} />)}
          </div>
        </div>
      </section>

      <CTABand />
    </>
  );
}

/* =================== PARTNERS =================== */
export function Partners() {
  return (
    <>
      <PageHero
        eyebrow="Alliances" title="Partners & Certifications"
        sub="OEM partnerships and company credentials — everything procurement teams verify, in one place."
        crumbs={[{ label: 'Partners' }]}
      >
        <Link to="/procurement"><Button type="primary" size="large" icon={<DownloadOutlined />}>Get procurement pack</Button></Link>
      </PageHero>

      <section className="px-container px-section">
        <SectionHead eyebrow="OEM alliances" title="Technology partners" sub="A partner tier means trained engineers, direct escalation paths and better commercials." />
        <Stagger className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {partners.map((p) => (
            <StaggerItem key={p.name}>
              <div className="px-card px-card-hover h-full">
                <div className="flex items-center gap-3">
                  <span className="h-10 w-1.5 rounded-full" style={{ background: p.color }} aria-hidden="true" />
                  <div>
                    <h3 className="font-display text-[17px] font-semibold text-slate-900 dark:text-white">{p.name}</h3>
                    <p className="font-mono text-[10.5px] uppercase tracking-wider text-slate-400">{p.cat}</p>
                  </div>
                </div>
                <span className="mt-4 inline-block rounded-lg bg-brand-50 px-3 py-1 text-[12.5px] font-semibold text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">
                  {p.tier}
                </span>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
        <p className="mt-6 text-[13px] text-slate-400">
          Keep partner tiers updated against verification — status can change at every renewal.
        </p>
      </section>

      <section className="border-t border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-ink-800">
        <div className="px-container px-section">
          <SectionHead eyebrow="Credentials" title="Company certifications" />
          <Stagger className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {certifications.map((c) => (
              <StaggerItem key={c.name}>
                <div className="px-card h-full">
                  <SafetyCertificateOutlined className="text-2xl text-brand-500" />
                  <h3 className="mt-3 font-display text-[16px] font-semibold text-slate-900 dark:text-white">{c.name}</h3>
                  <p className="px-body mt-1">{c.desc}</p>
                  <Tag color="green" className="!mt-3">{c.status}</Tag>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <CTABand
        title="Need our vendor onboarding documents?"
        sub="Company profile, certificates, insurance, data protection policy and a sample SLA — in one pack."
        primary={{ label: 'Request procurement pack', to: '/procurement' }}
      />
    </>
  );
}

/* =================== TESTIMONIALS =================== */
export function Testimonials() {
  return (
    <>
      <PageHero
        eyebrow="Client voices" title="Testimonials"
        sub="With names, designations and companies — anonymous quotes carry no weight."
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
