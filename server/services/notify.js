// Outgoing email (SMTP via nodemailer) and SMS / WhatsApp (Fast2SMS, Twilio or any HTTP webhook).
import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

/* ---------------- email ---------------- */
let transport;
const mailer = () => {
  if (env.mailDryRun) return (transport ||= nodemailer.createTransport({ jsonTransport: true }));
  if (!env.smtp.host) return null;
  transport ||= nodemailer.createTransport({
    host: env.smtp.host, port: env.smtp.port, secure: env.smtp.port === 465,
    auth: env.smtp.user ? { user: env.smtp.user, pass: env.smtp.pass } : undefined,
  });
  return transport;
};

export const emailConfigured = () => Boolean(env.mailDryRun || env.smtp.host);

/** Returns { status: 'sent' | 'skipped' | 'failed', error? } — never throws. */
export async function sendEmail({ to, subject, html, text }) {
  const smtp = mailer();
  if (!smtp) return { status: 'skipped', error: 'Email is not configured (SMTP_HOST)' };
  try {
    await smtp.sendMail({ from: env.smtp.from || env.smtp.user || 'no-reply@proxinet.in', to, subject, html, text });
    return { status: 'sent' };
  } catch (e) {
    return { status: 'failed', error: e.message };
  }
}

/* ---------------- SMS / WhatsApp ---------------- */
/** 98xxxxxxxx / +91 98xxx xxxxx / 098xxxxxxxx → { local: '98xxxxxxxx', e164: '+9198xxxxxxxx' } */
export function normalizePhone(raw) {
  let d = String(raw || '').replace(/\D/g, '');
  if (d.length === 11 && d.startsWith('0')) d = d.slice(1);
  if (d.length === 10) return { local: d, e164: `+91${d}` };
  if (d.length > 10) return { local: d.slice(-10), e164: `+${d}` };
  return null;
}

export const smsProvider = () => (env.sms.provider || '').toLowerCase();
export const smsConfigured = () => {
  const p = smsProvider();
  if (p === 'fast2sms') return Boolean(env.sms.fast2smsKey);
  if (p === 'twilio') return Boolean(env.sms.twilioSid && env.sms.twilioToken && env.sms.twilioFrom);
  if (p === 'webhook') return Boolean(env.sms.webhookUrl);
  return p === 'log';
};
export const smsLabel = () => {
  const p = smsProvider();
  if (p === 'twilio' && env.sms.twilioWhatsapp) return 'Twilio WhatsApp';
  return { fast2sms: 'Fast2SMS', twilio: 'Twilio SMS', webhook: 'Webhook', log: 'Console log (test mode)' }[p] || 'Not configured';
};

async function httpOk(res) {
  if (res.ok) return;
  const body = await res.text().catch(() => '');
  throw new Error(`HTTP ${res.status} ${body.slice(0, 200)}`);
}

/** Returns { status: 'sent' | 'skipped' | 'failed', error? } — never throws. */
export async function sendSms(phone, text) {
  const num = normalizePhone(phone);
  if (!num) return { status: 'failed', error: `Invalid mobile number "${phone}"` };
  if (!smsConfigured()) return { status: 'skipped', error: 'SMS is not configured (SMS_PROVIDER)' };
  const p = smsProvider();
  try {
    if (p === 'log') {
      console.log(`[sms:test] → ${num.e164}: ${text}`);
    } else if (p === 'fast2sms') {
      const res = await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: { authorization: env.sms.fast2smsKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({ route: 'q', message: text, language: 'english', flash: 0, numbers: num.local }),
      });
      await httpOk(res);
      const data = await res.json().catch(() => ({}));
      if (data.return === false) throw new Error(Array.isArray(data.message) ? data.message.join(', ') : String(data.message || 'Fast2SMS rejected the message'));
    } else if (p === 'twilio') {
      const wa = env.sms.twilioWhatsapp;
      const from = wa && !env.sms.twilioFrom.startsWith('whatsapp:') ? `whatsapp:${env.sms.twilioFrom}` : env.sms.twilioFrom;
      const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${env.sms.twilioSid}/Messages.json`, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${Buffer.from(`${env.sms.twilioSid}:${env.sms.twilioToken}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ To: wa ? `whatsapp:${num.e164}` : num.e164, From: from, Body: text }),
      });
      await httpOk(res);
    } else if (p === 'webhook') {
      const res = await fetch(env.sms.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(env.sms.webhookToken ? { Authorization: `Bearer ${env.sms.webhookToken}` } : {}) },
        body: JSON.stringify({ to: num.e164, mobile: num.local, message: text }),
      });
      await httpOk(res);
    }
    return { status: 'sent' };
  } catch (e) {
    return { status: 'failed', error: e.message };
  }
}
