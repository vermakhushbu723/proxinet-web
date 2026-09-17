import React from 'react';

export const cardCls = 'min-w-0 rounded-xl border border-slate-200 bg-white dark:border-white/10 dark:bg-[#101d2b]';

export default function Panel({ title, extra, children, className = '', bodyClass = 'p-4' }) {
  return (
    <section className={`${cardCls} ${className}`}>
      {title && (
        <header className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-2.5 dark:border-white/10">
          <h2 className="m-0 text-[13.5px] font-semibold text-slate-900 dark:text-white">{title}</h2>
          {extra}
        </header>
      )}
      <div className={bodyClass}>{children}</div>
    </section>
  );
}

export function PageHeader({ title, sub, extra }) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 className="m-0 text-[18px] font-semibold leading-tight text-slate-900 dark:text-white">{title}</h1>
        {sub && <p className="m-0 mt-0.5 text-[12.5px] text-slate-500">{sub}</p>}
      </div>
      {extra && <div className="flex flex-wrap gap-2">{extra}</div>}
    </div>
  );
}
