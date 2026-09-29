import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'antd';
import {
  ArrowRightOutlined, CloudOutlined, SafetyOutlined, DatabaseOutlined,
  CloudDownloadOutlined, WifiOutlined, TeamOutlined, VideoCameraOutlined,
  ThunderboltFilled, CustomerServiceOutlined, ScanOutlined, ToolOutlined, ClusterOutlined,
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { stats, processSteps } from '../data/company';
import { solutionFamilies } from '../data/solutions';
import { partners } from '../data/proof';
import { Reveal, Stagger, StaggerItem, Counter, SectionHead, ArrowLink, Glow, IconBadge } from '../components/ui';
import PartnerLogo from '../components/PartnerLogo';
import { CTABand, CardImage, PhotoSection, DarkHead } from '../components/blocks';
import { img, photos, familyImg } from '../data/images';

const icons = {
  cloud: <CloudOutlined />, shield: <SafetyOutlined />, server: <DatabaseOutlined />,
  backup: <CloudDownloadOutlined />, wifi: <WifiOutlined />, team: <TeamOutlined />,
  camera: <VideoCameraOutlined />,
};

/* ------------------------------------------------------------------ *
 *  Hero orbit — solutions circle a rotating photo, services on an inner ring
 * ------------------------------------------------------------------ */
const orbitServices = [
  { to: '/services/managed-it-services', name: 'Managed IT', icon: <ClusterOutlined /> },
  { to: '/services/247-noc-helpdesk', name: '24×7 NOC', icon: <CustomerServiceOutlined /> },
  { to: '/services/security-audit-vapt', name: 'VAPT', icon: <ScanOutlined /> },
  { to: '/services/annual-maintenance-contract', name: 'AMC', icon: <ToolOutlined /> },
];

const onRing = (i, total, radius, offset = -90) => {
  const a = ((360 / total) * i + offset) * (Math.PI / 180);
  return { left: `${50 + radius * Math.cos(a)}%`, top: `${50 + radius * Math.sin(a)}%` };
};

function HeroOrbit() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return undefined;
    const t = setInterval(() => setActive((i) => (i + 1) % solutionFamilies.length), 2600);
    return () => clearInterval(t);
  }, [paused]);

  const current = solutionFamilies[active];
  const spin = paused ? '[animation-play-state:paused]' : '';

  return (
    <div
      className="relative mx-auto aspect-square w-full max-w-[400px] select-none"
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
    >
      {/* soft glow behind everything */}
      <div className="absolute inset-[12%] rounded-full bg-brand-500/20 blur-3xl" aria-hidden="true" />

      {/* outer ring — solutions */}
      <div className={`absolute inset-[4%] animate-[spin_46s_linear_infinite] rounded-full border border-dashed border-brand-300/70 dark:border-brand-500/40 ${spin}`}>
        {solutionFamilies.map((f, i) => {
          const on = i === active;
          return (
            <Link
              key={f.slug} to={`/solutions/${f.slug}`} aria-label={f.name}
              onMouseEnter={() => setActive(i)} onFocus={() => setActive(i)}
              className="absolute -translate-x-1/2 -translate-y-1/2" style={onRing(i, solutionFamilies.length, 50)}
            >
              <span className={`block animate-[spin_46s_linear_infinite_reverse] ${spin}`}>
                <span
                  className={`grid h-11 w-11 place-items-center rounded-2xl border text-lg shadow-lift transition-all duration-500 sm:h-14 sm:w-14 sm:text-2xl ${
                    on
                      ? 'scale-110 border-brand-500 bg-brand-500 text-white shadow-glow'
                      : 'border-slate-200 bg-white text-brand-500 hover:border-brand-400 dark:border-white/10 dark:bg-ink-800'
                  }`}
                >
                  {icons[f.icon]}
                </span>
              </span>
            </Link>
          );
        })}
      </div>

      {/* inner ring — services, turning the other way */}
      <div className={`absolute inset-[21%] animate-[spin_30s_linear_infinite_reverse] rounded-full border border-slate-300/70 dark:border-white/15 ${spin}`}>
        {orbitServices.map((sv, i) => (
          <Link
            key={sv.to} to={sv.to} aria-label={sv.name}
            className="absolute -translate-x-1/2 -translate-y-1/2" style={onRing(i, orbitServices.length, 50, -45)}
          >
            <span className={`block animate-[spin_30s_linear_infinite] ${spin}`}>
              <span className="flex items-center gap-1.5 whitespace-nowrap rounded-full border border-slate-200 bg-white/95 px-2.5 py-1 text-[10.5px] font-semibold text-slate-700 shadow-soft backdrop-blur transition-colors hover:border-brand-400 hover:text-brand-600 dark:border-white/10 dark:bg-ink-800/95 dark:text-slate-200 sm:text-[12px]">
                <span className="text-brand-500">{sv.icon}</span>{sv.name}
              </span>
            </span>
          </Link>
        ))}
      </div>

      {/* centre — spinning gradient border around a cross-fading photo */}
      <div className="absolute inset-[29%]">
        <div
          className={`absolute -inset-[6px] animate-[spin_6s_linear_infinite] rounded-full ${spin}`}
          style={{ background: 'conic-gradient(from 0deg, #d62b1f, #f09b94, transparent 40%, #d62b1f 70%, #971a13)' }}
          aria-hidden="true"
        />
        <div className="relative h-full w-full overflow-hidden rounded-full border-4 border-white bg-ink-900 shadow-lift dark:border-ink-900">
          <AnimatePresence mode="popLayout">
            <motion.img
              key={current.slug}
              src={familyImg(current.slug, 500)} alt={current.name}
              initial={{ opacity: 0, scale: 1.25, rotate: -8 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.9, rotate: 8 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 h-full w-full object-cover"
            />
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-t from-ink-900/85 via-ink-900/10 to-transparent" aria-hidden="true" />
          <AnimatePresence mode="wait">
            <motion.div
              key={current.slug}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.35 }}
              className="absolute inset-x-2 bottom-[16%] text-center"
            >
              <p className="font-display text-[12px] font-semibold leading-tight text-white sm:text-[15px]">{current.name}</p>
              <p className="mt-0.5 hidden font-mono text-[9px] uppercase tracking-wider text-white/70 sm:block">
                {current.children.length} services
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* live status pill */}
      <span className="absolute bottom-[6%] left-0 flex items-center gap-1.5 whitespace-nowrap rounded-full border border-slate-200 bg-white px-3 py-1 text-[11.5px] font-semibold text-emerald-600 shadow-soft dark:border-white/10 dark:bg-ink-800">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>
        All systems normal
      </span>
    </div>
  );
}

export default function Home() {
  return (
    <>
      {/* ── 1. HERO ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-white dark:border-white/10 dark:bg-ink-900">
        <div className="px-grid-bg absolute inset-0" aria-hidden="true" />
        <Glow className="-left-24 top-0" color="rgba(214,43,31,.30)" size={480} />
        <Glow className="right-0 top-40" color="rgba(232,118,63,.20)" size={380} />

        {/* right-half hero photo, faded into the page background on its left edge */}
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[52%] md:block" aria-hidden="true">
          <img src={img(photos.datacenter, 1600)} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/75 to-white/30 dark:from-ink-900 dark:via-ink-900/75 dark:to-ink-900/35" />
          <div className="absolute inset-0 bg-gradient-to-t from-white/70 to-transparent dark:from-ink-900/70" />
        </div>

        <div className="px-container relative grid items-center gap-8 pb-10 pt-4 lg:grid-cols-[1.15fr_1fr] lg:gap-10 lg:pb-12 lg:pt-5">
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
              className="px-lead mt-5 max-w-xl"
            >
              Cloud, cyber security, data center, backup and network — from a single partner.
              Operating out of Noida and New Delhi for 200+ clients, from manufacturing to BFSI.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.22 }}
              className="mt-6 flex flex-col gap-3 sm:flex-row"
            >
              <Link to="/contact">
                <Button type="primary" size="large" className="!h-12 !px-7 !text-[15px]">
                  Get A Quote <ArrowRightOutlined />
                </Button>
              </Link>
              <Link to="/solutions">
                <Button size="large" className="!h-12 !px-7 !text-[15px]">Explore Solutions</Button>
              </Link>
            </motion.div>

          </div>

          {/* animated orbit of solutions & services */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotate: -10 }} animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <HeroOrbit />
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
                className="flex shrink-0 items-center gap-3 rounded-xl border border-slate-200 bg-white px-5 py-3.5 dark:border-white/10 dark:bg-white/[0.03]"
              >
                <PartnerLogo partner={p} size={24} />
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

      {/* ── 4. SOLUTIONS ────────────────────────────────────────── */}
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
                    <CardImage src={familyImg(f.slug, 800)} alt={f.name} className="h-40">
                      <span className="absolute right-3 top-3 rounded-full bg-ink-900/70 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-white backdrop-blur">
                        {f.children.length} services
                      </span>
                    </CardImage>
                    <div className="flex items-center gap-2.5">
                      <IconBadge size="sm">{icons[f.icon]}</IconBadge>
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate font-display text-[15.5px] font-semibold leading-tight text-slate-900 dark:text-white">{f.name}</h3>
                        <p className="mt-0.5 truncate font-mono text-[9.5px] uppercase tracking-[0.08em] text-brand-500">{f.tag}</p>
                      </div>
                    </div>
                    <p className="px-body mt-3 flex-1">{f.blurb}</p>
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* ── 5. PROCESS ──────────────────────────────────────────── */}
      <PhotoSection image={img(photos.teamMonitors, 1920)}>
        <div className="px-container px-section">
          <DarkHead
            eyebrow="How we work" title="Assess → Design → Deploy → Manage"
            sub="This is a real sequence — each step has a defined deliverable that you receive."
          />
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {processSteps.map((s, i) => (
              <Reveal key={s.n} delay={i * 0.09}>
                <div className="h-full rounded-2xl border border-white/15 bg-white/[0.07] p-6 backdrop-blur-md transition-colors hover:bg-white/[0.12]">
                  <span className="font-display text-4xl font-bold text-brand-400">{s.n}</span>
                  <h3 className="mt-1 font-display text-lg font-semibold text-white">{s.title}</h3>
                  <p className="mt-2 text-[0.97rem] leading-relaxed text-white/75">{s.desc}</p>
                  <p className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-brand-500/25 px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider text-brand-100">
                    <ThunderboltFilled /> {s.out}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </PhotoSection>

      {/* ── 6. CTA ──────────────────────────────────────────────── */}
      <CTABand />
    </>
  );
}
