import mongoose from 'mongoose';
import { collections, collectionKeys } from '../collections.js';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { seedData } from './demoData.js';
import { Client, Asset, Licence, Document, DEFAULT_ESCALATION } from '../models/portal.js';
import { saveFile, deleteFile } from '../services/files.js';

const Counter = () => mongoose.model('Counter');

/** Deletes every submission, stored resume file and reference counter. Admin accounts are kept. */
export async function clearAllData() {
  await Promise.all(collectionKeys.map((k) => collections[k].model.deleteMany({})));
  const db = mongoose.connection.db;
  await Promise.all(['resumes.files', 'resumes.chunks'].map((c) => db.collection(c).deleteMany({})));
  await Counter().deleteMany({});
}

/** Replaces all submissions with the demo set and returns counts per collection. */
export async function seedDemoData() {
  await clearAllData();
  const data = seedData();
  const counts = {};

  for (const key of collectionKeys) {
    const docs = (data[key] || []).map(({ id, resume, messages, ...rest }) => ({
      ...rest,
      code: id,
      createdAt: new Date(rest.createdAt),
      updatedAt: new Date(rest.updatedAt || rest.createdAt),
      notes: (rest.notes || []).map((n) => ({ ...n, at: new Date(n.at) })),
      ...(key === 'applications' ? { resume: { fileId: null, filename: resume || '', size: 0, contentType: '' } } : {}),
      ...(messages ? { messages: messages.map((m) => ({ ...m, at: new Date(m.at) })) } : {}),
    }));
    await collections[key].model.insertMany(docs, { timestamps: false });
    counts[key] = docs.length;

    // keep new codes above the demo ones (LD-1041 → next is LD-1042)
    const highest = Math.max(0, ...docs.map((d) => Number(String(d.code).split('-')[1]) - 1000));
    await Counter().updateOne({ _id: key }, { $set: { seq: highest } }, { upsert: true });
  }
  counts.portal = await seedPortalDemo();
  return counts;
}

const ahead = (days) => new Date(Date.now() + days * 86400000).toISOString().slice(0, 10);

/** A tiny but valid one-page PDF so demo documents can actually be downloaded and opened. */
function demoPdf(title, lines) {
  const esc = (t) => t.replace(/[()\\]/g, (c) => `\\${c}`);
  const text = [`BT /F1 18 Tf 50 780 Td (${esc(title)}) Tj ET`, ...lines.map((l, i) => `BT /F1 11 Tf 50 ${745 - i * 18} Td (${esc(l)}) Tj ET`)].join('\n');
  const objs = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>',
    `<< /Length ${Buffer.byteLength(text)} >>\nstream\n${text}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ];
  let out = '%PDF-1.4\n';
  const offsets = objs.map((o, i) => { const at = Buffer.byteLength(out); out += `${i + 1} 0 obj\n${o}\nendobj\n`; return at; });
  const xref = Buffer.byteLength(out);
  out += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n${offsets.map((o) => `${String(o).padStart(10, '0')} 00000 n \n`).join('')}`;
  out += `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return Buffer.from(out);
}

const DEMO_CLIENTS = [
  {
    company: 'Auto Components Mfg.', contactName: 'Rakesh Sharma', email: 'portal@autocomponents.in', phone: '9811001122',
    plan: 'Gold', coverage: '24×7×365', accountEngineer: 'Technical Director',
    metrics: { uptime: 99.94, uptimeTarget: 99.5, avgResponseMin: 11, responseTargetMin: 15, slaCompliance: 100 },
    assets: [
      ['DC-SRV-01', 'Server', 'Dell PowerEdge R650', 'Plant 1 — server room', 520, 'Healthy'],
      ['DC-SRV-02', 'Server', 'Dell PowerEdge R650', 'Plant 1 — server room', 520, 'Healthy'],
      ['FILESRV02', 'Server', 'HPE ProLiant DL380', 'Head office', 45, 'Warning'],
      ['FW-EDGE-01', 'Firewall', 'Fortinet FortiGate 100F', 'Head office', 130, 'Healthy'],
      ['SAN-01', 'Storage', 'Dell PowerVault ME5', 'Plant 1 — server room', 540, 'Healthy'],
      ['SW-CORE-01', 'Switch', 'Cisco Catalyst 9200', 'Plant 2', 12, 'Critical'],
      ['AP-PLANT2-04', 'Access point', 'Cisco Meraki MR46', 'Plant 2 — shop floor', 300, 'Healthy'],
    ],
    licences: [
      ['Microsoft 365 Business Premium', 'Microsoft', 128, 83],
      ['Veeam Backup Essentials', 'Veeam', 6, 37],
      ['Fortinet FortiGate UTP Bundle', 'Fortinet', 1, 20],
      ['Sophos Intercept X Advanced', 'Sophos', 140, 159],
    ],
    docs: [
      ['SLA Report — last month', 'SLA report'], ['Quarterly Business Review — Q2', 'QBR'],
      ['Network as-built documentation', 'Documentation'], ['Backup policy', 'Policy'],
      ['Escalation matrix (current)', 'Documentation'], ['Invoice INV-2026-0842', 'Invoice'],
    ],
  },
  {
    company: 'NBFC Group', contactName: 'Head of IT', email: 'it@nbfcgroup.in', phone: '9717223344',
    plan: 'Silver', coverage: '12×6 extended hours', accountEngineer: 'Security Practice Lead',
    metrics: { uptime: 99.81, uptimeTarget: 99.5, avgResponseMin: 18, responseTargetMin: 30, slaCompliance: 97 },
    assets: [['NBFC-FW-HQ', 'Firewall', 'Fortinet FortiGate 200F', 'HQ', 400, 'Healthy']],
    licences: [['Microsoft 365 E3', 'Microsoft', 400, 60]],
    docs: [['Security posture review', 'Documentation']],
  },
];

/**
 * Creates the demo portal clients (keeping an existing client's password) and replaces their
 * assets, licences and documents. Returns login details for clients created by this run.
 */
export async function seedPortalDemo() {
  const { Ticket } = await import('../models/index.js');
  const created = [];
  for (const demo of DEMO_CLIENTS) {
    let client = await Client.findOne({ email: demo.email });
    if (!client) {
      const password = process.env.PORTAL_DEMO_PASSWORD || `Px${crypto.randomBytes(6).toString('base64url')}#${Math.floor(10 + Math.random() * 89)}`;
      const { assets, licences, docs, ...fields } = demo;
      client = await new Client({ ...fields, escalation: DEFAULT_ESCALATION, passwordHash: await bcrypt.hash(password, 12) }).save();
      created.push({ company: demo.company, email: demo.email, password });
    }
    const oldDocs = await Document.find({ client: client._id }, { file: 1 }).lean();
    await Promise.all(oldDocs.map((d) => deleteFile(d.file?.fileId, 'documents')));
    await Promise.all([Asset.deleteMany({ client: client._id }), Licence.deleteMany({ client: client._id }), Document.deleteMany({ client: client._id })]);

    await Asset.insertMany(demo.assets.map(([name, type, model, location, days, status], i) => ({
      client: client._id, name, type, model, location, status, warranty: ahead(days), serial: `SN-${String(client._id).slice(-4).toUpperCase()}-${1000 + i}`,
    })));
    await Licence.insertMany(demo.licences.map(([name, vendor, qty, days]) => ({ client: client._id, name, vendor, qty, renew: ahead(days) })));
    for (const [title, category] of demo.docs) {
      const buffer = demoPdf(title, [demo.company, `Category: ${category}`, `Generated ${new Date().toDateString()}`, 'ProXinet Technologies - demo document']);
      const file = await saveFile({ originalname: `${title.replace(/[^\w]+/g, '_')}.pdf`, mimetype: 'application/pdf', buffer, size: buffer.length }, 'documents');
      await new Document({ client: client._id, title, category, file }).save();
    }
    // attach the demo tickets that belong to this company to its portal account
    await Ticket.updateMany({ client: demo.company }, { $set: { clientId: client._id } });
  }
  return { clients: DEMO_CLIENTS.length, created };
}
