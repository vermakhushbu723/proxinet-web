import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Button, Form, Input, Select, Result, Upload, Alert } from 'antd';
import {
  PhoneOutlined, MailOutlined, EnvironmentOutlined, WhatsAppOutlined, UploadOutlined,
} from '@ant-design/icons';
import { company } from '../data/company';
import { jobs } from '../data/people';
import { submitApplication, showSubmitError } from '../api/public';
import { Reveal, SectionHead, IconBadge } from '../components/ui';
import { PageHero, LeadForm, TickList } from '../components/blocks';

/* =================== CONTACT =================== */
export function Contact() {
  const wa = `https://wa.me/${company.whatsapp}?text=${encodeURIComponent('Hi ProXinet, I would like to talk about IT infrastructure.')}`;

  return (
    <>
      <PageHero
        eyebrow="Contact" title="Let's talk"
        sub="Form, call or WhatsApp — we reply within two working hours."
        crumbs={[{ label: 'Contact' }]}
      />

      <section className="px-container px-section">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr]">
          <Reveal>
            <div className="space-y-4">
              {[
                { icon: <PhoneOutlined />, t: 'Call us', lines: company.phones, href: (p) => `tel:${p}`, note: 'Mon–Sat, 9:30 AM – 6:30 PM' },
                { icon: <MailOutlined />, t: 'Email', lines: [company.email], href: (e) => `mailto:${e}`, note: 'Reply within two working hours' },
                { icon: <WhatsAppOutlined />, t: 'WhatsApp', lines: ['Chat on WhatsApp'], href: () => wa, note: 'Fastest for quick questions', external: true },
              ].map((c) => (
                <div key={c.t} className="px-card flex items-start gap-4">
                  <IconBadge>{c.icon}</IconBadge>
                  <div className="min-w-0">
                    <p className="font-display font-semibold text-slate-900 dark:text-white">{c.t}</p>
                    <div className="mt-1 space-y-0.5">
                      {c.lines.map((l) => (
                        <a
                          key={l} href={c.href(l)}
                          {...(c.external ? { target: '_blank', rel: 'noreferrer' } : {})}
                          className="block text-[15px] font-medium text-brand-600 hover:underline dark:text-brand-300"
                        >
                          {l}
                        </a>
                      ))}
                    </div>
                    <p className="mt-1 font-mono text-[11px] uppercase tracking-wider text-slate-400">{c.note}</p>
                  </div>
                </div>
              ))}

              {company.offices.map((o) => (
                <div key={o.label} className="px-card flex items-start gap-4">
                  <IconBadge><EnvironmentOutlined /></IconBadge>
                  <div className="min-w-0">
                    <p className="font-display font-semibold text-slate-900 dark:text-white">{o.label}</p>
                    <p className="px-body mt-1">{o.line}</p>
                    <a
                      href={`https://www.google.com/maps/search/${encodeURIComponent(o.line)}`}
                      target="_blank" rel="noreferrer"
                      className="mt-2 inline-block text-[13.5px] font-semibold text-brand-600 dark:text-brand-300"
                    >
                      Open in Google Maps →
                    </a>
                  </div>
                </div>
              ))}

            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <h2 className="px-h3 mb-5 text-slate-900 dark:text-white">Send an enquiry</h2>
            <LeadForm />
          </Reveal>
        </div>
      </section>
    </>
  );
}

/* =================== BOOK ASSESSMENT =================== */
// The separate booking form was retired — enquiries go through the Contact page form.
export function BookAssessment() {
  return <Navigate to="/contact" replace />;
}

/* =================== CAREERS =================== */
export function Careers() {
  const [applied, setApplied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  return (
    <>
      <PageHero
        eyebrow="Careers" title="Grow your IT career with us"
        sub="Grow with us — send your resume and our team will get in touch."
        crumbs={[{ label: 'Careers' }]}
      />

      <section id="apply" className="px-container px-section">
        <div className="mx-auto max-w-2xl">
          <SectionHead eyebrow="Apply" title="Send us your resume" sub="Fill in your details and attach your resume — we keep every profile in our talent database." center />
          <Reveal className="mt-8">
            {applied ? (
              <Result
                status="success" title="Application received"
                subTitle="We will review your profile and get in touch."
                extra={<Link to="/"><Button type="primary">Back to home</Button></Link>}
              />
            ) : (
              <div className="relative">
                {/* soft brand glow behind the card */}
                <div className="absolute -inset-3 rounded-[32px] bg-gradient-to-br from-brand-500/25 via-orange-400/10 to-blue-500/20 blur-2xl" aria-hidden="true" />
                <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.16)] dark:border-white/10 dark:bg-ink-900 dark:shadow-[0_24px_60px_rgba(0,0,0,0.5)]">
                  <div className="h-1.5 bg-gradient-to-r from-brand-600 via-orange-500 to-amber-400" aria-hidden="true" />
                  <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5 sm:px-9 dark:border-white/10">
                    <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-lg text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">✦</span>
                    <div>
                      <p className="font-display text-[17px] font-bold text-slate-900 dark:text-white">Application form</p>
                      <p className="text-[13px] text-slate-500 dark:text-slate-400">Takes about 2 minutes · All fields marked are required</p>
                    </div>
                  </div>
                  <div className="px-apply-form p-6 sm:p-9">
                <Form
                  form={form} layout="vertical" requiredMark={false}
                  onFinish={async (v) => {
                    setSaving(true);
                    try {
                      await submitApplication({
                        name: v.name, email: v.email, phone: v.phone, role: v.role,
                        roleTitle: jobs.find((j) => j.slug === v.role)?.title || 'General / talent database',
                        message: v.message || '',
                      }, v.resume?.[0]?.originFileObj);
                      setApplied(true);
                    } catch (err) {
                      showSubmitError(err, form);
                    } finally {
                      setSaving(false);
                    }
                  }}
                >
                  <div className="grid gap-x-4 sm:grid-cols-2">
                    <Form.Item name="name" label="Full name" rules={[{ required: true, message: 'Name is required' }]}>
                      <Input size="large" placeholder="Your name" />
                    </Form.Item>
                    <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Enter a valid email address' }]}>
                      <Input size="large" placeholder="you@email.com" />
                    </Form.Item>
                    <Form.Item name="phone" label="Phone" rules={[{ required: true, message: 'Phone number is required' }]}>
                      <Input size="large" placeholder="98XXXXXXXX" />
                    </Form.Item>
                    <Form.Item name="role" label="Applying for" rules={[{ required: true, message: 'Choose a role' }]}>
                      <Select
                        size="large" placeholder="Select a role"
                        options={[...jobs.map((j) => ({ value: j.slug, label: j.title })), { value: 'general', label: 'General / talent database' }]}
                      />
                    </Form.Item>
                  </div>
                  <Form.Item
                    name="resume" label="Resume (PDF, max 2 MB)" valuePropName="fileList"
                    getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
                    rules={[{ required: true, message: 'Please attach your resume' }]}
                  >
                    <Upload beforeUpload={() => false} maxCount={1} accept=".pdf,.doc,.docx">
                      <Button icon={<UploadOutlined />} size="large">Select file</Button>
                    </Upload>
                  </Form.Item>
                  <Form.Item name="message" label="Cover note (optional)">
                    <Input.TextArea rows={3} placeholder="Why are you a good fit for this role?" />
                  </Form.Item>
                  <Button type="primary" size="large" htmlType="submit" block loading={saving} className="!h-12 !rounded-xl !text-[15px] !font-semibold !shadow-[0_10px_24px_rgba(214,43,31,0.28)]">Submit application</Button>
                </Form>
                  </div>
                </div>
              </div>
            )}
          </Reveal>
        </div>
      </section>
    </>
  );
}

/* =================== PROCUREMENT PACK =================== */
export function Procurement() {
  const docs = [
    'Company profile PDF — CIN, GST and Udyam registration',
    'ISO 27001:2022 and ISO 9001:2015 certificates',
    'OEM partnership certificates (Microsoft, Dell, Fortinet, Veeam)',
    'Financial credentials — turnover band and bank reference',
    'Client references — industry-matched, contactable',
    'Insurance — professional indemnity and workmen compensation',
    'Data protection & confidentiality policy (DPDP Act 2023 aligned)',
    'Information security policy summary',
    'Sample SLA document and escalation matrix',
    'Background verification policy for deployed engineers',
    'MSA / NDA templates',
    'Business continuity plan summary',
  ];

  return (
    <>
      <PageHero
        eyebrow="For procurement teams" title="Vendor Onboarding Pack"
        sub="All vendor-registration documents in one request."
        crumbs={[{ label: 'Procurement' }]}
      />
      <section className="px-container grid gap-10 px-section lg:grid-cols-[1fr_380px]">
        <Reveal>
          <h2 className="px-h3 text-slate-900 dark:text-white">What the pack contains</h2>
          <TickList items={docs} className="mt-5" />
          <Alert
            className="!mt-8" type="info" showIcon
            message="Custom formats are possible too"
            description="If your organisation has its own vendor registration format, we will complete and return that as well."
          />
        </Reveal>
        <Reveal delay={0.1}>
          <div className="px-card lg:sticky lg:top-24">
            <h2 className="px-h3 mb-1 text-slate-900 dark:text-white">Request the pack</h2>
            <p className="px-body mb-5">Email us from your business address and we send the pack within one working day.</p>
            <a href={`mailto:${company.email}?subject=${encodeURIComponent('Vendor onboarding pack request')}`} className="block">
              <Button type="primary" size="large" block icon={<MailOutlined />}>Email {company.email}</Button>
            </a>
            <Link to="/contact" className="mt-2 block"><Button size="large" block>Or use the contact form</Button></Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
