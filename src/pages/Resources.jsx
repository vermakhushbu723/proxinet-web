import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Navigate, useLocation } from 'react-router-dom';
import { Tag, Segmented, Input, Collapse, Empty } from 'antd';
import { SearchOutlined, CalendarOutlined } from '@ant-design/icons';
import { posts, findPost, glossary, faqs, whitepapers } from '../data/resources';
import { Reveal, Stagger, StaggerItem } from '../components/ui';
import { PageHero, CTABand, InfoCard, dotList } from '../components/blocks';
import { img, photos, postImg, slotImg } from '../data/images';

const fmt = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

const resImg = {
  Blog: photos.laptopDesk, 'Whitepapers & Guides': photos.writing, Glossary: photos.bwLaptop,
  FAQs: photos.phoneLaptop, 'Tools & Calculators': photos.analytics, 'News & Events': photos.event,
};
const wpImgs = [photos.virus, photos.signing, photos.dashboardLaptop, photos.hardDisk, photos.router, photos.documentation, photos.lineChart, photos.padlockCard];

/* =================== RESOURCE HUB =================== */
export function ResourcesHub() {
  const cards = [
    { t: 'Blog', d: 'Practical, vendor-neutral articles on infrastructure, security and cloud.', to: '/blog', n: `${posts.length} articles` },
    { t: 'Whitepapers & Guides', d: 'Playbooks, checklists and buyer guides.', to: '/resources/whitepapers', n: `${whitepapers.length} downloads` },
    { t: 'Glossary', d: 'RPO vs RTO, SAN vs NAS, EDR vs XDR — in plain language.', to: '/resources/glossary', n: `${glossary.length} terms` },
    { t: 'FAQs', d: 'Common questions on engagement, support, commercials and security.', to: '/resources/faq', n: `${faqs.length} questions` },
    { t: 'Tools & Calculators', d: 'Cloud cost, security score, AMC plan selector and sizing tools.', to: '/tools', n: '6 tools' },
    { t: 'News & Events', d: 'Company updates, webinars and partner events.', to: '/news-events', n: 'Updates' },
  ];
  return (
    <>
      <PageHero
        eyebrow="Resources" title="To read, to understand, to decide"
        sub="Practical guides, tools and answers — no sales fluff."
        crumbs={[{ label: 'Resources' }]}
      />
      <section className="px-container px-section">
        <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((c) => (
            <StaggerItem key={c.t}>
              <InfoCard to={c.to} image={img(resImg[c.t], 700)} as="h2" title={c.t} meta={c.n} text={c.d} cta="Open" />
            </StaggerItem>
          ))}
        </Stagger>
      </section>
      <CTABand />
    </>
  );
}

/* =================== BLOG =================== */
export function Blog() {
  const [cat, setCat] = useState('All');
  const [q, setQ] = useState('');
  const cats = ['All', ...new Set(posts.map((p) => p.cat))];
  const list = useMemo(
    () => posts.filter((p) => (cat === 'All' || p.cat === cat) && `${p.title} ${p.excerpt}`.toLowerCase().includes(q.toLowerCase())),
    [cat, q]
  );

  return (
    <>
      <PageHero
        eyebrow="Blog" title="Practical IT writing, without the jargon"
        sub="Real answers to questions clients ask us."
        crumbs={[{ label: 'Blog' }]}
      />
      <section className="px-container px-section">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="overflow-x-auto pb-1"><Segmented options={cats} value={cat} onChange={setCat} /></div>
          <Input
            prefix={<SearchOutlined className="text-slate-400" />} placeholder="Search articles…"
            className="!max-w-xs" value={q} onChange={(e) => setQ(e.target.value)} allowClear
          />
        </div>

        {list.length === 0 ? (
          <Empty description="No articles found" />
        ) : (
          <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((p) => (
              <StaggerItem key={p.slug}>
                <InfoCard
                  to={`/blog/${p.slug}`} image={postImg(p.slug, 700)} as="h2"
                  title={p.title} meta={dotList([p.cat, p.read, fmt(p.date)])} text={p.excerpt} cta="Read article"
                />
              </StaggerItem>
            ))}
          </Stagger>
        )}
      </section>
      <CTABand />
    </>
  );
}

export function BlogPost() {
  const { slug } = useParams();
  const p = findPost(slug);
  if (!p) return <Navigate to="/blog" replace />;

  return (
    <>
      <PageHero
        eyebrow={p.cat} title={p.title} sub={p.excerpt} compact
        crumbs={[{ label: 'Blog', to: '/blog' }, { label: p.cat }]}
      >
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[11.5px] uppercase tracking-wider text-slate-400">
          <span className="flex items-center gap-1.5"><CalendarOutlined /> {fmt(p.date)}</span>
          <span>{p.read} read</span>
          <span>{p.author}</span>
        </div>
      </PageHero>

      <div className="px-container px-section">
        <article className="mx-auto min-w-0 max-w-[68ch]">
          <img src={postImg(p.slug, 1400)} alt={p.title} className="mb-10 aspect-[16/9] w-full rounded-3xl object-cover shadow-lift" />
          {p.body.map((b, i) => (
            <Reveal key={i} className="mb-8">
              <h2 className="px-h3 text-slate-900 dark:text-white">{b.h}</h2>
              <p className="px-lead mt-3">{b.p}</p>
            </Reveal>
          ))}
        </article>

      </div>

      <CTABand />
    </>
  );
}

/* =================== WHITEPAPERS (gated) =================== */
export function Whitepapers() {
  return (
    <>
      <PageHero
        eyebrow="Whitepapers" title="Guides, playbooks and checklists"
        sub="Practical documents you can use right away."
        crumbs={[{ label: 'Resources', to: '/resources' }, { label: 'Whitepapers' }]}
      />
      <section className="px-container px-section">
        <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {whitepapers.map((w, wi) => (
            <StaggerItem key={w.title}>
              <InfoCard
                to="/contact" image={slotImg(`whitepaper:${wi % wpImgs.length}`, wpImgs[wi % wpImgs.length], 700)} as="h2"
                title={w.title} meta={dotList([w.cat, `${w.pages} pages · PDF`])} text={w.desc} cta="Request a copy"
              />
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <CTABand />
    </>
  );
}

/* =================== GLOSSARY =================== */
export function Glossary() {
  const [q, setQ] = useState('');
  const list = glossary.filter((g) => `${g.term} ${g.full} ${g.def}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <>
      <PageHero
        eyebrow="Glossary" title="IT infrastructure terms in plain language"
        sub="What the acronyms flying around vendor calls actually mean."
        crumbs={[{ label: 'Resources', to: '/resources' }, { label: 'Glossary' }]}
      >
        <Input
          size="large" prefix={<SearchOutlined className="text-slate-400" />}
          placeholder="Search a term… (RPO, SAN, XDR)" className="!max-w-md"
          value={q} onChange={(e) => setQ(e.target.value)} allowClear
        />
      </PageHero>

      <section className="px-container px-section">
        {list.length === 0 ? (
          <Empty description={`No term found for "${q}"`} />
        ) : (
          <Stagger className="grid gap-4 md:grid-cols-2" gap={0.03}>
            {list.map((g) => (
              <StaggerItem key={g.term}>
                <div className="px-card h-full">
                  <div className="flex items-baseline gap-2.5">
                    <h2 className="font-display text-lg font-bold text-brand-600 dark:text-brand-300">{g.term}</h2>
                    <span className="text-[13.5px] text-slate-500 dark:text-slate-400">{g.full}</span>
                  </div>
                  <p className="px-body mt-2">{g.def}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        )}
      </section>
      <CTABand />
    </>
  );
}

/* =================== FAQ =================== */
export function FAQ() {
  const cats = [...new Set(faqs.map((f) => f.cat))];
  return (
    <>
      <PageHero
        eyebrow="FAQ" title="Common questions, direct answers"
        sub="Engagement, support, commercials and security — the things people ask first."
        crumbs={[{ label: 'Resources', to: '/resources' }, { label: 'FAQ' }]}
      />
      <section className="px-container px-section">
        <div className="mx-auto max-w-3xl space-y-10">
          {cats.map((c) => (
            <Reveal key={c}>
              <h2 className="px-h3 mb-4 text-slate-900 dark:text-white">{c}</h2>
              <Collapse
                bordered={false} accordion
                items={faqs.filter((f) => f.cat === c).map((f, i) => ({
                  key: i, label: <span className="font-medium">{f.q}</span>, children: <p className="px-body">{f.a}</p>,
                }))}
              />
            </Reveal>
          ))}
        </div>
      </section>
      <CTABand title="Question not answered here?" sub="Just ask us directly — you get a reply within two working hours." />
    </>
  );
}

/* =================== NEWS & EVENTS =================== */
export function NewsEvents() {
  const { hash } = useLocation();
  const [type, setType] = useState('All');
  useEffect(() => {
    setType(hash === '#news' ? 'News' : hash === '#events' ? 'Event' : 'All');
  }, [hash]);
  // Posts from proxinet.in/news and proxinet.in/events — each opens the original post
  const all = [
    { date: '2020-12-04', type: 'Event', title: 'Installing, Configuring and Maintaining Windows 10: Maintaining Windows 10', desc: 'Online course · 4 Dec 2020, 9:30 AM – 10:30 AM.', href: 'https://proxinet.in/installing-configuring-and-maintaining-windows-10-maintaining-windows-10/' },
    { date: '2020-12-02', type: 'News', title: 'Cisco to Host 2020 Annual Meeting of Shareholders', desc: '2020 Cisco Virtual Annual Meeting of Shareholders — Thursday, December 10, 2020, 8:00 a.m. PT.', href: 'https://proxinet.in/cisco-to-host-2020-annual-meeting-of-shareholders/' },
    { date: '2020-12-02', type: 'Event', title: 'Webinar | Firstline Workers First', desc: 'Join our webinar, Firstline Workers First, to learn why it’s important that Firstline Workers are empowered.', href: 'https://proxinet.in/webinar-firstline-workers-first/' },
    { date: '2020-11-30', type: 'News', title: 'What’s new in the Windows 10 October 2020 Update', desc: 'A refreshing Start — the Start menu has a more streamlined design with a uniform, partially transparent background.', href: 'https://proxinet.in/whats-new-in-the-windows-10-october-2020-update/' },
    { date: '2020-11-19', type: 'News', title: 'Dell Technologies Forum', desc: 'Be ready for what’s next at Dell Technologies Forum.', href: 'https://proxinet.in/dell-technologies/' },
    { date: '2020-11-18', type: 'News', title: 'The Cloud Innovation Summit', desc: 'Join us in our live virtual summit to learn and explore how to reshape your business with the cloud.', href: 'https://proxinet.in/the-cloud-innovation-summit/' },
    { date: '2020-11-18', type: 'News', title: 'Cyber Security', desc: 'The cyber security landscape is changing at a dizzying pace, meaning that cyber security leaders must keep up.', href: 'https://proxinet.in/cyber-security/' },
  ];
  const items = type === 'All' ? all : all.filter((n) => n.type === type);
  return (
    <>
      <PageHero
        eyebrow="Company" title="News & Events"
        sub="Webinars, partner sessions and company updates."
        crumbs={[{ label: 'News & Events' }]}
      />
      <section className="px-container px-section">
        <div className="mx-auto max-w-3xl space-y-4">
          <Segmented
            className="!mb-4"
            value={type}
            onChange={setType}
            options={[{ label: 'All', value: 'All' }, { label: 'News', value: 'News' }, { label: 'Events', value: 'Event' }]}
          />
          {items.map((n) => (
            <Reveal key={n.title}>
              <div className="px-card px-card-hover flex flex-wrap items-start gap-5">
                <div className="shrink-0 text-center">
                  <p className="font-display text-2xl font-bold text-brand-600 dark:text-brand-300">
                    {new Date(n.date).getDate()}
                  </p>
                  <p className="font-mono text-[10.5px] uppercase tracking-wider text-slate-400">
                    {new Date(n.date).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' })}
                  </p>
                </div>
                <div className="min-w-0 flex-1">
                  <Tag color={n.type === 'Event' ? 'gold' : 'blue'}>{n.type}</Tag>
                  <h2 className="mt-2 font-display text-[17px] font-semibold text-slate-900 dark:text-white">{n.title}</h2>
                  <p className="px-body mt-1.5">{n.desc}</p>
                  <a href={n.href} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-300">
                    Read more <span aria-hidden="true">↗</span>
                  </a>
                </div>
                <img
                  src={n.type === 'Event' ? slotImg('news-event-thumb', photos.event, 400) : slotImg('news-news-thumb', photos.openOffice, 400)} alt="" aria-hidden="true" loading="lazy"
                  className="hidden h-24 w-36 shrink-0 rounded-xl object-cover sm:block"
                />
              </div>
            </Reveal>
          ))}
        </div>
      </section>
      <CTABand />
    </>
  );
}
