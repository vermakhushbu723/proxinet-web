import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button, Modal } from 'antd';

/** Details popup for a technology alliance logo. */
export default function AllianceModal({ alliance, onClose }) {
  const { pathname } = useLocation();
  return (
    <Modal open={!!alliance} onCancel={onClose} footer={null} centered width={520} destroyOnClose>
      {alliance && (
        <div className="pt-2">
          <div className="flex h-44 items-center justify-center rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10">
            <img src={alliance.logo} alt={alliance.name} className="max-h-36 max-w-[340px] object-contain" />
          </div>
          <h3 className="mt-5 font-display text-[20px] font-bold text-slate-900 dark:text-white">{alliance.name}</h3>
          <p className="mt-1 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-brand-500">{alliance.cat}</p>
          <p className="mt-3 text-[15px] leading-6 text-slate-600 dark:text-slate-300">{alliance.desc}</p>
          <ul className="mt-4 space-y-2 border-t border-slate-100 pt-4 dark:border-white/10">
            {alliance.offer.map((o) => (
              <li key={o} className="flex items-center gap-2 text-[14px] text-slate-700 dark:text-slate-200">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                {o}
              </li>
            ))}
          </ul>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/contact" onClick={onClose}><Button type="primary">Talk to an expert</Button></Link>
            {pathname !== '/partners' && (
              <Link to="/partners" onClick={onClose}><Button>All partners</Button></Link>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}
