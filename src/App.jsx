import React, { useEffect, useMemo, useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { ConfigProvider, App as AntApp, FloatButton } from 'antd';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

import { lightTheme, darkTheme } from './theme/antdTheme';
import { ThemeCtx } from './components/ui';
import { ScrollToTop } from './components/blocks';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import FloatingActions from './components/FloatingActions';
import CookieBanner from './components/CookieBanner';

import Home from './pages/Home';
import { SolutionsHub, SolutionFamily, SolutionDetail } from './pages/Solutions';
import { ServicesHub, ServiceDetail, SLAPlans } from './pages/Services';
import { IndustriesHub, IndustryDetail } from './pages/Industries';
import { Clients, CaseStudies, CaseStudyDetail, Partners, Testimonials } from './pages/Proof';
import { About, Leadership, Story, Process, Certifications } from './pages/About';
import { ResourcesHub, Blog, BlogPost, Whitepapers, Glossary, FAQ, NewsEvents } from './pages/Resources';
import {
  ToolsHub, CloudCostCalculator, SecurityHealthScore, AMCPlanSelector,
  ServerSizing, WifiEstimator, TCOCalculator,
} from './pages/Tools';
import { Contact, BookAssessment, Careers, Procurement } from './pages/Contact';
import { PortalLogin, PortalDashboard, StatusPage } from './pages/Portal';
import { Sitemap, LegalPage, NotFound } from './pages/Misc';

/* Page transition wrapper — starts from a visible resting state */
function Page({ children }) {
  const reduce = useReducedMotion();
  if (reduce) return <main id="main">{children}</main>;
  return (
    <motion.main
      id="main"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.main>
  );
}

function Shell() {
  const loc = useLocation();
  const isPortalLogin = loc.pathname === '/portal/login';

  return (
    <div className="flex min-h-screen flex-col pb-14 sm:pb-0">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-brand-500 focus:px-4 focus:py-2 focus:font-semibold focus:text-white"
      >
        Skip to content
      </a>

      <Navbar />

      <AnimatePresence mode="wait">
        <Page key={loc.pathname}>
          <Routes location={loc}>
            <Route path="/" element={<Home />} />

            {/* Solutions */}
            <Route path="/solutions" element={<SolutionsHub />} />
            <Route path="/solutions/:family" element={<SolutionFamily />} />
            <Route path="/solutions/:family/:slug" element={<SolutionDetail />} />

            {/* Services */}
            <Route path="/services" element={<ServicesHub />} />
            <Route path="/services/plans" element={<SLAPlans />} />
            <Route path="/services/:slug" element={<ServiceDetail />} />

            {/* Industries */}
            <Route path="/industries" element={<IndustriesHub />} />
            <Route path="/industries/:slug" element={<IndustryDetail />} />

            {/* Proof */}
            <Route path="/clients" element={<Clients />} />
            <Route path="/case-studies" element={<CaseStudies />} />
            <Route path="/case-studies/:slug" element={<CaseStudyDetail />} />
            <Route path="/partners" element={<Partners />} />
            <Route path="/testimonials" element={<Testimonials />} />

            {/* About */}
            <Route path="/about" element={<About />} />
            <Route path="/about/leadership" element={<Leadership />} />
            <Route path="/about/story" element={<Story />} />
            <Route path="/about/process" element={<Process />} />
            <Route path="/about/certifications" element={<Certifications />} />

            {/* Resources */}
            <Route path="/resources" element={<ResourcesHub />} />
            <Route path="/resources/whitepapers" element={<Whitepapers />} />
            <Route path="/resources/glossary" element={<Glossary />} />
            <Route path="/resources/faq" element={<FAQ />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/news-events" element={<NewsEvents />} />

            {/* Tools */}
            <Route path="/tools" element={<ToolsHub />} />
            <Route path="/tools/cloud-cost-calculator" element={<CloudCostCalculator />} />
            <Route path="/tools/security-health-score" element={<SecurityHealthScore />} />
            <Route path="/tools/amc-plan-selector" element={<AMCPlanSelector />} />
            <Route path="/tools/server-sizing" element={<ServerSizing />} />
            <Route path="/tools/wifi-estimator" element={<WifiEstimator />} />
            <Route path="/tools/tco-calculator" element={<TCOCalculator />} />

            {/* Conversion */}
            <Route path="/contact" element={<Contact />} />
            <Route path="/book-assessment" element={<BookAssessment />} />
            <Route path="/procurement" element={<Procurement />} />
            <Route path="/careers" element={<Careers />} />

            {/* Portal */}
            <Route path="/portal/login" element={<PortalLogin />} />
            <Route path="/portal/dashboard" element={<PortalDashboard />} />
            <Route path="/status" element={<StatusPage />} />

            {/* System */}
            <Route path="/sitemap" element={<Sitemap />} />
            <Route path="/legal/:doc" element={<LegalPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Page>
      </AnimatePresence>

      {!isPortalLogin && <Footer />}
      <FloatingActions />
      <CookieBanner />
    </div>
  );
}

export default function App() {
  const [dark, setDark] = useState(() => {
    try {
      const saved = localStorage.getItem('px-theme');
      if (saved) return saved === 'dark';
    } catch { /* private mode / blocked storage */ }
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    try { localStorage.setItem('px-theme', dark ? 'dark' : 'light'); } catch { /* ignore */ }
  }, [dark]);

  const ctx = useMemo(() => ({ dark, toggle: () => setDark((d) => !d) }), [dark]);

  return (
    <ThemeCtx.Provider value={ctx}>
      <ConfigProvider theme={dark ? darkTheme : lightTheme}>
        <AntApp>
          <BrowserRouter>
            <ScrollToTop />
            <Shell />
          </BrowserRouter>
        </AntApp>
      </ConfigProvider>
    </ThemeCtx.Provider>
  );
}
