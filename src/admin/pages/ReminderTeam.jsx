// Company employees who receive renewal reminders (email + SMS/WhatsApp).
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Alert, Button, Drawer, Empty, Form, Input, Modal, Popconfirm, Switch, Table, Tag, Tooltip, message,
} from 'antd';
import {
  PlusOutlined, ReloadOutlined, EditOutlined, DeleteOutlined, SendOutlined, MailOutlined, MobileOutlined,
} from '@ant-design/icons';
import {
  useApi, listTeam, createTeamMember, updateTeamMember, deleteTeamMember, testTeamMember,
} from '../api/store';
import Panel, { PageHeader } from '../components/Panel';

const fail = (err) => message.error(err?.message || 'Action failed');

export function ChannelStatus({ channels }) {
  if (!channels) return null;
  const ok = channels.email && channels.sms;
  return (
    <Alert
      className="!mb-4" showIcon type={ok ? 'success' : 'warning'}
      message={(
        <span className="flex flex-wrap gap-x-5 gap-y-1">
          <span><MailOutlined /> Email: {channels.email ? <b>ready</b> : <b>not set up</b>}</span>
          <span><MobileOutlined /> SMS / WhatsApp: {channels.sms ? <b>{channels.smsProvider}</b> : <b>not set up</b>}</span>
          {channels.adminEmail && <span>Admin copy: {channels.adminEmail}</span>}
        </span>
      )}
      description={ok ? null : 'Reminders still show in the admin panel. To deliver them to email / mobile, add SMTP_* (email) and SMS_PROVIDER + its key (Fast2SMS, Twilio SMS/WhatsApp or a webhook) in the server .env — see .env.example.'}
    />
  );
}

export default function ReminderTeam() {
  const { data, loading, error, reload } = useApi(listTeam);
  const [editing, setEditing] = useState(null);
  const [busy, setBusy] = useState(false);
  const [testing, setTesting] = useState(null);
  const [form] = Form.useForm();
  const rows = data?.items || [];

  const open = (m) => {
    setEditing(m || {});
    setTimeout(() => { form.resetFields(); form.setFieldsValue(m || { notifyEmail: true, notifySms: true, active: true }); }, 0);
  };

  const save = async (v) => {
    setBusy(true);
    try {
      if (editing?.id) await updateTeamMember(editing.id, v);
      else await createTeamMember(v);
      message.success('Team member saved');
      setEditing(null);
    } catch (err) {
      if (err.fields) form.setFields(Object.entries(err.fields).map(([name, e]) => ({ name, errors: [e] })));
      fail(err);
    } finally { setBusy(false); }
  };

  const patch = (m, body) => updateTeamMember(m.id, body).catch(fail);

  const test = async (m) => {
    setTesting(m.id);
    try {
      const { results } = await testTeamMember(m.id);
      Modal.info({
        title: `Test message to ${m.name}`,
        content: (
          <ul className="m-0 ps-4">
            {results.map((r) => (
              <li key={r.channel}>
                {r.channel === 'email' ? 'Email' : 'SMS'} → {r.to}: <Tag color={{ sent: 'green', failed: 'red', skipped: 'default' }[r.status]}>{r.status}</Tag>
                {r.error && <span className="text-slate-500">{r.error}</span>}
              </li>
            ))}
          </ul>
        ),
      });
    } catch (e) { fail(e); } finally { setTesting(null); }
  };

  return (
    <>
      <PageHeader
        title="Reminder team"
        sub="Employees who get renewal reminders on their email and mobile, so they can contact the customer before the plan expires"
        extra={(
          <>
            <Tooltip title="Refresh"><Button icon={<ReloadOutlined />} onClick={reload} /></Tooltip>
            <Link to="/admin/renewal-schedule"><Button>Reminder schedule</Button></Link>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => open(null)}>Add member</Button>
          </>
        )}
      />
      {error && <Alert className="!mb-3" type="error" showIcon message={error.message} />}
      <ChannelStatus channels={data?.channels} />

      <Panel bodyClass="p-0">
        <Table
          rowKey="id" size="small" loading={loading} dataSource={rows} scroll={{ x: 900 }} pagination={false}
          locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No team members yet — add the people who follow up renewals" /> }}
          columns={[
            {
              title: 'Name', dataIndex: 'name',
              render: (v, m) => <span><span className="block font-medium text-slate-900 dark:text-white">{v}</span><span className="block text-[11.5px] text-slate-500">{m.designation}</span></span>,
            },
            { title: 'Mobile', dataIndex: 'phone', width: 150, render: (v) => v || '—' },
            { title: 'Email', dataIndex: 'email', width: 220, render: (v) => v || '—' },
            {
              title: 'Email reminders', dataIndex: 'notifyEmail', width: 120,
              render: (v, m) => <Switch size="small" checked={v} disabled={!m.email} onChange={(on) => patch(m, { notifyEmail: on })} />,
            },
            {
              title: 'SMS reminders', dataIndex: 'notifySms', width: 115,
              render: (v, m) => <Switch size="small" checked={v} disabled={!m.phone} onChange={(on) => patch(m, { notifySms: on })} />,
            },
            {
              title: 'Assigned', dataIndex: 'assigned', width: 95,
              render: (v) => <Tooltip title="Open renewals assigned to this person (unassigned renewals go to everyone)">{v || 'All'}</Tooltip>,
            },
            { title: 'Active', dataIndex: 'active', width: 80, render: (v, m) => <Switch size="small" checked={v} onChange={(on) => patch(m, { active: on })} /> },
            {
              key: 'a', width: 120, fixed: 'right',
              render: (_, m) => (
                <span className="flex gap-1">
                  <Tooltip title="Send a test email / SMS"><Button size="small" type="text" icon={<SendOutlined />} loading={testing === m.id} onClick={() => test(m)} aria-label="Send test" /></Tooltip>
                  <Button size="small" type="text" icon={<EditOutlined />} onClick={() => open(m)} aria-label="Edit" />
                  <Popconfirm title={`Remove ${m.name}?`} description="They stop getting reminders." okText="Remove" okButtonProps={{ danger: true }} onConfirm={() => deleteTeamMember(m.id).then(() => message.success('Removed'), fail)}>
                    <Button size="small" type="text" danger icon={<DeleteOutlined />} aria-label="Delete" />
                  </Popconfirm>
                </span>
              ),
            },
          ]}
        />
      </Panel>

      <Drawer
        open={editing !== null} onClose={() => setEditing(null)} width={440} destroyOnClose rootClassName="px-admin-drawer"
        styles={{ header: { padding: '12px 20px' } }} title={editing?.id ? `Edit ${editing.name}` : 'New team member'}
        extra={<Button type="primary" loading={busy} onClick={() => form.submit()}>Save</Button>}
      >
        <Form form={form} layout="vertical" requiredMark={false} onFinish={save}>
          <Form.Item name="name" label="Employee name" rules={[{ required: true, message: 'Name is required' }]}><Input placeholder="Rahul Sharma" /></Form.Item>
          <Form.Item name="designation" label="Designation"><Input placeholder="Account Manager" /></Form.Item>
          <Form.Item
            name="phone" label="Mobile number"
            rules={[{ pattern: /^(\+?[0-9][0-9\s-]{7,16})?$/, message: 'Enter a valid mobile number' }]}
          >
            <Input placeholder="98xxxxxxxx" />
          </Form.Item>
          <Form.Item
            name="email" label="Email" dependencies={['phone']}
            rules={[
              { type: 'email', message: 'Enter a valid email' },
              ({ getFieldValue }) => ({ validator: (_, v) => (v || getFieldValue('phone') ? Promise.resolve() : Promise.reject(new Error('Add a mobile number or an email'))) }),
            ]}
          >
            <Input placeholder="rahul@proxinet.in" />
          </Form.Item>
          <div className="grid grid-cols-3 gap-3">
            <Form.Item name="notifyEmail" label="Email" valuePropName="checked"><Switch /></Form.Item>
            <Form.Item name="notifySms" label="SMS" valuePropName="checked"><Switch /></Form.Item>
            <Form.Item name="active" label="Active" valuePropName="checked"><Switch /></Form.Item>
          </div>
        </Form>
      </Drawer>
    </>
  );
}
