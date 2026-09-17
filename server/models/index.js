import mongoose from 'mongoose';
import { submissionModel, str, req, email, phone } from './helpers.js';

const { Schema } = mongoose;

export const Lead = submissionModel({
  name: 'Lead', key: 'leads', prefix: 'LD',
  statuses: ['New', 'Contacted', 'Qualified', 'Proposal', 'Won', 'Lost'],
  fields: {
    intent: str(80), size: str(40), timeline: str(40),
    name: req(120, 'Name'), company: req(160, 'Company'), email: email('Work email'), phone: phone(),
    message: str(3000),
  },
});

export const Assessment = submissionModel({
  name: 'Assessment', key: 'assessments', prefix: 'AS',
  statuses: ['Requested', 'Confirmed', 'Completed', 'Cancelled'],
  fields: {
    name: req(120, 'Name'), company: req(160, 'Company'), email: email('Work email'), phone: phone(),
    focus: req(80, 'Focus area'),
    date: req(10, 'Preferred date', { match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'] }),
    time: req(5, 'Preferred time', { match: [/^\d{2}:\d{2}$/, 'Time must be HH:mm'] }),
    mode: str(20, { default: 'video' }), context: str(3000),
  },
  indexes: [[{ date: 1 }]],
});

export const Ticket = submissionModel({
  name: 'Ticket', key: 'tickets', prefix: 'TK',
  statuses: ['Open', 'In progress', 'Resolved', 'Closed'],
  fields: {
    subject: req(200, 'Subject'),
    pri: { type: String, enum: ['P1', 'P2', 'P3', 'P4'], default: 'P3' },
    cat: str(40, { default: 'Other' }), desc: req(5000, 'Description'), client: str(160),
  },
});

const chatMessage = new Schema(
  { from: { type: String, enum: ['me', 'bot', 'agent'], required: true }, text: { type: String, trim: true, required: true, maxlength: 2000 }, at: { type: Date, default: Date.now } },
  { _id: false },
);

export const Chat = submissionModel({
  name: 'Chat', key: 'chats', prefix: 'CH',
  statuses: ['Open', 'Handled'],
  fields: {
    firstMessage: req(2000, 'Message'),
    messages: { type: [chatMessage], default: [], validate: [(v) => v.length <= 200, 'Conversation is too long'] },
  },
});

export const Download = submissionModel({
  name: 'Download', key: 'downloads', prefix: 'DL',
  statuses: ['New', 'Followed up'],
  fields: { name: req(120, 'Name'), email: email('Work email'), company: str(160), asset: req(200, 'Whitepaper') },
});

export const ToolReport = submissionModel({
  name: 'ToolReport', key: 'toolReports', prefix: 'TR',
  statuses: ['New', 'Followed up'],
  fields: { email: email(), tool: req(120, 'Tool') },
});

export const Subscriber = submissionModel({
  name: 'Subscriber', key: 'subscribers', prefix: 'SB',
  statuses: ['Active', 'Unsubscribed'],
  fields: { email: { ...email(), unique: true } },
});

export const Application = submissionModel({
  name: 'Application', key: 'applications', prefix: 'AP',
  statuses: ['New', 'Shortlisted', 'Interview', 'Offered', 'Rejected'],
  fields: {
    name: req(120, 'Name'), email: email(), phone: phone(),
    role: req(80, 'Role'), roleTitle: str(160),
    resume: {
      fileId: { type: Schema.Types.ObjectId, default: null },
      filename: str(200), size: { type: Number, default: 0 }, contentType: str(120),
    },
    message: str(3000),
  },
});

export const Procurement = submissionModel({
  name: 'Procurement', key: 'procurement', prefix: 'PR',
  statuses: ['New', 'Sent', 'Closed'],
  fields: {
    name: req(120, 'Name'), company: req(160, 'Company'), email: email('Work email'),
    purpose: str(80, { default: 'Vendor registration' }),
  },
});

export const Admin = mongoose.models.Admin || mongoose.model('Admin', new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, default: 'Admin' },
    passwordHash: { type: String, required: true },
    lastLoginAt: Date,
  },
  { timestamps: true, versionKey: false },
));
