import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Tag, Carousel } from 'antd';
import {
  ArrowRightOutlined, CloudOutlined, SafetyOutlined, DatabaseOutlined,
  CloudDownloadOutlined, WifiOutlined, TeamOutlined, VideoCameraOutlined,
  PlayCircleOutlined, StarFilled, CheckCircleFilled, ThunderboltFilled,
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { company, stats, painPoints, processSteps } from '../data/company';
import { solutionFamilies } from '../data/solutions';
import { industries } from '../data/industries';
import { caseStudies, testimonials, partners, clientLogos } from '../data/proof';
import { posts } from '../data/resources';
import { Reveal, Stagger, StaggerItem, Counter, SectionHead, ArrowLink, Glow, NetworkGraphic, IconBadge } from '../components/ui';
import { CTABand, LeadForm } from '../components/blocks';

const icons = {
  cloud: <CloudOutlined />, shield: <SafetyOutlined />, server: <DatabaseOutlined />,
  backup: <CloudDownloadOutlined />, wifi: <WifiOutlined />, team: <TeamOutlined />,
  camera: <VideoCameraOutlined />,
};

export default function Home() {
  return (
    <>
      {/* ── 1. HERO ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-white dark:border-white/10 dark:bg-ink-900">
        <div className="px-grid-bg absolute inset-0" aria-hidden="true" />
        <Glow className="-left-24 top-0" color="rgba(214,43,31,.30)" size={480} />
        <Glow className="right-0 top-40" color="rgba(232,118,63,.20)" size={380} />

        <div className="px-container relative grid items-center gap-10 pb-14 pt-6 lg:grid-cols-[1.15fr_1fr] lg:gap-12 lg:pb-20 lg:pt-8">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
              className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 py-1 pl-1 pr-3.5 dark:border-brand-500/30 dark:bg-brand-500/10"
            >
              <span className="rounded-full bg-brand-500 px-2.5 py-0.5 font-mono text-[10.5px] font-semibold uppercase tracking-wider text-white">
                24×7 NOC
              </span>
              <span className="text-[13px] font-medium text-brand-700 dark:text-brand-200">
                SLA-backed managed IT across Delhi NCR
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.06 }}
              className="px-h1 text-slate-900 dark:text-white"
            >
              Your IT infrastructure —{' '}
              <span className="px-gradient-text">designed, deployed and managed 24/7</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.14 }}
              className="px-lead mt-6 max-w-xl"
            >
              Cloud, cyber security, data center, backup and network — from a single partner.
              Operating out of Noida and New Delhi for 200+ clients, from manufacturing to BFSI.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.22 }}
              className="mt-8 flex flex-col gap-3 sm:flex-row"
            >
              <Link to="/book-assessment">
                <Button type="primary" size="large" className="!h-12 !px-7 !text-[15px]">
                  Get Free IT Assessment <ArrowRightOutlined />
                </Button>
              </Link>
              <Link to="/solutions">
                <Button size="large" className="!h-12 !px-7 !text-[15px]">Explore Solutions</Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-[13.5px] text-slate-500 dark:text-slate-400"
            >
              {['Vendor-neutral advice', 'Written assessment summary', 'No obligation'].map((t) => (
                <span key={t} className="flex items-center gap-1.5">
                  <CheckCircleFilled className="text-emerald-500" /> {t}
                </span>
              ))}
            </motion.div>
          </div>

          {/* live-looking infra panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.18 }}
            className="relative"
          >
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-lift dark:border-white/10 dark:bg-ink-800">
              <div className="mb-4 flex items-center justify-between">
                <span className="font-mono text-[11px] uppercase tracking-wider text-slate-400">
                  Managed infrastructure · live
                </span>
                <span className="flex items-center gap-1.5 text-[11.5px] font-semibold text-emerald-500">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                  </span>
                  All systems normal
                </span>
              </div>

              <NetworkGraphic className="mx-auto h-48 w-full max-w-[280px]" />

              <div className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-100 pt-4 dark:border-white/10">
                {[
                  { k: 'Uptime', v: '99.94%', tone: 'text-emerald-500' },
                  { k: 'Open P1', v: '0', tone: 'text-slate-800 dark:text-white' },
                  { k: 'Avg response', v: '11 min', tone: 'text-brand-500' },
                ].map((s) => (
                  <div key={s.k} className="text-center">
                    <p className={`font-display text-lg font-bold tabular-nums ${s.tone}`}>{s.v}</p>
                    <p className="font-mono text-[10px] uppercase tracking-wider text-slate-400">{s.k}</p>
                  </div>
                ))}
              </div>
            </div>
            <p className="mt-2.5 text-center text-[11.5px] text-slate-400">
              Example dashboard — clients get the live version inside the portal.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── 2. STATS BAR ────────────────────────────────────────── */}
      <section className="border-b border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-ink-800">
        <div className="px-container grid grid-cols-2 divide-slate-200 py-8 sm:grid-cols-3 lg:grid-cols-5 lg:divide-x dark:divide-white/10">
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.06} className="px-4 py-3 text-center">
              <p className="font-display text-3xl font-bold text-brand-600 dark:text-brand-300 sm:text-[2.1rem]">
                <Counter to={s.value} suffix={s.suffix} decimals={s.decimals || 0} />
              </p>
              <p className="mt-1 text-[13.5px] font-semibold text-slate-700 dark:text-slate-200">{s.label}</p>
              <p className="text-[12px] text-slate-400">{s.hint}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── 3. PARTNER MARQUEE ──────────────────────────────────── */}
      <section className="overflow-hidden border-b border-slate-200 py-8 dark:border-white/10">
        <p className="px-container mb-5 font-mono text-[11px] uppercase tracking-[0.16em] text-slate-400">
          Technology alliances
        </p>
        <div className="relative">
          <div className="px-marquee gap-3">
            {[...partners, ...partners].map((p, i) => (
              <div
                key={i}
                className="flex shrink-0 items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-5 py-3 dark:border-white/10 dark:bg-white/[0.03]"
              >
                <span className="h-2.5 w-2.5 rounded-sm" style={{ background: p.color }} aria-hidden="true" />
                <span className="whitespace-nowrap font-display text-[15px] font-semibold text-slate-700 dark:text-slate-200">
                  {p.name}
                </span>
                <span className="whitespace-nowrap font-mono text-[10px] uppercase tracking-wider text-slate-400">
                  {p.tier}
                </span>
              </div>
            ))}
          </div>
          <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-white dark:from-ink-900" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-white dark:from-ink-900" />
        </div>
      </section>

      {/* ── 4. PAIN POINTS ──────────────────────────────────────── */}
      <section className="px-container px-section">
        <SectionHead
          eyebrow="Start here"
          title="What is holding you back?"
          sub="Before the technology jargon — tell us what is stuck. Every tile links straight to the matching solution."
        />
        <Stagger className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {painPoints.map((p) => (
            <StaggerItem key={p.title}>
              <Link to={p.to} className="group block h-full">
                <div className="px-card px-card-hover h-full">
                  <IconBadge>{icons[p.icon]}</IconBadge>
                  <h3 className="mt-4 font-display text-[17px] font-semibold text-slate-900 dark:text-white">{p.title}</h3>
                  <p className="px-body mt-2">{p.desc}</p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-brand-600 dark:text-brand-300">
                    View solution
                    <ArrowRightOutlined className="text-[11px] transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* ── 5. SOLUTIONS GRID ───────────────────────────────────── */}
      <section className="border-y border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-ink-800">
        <div className="px-container px-section">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHead eyebrow="What we do" title="Solutions" sub="Seven practice areas under one accountable partner." />
            <ArrowLink to="/solutions">All solutions</ArrowLink>
          </div>
          <Stagger className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {solutionFamilies.map((f) => (
              <StaggerItem key={f.slug}>
                <Link to={`/solutions/${f.slug}`} className="group block h-full">
                  <div className="px-card px-card-hover flex h-full flex-col">
                    <div className="flex items-start justify-between gap-3">
                      <IconBadge size="lg">{icons[f.icon]}</IconBadge>
                      <span className="font-mono text-[10.5px] uppercase tracking-wider text-slate-400">
                        {f.children.length} services
                      </span>
                    </div>
                    <h3 className="mt-4 font-display text-lg font-semibold text-slate-900 dark:text-white">{f.name}</h3>
                    <p className="mt-1 font-mono text-[11px] uppercase tracking-wider text-brand-500">{f.tag}</p>
                    <p className="px-body mt-3 flex-1">{f.blurb}</p>
                    <ul className="mt-4 space-y-1.5 border-t border-slate-100 pt-4 dark:border-white/10">
                      {f.children.slice(0, 3).map((c) => (
                        <li key={c.slug} className="flex items-center gap-2 text-[13.5px] text-slate-500 dark:text-slate-400">
                          <span className="h-1 w-1 rounded-full bg-brand-400" /> {c.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* ── 6. INDUSTRIES ───────────────────────────────────────── */}
      <section className="px-container px-section">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHead eyebrow="Who we serve" title="Industries" sub="Every industry carries its own compliance and uptime expectations." />
          <ArrowLink to="/industries">All industries</ArrowLink>
        </div>
        <Stagger className="mt-9 flex flex-wrap gap-2.5">
          {industries.map((i) => (
            <StaggerItem key={i.slug}>
              <Link
                to={`/industries/${i.slug}`}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[14.5px] font-medium text-slate-700 transition-all hover:-translate-y-0.5 hover:border-brand-400 hover:text-brand-600 hover:shadow-soft dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-200"
              >
                {i.name}
                <ArrowRightOutlined className="text-[10px] text-slate-400" />
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* ── 7. PROCESS ──────────────────────────────────────────── */}
      <section className="border-y border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-ink-800">
        <div className="px-container px-section">
          <SectionHead
            eyebrow="How we work" title="Assess → Design → Deploy → Manage"
            sub="This is a real sequence — each step has a defined deliverable that you receive."
          />
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {processSteps.map((s, i) => (
              <Reveal key={s.n} delay={i * 0.09}>
                <div className="relative h-full">
                  {i < processSteps.length - 1 && (
                    <span className="absolute -right-3 top-7 hidden h-px w-6 bg-gradient-to-r from-brand-300 to-transparent lg:block" aria-hidden="true" />
                  )}
                  <span className="font-display text-4xl font-bold text-brand-200 dark:text-brand-500/30">{s.n}</span>
                  <h3 className="mt-1 font-display text-lg font-semibold text-slate-900 dark:text-white">{s.title}</h3>
                  <p className="px-body mt-2">{s.desc}</p>
                  <p className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-brand-50 px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">
                    <ThunderboltFilled /> {s.out}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── 8. FEATURED CASE STUDY ──────────────────────────────── */}
      <section className="px-container px-section">
        <SectionHead eyebrow="Proof" title="A recent project" sub="Not claims — numbers." />
        <Reveal className="mt-10">
          <div className="overflow-hidden rounded-3xl border border-slate-200 dark:border-white/10">
            <div className="grid lg:grid-cols-[1.2fr_1fr]">
              <div className="bg-white p-8 dark:bg-white/[0.03] sm:p-10">
                <Tag color="red" className="!mb-4">Manufacturing</Tag>
                <h3 className="px-h3 text-slate-900 dark:text-white">{caseStudies[0].title}</h3>
                <p className="px-body mt-4">{caseStudies[0].challenge}</p>
                <p className="px-body mt-3">{caseStudies[0].result}</p>
                <Link to={`/case-studies/${caseStudies[0].slug}`} className="mt-6 inline-block">
                  <Button type="primary" size="large">Read full case study <ArrowRightOutlined /></Button>
                </Link>
              </div>
              <div className="grid gap-px bg-slate-200 dark:bg-white/10 sm:grid-cols-3 lg:grid-cols-1">
                {caseStudies[0].metrics.map((m) => (
                  <div key={m.label} className="flex flex-col justify-center bg-slate-50 p-7 dark:bg-ink-800">
                    <p className="font-display text-3xl font-bold text-brand-600 dark:text-brand-300">{m.value}</p>
                    <p className="mt-1 text-[13.5px] text-slate-500 dark:text-slate-400">{m.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── 9. TESTIMONIALS ─────────────────────────────────────── */}
      <section className="border-y border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-ink-800">
        <div className="px-container px-section">
          <SectionHead eyebrow="Client voices" title="What our clients say" center />
          <Reveal className="mx-auto mt-10 max-w-3xl">
            <Carousel autoplay autoplaySpeed={5200} dots={{ className: 'px-dots' }} className="pb-8">
              {testimonials.map((t) => (
                <div key={t.by}>
                  <div className="px-2 text-center">
                    <div className="mb-4 flex justify-center gap-1 text-amber-400">
                      {[0, 1, 2, 3, 4].map((i) => <StarFilled key={i} />)}
                    </div>
                    <p className="font-display text-xl leading-relaxed text-slate-800 dark:text-slate-100 sm:text-[1.4rem]">
                      “{t.text}”
                    </p>
                    <p className="mt-5 font-semibold text-slate-900 dark:text-white">{t.by}</p>
                    <p className="text-[13.5px] text-slate-500 dark:text-slate-400">{t.role} · {t.industry}</p>
                  </div>
                </div>
              ))}
            </Carousel>
          </Reveal>
        </div>
      </section>

      {/* ── 10. CLIENT LOGO WALL ────────────────────────────────── */}
      <section className="px-container px-section">
        <SectionHead
          eyebrow="Trusted by" title="Our prestigious clients"
          sub="Manufacturing, BFSI, pharma, education, retail and legal — over 200 organisations."
          center
        />
        <Stagger className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4" gap={0.04}>
          {clientLogos.map((c) => (
            <StaggerItem key={c.name}>
              <div className="flex h-20 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-center transition-colors hover:border-brand-300 dark:border-white/10 dark:bg-white/[0.03]">
                <span className="text-[13.5px] font-semibold text-slate-500 dark:text-slate-400">{c.name}</span>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
        <p className="mt-5 text-center text-[12.5px] text-slate-400">
          Client names shown are representative — actual logos will be added with permission.
        </p>
        <div className="mt-6 text-center"><ArrowLink to="/clients" className="justify-center">All clients & case studies</ArrowLink></div>
      </section>

      {/* ── 11. LATEST RESOURCES ────────────────────────────────── */}
      <section className="border-t border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-ink-800">
        <div className="px-container px-section">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHead eyebrow="Resources" title="Latest from the blog" />
            <ArrowLink to="/blog">All articles</ArrowLink>
          </div>
          <Stagger className="mt-10 grid gap-5 md:grid-cols-3">
            {posts.slice(0, 3).map((p) => (
              <StaggerItem key={p.slug}>
                <Link to={`/blog/${p.slug}`} className="group block h-full">
                  <article className="px-card px-card-hover flex h-full flex-col">
                    <div className="flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-wider text-slate-400">
                      <Tag color="red" className="!m-0">{p.cat}</Tag>
                      <span>{p.read}</span>
                    </div>
                    <h3 className="mt-3 font-display text-[17px] font-semibold leading-snug text-slate-900 group-hover:text-brand-600 dark:text-white dark:group-hover:text-brand-300">
                      {p.title}
                    </h3>
                    <p className="px-body mt-2.5 flex-1">{p.excerpt}</p>
                    <span className="mt-4 font-mono text-[11px] uppercase tracking-wider text-slate-400">
                      {new Date(p.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </article>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* ── 12. INLINE LEAD FORM ────────────────────────────────── */}
      <section className="px-container px-section">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-start">
          <Reveal>
            <div className="px-eyebrow mb-3"><span className="inline-block h-px w-6 bg-brand-400" />Free assessment</div>
            <h2 className="px-h2 text-slate-900 dark:text-white">
              30 minutes. An honest review. <span className="px-gradient-text">Zero obligation.</span>
            </h2>
            <p className="px-lead mt-4">
              We review your current setup — inventory, EOL exposure, backup readiness and your top three
              risks — and hand you a written summary. Whether or not you engage us, the report is yours.
            </p>
            <ul className="mt-7 space-y-3">
              {[
                'Complete asset and EOL exposure list',
                'Backup and DR readiness score',
                'Security gap analysis',
                'Prioritised 90-day action plan',
              ].map((t) => (
                <li key={t} className="flex items-start gap-3 text-[15px] text-slate-600 dark:text-slate-300">
                  <CheckCircleFilled className="mt-1 text-brand-500" /> {t}
                </li>
              ))}
            </ul>
            <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/[0.03]">
              <p className="font-mono text-[11px] uppercase tracking-wider text-slate-400">Prefer to talk?</p>
              <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1.5 text-[15px] font-semibold text-slate-800 dark:text-slate-100">
                {company.phones.map((p) => <a key={p} href={`tel:${p}`} className="hover:text-brand-600">{p}</a>)}
                <a href={`mailto:${company.email}`} className="hover:text-brand-600">{company.email}</a>
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.1}><LeadForm /></Reveal>
        </div>
      </section>

      <CTABand />
    </>
  );
}
