import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Drawer, Descriptions, Select, Button, Input, Popconfirm, Empty, Tooltip, message } from 'antd';
import {
  MailOutlined, PhoneOutlined, WhatsAppOutlined, DeleteOutlined, FileTextOutlined, DownloadOutlined,
  EyeInvisibleOutlined, RobotOutlined, UserOutlined, CustomerServiceOutlined, SendOutlined,
} from '@ant-design/icons';
import { updateRecord, removeRecords, addNote, replyToChat, downloadResume } from '../api/store';
import { StatusDot } from './StatusTag';
import { fmtDateTime, timeAgo } from '../utils';

const fail = (err) => message.error(err?.message || 'Action failed');

function FieldValue({ type, value, record }) {
  const [busy, setBusy] = useState(false);
  if (type === 'file') {
    if (!value?.filename) return <span className="text-slate-400">—</span>;
    const kb = value.size ? ` · ${Math.max(1, Math.round(value.size / 1024))} KB` : '';
    return (
      <span className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5"><FileTextOutlined className="text-brand-500" />{value.filename}<span className="text-slate-400">{kb}</span></span>
        {value.fileId && (
          <Button
            size="small" icon={<DownloadOutlined />} loading={busy}
            onClick={() => { setBusy(true); downloadResume(record.id, value.filename).catch(fail).finally(() => setBusy(false)); }}
          >
            Download
          </Button>
        )}
      </span>
    );
  }
  if (value == null || value === '') return <span className="text-slate-400">—</span>;
  if (type === 'email') return <a href={`mailto:${value}`} className="text-brand-600 dark:text-brand-300">{value}</a>;
  if (type === 'phone') return <a href={`tel:${value}`} className="text-brand-600 dark:text-brand-300">{value}</a>;
  if (type === 'long') return <span className="whitespace-pre-wrap">{value}</span>;
  return <span>{String(value)}</span>;
}

const who = {
  me: { icon: <UserOutlined />, label: 'Visitor' },
  bot: { icon: <RobotOutlined />, label: 'Assistant' },
  agent: { icon: <CustomerServiceOutlined />, label: 'Team' },
};

function Conversation({ record }) {
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const send = async () => {
    if (!text.trim()) return;
    setBusy(true);
    try {
      await replyToChat(record.id, text.trim());
      setText('');
    } catch (err) {
      fail(err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div className="space-y-2.5 rounded-xl bg-slate-50 p-3 dark:bg-white/[0.03]">
        {(record.messages || []).map((m, i) => {
          const mine = m.from === 'me';
          return (
            <div key={i} className={`flex items-end gap-2 ${mine ? 'justify-end' : ''}`}>
              {!mine && <span title={who[m.from]?.label} className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-50 text-[12px] text-brand-500 dark:bg-white/10">{who[m.from]?.icon}</span>}
              <div className={`max-w-[80%] rounded-2xl px-3 py-1.5 text-[12.5px] leading-relaxed ${
                mine ? 'rounded-br-sm bg-brand-500 text-white'
                  : m.from === 'agent' ? 'rounded-bl-sm border border-emerald-200 bg-emerald-50 text-slate-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-slate-200'
                    : 'rounded-bl-sm border border-slate-200 bg-white text-slate-700 dark:border-white/10 dark:bg-ink-800 dark:text-slate-200'
              }`}>
                {m.text}
                <span className={`mt-1 block text-[10.5px] ${mine ? 'text-white/70' : 'text-slate-400'}`}>
                  {who[m.from]?.label} · {new Date(m.at).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })}
                </span>
              </div>
              {mine && <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-slate-200 text-[12px] text-slate-500 dark:bg-white/10"><UserOutlined /></span>}
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex gap-2">
        <Input
          value={text} onChange={(e) => setText(e.target.value)} onPressEnter={send}
          placeholder="Add a team reply to this conversation…" maxLength={2000}
        />
        <Button type="primary" icon={<SendOutlined />} loading={busy} onClick={send} disabled={!text.trim()} aria-label="Send reply" />
      </div>
      <p className="m-0 mt-1 text-[11px] text-slate-400">Saved to the conversation log for your team.</p>
    </div>
  );
}

export default function RecordDrawer({ col, cfg, record, onClose }) {
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const open = !!record;
  const r = record || {};
  const phone = r.phone?.replace(/\D/g, '');

  const saveNote = async () => {
    if (!note.trim()) return;
    setSaving(true);
    try {
      await addNote(col, r.id, note.trim());
      setNote('');
      message.success('Note added');
    } catch (err) {
      fail(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Drawer
      open={open} onClose={onClose} width={500} destroyOnClose rootClassName="px-admin-drawer"
      styles={{ header: { padding: '12px 20px' } }}
      title={open && (
        <div className="min-w-0">
          <p className="m-0 truncate text-[14px] font-semibold">{cfg.primary(r)}</p>
          <p className="m-0 font-mono text-[10.5px] font-normal text-slate-400">{r.code} · {fmtDateTime(r.createdAt)}</p>
        </div>
      )}
      extra={open && (
        <Popconfirm
          title={`Delete this ${cfg.singular}?`} okText="Delete" okButtonProps={{ danger: true }}
          onConfirm={() => removeRecords(col, r.id).then(() => { message.success('Deleted'); onClose(); }, fail)}
        >
          <Button danger type="text" icon={<DeleteOutlined />} aria-label="Delete" />
        </Popconfirm>
      )}
    >
      {open && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={r.status} style={{ minWidth: 140 }}
              onChange={(s) => updateRecord(col, r.id, { status: s }).then(() => message.success(`Status: ${s}`), fail)}
              options={Object.entries(cfg.statuses).map(([s, c]) => ({ value: s, label: <StatusDot color={c} text={s} /> }))}
            />
            <Tooltip title="Mark as unread">
              <Button icon={<EyeInvisibleOutlined />} onClick={() => { onClose(); updateRecord(col, r.id, { read: false }).catch(fail); }} />
            </Tooltip>
            <div className="ms-auto flex gap-2">
              {r.email && <a href={`mailto:${r.email}`}><Button icon={<MailOutlined />}>Email</Button></a>}
              {phone && <a href={`tel:${phone}`}><Button icon={<PhoneOutlined />}>Call</Button></a>}
              {phone && (
                <a href={`https://wa.me/91${phone.slice(-10)}`} target="_blank" rel="noreferrer">
                  <Button icon={<WhatsAppOutlined />} aria-label="WhatsApp" />
                </a>
              )}
            </div>
          </div>

          {cfg.chat ? (
            <Conversation record={r} />
          ) : (
            <Descriptions
              bordered size="small" column={1} labelStyle={{ width: 120 }}
              items={cfg.fields.map(([k, label, type]) => ({ key: k, label, children: <FieldValue type={type} value={r[k]} record={r} /> }))}
            />
          )}

          <Descriptions
            size="small" column={1} labelStyle={{ width: 120 }}
            items={[
              { key: 'src', label: 'Submitted from', children: r.source ? <Link to={r.source} target="_blank" className="font-mono text-[12px] text-brand-600">{r.source}</Link> : '—' },
              { key: 'at', label: 'Received', children: `${fmtDateTime(r.createdAt)} (${timeAgo(r.createdAt)})` },
            ]}
          />

          <div>
            <p className="m-0 mb-2 text-[12px] font-semibold text-slate-600 dark:text-slate-300">Internal notes</p>
            {r.notes?.length ? (
              <ul className="m-0 mb-3 list-none space-y-2 p-0">
                {r.notes.map((n, i) => (
                  <li key={i} className="rounded-lg border border-slate-200 bg-amber-50/50 px-3 py-2 dark:border-white/10 dark:bg-white/[0.03]">
                    <p className="m-0 whitespace-pre-wrap text-[12.5px] text-slate-700 dark:text-slate-200">{n.text}</p>
                    <p className="m-0 mt-1 text-[11px] text-slate-400">{n.by} · {timeAgo(n.at)}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No notes yet" className="!my-2" />
            )}
            <Input.TextArea
              rows={2} value={note} onChange={(e) => setNote(e.target.value)} maxLength={2000}
              placeholder="Add a note — call outcome, next step, quote sent…"
              onPressEnter={(e) => { if (e.ctrlKey || e.metaKey) saveNote(); }}
            />
            <div className="mt-2 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">Ctrl + Enter to save</span>
              <Button type="primary" size="small" onClick={saveNote} loading={saving} disabled={!note.trim()}>Add note</Button>
            </div>
          </div>
        </div>
      )}
    </Drawer>
  );
}
