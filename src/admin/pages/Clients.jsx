import React, { useState } from 'react';
import {
  Alert, Button, Drawer, Form, Input, InputNumber, Modal, Popconfirm, Select, Switch, Table, Tag, Tooltip, Typography, message,
} from 'antd';
import { PlusOutlined, KeyOutlined, DeleteOutlined, EditOutlined, MinusCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import { useApi, listClients, createClient, updateClient, resetClientPassword, deleteClient } from '../api/store';
import Panel, { PageHeader } from '../components/Panel';

const fail = (err) => message.error(err?.message || 'Action failed');
const planColor = { Gold: 'gold', Silver: 'blue', Bronze: 'orange' };

function CredentialsModal({ creds, onClose }) {
  return (
    <Modal open={!!creds} onCancel={onClose} onOk={onClose} cancelButtonProps={{ style: { display: 'none' } }} okText="Done" title="Portal login details" width={420}>
      {creds && (
        <>
          <Alert className="!mb-3" type="warning" showIcon message="Shown only once — copy and share it with the client securely." />
          <div className="space-y-2 rounded-lg bg-slate-50 p-3 text-[13px] dark:bg-white/5">
            <p className="m-0"><span className="text-slate-500">Portal:</span> {window.location.origin}/portal/login</p>
            <p className="m-0"><span className="text-slate-500">Email:</span> <Typography.Text copyable>{creds.email}</Typography.Text></p>
            <p className="m-0"><span className="text-slate-500">Password:</span> <Typography.Text copyable code>{creds.password}</Typography.Text></p>
          </div>
        </>
      )}
    </Modal>
  );
}

function ClientDrawer({ client, open, onClose, onCreated }) {
  const [form] = Form.useForm();
  const [busy, setBusy] = useState(false);
  const isNew = !client;

  const save = async (v) => {
    setBusy(true);
    try {
      if (isNew) {
        const r = await createClient(v);
        onCreated({ email: r.client.email, password: r.password });
        message.success('Client created');
      } else {
        await updateClient(client.id, v);
        message.success('Client updated');
      }
      onClose();
    } catch (err) {
      if (err.fields) form.setFields(Object.entries(err.fields).map(([name, e]) => ({ name: name.split('.'), errors: [e] })));
      fail(err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Drawer
      open={open} onClose={onClose} width={520} destroyOnClose rootClassName="px-admin-drawer"
      styles={{ header: { padding: '12px 20px' } }} title={isNew ? 'New portal client' : `Edit ${client.company}`}
      extra={<Button type="primary" loading={busy} onClick={() => form.submit()}>{isNew ? 'Create client' : 'Save'}</Button>}
    >
      <Form
        form={form} layout="vertical" requiredMark={false} onFinish={save} preserve={false}
        initialValues={client || { plan: 'Silver', coverage: '8×5 business hours', active: true, metrics: { uptime: 99.9, uptimeTarget: 99.5, avgResponseMin: 15, responseTargetMin: 15, slaCompliance: 100 } }}
      >
        <p className="m-0 mb-2 text-[12px] font-semibold text-slate-600 dark:text-slate-300">Account</p>
        <div className="grid gap-x-3 sm:grid-cols-2">
          <Form.Item name="company" label="Company" rules={[{ required: true, message: 'Company is required' }]}><Input /></Form.Item>
          <Form.Item name="contactName" label="Contact person"><Input /></Form.Item>
          <Form.Item name="email" label="Login email" rules={[{ required: true, type: 'email', message: 'Enter a valid email' }]}><Input /></Form.Item>
          <Form.Item name="phone" label="Phone"><Input /></Form.Item>
          <Form.Item name="plan" label="Plan"><Select options={['Gold', 'Silver', 'Bronze'].map((v) => ({ value: v, label: v }))} /></Form.Item>
          <Form.Item name="coverage" label="Coverage"><Input placeholder="24×7×365" /></Form.Item>
          <Form.Item name="accountEngineer" label="Account engineer"><Input /></Form.Item>
          <Form.Item name="active" label="Portal access" valuePropName="checked"><Switch checkedChildren="Active" unCheckedChildren="Off" /></Form.Item>
        </div>
        {isNew && (
          <Form.Item name="password" label="Password (leave empty to generate one)" rules={[{ min: 8, message: 'At least 8 characters' }]}>
            <Input.Password autoComplete="new-password" />
          </Form.Item>
        )}

        <p className="m-0 mb-2 mt-1 text-[12px] font-semibold text-slate-600 dark:text-slate-300">Dashboard metrics (shown on the client overview)</p>
        <div className="grid gap-x-3 sm:grid-cols-3">
          <Form.Item name={['metrics', 'uptime']} label="Uptime %"><InputNumber min={0} max={100} step={0.01} className="!w-full" /></Form.Item>
          <Form.Item name={['metrics', 'uptimeTarget']} label="Uptime target %"><InputNumber min={0} max={100} step={0.1} className="!w-full" /></Form.Item>
          <Form.Item name={['metrics', 'slaCompliance']} label="SLA compliance %"><InputNumber min={0} max={100} className="!w-full" /></Form.Item>
          <Form.Item name={['metrics', 'avgResponseMin']} label="Avg response (min)"><InputNumber min={0} className="!w-full" /></Form.Item>
          <Form.Item name={['metrics', 'responseTargetMin']} label="Response target (min)"><InputNumber min={0} className="!w-full" /></Form.Item>
        </div>

        {!isNew && (
          <>
            <p className="m-0 mb-2 mt-1 text-[12px] font-semibold text-slate-600 dark:text-slate-300">Escalation matrix</p>
            <Form.List name="escalation">
              {(fields, { add, remove }) => (
                <div className="space-y-2">
                  {fields.map(({ key, name }) => (
                    <div key={key} className="rounded-lg border border-slate-200 p-2.5 dark:border-white/10">
                      <div className="grid grid-cols-[70px_1fr_auto] gap-2">
                        <Form.Item name={[name, 'level']} className="!mb-2"><Input placeholder="L1" /></Form.Item>
                        <Form.Item name={[name, 'title']} className="!mb-2" rules={[{ required: true, message: 'Title' }]}><Input placeholder="Service Desk" /></Form.Item>
                        <Button type="text" danger icon={<MinusCircleOutlined />} onClick={() => remove(name)} aria-label="Remove level" />
                      </div>
                      <Form.Item name={[name, 'detail']} className="!mb-2"><Input placeholder="When it applies" /></Form.Item>
                      <Form.Item name={[name, 'contact']} className="!mb-0"><Input placeholder="Phone / email" /></Form.Item>
                    </div>
                  ))}
                  <Button block icon={<PlusOutlined />} onClick={() => add({ level: `L${fields.length + 1}`, title: '' })}>Add level</Button>
                </div>
              )}
            </Form.List>
          </>
        )}
      </Form>
    </Drawer>
  );
}

export default function Clients() {
  const { data, loading, error, reload } = useApi(listClients);
  const [editing, setEditing] = useState(null); // null = closed, {} = new, client = edit
  const [creds, setCreds] = useState(null);
  const rows = data?.items || [];

  const reset = async (c) => {
    try {
      const r = await resetClientPassword(c.id);
      setCreds({ email: r.email, password: r.password });
    } catch (err) {
      fail(err);
    }
  };

  return (
    <>
      <PageHeader
        title="Portal clients"
        sub={`${rows.length} clients · each client signs in at /portal/login and sees only their own data`}
        extra={(
          <>
            <Tooltip title="Refresh"><Button icon={<ReloadOutlined />} onClick={reload} /></Tooltip>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setEditing({})}>New client</Button>
          </>
        )}
      />
      {error && <Alert className="!mb-3" type="error" showIcon message={error.message} />}
      <Panel bodyClass="p-0">
        <Table
          rowKey="id" size="small" loading={loading} dataSource={rows} scroll={{ x: 900 }} pagination={false}
          columns={[
            { title: 'Client', dataIndex: 'company', render: (v, c) => <span><span className="block text-[13px] font-semibold text-slate-800 dark:text-slate-100">{v}</span><span className="block text-[11.5px] text-slate-500">{c.email}</span></span> },
            { title: 'Plan', dataIndex: 'plan', width: 90, render: (v) => <Tag color={planColor[v]} className="!m-0">{v}</Tag> },
            { title: 'Uptime', key: 'u', width: 90, render: (_, c) => `${c.metrics?.uptime}%` },
            { title: 'Open tickets', key: 't', width: 100, render: (_, c) => c.counts.openTickets },
            { title: 'Assets · Licences · Docs', key: 'n', width: 170, render: (_, c) => `${c.counts.assets} · ${c.counts.licences} · ${c.counts.documents}` },
            { title: 'Last login', dataIndex: 'lastLoginAt', width: 130, render: (v) => (v ? new Date(v).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : <span className="text-slate-400">Never</span>) },
            {
              title: 'Access', dataIndex: 'active', width: 90,
              render: (v, c) => <Switch size="small" checked={v} onChange={(on) => updateClient(c.id, { active: on }).then(() => message.success(on ? 'Access enabled' : 'Access disabled'), fail)} />,
            },
            {
              key: 'a', width: 120,
              render: (_, c) => (
                <span className="flex gap-1">
                  <Tooltip title="Edit"><Button size="small" type="text" icon={<EditOutlined />} onClick={() => setEditing(c)} /></Tooltip>
                  <Popconfirm title="Generate a new password?" description="The old password stops working." onConfirm={() => reset(c)}>
                    <Tooltip title="Reset password"><Button size="small" type="text" icon={<KeyOutlined />} /></Tooltip>
                  </Popconfirm>
                  <Popconfirm
                    title={`Delete ${c.company}?`} description="Removes their portal login, assets, licences and documents. Tickets are kept."
                    okText="Delete" okButtonProps={{ danger: true }} onConfirm={() => deleteClient(c.id).then(() => message.success('Client deleted'), fail)}
                  >
                    <Tooltip title="Delete"><Button size="small" type="text" danger icon={<DeleteOutlined />} /></Tooltip>
                  </Popconfirm>
                </span>
              ),
            },
          ]}
        />
      </Panel>

      <ClientDrawer
        open={editing !== null} client={editing?.id ? editing : null}
        onClose={() => setEditing(null)} onCreated={setCreds}
      />
      <CredentialsModal creds={creds} onClose={() => setCreds(null)} />
    </>
  );
}
