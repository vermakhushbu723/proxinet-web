import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Breadcrumb, Button, Form, Input, Select, Steps, Result, message, Tag } from 'antd';
import { HomeOutlined, ArrowRightOutlined, CheckCircleFilled } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { Reveal, Glow, SectionHead } from './ui';
import { company } from '../data/company';

/* ------------------------------------------------------------------ *
 *  Page hero — the standard top of every inner page
 * ------------------------------------------------------------------ */
export function PageHero({ eyebrow, title, sub, crumbs = [], children, compact = false }) {
  return (
    <section className={`relative overflow-hidden border-b border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-ink-900 ${compact ? 'pb-10 pt-6 sm:pb-12 sm:pt-8' : 'pb-14 pt-7 sm:pb-20 sm:pt-10'}`}>
      <div className="px-grid-bg absolute inset-0" aria-hidden="true" />
      <Glow className="-left-20 -top-24" color="rgba(214,43,31,.20)" size={380} />
      <div className="px-container relative">
        {crumbs.length > 0 && (
          <Breadcrumb
            className="mb-5"
            items={[
              { title: <Link to="/"><HomeOutlined /></Link> },
              ...crumbs.map((c) => ({ title: c.to ? <Link to={c.to}>{c.label}</Link> : c.label })),
            ]}
          />
        )}
        <Reveal>
          {eyebrow && <div className="px-eyebrow mb-3"><span className="inline-block h-px w-6 bg-brand-400" />{eyebrow}</div>}
          <h1 className="px-h1 max-w-4xl text-slate-900 dark:text-white">{title}</h1>
          {sub && <p className="px-lead mt-5 max-w-2xl">{sub}</p>}
          {children && <div className="mt-7">{children}</div>}
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ *
 *  CTA band — the closing block on a page
 * ------------------------------------------------------------------ */
export function CTABand({
  title = 'Start with a free 30-minute IT infrastructure review',
  sub = 'No obligation. You receive a written summary covering current risks, EOL exposure and your top three priorities.',
  primary = { label: 'Book free assessment', to: '/book-assessment' },
  secondary = { label: 'Talk to an engineer', to: '/contact' },
}) {
  return (
    <section className="px-container py-16 sm:py-20">
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 via-brand-500 to-brand-600 p-8 sm:p-12">
          <div
            className="absolute inset-0 opacity-20"
            aria-hidden="true"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.4) 1px, transparent 1px)',
              backgroundSize: '44px 44px',
            }}
          />
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" aria-hidden="true" />
          <div className="relative flex flex-col items-start justify-between gap-7 lg:flex-row lg:items-center">
            <div className="max-w-xl">
              <h2 className="font-display text-2xl font-semibold leading-tight text-white sm:text-3xl">{title}</h2>
              <p className="mt-3 text-[15px] leading-relaxed text-white/85">{sub}</p>
              <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-[13px] text-white/80">
                {['Vendor-neutral advice', 'Written summary', 'No obligation'].map((x) => (
                  <span key={x} className="flex items-center gap-1.5"><CheckCircleFilled className="text-emerald-300" /> {x}</span>
                ))}
              </div>
            </div>
            <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
              <Link to={primary.to}>
                <Button size="large" className="!h-12 !border-none !bg-white !px-7 !font-semibold !text-brand-700 hover:!bg-brand-50">
                  {primary.label} <ArrowRightOutlined />
                </Button>
              </Link>
              <Link to={secondary.to}>
                <Button size="large" ghost className="!h-12 !px-7 !font-semibold">{secondary.label}</Button>
              </Link>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

/* ------------------------------------------------------------------ *
 *  Multi-step lead form — intent, then context, then contact
 * ------------------------------------------------------------------ */
const intents = [
  'Managed IT / AMC', 'Cloud migration', 'Cyber security', 'Backup & DR',
  'Network / Wi-Fi', 'Data center refresh', 'Something else',
];
const sizes = ['1–25 users', '26–100 users', '101–300 users', '300+ users'];
const timelines = ['Immediately', 'Within 1 month', '1–3 months', 'Just exploring'];

export function LeadForm({ compact = false, defaultIntent, onDone }) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({ intent: defaultIntent || '', size: '', timeline: '' });
  const [done, setDone] = useState(false);
  const [form] = Form.useForm();

  if (done) {
    return (
      <Result
        status="success"
        title="Got it — thank you!"
        subTitle="Our team replies within two working hours. If it is urgent, please call us directly."
        extra={[
          <a key="call" href={`tel:${company.phones[0]}`}><Button type="primary" size="large">Call {company.phones[0]}</Button></a>,
          <Link key="res" to="/resources/whitepapers"><Button size="large">Meanwhile, browse our guides</Button></Link>,
        ]}
      />
    );
  }

  const pick = (key, val) => {
    setData((d) => ({ ...d, [key]: val }));
    setTimeout(() => setStep((s) => Math.min(s + 1, 2)), 180);
  };

  const submit = (vals) => {
    // In production: POST to the CRM (Zoho/HubSpot) and trigger the auto-response email/SMS.
    console.info('LEAD →', { ...data, ...vals });
    message.success('Your request has been submitted.');
    setDone(true);
    onDone?.({ ...data, ...vals });
  };

  const Choice = ({ label, active, onClick }) => (
    <button
      type="button" onClick={onClick}
      className={`rounded-xl border px-4 py-3 text-left text-[14px] font-medium transition-all duration-200 ${
        active
          ? 'border-brand-500 bg-brand-50 text-brand-700 shadow-glow dark:bg-brand-500/15 dark:text-brand-200'
          : 'border-slate-200 text-slate-700 hover:border-brand-300 hover:bg-brand-50/50 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/5'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className={compact ? '' : 'px-card !p-6 sm:!p-8'}>
      <Steps
        size="small" current={step} className="!mb-7"
        onChange={(s) => s < step && setStep(s)}
        items={[{ title: 'Requirement' }, { title: 'Context' }, { title: 'Contact' }]}
      />

      {step === 0 && (
        <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}>
          <p className="mb-4 font-display text-lg font-semibold">What do you need?</p>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {intents.map((i) => <Choice key={i} label={i} active={data.intent === i} onClick={() => pick('intent', i)} />)}
          </div>
        </motion.div>
      )}

      {step === 1 && (
        <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}>
          <p className="mb-1 font-display text-lg font-semibold">A little context</p>
          <p className="mb-4 text-sm text-slate-500">This helps us assign the right engineer.</p>
          <p className="mb-2 font-mono text-[11px] uppercase tracking-wider text-slate-400">Team size</p>
          <div className="mb-5 grid gap-2.5 sm:grid-cols-2">
            {sizes.map((s) => <Choice key={s} label={s} active={data.size === s} onClick={() => setData((d) => ({ ...d, size: s }))} />)}
          </div>
          <p className="mb-2 font-mono text-[11px] uppercase tracking-wider text-slate-400">Timeline</p>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {timelines.map((t) => <Choice key={t} label={t} active={data.timeline === t} onClick={() => pick('timeline', t)} />)}
          </div>
        </motion.div>
      )}

      {step === 2 && (
        <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}>
          <p className="mb-1 font-display text-lg font-semibold">How should we reach you?</p>
          <div className="mb-4 flex flex-wrap gap-1.5">
            {[data.intent, data.size, data.timeline].filter(Boolean).map((t) => <Tag key={t} color="blue">{t}</Tag>)}
          </div>
          <Form form={form} layout="vertical" onFinish={submit} requiredMark={false}>
            <div className="grid gap-x-4 sm:grid-cols-2">
              <Form.Item name="name" label="Full name" rules={[{ required: true, message: 'Name is required' }]}>
                <Input size="large" placeholder="Your name" />
              </Form.Item>
              <Form.Item name="company" label="Company" rules={[{ required: true, message: 'Company name is required' }]}>
                <Input size="large" placeholder="Company name" />
              </Form.Item>
              <Form.Item name="email" label="Work email" rules={[{ required: true, type: 'email', message: 'Enter a valid email address' }]}>
                <Input size="large" placeholder="you@company.com" />
              </Form.Item>
              <Form.Item name="phone" label="Phone" rules={[{ required: true, pattern: /^[0-9+\-\s]{10,15}$/, message: 'Enter a 10-digit number' }]}>
                <Input size="large" placeholder="98XXXXXXXX" />
              </Form.Item>
            </div>
            <Form.Item name="message" label="Anything else we should know? (optional)">
              <Input.TextArea rows={3} placeholder="Current setup, a specific problem, or a question…" />
            </Form.Item>
            <div className="flex gap-3">
              <Button size="large" onClick={() => setStep(1)}>Back</Button>
              <Button size="large" type="primary" htmlType="submit" className="flex-1">Submit request</Button>
            </div>
            <p className="mt-3 text-center text-[12px] text-slate-400">
              Your details are used only for this enquiry. <Link className="underline" to="/legal/privacy-policy">Privacy policy</Link>
            </p>
          </Form>
        </motion.div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 *  Feature list (tick bullets)
 * ------------------------------------------------------------------ */
export function TickList({ items, className = '' }) {
  return (
    <ul className={`space-y-2.5 ${className}`}>
      {items.map((t) => (
        <li key={t} className="flex gap-3 text-[15px] leading-relaxed text-slate-600 dark:text-slate-300">
          <CheckCircleFilled className="mt-1 shrink-0 text-brand-500" />
          <span>{t}</span>
        </li>
      ))}
    </ul>
  );
}

/* ------------------------------------------------------------------ *
 *  Scroll restoration
 * ------------------------------------------------------------------ */
export function ScrollToTop() {
  const { pathname } = useLocation();
  React.useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, [pathname]);
  return null;
}
