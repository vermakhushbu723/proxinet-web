import React from 'react';

/**
 * ProXinet mark — a bold "P" whose bowl opens into a forward arrow,
 * matching the brand logo. Wordmark sets PRO + X + INET with the X
 * carrying the accent, as in the original.
 */
export default function Logo({ compact = false, className = '' }) {
  return (
    <span className={`flex items-center gap-2.5 ${className}`}>
      <svg width="36" height="36" viewBox="0 0 48 48" aria-hidden="true" className="shrink-0">
        <defs>
          <linearGradient id="pxMarkG" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#e5352a" />
            <stop offset="55%" stopColor="#d62b1f" />
            <stop offset="100%" stopColor="#971a13" />
          </linearGradient>
        </defs>
        {/* stem of the P */}
        <rect x="5" y="6" width="8.5" height="36" rx="1.5" fill="url(#pxMarkG)" />
        {/* upper bowl sweeping right */}
        <path d="M13.5 6 H31 L41 13.5 L31 21 H13.5 Z" fill="url(#pxMarkG)" />
        {/* arrow head — the forward motion in the mark */}
        <path d="M17 25.5 H31.5 L40 31.5 L31.5 37.5 H17 Z" fill="url(#pxMarkG)" opacity="0.92" />
        {/* notch that separates bowl from arrow */}
        <path d="M13.5 21 H24 L18 25.5 H13.5 Z" fill="#ffffff" className="dark:fill-[#140d0c]" />
      </svg>

      {!compact && (
        <span className="leading-none">
          <span className="block font-display text-[19px] font-bold uppercase tracking-[0.02em] text-slate-900 dark:text-white">
            Pro<span className="text-brand-500">X</span>inet
          </span>
          <span className="mt-0.5 block font-mono text-[9px] uppercase tracking-[0.22em] text-slate-400 dark:text-slate-500">
            Technologies
          </span>
        </span>
      )}
    </span>
  );
}
