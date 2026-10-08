import React, { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';

import { Button, Drawer, Collapse, Switch } from 'antd';

import {
  MenuOutlined,
  SearchOutlined,
  PhoneOutlined,
  MailOutlined,
  CloseOutlined,
  BulbOutlined,
  MoonOutlined,
  LoginOutlined,
  RightOutlined,
  DownOutlined,
} from '@ant-design/icons';

import { AnimatePresence, motion } from 'framer-motion';

import { company } from '../data/company';
import { useTheme } from './ui';
import SearchPanel from './SearchPanel';

import LogoImage from '../LOGO-1.png';


/* ============================================================
   MENU — same items as the proxinet.in main menu
============================================================ */

const sol = (family, slug) => `/solutions/${family}/${slug}`;

const solutionMenu = [
  {
    title: 'Cloud Solutions',
    to: '/solutions/cloud',
    items: [
      { label: 'Azure', to: sol('cloud', 'microsoft-azure') },
      { label: 'AWS', to: sol('cloud', 'aws') },
      { label: 'Microsoft 365', to: sol('cloud', 'microsoft-365') },
      { label: 'Google Cloud', to: sol('cloud', 'google-cloud') },
      { label: 'Hybrid Cloud', to: sol('cloud', 'hybrid-cloud') },
      { label: 'Cloud Migration', to: sol('cloud', 'cloud-migration') },
    ],
  },
  {
    title: 'Security Solution',
    to: '/solutions/cyber-security',
    items: [
      { label: 'End Point Solutions', to: sol('cyber-security', 'endpoint-security') },
      { label: 'Email Security', to: sol('cyber-security', 'email-security') },
      { label: 'SSL and VPN', to: sol('cyber-security', 'ssl-vpn') },
      { label: 'Data Loss Prevention', to: sol('cyber-security', 'data-loss-prevention') },
      { label: 'Mobile Device Management', to: sol('cyber-security', 'mobile-device-management') },
      { label: 'Proxy and Content Filters', to: sol('cyber-security', 'web-proxy-filtering') },
    ],
  },
  {
    title: 'Data Center Solutions',
    to: '/solutions/data-center',
    items: [
      { label: 'Virtualization', to: sol('data-center', 'server-virtualization') },
      { label: 'Server', to: sol('data-center', 'servers') },
      { label: 'SAN', to: sol('data-center', 'san-storage') },
      { label: 'NAS', to: sol('data-center', 'nas-storage') },
    ],
  },
  {
    title: 'Backup Solutions',
    to: '/solutions/backup-dr',
    items: [
      { label: 'Backup', to: sol('backup-dr', 'veeam-backup') },
      { label: 'Disaster Recovery', to: sol('backup-dr', 'disaster-recovery-draas') },
    ],
  },
  {
    title: 'Network Solutions',
    to: '/solutions/network',
    items: [
      { label: 'Wired', to: sol('network', 'structured-cabling') },
      { label: 'Wireless', to: sol('network', 'enterprise-wifi') },
    ],
  },
];

const dropItem =
  'block whitespace-nowrap px-5 py-2.5 text-[13.5px] font-medium uppercase tracking-[0.02em] text-slate-200 transition-all duration-200 hover:translate-x-1 hover:text-brand-300';

const megaMenu = [
  { key: 'home', label: 'Home', to: '/' },
  { key: 'solutions', label: 'Solution', to: '/solutions', columns: solutionMenu },
  {
    key: 'services',
    label: 'Services',
    to: '/services',
    columns: [
      {
        title: 'Services',
        items: [
          { label: 'Infrastructure Services', to: '/services/infrastructure-services' },
          { label: 'Data Center Services', to: '/services/data-center-services' },
          { label: 'Network Services', to: '/services/network-services' },
          { label: 'Cloud Services', to: '/services/cloud-services' },
        ],
      },
    ],
  },
  { key: 'clients', label: 'Client', to: '/clients' },
  {
    key: 'resources',
    label: 'Resources',
    to: '/news-events',
    columns: [
      {
        title: 'Resources',
        items: [
          { label: 'News', to: '/news-events#news' },
          { label: 'Events', to: '/news-events#events' },
        ],
      },
    ],
  },
  { key: 'alliances', label: 'Alliances', to: '/partners' },
  { key: 'contact', label: 'Contact', to: '/contact' },
  { key: 'careers', label: 'Careers', to: '/careers' },
  {
    key: 'about',
    label: 'About',
    to: '/about',
    columns: [
      {
        title: 'About',
        items: [
          { label: 'Overview', to: '/about#overview' },
          { label: 'What We Believe', to: '/about#what-we-believe' },
          { label: 'Vision', to: '/about#vision' },
        ],
      },
    ],
  },
];


/* ============================================================
   NAVBAR
============================================================ */

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(null);
  const [drawer, setDrawer] = useState(false);
  const [search, setSearch] = useState(false);

  const { dark, toggle } = useTheme();
  const loc = useLocation();


  /* ==========================================================
     SCROLL
  ========================================================== */

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 12);
    };

    onScroll();

    window.addEventListener('scroll', onScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, []);


  /* ==========================================================
     ROUTE CHANGE
  ========================================================== */

  useEffect(() => {
    setDrawer(false);
    setOpen(null);
  }, [loc.pathname]);


  /* ==========================================================
     KEYBOARD
  ========================================================== */

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(null);
        setSearch(false);
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearch(true);
      }
    };

    window.addEventListener('keydown', onKey);

    return () => {
      window.removeEventListener('keydown', onKey);
    };
  }, []);


  /* ==========================================================
     NAV LINK STYLE
  ========================================================== */

  const linkClass = ({ isActive }, key) =>
    `flex shrink-0 items-center gap-1 whitespace-nowrap rounded-lg px-2 py-2 text-[13.5px] font-medium transition-colors xl:px-2.5 xl:text-[14.5px] ${
      isActive || open === key
        ? 'text-brand-600 dark:text-brand-300'
        : 'text-slate-700 hover:text-brand-600 dark:text-slate-200 dark:hover:text-brand-300'
    }`;


  return (
    <>
      {/* ======================================================
          UTILITY STRIP
      ====================================================== */}

      <div className="hidden bg-ink-900 text-slate-300 lg:block">

        <div className="px-container flex h-9 items-center justify-between gap-6 overflow-hidden text-[12.5px]">

          <div className="flex shrink-0 items-center gap-5 whitespace-nowrap">

            <a
              href={`tel:${company.phones[0]}`}
              className="flex items-center gap-2 transition-colors hover:text-white"
            >
              <PhoneOutlined />
              {company.phones[0]}
            </a>

            <a
              href={`mailto:${company.email}`}
              className="flex items-center gap-2 transition-colors hover:text-white"
            >
              <MailOutlined />
              {company.email}
            </a>

            <span className="hidden text-slate-500 xl:inline">
              Noida · New Delhi
            </span>

          </div>


          <div className="flex shrink-0 items-center gap-5 whitespace-nowrap">

            <span className="flex items-center gap-2 text-emerald-400">

              <span className="relative flex h-2 w-2">

                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />

                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />

              </span>

              NOC online · 24×7

            </span>


            <Link
              to="/portal/login"
              className="flex items-center gap-2 transition-colors hover:text-white"
            >
              <LoginOutlined />
              Client Login
            </Link>

          </div>

        </div>

      </div>


      {/* ======================================================
          MAIN NAVBAR
      ====================================================== */}

      <header
        onMouseLeave={() => setOpen(null)}
        className={`sticky top-0 z-50 border-b transition-all duration-300 ${
          scrolled
            ? 'border-slate-200/80 bg-white/85 backdrop-blur-xl dark:border-white/10 dark:bg-ink-900/85'
            : 'border-transparent bg-white dark:bg-ink-900'
        }`}
      >

        <div className="px-container flex h-[68px] flex-nowrap items-center justify-between gap-2">

          {/* LOGO */}

          <Link
            to="/"
            aria-label="ProXinet home"
            className="flex shrink-0 items-center"
          >
            <img
              src={LogoImage}
              alt={`${company.name} Logo`}
              className="
                h-12
                w-auto
                max-w-[190px]
                object-contain
                sm:h-14
                sm:max-w-[210px]
              "
            />
          </Link>


          {/* DESKTOP NAV */}

          <nav className="hidden min-w-0 flex-nowrap items-center gap-0.5 lg:flex">

            {megaMenu.map((m) => (

              <div
                key={m.key}
                className="relative shrink-0"
                onMouseEnter={() => setOpen(m.columns ? m.key : null)}
              >

                <NavLink
                  to={m.to}
                  end={m.to === '/'}
                  className={(s) => linkClass(s, m.key)}
                >

                  {m.label}

                  {m.columns && (
                    <DownOutlined
                      className={`text-[8px] transition-transform duration-300 ${
                        open === m.key ? 'rotate-180' : ''
                      }`}
                    />
                  )}

                </NavLink>

                {/* SMALL DROPDOWN — Services / Resources / About */}
                <AnimatePresence>
                  {open === m.key && m.columns && m.key !== 'solutions' && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      transition={{ duration: 0.18, ease: 'easeOut' }}
                      className="absolute left-0 top-full z-50 pt-2"
                    >
                      <ul className="m-0 min-w-[240px] list-none border border-slate-600 bg-slate-800 py-2 shadow-2xl dark:border-white/10 dark:bg-ink-900">
                        {m.columns.flatMap((col) => col.items).map((it) => (
                          <li key={it.to} className="m-0 list-none p-0">
                            <Link to={it.to} className={dropItem}>
                              {it.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>

            ))}

          </nav>


          {/* RIGHT ACTIONS */}

          <div className="flex shrink-0 items-center gap-1">

            <Button
              type="text"
              shape="circle"
              aria-label="Search"
              icon={<SearchOutlined />}
              onClick={() => setSearch(true)}
            />


            <Button
              type="text"
              shape="circle"
              aria-label={
                dark
                  ? 'Switch to light theme'
                  : 'Switch to dark theme'
              }
              icon={
                dark
                  ? <BulbOutlined />
                  : <MoonOutlined />
              }
              onClick={toggle}
            />


            <Link
              to="/contact"
              className="hidden 2xl:block"
            >
              <Button
                type="primary"
                className="!whitespace-nowrap !px-3.5 !font-semibold xl:!px-5"
              >
                Get A Quote
              </Button>
            </Link>


            <Button
              type="text"
              shape="circle"
              className="lg:!hidden"
              aria-label="Open menu"
              icon={<MenuOutlined />}
              onClick={() => setDrawer(true)}
            />

          </div>

        </div>


        {/* SOLUTION MEGA PANEL — boxed, 5 columns, same layout as proxinet.in */}
        <AnimatePresence>
          {open === 'solutions' && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="absolute inset-x-0 top-full z-50 hidden lg:block"
              onMouseEnter={() => setOpen('solutions')}
            >
              <div className="px-container">
                <div className="grid grid-cols-5 divide-x divide-slate-600 border border-slate-600 bg-slate-800 py-7 shadow-2xl dark:divide-white/10 dark:border-white/10 dark:bg-ink-900">
                  {solutionMenu.map((col) => (
                    <div key={col.title} className="px-6">
                      <Link
                        to={col.to}
                        className="mb-4 block font-display text-[14.5px] font-bold uppercase tracking-[0.02em] text-white transition-colors hover:text-brand-300"
                      >
                        {col.title}
                      </Link>
                      <ul className="m-0 list-none space-y-1 p-0">
                        {col.items.map((it) => (
                          <li key={it.to} className="m-0 list-none p-0">
                            <Link
                              to={it.to}
                              className="block py-1.5 text-[13.5px] uppercase tracking-[0.02em] text-slate-300 transition-all duration-200 hover:translate-x-1 hover:text-brand-300"
                            >
                              {it.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </header>


      {/* ======================================================
          MOBILE DRAWER
      ====================================================== */}

      <Drawer
        open={drawer}
        onClose={() => setDrawer(false)}
        placement="right"
        width={330}
        closeIcon={null}
        styles={{
          header: {
            display: 'none',
          },
        }}
      >

        <div className="flex h-full flex-col">

          {/* MOBILE HEADER */}

          <div
            className="
              flex
              items-center
              justify-between
              border-b
              border-slate-200
              p-4
              dark:border-white/10
            "
          >

            <Link
              to="/"
              aria-label="ProXinet home"
              className="flex items-center"
            >

              <img
                src={LogoImage}
                alt={`${company.name} Logo`}
                className="h-12 w-auto max-w-[190px] object-contain"
              />

            </Link>


            <Button
              type="text"
              shape="circle"
              icon={<CloseOutlined />}
              onClick={() => setDrawer(false)}
              aria-label="Close menu"
            />

          </div>


          {/* MOBILE NAVIGATION */}

          <div className="flex-1 overflow-y-auto">

            <Collapse
              ghost
              expandIconPosition="end"
              items={megaMenu.map((m) => (!m.columns ? {
                key: m.key,
                showArrow: false,
                collapsible: 'icon',
                label: (
                  <Link to={m.to} className="block font-display font-semibold text-slate-800 dark:text-slate-100">
                    {m.label}
                  </Link>
                ),
              } : {

                key: m.key,

                label: (
                  <span className="font-display font-semibold">
                    {m.label}
                  </span>
                ),

                children: (

                  <div className="space-y-4 pl-1">

                    <Link
                      to={m.to}
                      className="
                        block
                        text-sm
                        font-semibold
                        text-brand-600
                        dark:text-brand-300
                      "
                    >
                      All {m.label}
                      <RightOutlined className="ml-1 text-[10px]" />
                    </Link>


                    {m.columns.map((col) => (

                      <div key={col.title}>

                        <p
                          className="
                            mb-1.5
                            flex
                            items-center
                            gap-1.5
                            font-mono
                            text-[10.5px]
                            font-semibold
                            uppercase
                            tracking-wider
                            text-slate-400
                          "
                        >

                          <span
                            className="
                              h-1.5
                              w-1.5
                              rounded-full
                              bg-brand-500
                            "
                          />

                          {col.title}

                        </p>


                        <ul className="m-0 list-none space-y-1 p-0">

                          {col.items.map((it) => (

                            <li
                              key={it.to}
                              className="m-0 list-none p-0"
                            >

                              <Link
                                to={it.to}
                                className="
                                  flex
                                  items-center
                                  gap-2
                                  rounded-md
                                  px-2
                                  py-1
                                  text-sm
                                  text-slate-700
                                  transition-colors
                                  hover:bg-brand-50
                                  hover:text-brand-600
                                  dark:text-slate-300
                                  dark:hover:bg-brand-500/10
                                  dark:hover:text-brand-300
                                "
                              >

                                <span
                                  className="
                                    h-1
                                    w-1
                                    shrink-0
                                    rounded-full
                                    bg-slate-300
                                    dark:bg-slate-600
                                  "
                                />

                                {it.label}

                              </Link>

                            </li>

                          ))}

                        </ul>

                      </div>

                    ))}

                  </div>

                ),
              }))}
            />


            {/* MOBILE BOTTOM LINKS */}

            <div
              className="
                space-y-3
                border-t
                border-slate-200
                p-4
                dark:border-white/10
              "
            >

              <Link
                to="/portal/login"
                className="block font-display font-semibold"
              >
                Client Login
              </Link>


              <div className="flex items-center justify-between pt-2">

                <span className="text-sm text-slate-500">
                  Dark mode
                </span>

                <Switch
                  checked={dark}
                  onChange={toggle}
                  size="small"
                />

              </div>

            </div>

          </div>


          {/* MOBILE QUOTE */}

          <div
            className="
              border-t
              border-slate-200
              p-4
              dark:border-white/10
            "
          >

            <Link to="/contact">

              <Button
                type="primary"
                block
                size="large"
              >
                Get A Quote
              </Button>

            </Link>

          </div>

        </div>

      </Drawer>


      {/* ======================================================
          SEARCH
      ====================================================== */}

      <SearchPanel
        open={search}
        onClose={() => setSearch(false)}
      />

    </>
  );
}