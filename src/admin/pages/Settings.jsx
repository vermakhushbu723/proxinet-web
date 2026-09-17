import React, { useState } from 'react';
import { Alert, Badge, Button, Descriptions, Form, Input, Popconfirm, message } from 'antd';
import { ReloadOutlined, DeleteOutlined, DownloadOutlined, ExperimentOutlined, LockOutlined } from '@ant-design/icons';
import { useApi, getStats, getHealth, resetDemoData, clearAllData, downloadBackup } from '../api/store';
import { submitForm } from '../../api/public';
import { collections, collectionKeys } from '../config/collections';
import { getSession, changePassword } from '../api/auth';
import Panel, { PageHeader } from '../components/Panel';

const fail = (err) => message.error(err?.message || 'Action failed');

export default function Settings() {
  const session = getSession();
  const { data: stats } = useApi(getStats);
  const { data: health, error: healthError, reload: recheck } = useApi(getHealth, [], { poll: 30000 });
  const [busy, setBusy] = useState('');
  const [pwForm] = Form.useForm();

  const run = async (key, fn, ok) => {
    setBusy(key);
    try {
      await fn();
      if (ok) message.success(ok);
    } catch (err) {
      fail(err);
    } finally {
      setBusy('');
    }
  };

  const testLead = () => run('test', () => submitForm('leads', {
    intent: 'Managed IT / AMC', size: '26–100 users', timeline: 'Within 1 month',
    name: 'Test Visitor', company: 'Sample Company', email: 'test@example.com', phone: '9800000000',
    message: 'Created from admin Settings to test the live inbox.',
  }), 'Test lead created — it will appear in Leads and the bell within a few seconds');

  const savePassword = async ({ currentPassword, newPassword }) => {
    setBusy('pw');
    try {
      await changePassword(currentPassword, newPassword);
      pwForm.resetFields();
      message.success('Password updated');
    } catch (err) {
      if (err.status === 401) pwForm.setFields([{ name: 'currentPassword', errors: [err.message] }]);
      else fail(err);
    } finally {
      setBusy('');
    }
  };

  const connected = health?.ok && health?.db === 'connected';

  return (
    <>
      <PageHeader title="Settings" sub="Account, data management and system status" />

      <div className="grid gap-4 xl:grid-cols-2">
        <Panel title="Account">
          <Descriptions
            column={1} size="small" labelStyle={{ width: 120 }}
            items={[
              { key: 'n', label: 'Name', children: session?.name || 'Admin' },
              { key: 'e', label: 'Email', children: session?.email },
              { key: 'r', label: 'Role', children: 'Administrator' },
            ]}
          />
        </Panel>

        <Panel title="System status" extra={<Button size="small" onClick={recheck}>Check</Button>}>
          <Descriptions
            column={1} size="small" labelStyle={{ width: 120 }}
            items={[
              { key: 'api', label: 'API', children: healthError ? <Badge status="error" text={healthError.message} /> : <Badge status={health ? 'success' : 'processing'} text={health ? 'Online' : 'Checking…'} /> },
              { key: 'db', label: 'MongoDB', children: <Badge status={connected ? 'success' : health ? 'error' : 'processing'} text={health ? health.db : 'Checking…'} /> },
              { key: 't', label: 'Server time', children: health ? new Date(health.time).toLocaleString('en-IN') : '—' },
            ]}
          />
        </Panel>

        <Panel title="Change password">
          <Form form={pwForm} layout="vertical" requiredMark={false} onFinish={savePassword} className="max-w-sm">
            <Form.Item name="currentPassword" label="Current password" rules={[{ required: true, message: 'Enter your current password' }]}>
              <Input.Password prefix={<LockOutlined className="text-slate-400" />} autoComplete="current-password" />
            </Form.Item>
            <Form.Item name="newPassword" label="New password" rules={[{ required: true, min: 8, message: 'At least 8 characters' }]}>
              <Input.Password prefix={<LockOutlined className="text-slate-400" />} autoComplete="new-password" />
            </Form.Item>
            <Form.Item
              name="confirm" label="Confirm new password" dependencies={['newPassword']}
              rules={[{ required: true, message: 'Confirm the new password' }, ({ getFieldValue }) => ({
                validator: (_, v) => (!v || v === getFieldValue('newPassword') ? Promise.resolve() : Promise.reject(new Error('Passwords do not match'))),
              })]}
            >
              <Input.Password prefix={<LockOutlined className="text-slate-400" />} autoComplete="new-password" />
            </Form.Item>
            <Button type="primary" htmlType="submit" loading={busy === 'pw'}>Update password</Button>
          </Form>
        </Panel>

        <Panel title="Records per form">
          <Descriptions
            column={1} size="small" labelStyle={{ width: 220 }}
            items={collectionKeys.map((k) => ({
              key: k, label: collections[k].formName,
              children: stats ? `${stats.byForm[k]?.total ?? 0} records · ${stats.byForm[k]?.unread ?? 0} unread` : '…',
            }))}
          />
        </Panel>

        <Panel title="Data management" className="xl:col-span-2">
          <div className="flex flex-wrap gap-2">
            <Button icon={<ExperimentOutlined />} loading={busy === 'test'} onClick={testLead}>Create a test lead</Button>
            <Button icon={<DownloadOutlined />} loading={busy === 'backup'} onClick={() => run('backup', downloadBackup)}>Download backup (JSON)</Button>
            <Popconfirm
              title="Replace ALL records with demo data?" description="Every current submission is deleted first."
              okText="Reset" okButtonProps={{ danger: true }}
              onConfirm={() => run('demo', resetDemoData, 'Demo data loaded')}
            >
              <Button icon={<ReloadOutlined />} loading={busy === 'demo'}>Reset to demo data</Button>
            </Popconfirm>
            <Popconfirm
              title="Delete every record in every form?" description="This cannot be undone — download a backup first."
              okText="Delete all" okButtonProps={{ danger: true }}
              onConfirm={() => run('clear', clearAllData, 'All records cleared')}
            >
              <Button danger icon={<DeleteOutlined />} loading={busy === 'clear'}>Clear all data</Button>
            </Popconfirm>
          </div>
          <Alert
            className="!mt-3" type="info" showIcon
            message="Data is stored in MongoDB"
            description="Website forms post to /api and every record here is read live from the database. Reset and clear affect all admins."
          />
        </Panel>
      </div>
    </>
  );
}
