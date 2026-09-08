import React from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { Button, Result, Input } from 'antd';
import { SearchOutlined, HomeOutlined } from '@ant-design/icons';
import { solutionFamilies } from '../data/solutions';
import { services } from '../data/services';
import { industries } from '../data/industries';
import { caseStudies } from '../data/proof';
import { posts } from '../data/resources';
import { jobs } from '../data/people';
import { company } from '../data/company';
import { Reveal, SectionHead } from '../components/ui';
import { PageHero, CTABand } from '../components/blocks';

/* =================== SITEMAP =================== */
export function Sitemap() {
  const groups = [
    { t: 'Core', links: [['Home', '/'], ['About Us', '/about'], ['Leadership', '/about/leadership'], ['Our Story', '/about/story'], ['Our Process', '/about/process'], ['Certifications', '/about/certifications']] },
    { t: 'Solutions', links: [['All Solutions', '/solutions'], ...solutionFamilies.map((f) => [f.name, `/solutions/${f.slug}`])] },
    ...solutionFamilies.map((f) => ({ t: f.name, links: f.children.map((c) => [c.name, `/solutions/${f.slug}/${c.slug}`]) })),
    { t: 'Services', links: [['All Services', '/services'], ['SLA & Support Plans', '/services/plans'], ...services.map((s) => [s.name, `/services/${s.slug}`])] },
    { t: 'Industries', links: [['All Industries', '/industries'], ...industries.map((i) => [i.name, `/industries/${i.slug}`])] },
    { t: 'Proof', links: [['Clients', '/clients'], ['Case Studies', '/case-studies'], ['Testimonials', '/testimonials'], ['Partners', '/partners'], ...caseStudies.map((c) => [c.title, `/case-studies/${c.slug}`])] },
    { t: 'Resources', links: [['Resources Hub', '/resources'], ['Blog', '/blog'], ['Whitepapers', '/resources/whitepapers'], ['Glossary', '/resources/glossary'], ['FAQs', '/resources/faq'], ['News & Events', '/news-events'], ...posts.map((p) => [p.title, `/blog/${p.slug}`])] },
    { t: 'Tools', links: [['All Tools', '/tools'], ['Cloud Cost Calculator', '/tools/cloud-cost-calculator'], ['Security Health Score', '/tools/security-health-score'], ['AMC Plan Selector', '/tools/amc-plan-selector'], ['Server Sizing', '/tools/server-sizing'], ['Wi-Fi Estimator', '/tools/wifi-estimator'], ['TCO Calculator', '/tools/tco-calculator']] },
    { t: 'Contact & Conversion', links: [['Contact Us', '/contact'], ['Book Assessment', '/book-assessment'], ['Procurement Pack', '/procurement'], ['Careers', '/careers'], ['Service Status', '/status']] },
    { t: 'Client Portal', links: [['Portal Login', '/portal/login'], ['Dashboard', '/portal/dashboard']] },
    { t: 'Legal', links: [['Privacy Policy', '/legal/privacy-policy'], ['Terms of Service', '/legal/terms'], ['Cookie Policy', '/legal/cookie-policy'], ['DPDP Compliance', '/legal/dpdp-compliance'], ['Accessibility', '/legal/accessibility']] },
  ];

  const total = groups.reduce((n, g) => n + g.links.length, 0);

  return (
    <>
      <PageHero
        eyebrow="Sitemap" title="The whole site on one page"
        sub={`${total} pages across solutions, services, industries, resources, tools and the portal.`}
        crumbs={[{ label: 'Sitemap' }]}
      />
      <section className="px-container px-section">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map((g) => (
            <Reveal key={g.t}>
              <p className="mb-3 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-500">{g.t}</p>
              <ul className="space-y-1.5">
                {g.links.map(([label, to]) => (
                  <li key={to + label}>
                    <Link className="text-[13.5px] text-slate-600 hover:text-brand-600 dark:text-slate-300" to={to}>{label}</Link>
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </section>
      <CTABand />
    </>
  );
}

/* =================== LEGAL =================== */
const legalDocs = {
  'privacy-policy': {
    title: 'Privacy Policy',
    intro: 'This policy explains how ProXinet Technologies collects, uses and protects your personal data.',
    sections: [
      { h: 'What data we collect', p: 'Name, work email, phone number, company name and whatever details you provide in our forms. For website usage, cookies and analytics data such as IP address, browser and pages visited.' },
      { h: 'Why we collect it', p: 'To answer your enquiry, send proposals, deliver services and — with your consent — send relevant updates. We never sell your data.' },
      { h: 'How long we keep it', p: 'Enquiry data for 24 months, client contract data for seven years after the contract ends (a statutory requirement), and marketing consent until you withdraw it.' },
      { h: 'Who we share it with', p: 'Only with processors required for service delivery — CRM, email and hosting providers — all of whom are contractually bound by data protection obligations.' },
      { h: 'Your rights', p: 'Under the DPDP Act 2023 you may request access, correction, erasure and withdrawal of consent. Send requests to ' + company.email + ' — we respond within 30 days.' },
      { h: 'Security', p: 'Encryption in transit and at rest, role-based access, activity logging and regular security reviews. Our breach notification process is documented.' },
    ],
  },
  terms: {
    title: 'Terms of Service',
    intro: 'The terms under which you may use this website and ProXinet digital services.',
    sections: [
      { h: 'Use of this website', p: 'The content is for information only. The tools and calculators produce indicative estimates — they are neither a formal quotation nor a technical design.' },
      { h: 'Estimates and pricing', p: 'Any price shown on this website is indicative. Binding commercial terms exist only in a signed proposal or contract.' },
      { h: 'Intellectual property', p: 'The content, design and documents on this site are the property of ProXinet. Client-specific documents are confidential material shared with that client.' },
      { h: 'Client portal', p: 'Portal access is for managed services clients. Keeping credentials confidential is your responsibility; tell us immediately if you suspect misuse.' },
      { h: 'Limitation of liability', p: 'ProXinet is not liable for decisions taken in reliance on website content. Liability for service delivery is defined in the applicable contract.' },
      { h: 'Governing law', p: 'These terms are governed by Indian law, and the courts of Delhi NCR have exclusive jurisdiction.' },
    ],
  },
  'cookie-policy': {
    title: 'Cookie Policy',
    intro: 'We use cookies to run the site and to improve it.',
    sections: [
      { h: 'Essential cookies', p: 'Required for site functionality — theme preference, form state and session security. These cannot be disabled.' },
      { h: 'Analytics cookies', p: 'Google Analytics 4 and Microsoft Clarity — to understand which pages are useful and where people get stuck. The data is aggregated.' },
      { h: 'Marketing cookies', p: 'LinkedIn Insight Tag and Google Ads — to build relevant audiences. These load only after you consent.' },
      { h: 'How to control them', p: 'Set your preferences in the cookie banner, and clear or block cookies at any time from your browser settings.' },
    ],
  },
  'dpdp-compliance': {
    title: 'DPDP Act 2023 Compliance',
    intro: 'Our data handling practices under the Digital Personal Data Protection Act 2023.',
    sections: [
      { h: 'Data Fiduciary role', p: 'ProXinet is the Data Fiduciary for website enquiries and client contact data. When processing data in client systems during managed services, we act as a Data Processor.' },
      { h: 'Consent', p: 'Marketing communication is sent only on explicit consent. Every email carries an option to withdraw it.' },
      { h: 'Purpose limitation', p: 'Data is used only for the purpose it was collected for. A new purpose requires fresh consent.' },
      { h: 'Data minimisation', p: 'Our forms carry only the fields that are genuinely needed. Optional fields are clearly marked.' },
      { h: 'Client engagements', p: 'Every managed services contract includes data protection clauses, confidentiality obligations and breach notification timelines.' },
      { h: 'Grievance redressal', p: 'Send any data-related concern to ' + company.email + '. A response within 30 days is guaranteed.' },
    ],
  },
  accessibility: {
    title: 'Accessibility Statement',
    intro: 'This website aims to meet WCAG 2.1 Level AA standards.',
    sections: [
      { h: 'What has been implemented', p: 'Semantic HTML structure, a keyboard-navigable interface, visible focus indicators, sufficient colour contrast in both light and dark themes, and respect for the reduced-motion preference.' },
      { h: 'Themes', p: 'Both light and dark modes are available and the system preference is detected automatically. A manual toggle sits in the navbar.' },
      { h: 'Known limitations', p: 'We do not fully control some third-party embeds such as maps and video. We try to provide accessible alternatives for these.' },
      { h: 'Feedback', p: 'If you hit an accessibility barrier, tell us at ' + company.email + ' — we prioritise fixing it.' },
    ],
  },
};

export function LegalPage() {
  const { doc } = useParams();
  const d = legalDocs[doc];
  if (!d) return <Navigate to="/" replace />;

  return (
    <>
      <PageHero
        eyebrow="Legal" title={d.title} sub={d.intro} compact
        crumbs={[{ label: 'Legal' }, { label: d.title }]}
      />
      <section className="px-container px-section">
        <article className="mx-auto max-w-[68ch]">
          <p className="font-mono text-[11px] uppercase tracking-wider text-slate-400">
            Last updated: 08 September 2026
          </p>
          {d.sections.map((s) => (
            <Reveal key={s.h} className="mt-8">
              <h2 className="px-h3 text-slate-900 dark:text-white">{s.h}</h2>
              <p className="px-lead mt-3">{s.p}</p>
            </Reveal>
          ))}
          <Reveal className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-white/10 dark:bg-white/[0.03]">
            <p className="font-display font-semibold text-slate-900 dark:text-white">Questions?</p>
            <p className="px-body mt-1.5">
              If you have any question about this document, write to{' '}
              <a href={`mailto:${company.email}`} className="font-semibold text-brand-600 dark:text-brand-300">{company.email}</a>.
            </p>
          </Reveal>
          <p className="mt-8 text-[13px] text-slate-400">
            Note: this is template content. Have your legal advisor review it before publishing.
          </p>
        </article>
      </section>
    </>
  );
}

/* =================== 404 =================== */
export function NotFound() {
  const popular = [
    ['Solutions', '/solutions'], ['Managed IT Services', '/services/managed-it-services'],
    ['SLA & Support Plans', '/services/plans'], ['Case Studies', '/case-studies'],
    ['Tools & Calculators', '/tools'], ['Contact', '/contact'],
  ];
  return (
    <section className="px-container px-section">
      <div className="mx-auto max-w-lg text-center">
        <p className="font-display text-[6rem] font-bold leading-none text-brand-100 dark:text-brand-500/20">404</p>
        <h1 className="px-h2 -mt-6 text-slate-900 dark:text-white">We couldn't find that page</h1>
        <p className="px-lead mt-4">
          The link may be out of date, or the URL may have a typo. Pick up from one of these — or use search.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-2.5">
          {popular.map(([l, to]) => (
            <Link key={to} to={to}>
              <span className="inline-block rounded-xl border border-slate-200 px-4 py-2 text-[14px] font-medium text-slate-700 transition-colors hover:border-brand-400 hover:text-brand-600 dark:border-white/10 dark:text-slate-200">
                {l}
              </span>
            </Link>
          ))}
        </div>
        <Link to="/" className="mt-8 inline-block">
          <Button type="primary" size="large" icon={<HomeOutlined />}>Back to home</Button>
        </Link>
      </div>
    </section>
  );
}
