import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Tooltip, Button, Drawer, Input, message } from 'antd';
import {
  WhatsAppOutlined, PhoneOutlined, MessageOutlined, UpOutlined,
  CloseOutlined, SendOutlined, RobotOutlined,
} from '@ant-design/icons';
import { AnimatePresence, motion } from 'framer-motion';
import { company } from '../data/company';
import { startChat, sendChatMessage } from '../api/public';

/* ---------------- AI-style assistant (scripted demo) ---------------- */
const quickReplies = [
  'What does a server AMC cost?',
  'We need ransomware protection',
  'We want to migrate to Azure',
  'I need to raise a ticket',
];

const answer = (q) => {
  const s = q.toLowerCase();
  if (s.includes('amc') || s.includes('price') || s.includes('cost'))
    return { text: 'AMC comes in three tiers — Bronze at ₹15,000/mo (up to 25 endpoints), Silver at ₹40,000/mo (up to 100), and Gold on a custom quote. The exact figure follows an assessment.', cta: { label: 'Compare plans', to: '/services/plans' } };
  if (s.includes('ransom') || s.includes('security') || s.includes('virus'))
    return { text: 'Ransomware needs three layers — EDR on the endpoint, an email security gateway, and immutable backup. You can score your current setup in two minutes.', cta: { label: 'Security Health Score', to: '/tools/security-health-score' } };
  if (s.includes('azure') || s.includes('cloud') || s.includes('migrat'))
    return { text: 'We migrate in waves — dependency mapping, a pilot, then the bulk move, always with a rollback plan. You can estimate the monthly cost up front.', cta: { label: 'Cloud Cost Calculator', to: '/tools/cloud-cost-calculator' } };
  if (s.includes('ticket') || s.includes('support') || s.includes('issue'))
    return { text: 'If you are an existing client, raise it in the portal — the SLA timer starts immediately. If you are new, the contact form is the best route.', cta: { label: 'Client Portal', to: '/portal/login' } };
  if (s.includes('backup') || s.includes('veeam') || s.includes('restore'))
    return { text: 'We follow the 3-2-1-1-0 rule — one immutable copy and zero errors on a verified restore. Veeam SureBackup verifies every backup automatically.', cta: { label: 'Backup & DR', to: '/solutions/backup-dr' } };
  if (s.includes('wifi') || s.includes('wi-fi') || s.includes('network'))
    return { text: 'For Wi-Fi we start with a predictive survey, then AP placement, and after install a heatmap validation report proves the design was delivered.', cta: { label: 'Enterprise Wi-Fi', to: '/solutions/network/enterprise-wifi' } };
  return { text: 'This is best discussed with an engineer. Book a free 30-minute assessment — no obligation, and you get a written summary.', cta: { label: 'Book assessment', to: '/book-assessment' } };
};

function Assistant({ open, onClose }) {
  const [msgs, setMsgs] = useState([
    { from: 'bot', text: 'Hello! I am the ProXinet assistant. What are you looking for?' },
  ]);
  const [val, setVal] = useState('');
  const boxRef = React.useRef(null);
  const chatIdRef = React.useRef(null);
  // Saves messages in order without blocking the conversation UI
  const queueRef = React.useRef(Promise.resolve());
  const save = (from, text) => {
    queueRef.current = queueRef.current
      .then(async () => {
        if (!chatIdRef.current) chatIdRef.current = (await startChat(text)).id;
        else await sendChatMessage(chatIdRef.current, from, text);
      })
      .catch(() => { /* chat keeps working even if logging fails */ });
  };

  useEffect(() => {
    boxRef.current?.scrollTo({ top: boxRef.current.scrollHeight, behavior: 'smooth' });
  }, [msgs, open]);

  const send = (text) => {
    const t = (text ?? val).trim();
    if (!t) return;
    save('me', t);
    setMsgs((m) => [...m, { from: 'me', text: t }]);
    setVal('');
    setTimeout(() => {
      const reply = answer(t);
      save('bot', reply.text);
      setMsgs((m) => [...m, { from: 'bot', ...reply }]);
    }, 420);
  };

  return (
    <Drawer
      open={open} onClose={onClose} placement="right" width={380} closeIcon={null}
      styles={{ header: { display: 'none' }, body: { display: 'flex', flexDirection: 'column', padding: 0 } }}
    >
      <div className="flex items-center justify-between border-b border-slate-200 bg-brand-500 p-4 text-white dark:border-white/10">
        <span className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-white/20"><RobotOutlined /></span>
          <span>
            <span className="block font-display font-semibold leading-tight">ProXinet Assistant</span>
            <span className="text-[11.5px] text-white/80">Usually replies instantly</span>
          </span>
        </span>
        <Button type="text" shape="circle" icon={<CloseOutlined className="text-white" />} onClick={onClose} aria-label="Close assistant" />
      </div>

      <div ref={boxRef} className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-4 dark:bg-ink-900">
        {msgs.map((m, i) => (
          <div key={i} className={`flex ${m.from === 'me' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[14px] leading-relaxed ${
              m.from === 'me'
                ? 'rounded-br-sm bg-brand-500 text-white'
                : 'rounded-bl-sm border border-slate-200 bg-white text-slate-700 dark:border-white/10 dark:bg-ink-800 dark:text-slate-200'
            }`}>
              {m.text}
              {m.cta && (
                <Link to={m.cta.to} onClick={onClose} className="mt-2 block text-[13px] font-semibold text-brand-600 underline dark:text-brand-300">
                  {m.cta.label} →
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-slate-200 p-3 dark:border-white/10">
        <div className="mb-2 flex flex-wrap gap-1.5">
          {quickReplies.map((q) => (
            <button
              key={q} onClick={() => send(q)}
              className="rounded-full border border-slate-200 px-2.5 py-1 text-[12px] text-slate-600 transition-colors hover:border-brand-400 hover:text-brand-600 dark:border-white/15 dark:text-slate-300"
            >
              {q}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Type your question…" value={val}
            onChange={(e) => setVal(e.target.value)} onPressEnter={() => send()}
            aria-label="Message"
          />
          <Button type="primary" icon={<SendOutlined />} onClick={() => send()} aria-label="Send" />
        </div>
        <p className="mt-2 text-center text-[11px] text-slate-400">
          Demo assistant. In a real deployment this connects to the CRM and knowledge base.
        </p>
      </div>
    </Drawer>
  );
}

/* ---------------- Floating action cluster ---------------- */
export default function FloatingActions() {
  const [showTop, setShowTop] = useState(false);
  const [chat, setChat] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 700);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const wa = `https://wa.me/${company.whatsapp}?text=${encodeURIComponent(
    'Hi ProXinet, I would like to talk about IT infrastructure.'
  )}`;

  return (
    <>
      {/* desktop / tablet right rail */}
      <div className="fixed bottom-6 right-5 z-40 hidden flex-col items-end gap-2.5 sm:flex">
        <AnimatePresence>
          {showTop && (
            <motion.button
              initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.7 }}
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              aria-label="Back to top"
              className="grid h-11 w-11 place-items-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-soft transition-colors hover:text-brand-600 dark:border-white/10 dark:bg-ink-800 dark:text-slate-300"
            >
              <UpOutlined />
            </motion.button>
          )}
        </AnimatePresence>

        <Tooltip title="Chat with assistant" placement="left">
          <button
            onClick={() => setChat(true)} aria-label="Open chat assistant"
            className="grid h-[52px] w-[52px] place-items-center rounded-full bg-brand-500 text-xl text-white shadow-glow transition-transform hover:scale-105"
          >
            <MessageOutlined />
          </button>
        </Tooltip>

        <Tooltip title="WhatsApp" placement="left">
          <a
            href={wa} target="_blank" rel="noreferrer" aria-label="Chat on WhatsApp"
            className="relative grid h-[52px] w-[52px] place-items-center rounded-full bg-[#25D366] text-xl text-white shadow-lift transition-transform hover:scale-105"
          >
            <span className="absolute inset-0 animate-ping rounded-full bg-[#25D366] opacity-25" aria-hidden="true" />
            <WhatsAppOutlined className="relative" />
          </a>
        </Tooltip>
      </div>

      {/* mobile sticky bottom bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-3 border-t border-slate-200 bg-white/95 backdrop-blur-md sm:hidden dark:border-white/10 dark:bg-ink-900/95">
        <a href={`tel:${company.phones[0]}`} className="flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium text-slate-600 dark:text-slate-300">
          <PhoneOutlined className="text-base text-brand-500" /> Call
        </a>
        <a href={wa} target="_blank" rel="noreferrer" className="flex flex-col items-center gap-0.5 border-x border-slate-200 py-2.5 text-[11px] font-medium text-slate-600 dark:border-white/10 dark:text-slate-300">
          <WhatsAppOutlined className="text-base text-[#25D366]" /> WhatsApp
        </a>
        <Link to="/book-assessment" className="flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium text-slate-600 dark:text-slate-300">
          <MessageOutlined className="text-base text-brand-500" /> Enquire
        </Link>
      </div>

      <Assistant open={chat} onClose={() => setChat(false)} />
    </>
  );
}
