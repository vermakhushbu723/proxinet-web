// Customer renewals: every product/subscription sold, its term, and the renewal follow-up.
import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Alert, Button, Checkbox, DatePicker, Descriptions, Drawer, Dropdown, Empty, Form, Input, InputNumber, Modal,
  Segmented, Select, Switch, Table, Tag, Tooltip, Upload, message,
} from 'antd';
import {
  PlusOutlined, ReloadOutlined, UploadOutlined, DownloadOutlined, EditOutlined, DeleteOutlined, SyncOutlined,
  MoreOutlined, BellOutlined, SendOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import {
  useApi, listRenewals, getRenewalReminders, runRemindersNow, createRenewal, importRenewals, updateRenewal,
  addRenewalNote, renewRenewal, deleteRenewal, listTeam,
} from '../api/store';
import Panel, { PageHeader, cardCls } from '../components/Panel';
import StatusTag from '../components/StatusTag';
import { fmtDateTime } from '../utils';
import {
  STATUS_COLORS, isOpen, fmtYmd, daysText, DaysTag, fmtPrice, parseCsv, rowsToRenewals, ContactButtons,
} from '../renewals/shared';

const fail = (err) => message.error(err?.message || 'Action failed');
const STATUSES = Object.keys(STATUS_COLORS);

/* ---------------- add / edit / renew form ---------------- */
const toForm = (r) => ({
  ...r,
  startDate: r.startDate ? dayjs(r.startDate) : null,
  endDate: r.endDate ? dayjs(r.endDate) : null,
  reminder: { mode: r.reminder?.mode || 'default', days: r.reminder?.days || [], dates: (r.reminder?.dates || []).map((d) => dayjs(d)) },
  notify: r.notify || [],
});
const fromForm = (v) => ({
  ...v,
  startDate: v.startDate ? v.startDate.format('YYYY-MM-DD') : '',
  endDate: v.endDate ? v.endDate.format('YYYY-MM-DD') : '',
  salePrice: v.salePrice ?? null,
  purchasePrice: v.purchasePrice ?? null,
  ...(v.reminder ? {
    reminder: {
      mode: v.reminder.mode || 'default',
      days: (v.reminder.days || []).map(Number).filter((n) => Number.isInteger(n) && n >= 0),
      dates: (v.reminder.dates || []).map((d) => d.format('YYYY-MM-DD')),
    },
  } : {}),
});

/** Team members as Select options (for "who gets this renewal's reminders"). */
export function useTeamOptions() {
  const { data } = useApi(listTeam);
  return (data?.items || []).filter((m) => m.active).map((m) => ({ value: m.id, label: m.designation ? `${m.name} · ${m.designation}` : m.name }));
}

function RenewalForm({ state, onClose, settingsText }) {
  const [form] = Form.useForm();
  const [busy, setBusy] = useState(false);
  const team = useTeamOptions();
  const remMode = Form.useWatch(['reminder', 'mode'], form);
  const { mode, record } = state || {};

  useEffect(() => {
    if (!state) return;
    form.resetFields();
    if (mode === 'renew') {
      // next term starts the day after this one ends and runs for the same length (1 year by default)
      const start = dayjs(record.endDate).add(1, 'day');
      const months = record.startDate ? Math.max(1, Math.round(dayjs(record.endDate).diff(dayjs(record.startDate), 'month', true))) : 12;
      form.setFieldsValue({
        startDate: start, endDate: start.add(months, 'month').subtract(1, 'day'), qty: record.qty, poNo: '', invoiceNo: '',
        salePrice: record.salePrice, purchasePrice: record.purchasePrice, vendor: record.vendor, priceBasis: record.priceBasis, plusGst: record.plusGst,
      });
    } else {
      form.setFieldsValue(record ? toForm(record) : {
        qty: 1, priceBasis: 'Total', plusGst: true, status: 'Active', reminder: { mode: 'default', days: [], dates: [] }, notify: [],
      });
    }
  }, [state]); // eslint-disable-line react-hooks/exhaustive-deps

  const save = async (v) => {
    setBusy(true);
    try {
      const body = fromForm(v);
      if (mode === 'renew') await renewRenewal(record.id, body);
      else if (record?.id) await updateRenewal(record.id, body);
      else await createRenewal(body);
      message.success(mode === 'renew' ? 'Renewed — the new term is now tracked' : 'Renewal saved');
      onClose(true);
    } catch (err) {
      if (err.fields) form.setFields(Object.entries(err.fields).map(([name, e]) => ({ name, errors: [e] })));
      fail(err);
    } finally {
      setBusy(false);
    }
  };

  const renew = mode === 'renew';
  const title = renew ? `Renew · ${record.customer}` : record?.id ? `Edit ${record.code}` : 'New renewal';

  return (
    <Drawer
      open={Boolean(state)} onClose={() => onClose(false)} width={560} destroyOnClose rootClassName="px-admin-drawer"
      styles={{ header: { padding: '12px 20px' } }} title={title}
      extra={<Button type="primary" loading={busy} onClick={() => form.submit()}>{renew ? 'Save renewal' : 'Save'}</Button>}
    >
      {renew && (
        <Alert
          className="!mb-4" type="info" showIcon
          message={`${record.description} — current term ends ${fmtYmd(record.endDate)}`}
          description="Enter the new term. This record is marked Renewed and the new term gets its own reminders."
        />
      )}
      <Form form={form} layout="vertical" requiredMark={false} onFinish={save}>
        {!renew && (
          <>
            <p className="m-0 mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Customer</p>
            <Form.Item name="customer" label="Customer name" rules={[{ required: true, message: 'Customer name is required' }]}>
              <Input placeholder="Euronics Industries Pvt. Ltd." />
            </Form.Item>
            <div className="grid gap-x-3 sm:grid-cols-3">
              <Form.Item name="contactName" label="Contact person"><Input /></Form.Item>
              <Form.Item name="phone" label="Phone"><Input placeholder="98xxxxxxxx" /></Form.Item>
              <Form.Item name="email" label="Email" rules={[{ type: 'email', message: 'Enter a valid email' }]}><Input /></Form.Item>
            </div>
            <p className="m-0 mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Product</p>
            <Form.Item name="description" label="Description" rules={[{ required: true, message: 'Description is required' }]}>
              <Input placeholder="SonicWall Log Analytics / Veeam Backup for O365" />
            </Form.Item>
            <div className="grid gap-x-3 sm:grid-cols-2">
              <Form.Item name="serialNo" label="Serial / licence key"><Input placeholder="E1N3J5HF" /></Form.Item>
              <Form.Item name="status" label="Status"><Select options={STATUSES.map((s) => ({ value: s, label: s }))} /></Form.Item>
            </div>
          </>
        )}
        <p className="m-0 mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">{renew ? 'New term' : 'Order & term'}</p>
        <div className="grid gap-x-3 sm:grid-cols-3">
          <Form.Item name="qty" label="Qty" rules={[{ required: true, message: 'Qty' }]}><InputNumber min={1} className="!w-full" /></Form.Item>
          <Form.Item name="poNo" label="PO No"><Input placeholder="PO/EXP/23-24/463" /></Form.Item>
          <Form.Item name="invoiceNo" label="Invoice No"><Input placeholder="PTPL/FY23-24/230" /></Form.Item>
        </div>
        <div className="grid gap-x-3 sm:grid-cols-2">
          <Form.Item name="startDate" label="Start date"><DatePicker className="!w-full" format="D MMM YYYY" /></Form.Item>
          <Form.Item
            name="endDate" label="End (expiry) date" dependencies={['startDate']}
            rules={[
              { required: true, message: 'End date is required' },
              ({ getFieldValue }) => ({
                validator: (_, v) => (!v || !getFieldValue('startDate') || !v.isBefore(getFieldValue('startDate'))
                  ? Promise.resolve() : Promise.reject(new Error('End date must be after the start date'))),
              }),
            ]}
          >
            <DatePicker className="!w-full" format="D MMM YYYY" />
          </Form.Item>
        </div>
        <p className="m-0 mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Pricing</p>
        <div className="grid gap-x-3 sm:grid-cols-2">
          <Form.Item name="salePrice" label="Last sale price (₹)"><InputNumber min={0} className="!w-full" placeholder="30000" /></Form.Item>
          <Form.Item name="purchasePrice" label="Last purchase price (₹)"><InputNumber min={0} className="!w-full" placeholder="20800" /></Form.Item>
        </div>
        <Form.Item name="vendor" label="Vendor (purchased from)"><Input placeholder="e.g. Ingram Micro / Redington / OEM name" /></Form.Item>
        <div className="grid gap-x-3 sm:grid-cols-2">
          <Form.Item name="priceBasis" label="Price is"><Segmented block options={['Total', 'Per unit']} /></Form.Item>
          <Form.Item name="plusGst" label="+ GST extra" valuePropName="checked"><Switch /></Form.Item>
        </div>
        {!renew && (
          <>
            <p className="m-0 mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Reminder</p>
            <Form.Item name={['reminder', 'mode']} label="When to remind" className="!mb-3">
              <Segmented
                block
                options={[
                  { value: 'default', label: 'Default schedule' },
                  { value: 'days', label: 'Custom days before' },
                  { value: 'dates', label: 'Custom dates' },
                ]}
              />
            </Form.Item>
            {(!remMode || remMode === 'default') && <p className="-mt-1 mb-4 text-[12px] text-slate-500">{settingsText || 'Follows Reminder schedule'} — change it in Reminder schedule.</p>}
            {remMode === 'days' && (
              <Form.Item
                name={['reminder', 'days']} label="Days before expiry (0 = on the expiry day)"
                rules={[{ required: true, type: 'array', min: 1, message: 'Add at least one number' }]}
                normalize={(v) => (v || []).map((x) => Number(x)).filter((n) => Number.isInteger(n) && n >= 0 && n <= 365)}
              >
                <Select mode="tags" tokenSeparators={[',', ' ']} placeholder="e.g. 30, 15, 7, 1, 0" options={[60, 30, 15, 10, 7, 5, 3, 2, 1, 0].map((d) => ({ value: d, label: d === 0 ? 'On expiry day' : `${d} days before` }))} />
              </Form.Item>
            )}
            {remMode === 'dates' && (
              <Form.Item name={['reminder', 'dates']} label="Reminder dates" rules={[{ required: true, type: 'array', min: 1, message: 'Pick at least one date' }]}>
                <DatePicker multiple className="!w-full" format="D MMM YYYY" placeholder="Pick one or more dates" />
              </Form.Item>
            )}
            <Form.Item name="notify" label="Send reminder to" extra="Leave empty to notify every active team member.">
              <Select mode="multiple" allowClear options={team} placeholder={team.length ? 'All team members' : 'Add people in Reminder team first'} optionFilterProp="label" />
            </Form.Item>
          </>
        )}
      </Form>
    </Drawer>
  );
}

/* ---------------- detail drawer: contact, status, follow-up log ---------------- */
function RenewalDetail({ record, rows, remindDays, onClose, onEdit, onRenew }) {
  const team = useTeamOptions();
  const [text, setText] = useState('');
  const [contacted, setContacted] = useState(true);
  const [busy, setBusy] = useState(false);
  if (!record) return null;
  const r = record;
  const prev = r.renewedFrom && rows.find((x) => x.id === String(r.renewedFrom));
  const next = r.renewedTo && rows.find((x) => x.id === String(r.renewedTo));

  const add = async () => {
    if (!text.trim()) return;
    setBusy(true);
    try {
      await addRenewalNote(r.id, text.trim(), contacted);
      setText('');
    } catch (e) { fail(e); } finally { setBusy(false); }
  };

  return (
    <Drawer
      open onClose={onClose} width={560} rootClassName="px-admin-drawer" styles={{ header: { padding: '12px 20px' } }}
      title={<span className="flex items-center gap-2">{r.customer} <span className="font-mono text-[11px] font-normal text-slate-400">{r.code}</span></span>}
      extra={(
        <span className="flex gap-2">
          <Button icon={<EditOutlined />} onClick={() => onEdit(r)}>Edit</Button>
          {!r.renewedTo && <Button type="primary" icon={<SyncOutlined />} onClick={() => onRenew(r)}>Renew</Button>}
        </span>
      )}
    >
      {isOpen(r) && (r.remindToday || r.daysLeft < 0) && (
        <Alert
          className="!mb-4" type={r.daysLeft < 0 ? 'error' : 'warning'} showIcon
          message={r.daysLeft < 0 ? `This plan expired on ${fmtYmd(r.endDate)} and is not renewed yet` : `${daysText(r.daysLeft)} — contact the customer for renewal`}
        />
      )}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <ContactButtons r={r} size="middle" />
        <Select
          value={r.status} style={{ width: 160 }} options={STATUSES.map((s) => ({ value: s, label: s }))}
          onChange={(status) => updateRenewal(r.id, { status }).then(() => message.success(`Marked ${status}`), fail)}
        />
      </div>

      <Descriptions size="small" column={2} bordered className="mb-5">
        <Descriptions.Item label="Description" span={2}>{r.description}{r.serialNo && <span className="block font-mono text-[12px] text-slate-500">{r.serialNo}</span>}</Descriptions.Item>
        <Descriptions.Item label="Contact" span={2}>{[r.contactName, r.phone, r.email].filter(Boolean).join(' · ') || '—'}</Descriptions.Item>
        <Descriptions.Item label="Qty">{r.qty}</Descriptions.Item>
        <Descriptions.Item label="Status"><StatusTag color={STATUS_COLORS[r.status]}>{r.status}</StatusTag></Descriptions.Item>
        <Descriptions.Item label="PO No">{r.poNo || '—'}</Descriptions.Item>
        <Descriptions.Item label="Invoice No">{r.invoiceNo || '—'}</Descriptions.Item>
        <Descriptions.Item label="Start date">{fmtYmd(r.startDate)}</Descriptions.Item>
        <Descriptions.Item label="End date"><span className="flex flex-wrap items-center gap-2">{fmtYmd(r.endDate)} <DaysTag r={r} remindDays={remindDays} /></span></Descriptions.Item>
        <Descriptions.Item label="Last sale price">{fmtPrice(r.salePrice, r)}</Descriptions.Item>
        <Descriptions.Item label="Last purchase price">{fmtPrice(r.purchasePrice, r)}</Descriptions.Item>
        <Descriptions.Item label="Vendor" span={2}>{r.vendor || '—'}</Descriptions.Item>
        <Descriptions.Item label="Reminder rule" span={2}>{r.ruleText || '—'}</Descriptions.Item>
        <Descriptions.Item label="Next reminder">{isOpen(r) ? (r.nextReminder ? fmtYmd(r.nextReminder) : 'None scheduled') : 'Stopped (closed)'}</Descriptions.Item>
        <Descriptions.Item label="Sent to">
          {r.notify?.length ? r.notify.map((id) => team.find((t) => t.value === id)?.label || 'Removed member').join(', ') : 'All team members'}
        </Descriptions.Item>
        {prev && <Descriptions.Item label="Previous term" span={2}>{prev.code} · {fmtYmd(prev.startDate)} – {fmtYmd(prev.endDate)}</Descriptions.Item>}
        {next && <Descriptions.Item label="Renewed as" span={2}>{next.code} · till {fmtYmd(next.endDate)}</Descriptions.Item>}
        {r.lastRemindedOn && <Descriptions.Item label="Last reminder sent" span={2}>{fmtYmd(r.lastRemindedOn)}</Descriptions.Item>}
      </Descriptions>

      <p className="m-0 mb-2 text-[13px] font-semibold text-slate-900 dark:text-white">Follow-up log</p>
      <Input.TextArea rows={2} value={text} onChange={(e) => setText(e.target.value)} placeholder="e.g. Called Mr. Sharma — will send PO next week" maxLength={2000} />
      <div className="mb-4 mt-2 flex items-center justify-between">
        <Checkbox checked={contacted} onChange={(e) => setContacted(e.target.checked)}>Mark as contacted</Checkbox>
        <Button type="primary" size="small" loading={busy} disabled={!text.trim()} onClick={add}>Add note</Button>
      </div>
      {r.notes?.length ? (
        <ul className="m-0 list-none space-y-2 p-0">
          {[...r.notes].reverse().map((n, i) => (
            <li key={i} className="rounded-lg border border-slate-200 px-3 py-2 dark:border-white/10">
              <p className="m-0 whitespace-pre-wrap text-[13px] text-slate-800 dark:text-slate-100">{n.text}</p>
              <p className="m-0 mt-1 text-[11px] text-slate-400">{n.by} · {fmtDateTime(n.at)}</p>
            </li>
          ))}
        </ul>
      ) : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No follow-up yet" />}
    </Drawer>
  );
}

/* ---------------- CSV import ---------------- */
function ImportModal({ open, onClose }) {
  const [parsed, setParsed] = useState(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);

  const read = (file) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        setResult(null);
        setParsed(rowsToRenewals(parseCsv(String(reader.result))));
      } catch (e) {
        setParsed(null);
        message.error(e.message);
      }
    };
    reader.readAsText(file);
    return false;
  };

  const run = async () => {
    setBusy(true);
    try {
      const r = await importRenewals(parsed.items);
      setResult(r);
      setParsed(null);
      message.success(`${r.created} renewal${r.created === 1 ? '' : 's'} imported`);
    } catch (e) { fail(e); } finally { setBusy(false); }
  };

  const close = () => { setParsed(null); setResult(null); onClose(); };

  return (
    <Modal
      open={open} onCancel={close} title="Import renewals from Excel" width={720}
      footer={[
        <Button key="c" onClick={close}>{result ? 'Done' : 'Cancel'}</Button>,
        !result && <Button key="i" type="primary" loading={busy} disabled={!parsed?.items.length} onClick={run}>Import {parsed?.items.length || ''} rows</Button>,
      ]}
    >
      <p className="mt-0 text-[13px] text-slate-600 dark:text-slate-300">
        In Excel use <b>File → Save As → CSV (Comma delimited)</b>, then choose the file. Columns are matched by name:
        Customer Name, Description, Qty, PO No, Invoice No, Start Date, End Date, Last Sale Price, Last Purchase Price
        (optional: Vendor, Contact, Phone, Email, Serial). Month rows such as “Oct Renewal” are skipped.
      </p>
      <Upload accept=".csv,text/csv" beforeUpload={read} showUploadList={false} maxCount={1}>
        <Button icon={<UploadOutlined />}>Choose CSV file</Button>
      </Upload>

      {parsed && (
        <div className="mt-4">
          <Table
            size="small" rowKey={(_, i) => i} dataSource={parsed.items} pagination={{ pageSize: 6, hideOnSinglePage: true }} scroll={{ x: 640 }}
            columns={[
              { title: 'Customer', dataIndex: 'customer' },
              { title: 'Description', dataIndex: 'description' },
              { title: 'Qty', dataIndex: 'qty', width: 50 },
              { title: 'End', dataIndex: 'endDate', width: 110, render: fmtYmd },
              { title: 'Sale', dataIndex: 'salePrice', width: 150, render: (v, r) => fmtPrice(v, r) },
            ]}
          />
          {parsed.skipped.length > 0 && (
            <Alert
              className="!mt-3" type="warning" showIcon message={`${parsed.skipped.length} row(s) will be skipped`}
              description={<ul className="m-0 ps-4">{parsed.skipped.slice(0, 8).map((s) => <li key={s.line}>Line {s.line}: {s.reason} — {s.text}</li>)}</ul>}
            />
          )}
        </div>
      )}
      {result && (
        <Alert
          className="!mt-4" showIcon type={result.errors.length ? 'warning' : 'success'}
          message={`${result.created} imported${result.errors.length ? `, ${result.errors.length} failed` : ''}`}
          description={result.errors.length ? <ul className="m-0 ps-4">{result.errors.slice(0, 10).map((e) => <li key={e.row}>Row {e.row} ({e.customer}): {e.error}</li>)}</ul> : null}
        />
      )}
    </Modal>
  );
}

function exportRenewals(rows) {
  const cols = [
    ['code', 'ID'], ['customer', 'Customer Name'], ['contactName', 'Contact'], ['phone', 'Phone'], ['email', 'Email'],
    ['description', 'Description'], ['serialNo', 'Serial'], ['qty', 'Qty'], ['poNo', 'PO No'], ['invoiceNo', 'Invoice No'],
    ['startDate', 'Start Date'], ['endDate', 'End Date'], ['daysLeft', 'Days Left'],
    ['salePrice', 'Last Sale Price', (v, r) => fmtPrice(v, r).replace('₹', '')], ['purchasePrice', 'Last Purchase Price', (v, r) => fmtPrice(v, r).replace('₹', '')],
    ['vendor', 'Vendor'], ['nextReminder', 'Next Reminder'], ['status', 'Status'],
  ];
  const esc = (v) => { const s = v == null ? '' : String(v); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
  const csv = [cols.map((c) => c[1]).join(','), ...rows.map((r) => cols.map(([k, , f]) => esc(f ? f(r[k], r) : r[k])).join(','))].join('\n');
  const url = URL.createObjectURL(new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = `renewals-${dayjs().format('YYYY-MM-DD')}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/* ---------------- page ---------------- */
function Kpi({ label, value, sub, tone, active, onClick }) {
  const tones = { red: 'text-red-600 dark:text-red-400', orange: 'text-orange-600 dark:text-orange-400', default: 'text-slate-900 dark:text-white' };
  return (
    <button
      type="button" onClick={onClick}
      className={`${cardCls} w-full cursor-pointer p-3.5 text-left transition-shadow hover:shadow-soft ${active ? '!border-brand-400 ring-1 ring-brand-400' : ''}`}
    >
      <p className="m-0 text-[12px] font-medium text-slate-500">{label}</p>
      <p className={`m-0 mt-1.5 text-[22px] font-semibold leading-none tabular-nums ${tones[tone] || tones.default}`}>{value}</p>
      <p className="m-0 mt-1.5 text-[11.5px] text-slate-400">{sub}</p>
    </button>
  );
}

const VIEWS = [
  { value: 'upcoming', label: 'Open' },
  { value: 'due', label: 'Due now' },
  { value: 'month', label: 'This month' },
  { value: 'expired', label: 'Expired' },
  { value: 'closed', label: 'Renewed / closed' },
  { value: 'all', label: 'All' },
];

export default function Renewals() {
  const [params, setParams] = useSearchParams();
  const { data, loading, error, reload } = useApi(listRenewals, [], { poll: 60000 });
  const [view, setView] = useState(params.get('view') || 'upcoming');
  const [q, setQ] = useState('');
  const [formState, setFormState] = useState(null);
  const [importOpen, setImportOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const { data: rem } = useApi(getRenewalReminders, []);
  const viewParam = params.get('view');
  useEffect(() => { if (viewParam) setView(viewParam); }, [viewParam]);

  const rows = data?.items || [];
  const remindDays = data?.remindDays || 5;
  const settings = data?.settings;
  const settingsText = settings && (settings.mode === 'daily'
    ? `Default: daily from ${settings.windowDays} days before expiry at ${settings.sendTime}`
    : `Default: ${settings.days.map((d) => (d === 0 ? 'expiry day' : `${d}d before`)).join(', ')} at ${settings.sendTime}`);
  const attention = (r) => isOpen(r) && (r.remindToday || r.daysLeft < 0);
  const today = data?.today || dayjs().format('YYYY-MM-DD');
  const openId = params.get('id');
  const detail = openId ? rows.find((r) => r.id === openId) : null;
  const setDetail = (id) => setParams((p) => { const n = new URLSearchParams(p); if (id) n.set('id', id); else n.delete('id'); return n; }, { replace: true });

  const monthKey = today.slice(0, 7);
  const counts = useMemo(() => {
    const open = rows.filter(isOpen);
    return {
      due: open.filter((r) => r.remindToday).length,
      expired: open.filter((r) => r.daysLeft < 0).length,
      month: open.filter((r) => r.endDate.startsWith(monthKey)).length,
      open: open.length,
    };
  }, [rows, remindDays, monthKey]);

  const filtered = useMemo(() => {
    const byView = {
      upcoming: (r) => isOpen(r),
      due: (r) => attention(r),
      month: (r) => r.endDate.startsWith(monthKey),
      expired: (r) => isOpen(r) && r.daysLeft < 0,
      closed: (r) => !isOpen(r),
      all: () => true,
    }[view];
    const needle = q.trim().toLowerCase();
    return rows.filter(byView).filter((r) => !needle || [r.code, r.customer, r.contactName, r.phone, r.email, r.description, r.serialNo, r.poNo, r.invoiceNo, r.vendor]
      .some((v) => String(v || '').toLowerCase().includes(needle)));
  }, [rows, view, q, monthKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // group rows by the month the plan ends — like the "Oct Renewal" bands in the Excel sheet
  const tableData = useMemo(() => {
    const out = [];
    let current = null;
    let n = 0;
    filtered.forEach((r) => {
      const key = r.endDate.slice(0, 7);
      if (key !== current) {
        current = key;
        n = 0;
        out.push({ id: `g-${key}`, group: true, label: `${dayjs(`${key}-01`).format('MMMM YYYY')} renewals`, count: filtered.filter((x) => x.endDate.startsWith(key)).length });
      }
      n += 1;
      out.push({ ...r, sno: n });
    });
    return out;
  }, [filtered]);

  const COLS = 15;
  const cell = (render) => ({
    onCell: (r) => (r.group ? { colSpan: 0 } : {}),
    render: (v, r) => (r.group ? null : render(v, r)),
  });
  const columns = [
    {
      title: 'S.No', dataIndex: 'sno', width: 56, align: 'center',
      onCell: (r) => (r.group ? { colSpan: COLS, className: '!bg-brand-50/70 dark:!bg-white/[0.04]' } : {}),
      render: (v, r) => (r.group
        ? <span className="block text-center text-[13px] font-semibold text-slate-800 dark:text-slate-100">{r.label} <span className="font-normal text-slate-400">· {r.count}</span></span>
        : v),
    },
    {
      title: 'Customer Name', dataIndex: 'customer', width: 220,
      ...cell((v, r) => <span><span className="block font-medium text-slate-900 dark:text-white">{v}</span><span className="block truncate text-[11.5px] text-slate-500">{[r.contactName, r.phone].filter(Boolean).join(' · ')}</span></span>),
    },
    { title: 'Description', dataIndex: 'description', width: 220, ...cell((v, r) => <span>{v}{r.serialNo && <span className="block font-mono text-[11.5px] text-slate-500">{r.serialNo}</span>}</span>) },
    { title: 'Qty', dataIndex: 'qty', width: 56, align: 'center', ...cell((v) => v) },
    { title: 'PO No', dataIndex: 'poNo', width: 150, ...cell((v) => v || '—') },
    { title: 'Invoice No', dataIndex: 'invoiceNo', width: 150, ...cell((v) => v || '—') },
    { title: 'Start Date', dataIndex: 'startDate', width: 105, ...cell(fmtYmd) },
    { title: 'End Date', dataIndex: 'endDate', width: 105, ...cell(fmtYmd) },
    { title: 'Remaining', dataIndex: 'daysLeft', width: 125, ...cell((_, r) => <DaysTag r={r} remindDays={remindDays} />) },
    { title: 'Last Sale Price', dataIndex: 'salePrice', width: 150, ...cell((v, r) => fmtPrice(v, r)) },
    { title: 'Last Purchase Price', dataIndex: 'purchasePrice', width: 150, ...cell((v, r) => fmtPrice(v, r)) },
    { title: 'Vendor', dataIndex: 'vendor', width: 150, ...cell((v) => v || '—') },
    {
      title: 'Next reminder', dataIndex: 'nextReminder', width: 130,
      ...cell((v, r) => (!isOpen(r) ? <span className="text-slate-400">—</span> : r.remindToday
        ? <Tag color="orange" className="!m-0">Today</Tag>
        : <span className="whitespace-nowrap">{v ? fmtYmd(v) : '—'}{r.reminder?.mode && r.reminder.mode !== 'default' && <Tooltip title={r.ruleText}><Tag className="!ms-1 !me-0">custom</Tag></Tooltip>}</span>)),
    },
    { title: 'Status', dataIndex: 'status', width: 105, ...cell((v) => <StatusTag color={STATUS_COLORS[v]}>{v}</StatusTag>) },
    {
      key: 'a', width: 80, fixed: 'right',
      ...cell((_, r) => (
        <span className="flex gap-1" onClick={(e) => e.stopPropagation()} role="presentation">
          {!r.renewedTo && (
            <Tooltip title="Renew"><Button size="small" type="text" icon={<SyncOutlined />} onClick={() => setFormState({ mode: 'renew', record: r })} aria-label="Renew" /></Tooltip>
          )}
          <Dropdown
            trigger={['click']}
            menu={{
              items: [
                { key: 'edit', icon: <EditOutlined />, label: 'Edit' },
                ...STATUSES.filter((s) => s !== r.status).map((s) => ({ key: `s:${s}`, label: `Mark ${s}` })),
                { type: 'divider' },
                { key: 'del', icon: <DeleteOutlined />, label: 'Delete', danger: true },
              ],
              onClick: ({ key }) => {
                if (key === 'edit') setFormState({ mode: 'edit', record: r });
                else if (key === 'del') {
                  Modal.confirm({
                    title: `Delete ${r.customer} — ${r.description}?`, okText: 'Delete', okButtonProps: { danger: true },
                    onOk: () => deleteRenewal(r.id).then(() => message.success('Deleted'), fail),
                  });
                } else updateRenewal(r.id, { status: key.slice(2) }).then(() => message.success(`Marked ${key.slice(2)}`), fail);
              },
            }}
          >
            <Button size="small" type="text" icon={<MoreOutlined />} aria-label="More actions" />
          </Dropdown>
        </span>
      )),
    },
  ];

  const sendNow = async () => {
    setSending(true);
    try {
      const r = await runRemindersNow();
      if (r.sent) message.success(`${r.sent} reminder message${r.sent === 1 ? '' : 's'} sent — see Reminder schedule → Delivery log`);
      else if (r.results?.length) message.warning(`Nothing delivered: ${r.results[0].error || 'check email / SMS setup'}`);
      else message.info(r.reason || 'Nothing to send');
    } catch (e) { fail(e); } finally { setSending(false); }
  };

  const dueItems = rem?.items || [];

  return (
    <>
      <PageHeader
        title="Customer renewals"
        sub={`${rows.length} plans tracked${settingsText ? ` · ${settingsText}` : ''}`}
        extra={(
          <>
            <Tooltip title="Refresh"><Button icon={<ReloadOutlined />} onClick={reload} /></Tooltip>
            <Button icon={<UploadOutlined />} onClick={() => setImportOpen(true)}>Import</Button>
            <Button icon={<DownloadOutlined />} onClick={() => exportRenewals(filtered)} disabled={!filtered.length}>Export</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setFormState({ mode: 'create' })}>Add renewal</Button>
          </>
        )}
      />
      {error && <Alert className="!mb-3" type="error" showIcon message={error.message} />}

      {dueItems.length > 0 && (
        <Alert
          className="!mb-4" type="warning" showIcon icon={<BellOutlined />}
          message={`${dueItems.length} customer${dueItems.length === 1 ? '' : 's'} to contact today`}
          description={(
            <ul className="m-0 mt-1 list-none space-y-1 p-0">
              {dueItems.slice(0, 6).map((r) => (
                <li key={r.id} className="flex flex-wrap items-center gap-2">
                  <button type="button" onClick={() => setDetail(r.id)} className="cursor-pointer border-0 bg-transparent p-0 text-left font-medium text-slate-900 underline-offset-2 hover:underline dark:text-white">{r.customer}</button>
                  <span className="text-slate-500">{r.description} · ends {fmtYmd(r.endDate)}</span>
                  <Tag color={r.daysLeft < 0 ? 'red' : 'volcano'} className="!m-0">{daysText(r.daysLeft)}</Tag>
                  <ContactButtons r={r} />
                </li>
              ))}
            </ul>
          )}
          action={(
            <Tooltip title="Sends today's reminders to the team by email / SMS now (they also go automatically at the scheduled time)">
              <Button size="small" icon={<SendOutlined />} loading={sending} onClick={sendNow}>Send to team now</Button>
            </Tooltip>
          )}
        />
      )}

      <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Reminding today" value={counts.due} sub="call these customers now" tone={counts.due ? 'orange' : ''} active={view === 'due'} onClick={() => setView('due')} />
        <Kpi label="Expired, not renewed" value={counts.expired} sub="follow up or mark Not renewing" tone={counts.expired ? 'red' : ''} active={view === 'expired'} onClick={() => setView('expired')} />
        <Kpi label={`Ending in ${dayjs(today).format('MMMM')}`} value={counts.month} sub="open renewals this month" active={view === 'month'} onClick={() => setView('month')} />
        <Kpi label="Open renewals" value={counts.open} sub="active or contacted" active={view === 'upcoming'} onClick={() => setView('upcoming')} />
      </div>

      <Panel bodyClass="p-0">
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 p-3 dark:border-white/10">
          <Segmented value={view} onChange={setView} options={VIEWS} />
          <Input.Search allowClear placeholder="Search customer, product, PO, invoice…" value={q} onChange={(e) => setQ(e.target.value)} style={{ maxWidth: 320 }} />
          <span className="ms-auto text-[12px] text-slate-400">{filtered.length} shown</span>
        </div>
        <Table
          rowKey="id" size="small" loading={loading} dataSource={tableData} columns={columns} pagination={false}
          scroll={{ x: 1980 }} sticky
          locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={rows.length ? 'Nothing in this view' : 'No renewals yet — add one or import your Excel sheet'} /> }}
          onRow={(r) => (r.group ? {} : { onClick: () => setDetail(r.id), className: 'cursor-pointer' })}
          rowClassName={(r) => (!r.group && attention(r) ? (r.daysLeft < 0 ? 'bg-red-50/60 dark:bg-red-500/[0.06]' : 'bg-orange-50/60 dark:bg-orange-500/[0.06]') : '')}
        />
      </Panel>

      <RenewalDetail
        record={detail} rows={rows} remindDays={remindDays} onClose={() => setDetail(null)}
        onEdit={(r) => setFormState({ mode: 'edit', record: r })} onRenew={(r) => setFormState({ mode: 'renew', record: r })}
      />
      <RenewalForm state={formState} onClose={() => setFormState(null)} settingsText={settingsText} />
      <ImportModal open={importOpen} onClose={() => setImportOpen(false)} />
    </>
  );
}
