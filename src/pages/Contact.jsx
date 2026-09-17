import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Form, Input, Select, DatePicker, TimePicker, Result, Steps, Tag, message, Upload, Alert } from 'antd';
import {
  PhoneOutlined, MailOutlined, EnvironmentOutlined, WhatsAppOutlined,
  ClockCircleOutlined, CalendarOutlined, UploadOutlined, CheckCircleFilled, DownloadOutlined,
} from '@ant-design/icons';
import { company } from '../data/company';
import { jobs, findJob } from '../data/people';
import { submitForm, submitApplication, showSubmitError } from '../api/public';
import { Reveal, Stagger, StaggerItem, SectionHead, IconBadge } from '../components/ui';
import { PageHero, CTABand, LeadForm, TickList, PhotoSection, DarkHead, FeatureImage } from '../components/blocks';
import { img, photos } from '../data/images';

/* =================== CONTACT =================== */
export function Contact() {
  const wa = `https://wa.me/${company.whatsapp}?text=${encodeURIComponent('Hi ProXinet, I would like to talk about IT infrastructure.')}`;

  return (
    <>
      <PageHero
        eyebrow="Contact" title="Let's talk"
        sub="Fill the form, call us, or leave a WhatsApp message — all three land in the same queue."
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

              {/* map placeholder — swap for a real iframe embed in production */}
              <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10">
                <div className="flex h-52 items-center justify-center bg-gradient-to-br from-brand-50 to-slate-100 dark:from-brand-500/10 dark:to-ink-800">
                  <div className="text-center">
                    <EnvironmentOutlined className="text-3xl text-brand-500" />
                    <p className="mt-2 font-display font-semibold text-slate-700 dark:text-slate-200">Noida · Sector 3</p>
                    <p className="mt-0.5 text-[12.5px] text-slate-500">
                      Google Maps embed goes here in the production build
                    </p>
                  </div>
                </div>
              </div>
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
export function BookAssessment() {
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  const submit = async (v) => {
    setSaving(true);
    try {
      await submitForm('assessments', {
        name: v.name, company: v.company, email: v.email, phone: v.phone, focus: v.focus, mode: v.mode,
        date: v.date?.format?.('YYYY-MM-DD') ?? v.date,
        time: v.time?.format?.('HH:mm') ?? v.time,
        context: v.context || '',
      });
      setDone(true);
    } catch (err) {
      showSubmitError(err, form);
    } finally {
      setSaving(false);
    }
  };

  if (done) {
    return (
      <div className="px-container px-section">
        <Result
          status="success"
          title="Your assessment slot request is in"
          subTitle="Our team confirms within two working hours and sends a calendar invite."
          extra={[
            <Link key="h" to="/"><Button type="primary" size="large">Back to home</Button></Link>,
            <Link key="r" to="/resources/whitepapers"><Button size="large">Browse guides meanwhile</Button></Link>,
          ]}
        />
      </div>
    );
  }

  return (
    <>
      <PageHero
        eyebrow="Free assessment" title="30 minutes. An honest review. Zero obligation."
        sub="We review your current setup and hand you a written summary — whether or not you engage us, the report is yours."
        crumbs={[{ label: 'Book Assessment' }]}
      />

      <section className="px-container grid gap-10 px-section lg:grid-cols-[1fr_1.1fr]">
        <Reveal>
          <h2 className="px-h3 text-slate-900 dark:text-white">What the assessment covers</h2>
          <TickList
            className="mt-5"
            items={[
              'Complete asset inventory — servers, endpoints and network devices',
              'EOL / EOSL exposure list with risk ranking',
              'Backup and DR readiness score — whether RPO and RTO are defined at all',
              'Security gap analysis — endpoint, email, access and patching',
              'Licence and warranty status review',
              'Prioritised 90-day action plan with indicative budget',
            ]}
          />

          <h2 className="px-h3 mt-10 text-slate-900 dark:text-white">How it works</h2>
          <Steps
            className="!mt-5" direction="vertical" current={-1}
            items={[
              { title: 'You request a slot', description: 'Fill the form below with your preferred date and time.' },
              { title: 'We confirm', description: 'A confirmation and calendar invite by call or email within two working hours.' },
              { title: '30-minute session', description: 'Onsite or by video call — we go through your current setup and pain points.' },
              { title: 'Written summary', description: 'Findings and prioritised recommendations in your inbox within two working days.' },
            ]}
          />

          <Alert
            className="!mt-8" type="success" showIcon
            message="No sales pressure"
            description="After the assessment you can take it forward or not. Either way, the report is yours to keep."
          />
        </Reveal>

        <Reveal delay={0.1}>
          <div className="px-card lg:sticky lg:top-24">
            <h2 className="px-h3 mb-1 text-slate-900 dark:text-white">Book a slot</h2>
            <p className="px-body mb-5">All the fields take about 30 seconds.</p>
            <Form form={form} layout="vertical" onFinish={submit} requiredMark={false}>
              <div className="grid gap-x-4 sm:grid-cols-2">
                <Form.Item name="name" label="Full name" rules={[{ required: true, message: 'Name is required' }]}>
                  <Input size="large" placeholder="Your name" />
                </Form.Item>
                <Form.Item name="company" label="Company" rules={[{ required: true, message: 'Company is required' }]}>
                  <Input size="large" placeholder="Company name" />
                </Form.Item>
                <Form.Item name="email" label="Work email" rules={[{ required: true, type: 'email', message: 'Enter a valid email address' }]}>
                  <Input size="large" placeholder="you@company.com" />
                </Form.Item>
                <Form.Item name="phone" label="Phone" rules={[{ required: true, message: 'Phone number is required' }]}>
                  <Input size="large" placeholder="98XXXXXXXX" />
                </Form.Item>
              </div>
              <Form.Item name="focus" label="Focus area" rules={[{ required: true, message: 'Select an area' }]}>
                <Select
                  size="large" placeholder="Which area?"
                  options={['Full infrastructure review', 'Cyber security', 'Cloud migration', 'Backup & DR', 'Network / Wi-Fi', 'Managed IT / AMC']
                    .map((v) => ({ value: v, label: v }))}
                />
              </Form.Item>
              <div className="grid gap-x-4 sm:grid-cols-2">
                <Form.Item name="date" label="Preferred date" rules={[{ required: true, message: 'Choose a date' }]}>
                  <DatePicker size="large" className="w-full" suffixIcon={<CalendarOutlined />} />
                </Form.Item>
                <Form.Item name="time" label="Preferred time" rules={[{ required: true, message: 'Choose a time' }]}>
                  <TimePicker size="large" className="w-full" format="h:mm a" minuteStep={30} suffixIcon={<ClockCircleOutlined />} />
                </Form.Item>
              </div>
              <Form.Item name="mode" label="Meeting mode" initialValue="video">
                <Select
                  size="large"
                  options={[
                    { value: 'video', label: 'Video call (Teams / Google Meet)' },
                    { value: 'onsite', label: 'Onsite visit (Delhi NCR)' },
                    { value: 'phone', label: 'Phone call' },
                  ]}
                />
              </Form.Item>
              <Form.Item name="context" label="Context (optional)">
                <Input.TextArea rows={3} placeholder="Current setup, a specific concern, or a deadline…" />
              </Form.Item>
              <Button type="primary" size="large" htmlType="submit" block loading={saving}>Request this slot</Button>
              <p className="mt-3 text-center text-[12px] text-slate-400">
                Your details are used only for this booking. <Link className="underline" to="/legal/privacy-policy">Privacy policy</Link>
              </p>
            </Form>
          </div>
        </Reveal>
      </section>
    </>
  );
}

/* =================== CAREERS =================== */
export function Careers() {
  const [applied, setApplied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  return (
    <>
      <PageHero
        eyebrow="Careers" title="People who solve the problem, even at 2 a.m."
        sub="ProXinet focuses on hiring, developing, motivating and retaining people. These roles are open right now."
        crumbs={[{ label: 'Careers' }]}
      />

      <section className="px-container px-section">
        <SectionHead eyebrow="Open positions" title={`${jobs.length} roles currently open`} />
        <Stagger className="mt-9 space-y-4">
          {jobs.map((j) => (
            <StaggerItem key={j.slug}>
              <div className="px-card px-card-hover">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="font-display text-[18px] font-semibold text-slate-900 dark:text-white">{j.title}</h3>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <Tag color="red">{j.dept}</Tag>
                      <Tag>{j.loc}</Tag>
                      <Tag>{j.type}</Tag>
                      <Tag>{j.exp}</Tag>
                    </div>
                    <p className="px-body mt-3">{j.desc}</p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {j.skills.map((s) => (
                        <span key={s} className="rounded-md bg-slate-100 px-2 py-0.5 text-[12px] text-slate-600 dark:bg-white/5 dark:text-slate-300">{s}</span>
                      ))}
                    </div>
                  </div>
                  <a href="#apply"><Button type="primary">Apply</Button></a>
                </div>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <PhotoSection image={img(photos.officeTeam, 1920)}>
        <div className="px-container px-section">
          <DarkHead eyebrow="Life at ProXinet" title="What the work is like" />
          <div className="mt-9 grid gap-4 md:grid-cols-3">
            {[
              { t: 'Real ownership', d: 'A small team means you work directly with the client rather than hiding behind a ticket queue.' },
              { t: 'OEM certifications sponsored', d: 'Azure, Fortinet, VMware, Veeam — the company covers exam costs.' },
              { t: 'Rotation across practices', d: 'Moving from network into security or cloud is possible if that is where your interest lies.' },
              { t: 'Documented processes', d: 'ITIL-aligned — no guesswork, every task has a defined process.' },
              { t: 'Escalation support', d: 'You are never on your own — L2, L3 and OEM support are always available.' },
              { t: 'Delhi NCR base', d: 'Offices in Noida and New Ashok Nagar, with hybrid options on selected roles.' },
            ].map((x) => (
              <Reveal key={x.t}>
                <div className="h-full rounded-2xl border border-white/15 bg-white/[0.07] p-6 backdrop-blur-md transition-colors hover:bg-white/[0.12]">
                  <CheckCircleFilled className="text-lg text-brand-400" />
                  <h3 className="mt-2.5 font-display text-[16px] font-semibold text-white">{x.t}</h3>
                  <p className="mt-1.5 text-[0.97rem] leading-relaxed text-white/75">{x.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </PhotoSection>

      <section id="apply" className="px-container px-section">
        <div className="mx-auto max-w-2xl">
          <SectionHead eyebrow="Apply" title="Send us your resume" sub="Send it even if no role matches right now — we keep it in our talent database." center />
          <Reveal className="mt-8">
            {applied ? (
              <Result
                status="success" title="Application received"
                subTitle="We will review your profile and get in touch."
                extra={<Link to="/"><Button type="primary">Back to home</Button></Link>}
              />
            ) : (
              <div className="px-card">
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
                  <Button type="primary" size="large" htmlType="submit" block loading={saving}>Submit application</Button>
                </Form>
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
  const [sent, setSent] = useState(false);
  const [saving, setSaving] = useState(false);
  const [procForm] = Form.useForm();
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
        sub="Every document requested during enterprise vendor registration, in a single request."
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
            {sent ? (
              <Result status="success" title="Request received" subTitle="The pack will be emailed to you within one working day." />
            ) : (
              <>
                <h2 className="px-h3 mb-1 text-slate-900 dark:text-white">Request the pack</h2>
                <p className="px-body mb-5">We send it only to a verified business email address.</p>
                <Form
                  form={procForm} layout="vertical" requiredMark={false}
                  onFinish={async (v) => {
                    setSaving(true);
                    try {
                      await submitForm('procurement', v);
                      setSent(true);
                    } catch (err) {
                      showSubmitError(err, procForm);
                    } finally {
                      setSaving(false);
                    }
                  }}
                >
                  <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Name is required' }]}>
                    <Input size="large" />
                  </Form.Item>
                  <Form.Item name="company" label="Company" rules={[{ required: true, message: 'Company is required' }]}>
                    <Input size="large" />
                  </Form.Item>
                  <Form.Item name="email" label="Work email" rules={[{ required: true, type: 'email', message: 'Enter a valid email address' }]}>
                    <Input size="large" />
                  </Form.Item>
                  <Form.Item name="purpose" label="Purpose" initialValue="Vendor registration">
                    <Select
                      size="large"
                      options={['Vendor registration', 'Tender / RFP submission', 'Compliance audit', 'Other']
                        .map((v) => ({ value: v, label: v }))}
                    />
                  </Form.Item>
                  <Button type="primary" size="large" htmlType="submit" block icon={<DownloadOutlined />} loading={saving}>Request pack</Button>
                </Form>
              </>
            )}
          </div>
        </Reveal>
      </section>
      <CTABand />
    </>
  );
}
