// Client-portal data: client accounts and what each client sees in /portal/dashboard.
import mongoose from 'mongoose';
import { str, req, EMAIL_RE } from './helpers.js';

const { Schema } = mongoose;
const ymd = (label) => ({ type: String, trim: true, required: [true, `${label} is required`], match: [/^\d{4}-\d{2}-\d{2}$/, `${label} must be YYYY-MM-DD`] });
const clientRef = { type: Schema.Types.ObjectId, ref: 'Client', required: [true, 'Client is required'], index: true };
const toJSON = {
  transform: (_d, ret) => {
    ret.id = String(ret._id);
    delete ret._id;
    delete ret.passwordHash;
    return ret;
  },
};

const escalationLevel = new Schema({
  level: str(40), title: req(120, 'Escalation title'), detail: str(300), contact: str(160),
}, { _id: false });

const clientSchema = new Schema({
  company: req(160, 'Company'),
  contactName: str(120),
  email: {
    type: String, trim: true, lowercase: true, unique: true, required: [true, 'Login email is required'],
    match: [EMAIL_RE, 'Enter a valid email address'],
  },
  phone: str(40),
  plan: { type: String, enum: ['Bronze', 'Silver', 'Gold'], default: 'Silver' },
  coverage: str(80, { default: '8×5 business hours' }),
  accountEngineer: str(120),
  passwordHash: { type: String, required: true },
  active: { type: Boolean, default: true },
  lastLoginAt: { type: Date, default: null },
  metrics: {
    uptime: { type: Number, min: 0, max: 100, default: 99.9 },
    uptimeTarget: { type: Number, min: 0, max: 100, default: 99.5 },
    avgResponseMin: { type: Number, min: 0, default: 15 },
    responseTargetMin: { type: Number, min: 0, default: 15 },
    slaCompliance: { type: Number, min: 0, max: 100, default: 100 },
  },
  escalation: { type: [escalationLevel], default: [] },
}, { timestamps: true, versionKey: false });
clientSchema.set('toJSON', toJSON);

const assetSchema = new Schema({
  client: clientRef,
  name: req(120, 'Asset name'),
  type: { type: String, enum: ['Server', 'Storage', 'Firewall', 'Switch', 'Router', 'Access point', 'Laptop', 'Desktop', 'Printer', 'UPS', 'Other'], default: 'Other' },
  model: str(160), serial: str(80), location: str(120),
  warranty: { type: String, trim: true, default: '', match: [/^(\d{4}-\d{2}-\d{2})?$/, 'Warranty date must be YYYY-MM-DD'] },
  status: { type: String, enum: ['Healthy', 'Warning', 'Critical', 'Retired'], default: 'Healthy' },
  notes: str(1000),
}, { timestamps: true, versionKey: false });
assetSchema.set('toJSON', toJSON);

const licenceSchema = new Schema({
  client: clientRef,
  name: req(160, 'Licence name'),
  vendor: str(80),
  qty: { type: Number, min: [1, 'Quantity must be at least 1'], default: 1 },
  renew: ymd('Renewal date'),
  notes: str(1000),
}, { timestamps: true, versionKey: false });
licenceSchema.set('toJSON', toJSON);

const documentSchema = new Schema({
  client: clientRef,
  title: req(200, 'Title'),
  category: { type: String, enum: ['SLA report', 'Invoice', 'QBR', 'Documentation', 'Policy', 'Other'], default: 'Other' },
  file: {
    fileId: { type: Schema.Types.ObjectId, required: true },
    filename: str(200), size: { type: Number, default: 0 }, contentType: str(120),
  },
  visible: { type: Boolean, default: true },
}, { timestamps: true, versionKey: false });
documentSchema.set('toJSON', toJSON);

export const Client = mongoose.models.Client || mongoose.model('Client', clientSchema);
export const Asset = mongoose.models.Asset || mongoose.model('Asset', assetSchema);
export const Licence = mongoose.models.Licence || mongoose.model('Licence', licenceSchema);
export const Document = mongoose.models.Document || mongoose.model('Document', documentSchema);

export const DEFAULT_ESCALATION = [
  { level: 'L1', title: 'Service Desk', detail: 'First response for every ticket', contact: 'support@proxinet.in · 9555581330' },
  { level: 'L2', title: 'Practice Engineer', detail: 'Escalated after 30 minutes if L1 cannot resolve it', contact: '' },
  { level: 'L3', title: 'Practice Lead', detail: 'After one hour on a P1, or on customer request', contact: '' },
  { level: 'Mgmt', title: 'Service Delivery Manager', detail: 'After two hours on a P1', contact: '9971120195' },
];

/** Days from today until a YYYY-MM-DD date (negative when past). */
export const daysUntil = (ymdStr) => {
  if (!ymdStr) return null;
  const today = new Date(new Date().toISOString().slice(0, 10));
  return Math.round((new Date(ymdStr) - today) / 86400000);
};
