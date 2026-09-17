import {
  Lead, Assessment, Ticket, Chat, Download, ToolReport, Subscriber, Application, Procurement,
} from './models/index.js';

/**
 * Registry of every website form.
 *  - publicFields: the only keys a website visitor may set (everything else is ignored)
 *  - search:       fields matched by the admin search box
 *  - filter:       field the admin list can be filtered on
 */
export const collections = {
  leads: {
    model: Lead, route: 'leads',
    publicFields: ['intent', 'size', 'timeline', 'name', 'company', 'email', 'phone', 'message'],
    search: ['code', 'name', 'company', 'email', 'phone', 'intent', 'message'], filter: 'intent',
    label: (r) => r.name,
  },
  assessments: {
    model: Assessment, route: 'assessments',
    publicFields: ['name', 'company', 'email', 'phone', 'focus', 'date', 'time', 'mode', 'context'],
    search: ['code', 'name', 'company', 'email', 'phone', 'focus', 'context'], filter: 'focus',
    label: (r) => r.name,
  },
  tickets: {
    model: Ticket, route: 'tickets',
    publicFields: ['subject', 'pri', 'cat', 'desc', 'client'],
    search: ['code', 'subject', 'client', 'desc', 'cat'], filter: 'pri',
    label: (r) => r.subject,
  },
  chats: {
    model: Chat, route: 'chats',
    publicFields: [],
    search: ['code', 'firstMessage'], filter: null,
    label: (r) => r.firstMessage,
  },
  downloads: {
    model: Download, route: 'downloads',
    publicFields: ['name', 'email', 'company', 'asset'],
    search: ['code', 'name', 'email', 'company', 'asset'], filter: 'asset',
    label: (r) => r.name,
  },
  toolReports: {
    model: ToolReport, route: 'tool-reports',
    publicFields: ['email', 'tool'],
    search: ['code', 'email', 'tool'], filter: 'tool',
    label: (r) => r.email,
  },
  subscribers: {
    model: Subscriber, route: 'subscribers',
    publicFields: ['email'],
    search: ['code', 'email'], filter: null,
    label: (r) => r.email,
  },
  applications: {
    model: Application, route: 'applications',
    publicFields: ['name', 'email', 'phone', 'role', 'roleTitle', 'message'],
    search: ['code', 'name', 'email', 'phone', 'roleTitle', 'message'], filter: 'roleTitle',
    label: (r) => r.name,
  },
  procurement: {
    model: Procurement, route: 'procurement',
    publicFields: ['name', 'company', 'email', 'purpose'],
    search: ['code', 'name', 'company', 'email', 'purpose'], filter: 'purpose',
    label: (r) => r.name,
  },
};

export const collectionKeys = Object.keys(collections);

export const statusesOf = (key) => collections[key].model.schema.path('status').enumValues;
