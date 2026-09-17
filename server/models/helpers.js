import mongoose from 'mongoose';

const { Schema } = mongoose;

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const str = (max, extra = {}) => ({ type: String, trim: true, maxlength: max, default: '', ...extra });
export const req = (max, label, extra = {}) => ({
  type: String, trim: true, maxlength: [max, `${label} is too long`], required: [true, `${label} is required`], ...extra,
});
export const email = (label = 'Email') => ({
  type: String, trim: true, lowercase: true, maxlength: 160,
  required: [true, `${label} is required`],
  match: [EMAIL_RE, 'Enter a valid email address'],
});
export const phone = () => ({
  type: String, trim: true, required: [true, 'Phone number is required'],
  match: [/^[0-9+\-\s()]{8,18}$/, 'Enter a valid phone number'],
});

const Counter = mongoose.models.Counter || mongoose.model('Counter', new Schema({ _id: String, seq: Number }, { versionKey: false }));

/** Human-friendly sequential reference, e.g. LD-1042. */
export async function nextCode(key, prefix) {
  const c = await Counter.findOneAndUpdate({ _id: key }, { $inc: { seq: 1 } }, { new: true, upsert: true });
  return `${prefix}-${1000 + c.seq}`;
}

const noteSchema = new Schema(
  { text: { type: String, trim: true, required: true, maxlength: 2000 }, by: { type: String, default: 'Admin' }, at: { type: Date, default: Date.now } },
  { _id: false },
);

/**
 * Builds a submission model: the form's own fields plus the workflow fields
 * every admin inbox needs (code, status, read, notes, source).
 */
export function submissionModel({ name, key, prefix, fields, statuses, indexes = [] }) {
  if (mongoose.models[name]) return mongoose.models[name];

  const schema = new Schema(
    {
      code: { type: String, index: true },
      ...fields,
      status: { type: String, enum: statuses, default: statuses[0] },
      read: { type: Boolean, default: false, index: true },
      notes: { type: [noteSchema], default: [] },
      source: str(300),
    },
    { timestamps: true, versionKey: false },
  );

  schema.index({ createdAt: -1 });
  indexes.forEach((i) => schema.index(...i));

  schema.pre('save', async function assignCode() {
    if (!this.code) this.code = await nextCode(key, prefix);
  });

  schema.set('toJSON', {
    transform: (_doc, ret) => {
      ret.id = String(ret._id);
      delete ret._id;
      return ret;
    },
  });

  return mongoose.model(name, schema);
}

/** Same shape as toJSON, for `.lean()` results. */
export const serialize = (doc) => {
  if (!doc) return doc;
  const { _id, ...rest } = doc;
  return { id: String(_id), ...rest };
};
