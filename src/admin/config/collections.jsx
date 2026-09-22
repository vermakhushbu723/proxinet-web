import React from 'react';
import { Tag } from 'antd';
import {
  UserAddOutlined, CalendarOutlined, CustomerServiceOutlined, MessageOutlined,
  DownloadOutlined, CalculatorOutlined, MailOutlined, IdcardOutlined, FileProtectOutlined,
} from '@ant-design/icons';

/**
 * One entry per website form. Drives the sidebar, list pages, detail drawer,
 * filters and CSV export — add a form here and it gets a full admin screen.
 *
 * fields: [key, label, type?]  type = 'email' | 'phone' | 'long' | 'file'
 */
export const collections = {
  leads: {
    title: 'Leads & Enquiries', nav: 'Leads', singular: 'lead', path: '/admin/leads', group: 'Inbox',
    icon: <UserAddOutlined />, formName: 'Lead form (Home, Contact)',
    statuses: { New: 'blue', Contacted: 'gold', Qualified: 'purple', Proposal: 'cyan', Won: 'green', Lost: 'default' },
    primary: (r) => r.name, secondary: (r) => r.company,
    search: ['name', 'company', 'email', 'phone', 'intent', 'message'],
    filter: { key: 'intent', label: 'Interest' },
    columns: [
      { title: 'Interest', dataIndex: 'intent' },
      { title: 'Size', dataIndex: 'size', responsive: ['lg'] },
      { title: 'Timeline', dataIndex: 'timeline', responsive: ['xl'] },
    ],
    fields: [['name', 'Name'], ['company', 'Company'], ['email', 'Email', 'email'], ['phone', 'Phone', 'phone'],
      ['intent', 'Interested in'], ['size', 'Company size'], ['timeline', 'Timeline'], ['message', 'Message', 'long']],
  },

  assessments: {
    title: 'Assessment Bookings', nav: 'Assessments', singular: 'booking', path: '/admin/assessments', group: 'Inbox',
    icon: <CalendarOutlined />, formName: 'Book free assessment',
    statuses: { Requested: 'blue', Confirmed: 'purple', Completed: 'green', Cancelled: 'default' },
    primary: (r) => r.name, secondary: (r) => r.company,
    search: ['code', 'name', 'company', 'email', 'phone', 'focus', 'context'],
    filter: { key: 'focus', label: 'Focus area' },
    columns: [
      { title: 'Focus', dataIndex: 'focus' },
      {
        title: 'Slot', dataIndex: 'date',
        render: (_, r) => (r.date ? <span className="whitespace-nowrap">{new Date(r.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} · {r.time}</span> : '—'),
        sorter: (a, b) => (a.date || '').localeCompare(b.date || ''),
      },
      { title: 'Mode', dataIndex: 'mode', responsive: ['lg'], render: (v) => <span className="capitalize">{v}</span> },
    ],
    fields: [['name', 'Name'], ['company', 'Company'], ['email', 'Email', 'email'], ['phone', 'Phone', 'phone'],
      ['focus', 'Focus area'], ['date', 'Preferred date'], ['time', 'Preferred time'], ['mode', 'Meeting mode'], ['context', 'Context', 'long']],
  },

  tickets: {
    title: 'Support Tickets', nav: 'Tickets', singular: 'ticket', path: '/admin/tickets', group: 'Inbox',
    icon: <CustomerServiceOutlined />, formName: 'Client portal tickets',
    statuses: { Open: 'red', 'In progress': 'gold', Resolved: 'green', Closed: 'default' },
    primary: (r) => r.subject, secondary: (r) => r.client,
    search: ['subject', 'client', 'desc', 'cat'],
    filter: { key: 'pri', label: 'Priority' },
    columns: [
      { title: 'Priority', dataIndex: 'pri', render: (v) => <Tag color={{ P1: 'red', P2: 'orange', P3: 'gold', P4: 'default' }[v]}>{v}</Tag> },
      { title: 'Category', dataIndex: 'cat', responsive: ['lg'] },
    ],
    fields: [['subject', 'Subject'], ['client', 'Client'], ['pri', 'Priority'], ['cat', 'Category'], ['owner', 'Assigned to'], ['desc', 'Description', 'long']],
    thread: true,
  },

  chats: {
    title: 'Chat Conversations', nav: 'Chats', singular: 'conversation', path: '/admin/chats', group: 'Inbox',
    icon: <MessageOutlined />, formName: 'Website chat assistant',
    statuses: { Open: 'blue', Handled: 'green' },
    primary: (r) => r.firstMessage, secondary: (r) => `${r.messages?.length || 0} messages`,
    search: ['firstMessage'],
    columns: [{ title: 'Last activity', dataIndex: 'updatedAt', responsive: ['lg'], render: (v) => new Date(v).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }) }],
    fields: [],
    chat: true,
  },

  downloads: {
    title: 'Whitepaper Downloads', nav: 'Downloads', singular: 'download', path: '/admin/downloads', group: 'Marketing',
    icon: <DownloadOutlined />, formName: 'Gated whitepaper download',
    statuses: { New: 'blue', 'Followed up': 'green' },
    primary: (r) => r.name, secondary: (r) => r.company || r.email,
    search: ['name', 'email', 'company', 'asset'],
    filter: { key: 'asset', label: 'Whitepaper' },
    columns: [{ title: 'Whitepaper', dataIndex: 'asset' }],
    fields: [['name', 'Name'], ['email', 'Email', 'email'], ['company', 'Company'], ['asset', 'Whitepaper']],
  },

  toolReports: {
    title: 'Tool Report Requests', nav: 'Tool reports', singular: 'request', path: '/admin/tool-reports', group: 'Marketing',
    icon: <CalculatorOutlined />, formName: 'Tools — email me the result',
    statuses: { New: 'blue', 'Followed up': 'green' },
    primary: (r) => r.email, secondary: (r) => r.tool,
    search: ['email', 'tool'],
    filter: { key: 'tool', label: 'Tool' },
    columns: [{ title: 'Tool', dataIndex: 'tool' }],
    fields: [['email', 'Email', 'email'], ['tool', 'Tool']],
  },

  subscribers: {
    title: 'Newsletter Subscribers', nav: 'Subscribers', singular: 'subscriber', path: '/admin/subscribers', group: 'Marketing',
    icon: <MailOutlined />, formName: 'Footer newsletter',
    statuses: { Active: 'green', Unsubscribed: 'default' },
    primary: (r) => r.email, secondary: (r) => `Signed up on ${r.source || '/'}`,
    search: ['email'],
    columns: [],
    fields: [['email', 'Email', 'email']],
  },

  applications: {
    title: 'Job Applications', nav: 'Applications', singular: 'application', path: '/admin/applications', group: 'Company',
    icon: <IdcardOutlined />, formName: 'Careers — apply',
    statuses: { New: 'blue', Shortlisted: 'purple', Interview: 'gold', Offered: 'green', Rejected: 'default' },
    primary: (r) => r.name, secondary: (r) => r.roleTitle,
    search: ['name', 'email', 'phone', 'roleTitle', 'message'],
    filter: { key: 'roleTitle', label: 'Role' },
    columns: [{ title: 'Resume', dataIndex: 'resume', responsive: ['lg'], render: (v) => v?.filename || '—' }],
    fields: [['name', 'Name'], ['email', 'Email', 'email'], ['phone', 'Phone', 'phone'], ['roleTitle', 'Applying for'],
      ['resume', 'Resume', 'file'], ['message', 'Cover note', 'long']],
  },

  procurement: {
    title: 'Procurement Requests', nav: 'Procurement', singular: 'request', path: '/admin/procurement', group: 'Company',
    icon: <FileProtectOutlined />, formName: 'Vendor onboarding pack',
    statuses: { New: 'blue', Sent: 'purple', Closed: 'default' },
    primary: (r) => r.name, secondary: (r) => r.company,
    search: ['name', 'company', 'email', 'purpose'],
    filter: { key: 'purpose', label: 'Purpose' },
    columns: [{ title: 'Purpose', dataIndex: 'purpose' }],
    fields: [['name', 'Name'], ['company', 'Company'], ['email', 'Email', 'email'], ['purpose', 'Purpose']],
  },
};

export const collectionKeys = Object.keys(collections);
export const navGroups = ['Inbox', 'Marketing', 'Company'];
