import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Slider, InputNumber, Select, Radio, Progress, Tag, Statistic, Alert, Form, Input, message, Segmented } from 'antd';
import {
  CalculatorOutlined, SafetyOutlined, CloudOutlined, DatabaseOutlined,
  WifiOutlined, DollarOutlined, ArrowRightOutlined, CheckCircleFilled, MailOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { Reveal, Stagger, StaggerItem, SectionHead, IconBadge } from '../components/ui';
import { PageHero, CTABand } from '../components/blocks';

const inr = (n) => '₹' + Math.round(n).toLocaleString('en-IN');

/* =================== TOOLS HUB =================== */
export function ToolsHub() {
  const tools = [
    { to: '/tools/cloud-cost-calculator', icon: <CloudOutlined />, t: 'Cloud Cost Calculator', d: 'Enter VMs, storage and backup for an instant Azure or AWS monthly estimate.', live: true },
    { to: '/tools/security-health-score', icon: <SafetyOutlined />, t: 'IT Security Health Score', d: 'Ten questions, one score and a prioritised set of recommendations.', live: true },
    { to: '/tools/amc-plan-selector', icon: <CalculatorOutlined />, t: 'AMC Plan Selector', d: 'Endpoints, sites and coverage give you the right plan and an indicative price.', live: true },
    { to: '/tools/server-sizing', icon: <DatabaseOutlined />, t: 'Server Sizing Tool', d: 'Users and workload give you recommended CPU, RAM and storage.', live: true },
    { to: '/tools/wifi-estimator', icon: <WifiOutlined />, t: 'Wi-Fi AP Estimator', d: 'Floor area and user density give you the access point count.', live: true },
    { to: '/tools/tco-calculator', icon: <DollarOutlined />, t: 'Cloud vs On-prem TCO', d: 'A three-year total cost comparison, including the hidden costs on both sides.', live: true },
  ];
  return (
    <>
      <PageHero
        eyebrow="Tools" title="Calculators that give you real numbers"
        sub="Work out your own estimate before any sales call. No login, no email gate."
        crumbs={[{ label: 'Tools' }]}
      />
      <section className="px-container px-section">
        <Stagger className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {tools.map((t) => (
            <StaggerItem key={t.to}>
              <Link to={t.to} className="group block h-full">
                <div className="px-card px-card-hover flex h-full flex-col">
                  <IconBadge size="lg">{t.icon}</IconBadge>
                  <h2 className="mt-4 font-display text-[17px] font-semibold text-slate-900 group-hover:text-brand-600 dark:text-white dark:group-hover:text-brand-300">{t.t}</h2>
                  <p className="px-body mt-2 flex-1">{t.d}</p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-brand-600 dark:text-brand-300">
                    Open tool <ArrowRightOutlined className="text-[10px] transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      </section>
      <CTABand />
    </>
  );
}

/* Shared result-email capture */
function EmailResult({ label = 'Email me the result' }) {
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState('');
  const send = () => {
    if (!/^\S+@\S+\.\S+$/.test(email)) return message.error('Please enter a valid email address.');
    console.info('TOOL RESULT →', email);
    setSent(true);
    message.success('The detailed report has been sent to your email.');
  };
  if (sent) return <Alert type="success" showIcon message="Report sent — please check your inbox." className="!mt-5" />;
  return (
    <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.03]">
      <p className="font-mono text-[11px] uppercase tracking-wider text-slate-400">{label}</p>
      <div className="mt-2.5 flex gap-2">
        <Input placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} onPressEnter={send} prefix={<MailOutlined className="text-slate-400" />} />
        <Button type="primary" onClick={send}>Send</Button>
      </div>
    </div>
  );
}

/* =================== 1. CLOUD COST CALCULATOR =================== */
export function CloudCostCalculator() {
  const [vms, setVms] = useState(6);
  const [size, setSize] = useState('medium');
  const [storage, setStorage] = useState(2000);
  const [backup, setBackup] = useState(true);
  const [hours, setHours] = useState('always');
  const [provider, setProvider] = useState('Azure');

  // Indicative India-region rates (₹/month). A real quote depends on OEM pricing.
  const vmRate = { small: 2400, medium: 6200, large: 15800, xlarge: 32000 };
  const multiplier = { always: 1, business: 0.42, dev: 0.25 };
  const providerAdj = { Azure: 1, AWS: 1.04, GCP: 0.96 };

  const calc = useMemo(() => {
    const compute = vms * vmRate[size] * multiplier[hours] * providerAdj[provider];
    const disk = storage * 6.5;
    const bk = backup ? (storage * 3.2 + vms * 450) : 0;
    const network = compute * 0.09;
    const mgmt = (compute + disk + bk) * 0.14;
    const total = compute + disk + bk + network + mgmt;
    return { compute, disk, bk, network, mgmt, total };
  }, [vms, size, storage, backup, hours, provider]);

  const rows = [
    { k: 'Compute (VMs)', v: calc.compute },
    { k: 'Storage (managed disks)', v: calc.disk },
    { k: 'Backup & retention', v: calc.bk },
    { k: 'Network / egress', v: calc.network },
    { k: 'Managed services', v: calc.mgmt },
  ];

  return (
    <>
      <PageHero
        eyebrow="Tool" title="Cloud Cost Calculator"
        sub="Indicative monthly cloud spend, covering compute, storage, backup and management."
        crumbs={[{ label: 'Tools', to: '/tools' }, { label: 'Cloud Cost' }]}
      />
      <section className="px-container grid gap-8 px-section lg:grid-cols-[1fr_400px]">
        <Reveal className="px-card">
          <h2 className="px-h3 mb-6 text-slate-900 dark:text-white">Configure your workload</h2>

          <div className="mb-6">
            <label className="mb-2 block font-mono text-[11px] uppercase tracking-wider text-slate-400">Cloud provider</label>
            <Segmented block options={['Azure', 'AWS', 'GCP']} value={provider} onChange={setProvider} />
          </div>

          <div className="mb-6">
            <label className="mb-2 block font-mono text-[11px] uppercase tracking-wider text-slate-400">Virtual machines: {vms}</label>
            <Slider min={1} max={60} value={vms} onChange={setVms} />
          </div>

          <div className="mb-6">
            <label className="mb-2 block font-mono text-[11px] uppercase tracking-wider text-slate-400">Average VM size</label>
            <Select
              className="w-full" size="large" value={size} onChange={setSize}
              options={[
                { value: 'small', label: 'Small — 2 vCPU / 8 GB (file, print, AD)' },
                { value: 'medium', label: 'Medium — 4 vCPU / 16 GB (app, web)' },
                { value: 'large', label: 'Large — 8 vCPU / 32 GB (database, ERP)' },
                { value: 'xlarge', label: 'X-Large — 16 vCPU / 64 GB (heavy DB, analytics)' },
              ]}
            />
          </div>

          <div className="mb-6">
            <label className="mb-2 block font-mono text-[11px] uppercase tracking-wider text-slate-400">Total storage (GB)</label>
            <InputNumber className="!w-full" size="large" min={100} max={200000} step={100} value={storage} onChange={(v) => setStorage(v || 100)} />
          </div>

          <div className="mb-6">
            <label className="mb-2 block font-mono text-[11px] uppercase tracking-wider text-slate-400">Running hours</label>
            <Radio.Group value={hours} onChange={(e) => setHours(e.target.value)} optionType="button" buttonStyle="solid">
              <Radio.Button value="always">24×7</Radio.Button>
              <Radio.Button value="business">Business hours</Radio.Button>
              <Radio.Button value="dev">Dev / test only</Radio.Button>
            </Radio.Group>
          </div>

          <div>
            <label className="mb-2 block font-mono text-[11px] uppercase tracking-wider text-slate-400">Backup & DR included?</label>
            <Radio.Group value={backup} onChange={(e) => setBackup(e.target.value)} optionType="button" buttonStyle="solid">
              <Radio.Button value={true}>Yes</Radio.Button>
              <Radio.Button value={false}>No</Radio.Button>
            </Radio.Group>
          </div>
        </Reveal>

        <Reveal delay={0.1} className="lg:sticky lg:top-24 lg:h-fit">
          <div className="px-card">
            <p className="font-mono text-[11px] uppercase tracking-wider text-slate-400">Estimated monthly cost</p>
            <motion.p
              key={Math.round(calc.total)}
              initial={{ opacity: 0.4, y: -6 }} animate={{ opacity: 1, y: 0 }}
              className="mt-1 font-display text-4xl font-bold text-brand-600 dark:text-brand-300"
            >
              {inr(calc.total)}
            </motion.p>
            <p className="text-[13px] text-slate-500">{provider} · per month, indicative</p>

            <ul className="mt-6 space-y-2.5 border-t border-slate-100 pt-5 dark:border-white/10">
              {rows.map((r) => (
                <li key={r.k} className="flex items-center justify-between gap-3 text-[14px]">
                  <span className="text-slate-500 dark:text-slate-400">{r.k}</span>
                  <span className="font-mono font-medium tabular-nums text-slate-800 dark:text-slate-100">{inr(r.v)}</span>
                </li>
              ))}
              <li className="flex items-center justify-between gap-3 border-t border-slate-100 pt-3 text-[15px] font-semibold dark:border-white/10">
                <span>Annual</span>
                <span className="font-mono tabular-nums text-brand-600 dark:text-brand-300">{inr(calc.total * 12)}</span>
              </li>
            </ul>

            <Alert
              type="info" showIcon className="!mt-5"
              message="This is indicative"
              description="Actual pricing depends on region, reserved instances, licensing and OEM discounts. An exact quote follows the assessment."
            />
            <EmailResult label="Email me the detailed breakdown" />
            <Link to="/book-assessment" className="mt-4 block"><Button type="primary" block size="large">Get an exact quote</Button></Link>
          </div>
        </Reveal>
      </section>
      <CTABand />
    </>
  );
}

/* =================== 2. SECURITY HEALTH SCORE =================== */
const secQuestions = [
  { q: 'Do all endpoints run EDR or XDR, rather than traditional antivirus alone?', w: 12, fix: 'Deploy EDR with behavioural detection and ransomware rollback.', to: '/solutions/cyber-security/endpoint-security' },
  { q: 'Is an anti-phishing gateway in place with DMARC configured?', w: 11, fix: 'Add an email security gateway and enforce SPF, DKIM and DMARC.', to: '/solutions/cyber-security/email-security' },
  { q: 'Is there an immutable or air-gapped copy of your backups?', w: 13, fix: 'Create an immutable repository — ransomware targets backups too.', to: '/solutions/backup-dr/ransomware-recovery' },
  { q: 'Has a restore been tested in the last six months?', w: 11, fix: 'Schedule a quarterly test restore. An untested backup is an assumption.', to: '/solutions/backup-dr/veeam-backup' },
  { q: 'Is MFA mandatory on remote access?', w: 10, fix: 'Enforce MFA on VPN and cloud apps — it is the cheapest control available.', to: '/solutions/cyber-security/ssl-vpn' },
  { q: 'Have firewall rules been reviewed in the past year?', w: 8, fix: 'Run an annual firewall rule audit — old permissive rules are the biggest risk.', to: '/solutions/cyber-security/firewall-utm' },
  { q: 'Is there a defined patch management schedule?', w: 9, fix: 'Document a monthly patch cycle and an emergency patch process.', to: '/services/managed-it-services' },
  { q: 'Are admin accounts separated and least-privilege applied?', w: 9, fix: 'Separate privileged accounts and run a quarterly access review.', to: '/solutions/cyber-security/identity-access-management' },
  { q: 'Are logs collected centrally, in a SIEM or equivalent?', w: 9, fix: 'Enable central logging — without it you cannot determine an incident\u2019s scope.', to: '/solutions/cyber-security/xdr-siem-soc' },
  { q: 'Does a written incident response plan exist?', w: 8, fix: 'Build an IR playbook with roles, contacts and the first four steps written down.', to: '/services/security-audit-vapt' },
];

export function SecurityHealthScore() {
  const [ans, setAns] = useState({});
  const answered = Object.keys(ans).length;
  const score = useMemo(() => {
    const got = secQuestions.reduce((s, q, i) => s + (ans[i] === 'yes' ? q.w : ans[i] === 'partial' ? q.w * 0.5 : 0), 0);
    return Math.round(got);
  }, [ans]);

  const band = score >= 80 ? { t: 'Strong', c: '#12a06a', d: 'Your posture is solid. Focus should now shift to continuous validation and incident readiness.' }
    : score >= 55 ? { t: 'Moderate', c: '#c47a0a', d: 'The basics are in place but some critical gaps remain — these are the easiest routes in for an attacker.' }
    : { t: 'At risk', c: '#8f1d1d', d: 'Several critical controls are missing. Work through the priority order below.' };

  const gaps = secQuestions.filter((_, i) => ans[i] !== 'yes').sort((a, b) => b.w - a.w);

  return (
    <>
      <PageHero
        eyebrow="Tool" title="IT Security Health Score"
        sub="Ten questions, two minutes. One score and your gaps in priority order."
        crumbs={[{ label: 'Tools', to: '/tools' }, { label: 'Security Score' }]}
      />
      <section className="px-container grid gap-8 px-section lg:grid-cols-[1fr_360px]">
        <Reveal className="px-card">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="px-h3 text-slate-900 dark:text-white">Assessment</h2>
            <span className="font-mono text-[12px] text-slate-400">{answered} / {secQuestions.length}</span>
          </div>
          <ol className="space-y-5">
            {secQuestions.map((q, i) => (
              <li key={i} className="border-b border-slate-100 pb-5 last:border-0 dark:border-white/10">
                <p className="mb-3 flex gap-2.5 text-[15px] font-medium text-slate-800 dark:text-slate-100">
                  <span className="font-mono text-[13px] text-brand-500">{String(i + 1).padStart(2, '0')}</span>
                  {q.q}
                </p>
                <Radio.Group
                  value={ans[i]} onChange={(e) => setAns((a) => ({ ...a, [i]: e.target.value }))}
                  optionType="button" buttonStyle="solid" size="small"
                >
                  <Radio.Button value="yes">Yes</Radio.Button>
                  <Radio.Button value="partial">Partially</Radio.Button>
                  <Radio.Button value="no">No</Radio.Button>
                </Radio.Group>
              </li>
            ))}
          </ol>
        </Reveal>

        <Reveal delay={0.1} className="lg:sticky lg:top-24 lg:h-fit">
          <div className="px-card text-center">
            <p className="font-mono text-[11px] uppercase tracking-wider text-slate-400">Your score</p>
            <Progress
              type="dashboard" percent={score} strokeColor={band.c} size={170}
              format={(p) => (
                <span>
                  <span className="block font-display text-4xl font-bold" style={{ color: band.c }}>{p}</span>
                  <span className="font-mono text-[11px] uppercase tracking-wider text-slate-400">out of 100</span>
                </span>
              )}
            />
            <Tag color={score >= 80 ? 'green' : score >= 55 ? 'orange' : 'red'} className="!mt-3">{band.t}</Tag>
            <p className="px-body mt-3">{band.d}</p>
          </div>

          {answered > 0 && gaps.length > 0 && (
            <div className="px-card mt-4">
              <p className="font-mono text-[11px] uppercase tracking-wider text-slate-400">Priority fixes</p>
              <ul className="mt-3 space-y-3">
                {gaps.slice(0, 5).map((g) => (
                  <li key={g.q} className="border-b border-slate-100 pb-3 last:border-0 dark:border-white/10">
                    <p className="text-[13.5px] leading-relaxed text-slate-600 dark:text-slate-300">{g.fix}</p>
                    <Link to={g.to} className="mt-1 inline-block text-[12.5px] font-semibold text-brand-600 dark:text-brand-300">
                      View solution →
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="px-card mt-4">
            <EmailResult label="Email me the full report" />
            <Link to="/book-assessment" className="mt-4 block"><Button type="primary" block size="large">Discuss with an engineer</Button></Link>
          </div>
        </Reveal>
      </section>
      <CTABand />
    </>
  );
}

/* =================== 3. AMC PLAN SELECTOR =================== */
export function AMCPlanSelector() {
  const [endpoints, setEndpoints] = useState(60);
  const [sites, setSites] = useState(1);
  const [servers, setServers] = useState(3);
  const [coverage, setCoverage] = useState('24x5');
  const [critical, setCritical] = useState('medium');

  const result = useMemo(() => {
    let score = 0;
    if (endpoints > 100) score += 3; else if (endpoints > 25) score += 2; else score += 1;
    if (sites > 3) score += 2; else if (sites > 1) score += 1;
    if (servers > 8) score += 2; else if (servers > 2) score += 1;
    if (coverage === '24x7') score += 3; else if (coverage === '24x5') score += 1;
    if (critical === 'high') score += 3; else if (critical === 'medium') score += 1;

    const tier = score >= 10 ? 'Gold' : score >= 6 ? 'Silver' : 'Bronze';
    const base = { Bronze: 15000, Silver: 40000, Gold: 85000 }[tier];
    const perEndpoint = { Bronze: 380, Silver: 320, Gold: 260 }[tier];
    const extra = Math.max(0, endpoints - { Bronze: 25, Silver: 100, Gold: 200 }[tier]) * perEndpoint;
    const siteAdj = (sites - 1) * 6000;
    const serverAdj = servers * 1800;
    return { tier, score, price: base + extra + siteAdj + serverAdj };
  }, [endpoints, sites, servers, coverage, critical]);

  const tierInfo = {
    Bronze: { c: '#a16207', d: '9x6 coverage, 4-hour P1 response, remote-first support.' },
    Silver: { c: '#d62b1f', d: '24x5 coverage, 1-hour P1 response, two onsite visits a month, a named engineer.' },
    Gold: { c: '#12a06a', d: '24x7x365, 15-minute P1 response, a resident engineer, weekly reporting and a QBR.' },
  }[result.tier];

  return (
    <>
      <PageHero
        eyebrow="Tool" title="AMC Plan Selector"
        sub="Five inputs give you a recommended plan plus an indicative monthly price."
        crumbs={[{ label: 'Tools', to: '/tools' }, { label: 'AMC Selector' }]}
      />
      <section className="px-container grid gap-8 px-section lg:grid-cols-[1fr_380px]">
        <Reveal className="px-card">
          <h2 className="px-h3 mb-6 text-slate-900 dark:text-white">Your environment</h2>

          <div className="mb-6">
            <label className="mb-2 block font-mono text-[11px] uppercase tracking-wider text-slate-400">Endpoints (desktops and laptops): {endpoints}</label>
            <Slider min={5} max={500} value={endpoints} onChange={setEndpoints} />
          </div>
          <div className="mb-6">
            <label className="mb-2 block font-mono text-[11px] uppercase tracking-wider text-slate-400">Number of sites: {sites}</label>
            <Slider min={1} max={20} value={sites} onChange={setSites} />
          </div>
          <div className="mb-6">
            <label className="mb-2 block font-mono text-[11px] uppercase tracking-wider text-slate-400">Servers (physical + virtual): {servers}</label>
            <Slider min={0} max={40} value={servers} onChange={setServers} />
          </div>
          <div className="mb-6">
            <label className="mb-2 block font-mono text-[11px] uppercase tracking-wider text-slate-400">Coverage required</label>
            <Radio.Group value={coverage} onChange={(e) => setCoverage(e.target.value)} optionType="button" buttonStyle="solid">
              <Radio.Button value="9x6">9×6</Radio.Button>
              <Radio.Button value="24x5">24×5</Radio.Button>
              <Radio.Button value="24x7">24×7</Radio.Button>
            </Radio.Group>
          </div>
          <div>
            <label className="mb-2 block font-mono text-[11px] uppercase tracking-wider text-slate-400">How critical is downtime?</label>
            <Radio.Group value={critical} onChange={(e) => setCritical(e.target.value)} optionType="button" buttonStyle="solid">
              <Radio.Button value="low">Manageable</Radio.Button>
              <Radio.Button value="medium">Costly</Radio.Button>
              <Radio.Button value="high">Business-stopping</Radio.Button>
            </Radio.Group>
          </div>
        </Reveal>

        <Reveal delay={0.1} className="lg:sticky lg:top-24 lg:h-fit">
          <div className="px-card">
            <p className="font-mono text-[11px] uppercase tracking-wider text-slate-400">Recommended plan</p>
            <motion.h3
              key={result.tier}
              initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }}
              className="mt-1 font-display text-4xl font-bold" style={{ color: tierInfo.c }}
            >
              {result.tier}
            </motion.h3>
            <p className="px-body mt-2">{tierInfo.d}</p>

            <div className="mt-6 border-t border-slate-100 pt-5 dark:border-white/10">
              <p className="font-mono text-[11px] uppercase tracking-wider text-slate-400">Indicative monthly</p>
              <p className="mt-1 font-display text-3xl font-bold text-brand-600 dark:text-brand-300">{inr(result.price)}</p>
              <p className="mt-1 text-[13px] text-slate-500">{inr(result.price * 12)} annually · {endpoints} endpoints, {sites} site{sites > 1 ? 's' : ''}</p>
            </div>

            <ul className="mt-5 space-y-2 border-t border-slate-100 pt-5 text-[13.5px] dark:border-white/10">
              {['SLA-backed response times', 'Named account engineer', 'Monthly SLA & health report', 'Escalation matrix published'].map((f) => (
                <li key={f} className="flex gap-2.5 text-slate-600 dark:text-slate-300">
                  <CheckCircleFilled className="mt-0.5 text-brand-500" /> {f}
                </li>
              ))}
            </ul>

            <Alert type="info" showIcon className="!mt-5" message="Indicative estimate" description="The final quote is confirmed after scope, OEM licensing and site distances are known." />
            <EmailResult label="Email me the plan summary" />
            <Link to="/book-assessment" className="mt-4 block"><Button type="primary" block size="large">Get a formal quote</Button></Link>
            <Link to="/services/plans" className="mt-2 block"><Button block size="large">Compare all plans</Button></Link>
          </div>
        </Reveal>
      </section>
      <CTABand />
    </>
  );
}

/* =================== 4. SERVER SIZING =================== */
export function ServerSizing() {
  const [users, setUsers] = useState(100);
  const [workload, setWorkload] = useState('mixed');
  const [growth, setGrowth] = useState(20);

  const spec = useMemo(() => {
    const base = { light: 0.06, mixed: 0.12, heavy: 0.25 }[workload];
    const g = 1 + growth / 100;
    const vcpu = Math.ceil(users * base * g);
    const ram = Math.ceil(vcpu * 4);
    const storage = Math.ceil(users * { light: 15, mixed: 35, heavy: 80 }[workload] * g);
    const nodes = Math.max(2, Math.ceil(vcpu / 32));
    return { vcpu, ram, storage, nodes, iops: Math.ceil(users * { light: 8, mixed: 22, heavy: 55 }[workload]) };
  }, [users, workload, growth]);

  return (
    <>
      <PageHero
        eyebrow="Tool" title="Server Sizing Tool"
        sub="A recommended compute, memory and storage baseline derived from users and workload profile."
        crumbs={[{ label: 'Tools', to: '/tools' }, { label: 'Server Sizing' }]}
      />
      <section className="px-container grid gap-8 px-section lg:grid-cols-[1fr_360px]">
        <Reveal className="px-card">
          <h2 className="px-h3 mb-6 text-slate-900 dark:text-white">Workload profile</h2>
          <div className="mb-6">
            <label className="mb-2 block font-mono text-[11px] uppercase tracking-wider text-slate-400">Concurrent users: {users}</label>
            <Slider min={10} max={1000} step={10} value={users} onChange={setUsers} />
          </div>
          <div className="mb-6">
            <label className="mb-2 block font-mono text-[11px] uppercase tracking-wider text-slate-400">Workload type</label>
            <Select
              className="w-full" size="large" value={workload} onChange={setWorkload}
              options={[
                { value: 'light', label: 'Light — file, print, AD, basic apps' },
                { value: 'mixed', label: 'Mixed — ERP, email, app servers, VDI' },
                { value: 'heavy', label: 'Heavy — databases, analytics, CAD/BIM' },
              ]}
            />
          </div>
          <div>
            <label className="mb-2 block font-mono text-[11px] uppercase tracking-wider text-slate-400">3-year growth headroom: {growth}%</label>
            <Slider min={0} max={100} step={5} value={growth} onChange={setGrowth} />
          </div>
        </Reveal>

        <Reveal delay={0.1} className="lg:sticky lg:top-24 lg:h-fit">
          <div className="px-card">
            <p className="font-mono text-[11px] uppercase tracking-wider text-slate-400">Recommended baseline</p>
            <div className="mt-4 grid grid-cols-2 gap-4">
              {[
                { k: 'vCPU total', v: spec.vcpu },
                { k: 'RAM (GB)', v: spec.ram },
                { k: 'Usable storage (GB)', v: spec.storage },
                { k: 'Cluster nodes', v: spec.nodes },
                { k: 'Est. IOPS', v: spec.iops },
              ].map((x) => (
                <div key={x.k}>
                  <p className="font-display text-2xl font-bold text-brand-600 dark:text-brand-300 tabular-nums">{x.v}</p>
                  <p className="text-[12.5px] text-slate-500 dark:text-slate-400">{x.k}</p>
                </div>
              ))}
            </div>
            <Alert
              type="info" showIcon className="!mt-5" message="A baseline, not a final design"
              description="Actual sizing depends on application vendor requirements, HA and N+1 policy, and the backup window."
            />
            <Link to="/book-assessment" className="mt-4 block"><Button type="primary" block size="large">Validate this sizing</Button></Link>
          </div>
        </Reveal>
      </section>
      <CTABand />
    </>
  );
}

/* =================== 5. WI-FI ESTIMATOR =================== */
export function WifiEstimator() {
  const [area, setArea] = useState(8000);
  const [users, setUsers] = useState(120);
  const [density, setDensity] = useState('office');
  const [walls, setWalls] = useState('medium');

  const res = useMemo(() => {
    const coveragePerAP = { office: 1800, classroom: 1100, warehouse: 2800, auditorium: 900 }[density];
    const wallAdj = { light: 1.15, medium: 1, heavy: 0.78 }[walls];
    const byArea = Math.ceil(area / (coveragePerAP * wallAdj));
    const usersPerAP = { office: 30, classroom: 25, warehouse: 40, auditorium: 45 }[density];
    const byUsers = Math.ceil(users / usersPerAP);
    const aps = Math.max(byArea, byUsers, 1);
    return { aps, byArea, byUsers, switches: Math.ceil(aps / 24), poe: aps * 15 };
  }, [area, users, density, walls]);

  return (
    <>
      <PageHero
        eyebrow="Tool" title="Wi-Fi AP Estimator"
        sub="An access point count derived from both coverage and capacity."
        crumbs={[{ label: 'Tools', to: '/tools' }, { label: 'Wi-Fi Estimator' }]}
      />
      <section className="px-container grid gap-8 px-section lg:grid-cols-[1fr_360px]">
        <Reveal className="px-card">
          <h2 className="px-h3 mb-6 text-slate-900 dark:text-white">Site details</h2>
          <div className="mb-6">
            <label className="mb-2 block font-mono text-[11px] uppercase tracking-wider text-slate-400">Total area (sq ft)</label>
            <InputNumber className="!w-full" size="large" min={500} max={500000} step={500} value={area} onChange={(v) => setArea(v || 500)} />
          </div>
          <div className="mb-6">
            <label className="mb-2 block font-mono text-[11px] uppercase tracking-wider text-slate-400">Concurrent devices: {users}</label>
            <Slider min={10} max={2000} step={10} value={users} onChange={setUsers} />
          </div>
          <div className="mb-6">
            <label className="mb-2 block font-mono text-[11px] uppercase tracking-wider text-slate-400">Environment type</label>
            <Select
              className="w-full" size="large" value={density} onChange={setDensity}
              options={[
                { value: 'office', label: 'Corporate office' },
                { value: 'classroom', label: 'Classroom / high density' },
                { value: 'warehouse', label: 'Warehouse / open floor' },
                { value: 'auditorium', label: 'Auditorium / cafeteria' },
              ]}
            />
          </div>
          <div>
            <label className="mb-2 block font-mono text-[11px] uppercase tracking-wider text-slate-400">Wall construction</label>
            <Radio.Group value={walls} onChange={(e) => setWalls(e.target.value)} optionType="button" buttonStyle="solid">
              <Radio.Button value="light">Glass / partition</Radio.Button>
              <Radio.Button value="medium">Brick</Radio.Button>
              <Radio.Button value="heavy">Concrete / metal</Radio.Button>
            </Radio.Group>
          </div>
        </Reveal>

        <Reveal delay={0.1} className="lg:sticky lg:top-24 lg:h-fit">
          <div className="px-card">
            <p className="font-mono text-[11px] uppercase tracking-wider text-slate-400">Estimated requirement</p>
            <p className="mt-1 font-display text-4xl font-bold text-brand-600 dark:text-brand-300">{res.aps} <span className="text-lg font-semibold">access points</span></p>
            <ul className="mt-5 space-y-2.5 border-t border-slate-100 pt-5 text-[14px] dark:border-white/10">
              {[
                ['Driven by coverage', `${res.byArea} APs`],
                ['Driven by capacity', `${res.byUsers} APs`],
                ['PoE switches (24-port)', `${res.switches}`],
                ['Approx PoE budget', `${res.poe} W`],
              ].map(([k, v]) => (
                <li key={k} className="flex justify-between gap-3">
                  <span className="text-slate-500 dark:text-slate-400">{k}</span>
                  <span className="font-medium tabular-nums text-slate-800 dark:text-slate-100">{v}</span>
                </li>
              ))}
            </ul>
            <Alert
              type="warning" showIcon className="!mt-5" message="This does not replace a survey"
              description="This is a planning estimate. Final AP count and placement are confirmed only after a predictive RF survey."
            />
            <Link to="/solutions/network/enterprise-wifi" className="mt-4 block"><Button type="primary" block size="large">Book a Wi-Fi survey</Button></Link>
          </div>
        </Reveal>
      </section>
      <CTABand />
    </>
  );
}

/* =================== 6. TCO CALCULATOR =================== */
export function TCOCalculator() {
  const [servers, setServers] = useState(6);
  const [storage, setStorage] = useState(20);
  const [admins, setAdmins] = useState(1);

  const calc = useMemo(() => {
    // On-prem (3-year)
    const hw = servers * 420000 + storage * 42000;
    const licences = servers * 95000;
    const powerCooling = servers * 3200 * 36;
    const rackUps = 180000;
    const warranty = hw * 0.12 * 3;
    const adminTime = admins * 55000 * 36 * 0.35;
    const onprem = hw + licences + powerCooling + rackUps + warranty + adminTime;

    // Cloud (3-year)
    const compute = servers * 7400 * 36;
    const cloudStorage = storage * 1000 * 6.5 * 36;
    const egress = compute * 0.08;
    const cloudBackup = storage * 1000 * 3.2 * 36;
    const mgmt = (compute + cloudStorage) * 0.14;
    const cloud = compute + cloudStorage + egress + cloudBackup + mgmt;

    return { onprem, cloud, diff: onprem - cloud };
  }, [servers, storage, admins]);

  const winner = calc.diff > 0 ? 'Cloud' : 'On-premise';

  return (
    <>
      <PageHero
        eyebrow="Tool" title="Cloud vs On-premise TCO"
        sub="Three-year total cost, including the costs people usually forget on both sides."
        crumbs={[{ label: 'Tools', to: '/tools' }, { label: 'TCO Calculator' }]}
      />
      <section className="px-container grid gap-8 px-section lg:grid-cols-[1fr_400px]">
        <Reveal className="px-card">
          <h2 className="px-h3 mb-6 text-slate-900 dark:text-white">Your environment</h2>
          <div className="mb-6">
            <label className="mb-2 block font-mono text-[11px] uppercase tracking-wider text-slate-400">Servers / VMs: {servers}</label>
            <Slider min={1} max={50} value={servers} onChange={setServers} />
          </div>
          <div className="mb-6">
            <label className="mb-2 block font-mono text-[11px] uppercase tracking-wider text-slate-400">Storage (TB): {storage}</label>
            <Slider min={1} max={200} value={storage} onChange={setStorage} />
          </div>
          <div>
            <label className="mb-2 block font-mono text-[11px] uppercase tracking-wider text-slate-400">IT admins managing this: {admins}</label>
            <Slider min={0} max={8} value={admins} onChange={setAdmins} />
          </div>

          <div className="mt-8 rounded-xl bg-slate-50 p-5 dark:bg-white/[0.03]">
            <p className="font-mono text-[11px] uppercase tracking-wider text-slate-400">What gets counted</p>
            <div className="mt-3 grid gap-4 sm:grid-cols-2 text-[13.5px]">
              <div>
                <p className="font-semibold text-slate-700 dark:text-slate-200">On-premise</p>
                <p className="px-body mt-1">Hardware, OS and hypervisor licences, power and cooling, rack and UPS, warranty renewal, admin time.</p>
              </div>
              <div>
                <p className="font-semibold text-slate-700 dark:text-slate-200">Cloud</p>
                <p className="px-body mt-1">Compute, storage, egress bandwidth, backup retention and management overhead.</p>
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.1} className="lg:sticky lg:top-24 lg:h-fit">
          <div className="px-card">
            <p className="font-mono text-[11px] uppercase tracking-wider text-slate-400">3-year total cost</p>
            <div className="mt-4 space-y-4">
              {[
                { k: 'On-premise', v: calc.onprem, c: '#d18700' },
                { k: 'Cloud', v: calc.cloud, c: '#d62b1f' },
              ].map((x) => {
                const max = Math.max(calc.onprem, calc.cloud);
                return (
                  <div key={x.k}>
                    <div className="mb-1.5 flex items-baseline justify-between">
                      <span className="text-[14px] font-medium text-slate-700 dark:text-slate-200">{x.k}</span>
                      <span className="font-mono text-[15px] font-semibold tabular-nums" style={{ color: x.c }}>{inr(x.v)}</span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                      <motion.div
                        className="h-full rounded-full" style={{ background: x.c }}
                        initial={{ width: 0 }} animate={{ width: `${(x.v / max) * 100}%` }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 rounded-xl bg-slate-50 p-4 text-center dark:bg-white/[0.03]">
              <p className="font-mono text-[11px] uppercase tracking-wider text-slate-400">Lower 3-year cost</p>
              <p className="mt-1 font-display text-xl font-bold text-slate-900 dark:text-white">{winner}</p>
              <p className="mt-0.5 text-[13.5px] text-slate-500">
                A difference of {inr(Math.abs(calc.diff))}
              </p>
            </div>

            <Alert
              type="info" showIcon className="!mt-5" message="Cost is not the only factor"
              description="Data residency, validated environments, latency and capex availability also shape the decision. Hybrid is often the most practical answer."
            />
            <Link to="/book-assessment" className="mt-4 block"><Button type="primary" block size="large">Discuss your workloads</Button></Link>
          </div>
        </Reveal>
      </section>
      <CTABand />
    </>
  );
}
