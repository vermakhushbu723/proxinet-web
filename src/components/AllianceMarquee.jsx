import React from 'react';
import { Link } from 'react-router-dom';
import { alliances } from '../data/alliances';

/** Right-to-left logo slider of technology alliances. Every logo opens the /partners page. */
export default function AllianceMarquee() {
  return (
    <section className="overflow-hidden border-b border-slate-200 bg-gradient-to-r from-white via-slate-50 to-white py-9 dark:border-white/10 dark:from-ink-900 dark:via-slate-900 dark:to-ink-900">
      <div className="px-container mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <Link
          to="/partners"
          className="font-mono text-[12px] font-semibold uppercase tracking-[0.18em] text-slate-500 transition-colors hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400"
        >
          Technology alliances →
        </Link>
        <span className="text-[12px] text-slate-400">Click a logo to see all partners</span>
      </div>

      <div className="relative">
        <div className="px-marquee gap-4">
          {[...alliances, ...alliances].map((a, i) => (
            <Link
              key={i}
              to="/partners"
              aria-label={`${a.name} — view partners`}
              title={a.name}
              className="group flex h-[120px] w-[240px] shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-[0_6px_20px_rgba(15,23,42,0.08)] transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-[0_12px_30px_rgba(37,99,235,0.15)] dark:border-white/10 dark:bg-white/[0.05] dark:hover:border-blue-400/40 dark:hover:bg-white/[0.08]"
            >
              <img
                src={a.logo}
                alt={a.name}
                loading="lazy"
                className="block max-h-[84px] w-auto max-w-[200px] object-contain transition-transform duration-300 group-hover:scale-110"
              />
            </Link>
          ))}
        </div>

        {/* edge fades */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-white via-white/90 to-transparent dark:from-ink-900 dark:via-ink-900/90" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-white via-white/90 to-transparent dark:from-ink-900 dark:via-ink-900/90" />
      </div>
    </section>
  );
}
