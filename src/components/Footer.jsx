import React from 'react';
import { Link } from 'react-router-dom';
import { Input, Button, message } from 'antd';
import {
  PhoneOutlined, MailOutlined, EnvironmentOutlined, LinkedinFilled,
  FacebookFilled, TwitterOutlined, InstagramOutlined, SafetyCertificateOutlined,
} from '@ant-design/icons';
import { company } from '../data/company';
import { solutionFamilies } from '../data/solutions';
import { services } from '../data/services';
import { industries } from '../data/industries';
import { certifications } from '../data/proof';
import Logo from './Logo';

const cols = [
  { title: 'Solutions', links: solutionFamilies.map((f) => ({ label: f.name, to: `/solutions/${f.slug}` })) },
  { title: 'Services', links: services.slice(0, 7).map((s) => ({ label: s.name, to: `/services/${s.slug}` })) },
  { title: 'Industries', links: industries.map((i) => ({ label: i.name, to: `/industries/${i.slug}` })) },
  {
    title: 'Company', links: [
      { label: 'About Us', to: '/about' }, { label: 'Leadership', to: '/about/leadership' },
      { label: 'Our Process', to: '/about/process' }, { label: 'Clients', to: '/clients' },
      { label: 'Case Studies', to: '/case-studies' }, { label: 'Partners', to: '/partners' },
      { label: 'Careers', to: '/careers' }, { label: 'News & Events', to: '/news-events' },
    ],
  },
  {
    title: 'Resources', links: [
      { label: 'Blog', to: '/blog' }, { label: 'Whitepapers', to: '/resources/whitepapers' },
      { label: 'Glossary', to: '/resources/glossary' }, { label: 'FAQs', to: '/resources/faq' },
      { label: 'Tools & Calculators', to: '/tools' }, { label: 'Procurement Pack', to: '/procurement' },
      { label: 'Service Status', to: '/status' }, { label: 'Sitemap', to: '/sitemap' },
    ],
  },
];

export default function Footer() {
  const [email, setEmail] = React.useState('');
  const subscribe = () => {
    if (!/^\S+@\S+\.\S+$/.test(email)) return message.error('Please enter a valid email address.');
    message.success('Subscribed — the monthly IT digest will arrive in your inbox.');
    setEmail('');
  };

  return (
    <footer className="mt-auto border-t border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-ink-900">
      {/* newsletter strip */}
      <div className="border-b border-slate-200 dark:border-white/10">
        <div className="px-container flex flex-col items-start justify-between gap-5 py-8 md:flex-row md:items-center">
          <div>
            <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
              Monthly IT digest — practical, vendor-neutral
            </h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Security advisories, EOL alerts and one useful guide. Just one email a month.
            </p>
          </div>
          <div className="flex w-full max-w-md gap-2">
            <Input
              size="large" placeholder="work@company.com" value={email}
              onChange={(e) => setEmail(e.target.value)} onPressEnter={subscribe}
              aria-label="Email address for newsletter"
            />
            <Button size="large" type="primary" onClick={subscribe}>Subscribe</Button>
          </div>
        </div>
      </div>

      {/* main grid */}
      <div className="px-container grid gap-10 py-14 lg:grid-cols-[1.3fr_repeat(5,1fr)]">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            Your end-to-end IT infrastructure partner — cloud, security, data center, backup and network.
            Designed, deployed and managed 24/7.
          </p>
          <div className="mt-5 space-y-3 text-sm">
            {company.offices.map((o) => (
              <div key={o.label} className="flex gap-2.5 text-slate-500 dark:text-slate-400">
                <EnvironmentOutlined className="mt-1 shrink-0 text-brand-500" />
                <span>
                  <span className="block font-mono text-[10.5px] uppercase tracking-wider text-slate-400">{o.label}</span>
                  {o.line}
                </span>
              </div>
            ))}
            <a href={`tel:${company.phones[0]}`} className="flex items-center gap-2.5 text-slate-600 hover:text-brand-600 dark:text-slate-300">
              <PhoneOutlined className="text-brand-500" /> {company.phones.join(' · ')}
            </a>
            <a href={`mailto:${company.email}`} className="flex items-center gap-2.5 text-slate-600 hover:text-brand-600 dark:text-slate-300">
              <MailOutlined className="text-brand-500" /> {company.email}
            </a>
          </div>
          <div className="mt-5 flex gap-2">
            {[
              { i: <LinkedinFilled />, h: company.social.linkedin, l: 'LinkedIn' },
              { i: <FacebookFilled />, h: company.social.facebook, l: 'Facebook' },
              { i: <TwitterOutlined />, h: company.social.twitter, l: 'Twitter' },
              { i: <InstagramOutlined />, h: company.social.instagram, l: 'Instagram' },
            ].map((s) => (
              <a
                key={s.l} href={s.h} aria-label={s.l}
                className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:border-brand-400 hover:bg-brand-50 hover:text-brand-600 dark:border-white/10 dark:hover:bg-white/5"
              >
                {s.i}
              </a>
            ))}
          </div>
        </div>

        {cols.map((c) => (
          <div key={c.title}>
            <p className="mb-3.5 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
              {c.title}
            </p>
            <ul className="space-y-2">
              {c.links.map((l) => (
                <li key={l.to}>
                  <Link className="text-[13.5px] text-slate-600 transition-colors hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-300" to={l.to}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* certifications row */}
      <div className="border-t border-slate-200 dark:border-white/10">
        <div className="px-container flex flex-wrap items-center gap-x-6 gap-y-3 py-5">
          <span className="font-mono text-[11px] uppercase tracking-wider text-slate-400">Credentials</span>
          {certifications.map((c) => (
            <span key={c.name} className="flex items-center gap-1.5 text-[12.5px] text-slate-500 dark:text-slate-400">
              <SafetyCertificateOutlined className="text-brand-500" /> {c.name}
            </span>
          ))}
        </div>
      </div>

      {/* legal bar */}
      <div className="border-t border-slate-200 dark:border-white/10">
        <div className="px-container flex flex-col items-center justify-between gap-3 py-5 text-[12.5px] text-slate-500 sm:flex-row dark:text-slate-400">
          <span>© {new Date().getFullYear()} {company.name}. All rights reserved.</span>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link className="hover:text-brand-600" to="/legal/privacy-policy">Privacy Policy</Link>
            <Link className="hover:text-brand-600" to="/legal/terms">Terms of Service</Link>
            <Link className="hover:text-brand-600" to="/legal/cookie-policy">Cookie Policy</Link>
            <Link className="hover:text-brand-600" to="/legal/dpdp-compliance">DPDP Compliance</Link>
            <Link className="hover:text-brand-600" to="/legal/accessibility">Accessibility</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
