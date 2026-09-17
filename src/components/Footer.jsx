import React from 'react';
import { Link } from 'react-router-dom';
import { Input, Button, message } from 'antd';
import {
  PhoneOutlined, MailOutlined, EnvironmentOutlined, LinkedinFilled,
  FacebookFilled, TwitterOutlined, InstagramOutlined, SafetyCertificateOutlined,
} from '@ant-design/icons';
import { company } from '../data/company';
import { certifications } from '../data/proof';
import Logo from './Logo';
import { subscribeEmail, showSubmitError } from '../api/public';

// Only links that are NOT already in the navbar menus
const supportLinks = [
  { label: 'Client Portal login', to: '/portal/login' },
  { label: 'Service Status', to: '/status' },
  { label: 'Sitemap', to: '/sitemap' },
];

export default function Footer() {
  const [email, setEmail] = React.useState('');
  const [saving, setSaving] = React.useState(false);
  const subscribe = async () => {
    if (!/^\S+@\S+\.\S+$/.test(email)) return message.error('Please enter a valid email address.');
    setSaving(true);
    try {
      const r = await subscribeEmail(email);
      if (r.alreadySubscribed) message.info('This email is already subscribed.');
      else message.success('Subscribed — the monthly IT digest will arrive in your inbox.');
      setEmail('');
    } catch (err) {
      showSubmitError(err);
    } finally {
      setSaving(false);
    }
    return undefined;
  };

  return (
    <footer className="mt-auto border-t border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-ink-900">
      {/* newsletter strip */}
      <div className="border-b border-slate-200 dark:border-white/10">
        <div className="px-container flex flex-col items-start justify-between gap-5 py-6 md:flex-row md:items-center">
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
            <Button size="large" type="primary" onClick={subscribe} loading={saving}>Subscribe</Button>
          </div>
        </div>
      </div>

      {/* main grid */}
      <div className="px-container grid gap-8 py-10 gap-x-8 md:grid-cols-2 lg:grid-cols-[1.5fr_1.1fr_1fr_.9fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-[34ch] text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            Your end-to-end IT infrastructure partner — cloud, security, data center, backup and network.
            Designed, deployed and managed 24/7.
          </p>
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

        <div>
          <p className="mb-3.5 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Offices</p>
          <div className="space-y-3 text-sm">
            {company.offices.map((o) => (
              <div key={o.label} className="flex gap-2.5 text-slate-500 dark:text-slate-400">
                <EnvironmentOutlined className="mt-1 shrink-0 text-brand-500" />
                <span>
                  <span className="block font-mono text-[10.5px] uppercase tracking-wider text-slate-400">{o.label}</span>
                  {o.line}
                </span>
              </div>
            ))}

          </div>
        </div>

        <div>
          <p className="mb-3.5 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Talk to us</p>
          <ul className="m-0 list-none space-y-3 p-0 text-sm">
            {company.phones.map((p) => (
              <li key={p}>
                <a href={`tel:${p}`} className="flex items-center gap-2.5 text-slate-600 hover:text-brand-600 dark:text-slate-300">
                  <PhoneOutlined className="text-brand-500" /> {p}
                </a>
              </li>
            ))}
            <li>
              <a href={`mailto:${company.email}`} className="flex items-center gap-2.5 text-slate-600 hover:text-brand-600 dark:text-slate-300">
                <MailOutlined className="text-brand-500" /> {company.email}
              </a>
            </li>
            <li className="font-mono text-[11px] uppercase tracking-wider text-slate-400">Mon–Sat · 9:30 AM – 6:30 PM · NOC 24×7</li>
          </ul>
        </div>

        <div>
          <p className="mb-3.5 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Support</p>
          <ul className="m-0 list-none space-y-2.5 p-0">
            {supportLinks.map((l) => (
              <li key={l.to}>
                <Link className="text-[13.5px] text-slate-600 transition-colors hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-300" to={l.to}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* certifications row */}
      <div className="border-t border-slate-200 dark:border-white/10">
        <div className="px-container flex flex-wrap items-center gap-x-6 gap-y-2.5 py-3.5">
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
        <div className="px-container flex flex-col items-center justify-between gap-3 py-3.5 text-[12.5px] text-slate-500 sm:flex-row dark:text-slate-400">
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
