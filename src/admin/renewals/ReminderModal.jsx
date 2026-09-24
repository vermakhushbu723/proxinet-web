// Daily renewal reminder: pops up once per day (per browser) while any plan is within the reminder window.
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Modal, Tag } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import { fmtYmd, daysText, ContactButtons } from './shared';

const KEY = 'px-renewal-reminder-seen';
const seenOn = () => { try { return localStorage.getItem(KEY); } catch { return null; } };
const markSeen = (day) => { try { localStorage.setItem(KEY, day); } catch { /* private mode */ } };

export default function RenewalReminderModal({ data }) {
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const items = data?.items || [];

  useEffect(() => {
    if (items.length && data.today && seenOn() !== data.today) setOpen(true);
  }, [data?.today, items.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const close = () => { markSeen(data.today); setOpen(false); };

  return (
    <Modal
      open={open} onCancel={close} width={640}
      title={<span className="flex items-center gap-2"><BellOutlined className="text-orange-500" /> Renewal reminder — {items.length} customer{items.length === 1 ? '' : 's'} to contact</span>}
      footer={[
        <Button key="later" onClick={close}>Remind me tomorrow</Button>,
        <Button key="open" type="primary" onClick={() => { close(); nav('/admin/renewals?view=due'); }}>Open renewals</Button>,
      ]}
    >
      <p className="mt-0 text-[13px] text-slate-500">
        These plans end within {data?.remindDays || 5} days (or have already expired without renewal). Contact the customers today.
      </p>
      <ul className="m-0 max-h-[50vh] list-none space-y-2 overflow-y-auto p-0">
        {items.map((r) => (
          <li key={r.id} className="flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-lg border border-slate-200 px-3 py-2 dark:border-white/10">
            <button
              type="button" onClick={() => { close(); nav(`/admin/renewals?view=due&id=${r.id}`); }}
              className="min-w-0 flex-1 cursor-pointer border-0 bg-transparent p-0 text-left"
            >
              <span className="block truncate text-[13px] font-semibold text-slate-900 dark:text-white">{r.customer}</span>
              <span className="block truncate text-[12px] text-slate-500">{r.description}{r.qty > 1 ? ` × ${r.qty}` : ''} · ends {fmtYmd(r.endDate)}</span>
            </button>
            <Tag color={r.daysLeft < 0 ? 'red' : 'volcano'} className="!m-0">{daysText(r.daysLeft)}</Tag>
            <ContactButtons r={r} />
          </li>
        ))}
      </ul>
    </Modal>
  );
}
