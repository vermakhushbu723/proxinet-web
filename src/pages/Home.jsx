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
import AllianceModal from '../components/AllianceModal';
import { alliances } from '../data/alliances';
import { CTABand, PhotoSection, DarkHead, InfoCard, dotList } from '../components/blocks';
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
                  className={`grid h-11 w-11 place-items-center rounded-2xl border text-lg shadow-lift transition-all duration-500 sm:h-14 sm:w-14 sm:text-2xl ${on
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
  const [alliance, setAlliance] = useState(null);

  return (
    <>
      <AllianceModal alliance={alliance} onClose={() => setAlliance(null)} />
      {/* ── 1. HERO ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-white dark:border-white/10 dark:bg-ink-900">

        {/* Grid Background */}
        <div
          className="px-grid-bg absolute inset-0 opacity-70"
          aria-hidden="true"
        />

        {/* Left Glow */}
        <Glow
          className="-left-24 top-0"
          color="rgba(214,43,31,.20)"
          size={420}
        />

        {/* Right Glow */}
        <Glow
          className="right-0 top-40"
          color="rgba(232,118,63,.14)"
          size={340}
        />

        {/* =========================================================
      RIGHT SIDE HERO IMAGE
  ========================================================= */}
        <div
          className="pointer-events-none absolute inset-y-0 right-0 hidden w-[53%] md:block"
          aria-hidden="true"
        >
          <img
            src={img(photos.datacenter, 1600)}
            alt=""
            className="h-full w-full object-cover"
          />

          {/* Left Fade */}
          <div
            className="
        absolute inset-0
        bg-gradient-to-r
        from-white
        via-white/85
        to-white/20
        dark:from-ink-900
        dark:via-ink-900/80
        dark:to-ink-900/20
      "
          />

          {/* Bottom Fade */}
          <div
            className="
        absolute inset-0
        bg-gradient-to-t
        from-white/60
        via-transparent
        to-transparent
        dark:from-ink-900/70
      "
          />

          {/* Soft Red Glow */}
          <div
            className="
        absolute right-[18%] top-1/2
        h-72 w-72
        -translate-y-1/2
        rounded-full
        bg-brand-500/10
        blur-3xl
      "
          />
        </div>

        {/* =========================================================
      MAIN HERO CONTAINER
  ========================================================= */}
        <div
          className="
      px-container relative
      grid min-h-[500px]
      items-center
      gap-5
      pb-10 pt-8
      md:min-h-[520px]
      lg:grid-cols-[1.05fr_0.95fr]
      lg:gap-6
      lg:pb-10
      lg:pt-6
    "
        >

          {/* =======================================================
        LEFT CONTENT
    ======================================================= */}
          <div
            className="
        relative z-10
        max-w-[660px]
        lg:pr-6
      "
          >

            {/* Small Label */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="
          mb-4
          inline-flex
          items-center
          gap-2
          rounded-full
          border
          border-brand-200
          bg-brand-50/80
          px-4
          py-2
          shadow-sm
          dark:border-brand-500/20
          dark:bg-brand-500/10
        "
            >
              <span className="h-1.5 w-1.5 rounded-full bg-brand-500 shadow-[0_0_8px_rgba(214,43,31,.7)]" />

              <span
                className="
            font-mono
            text-[12px]
            font-bold
            uppercase
            tracking-[0.16em]
            text-brand-600
            dark:text-brand-400
          "
              >
                IT Infrastructure Partner
              </span>
            </motion.div>

            {/* =====================================================
          MAIN HEADING
      ===================================================== */}
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                delay: 0.05,
              }}
              className="
          max-w-[640px]
          font-display
          text-[clamp(2.1rem,3.6vw,3.4rem)]
          font-bold
          leading-[1.1]
          tracking-[-0.025em]
          text-slate-900
          dark:text-white
        "
            >
              Your IT infrastructure,{' '}

              <span
                className="
            bg-gradient-to-r
            from-brand-600
            via-red-500
            to-orange-500
            bg-clip-text
            text-transparent
          "
              >
                designed, deployed & managed end-to-end.
              </span>
            </motion.h1>

            {/* =====================================================
          SMALL SUPPORTING LINE
      ===================================================== */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: 0.12,
              }}
              className="
          mt-6
          flex
          items-center
          gap-3
          text-[16px]
          sm:text-[17px]
          font-medium
          text-slate-500
          dark:text-slate-400
        "
            >
              <span className="h-px w-10 shrink-0 bg-brand-400" />

              <span>
                Cloud · Cybersecurity · Networks · Backup · Data centers
              </span>
            </motion.div>

            {/* =====================================================
          CTA
      ===================================================== */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: 0.18,
              }}
              className="mt-8"
            >
              <Link to="/solutions">
                <Button
                  type="primary"
                  size="large"
                  className="
              !h-12
              !rounded-xl
              !border-0
              !px-7
              !text-[15px]
              !font-semibold
              !shadow-[0_8px_22px_rgba(214,43,31,0.20)]
              transition-all
              duration-300
              hover:-translate-y-1
              hover:!shadow-[0_14px_28px_rgba(214,43,31,0.28)]
            "
                >
                  Explore Solutions
                  <ArrowRightOutlined className="ml-1 text-xs" />
                </Button>
              </Link>
            </motion.div>

          </div>

          {/* =======================================================
        RIGHT HERO ORBIT
    ======================================================= */}
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.9,
              rotate: -6,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              rotate: 0,
            }}
            transition={{
              duration: 0.85,
              delay: 0.12,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="
        relative z-10
        flex
        items-center
        justify-center
        lg:-mr-8
      "
          >
            <HeroOrbit />
          </motion.div>

        </div>
      </section>

      {/* ── 2. PARTNER MARQUEE ──────────────────────────────────── */}
      <section className="overflow-hidden border-b border-slate-200 bg-gradient-to-r from-white via-slate-50 to-white py-9 dark:border-white/10 dark:from-ink-900 dark:via-slate-900 dark:to-ink-900">
        <div className="px-container mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <Link
            to="/partners"
            className="font-mono text-[12px] font-semibold uppercase tracking-[0.18em] text-slate-500 transition-colors hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400"
          >
            Technology alliances →
          </Link>
          <span className="text-[12px] text-slate-400">Click a logo for details</span>
        </div>

        <div className="relative">
          <div className="px-marquee gap-4">
            {[...alliances, ...alliances].map((a, i) => (
              <button
                type="button"
                key={i}
                onClick={() => setAlliance(a)}
                aria-label={`${a.name} details`}
                title={a.name}
                className="
            cursor-pointer
            group flex h-[90px] w-[180px] shrink-0
            items-center justify-center
            overflow-hidden
            rounded-2xl
            border border-slate-200
            bg-white
            px-6 py-4
            shadow-[0_6px_20px_rgba(15,23,42,0.08)]
            transition-all duration-300
            hover:-translate-y-1
            hover:border-blue-300
            hover:shadow-[0_12px_30px_rgba(37,99,235,0.15)]
            dark:border-white/10
            dark:bg-white/[0.05]
            dark:hover:border-blue-400/40
            dark:hover:bg-white/[0.08]
          "
              >
                <img
                  src={a.logo}
                  alt={a.name}
                  loading="lazy"
                  className="
              block
              max-h-[58px]
              max-w-[140px]
              w-auto
              object-contain
              transition-transform
              duration-300
              group-hover:scale-110
            "
                />
              </button>
            ))}
          </div>

          {/* Left Fade */}
          <div
            className="
        pointer-events-none
        absolute inset-y-0 left-0 z-10 w-20
        bg-gradient-to-r
        from-white
        via-white/90
        to-transparent
        dark:from-ink-900
        dark:via-ink-900/90
      "
          />

          {/* Right Fade */}
          <div
            className="
        pointer-events-none
        absolute inset-y-0 right-0 z-10 w-20
        bg-gradient-to-l
        from-white
        via-white/90
        to-transparent
        dark:from-ink-900
        dark:via-ink-900/90
      "
          />
        </div>
      </section>

      {/* ── 3. SOLUTIONS ────────────────────────────────────────── */}
     <section className="border-y border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-ink-800">
  <div className="px-container py-5">

    {/* Section Header */}
    <div className="flex flex-wrap items-end justify-between gap-4">
      <SectionHead
        eyebrow="What we do"
        title="Solutions"
        sub="Seven practice areas under one accountable partner."
      />

      <ArrowLink to="/solutions">
        All solutions
      </ArrowLink>
    </div>

    {/* Solution Cards */}
    <Stagger className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {solutionFamilies.map((f) => (
        <StaggerItem key={f.slug}>
          <InfoCard
            to={`/solutions/${f.slug}`} image={familyImg(f.slug, 800)}
            title={f.name} meta={dotList(f.children.slice(0, 4).map((c) => c.name))}
            text={f.blurb} cta="Explore solution"
          />
        </StaggerItem>
      ))}
    </Stagger>

  </div>
</section>

      {/* ── 4. STATS BAR ────────────────────────────────────────── */}
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

      {/* ── WHY CHOOSE US ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-white dark:border-white/10 dark:bg-ink-900">

        {/* Background Effects */}
        <div
          className="
      pointer-events-none
      absolute
      -left-32
      top-20
      h-80
      w-80
      rounded-full
      bg-brand-500/10
      blur-3xl
    "
          aria-hidden="true"
        />

        <div
          className="
      pointer-events-none
      absolute
      -right-32
      bottom-10
      h-80
      w-80
      rounded-full
      bg-cyan-400/10
      blur-3xl
    "
          aria-hidden="true"
        />

        <div className="px-container relative py-14 sm:py-16 lg:py-20">

          {/* Section Header */}
          <Reveal>
            <div className="mx-auto max-w-3xl text-center">

              <p
                className="
            mb-3
            font-mono
            text-[11px]
            font-bold
            uppercase
            tracking-[0.2em]
            text-brand-600
            dark:text-brand-400
          "
              >
                Why choose us
              </p>

              <h2
                className="
            font-display
            text-3xl
            font-bold
            leading-tight
            tracking-tight
            text-slate-900
            sm:text-4xl
            lg:text-[2.7rem]
            dark:text-white
          "
              >
                One partner for your
                <span className="ml-2 bg-gradient-to-r from-brand-600 via-red-500 to-orange-500 bg-clip-text text-transparent">
                  complete IT infrastructure
                </span>
              </h2>

              <p
                className="
            mx-auto
            mt-4
            max-w-2xl
            text-sm
            leading-6
            text-slate-600
            sm:text-[15px]
            sm:leading-7
            dark:text-slate-300
          "
              >
                From planning and deployment to monitoring and support,
                we take complete ownership of your IT environment.
              </p>
            </div>
          </Reveal>

          {/* Feature Cards */}
          <Stagger className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

            {/* Card 1 */}
            <StaggerItem>
              <div
                className="
            group
            relative
            h-full
            overflow-hidden
            rounded-2xl
            border
            border-slate-200
            bg-white
            p-6
            shadow-[0_10px_30px_rgba(15,23,42,0.07)]
            transition-all
            duration-300
            hover:-translate-y-2
            hover:border-brand-300
            hover:shadow-[0_20px_45px_rgba(15,23,42,0.14)]
            dark:border-white/10
            dark:bg-white/[0.04]
            dark:hover:border-brand-500/40
          "
              >
                <div
                  className="
              mb-5
              flex
              h-12
              w-12
              items-center
              justify-center
              rounded-xl
              border
              border-brand-100
              bg-brand-50
              text-xl
              text-brand-600
              transition-all
              duration-300
              group-hover:scale-110
              group-hover:bg-brand-600
              group-hover:text-white
              dark:border-brand-500/20
              dark:bg-brand-500/10
              dark:text-brand-400
              dark:group-hover:bg-brand-500
              dark:group-hover:text-white
            "
                >
                  <TeamOutlined />
                </div>

                <h3
                  className="
              font-display
              text-lg
              font-bold
              text-slate-900
              transition-colors
              group-hover:text-brand-600
              dark:text-white
              dark:group-hover:text-brand-400
            "
                >
                  Experienced IT Team
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                  Skilled professionals handling infrastructure, cloud,
                  security, networking and managed IT services.
                </p>

                <div className="mt-5 h-px w-8 bg-brand-500/40 transition-all duration-500 group-hover:w-full" />
              </div>
            </StaggerItem>

            {/* Card 2 */}
            <StaggerItem>
              <div
                className="
            group
            relative
            h-full
            overflow-hidden
            rounded-2xl
            border
            border-slate-200
            bg-white
            p-6
            shadow-[0_10px_30px_rgba(15,23,42,0.07)]
            transition-all
            duration-300
            hover:-translate-y-2
            hover:border-brand-300
            hover:shadow-[0_20px_45px_rgba(15,23,42,0.14)]
            dark:border-white/10
            dark:bg-white/[0.04]
            dark:hover:border-brand-500/40
          "
              >
                <div
                  className="
              mb-5
              flex
              h-12
              w-12
              items-center
              justify-center
              rounded-xl
              border
              border-blue-100
              bg-blue-50
              text-xl
              text-blue-600
              transition-all
              duration-300
              group-hover:scale-110
              group-hover:bg-blue-600
              group-hover:text-white
              dark:border-blue-500/20
              dark:bg-blue-500/10
              dark:text-blue-400
              dark:group-hover:bg-blue-500
              dark:group-hover:text-white
            "
                >
                  <CloudOutlined />
                </div>

                <h3
                  className="
              font-display
              text-lg
              font-bold
              text-slate-900
              transition-colors
              group-hover:text-blue-600
              dark:text-white
              dark:group-hover:text-blue-400
            "
                >
                  End-to-End Solutions
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                  Cloud, cybersecurity, data center, backup and network
                  solutions under one accountable partner.
                </p>

                <div className="mt-5 h-px w-8 bg-blue-500/40 transition-all duration-500 group-hover:w-full" />
              </div>
            </StaggerItem>

            {/* Card 3 */}
            <StaggerItem>
              <div
                className="
            group
            relative
            h-full
            overflow-hidden
            rounded-2xl
            border
            border-slate-200
            bg-white
            p-6
            shadow-[0_10px_30px_rgba(15,23,42,0.07)]
            transition-all
            duration-300
            hover:-translate-y-2
            hover:border-emerald-300
            hover:shadow-[0_20px_45px_rgba(15,23,42,0.14)]
            dark:border-white/10
            dark:bg-white/[0.04]
            dark:hover:border-emerald-500/40
          "
              >
                <div
                  className="
              mb-5
              flex
              h-12
              w-12
              items-center
              justify-center
              rounded-xl
              border
              border-emerald-100
              bg-emerald-50
              text-xl
              text-emerald-600
              transition-all
              duration-300
              group-hover:scale-110
              group-hover:bg-emerald-600
              group-hover:text-white
              dark:border-emerald-500/20
              dark:bg-emerald-500/10
              dark:text-emerald-400
              dark:group-hover:bg-emerald-500
              dark:group-hover:text-white
            "
                >
                  <SafetyOutlined />
                </div>

                <h3
                  className="
              font-display
              text-lg
              font-bold
              text-slate-900
              transition-colors
              group-hover:text-emerald-600
              dark:text-white
              dark:group-hover:text-emerald-400
            "
                >
                  Security First
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                  Protecting endpoints, networks, cloud environments and
                  critical business data with security-focused solutions.
                </p>

                <div className="mt-5 h-px w-8 bg-emerald-500/40 transition-all duration-500 group-hover:w-full" />
              </div>
            </StaggerItem>

            {/* Card 4 */}
            <StaggerItem>
              <div
                className="
            group
            relative
            h-full
            overflow-hidden
            rounded-2xl
            border
            border-slate-200
            bg-white
            p-6
            shadow-[0_10px_30px_rgba(15,23,42,0.07)]
            transition-all
            duration-300
            hover:-translate-y-2
            hover:border-violet-300
            hover:shadow-[0_20px_45px_rgba(15,23,42,0.14)]
            dark:border-white/10
            dark:bg-white/[0.04]
            dark:hover:border-violet-500/40
          "
              >
                <div
                  className="
              mb-5
              flex
              h-12
              w-12
              items-center
              justify-center
              rounded-xl
              border
              border-violet-100
              bg-violet-50
              text-xl
              text-violet-600
              transition-all
              duration-300
              group-hover:scale-110
              group-hover:bg-violet-600
              group-hover:text-white
              dark:border-violet-500/20
              dark:bg-violet-500/10
              dark:text-violet-400
              dark:group-hover:bg-violet-500
              dark:group-hover:text-white
            "
                >
                  <ThunderboltFilled />
                </div>

                <h3
                  className="
              font-display
              text-lg
              font-bold
              text-slate-900
              transition-colors
              group-hover:text-violet-600
              dark:text-white
              dark:group-hover:text-violet-400
            "
                >
                  Fast Deployment
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                  Structured implementation with planned migrations,
                  testing, documentation and smooth handover.
                </p>

                <div className="mt-5 h-px w-8 bg-violet-500/40 transition-all duration-500 group-hover:w-full" />
              </div>
            </StaggerItem>

            {/* Card 5 */}
            <StaggerItem>
              <div
                className="
            group
            relative
            h-full
            overflow-hidden
            rounded-2xl
            border
            border-slate-200
            bg-white
            p-6
            shadow-[0_10px_30px_rgba(15,23,42,0.07)]
            transition-all
            duration-300
            hover:-translate-y-2
            hover:border-orange-300
            hover:shadow-[0_20px_45px_rgba(15,23,42,0.14)]
            dark:border-white/10
            dark:bg-white/[0.04]
            dark:hover:border-orange-500/40
          "
              >
                <div
                  className="
              mb-5
              flex
              h-12
              w-12
              items-center
              justify-center
              rounded-xl
              border
              border-orange-100
              bg-orange-50
              text-xl
              text-orange-600
              transition-all
              duration-300
              group-hover:scale-110
              group-hover:bg-orange-600
              group-hover:text-white
              dark:border-orange-500/20
              dark:bg-orange-500/10
              dark:text-orange-400
              dark:group-hover:bg-orange-500
              dark:group-hover:text-white
            "
                >
                  <CustomerServiceOutlined />
                </div>

                <h3
                  className="
              font-display
              text-lg
              font-bold
              text-slate-900
              transition-colors
              group-hover:text-orange-600
              dark:text-white
              dark:group-hover:text-orange-400
            "
                >
                  24×7 Support
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                  Continuous monitoring and support to keep your
                  business-critical IT environment running.
                </p>

                <div className="mt-5 h-px w-8 bg-orange-500/40 transition-all duration-500 group-hover:w-full" />
              </div>
            </StaggerItem>

            {/* Card 6 */}
            <StaggerItem>
              <div
                className="
            group
            relative
            h-full
            overflow-hidden
            rounded-2xl
            border
            border-slate-200
            bg-white
            p-6
            shadow-[0_10px_30px_rgba(15,23,42,0.07)]
            transition-all
            duration-300
            hover:-translate-y-2
            hover:border-cyan-300
            hover:shadow-[0_20px_45px_rgba(15,23,42,0.14)]
            dark:border-white/10
            dark:bg-white/[0.04]
            dark:hover:border-cyan-500/40
          "
              >
                <div
                  className="
              mb-5
              flex
              h-12
              w-12
              items-center
              justify-center
              rounded-xl
              border
              border-cyan-100
              bg-cyan-50
              text-xl
              text-cyan-600
              transition-all
              duration-300
              group-hover:scale-110
              group-hover:bg-cyan-600
              group-hover:text-white
              dark:border-cyan-500/20
              dark:bg-cyan-500/10
              dark:text-cyan-400
              dark:group-hover:bg-cyan-500
              dark:group-hover:text-white
            "
                >
                  <DatabaseOutlined />
                </div>

                <h3
                  className="
              font-display
              text-lg
              font-bold
              text-slate-900
              transition-colors
              group-hover:text-cyan-600
              dark:text-white
              dark:group-hover:text-cyan-400
            "
                >
                  Scalable Infrastructure
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                  Flexible infrastructure designed to grow with your
                  business and changing technology requirements.
                </p>

                <div className="mt-5 h-px w-8 bg-cyan-500/40 transition-all duration-500 group-hover:w-full" />
              </div>
            </StaggerItem>

          </Stagger>
        </div>
      </section>

      {/* ── 6. PROCESS ──────────────────────────────────────────── */}
      <PhotoSection image={img(photos.teamMonitors, 1920)}>
        <div className="relative overflow-hidden">

          {/* Background Glow */}
          <div className="pointer-events-none absolute -left-32 top-0 h-80 w-80 rounded-full bg-brand-500/20 blur-3xl" />
          <div className="pointer-events-none absolute -right-32 bottom-0 h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl" />

          <div className="px-container px-section relative">

            {/* ================= HEADER ================= */}
            <div className="-mt-10 max-w-6xl sm:-mt-14">

              <p className="mb-3 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-brand-300">
                How we work
              </p>

              <h2 className="whitespace-nowrap font-display text-[clamp(1.7rem,4vw,3.5rem)] font-bold leading-tight tracking-tight text-white">
                Assess
                <span className="mx-2 text-brand-400">→</span>
                Design
                <span className="mx-2 text-brand-400">→</span>
                Deploy
                <span className="mx-2 text-brand-400">→</span>
                Manage
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70 sm:text-base">
                A structured delivery process with clear outcomes at every stage.
              </p>

            </div>

            {/* ================= PROCESS CARDS ================= */}
            <div className="relative mt-10 sm:mt-12">

              {/* Connecting Line - Desktop */}
              <div className="pointer-events-none absolute left-[12%] right-[12%] top-[38px] hidden h-px bg-gradient-to-r from-brand-400/20 via-brand-400/70 to-cyan-400/20 lg:block" />

              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">

                {processSteps.map((s, i) => (
                  <Reveal key={s.n} delay={i * 0.09}>

                    <div className="group relative h-full">

                      {/* ================= STEP NUMBER ================= */}
                      <div className="relative z-10 mb-5 flex items-center justify-between">

                        <div
                          className="
                      flex h-[76px] w-[76px] items-center justify-center
                      rounded-2xl
                      border border-white/20
                      bg-slate-950/85
                      shadow-[0_12px_35px_rgba(0,0,0,0.35)]
                      backdrop-blur-xl
                      transition-all duration-300
                      group-hover:-translate-y-1
                      group-hover:border-brand-400/60
                      group-hover:shadow-[0_18px_45px_rgba(59,130,246,0.25)]
                    "
                        >
                          <span className="font-display text-3xl font-black tracking-tight text-white">
                            {s.n}
                          </span>
                        </div>

                        {/* Arrow */}
                        {i < processSteps.length - 1 && (
                          <span className="hidden pr-1 text-xl text-white/20 lg:block">
                            →
                          </span>
                        )}

                      </div>

                      {/* ================= CARD ================= */}
                      <div
                        className="
                    relative flex h-full flex-col overflow-hidden
                    rounded-2xl
                    border border-white/15
                    bg-white/[0.075]
                    p-6
                    shadow-[0_15px_45px_rgba(0,0,0,0.25)]
                    backdrop-blur-xl
                    transition-all duration-300

                    group-hover:-translate-y-2
                    group-hover:border-brand-400/40
                    group-hover:bg-white/[0.11]
                    group-hover:shadow-[0_25px_60px_rgba(0,0,0,0.35)]
                  "
                      >

                        {/* Top Accent */}
                        <div
                          className="
                      absolute left-0 right-0 top-0 h-[2px]
                      bg-gradient-to-r
                      from-brand-500
                      via-cyan-400
                      to-transparent
                      opacity-60
                      transition-opacity duration-300
                      group-hover:opacity-100
                    "
                        />

                        {/* Small Label */}
                        <div className="mb-4 flex items-center gap-2">

                          <span className="h-1.5 w-1.5 rounded-full bg-brand-400 shadow-[0_0_10px_rgba(59,130,246,0.9)]" />

                          <span className="font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-white/40">
                            Step {s.n}
                          </span>

                        </div>

                        {/* Title */}
                        <h3 className="font-display text-xl font-bold text-white transition-colors duration-300 group-hover:text-brand-300">
                          {s.title}
                        </h3>

                        {/* Compact Points */}
                        <div className="mt-5 space-y-2.5">

                          {s.desc
                            .split(/[—,.]/)
                            .map((point) => point.trim())
                            .filter(Boolean)
                            .slice(0, 3)
                            .map((point, index) => (
                              <div
                                key={`${s.n}-${index}`}
                                className="flex items-start gap-2.5"
                              >

                                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" />

                                <span className="text-sm leading-5 text-white/70">
                                  {point}
                                </span>

                              </div>
                            ))}

                        </div>

                        {/* ================= DELIVERABLE ================= */}
                        <div
                          className="
                      mt-auto
                      pt-6
                    "
                        >

                          <div
                            className="
                        flex items-start gap-3
                        rounded-xl
                        border border-brand-400/15
                        bg-brand-500/10
                        px-3.5 py-3
                        transition-all duration-300
                        group-hover:border-brand-400/30
                        group-hover:bg-brand-500/15
                      "
                          >

                            <div
                              className="
                          mt-0.5 flex h-7 w-7 shrink-0
                          items-center justify-center
                          rounded-lg
                          bg-brand-500/20
                          text-brand-300
                        "
                            >
                              <ThunderboltFilled className="text-xs" />
                            </div>

                            <div className="min-w-0">

                              <p className="font-mono text-[8px] font-bold uppercase tracking-[0.16em] text-white/40">
                                Deliverable
                              </p>

                              <p className="mt-0.5 text-xs font-semibold leading-5 text-brand-100">
                                {s.out}
                              </p>

                            </div>

                          </div>

                        </div>

                        {/* Bottom Accent */}
                        <div
                          className="
                      mt-6 h-px w-8
                      bg-white/15
                      transition-all duration-500
                      group-hover:w-full
                      group-hover:bg-brand-400/50
                    "
                        />

                      </div>

                    </div>

                  </Reveal>
                ))}

              </div>

            </div>

          </div>
        </div>
      </PhotoSection>

      {/* ── 7. CTA ──────────────────────────────────────────────── */}
      <CTABand />
    </>
  );
}
