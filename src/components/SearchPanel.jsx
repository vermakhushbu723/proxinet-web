import React, { useMemo, useState, useEffect } from 'react';
import { Modal, Input, Empty, Tag } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { allSolutionPages, solutionFamilies } from '../data/solutions';
import { services } from '../data/services';
import { industries } from '../data/industries';
import { caseStudies } from '../data/proof';
import { posts, glossary } from '../data/resources';

/** A flat search index for the whole site, built in one place. */
export const searchIndex = [
  ...solutionFamilies.map((f) => ({ t: f.name, d: f.blurb, to: `/solutions/${f.slug}`, kind: 'Solution' })),
  ...allSolutionPages.map((p) => ({ t: p.name, d: p.blurb, to: `/solutions/${p.family}/${p.slug}`, kind: 'Solution' })),
  ...services.map((s) => ({ t: s.name, d: s.blurb, to: `/services/${s.slug}`, kind: 'Service' })),
  ...industries.map((i) => ({ t: i.name, d: i.blurb, to: `/industries/${i.slug}`, kind: 'Industry' })),
  ...caseStudies.map((c) => ({ t: c.title, d: c.challenge, to: `/case-studies/${c.slug}`, kind: 'Case study' })),
  ...posts.map((p) => ({ t: p.title, d: p.excerpt, to: `/blog/${p.slug}`, kind: 'Blog' })),
  ...glossary.map((g) => ({ t: `${g.term} — ${g.full}`, d: g.def, to: '/resources/glossary', kind: 'Glossary' })),
  { t: 'SLA & Support Plans', d: 'Compare the Bronze, Silver and Gold AMC tiers', to: '/services/plans', kind: 'Page' },
  { t: 'Cloud Cost Calculator', d: 'Azure / AWS monthly estimate', to: '/tools/cloud-cost-calculator', kind: 'Tool' },
  { t: 'IT Security Health Score', d: 'Ten questions, an instant score', to: '/tools/security-health-score', kind: 'Tool' },
  { t: 'AMC Plan Selector', d: 'Find the right plan for you', to: '/tools/amc-plan-selector', kind: 'Tool' },
  { t: 'Book Free IT Assessment', d: 'A 30-minute infrastructure review', to: '/book-assessment', kind: 'Page' },
  { t: 'Careers', d: 'Open positions and talent database', to: '/careers', kind: 'Page' },
  { t: 'Client Portal', d: 'Tickets, assets, SLA reports', to: '/portal/login', kind: 'Page' },
  { t: 'Procurement Pack', d: 'Vendor onboarding documents', to: '/procurement', kind: 'Page' },
];

const kindColor = {
  Solution: 'red', Service: 'volcano', Industry: 'orange', 'Case study': 'green',
  Blog: 'magenta', Glossary: 'default', Tool: 'gold', Page: 'default',
};

export default function SearchPanel({ open, onClose }) {
  const [q, setQ] = useState('');
  const nav = useNavigate();
  useEffect(() => { if (open) setQ(''); }, [open]);

  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return searchIndex.slice(0, 8);
    return searchIndex
      .filter((r) => `${r.t} ${r.d} ${r.kind}`.toLowerCase().includes(s))
      .slice(0, 24);
  }, [q]);

  const go = (to) => { onClose(); nav(to); };

  return (
    <Modal open={open} onCancel={onClose} footer={null} width={640} closable={false} styles={{ body: { padding: 0 } }} destroyOnClose>
      <div className="p-4">
        <Input
          size="large" autoFocus allowClear prefix={<SearchOutlined className="text-slate-400" />}
          placeholder="Solutions, services, case studies, glossary… (Ctrl + K)"
          value={q} onChange={(e) => setQ(e.target.value)}
          onPressEnter={() => results[0] && go(results[0].to)}
        />
      </div>
      <div className="max-h-[52vh] overflow-y-auto border-t border-slate-100 dark:border-white/10">
        {results.length === 0 ? (
          <div className="py-10"><Empty description={`No results for "${q}"`} /></div>
        ) : (
          <ul className="p-2">
            {results.map((r) => (
              <li key={r.to + r.t}>
                <button
                  onClick={() => go(r.to)}
                  className="flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-brand-50 dark:hover:bg-white/5"
                >
                  <Tag color={kindColor[r.kind]} className="mt-0.5 shrink-0">{r.kind}</Tag>
                  <span className="min-w-0">
                    <span className="block truncate font-medium text-slate-800 dark:text-slate-100">{r.t}</span>
                    <span className="block truncate text-[13px] text-slate-500 dark:text-slate-400">{r.d}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="flex items-center justify-between border-t border-slate-100 px-4 py-2.5 font-mono text-[11px] uppercase tracking-wider text-slate-400 dark:border-white/10">
        <span>{results.length} results</span>
        <span>Enter to open · Esc to close</span>
      </div>
    </Modal>
  );
}
