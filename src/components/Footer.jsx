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
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import { company } from '../data/company';
import { certifications } from '../data/proof';
import LogoImage from '../LOGO-1.png';

// Only links that are NOT already in the navbar menus
const supportLinks = [
  { label: 'Client Portal login', to: '/portal/login' },
  { label: 'Service Status', to: '/status' },
  { label: 'Sitemap', to: '/sitemap' },
];

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-700 bg-slate-800 dark:border-white/10 dark:bg-ink-900">

      {/* ================= MAIN FOOTER ================= */}
      <div className="px-container py-12">

        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.7fr_1fr_1fr]">

          {/* ================= BRAND + ADDRESSES ================= */}
          <div>

            {/* Logo + Social Media */}
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-8">

              {/* Logo */}
              <Link
                to="/"
                className="inline-flex shrink-0 items-center"
              >
                <img
                  src={LogoImage}
                  alt={`${company.name} Logo`}
                  className="h-20 w-auto max-w-[320px] object-contain"
                />
              </Link>
            </div>


            {/* Offices / Addresses */}
            <div className="mt-7 max-w-[450px] space-y-5">

              {company.offices.map((o) => (
                <div
                  key={o.label}
                  className="flex gap-3"
                >

                  <EnvironmentOutlined className="mt-1 shrink-0 text-lg text-brand-400" />

                  <div>

                    <p className="mb-1.5 text-xs font-bold uppercase tracking-[0.12em] text-white">
                      {o.label}
                    </p>

                    <p className="m-0 text-sm font-medium leading-6 text-white">
                      {o.line}
                    </p>

                  </div>

                </div>
              ))}

            </div>

          </div>


          {/* ================= CONTACT ================= */}
          <div>

            <p className="mb-5 text-sm font-bold uppercase tracking-[0.12em] text-white">
              Contact Us
            </p>

            <ul className="m-0 list-none space-y-4 p-0">

              {company.phones.map((p) => (
                <li key={p}>

                  <a
                    href={`tel:${p}`}
                    className="
                      flex items-center gap-3
                      text-sm font-semibold text-white
                      transition-colors
                      hover:text-brand-300
                    "
                  >
                    <PhoneOutlined className="text-brand-400" />
                    {p}
                  </a>

                </li>
              ))}

              <li>

                <a
                  href={`mailto:${company.email}`}
                  className="
                    flex items-center gap-3
                    break-all
                    text-sm font-semibold text-white
                    transition-colors
                    hover:text-brand-300
                  "
                >
                  <MailOutlined className="shrink-0 text-brand-400" />
                  {company.email}
                </a>

              </li>

            </ul>


            {/* Business Hours */}
            <div
              className="
                mt-7 rounded-xl
                border border-slate-600
                bg-slate-700/40
                p-4
              "
            >

              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-brand-300">
                Business Hours
              </p>

              <p className="m-0 text-xs font-semibold leading-5 text-white">
                Mon–Sat · 9:30 AM – 6:30 PM
              </p>

              <p className="m-0 mt-1 text-xs font-semibold text-white">
                NOC Support · 24×7
              </p>

            </div>

          </div>


          {/* ================= SUPPORT ================= */}
         <div>

  <p className="mb-5 text-sm font-bold uppercase tracking-[0.12em] text-white">
    Support
  </p>

  <ul className="m-0 list-none space-y-3 p-0">

    {supportLinks.map((l) => (
      <li key={l.to}>

        <Link
          className="
            inline-flex
            text-sm
            font-semibold
            text-white
            transition-all
            hover:translate-x-1
            hover:text-brand-300
          "
          to={l.to}
        >
          →&nbsp; {l.label}
        </Link>

      </li>
    ))}

  </ul>


  {/* Connect With Us */}
  <div className="mt-8">

    <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-white">
      Connect With Us
    </p>

    <div className="flex gap-2.5">

      {[
        {
          i: <LinkedinFilled />,
          h: company.social.linkedin,
          l: 'LinkedIn',
        },
        {
          i: <FacebookFilled />,
          h: company.social.facebook,
          l: 'Facebook',
        },
        {
          i: <TwitterOutlined />,
          h: company.social.twitter,
          l: 'Twitter',
        },
        {
          i: <InstagramOutlined />,
          h: company.social.instagram,
          l: 'Instagram',
        },
      ].map((s) => (
        <a
          key={s.l}
          href={s.h}
          aria-label={s.l}
          target="_blank"
          rel="noopener noreferrer"
          className="
            grid h-10 w-10 place-items-center rounded-lg
            border border-slate-500
            bg-slate-700/40
            text-white
            transition-all duration-200
            hover:-translate-y-1
            hover:border-brand-400
            hover:bg-brand-500/20
            hover:text-brand-300
          "
        >
          {s.i}
        </a>
      ))}

    </div>

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