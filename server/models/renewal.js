// Customer product/subscription renewals — what was sold, its term, and the renewal follow-up.
import mongoose from 'mongoose';
import { str, req, nextCode } from './helpers.js';

const { Schema } = mongoose;

const ymd = (label, required = true) => ({
  type: String, trim: true,
  ...(required ? { required: [true, `${label} is required`] } : { default: '' }),
  match: [/^(\d{4}-\d{2}-\d{2})?$/, `${label} must be YYYY-MM-DD`],
});
const money = { type: Number, min: [0, 'Price cannot be negative'], default: null };

export const RENEWAL_STATUSES = ['Active', 'Contacted', 'Renewed', 'Not renewing'];
/** Statuses that close the follow-up — no more reminders. */
export const CLOSED_STATUSES = ['Renewed', 'Not renewing'];

const noteSchema = new Schema(
  { text: { type: String, trim: true, required: true, maxlength: 2000 }, by: { type: String, default: 'Admin' }, at: { type: Date, default: Date.now } },
  { _id: false },
);

const renewalSchema = new Schema({
  code: { type: String, index: true },
  customer: req(160, 'Customer name'),
  contactName: str(120),
  email: str(160),
  phone: str(40),
  description: req(300, 'Description'),
  serialNo: str(120),
  qty: { type: Number, min: [1, 'Quantity must be at least 1'], default: 1 },
  poNo: str(80),
  invoiceNo: str(80),
  startDate: ymd('Start date', false),
  endDate: ymd('End date'),
  salePrice: money,
  purchasePrice: money,
  vendor: str(160),
  priceBasis: { type: String, enum: ['Total', 'Per unit'], default: 'Total' },
  plusGst: { type: Boolean, default: true },
  status: { type: String, enum: RENEWAL_STATUSES, default: 'Active', index: true },
  renewedTo: { type: Schema.Types.ObjectId, ref: 'Renewal', default: null },
  renewedFrom: { type: Schema.Types.ObjectId, ref: 'Renewal', default: null },
  // reminder rule for this renewal: 'default' follows Reminder schedule settings
  reminder: {
    mode: { type: String, enum: ['default', 'days', 'dates'], default: 'default' },
    days: { type: [{ type: Number, min: 0, max: 365 }], default: [] },
    dates: { type: [{ type: String, match: [/^\d{4}-\d{2}-\d{2}$/, 'Reminder dates must be YYYY-MM-DD'] }], default: [] },
  },
  // team members to notify; empty = every active member
  notify: { type: [{ type: Schema.Types.ObjectId, ref: 'TeamMember' }], default: [] },
  lastRemindedOn: str(10),
  notes: { type: [noteSchema], default: [] },
}, { timestamps: true, versionKey: false });

renewalSchema.index({ endDate: 1 });
renewalSchema.pre('validate', function checkTerm() {
  if (this.startDate && this.endDate && this.startDate > this.endDate) this.invalidate('endDate', 'End date must be after the start date');
  const rem = this.reminder || {};
  rem.days = [...new Set((rem.days || []).map(Number))].sort((a, b) => b - a);
  rem.dates = [...new Set(rem.dates || [])].sort();
  if (rem.mode === 'days' && !rem.days.length) this.invalidate('reminder.days', 'Add at least one "days before expiry" value');
  if (rem.mode === 'dates' && !rem.dates.length) this.invalidate('reminder.dates', 'Pick at least one reminder date');
});
renewalSchema.pre('save', async function assignCode() {
  if (!this.code) this.code = await nextCode('renewals', 'RN');
});
renewalSchema.set('toJSON', {
  transform: (_d, ret) => {
    ret.id = String(ret._id);
    delete ret._id;
    return ret;
  },
});

export const Renewal = mongoose.models.Renewal || mongoose.model('Renewal', renewalSchema);

/** Once-per-day markers for the reminder email, e.g. { _id: 'renewals:2026-10-01' }. */
export const ReminderLog = mongoose.models.ReminderLog || mongoose.model('ReminderLog', new Schema(
  { _id: String, sentAt: Date, count: Number, to: String },
  { versionKey: false },
));

/** Company employees who receive renewal reminders by email and SMS/WhatsApp. */
const memberSchema = new Schema({
  name: req(120, 'Name'),
  designation: str(120),
  phone: {
    type: String, trim: true, default: '',
    match: [/^(\+?[0-9][0-9\s-]{7,16})?$/, 'Enter a valid mobile number'],
  },
  email: { type: String, trim: true, lowercase: true, default: '', match: [/^([^\s@]+@[^\s@]+\.[^\s@]{2,})?$/, 'Enter a valid email address'] },
  notifyEmail: { type: Boolean, default: true },
  notifySms: { type: Boolean, default: true },
  active: { type: Boolean, default: true },
}, { timestamps: true, versionKey: false });
memberSchema.pre('validate', function needContact() {
  if (!this.phone && !this.email) this.invalidate('email', 'Add a mobile number or an email');
});
memberSchema.set('toJSON', { transform: (_d, ret) => { ret.id = String(ret._id); delete ret._id; return ret; } });
export const TeamMember = mongoose.models.TeamMember || mongoose.model('TeamMember', memberSchema);

/** Single settings document for the reminder schedule (_id: 'renewals'). */
export const RenewalSettings = mongoose.models.RenewalSettings || mongoose.model('RenewalSettings', new Schema({
  _id: { type: String, default: 'renewals' },
  mode: { type: String, enum: ['daily', 'days'], default: 'daily' }, // daily from N days before | only on chosen days
  windowDays: { type: Number, min: 0, max: 365, default: 5 },
  days: { type: [{ type: Number, min: 0, max: 365 }], default: [30, 15, 7, 3, 1, 0] },
  afterExpiry: { type: Boolean, default: true }, // keep reminding daily after expiry until closed
  sendTime: { type: String, default: '09:00', match: [/^([01]\d|2[0-3]):[0-5]\d$/,'Time must be HH:mm'] },
  emailOn: { type: Boolean, default: true },
  smsOn: { type: Boolean, default: true },
  notifyAdmin: { type: Boolean, default: true },
}, { versionKey: false, timestamps: true }));

/** Every email / SMS the reminder job tried to send. */
export const NotificationLog = mongoose.models.NotificationLog || mongoose.model('NotificationLog', new Schema({
  day: String,
  channel: { type: String, enum: ['email', 'sms'] },
  to: String,
  name: String,
  count: Number,
  customers: [String],
  status: { type: String, enum: ['sent', 'failed', 'skipped'] },
  error: String,
  kind: { type: String, default: 'reminder' }, // reminder | test
}, { versionKey: false, timestamps: { createdAt: true, updatedAt: false } }).index({ createdAt: -1 }));
