import React from 'react';
import { Link } from 'react-router-dom';
import {
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  LinkedinFilled,
  FacebookFilled,
  TwitterOutlined,
  InstagramOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { company } from '../data/company';
import LogoImage from '../LOGO-1.png';

const social = [
  { i: <LinkedinFilled />, h: company.social.linkedin, l: 'LinkedIn' },
  { i: <FacebookFilled />, h: company.social.facebook, l: 'Facebook' },
  { i: <TwitterOutlined />, h: company.social.twitter, l: 'Twitter' },
  { i: <InstagramOutlined />, h: company.social.instagram, l: 'Instagram' },
];

/** Column heading with a short brand-coloured underline. */
function ColHead({ children }) {
  return (
    <p className="mb-6 text-sm font-bold uppercase tracking-[0.14em] text-white">
      {children}
      <span className="mt-2.5 block h-0.5 w-10 rounded-full bg-gradient-to-r from-brand-500 to-orange-400" />
    </p>
  );
}

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-700 bg-slate-800 dark:border-white/10 dark:bg-ink-900">

      {/* ================= MAIN FOOTER ================= */}
      <div className="px-container py-14">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-[1.2fr_1.3fr_1fr] lg:gap-14">

          {/* ================= BRAND ================= */}
          <div>
            <Link to="/" className="inline-flex shrink-0 items-center rounded-xl bg-white px-4 py-2.5 shadow-lift">
              <img src={LogoImage} alt={`${company.name} Logo`} className="h-14 w-auto max-w-[260px] object-contain" />
            </Link>

            <p className="mt-6 max-w-[340px] text-sm leading-6 text-slate-300">
              One Stop IT Solutions — cloud, cybersecurity, data center, backup and networking,
              designed, deployed and managed by one accountable team.
            </p>

            <p className="mb-3 mt-7 text-xs font-bold uppercase tracking-[0.14em] text-white">Connect With Us</p>
            <div className="flex gap-2.5">
              {social.map((x) => (
                <a
                  key={x.l} href={x.h} aria-label={x.l} target="_blank" rel="noopener noreferrer"
                  className="grid h-10 w-10 place-items-center rounded-full border border-slate-500 bg-slate-700/40 text-white transition-all duration-200 hover:-translate-y-1 hover:border-brand-400 hover:bg-brand-500 hover:text-white"
                >
                  {x.i}
                </a>
              ))}
            </div>
          </div>

          {/* ================= OFFICES ================= */}
          <div>
            <ColHead>Our Offices</ColHead>
            <div className="space-y-6">
              {company.offices.map((o) => (
                <div key={o.label} className="flex gap-3.5">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-500/15 text-brand-300">
                    <EnvironmentOutlined />
                  </span>
                  <div>
                    <p className="mb-1 text-xs font-bold uppercase tracking-[0.12em] text-white">{o.label}</p>
                    <p className="m-0 text-sm leading-6 text-slate-300">{o.line}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ================= CONTACT ================= */}
          <div>
            <ColHead>Contact Us</ColHead>
            <ul className="m-0 list-none space-y-4 p-0">
              {company.phones.map((p) => (
                <li key={p}>
                  <a href={`tel:${p}`} className="flex items-center gap-3.5 text-sm font-semibold text-white transition-colors hover:text-brand-300">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-500/15 text-brand-300"><PhoneOutlined /></span>
                    {p}
                  </a>
                </li>
              ))}
              <li>
                <a href={`mailto:${company.email}`} className="flex items-center gap-3.5 break-all text-sm font-semibold text-white transition-colors hover:text-brand-300">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-500/15 text-brand-300"><MailOutlined /></span>
                  {company.email}
                </a>
              </li>
            </ul>

            <div className="mt-7 rounded-xl border border-slate-600 bg-slate-700/40 p-4">
              <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-300">
                <ClockCircleOutlined /> Business Hours
              </p>
              <p className="m-0 text-sm font-semibold leading-6 text-white">Mon–Sat · 9:30 AM – 6:30 PM</p>
              <p className="m-0 mt-1 flex items-center gap-2 text-sm font-semibold text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400" /> NOC Support · 24×7
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* ================= LEGAL ================= */}
      <div className="border-t border-slate-600">

        <div
          className="
            px-container
            flex flex-col
            items-center justify-between
            gap-3
            py-4
            text-[12px]
            text-white
            sm:flex-row
          "
        >

          <span className="font-medium">
            © {new Date().getFullYear()} {company.name}. All rights reserved.
          </span>

          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">

            <Link
              className="font-medium transition-colors hover:text-brand-300"
              to="/legal/privacy-policy"
            >
              Privacy Policy
            </Link>

            <Link
              className="font-medium transition-colors hover:text-brand-300"
              to="/legal/terms"
            >
              Terms of Service
            </Link>

            <Link
              className="font-medium transition-colors hover:text-brand-300"
              to="/legal/cookie-policy"
            >
              Cookie Policy
            </Link>

            <Link
              className="font-medium transition-colors hover:text-brand-300"
              to="/legal/dpdp-compliance"
            >
              DPDP Compliance
            </Link>

            <Link
              className="font-medium transition-colors hover:text-brand-300"
              to="/legal/accessibility"
            >
              Accessibility
            </Link>

          </div>

        </div>

      </div>

    </footer>
  );
}