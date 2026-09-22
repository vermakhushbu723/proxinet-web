// Admin screens for data shown in the client portal: assets, licences, documents.
import React, { useState } from 'react';
import {
  Alert, Button, DatePicker, Drawer, Form, Input, InputNumber, Popconfirm, Select, Switch, Table, Tag, Tooltip, Upload, message,
} from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, DownloadOutlined, UploadOutlined, ReloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import {
  useApi, listClients, listPortalItems, createPortalItem, updatePortalItem, deletePortalItem, downloadClientDocument,
} from '../api/store';
import Panel, { PageHeader } from '../components/Panel';

const fail = (err) => message.error(err?.message || 'Action failed');
const fmt = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—');
const daysTag = (days, soon = 45) => {
  if (days === null || days === undefined) return null;
  if (days < 0) return <Tag color="red" className="!m-0">expired</Tag>;
  return <Tag color={days < soon ? 'red' : days < 90 ? 'orange' : 'green'} className="!m-0">{days}d</Tag>;
};

const ASSET_TYPES = ['Server', 'Storage', 'Firewall', 'Switch', 'Router', 'Access point', 'Laptop', 'Desktop', 'Printer', 'UPS', 'Other'];
const DOC_CATEGORIES = ['SLA report', 'Invoice', 'QBR', 'Documentation', 'Policy', 'Other'];

const CONFIG = {
  assets: {
    title: 'Client assets', singular: 'asset', dateField: 'warranty',
    columns: [
      { title: 'Asset', dataIndex: 'name', render: (v, a) => <span><span className="block font-mono text-[12px] font-semibold">{v}</span><span className="block text-[11.5px] text-slate-500">{a.model}</span></span> },
      { title: 'Type', dataIndex: 'type', width: 110 },
      { title: 'Location', dataIndex: 'location', responsive: ['xl'] },
      { title: 'Warranty', dataIndex: 'warranty', width: 170, render: (v, a) => (v ? <span className="flex items-center gap-2">{fmt(v)} {daysTag(a.warrantyDays, 60)}</span> : '—') },
      { title: 'Status', dataIndex: 'status', width: 100, render: (v) => <Tag color={{ Healthy: 'green', Warning: 'orange', Critical: 'red', Retired: 'default' }[v]} className="!m-0">{v}</Tag> },
    ],
    form: (
      <>
        <div className="grid gap-x-3 sm:grid-cols-2">
          <Form.Item name="name" label="Asset name" rules={[{ required: true, message: 'Name is required' }]}><Input placeholder="DC-SRV-01" /></Form.Item>
          <Form.Item name="type" label="Type"><Select options={ASSET_TYPES.map((v) => ({ value: v, label: v }))} /></Form.Item>
          <Form.Item name="model" label="Model"><Input placeholder="Dell PowerEdge R650" /></Form.Item>
          <Form.Item name="serial" label="Serial number"><Input /></Form.Item>
          <Form.Item name="location" label="Location"><Input /></Form.Item>
          <Form.Item name="warranty" label="Warranty until"><DatePicker className="!w-full" /></Form.Item>
          <Form.Item name="status" label="Status"><Select options={['Healthy', 'Warning', 'Critical', 'Retired'].map((v) => ({ value: v, label: v }))} /></Form.Item>
        </div>
        <Form.Item name="notes" label="Notes"><Input.TextArea rows={2} /></Form.Item>
      </>
    ),
    defaults: { type: 'Server', status: 'Healthy' },
  },
  licences: {
    title: 'Client licences', singular: 'licence', dateField: 'renew',
    columns: [
      { title: 'Licence', dataIndex: 'name', render: (v, l) => <span><span className="block text-[13px] font-medium">{v}</span><span className="block text-[11.5px] text-slate-500">{l.vendor}</span></span> },
      { title: 'Qty', dataIndex: 'qty', width: 70 },
      { title: 'Renews', dataIndex: 'renew', width: 170, render: (v, l) => <span className="flex items-center gap-2">{fmt(v)} {daysTag(l.days)}</span> },
    ],
    form: (
      <>
        <Form.Item name="name" label="Licence / subscription" rules={[{ required: true, message: 'Name is required' }]}><Input placeholder="Microsoft 365 Business Premium" /></Form.Item>
        <div className="grid gap-x-3 sm:grid-cols-3">
          <Form.Item name="vendor" label="Vendor"><Input /></Form.Item>
          <Form.Item name="qty" label="Quantity" rules={[{ required: true, message: 'Qty' }]}><InputNumber min={1} className="!w-full" /></Form.Item>
          <Form.Item name="renew" label="Renewal date" rules={[{ required: true, message: 'Choose a date' }]}><DatePicker className="!w-full" /></Form.Item>
        </div>
        <Form.Item name="notes" label="Notes"><Input.TextArea rows={2} /></Form.Item>
      </>
    ),
    defaults: { qty: 1 },
  },
};

function useClientOptions() {
  const { data } = useApi(listClients);
  return (data?.items || []).map((c) => ({ value: c.id, label: c.company }));
}

function ClientFilter({ value, onChange, options }) {
  return (
    <Select
      value={value || 'all'} onChange={(v) => onChange(v === 'all' ? '' : v)} style={{ minWidth: 200 }}
      options={[{ value: 'all', label: 'All clients' }, ...options]}
    />
  );
}

/* ================= assets & licences ================= */
export function PortalItemsPage({ kind }) {
  const cfg = CONFIG[kind];
  const clients = useClientOptions();
  const [client, setClient] = useState('');
  const { data, loading, error, reload } = useApi(() => listPortalItems(kind, client), [kind, client]);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();
  const [busy, setBusy] = useState(false);
  const rows = data?.items || [];

  const open = (item) => {
    setEditing(item || {});
    const base = item ? { ...item } : { ...cfg.defaults, client: client || undefined };
    if (base[cfg.dateField]) base[cfg.dateField] = dayjs(base[cfg.dateField]);
    else delete base[cfg.dateField];
    setTimeout(() => { form.resetFields(); form.setFieldsValue(base); }, 0);
  };

  const save = async (v) => {
    setBusy(true);
    const body = { ...v, [cfg.dateField]: v[cfg.dateField] ? v[cfg.dateField].format('YYYY-MM-DD') : '' };
    try {
      if (editing?.id) await updatePortalItem(kind, editing.id, body);
      else await createPortalItem(kind, body);
      message.success(`${cfg.singular.charAt(0).toUpperCase() + cfg.singular.slice(1)} saved`);
      setEditing(null);
    } catch (err) {
      if (err.fields) form.setFields(Object.entries(err.fields).map(([name, e]) => ({ name, errors: [e] })));
      fail(err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader
        title={cfg.title} sub={`${rows.length} ${cfg.singular}s · shown in each client's portal`}
        extra={(
          <>
            <Tooltip title="Refresh"><Button icon={<ReloadOutlined />} onClick={reload} /></Tooltip>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => open(null)} disabled={!clients.length}>Add {cfg.singular}</Button>
          </>
        )}
      />
      {!clients.length && !loading && <Alert className="!mb-3" type="info" showIcon message="Create a portal client first (Client portal → Clients)." />}
      {error && <Alert className="!mb-3" type="error" showIcon message={error.message} />}
      <Panel bodyClass="p-0">
        <div className="border-b border-slate-200 p-3 dark:border-white/10"><ClientFilter value={client} onChange={setClient} options={clients} /></div>
        <Table
          rowKey="id" size="small" loading={loading} dataSource={rows} scroll={{ x: 820 }}
          pagination={{ pageSize: 15, hideOnSinglePage: true, showSizeChanger: false }}
          columns={[
            ...cfg.columns,
            { title: 'Client', dataIndex: 'clientName', width: 170 },
            {
              key: 'a', width: 80,
              render: (_, r) => (
                <span className="flex gap-1">
                  <Button size="small" type="text" icon={<EditOutlined />} onClick={() => open(r)} aria-label="Edit" />
                  <Popconfirm title={`Delete ${r.name}?`} okText="Delete" okButtonProps={{ danger: true }} onConfirm={() => deletePortalItem(kind, r.id).then(() => message.success('Deleted'), fail)}>
                    <Button size="small" type="text" danger icon={<DeleteOutlined />} aria-label="Delete" />
                  </Popconfirm>
                </span>
              ),
            },
          ]}
        />
      </Panel>

      <Drawer
        open={editing !== null} onClose={() => setEditing(null)} width={480} destroyOnClose rootClassName="px-admin-drawer"
        styles={{ header: { padding: '12px 20px' } }} title={editing?.id ? `Edit ${cfg.singular}` : `New ${cfg.singular}`}
        extra={<Button type="primary" loading={busy} onClick={() => form.submit()}>Save</Button>}
      >
        <Form form={form} layout="vertical" requiredMark={false} onFinish={save}>
          <Form.Item name="client" label="Client" rules={[{ required: true, message: 'Choose a client' }]}>
            <Select options={clients} placeholder="Choose client" showSearch optionFilterProp="label" />
          </Form.Item>
          {cfg.form}
        </Form>
      </Drawer>
    </>
  );
}

/* ================= documents ================= */
export function DocumentsPage() {
  const clients = useClientOptions();
  const [client, setClient] = useState('');
  const { data, loading, error, reload } = useApi(() => listPortalItems('documents', client), [client]);
  const [uploading, setUploading] = useState(false);
  const [open, setOpen] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [form] = Form.useForm();
  const rows = data?.items || [];

  const upload = async (v) => {
    const file = v.file?.[0]?.originFileObj;
    if (!file) return;
    const fd = new FormData();
    fd.append('client', v.client);
    fd.append('title', v.title || file.name);
    fd.append('category', v.category);
    fd.append('visible', v.visible === false ? 'false' : 'true');
    fd.append('file', file, file.name);
    setUploading(true);
    try {
      await createPortalItem('documents', fd);
      message.success('Document uploaded');
      setOpen(false);
      form.resetFields();
    } catch (err) {
      fail(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Client documents" sub={`${rows.length} files · SLA reports, invoices, QBRs and documentation for the portal`}
        extra={(
          <>
            <Tooltip title="Refresh"><Button icon={<ReloadOutlined />} onClick={reload} /></Tooltip>
            <Button type="primary" icon={<UploadOutlined />} onClick={() => { form.resetFields(); form.setFieldsValue({ client: client || undefined, category: 'SLA report', visible: true }); setOpen(true); }} disabled={!clients.length}>Upload document</Button>
          </>
        )}
      />
      {error && <Alert className="!mb-3" type="error" showIcon message={error.message} />}
      <Panel bodyClass="p-0">
        <div className="border-b border-slate-200 p-3 dark:border-white/10"><ClientFilter value={client} onChange={setClient} options={clients} /></div>
        <Table
          rowKey="id" size="small" loading={loading} dataSource={rows} scroll={{ x: 820 }}
          pagination={{ pageSize: 15, hideOnSinglePage: true, showSizeChanger: false }}
          columns={[
            { title: 'Title', dataIndex: 'title', render: (v, d) => <span><span className="block text-[13px] font-medium">{v}</span><span className="block text-[11.5px] text-slate-500">{d.file.filename} · {Math.max(1, Math.round((d.file.size || 0) / 1024))} KB</span></span> },
            { title: 'Category', dataIndex: 'category', width: 130 },
            { title: 'Client', dataIndex: 'clientName', width: 170 },
            { title: 'Uploaded', dataIndex: 'createdAt', width: 120, render: fmt },
            {
              title: 'Visible to client', dataIndex: 'visible', width: 130,
              render: (v, d) => <Switch size="small" checked={v} onChange={(on) => updatePortalItem('documents', d.id, { visible: on }).catch(fail)} />,
            },
            {
              key: 'a', width: 80,
              render: (_, d) => (
                <span className="flex gap-1">
                  <Button size="small" type="text" icon={<DownloadOutlined />} loading={busyId === d.id} aria-label="Download"
                    onClick={() => { setBusyId(d.id); downloadClientDocument(d.id, d.file.filename).catch(fail).finally(() => setBusyId(null)); }} />
                  <Popconfirm title={`Delete ${d.title}?`} okText="Delete" okButtonProps={{ danger: true }} onConfirm={() => deletePortalItem('documents', d.id).then(() => message.success('Deleted'), fail)}>
                    <Button size="small" type="text" danger icon={<DeleteOutlined />} aria-label="Delete" />
                  </Popconfirm>
                </span>
              ),
            },
          ]}
        />
      </Panel>

      <Drawer
        open={open} onClose={() => setOpen(false)} width={440} destroyOnClose rootClassName="px-admin-drawer"
        styles={{ header: { padding: '12px 20px' } }} title="Upload document"
        extra={<Button type="primary" loading={uploading} onClick={() => form.submit()}>Upload</Button>}
      >
        <Form form={form} layout="vertical" requiredMark={false} onFinish={upload}>
          <Form.Item name="client" label="Client" rules={[{ required: true, message: 'Choose a client' }]}>
            <Select options={clients} placeholder="Choose client" showSearch optionFilterProp="label" />
          </Form.Item>
          <Form.Item name="file" label="File (max 10 MB)" valuePropName="fileList" getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)} rules={[{ required: true, message: 'Choose a file' }]}>
            <Upload beforeUpload={() => false} maxCount={1} accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.ppt,.pptx,.txt,.png,.jpg,.jpeg,.zip">
              <Button icon={<UploadOutlined />}>Choose file</Button>
            </Upload>
          </Form.Item>
          <Form.Item name="title" label="Title (defaults to the file name)"><Input /></Form.Item>
          <Form.Item name="category" label="Category"><Select options={DOC_CATEGORIES.map((v) => ({ value: v, label: v }))} /></Form.Item>
          <Form.Item name="visible" label="Visible to client" valuePropName="checked"><Switch /></Form.Item>
        </Form>
      </Drawer>
    </>
  );
}

export const AssetsPage = () => <PortalItemsPage kind="assets" />;
export const LicencesPage = () => <PortalItemsPage kind="licences" />;
