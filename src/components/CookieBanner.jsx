import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Switch } from 'antd';
import { AnimatePresence, motion } from 'framer-motion';

/** Consent banner for the DPDP Act 2023 — analytics and marketing opt-in. */
export default function CookieBanner() {
  const [show, setShow] = useState(false);
  const [details, setDetails] = useState(false);
  const [prefs, setPrefs] = useState({ analytics: true, marketing: false });

  useEffect(() => {
    try {
      if (!localStorage.getItem('px-cookie-consent')) setShow(true);
    } catch {
      /* storage blocked — no point showing the banner */
    }
  }, []);

  const save = (value) => {
    try { localStorage.setItem('px-cookie-consent', JSON.stringify(value)); } catch { /* ignore */ }
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          role="dialog" aria-label="Cookie preferences"
          className="fixed inset-x-3 bottom-16 z-[60] mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-5 shadow-lift sm:bottom-5 dark:border-white/15 dark:bg-ink-800"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className="font-display font-semibold text-slate-900 dark:text-white">Cookies and your privacy</p>
              <p className="px-body mt-1.5">
                Essential cookies are required to run the site. Analytics and marketing cookies load only
                with your consent.{' '}
                <Link to="/legal/cookie-policy" className="font-semibold text-brand-600 underline dark:text-brand-300">
                  Cookie policy
                </Link>
              </p>

              <AnimatePresence>
                {details && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 space-y-3 border-t border-slate-100 pt-4 dark:border-white/10">
                      {[
                        { k: 'essential', t: 'Essential', d: 'Theme, session and form security. Always on.', locked: true },
                        { k: 'analytics', t: 'Analytics', d: 'GA4 and Clarity — to understand which pages are useful.' },
                        { k: 'marketing', t: 'Marketing', d: 'LinkedIn and Google Ads — for relevant audiences.' },
                      ].map((c) => (
                        <div key={c.k} className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-[14px] font-medium text-slate-800 dark:text-slate-100">{c.t}</p>
                            <p className="text-[12.5px] text-slate-500 dark:text-slate-400">{c.d}</p>
                          </div>
                          <Switch
                            size="small" disabled={c.locked}
                            checked={c.locked ? true : prefs[c.k]}
                            onChange={(v) => setPrefs((p) => ({ ...p, [c.k]: v }))}
                            aria-label={`${c.t} cookies`}
                          />
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex w-full shrink-0 flex-wrap gap-2 sm:w-auto sm:flex-col">
              <Button type="primary" onClick={() => save({ essential: true, analytics: true, marketing: true })} className="flex-1">
                Accept all
              </Button>
              <Button onClick={() => save({ essential: true, ...prefs })} className="flex-1">
                {details ? 'Save preferences' : 'Essential only'}
              </Button>
              <Button type="text" size="small" onClick={() => setDetails((d) => !d)}>
                {details ? 'Hide options' : 'Customise'}
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
