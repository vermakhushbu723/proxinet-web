import mongoose from 'mongoose';
import { collections, collectionKeys } from '../collections.js';
import { seedData } from './demoData.js';

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
  return counts;
}
