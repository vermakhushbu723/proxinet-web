// Helpers shared by the Renewals page, the daily reminder popup, the bell and the dashboard.
import React from 'react';
import { Button, Tag, Tooltip } from 'antd';
import { PhoneOutlined, MailOutlined, WhatsAppOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

export const STATUS_COLORS = { Active: 'blue', Contacted: 'gold', Renewed: 'green', 'Not renewing': 'default' };
export const CLOSED = ['Renewed', 'Not renewing'];
export const isOpen = (r) => !CLOSED.includes(r.status);

export const fmtYmd = (ymd) => (ymd ? dayjs(ymd).format('D MMM YYYY') : '—');

export const daysText = (d) => {
  if (d === null || d === undefined) return '';
  if (d < 0) return `Expired ${-d}d ago`;
  if (d === 0) return 'Expires today';
  return `${d} day${d === 1 ? '' : 's'} left`;
};

/** Coloured "n days left" tag; closed renewals are shown muted. */
export function DaysTag({ r, remindDays = 5 }) {
  const d = r.daysLeft;
  if (d === null || d === undefined) return null;
  if (!isOpen(r)) return <Tag className="!m-0">{d < 0 ? 'Ended' : `${d}d`}</Tag>;
  const color = d < 0 ? 'red' : d <= remindDays ? 'volcano' : d <= 30 ? 'gold' : 'green';
  return <Tag color={color} className="!m-0 whitespace-nowrap">{d <= remindDays ? daysText(d) : `${d}d`}</Tag>;
}

const inr = (n) => `₹${Number(n).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
/** 30000 → "₹30,000 + GST", per-unit prices get "per unit". */
export function fmtPrice(value, r) {
  if (value === null || value === undefined || value === '') return '—';
  return `${inr(value)}${r.priceBasis === 'Per unit' ? ' per unit' : ''}${r.plusGst ? ' + GST' : ''}`;
}

/* ---------------- contact helpers ---------------- */
const reminderText = (r) => `Dear ${r.contactName || r.customer},\n\nYour ${r.description}${r.qty > 1 ? ` (Qty ${r.qty})` : ''} `
  + `is due for renewal on ${fmtYmd(r.endDate)}. Please confirm so we can process the renewal without any interruption.\n\nRegards,\nProXinet Technologies`;
const waLink = (r) => {
  const digits = String(r.phone || '').replace(/\D/g, '');
  const num = digits.length === 10 ? `91${digits}` : digits;
  return num ? `https://wa.me/${num}?text=${encodeURIComponent(reminderText(r))}` : null;
};
const mailLink = (r) => (r.email
  ? `mailto:${r.email}?subject=${encodeURIComponent(`Renewal due: ${r.description}`)}&body=${encodeURIComponent(reminderText(r))}`
  : null);

export function ContactButtons({ r, size = 'small' }) {
  const wa = waLink(r);
  const mail = mailLink(r);
  return (
    <span className="inline-flex gap-1" onClick={(e) => e.stopPropagation()} role="presentation">
      <Tooltip title={r.phone ? `Call ${r.phone}` : 'No phone number'}>
        <Button size={size} icon={<PhoneOutlined />} href={r.phone ? `tel:${r.phone}` : undefined} disabled={!r.phone} aria-label="Call" />
      </Tooltip>
      <Tooltip title={wa ? 'WhatsApp with a renewal message' : 'No phone number'}>
        <Button size={size} icon={<WhatsAppOutlined />} href={wa || undefined} target="_blank" disabled={!wa} aria-label="WhatsApp" />
      </Tooltip>
      <Tooltip title={mail ? `Email ${r.email}` : 'No email'}>
        <Button size={size} icon={<MailOutlined />} href={mail || undefined} disabled={!mail} aria-label="Email" />
      </Tooltip>
    </span>
  );
}

/* ---------------- CSV import (the renewal sheet saved as CSV) ---------------- */
export function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { cell += '"'; i += 1; }
      else if (c === '"') quoted = false;
      else cell += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') { row.push(cell); cell = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i += 1;
      row.push(cell); rows.push(row); row = []; cell = '';
    } else cell += c;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows.map((r) => r.map((v) => v.replace(/^\uFEFF/, '').replace(/\s+/g, ' ').trim()));
}

// normalised header text → our field (first match wins, so specific names come first)
const HEADERS = [
  [/^(sno|srno|sl|slno|no)$/, null],
  [/vendor|oem|brand|remark/, null],
  [/purchase/, 'purchasePrice'],
  [/sale|selling/, 'salePrice'],
  [/^(pono|po|ponumber|purchaseorder)/, 'poNo'],
  [/invoice/, 'invoiceNo'],
  [/start|from/, 'startDate'],
  [/end|expir|till|validupto/, 'endDate'],
  [/contact|person/, 'contactName'],
  [/email|mail/, 'email'],
  [/phone|mobile|contactno/, 'phone'],
  [/serial|licencekey|licensekey/, 'serialNo'],
  [/^(qty|quantity|users|seats)/, 'qty'],
  [/desc|product|item|plan/, 'description'],
  [/cu?s?t?o?mer|client|company|party/, 'customer'],
];
const fieldOf = (h) => {
  const k = h.toLowerCase().replace(/[^a-z0-9]/g, '');
  return k ? HEADERS.find(([re]) => re.test(k))?.[1] : undefined;
};

const DATE_FORMATS = ['D-MMM-YY', 'D-MMM-YYYY', 'D MMM YYYY', 'D MMM YY', 'D/M/YYYY', 'D-M-YYYY', 'D.M.YYYY', 'D/M/YY', 'YYYY-MM-DD'];
export function parseDate(v) {
  const s = String(v || '').trim();
  if (!s) return '';
  if (/^\d{5}$/.test(s)) return dayjs('1899-12-30').add(Number(s), 'day').format('YYYY-MM-DD'); // Excel serial date
  const d = DATE_FORMATS.map((f) => dayjs(s, f, true)).find((x) => x.isValid());
  return d ? d.format('YYYY-MM-DD') : null;
}
const parseMoney = (v) => {
  const m = String(v || '').replace(/,/g, '').match(/\d+(\.\d+)?/);
  return m ? Number(m[0]) : null;
};

/** Turns sheet rows into renewal records. Band rows such as "Oct Renewal" are skipped. */
export function rowsToRenewals(rows) {
  const headerAt = rows.findIndex((r) => {
    const f = r.map(fieldOf);
    return f.includes('customer') && f.includes('endDate');
  });
  if (headerAt < 0) throw new Error('Could not find the header row — it needs at least "Customer Name" and "End Date" columns.');
  const fields = rows[headerAt].map(fieldOf);
  const items = [];
  const skipped = [];
  rows.slice(headerAt + 1).forEach((r, i) => {
    const raw = {};
    fields.forEach((f, c) => { if (f && raw[f] === undefined) raw[f] = r[c] ?? ''; });
    if (!raw.customer) return; // blank row or a month band such as "Oct Renewal"
    const endDate = parseDate(raw.endDate);
    const startDate = parseDate(raw.startDate);
    if (!endDate) {
      skipped.push({ line: headerAt + i + 2, reason: `end date "${raw.endDate}" not understood`, text: r.filter(Boolean).join(' · ') });
      return;
    }
    const priceText = `${raw.salePrice || ''} ${raw.purchasePrice || ''}`;
    items.push({
      customer: raw.customer, description: raw.description || '—', contactName: raw.contactName || '', email: raw.email || '',
      phone: raw.phone || '', serialNo: raw.serialNo || '', qty: Math.max(1, parseInt(raw.qty, 10) || 1),
      poNo: raw.poNo || '', invoiceNo: raw.invoiceNo || '', startDate: startDate || '', endDate,
      salePrice: parseMoney(raw.salePrice), purchasePrice: parseMoney(raw.purchasePrice),
      priceBasis: /per\s*unit/i.test(priceText) ? 'Per unit' : 'Total',
      plusGst: priceText.trim() ? /gst/i.test(priceText) : true,
    });
  });
  return { items, skipped };
}
