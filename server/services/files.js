import mongoose from 'mongoose';
import multer from 'multer';
import { Readable } from 'node:stream';
import { HttpError } from '../middleware/index.js';

export const MAX_RESUME_BYTES = 2 * 1024 * 1024;
const ALLOWED = {
  'application/pdf': '.pdf',
  'application/msword': '.doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
};

export const resumeUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_RESUME_BYTES, files: 1 },
  fileFilter: (_req, file, cb) => {
    const okType = ALLOWED[file.mimetype] || /\.(pdf|docx?)$/i.test(file.originalname);
    cb(okType ? null : new HttpError(400, 'Resume must be a PDF, DOC or DOCX file'), Boolean(okType));
  },
}).single('resume');

const bucket = (bucketName = 'resumes') => new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName });

export const MAX_DOC_BYTES = 10 * 1024 * 1024;
const DOC_EXT = /\.(pdf|docx?|xlsx?|csv|pptx?|txt|png|jpe?g|zip)$/i;
export const documentUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_DOC_BYTES, files: 1 },
  fileFilter: (_req, file, cb) => {
    const ok = DOC_EXT.test(file.originalname);
    cb(ok ? null : new HttpError(400, 'Allowed files: PDF, Word, Excel, CSV, PowerPoint, TXT, PNG, JPG, ZIP'), ok);
  },
}).single('file');

/** Stores an uploaded file in MongoDB GridFS (works on serverless — no local disk). */
export function saveFile(file, bucketName = 'resumes') {
  return new Promise((resolve, reject) => {
    const filename = file.originalname.replace(/[^\w.\- ]+/g, '_').slice(0, 180);
    const upload = bucket(bucketName).openUploadStream(filename, { metadata: { contentType: file.mimetype } });
    Readable.from(file.buffer).pipe(upload)
      .on('error', reject)
      .on('finish', () => resolve({ fileId: upload.id, filename, size: file.size, contentType: file.mimetype }));
  });
}

export async function streamFile(fileId, res, bucketName = 'resumes') {
  const id = new mongoose.Types.ObjectId(String(fileId));
  const [meta] = await bucket(bucketName).find({ _id: id }).toArray();
  if (!meta) throw new HttpError(404, 'File not found');
  res.setHeader('Content-Type', meta.metadata?.contentType || 'application/octet-stream');
  res.setHeader('Content-Length', meta.length);
  res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(meta.filename)}"`);
  await new Promise((resolve, reject) => {
    bucket(bucketName).openDownloadStream(id).on('error', reject).on('end', resolve).pipe(res);
  });
}

export async function deleteFile(fileId, bucketName = 'resumes') {
  if (!fileId) return;
  try { await bucket(bucketName).delete(new mongoose.Types.ObjectId(String(fileId))); } catch { /* already gone */ }
}
