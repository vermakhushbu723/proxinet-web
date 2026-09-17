import React from 'react';
import { Tooltip } from 'antd';

/* Single-series column chart (counts per day). Brand red, rounded data-ends, hover tooltip. */
export function ColumnChart({ data, height = 160 }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const ticks = [max, Math.round(max / 2), 0];
  return (
    <div className="flex gap-3">
      <div className="flex flex-col justify-between pb-6 text-right font-mono text-[10px] text-slate-400" style={{ height }}>
        {ticks.map((t, i) => <span key={i}>{t}</span>)}
      </div>
      <div className="min-w-0 flex-1">
        <div className="relative" style={{ height: height - 24 }}>
          {[0, 0.5, 1].map((p) => (
            <div key={p} className="absolute inset-x-0 border-t border-dashed border-slate-200 dark:border-white/10" style={{ top: `${p * 100}%` }} />
          ))}
          <div className="absolute inset-0 flex items-end gap-[2px]">
            {data.map((d) => (
              <Tooltip key={d.key} title={<span><b>{d.value}</b> request{d.value === 1 ? '' : 's'} · {d.full}</span>}>
                <div className="group flex h-full flex-1 cursor-default items-end justify-center">
                  <div
                    className="w-full max-w-[26px] rounded-t-[4px] bg-brand-500 transition-colors group-hover:bg-brand-700 dark:bg-brand-400"
                    style={{ height: `${(d.value / max) * 100}%`, minHeight: d.value ? 3 : 0 }}
                  />
                </div>
              </Tooltip>
            ))}
          </div>
        </div>
        <div className="mt-1.5 flex gap-[2px]">
          {data.map((d, i) => (
            <span key={d.key} className="flex-1 text-center font-mono text-[10px] text-slate-400">
              {i % 2 === 0 ? d.label : ''}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* Horizontal bars for "how many per category" — one hue, label + value in text ink. */
export function BarList({ items, onClick }) {
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <ul className="m-0 list-none space-y-2.5 p-0">
      {items.map((it) => (
        <li key={it.key}>
          <Tooltip title={`${it.label}: ${it.value}`} placement="topLeft">
            <button
              type="button" onClick={() => onClick?.(it)}
              className={`block w-full border-0 bg-transparent p-0 text-left ${onClick ? 'cursor-pointer' : 'cursor-default'}`}
            >
              <div className="mb-1 flex items-center justify-between gap-3 text-[12.5px]">
                <span className="flex min-w-0 items-center gap-2 truncate text-slate-600 dark:text-slate-300">
                  {it.icon && <span className="text-slate-400">{it.icon}</span>}
                  {it.label}
                </span>
                <span className="font-medium tabular-nums text-slate-800 dark:text-slate-100">{it.value}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-white/5">
                <div className="h-full rounded-full bg-brand-500 transition-all dark:bg-brand-400" style={{ width: `${(it.value / max) * 100}%` }} />
              </div>
            </button>
          </Tooltip>
        </li>
      ))}
    </ul>
  );
}
