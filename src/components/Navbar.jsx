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

import { services } from '../data/services';
import { industries } from '../data/industries';
import { company } from '../data/company';
import { useTheme } from './ui';
import SearchPanel from './SearchPanel';

import LogoImage from '../LOGO-1.png';


/* ============================================================
   SOLUTIONS
   ONLY THESE 5 CATEGORIES
============================================================ */

const solutionMenu = [
  {
    title: 'CLOUD',
    to: '/solutions/cloud',
    items: [
      {
        label: 'Azure',
        to: '/solutions/cloud/azure',
      },
      {
        label: 'AWS',
        to: '/solutions/cloud/aws',
      },
      {
        label: 'M365',
        to: '/solutions/cloud/microsoft-365',
      },
      {
        label: 'Google Cloud',
        to: '/solutions/cloud/google-cloud',
      },
      {
        label: 'Hybrid',
        to: '/solutions/cloud/hybrid-cloud',
      },
      {
        label: 'Migration',
        to: '/solutions/cloud/cloud-migration',
      },
    ],
  },

  {
    title: 'SECURITY',
    to: '/solutions/cyber-security',
    items: [
      {
        label: 'Endpoint',
        to: '/solutions/cyber-security/endpoint-security',
      },
      {
        label: 'Email',
        to: '/solutions/cyber-security/email-security',
      },
      {
        label: 'Data',
        to: '/solutions/cyber-security/data-protection',
      },
      {
        label: 'Mobile',
        to: '/solutions/cyber-security/mobile-security',
      },
      {
        label: 'VPN',
        to: '/solutions/cyber-security/vpn',
      },
      {
        label: 'Web',
        to: '/solutions/cyber-security/web-security',
      },
    ],
  },

  {
    title: 'DATA CENTER',
    to: '/solutions/data-center',
    items: [
      {
        label: 'Virtualization',
        to: '/solutions/data-center/virtualization',
      },
      {
        label: 'Servers',
        to: '/solutions/data-center/servers',
      },
      {
        label: 'SAN',
        to: '/solutions/data-center/san',
      },
      {
        label: 'NAS',
        to: '/solutions/data-center/nas',
      },
      {
        label: 'HCI',
        to: '/solutions/data-center/hci',
      },
      {
        label: 'Colocation',
        to: '/solutions/data-center/colocation',
      },
    ],
  },

  {
    title: 'BACKUP & DR',
    to: '/solutions/backup-dr',
    items: [
      {
        label: 'Veeam',
        to: '/solutions/backup-dr/veeam-backup',
      },
      {
        label: 'Cloud Backup',
        to: '/solutions/backup-dr/cloud-backup',
      },
      {
        label: 'DR',
        to: '/solutions/backup-dr/disaster-recovery',
      },
      {
        label: 'Ransomware Recovery',
        to: '/solutions/backup-dr/ransomware-recovery',
      },
    ],
  },

  {
    title: 'NETWORK',
    to: '/solutions/network',
    items: [
      {
        label: 'Cabling',
        to: '/solutions/network/cabling',
      },
      {
        label: 'Switching',
        to: '/solutions/network/switching',
      },
      {
        label: 'Wi-Fi',
        to: '/solutions/network/enterprise-wifi',
      },
      {
        label: 'SD-WAN',
        to: '/solutions/network/sd-wan',
      },
      {
        label: 'Monitoring',
        to: '/solutions/network/network-monitoring',
      },
    ],
  },
];


/* ============================================================
   MEGA MENU
============================================================ */

const megaMenu = [
  {
    key: 'solutions',
    label: 'Solutions',
    to: '/solutions',
    columns: solutionMenu,
  },

  {
    key: 'services',
    label: 'Services',
    to: '/services',

    columns: [
      {
        title: 'Managed',
        items: services.slice(0, 4).map((s) => ({
          label: s.name,
          to: `/services/${s.slug}`,
        })),
      },

      {
        title: 'Professional',
        items: services.slice(4, 7).map((s) => ({
          label: s.name,
          to: `/services/${s.slug}`,
        })),
      },

      {
        title: 'Advisory & Supply',
        items: services.slice(7).map((s) => ({
          label: s.name,
          to: `/services/${s.slug}`,
        })),
      },

      {
        title: 'Plans',
        items: [
          {
            label: 'SLA & Support Plans',
            to: '/services/plans',
          },
        ],
      },
    ],
  },

  {
    key: 'industries',
    label: 'Industries',
    to: '/industries',

    columns: [
      {
        title: 'Regulated',
        items: industries
          .filter((i) =>
            ['bfsi', 'pharma-healthcare', 'legal'].includes(i.slug)
          )
          .map((i) => ({
            label: i.name,
            to: `/industries/${i.slug}`,
          })),
      },

      {
        title: 'Operations-heavy',
        items: industries
          .filter((i) =>
            [
              'manufacturing',
              'retail-ecommerce',
              'construction-real-estate',
            ].includes(i.slug)
          )
          .map((i) => ({
            label: i.name,
            to: `/industries/${i.slug}`,
          })),
      },

      {
        title: 'People-heavy',
        items: industries
          .filter((i) =>
            [
              'education',
              'hospitality-tourism',
              'it-ites',
            ].includes(i.slug)
          )
          .map((i) => ({
            label: i.name,
            to: `/industries/${i.slug}`,
          })),
      },
    ],
  },

  {
    key: 'why',
    label: 'Why ProXinet',
    to: '/about',

    columns: [
      {
        title: 'Company',
        items: [
          {
            label: 'About Us',
            to: '/about',
          },
          {
            label: 'Leadership Team',
            to: '/about/leadership',
          },
          {
            label: 'Our Story',
            to: '/about/story',
          },
          {
            label: 'Our Process',
            to: '/about/process',
          },
        ],
      },

      {
        title: 'Proof',
        items: [
          {
            label: 'Clients',
            to: '/clients',
          },
          {
            label: 'Case Studies',
            to: '/case-studies',
          },
          {
            label: 'Testimonials',
            to: '/testimonials',
          },
        ],
      },

      {
        title: 'Credentials',
        items: [
          {
            label: 'Partners & Alliances',
            to: '/partners',
          },
          {
            label: 'Certifications',
            to: '/about/certifications',
          },
          {
            label: 'Procurement Pack',
            to: '/procurement',
          },
        ],
      },
    ],
  },

  {
    key: 'resources',
    label: 'Resources',
    to: '/resources',

    columns: [
      {
        title: 'Read',
        items: [
          {
            label: 'Blog',
            to: '/blog',
          },
          {
            label: 'Whitepapers',
            to: '/resources/whitepapers',
          },
          {
            label: 'Glossary',
            to: '/resources/glossary',
          },
          {
            label: 'FAQs',
            to: '/resources/faq',
          },
        ],
      },

      {
        title: 'Tools',
        items: [
          {
            label: 'Cloud Cost Calculator',
            to: '/tools/cloud-cost-calculator',
          },
          {
            label: 'IT Security Health Score',
            to: '/tools/security-health-score',
          },
          {
            label: 'AMC Plan Selector',
            to: '/tools/amc-plan-selector',
          },
          {
            label: 'All tools',
            to: '/tools',
          },
        ],
      },

      {
        title: 'Company news',
        items: [
          {
            label: 'News & Events',
            to: '/news-events',
          },
          {
            label: 'Careers',
            to: '/careers',
          },
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
    `flex shrink-0 items-center gap-1 whitespace-nowrap rounded-lg px-2.5 py-2 text-[14px] font-medium transition-colors xl:px-3 xl:text-[15px] ${
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
                className="shrink-0"
                onMouseEnter={() => setOpen(m.key)}
              >

                <NavLink
                  to={m.to}
                  className={(s) => linkClass(s, m.key)}
                >

                  {m.label}

                  <DownOutlined
                    className={`text-[8px] transition-transform duration-300 ${
                      open === m.key ? 'rotate-180' : ''
                    }`}
                  />

                </NavLink>

              </div>

            ))}


            <NavLink
              to="/contact"
              className={(s) => linkClass(s, 'contact')}
            >
              Contact
            </NavLink>

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
              className="hidden sm:block"
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


        {/* ====================================================
            MEGA MENU
        ==================================================== */}

        <AnimatePresence>

          {open && (

            <motion.div
              key={open}
              initial={{
                opacity: 0,
                y: -8,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: -8,
              }}
              transition={{
                duration: 0.2,
                ease: 'easeOut',
              }}
              className="
                absolute
                inset-x-0
                top-full
                hidden
                border-b
                border-slate-600
                bg-slate-800
                shadow-2xl
                dark:border-white/10
                dark:bg-ink-900
                lg:block
              "
              onMouseEnter={() => setOpen(open)}
            >

              <div className="px-container py-6">

                {(() => {
                  const m = megaMenu.find(
                    (x) => x.key === open
                  );

                  if (!m) return null;

                  return (
                    <div
                      className={
                        m.key === 'solutions'
                          ? 'grid grid-cols-5 gap-x-6'
                          : 'grid grid-cols-2 gap-x-8 gap-y-6 md:grid-cols-3 lg:grid-cols-5'
                      }
                    >

                      {m.columns.map((col) => (

                        <div key={col.title}>

                          {/* COLUMN TITLE */}

                          {col.to ? (

                            <Link
                              to={col.to}
                              className="
                                mb-3
                                block
                                font-display
                                text-[15px]
                                font-bold
                                uppercase
                                tracking-[0.08em]
                                text-white
                                transition-colors
                                hover:text-brand-300
                              "
                            >
                              {col.title}
                            </Link>

                          ) : (

                            <p
                              className="
                                mb-3
                                font-mono
                                text-[11px]
                                font-bold
                                uppercase
                                tracking-[0.14em]
                                text-white
                              "
                            >
                              {col.title}
                            </p>

                          )}


                          {/* MENU ITEMS */}

                          <ul className="m-0 list-none space-y-1 p-0">

                            {col.items.map((it) => (

                              <li
                                key={it.to}
                                className="m-0 list-none p-0"
                              >

                                <Link
                                  to={it.to}
                                  className="
                                    group
                                    flex
                                    items-center
                                    gap-2.5
                                    rounded-md
                                    px-2
                                    py-1.5
                                    text-[14px]
                                    font-medium
                                    text-white
                                    transition-all
                                    duration-200
                                    hover:translate-x-1
                                    hover:bg-slate-700
                                    hover:text-white
                                    dark:hover:bg-white/10
                                  "
                                >

                                  {/* ONLY ONE DOT */}

                                  <span
                                    className="
                                      h-1.5
                                      w-1.5
                                      shrink-0
                                      rounded-full
                                      bg-slate-400
                                      transition-all
                                      duration-200
                                      group-hover:bg-brand-400
                                      group-hover:shadow-[0_0_8px_rgba(251,146,60,0.7)]
                                    "
                                  />

                                  {/* WHITE TEXT */}

                                  <span className="text-white">
                                    {it.label}
                                  </span>

                                </Link>

                              </li>

                            ))}

                          </ul>

                        </div>

                      ))}

                    </div>
                  );
                })()}

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
              items={megaMenu.map((m) => ({

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
                to="/contact"
                className="block font-display font-semibold"
              >
                Contact
              </Link>


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