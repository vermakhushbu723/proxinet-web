# ProXinet Web — React + Tailwind + Ant Design

An advanced rebuild of proxinet.in. Every new section, page, feature and tool from the
audit document is implemented here.

## Stack

| Layer | Choice |
|---|---|
| Build | Vite 5 |
| UI | React 18 + React Router 6 |
| Styling | Tailwind CSS 3 (preflight off, so it does not clash with antd) |
| Components | Ant Design 5 (custom brand token theme) |
| Animation | Framer Motion (reduced-motion respected) |
| Fonts | Sora (display) · Inter (body) · JetBrains Mono (labels) |

## Brand theme

The palette is taken from the ProXinet logo — primary `#d62b1f`, deep `#971a13`.
Tailwind exposes a `brand.50` to `brand.950` scale; Ant Design tokens for both light
and dark live in `src/theme/antdTheme.js`. Neutrals carry a warm bias to sit with the red.

Dark mode is class-based (`.dark` on `<html>`), detects the system preference and can be
overridden by the navbar toggle. The preference is stored in `localStorage`.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # dist/
npm run preview
```

## Structure

```
src/
  data/           # all content in one place, separate from code
    company.js      company info, stats, pain points, process
    solutions.js    7 families, 40 child services
    services.js     10 services + Bronze/Silver/Gold SLA plans
    industries.js   9 industries with compliance mapping
    proof.js        case studies, testimonials, partners, certifications
    resources.js    blog posts, glossary, FAQs, whitepapers
    people.js       leadership, milestones, job openings
  components/
    Navbar.jsx      6-item mega menu, search (Ctrl+K), theme toggle, mobile drawer
    Footer.jsx      5-column sitemap, newsletter, credentials, legal bar
    FloatingActions.jsx  WhatsApp, AI assistant drawer, back-to-top, mobile bottom bar
    CookieBanner.jsx     DPDP-aligned consent with per-category toggles
    SearchPanel.jsx      site-wide search over a flat index
    ui.jsx          Reveal, Stagger, Counter, SectionHead, NetworkGraphic, IconBadge
    blocks.jsx      PageHero, CTABand, LeadForm (3-step), TickList, ScrollToTop
  pages/          # route components (data-driven)
  theme/          # antd light and dark token sets
```

## Routes

Routing is data-driven — adding an entry under `data/` creates the page automatically.

- `/` — home (13 sections)
- `/solutions` · `/solutions/:family` · `/solutions/:family/:slug` — 7 + 40 pages
- `/services` · `/services/plans` · `/services/:slug`
- `/industries` · `/industries/:slug`
- `/clients` · `/case-studies` · `/case-studies/:slug` · `/partners` · `/testimonials`
- `/about` · `/about/leadership` · `/about/story` · `/about/process` · `/about/certifications`
- `/resources` · `/blog` · `/blog/:slug` · `/resources/whitepapers` · `/resources/glossary` · `/resources/faq` · `/news-events`
- `/tools` + 6 working calculators
- `/contact` · `/book-assessment` · `/procurement` · `/careers`
- `/portal/login` · `/portal/dashboard` · `/status`
- `/sitemap` · `/legal/:doc` · `*` (404)

## Working tools

All calculate client-side; no backend required:

1. **Cloud Cost Calculator** — VM count/size, storage, hours, provider → monthly + annual breakdown
2. **IT Security Health Score** — 10 weighted questions → score, band and priority fixes
3. **AMC Plan Selector** — endpoints, sites, servers, coverage → tier + indicative price
4. **Server Sizing Tool** — users + workload + growth → vCPU, RAM, storage, nodes, IOPS
5. **Wi-Fi AP Estimator** — area, devices, environment, walls → AP count (coverage vs capacity)
6. **TCO Calculator** — 3-year on-prem vs cloud comparison with animated bars

## Before go-live

These are placeholders and must be replaced:

- [ ] **Client names and logos** (`data/proof.js`) — real logos, with written permission
- [ ] **Case study numbers** — actual project data and client approval
- [ ] **Partner tiers** (`data/proof.js`) — verify current status from the OEM portal
- [ ] **Certifications** — real certificate numbers and validity dates
- [ ] **Leadership profiles** (`data/people.js`) — names, photos, LinkedIn links
- [ ] **Stats** (`data/company.js`) — actual years, client count and endpoints
- [ ] **Pricing** (`data/services.js`) — confirm the indicative bands
- [ ] **Legal pages** (`pages/Misc.jsx`) — have a legal advisor review these
- [ ] **Google Maps embed** (`pages/Contact.jsx`) — real iframe
- [ ] **Form handlers** — currently log to `console.info`; connect them to the CRM (Zoho/HubSpot)
- [ ] **AI assistant** (`components/FloatingActions.jsx`) — a scripted demo; connect it to the knowledge base and CRM in a real deployment
- [ ] **Portal** (`pages/Portal.jsx`) — demo data; connect it to the helpdesk backend

## Accessibility & performance

- Skip-to-content link, visible focus rings, semantic headings
- `prefers-reduced-motion` respected — animations are disabled
- Contrast checked in both light and dark themes
- Wide tables `overflow-x: auto` — the page never scrolls horizontally
- Vendor chunks split (react / antd / motion)

## What comes next (Phase 3–4 of the audit document)

- Quote Builder with PDF generation
- Real chatbot backend
- Portal auth + helpdesk API integration
- PWA manifest + service worker
- Schema.org markup (Organization, LocalBusiness, Service, FAQPage)
- SSR or pre-rendering for SEO (a Next.js migration or `vite-plugin-ssr`)
