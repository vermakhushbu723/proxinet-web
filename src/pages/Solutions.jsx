import React from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { Button, Tag, Collapse, Steps } from 'antd';
import {
  CloudOutlined, SafetyOutlined, DatabaseOutlined, CloudDownloadOutlined,
  WifiOutlined, TeamOutlined, VideoCameraOutlined, ArrowRightOutlined,
  WarningOutlined, FileTextOutlined, DownloadOutlined,
} from '@ant-design/icons';
import { solutionFamilies, findFamily, findChild } from '../data/solutions';
import { industries } from '../data/industries';
import { caseStudies } from '../data/proof';
import { Reveal, Stagger, StaggerItem, SectionHead, IconBadge, ArrowLink } from '../components/ui';
import { PageHero, CTABand, TickList, CardImage, FeatureImage } from '../components/blocks';
import { familyImg, solutionImg, caseImg } from '../data/images';

const icons = {
  cloud: <CloudOutlined />, shield: <SafetyOutlined />, server: <DatabaseOutlined />,
  backup: <CloudDownloadOutlined />, wifi: <WifiOutlined />, team: <TeamOutlined />,
  camera: <VideoCameraOutlined />,
};

/* =================== HUB: /solutions =================== */
export function SolutionsHub() {
  return (
    <>
      <PageHero
        eyebrow="Solutions"
        title="The full IT stack, one accountable partner"
        sub="Seven practice areas and over 40 services. Each solution has its own design, deployment and support model."
        crumbs={[{ label: 'Solutions' }]}
      />
      <section className="px-container px-section">
        <Stagger className="grid gap-5 md:grid-cols-2">
          {solutionFamilies.map((f) => (
            <StaggerItem key={f.slug}>
              <div className="px-card px-card-hover h-full">
                <Link to={`/solutions/${f.slug}`} className="group block">
                  <CardImage src={familyImg(f.slug, 1000)} alt={f.name} className="h-52" />
                </Link>
                <div className="flex items-start gap-4">
                  <IconBadge size="lg">{icons[f.icon]}</IconBadge>
                  <div className="min-w-0 flex-1">
                    <Link to={`/solutions/${f.slug}`}>
                      <h2 className="font-display text-xl font-semibold text-slate-900 hover:text-brand-600 dark:text-white">{f.name}</h2>
                    </Link>
                    <p className="mt-1 font-mono text-[11px] uppercase tracking-wider text-brand-500">{f.tag}</p>
                    <p className="px-body mt-3">{f.blurb}</p>
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap gap-1.5 border-t border-slate-100 pt-4 dark:border-white/10">
                  {f.children.map((c) => (
                    <Link key={c.slug} to={`/solutions/${f.slug}/${c.slug}`}>
                      <span className="inline-block rounded-lg border border-slate-200 px-2.5 py-1 text-[12.5px] text-slate-600 transition-colors hover:border-brand-400 hover:text-brand-600 dark:border-white/10 dark:text-slate-300">
                        {c.name}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </section>
      <CTABand />
    </>
  );
}

/* =================== FAMILY: /solutions/:family =================== */
export function SolutionFamily() {
  const { family } = useParams();
  const f = findFamily(family);
  if (!f) return <Navigate to="/solutions" replace />;

  const related = caseStudies.filter((c) => c.tech.includes(f.slug)).slice(0, 2);

  return (
    <>
      <PageHero
        eyebrow={f.tag} title={f.name} sub={f.hero}
        crumbs={[{ label: 'Solutions', to: '/solutions' }, { label: f.name }]}
      >
        <div className="flex flex-wrap gap-3">
          <Link to="/book-assessment"><Button type="primary" size="large">Book free assessment</Button></Link>
          <Link to="/contact"><Button size="large">Talk to an engineer</Button></Link>
        </div>
      </PageHero>

      {/* pains */}
      <section className="px-container px-section">
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.1fr]">
        <FeatureImage src={familyImg(f.slug, 1200)} alt={f.name} />
        <div>
        <SectionHead eyebrow="Sound familiar?" title="Are you running into these?" />
        <Stagger className="mt-8 grid gap-4">
          {f.pains.map((p) => (
            <StaggerItem key={p}>
              <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-5 dark:border-amber-500/25 dark:bg-amber-500/5">
                <WarningOutlined className="text-lg text-amber-500" />
                <p className="mt-2.5 text-[15px] font-medium text-slate-700 dark:text-slate-200">{p}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
        </div>
        </div>
      </section>

      {/* children */}
      <section className="border-y border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-ink-800">
        <div className="px-container px-section">
          <SectionHead eyebrow="Services" title={`What ${f.name} includes`} />
          <Stagger className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {f.children.map((c) => (
              <StaggerItem key={c.slug}>
                <Link to={`/solutions/${f.slug}/${c.slug}`} className="group block h-full">
                  <div className="px-card px-card-hover flex h-full flex-col">
                    <CardImage src={solutionImg(c.slug, 800)} alt={c.name} />
                    <h3 className="font-display text-[16.5px] font-semibold text-slate-900 group-hover:text-brand-600 dark:text-white dark:group-hover:text-brand-300">
                      {c.name}
                    </h3>
                    <p className="px-body mt-2 flex-1">{c.blurb}</p>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-brand-600 dark:text-brand-300">
                      Details <ArrowRightOutlined className="text-[10px] transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {related.length > 0 && (
        <section className="px-container px-section">
          <SectionHead eyebrow="Proof" title="Related case studies" />
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {related.map((c) => (
              <Reveal key={c.slug}>
                <Link to={`/case-studies/${c.slug}`} className="group block h-full">
                  <div className="px-card px-card-hover h-full">
                    <CardImage src={caseImg(c.slug, 900)} alt={c.title} className="h-48" />
                    <Tag color="red">{c.industry.replace(/-/g, ' ')}</Tag>
                    <h3 className="mt-3 font-display text-lg font-semibold text-slate-900 group-hover:text-brand-600 dark:text-white">{c.title}</h3>
                    <p className="px-body mt-2">{c.challenge.slice(0, 150)}…</p>
                    <p className="mt-4 font-display text-2xl font-bold text-brand-600 dark:text-brand-300">
                      {c.metric.value} <span className="text-[13px] font-normal text-slate-500">{c.metric.label}</span>
                    </p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      <CTABand />
    </>
  );
}

/* =================== DETAIL: /solutions/:family/:slug =================== */
export function SolutionDetail() {
  const { family, slug } = useParams();
  const f = findFamily(family);
  const c = findChild(family, slug);
  if (!f || !c) return <Navigate to="/solutions" replace />;

  const siblings = f.children.filter((x) => x.slug !== slug).slice(0, 4);
  const fitIndustries = industries.filter((i) => i.fits.includes(f.slug)).slice(0, 4);
  const related = caseStudies.filter((x) => x.tech.includes(f.slug))[0];

  const faqs = [
    { q: `How long does a ${c.name} deployment take?`, a: 'It depends on scope — a typical mid-size deployment runs two to six weeks. After the assessment you receive a phased timeline with a date against every milestone.' },
    { q: 'Will it integrate with our existing setup?', a: 'Yes. During the design phase we inventory the current environment and identify integration points, so a rip-and-replace is not needed.' },
    { q: 'What support follows the deployment?', a: 'It runs under an AMC or managed services plan — SLA-backed response, monitoring and monthly reporting. Complete documentation is included in the handover.' },
    { q: 'How is pricing decided?', a: 'On scale (users, sites, devices), coverage hours and the licensing model. After the assessment you receive an itemised BOQ and a commercial proposal.' },
  ];

  return (
    <>
      <PageHero
        eyebrow={f.name} title={c.name} sub={c.blurb}
        crumbs={[{ label: 'Solutions', to: '/solutions' }, { label: f.name, to: `/solutions/${f.slug}` }, { label: c.name }]}
      >
        <div className="flex flex-wrap gap-3">
          <Link to="/book-assessment"><Button type="primary" size="large">Book assessment</Button></Link>
          <Button size="large" icon={<DownloadOutlined />}>Download datasheet</Button>
        </div>
      </PageHero>

      <div className="px-container grid gap-12 px-section lg:grid-cols-[1fr_320px]">
        <div className="min-w-0">
          {/* what you get */}
          <Reveal>
            <FeatureImage src={solutionImg(c.slug, 1400)} alt={c.name} ratio="aspect-[16/9]" className="mb-12" />
            <h2 className="px-h3 text-slate-900 dark:text-white">What gets delivered</h2>
            <TickList items={c.bullets} className="mt-5" />
          </Reveal>

          {/* delivery process */}
          <Reveal className="mt-12">
            <h2 className="px-h3 text-slate-900 dark:text-white">Deployment process</h2>
            <Steps
              className="!mt-6" direction="vertical" current={-1}
              items={[
                { title: 'Discovery & assessment', description: 'Inventory of the current environment, a requirements workshop and identification of constraints.' },
                { title: 'Design & proposal', description: 'Reference architecture, BOM and BOQ, sizing and commercial options.' },
                { title: 'Pilot / POC', description: 'Validation on a limited scope before anything reaches production.' },
                { title: 'Phased rollout', description: 'Deployment in planned windows, with UAT sign-off after each phase.' },
                { title: 'Handover & documentation', description: 'As-built documentation, admin training and credential handover.' },
                { title: 'Managed support', description: 'SLA-backed monitoring, patching and monthly reporting.' },
              ]}
            />
          </Reveal>

          {/* industries */}
          {fitIndustries.length > 0 && (
            <Reveal className="mt-12">
              <h2 className="px-h3 text-slate-900 dark:text-white">Best fit for these industries</h2>
              <div className="mt-5 flex flex-wrap gap-2.5">
                {fitIndustries.map((i) => (
                  <Link key={i.slug} to={`/industries/${i.slug}`}>
                    <span className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-[14px] font-medium text-slate-700 transition-colors hover:border-brand-400 hover:text-brand-600 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-200">
                      {i.name} <ArrowRightOutlined className="text-[10px] text-slate-400" />
                    </span>
                  </Link>
                ))}
              </div>
            </Reveal>
          )}

          {/* case study */}
          {related && (
            <Reveal className="mt-12">
              <h2 className="px-h3 text-slate-900 dark:text-white">Related case study</h2>
              <Link to={`/case-studies/${related.slug}`} className="group mt-5 block">
                <div className="px-card px-card-hover flex flex-wrap items-center justify-between gap-5">
                  <img src={caseImg(related.slug, 300)} alt="" aria-hidden="true" loading="lazy" className="h-20 w-28 shrink-0 rounded-xl object-cover" />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-display text-[17px] font-semibold text-slate-900 group-hover:text-brand-600 dark:text-white">{related.title}</h3>
                    <p className="px-body mt-1.5">{related.result.slice(0, 130)}…</p>
                  </div>
                  <p className="shrink-0 font-display text-3xl font-bold text-brand-600 dark:text-brand-300">{related.metric.value}</p>
                </div>
              </Link>
            </Reveal>
          )}

          {/* FAQ */}
          <Reveal className="mt-12">
            <h2 className="px-h3 text-slate-900 dark:text-white">FAQs</h2>
            <Collapse
              className="!mt-5" bordered={false} accordion
              items={faqs.map((q, i) => ({ key: i, label: <span className="font-medium">{q.q}</span>, children: <p className="px-body">{q.a}</p> }))}
            />
          </Reveal>
        </div>

        {/* sticky sidebar */}
        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <div className="px-card">
            <p className="font-mono text-[11px] uppercase tracking-wider text-slate-400">Get started</p>
            <h3 className="mt-2 font-display text-lg font-semibold text-slate-900 dark:text-white">
              Talk to us about {c.name}
            </h3>
            <p className="px-body mt-2">A 30-minute call — no sales pitch, just your scenario and the options.</p>
            <Link to="/book-assessment" className="mt-4 block"><Button type="primary" block size="large">Book a call</Button></Link>
            <Link to="/contact" className="mt-2 block"><Button block size="large">Send enquiry</Button></Link>
          </div>

          <div className="px-card mt-4">
            <p className="font-mono text-[11px] uppercase tracking-wider text-slate-400">More in {f.name}</p>
            <ul className="mt-3 space-y-2">
              {siblings.map((s) => (
                <li key={s.slug}>
                  <Link to={`/solutions/${f.slug}/${s.slug}`} className="flex items-center gap-2 text-[14px] text-slate-600 hover:text-brand-600 dark:text-slate-300">
                    <span className="h-1 w-1 rounded-full bg-brand-400" /> {s.name}
                  </Link>
                </li>
              ))}
            </ul>
            <ArrowLink to={`/solutions/${f.slug}`} className="mt-4 !text-[13.5px]">All {f.name}</ArrowLink>
          </div>

          <div className="px-card mt-4">
            <FileTextOutlined className="text-lg text-brand-500" />
            <p className="mt-2 font-display font-semibold text-slate-900 dark:text-white">Need the datasheet?</p>
            <p className="px-body mt-1">A two-page PDF covering scope, deliverables and a typical timeline.</p>
            <Button className="mt-3" block icon={<DownloadOutlined />}>Download PDF</Button>
          </div>
        </aside>
      </div>

      <CTABand />
    </>
  );
}
