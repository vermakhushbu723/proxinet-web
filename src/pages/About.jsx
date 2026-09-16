import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Timeline, Tag, Steps } from 'antd';
import { SafetyCertificateOutlined, LinkedinFilled, ThunderboltFilled, CheckCircleFilled } from '@ant-design/icons';
import { company, values, stats, processSteps } from '../data/company';
import { leadership, milestones } from '../data/people';
import { certifications } from '../data/proof';
import { industries } from '../data/industries';
import { Reveal, Stagger, StaggerItem, SectionHead, Counter, IconBadge } from '../components/ui';
import { PageHero, CTABand, TickList, FeatureImage, PhotoSection, DarkHead, ImageTile } from '../components/blocks';
import { img, photos, industryImg } from '../data/images';

/* =================== ABOUT =================== */
export function About() {
  return (
    <>
      <PageHero
        eyebrow="About us" title="An IT partner that designs the system and answers at 2 a.m."
        sub="ProXinet Technologies — operating from Noida and New Delhi as an end-to-end IT infrastructure partner for Delhi NCR businesses."
        crumbs={[{ label: 'About' }]}
      />

      <section className="px-container px-section">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr]">
          <Reveal>
            <h2 className="px-h2 text-slate-900 dark:text-white">What we do</h2>
            <p className="px-lead mt-5">
              Our breadth of experience means we can recommend, design, deploy and maintain your IT
              infrastructure — all four. One accountable partner, so the burden of coordinating between
              multiple vendors does not land on you.
            </p>
            <p className="px-body mt-4">
              Working across manufacturing, IT/ITES, BFSI, pharma, education, legal, retail, construction
              and hospitality means we understand not just the technology but the compliance and uptime
              expectations that surround it.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                { t: 'One-stop IT solutions', d: 'Cloud, security, data center, backup and network in one place.' },
                { t: 'SLA-backed delivery', d: 'ITIL-aligned processes and measurable response times.' },
                { t: 'Certified engineers', d: 'OEM-trained, background verified and continuously upskilled.' },
                { t: 'Sustainable design', d: 'Energy-efficient infrastructure and carbon footprint reduction.' },
              ].map((x) => (
                <div key={x.t} className="rounded-xl border border-slate-200 p-4 dark:border-white/10">
                  <p className="font-display font-semibold text-slate-900 dark:text-white">{x.t}</p>
                  <p className="px-body mt-1">{x.d}</p>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <FeatureImage src={img(photos.officeTeam, 1000)} alt="ProXinet team working together" className="mb-10" />
            <div className="px-card">
              <p className="font-mono text-[11px] uppercase tracking-wider text-slate-400">At a glance</p>
              <div className="mt-5 grid grid-cols-2 gap-5">
                {stats.slice(0, 4).map((s) => (
                  <div key={s.label}>
                    <p className="font-display text-2xl font-bold text-brand-600 dark:text-brand-300">
                      <Counter to={s.value} suffix={s.suffix} decimals={s.decimals || 0} />
                    </p>
                    <p className="mt-0.5 text-[13px] text-slate-500 dark:text-slate-400">{s.label}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 space-y-3 border-t border-slate-100 pt-5 dark:border-white/10">
                {company.offices.map((o) => (
                  <div key={o.label}>
                    <p className="font-mono text-[10.5px] uppercase tracking-wider text-slate-400">{o.label}</p>
                    <p className="mt-0.5 text-[14px] text-slate-600 dark:text-slate-300">{o.line}</p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* values */}
      <PhotoSection image={img(photos.highFive, 1920)}>
        <div className="px-container px-section">
          <DarkHead eyebrow="What we stand for" title="Core values" />
          <Stagger className="mt-9 grid gap-4 md:grid-cols-3">
            {values.map((v) => (
              <StaggerItem key={v.title}>
                <div className="h-full rounded-2xl border border-white/15 bg-white/[0.07] p-6 backdrop-blur-md transition-colors hover:bg-white/[0.12]">
                  <h3 className="font-display text-[16.5px] font-semibold text-white">{v.title}</h3>
                  <p className="mt-2 text-[0.97rem] leading-relaxed text-white/75">{v.desc}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </PhotoSection>

      {/* industries served */}
      <section className="px-container px-section">
        <SectionHead eyebrow="Reach" title="Industries we serve" />
        <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
          {industries.map((i) => (
            <ImageTile key={i.slug} to={`/industries/${i.slug}`} src={industryImg(i.slug, 700)} label={i.name} />
          ))}
        </div>
      </section>

      <CTABand />
    </>
  );
}

/* =================== LEADERSHIP =================== */
export function Leadership() {
  return (
    <>
      <PageHero
        eyebrow="Team" title="Leadership"
        sub="In B2B services people buy from people. This is the team that will work on your account."
        crumbs={[{ label: 'About', to: '/about' }, { label: 'Leadership' }]}
      />
      <section className="px-container px-section">
        <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {leadership.map((p) => (
            <StaggerItem key={p.role}>
              <div className="px-card px-card-hover h-full text-center">
                <span className="mx-auto grid h-20 w-20 place-items-center rounded-2xl bg-gradient-to-br from-brand-400 to-brand-700 font-display text-2xl font-bold text-white">
                  {p.initials}
                </span>
                <h3 className="mt-4 font-display text-[17px] font-semibold text-slate-900 dark:text-white">{p.name}</h3>
                <p className="mt-0.5 text-[13.5px] font-medium text-brand-600 dark:text-brand-300">{p.role}</p>
                <p className="mt-1 font-mono text-[11px] uppercase tracking-wider text-slate-400">{p.exp}</p>
                <p className="px-body mt-3">{p.focus}</p>
                <a href="#" aria-label={`${p.role} on LinkedIn`} className="mt-4 inline-grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-500 hover:border-brand-400 hover:text-brand-600 dark:border-white/10">
                  <LinkedinFilled />
                </a>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
        <p className="mt-8 text-center text-[13px] text-slate-400">
          Placeholder profiles — replace with real names, photos and LinkedIn links.
        </p>
      </section>
      <CTABand />
    </>
  );
}

/* =================== STORY =================== */
export function Story() {
  return (
    <>
      <PageHero
        eyebrow="Our story" title="Where we started, and where we are now"
        sub="From a hardware supply business to a managed services partner — fifteen years on."
        crumbs={[{ label: 'About', to: '/about' }, { label: 'Our Story' }]}
      />
      <section className="px-container px-section">
        <Reveal className="mx-auto mb-14 max-w-4xl">
          <div className="grid gap-4 sm:grid-cols-3">
            {[photos.hardwareRepair, photos.teamMonitors, photos.dcEngineer].map((p, i) => (
              <img key={p} src={img(p, 700)} alt="" aria-hidden="true" loading="lazy"
                className={`aspect-[4/3] w-full rounded-2xl object-cover shadow-soft ${i === 1 ? 'sm:-translate-y-4' : ''}`} />
            ))}
          </div>
        </Reveal>
        <Reveal className="mx-auto max-w-3xl">
          <Timeline
            mode="left"
            items={milestones.map((m) => ({
              color: '#d62b1f',
              label: <span className="font-mono text-[13px] font-semibold text-brand-600">{m.year}</span>,
              children: (
                <div className="pb-4">
                  <h3 className="font-display text-[17px] font-semibold text-slate-900 dark:text-white">{m.title}</h3>
                  <p className="px-body mt-1">{m.desc}</p>
                </div>
              ),
            }))}
          />
        </Reveal>
      </section>
      <CTABand />
    </>
  );
}

/* =================== PROCESS =================== */
export function Process() {
  const detail = [
    { t: 'Discovery', d: 'Requirements workshop, stakeholder interviews and constraints capture.', out: 'Requirement document' },
    { t: 'Assessment', d: 'Asset inventory, EOL exposure, security gaps and backup readiness.', out: 'Assessment report' },
    { t: 'Proposal', d: 'Reference architecture, BOQ, commercials and options with their trade-offs.', out: 'Solution design + BOQ' },
    { t: 'Implementation', d: 'Phased rollout in planned windows, with a rollback plan.', out: 'Go-live sign-off' },
    { t: 'Handover', d: 'As-built documentation, admin training and credential transfer.', out: 'Handover pack' },
    { t: 'Managed support', d: '24/7 monitoring, SLA-backed support and a quarterly business review.', out: 'Monthly SLA report' },
  ];

  return (
    <>
      <PageHero
        eyebrow="How we work" title="Our delivery process"
        sub="Every step has a defined deliverable that you physically receive — not a verbal assurance."
        crumbs={[{ label: 'About', to: '/about' }, { label: 'Our Process' }]}
      />

      <section className="px-container px-section">
        <Stagger className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {detail.map((d, i) => (
            <StaggerItem key={d.t}>
              <div className="px-card h-full">
                <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-brand-500">
                  Step {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-2 font-display text-[17px] font-semibold text-slate-900 dark:text-white">{d.t}</h3>
                <p className="px-body mt-2">{d.d}</p>
                <p className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-brand-50 px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">
                  <ThunderboltFilled /> {d.out}
                </p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <PhotoSection image={img(photos.nocDesk, 1920)}>
        <div className="px-container px-section">
          <DarkHead eyebrow="Governance" title="Support delivery framework" sub="ITIL-aligned — these four pillars apply to every managed account." />
          <div className="mt-9 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {[
              { t: 'Governance', d: 'SLA-based delivery, 24/7 support and a standardised incident process.' },
              { t: 'Resource pool', d: 'ITIL-trained engineers with enterprise delivery experience, plus backup resources.' },
              { t: 'Knowledge management', d: 'Client-specific repositories, redundancy planning and rapid response capability.' },
              { t: 'Information security', d: 'Data confidentiality, regulatory compliance and perimeter-to-endpoint protection.' },
            ].map((x) => (
              <Reveal key={x.t}>
                <div className="h-full rounded-2xl border border-white/15 bg-white/[0.07] p-6 backdrop-blur-md transition-colors hover:bg-white/[0.12]">
                  <h3 className="font-display text-[16px] font-semibold text-white">{x.t}</h3>
                  <p className="mt-2 text-[0.97rem] leading-relaxed text-white/75">{x.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </PhotoSection>

      <CTABand />
    </>
  );
}

/* =================== CERTIFICATIONS =================== */
export function Certifications() {
  return (
    <>
      <PageHero
        eyebrow="Credentials" title="Certifications & Compliance"
        sub="Every document enterprise procurement teams ask to verify is listed here."
        crumbs={[{ label: 'About', to: '/about' }, { label: 'Certifications' }]}
      >
        <Link to="/procurement"><Button type="primary" size="large">Download procurement pack</Button></Link>
      </PageHero>

      <section className="px-container px-section">
        <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {certifications.map((c) => (
            <StaggerItem key={c.name}>
              <div className="px-card h-full">
                <div className="flex items-center gap-3">
                  <SafetyCertificateOutlined className="text-2xl text-brand-500" />
                  <h3 className="font-display text-[16.5px] font-semibold leading-tight text-slate-900 dark:text-white">{c.name}</h3>
                </div>
                <p className="px-body mt-1.5">{c.desc}</p>
                <Tag color="green" className="!mt-3">{c.status}</Tag>
              </div>
            </StaggerItem>
          ))}
        </Stagger>

        <Reveal className="mt-12">
          <h2 className="px-h3 text-slate-900 dark:text-white">Engineer certifications</h2>
          <p className="px-body mt-2">Our team members hold the following OEM certifications:</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {['Microsoft Azure Administrator', 'Microsoft 365 Enterprise Admin', 'Fortinet NSE 4', 'VMware VCP-DCV',
              'Veeam VMCE', 'Sophos Certified Engineer', 'Cisco CCNA', 'AWS Solutions Architect Associate',
              'ITIL v4 Foundation', 'CompTIA Security+'].map((c) => (
              <span key={c} className="rounded-lg border border-slate-200 px-3 py-1.5 text-[13px] text-slate-600 dark:border-white/10 dark:text-slate-300">
                {c}
              </span>
            ))}
          </div>
        </Reveal>
      </section>

      <CTABand />
    </>
  );
}
