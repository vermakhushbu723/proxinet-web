import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Breadcrumb, Button, Form, Input, Select, Result, message } from 'antd';
import { HomeOutlined, ArrowRightOutlined, CheckCircleFilled } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { Reveal, Glow } from './ui';
import { company } from '../data/company';
import { heroImageFor, img, photos } from '../data/images';
import { submitForm, showSubmitError } from '../api/public';

/* ------------------------------------------------------------------ *
 *  Page hero — the standard top of every inner page
 * ------------------------------------------------------------------ */
export function PageHero({ eyebrow, title, sub, crumbs = [], children, compact = false, image }) {
  const { pathname } = useLocation();
  const src = image === false ? null : image || heroImageFor(pathname);

  if (!src) {
    return (
      <section className={`relative overflow-hidden border-b border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-ink-900 ${compact ? 'pb-10 pt-6 sm:pb-12 sm:pt-8' : 'pb-14 pt-7 sm:pb-20 sm:pt-10'}`}>
        <div className="px-grid-bg absolute inset-0" aria-hidden="true" />
        <Glow className="-left-20 -top-24" color="rgba(214,43,31,.20)" size={380} />
        <div className="px-container relative">
          <HeroText {...{ eyebrow, title, sub, crumbs, children }} />
        </div>
      </section>
    );
  }

  return (
    <section className={`px-hero-photo relative isolate overflow-hidden bg-ink-900 ${compact ? 'pb-12 pt-7 sm:pb-16 sm:pt-9' : 'pb-16 pt-8 sm:pb-24 sm:pt-12 lg:min-h-[440px]'}`}>
      <motion.img
        src={src} alt="" aria-hidden="true" fetchpriority="high"
        initial={{ scale: 1.08 }} animate={{ scale: 1 }} transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-0 -z-10 h-full w-full object-cover"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-ink-900/95 via-ink-900/80 to-ink-900/35" aria-hidden="true" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-24 bg-gradient-to-t from-ink-900/60 to-transparent" aria-hidden="true" />
      <div className="px-container relative">
        <HeroText {...{ eyebrow, title, sub, crumbs, children }} light />
      </div>
    </section>
  );
}

function HeroText({ eyebrow, title, sub, crumbs, children, light = false }) {
  return (
    <>
      {crumbs.length > 0 && (
        <Breadcrumb
          className={`mb-5 ${light ? 'px-crumbs-light' : ''}`}
          items={[
            { title: <Link to="/"><HomeOutlined /></Link> },
            ...crumbs.map((c) => ({ title: c.to ? <Link to={c.to}>{c.label}</Link> : c.label })),
          ]}
        />
      )}
      <Reveal>
        {eyebrow && (
          <div className={`px-eyebrow mb-3 ${light ? '!text-brand-300' : ''}`}>
            <span className="inline-block h-px w-6 bg-brand-400" />{eyebrow}
          </div>
        )}
        <h1 className={`px-h1 max-w-4xl ${light ? 'text-white' : 'text-slate-900 dark:text-white'}`}>{title}</h1>
        {sub && <p className={`mt-5 max-w-2xl text-[1.02rem] leading-relaxed sm:text-lg ${light ? 'text-white/80' : 'text-slate-600 dark:text-slate-300'}`}>{sub}</p>}
        {children && <div className={`mt-7 ${light ? 'px-hero-actions' : ''}`}>{children}</div>}
      </Reveal>
    </>
  );
}

/* ------------------------------------------------------------------ *
 *  Image helpers — card cover, photo-backed section, framed feature image
 * ------------------------------------------------------------------ */
export function CardImage({ src, alt = '', className = 'h-44', children }) {
  if (!src) return null;
  return (
    <div className={`relative -mx-6 -mt-6 mb-5 overflow-hidden rounded-t-2xl bg-slate-200 dark:bg-white/5 ${className}`}>
      <img
        src={src} alt={alt} loading="lazy"
        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-900/40 via-transparent to-transparent" aria-hidden="true" />
      {children}
    </div>
  );
}

export function PhotoSection({ image, children, className = '', overlay = 'from-ink-900/95 via-ink-900/85 to-ink-900/70' }) {
  return (
    <section className={`relative isolate overflow-hidden bg-ink-900 ${className}`}>
      <img src={image} alt="" aria-hidden="true" loading="lazy" className="absolute inset-0 -z-10 h-full w-full object-cover" />
      <div className={`absolute inset-0 -z-10 bg-gradient-to-br ${overlay}`} aria-hidden="true" />
      {children}
    </section>
  );
}

export function FeatureImage({ src, alt = '', className = '', badge, ratio = 'aspect-[4/3]' }) {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute -bottom-3 -right-3 h-full w-full rounded-3xl border-2 border-brand-200 dark:border-brand-500/30" aria-hidden="true" />
      <div className="relative overflow-hidden rounded-3xl shadow-lift">
        <img src={src} alt={alt} loading="lazy" className={`${ratio} h-full w-full object-cover`} />
      </div>
      {badge && (
        <div className="absolute -bottom-5 left-5 rounded-2xl border border-slate-200 bg-white px-5 py-3.5 shadow-lift dark:border-white/10 dark:bg-ink-800">
          {badge}
        </div>
      )}
    </div>
  );
}

/* Heading for sections that sit on a dark photo */
export function DarkHead({ eyebrow, title, sub, center = false }) {
  return (
    <div className={center ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}>
      {eyebrow && <div className="px-eyebrow mb-3 !text-brand-300"><span className="inline-block h-px w-6 bg-brand-400" />{eyebrow}</div>}
      <h2 className="px-h2 text-white">{title}</h2>
      {sub && <p className="mt-4 text-[1.02rem] leading-relaxed text-white/75 sm:text-lg">{sub}</p>}
    </div>
  );
}

/* Photo tile with a label — industries, categories */
export function ImageTile({ to, src, label, sub }) {
  return (
    <Link to={to} className="group relative block aspect-[4/3] overflow-hidden rounded-2xl sm:aspect-[16/10]">
      <img src={src} alt={label} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110" />
      <div className="absolute inset-0 bg-gradient-to-t from-ink-900/90 via-ink-900/35 to-transparent" aria-hidden="true" />
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-4">
        <span className="min-w-0">
          <span className="block font-display text-[15px] font-semibold leading-tight text-white sm:text-lg">{label}</span>
          {sub && <span className="mt-0.5 hidden text-[12.5px] text-white/70 sm:block">{sub}</span>}
        </span>
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/15 text-white backdrop-blur transition-colors group-hover:bg-brand-500">
          <ArrowRightOutlined className="text-[11px]" />
        </span>
      </div>
    </Link>
  );
}

/* ------------------------------------------------------------------ *
 *  CTA band — the closing block on a page
 * ------------------------------------------------------------------ */
export function CTABand({
  title = 'Have an IT requirement? Let’s talk.',
  sub = 'Tell us what you need — our team replies within two working hours.',
  primary = { label: 'Get In Touch', to: '/contact' },
  secondary = null,
}) {
  return (
    <section className="px-container py-14 sm:py-18 lg:py-20">
      <Reveal>
        <div
          className="
            group relative isolate overflow-hidden
            rounded-[28px]
            border border-slate-200/80
            bg-slate-900
            p-6
            shadow-[0_25px_80px_rgba(15,23,42,0.18)]
            sm:p-10
            lg:p-12
          "
        >
          {/* IT / Business Background Image */}
          <img
            src="https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=2000&q=85"
            alt=""
            aria-hidden="true"
            loading="lazy"
            className="
              absolute
              inset-0
              -z-20
              h-full
              w-full
              object-cover
              object-center
              opacity-100
              transition-transform
              duration-1000
              group-hover:scale-[1.03]
            "
          />

          {/* Dark Neutral Overlay */}
          <div
            className="
              absolute
              inset-0
              -z-10
              bg-slate-950/70
            "
            aria-hidden="true"
          />

          {/* Soft Gradient */}
          <div
            className="
              absolute
              inset-0
              -z-10
              bg-gradient-to-r
              from-slate-950/90
              via-slate-900/65
              to-slate-900/30
            "
            aria-hidden="true"
          />

          {/* Subtle Grid */}
          <div
            className="absolute inset-0 -z-10 opacity-[0.08]"
            aria-hidden="true"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,.35) 1px, transparent 1px), linear-gradient(90deg,rgba(255,255,255,.35) 1px, transparent 1px)',
              backgroundSize: '42px 42px',
            }}
          />

          {/* Soft Light */}
          <div
            className="
              absolute
              -right-24
              -top-24
              -z-10
              h-72
              w-72
              rounded-full
              bg-blue-400/15
              blur-3xl
              transition-transform
              duration-700
              group-hover:scale-125
            "
            aria-hidden="true"
          />

          <div
            className="
              absolute
              -bottom-28
              -left-20
              -z-10
              h-64
              w-64
              rounded-full
              bg-cyan-400/10
              blur-3xl
            "
            aria-hidden="true"
          />

          {/* Main Content */}
          <div
            className="
              relative
              flex
              flex-col
              gap-8
              lg:flex-row
              lg:items-center
              lg:justify-between
            "
          >
            {/* Text */}
            <div className="max-w-2xl">
              <h2
                className="
                  max-w-xl
                  font-display
                  text-2xl
                  font-bold
                  leading-[1.12]
                  tracking-tight
                  text-white
                  sm:text-3xl
                  lg:text-4xl
                "
              >
                {title}
              </h2>

              <p
                className="
                  mt-4
                  max-w-xl
                  text-sm
                  leading-6
                  text-white/80
                  sm:text-[15px]
                  sm:leading-7
                "
              >
                {sub}
              </p>
            </div>

            {/* Buttons */}
            <div
              className="
                flex
                shrink-0
                flex-col
                gap-3
                sm:flex-row
                lg:flex-col
                xl:flex-row
              "
            >
              <Link to={primary.to}>
                <Button
                  size="large"
                  className="
                    group/btn
                    !h-12
                    !w-full
                    !rounded-xl
                    !border-none
                    !bg-white
                    !px-7
                    !font-semibold
                    !text-slate-900
                    !shadow-[0_10px_30px_rgba(0,0,0,0.18)]
                    transition-all
                    duration-300
                    hover:-translate-y-1
                    hover:!bg-white
                    hover:!text-brand-700
                    hover:!shadow-[0_16px_35px_rgba(0,0,0,0.25)]
                    sm:!w-auto
                  "
                >
                  {primary.label}

                  <ArrowRightOutlined
                    className="
                      ml-1
                      transition-transform
                      duration-300
                      group-hover/btn:translate-x-1
                    "
                  />
                </Button>
              </Link>

              {secondary && (
                <Link to={secondary.to}>
                  <Button
                    size="large"
                    ghost
                    className="
                      !h-12
                      !w-full
                      !rounded-xl
                      !border-white/40
                      !px-7
                      !font-semibold
                      !text-white
                      backdrop-blur-sm
                      transition-all
                      duration-300
                      hover:-translate-y-1
                      hover:!border-white
                      hover:!bg-white/10
                      sm:!w-auto
                    "
                  >
                    {secondary.label}
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Bottom Accent */}
          <div
            className="
              absolute
              bottom-0
              left-8
              right-8
              h-px
              bg-gradient-to-r
              from-transparent
              via-white/40
              to-transparent
            "
            aria-hidden="true"
          />
        </div>
      </Reveal>
    </section>
  );
}

/* ------------------------------------------------------------------ *
 *  Enquiry form — the single form on the site (Contact page)
 * ------------------------------------------------------------------ */
const intents = [
  'Managed IT / AMC', 'Cloud', 'Cyber security', 'Backup & DR',
  'Network / Wi-Fi', 'Data center', 'Something else',
];

export function LeadForm({ compact = false, defaultIntent, onDone }) {
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  if (done) {
    return (
      <Result
        status="success"
        title="Thank you — we have your enquiry"
        subTitle="Our team replies within two working hours. If it is urgent, please call us directly."
        extra={<a href={`tel:${company.phones[0]}`}><Button type="primary" size="large">Call {company.phones[0]}</Button></a>}
      />
    );
  }

  const submit = async (vals) => {
    setSaving(true);
    try {
      await submitForm('leads', { ...vals, message: vals.message || '' });
      message.success('Your enquiry has been submitted.');
      setDone(true);
      onDone?.(vals);
    } catch (err) {
      showSubmitError(err, form);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={compact ? '' : 'px-card !p-6 sm:!p-8'}>
      <Form form={form} layout="vertical" onFinish={submit} requiredMark={false} initialValues={{ intent: defaultIntent }}>
        <div className="grid gap-x-4 sm:grid-cols-2">
          <Form.Item name="name" label="Full name" rules={[{ required: true, message: 'Name is required' }]}>
            <Input size="large" placeholder="Your name" />
          </Form.Item>
          <Form.Item name="company" label="Company" rules={[{ required: true, message: 'Company name is required' }]}>
            <Input size="large" placeholder="Company name" />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Enter a valid email address' }]}>
            <Input size="large" placeholder="you@company.com" />
          </Form.Item>
          <Form.Item name="phone" label="Phone" rules={[{ required: true, pattern: /^[0-9+\-\s]{10,15}$/, message: 'Enter a 10-digit number' }]}>
            <Input size="large" placeholder="98XXXXXXXX" />
          </Form.Item>
        </div>
        <Form.Item name="intent" label="Requirement">
          <Select size="large" placeholder="What do you need?" allowClear options={intents.map((v) => ({ value: v, label: v }))} />
        </Form.Item>
        <Form.Item name="message" label="Message (optional)">
          <Input.TextArea rows={3} placeholder="Tell us briefly about your requirement…" />
        </Form.Item>
        <Button size="large" type="primary" htmlType="submit" block loading={saving}>Send enquiry</Button>
        <p className="mt-3 text-center text-[12px] text-slate-400">
          Your details are used only for this enquiry. <Link className="underline" to="/legal/privacy-policy">Privacy policy</Link>
        </p>
      </Form>
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
