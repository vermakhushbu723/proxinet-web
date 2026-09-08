import React, { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Button, Drawer, Collapse, Switch } from 'antd';
import {
  MenuOutlined, SearchOutlined, PhoneOutlined, MailOutlined, CloseOutlined,
  BulbOutlined, MoonOutlined, LoginOutlined, RightOutlined, DownOutlined,
} from '@ant-design/icons';
import { AnimatePresence, motion } from 'framer-motion';
import { solutionFamilies } from '../data/solutions';
import { services } from '../data/services';
import { industries } from '../data/industries';
import { company } from '../data/company';
import { useTheme } from './ui';
import Logo from './Logo';
import SearchPanel from './SearchPanel';

const megaMenu = [
  {
    key: 'solutions', label: 'Solutions', to: '/solutions',
    columns: solutionFamilies.slice(0, 5).map((f) => ({
      title: f.name, to: `/solutions/${f.slug}`,
      items: f.children.slice(0, 6).map((c) => ({ label: c.name, to: `/solutions/${f.slug}/${c.slug}` })),
    })),
    footer: { text: 'Collaboration & Voice and Surveillance & Physical Security are also available', to: '/solutions' },
  },
  {
    key: 'services', label: 'Services', to: '/services',
    columns: [
      { title: 'Managed', items: services.slice(0, 4).map((s) => ({ label: s.name, to: `/services/${s.slug}` })) },
      { title: 'Professional', items: services.slice(4, 7).map((s) => ({ label: s.name, to: `/services/${s.slug}` })) },
      { title: 'Advisory & Supply', items: services.slice(7).map((s) => ({ label: s.name, to: `/services/${s.slug}` })) },
      { title: 'Plans', items: [{ label: 'SLA & Support Plans', to: '/services/plans' }, { label: 'Free IT Assessment', to: '/book-assessment' }] },
    ],
  },
  {
    key: 'industries', label: 'Industries', to: '/industries',
    columns: [
      { title: 'Regulated', items: industries.filter((i) => ['bfsi', 'pharma-healthcare', 'legal'].includes(i.slug)).map((i) => ({ label: i.name, to: `/industries/${i.slug}` })) },
      { title: 'Operations-heavy', items: industries.filter((i) => ['manufacturing', 'retail-ecommerce', 'construction-real-estate'].includes(i.slug)).map((i) => ({ label: i.name, to: `/industries/${i.slug}` })) },
      { title: 'People-heavy', items: industries.filter((i) => ['education', 'hospitality-tourism', 'it-ites'].includes(i.slug)).map((i) => ({ label: i.name, to: `/industries/${i.slug}` })) },
    ],
  },
  {
    key: 'why', label: 'Why ProXinet', to: '/about',
    columns: [
      { title: 'Company', items: [
        { label: 'About Us', to: '/about' },
        { label: 'Leadership Team', to: '/about/leadership' },
        { label: 'Our Story', to: '/about/story' },
        { label: 'Our Process', to: '/about/process' },
      ] },
      { title: 'Proof', items: [
        { label: 'Clients', to: '/clients' },
        { label: 'Case Studies', to: '/case-studies' },
        { label: 'Testimonials', to: '/testimonials' },
      ] },
      { title: 'Credentials', items: [
        { label: 'Partners & Alliances', to: '/partners' },
        { label: 'Certifications', to: '/about/certifications' },
        { label: 'Procurement Pack', to: '/procurement' },
      ] },
    ],
  },
  {
    key: 'resources', label: 'Resources', to: '/resources',
    columns: [
      { title: 'Read', items: [
        { label: 'Blog', to: '/blog' },
        { label: 'Whitepapers', to: '/resources/whitepapers' },
        { label: 'Glossary', to: '/resources/glossary' },
        { label: 'FAQs', to: '/resources/faq' },
      ] },
      { title: 'Tools', items: [
        { label: 'Cloud Cost Calculator', to: '/tools/cloud-cost-calculator' },
        { label: 'IT Security Health Score', to: '/tools/security-health-score' },
        { label: 'AMC Plan Selector', to: '/tools/amc-plan-selector' },
        { label: 'All tools', to: '/tools' },
      ] },
      { title: 'Company news', items: [
        { label: 'News & Events', to: '/news-events' },
        { label: 'Careers', to: '/careers' },
      ] },
    ],
  },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(null);        // mega menu key
  const [drawer, setDrawer] = useState(false);   // mobile
  const [search, setSearch] = useState(false);
  const { dark, toggle } = useTheme();
  const loc = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setDrawer(false); setOpen(null); }, [loc.pathname]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') { setOpen(null); setSearch(false); }
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); setSearch(true); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const linkClass = ({ isActive }, key) =>
    `flex shrink-0 items-center gap-1 whitespace-nowrap rounded-lg px-2.5 py-2 text-[14px] font-medium transition-colors xl:px-3 xl:text-[15px] ${
      isActive || open === key
        ? 'text-brand-600 dark:text-brand-300'
        : 'text-slate-700 hover:text-brand-600 dark:text-slate-200 dark:hover:text-brand-300'
    }`;

  return (
    <>
      {/* utility strip */}
      <div className="hidden bg-ink-900 text-slate-300 lg:block">
        <div className="px-container flex h-9 items-center justify-between gap-6 overflow-hidden text-[12.5px]">
          <div className="flex shrink-0 items-center gap-5 whitespace-nowrap">
            <a href={`tel:${company.phones[0]}`} className="flex items-center gap-2 hover:text-white">
              <PhoneOutlined /> {company.phones[0]}
            </a>
            <a href={`mailto:${company.email}`} className="flex items-center gap-2 hover:text-white">
              <MailOutlined /> {company.email}
            </a>
            <span className="hidden text-slate-500 xl:inline">Noida · New Delhi</span>
          </div>
          <div className="flex shrink-0 items-center gap-5 whitespace-nowrap">
            <span className="flex items-center gap-2 text-emerald-400">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              NOC online · 24×7
            </span>
            <Link to="/portal/login" className="flex items-center gap-2 hover:text-white">
              <LoginOutlined /> Client Login
            </Link>
          </div>
        </div>
      </div>

      {/* main bar */}
      <header
        onMouseLeave={() => setOpen(null)}
        className={`sticky top-0 z-50 border-b transition-all duration-300 ${
          scrolled
            ? 'border-slate-200/80 bg-white/85 backdrop-blur-xl dark:border-white/10 dark:bg-ink-900/85'
            : 'border-transparent bg-white dark:bg-ink-900'
        }`}
      >
        <div className="px-container flex h-[68px] flex-nowrap items-center justify-between gap-2">
          <Link to="/" aria-label="ProXinet home" className="shrink-0">
            <Logo />
          </Link>

          {/* desktop nav — always one line, never wraps */}
          <nav className="hidden min-w-0 flex-nowrap items-center gap-0.5 lg:flex">
            {megaMenu.map((m) => (
              <div key={m.key} className="shrink-0" onMouseEnter={() => setOpen(m.key)}>
                <NavLink to={m.to} className={(s) => linkClass(s, m.key)}>
                  {m.label}
                  <DownOutlined className={`text-[8px] transition-transform duration-300 ${open === m.key ? 'rotate-180' : ''}`} />
                </NavLink>
              </div>
            ))}
            <NavLink to="/contact" className={(s) => linkClass(s, 'contact')}>Contact</NavLink>
          </nav>

          <div className="flex shrink-0 items-center gap-1">
            <Button type="text" shape="circle" aria-label="Search" icon={<SearchOutlined />} onClick={() => setSearch(true)} />
            <Button
              type="text" shape="circle"
              aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
              icon={dark ? <BulbOutlined /> : <MoonOutlined />}
              onClick={toggle}
            />
            <Link to="/book-assessment" className="hidden sm:block">
              <Button type="primary" className="!whitespace-nowrap !px-3.5 !font-semibold xl:!px-5">
                <span className="hidden xl:inline">Get Free IT Assessment</span>
                <span className="xl:hidden">Free Assessment</span>
              </Button>
            </Link>
            <Button
              type="text" shape="circle" className="lg:!hidden"
              aria-label="Open menu" icon={<MenuOutlined />} onClick={() => setDrawer(true)}
            />
          </div>
        </div>

        {/* mega panel */}
        <AnimatePresence>
          {open && (
            <motion.div
              key={open}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="absolute inset-x-0 top-full hidden border-b border-slate-200 bg-white shadow-xl dark:border-white/10 dark:bg-ink-800 lg:block"
              onMouseEnter={() => setOpen(open)}
            >
              <div className="px-container py-8">
                {(() => {
                  const m = megaMenu.find((x) => x.key === open);
                  return (
                    <>
                      <div className="grid grid-cols-2 gap-x-8 gap-y-7 md:grid-cols-3 lg:grid-cols-5">
                        {m.columns.map((col) => (
                          <div key={col.title}>
                            {col.to ? (
                              <Link to={col.to} className="mb-3 block font-display text-[15px] font-semibold text-slate-900 hover:text-brand-600 dark:text-white dark:hover:text-brand-300">
                                {col.title}
                              </Link>
                            ) : (
                              <p className="mb-3 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
                                {col.title}
                              </p>
                            )}
                            <ul className="space-y-1.5">
                              {col.items.map((it) => (
                                <li key={it.to}>
                                  <Link
                                    to={it.to}
                                    className="group flex items-center gap-1.5 text-[14px] text-slate-600 transition-colors hover:text-brand-600 dark:text-slate-300 dark:hover:text-brand-300"
                                  >
                                    <span className="h-1 w-1 rounded-full bg-slate-300 transition-colors group-hover:bg-brand-500 dark:bg-slate-600" />
                                    {it.label}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                      <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-5 dark:border-white/10">
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {m.footer?.text || 'Not sure what you need? Start with a free 30-minute assessment.'}
                        </p>
                        <div className="flex gap-2">
                          <Link to={m.to}><Button>View all {m.label}</Button></Link>
                          <Link to="/book-assessment"><Button type="primary">Book assessment</Button></Link>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* mobile drawer */}
      <Drawer
        open={drawer} onClose={() => setDrawer(false)} placement="right" width={330}
        closeIcon={null} styles={{ header: { display: 'none' } }}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-white/10">
            <Logo compact />
            <Button type="text" shape="circle" icon={<CloseOutlined />} onClick={() => setDrawer(false)} aria-label="Close menu" />
          </div>
          <div className="flex-1 overflow-y-auto">
            <Collapse
              ghost expandIconPosition="end"
              items={megaMenu.map((m) => ({
                key: m.key,
                label: <span className="font-display font-semibold">{m.label}</span>,
                children: (
                  <div className="space-y-4 pl-1">
                    <Link to={m.to} className="block text-sm font-semibold text-brand-600 dark:text-brand-300">
                      All {m.label} <RightOutlined className="text-[10px]" />
                    </Link>
                    {m.columns.map((col) => (
                      <div key={col.title}>
                        <p className="mb-1.5 font-mono text-[10.5px] uppercase tracking-wider text-slate-400">{col.title}</p>
                        <ul className="space-y-1.5">
                          {col.items.map((it) => (
                            <li key={it.to}>
                              <Link to={it.to} className="text-sm text-slate-600 dark:text-slate-300">{it.label}</Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                ),
              }))}
            />
            <div className="space-y-3 border-t border-slate-200 p-4 dark:border-white/10">
              <Link to="/contact" className="block font-display font-semibold">Contact</Link>
              <Link to="/portal/login" className="block font-display font-semibold">Client Login</Link>
              <div className="flex items-center justify-between pt-2">
                <span className="text-sm text-slate-500">Dark mode</span>
                <Switch checked={dark} onChange={toggle} size="small" />
              </div>
            </div>
          </div>
          <div className="border-t border-slate-200 p-4 dark:border-white/10">
            <Link to="/book-assessment"><Button type="primary" block size="large">Get Free IT Assessment</Button></Link>
          </div>
        </div>
      </Drawer>

      <SearchPanel open={search} onClose={() => setSearch(false)} />
    </>
  );
}
