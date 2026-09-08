import React from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { Button, Tag } from 'antd';
import { ArrowRightOutlined, SafetyCertificateOutlined, WarningOutlined } from '@ant-design/icons';
import { industries, findIndustry } from '../data/industries';
import { solutionFamilies, findFamily } from '../data/solutions';
import { caseStudies } from '../data/proof';
import { Reveal, Stagger, StaggerItem, SectionHead } from '../components/ui';
import { PageHero, CTABand } from '../components/blocks';

export function IndustriesHub() {
  return (
    <>
      <PageHero
        eyebrow="Industries"
        title="Every industry has its own uptime and compliance reality"
        sub="In manufacturing, downtime is production loss; in BFSI, the audit trail is a regulatory obligation. The approach differs."
        crumbs={[{ label: 'Industries' }]}
      />
      <section className="px-container px-section">
        <Stagger className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {industries.map((i) => (
            <StaggerItem key={i.slug}>
              <Link to={`/industries/${i.slug}`} className="group block h-full">
                <div className="px-card px-card-hover flex h-full flex-col">
                  <h2 className="font-display text-[17px] font-semibold text-slate-900 group-hover:text-brand-600 dark:text-white dark:group-hover:text-brand-300">
                    {i.name}
                  </h2>
                  <p className="px-body mt-2 flex-1">{i.blurb}</p>
                  <div className="mt-4 flex flex-wrap gap-1.5 border-t border-slate-100 pt-4 dark:border-white/10">
                    {i.compliance.slice(0, 2).map((c) => (
                      <span key={c} className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[10.5px] uppercase tracking-wider text-slate-500 dark:bg-white/5 dark:text-slate-400">
                        {c}
                      </span>
                    ))}
                  </div>
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

export function IndustryDetail() {
  const { slug } = useParams();
  const ind = findIndustry(slug);
  if (!ind) return <Navigate to="/industries" replace />;

  const fits = ind.fits.map(findFamily).filter(Boolean);
  const cases = caseStudies.filter((c) => c.industry === slug);

  return (
    <>
      <PageHero
        eyebrow="Industry" title={`IT infrastructure for ${ind.name}`} sub={ind.blurb}
        crumbs={[{ label: 'Industries', to: '/industries' }, { label: ind.name }]}
      >
        <Link to="/book-assessment"><Button type="primary" size="large">Book industry-specific assessment</Button></Link>
      </PageHero>

      {/* challenges */}
      <section className="px-container px-section">
        <SectionHead eyebrow="Reality check" title={`Typical IT challenges in ${ind.name}`} />
        <Stagger className="mt-8 grid gap-4 md:grid-cols-3">
          {ind.challenges.map((c) => (
            <StaggerItem key={c}>
              <div className="h-full rounded-2xl border border-amber-200 bg-amber-50/60 p-5 dark:border-amber-500/25 dark:bg-amber-500/5">
                <WarningOutlined className="text-lg text-amber-500" />
                <p className="mt-2.5 text-[15px] font-medium text-slate-700 dark:text-slate-200">{c}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* compliance */}
      <section className="border-y border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-ink-800">
        <div className="px-container px-section">
          <div className="grid gap-10 lg:grid-cols-2">
            <Reveal>
              <SectionHead eyebrow="Compliance" title="Which frameworks apply" />
              <ul className="mt-6 space-y-3">
                {ind.compliance.map((c) => (
                  <li key={c} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-white/10 dark:bg-white/[0.03]">
                    <SafetyCertificateOutlined className="text-lg text-brand-500" />
                    <span className="font-medium text-slate-800 dark:text-slate-100">{c}</span>
                  </li>
                ))}
              </ul>
              <p className="px-body mt-5">
                We translate these requirements into infrastructure controls — access policies, logging,
                retention and documented evidence — so the paperwork is ready when the audit arrives.
              </p>
            </Reveal>

            <Reveal delay={0.1}>
              <SectionHead eyebrow="Best fit" title="Recommended solutions" />
              <div className="mt-6 space-y-3">
                {fits.map((f) => (
                  <Link key={f.slug} to={`/solutions/${f.slug}`} className="group block">
                    <div className="px-card px-card-hover flex items-center justify-between gap-4 !p-5">
                      <div className="min-w-0">
                        <h3 className="font-display text-[16px] font-semibold text-slate-900 group-hover:text-brand-600 dark:text-white">{f.name}</h3>
                        <p className="px-body mt-1 line-clamp-2">{f.blurb}</p>
                      </div>
                      <ArrowRightOutlined className="shrink-0 text-slate-400 transition-transform group-hover:translate-x-1" />
                    </div>
                  </Link>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* case studies */}
      {cases.length > 0 && (
        <section className="px-container px-section">
          <SectionHead eyebrow="Proof" title={`${ind.name} case studies`} />
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {cases.map((c) => (
              <Reveal key={c.slug}>
                <Link to={`/case-studies/${c.slug}`} className="group block h-full">
                  <div className="px-card px-card-hover h-full">
                    <Tag color="red">{ind.name}</Tag>
                    <h3 className="mt-3 font-display text-lg font-semibold text-slate-900 group-hover:text-brand-600 dark:text-white">{c.title}</h3>
                    <p className="px-body mt-2">{c.result}</p>
                    <div className="mt-5 flex gap-6 border-t border-slate-100 pt-4 dark:border-white/10">
                      {c.metrics.map((m) => (
                        <div key={m.label}>
                          <p className="font-display text-xl font-bold text-brand-600 dark:text-brand-300">{m.value}</p>
                          <p className="text-[12px] text-slate-500">{m.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      <CTABand
        title={`A focused assessment for ${ind.name}`}
        sub="Built around your industry's compliance and uptime requirements — 30 minutes, with a written summary."
      />
    </>
  );
}
