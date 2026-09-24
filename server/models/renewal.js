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
  priceBasis: { type: String, enum: ['Total', 'Per unit'], default: 'Total' },
  plusGst: { type: Boolean, default: true },
  status: { type: String, enum: RENEWAL_STATUSES, default: 'Active', index: true },
  renewedTo: { type: Schema.Types.ObjectId, ref: 'Renewal', default: null },
  renewedFrom: { type: Schema.Types.ObjectId, ref: 'Renewal', default: null },
  lastRemindedOn: str(10),
  notes: { type: [noteSchema], default: [] },
}, { timestamps: true, versionKey: false });

renewalSchema.index({ endDate: 1 });
renewalSchema.pre('validate', function checkTerm() {
  if (this.startDate && this.endDate && this.startDate > this.endDate) this.invalidate('endDate', 'End date must be after the start date');
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
