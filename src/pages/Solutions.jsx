import React from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { Button, Steps } from 'antd';
import {
  CloudOutlined, SafetyOutlined, DatabaseOutlined, CloudDownloadOutlined,
  WifiOutlined, TeamOutlined, VideoCameraOutlined, ArrowRightOutlined,
} from '@ant-design/icons';
import { solutionFamilies, findFamily, findChild } from '../data/solutions';
import { Reveal, Stagger, StaggerItem, SectionHead, IconBadge, ArrowLink } from '../components/ui';
import { PageHero, CTABand, TickList, CardImage, FeatureImage } from '../components/blocks';
import { familyImg, solutionImg } from '../data/images';

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

  return (
    <>
      <PageHero
        eyebrow={f.tag} title={f.name} sub={f.hero}
        crumbs={[{ label: 'Solutions', to: '/solutions' }, { label: f.name }]}
      >
        <Link to="/contact"><Button type="primary" size="large">Get A Quote</Button></Link>
      </PageHero>

      {/* children */}
      <section className="px-container px-section">
        <div>
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

  return (
    <>
      <PageHero
        eyebrow={f.name} title={c.name} sub={c.blurb}
        crumbs={[{ label: 'Solutions', to: '/solutions' }, { label: f.name, to: `/solutions/${f.slug}` }, { label: c.name }]}
      >
        <Link to="/contact"><Button type="primary" size="large">Get A Quote</Button></Link>
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
        </div>

        {/* sticky sidebar */}
        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <div className="px-card">
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
        </aside>
      </div>

      <CTABand />
    </>
  );
}
