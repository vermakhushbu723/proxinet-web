import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Table, Input, Select, Button, Popconfirm, Segmented, Tooltip, Empty, Alert, message,
} from 'antd';
import {
  SearchOutlined, DownloadOutlined, DeleteOutlined, EyeOutlined, EyeInvisibleOutlined, ReloadOutlined,
} from '@ant-design/icons';
import { collections } from '../config/collections';
import { useCollection, updateRecord, updateMany, removeRecords } from '../api/store';
import { exportCsv, fmtDateTime, timeAgo } from '../utils';
import { StatusDot } from './StatusTag';
import Panel, { PageHeader } from './Panel';
import RecordDrawer from './RecordDrawer';

const fail = (err) => message.error(err?.message || 'Action failed');

/** Generic inbox screen for one form's submissions. */
export default function SubmissionsPage({ col }) {
  const cfg = collections[col];
  const { rows, loading, error, reload } = useCollection(col);
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('all');
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState([]);
  const [busy, setBusy] = useState(false);
  const openId = params.get('id');

  useEffect(() => { setSelected([]); setStatus('all'); setFilter('all'); setQ(''); }, [col]);

  const unread = rows.filter((r) => !r.read).length;
  const filterValues = cfg.filter ? [...new Set(rows.map((r) => r[cfg.filter.key]).filter(Boolean))] : [];

  const data = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return rows.filter((r) =>
      (status === 'all' || (status === 'unread' ? !r.read : r.status === status))
      && (filter === 'all' || r[cfg.filter?.key] === filter)
      && (!needle || String(r.code || '').toLowerCase().includes(needle)
        || cfg.search.some((k) => String(r[k] ?? '').toLowerCase().includes(needle))));
  }, [rows, q, status, filter, cfg]);

  // Opening a record — by row click, the bell, a toast or a dashboard link — marks it read
  const openRec = rows.find((r) => r.id === openId);
  const marking = useRef(null);
  useEffect(() => {
    if (openRec && !openRec.read && marking.current !== openRec.id) {
      marking.current = openRec.id;
      updateRecord(col, openRec.id, { read: true }).catch(() => {}).finally(() => { marking.current = null; });
    }
  }, [col, openRec]);

  const bulk = async (fn, ok) => {
    setBusy(true);
    try {
      await fn();
      if (ok) message.success(ok);
      setSelected([]);
    } catch (err) {
      fail(err);
    } finally {
      setBusy(false);
    }
  };

  const statusOptions = Object.entries(cfg.statuses).map(([s, c]) => ({ value: s, label: <StatusDot color={c} text={s} /> }));

  const columns = [
    {
      key: 'dot', width: 18,
      render: (_, r) => (!r.read ? <span className="block h-2 w-2 rounded-full bg-brand-500" title="Unread" /> : null),
    },
    {
      title: 'ID', dataIndex: 'code', width: 100, responsive: ['md'],
      render: (v) => <span className="font-mono text-[11px] text-slate-400">{v}</span>,
    },
    {
      title: cfg.singular.charAt(0).toUpperCase() + cfg.singular.slice(1), key: 'primary',
      render: (_, r) => (
        <div className="min-w-0 max-w-[320px]">
          <p className={`m-0 truncate text-[13px] ${r.read ? 'font-medium text-slate-700 dark:text-slate-200' : 'font-semibold text-slate-900 dark:text-white'}`}>
            {cfg.primary(r)}
          </p>
          <p className="m-0 truncate text-[11.5px] text-slate-500">{cfg.secondary(r)}</p>
        </div>
      ),
    },
    ...cfg.columns,
    {
      title: 'Status', dataIndex: 'status', width: 160,
      render: (v, r) => (
        <div onClick={(e) => e.stopPropagation()} role="presentation">
          <Select
            size="small" value={v} variant="borderless" popupMatchSelectWidth={false} options={statusOptions}
            onChange={(s) => updateRecord(col, r.id, { status: s, read: true }).then(() => message.success(`${r.code} → ${s}`), fail)}
          />
        </div>
      ),
    },
    {
      title: 'Received', dataIndex: 'createdAt', width: 120,
      sorter: (a, b) => String(a.createdAt).localeCompare(String(b.createdAt)), defaultSortOrder: 'descend',
      render: (v) => <Tooltip title={fmtDateTime(v)}><span className="whitespace-nowrap text-[12px] text-slate-500">{timeAgo(v)}</span></Tooltip>,
    },
    {
      key: 'actions', width: 48,
      render: (_, r) => (
        <div onClick={(e) => e.stopPropagation()} role="presentation">
          <Popconfirm
            title={`Delete ${r.code}?`} okText="Delete" okButtonProps={{ danger: true }}
            onConfirm={() => removeRecords(col, r.id).then(() => message.success('Deleted'), fail)}
          >
            <Button type="text" size="small" danger icon={<DeleteOutlined />} aria-label={`Delete ${r.code}`} />
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title={cfg.title}
        sub={loading ? 'Loading…' : `${rows.length} total · ${unread} unread · from “${cfg.formName}”`}
        extra={(
          <>
            <Tooltip title="Refresh"><Button icon={<ReloadOutlined />} onClick={reload} aria-label="Refresh" /></Tooltip>
            <Button
              icon={<DownloadOutlined />} disabled={!data.length}
              onClick={() => exportCsv(`${col}-${new Date().toISOString().slice(0, 10)}.csv`, data, cfg.chat ? [['firstMessage', 'First message']] : cfg.fields.map(([k, l]) => [k, l]))}
            >
              Export CSV
            </Button>
          </>
        )}
      />

      {error && <Alert className="!mb-3" type="error" showIcon message="Could not load records" description={error.message} action={<Button size="small" onClick={reload}>Retry</Button>} />}

      <Panel bodyClass="p-0">
        <div className="flex flex-col gap-2.5 border-b border-slate-200 p-3 dark:border-white/10 lg:flex-row lg:items-center">
          <div className="-mx-1 overflow-x-auto px-1">
            <Segmented
              size="small" value={status} onChange={setStatus}
              options={[
                { label: `All (${rows.length})`, value: 'all' },
                { label: `Unread (${unread})`, value: 'unread' },
                ...Object.keys(cfg.statuses).map((s) => ({ label: `${s} (${rows.filter((r) => r.status === s).length})`, value: s })),
              ]}
            />
          </div>
          <div className="flex flex-1 flex-wrap gap-2 lg:justify-end">
            {cfg.filter && filterValues.length > 1 && (
              <Select
                value={filter} onChange={setFilter} style={{ minWidth: 170 }}
                options={[{ value: 'all', label: `All ${cfg.filter.label.toLowerCase()}s` }, ...filterValues.map((v) => ({ value: v, label: v }))]}
              />
            )}
            <Input
              allowClear value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…"
              prefix={<SearchOutlined className="text-slate-400" />} className="!w-full sm:!w-56"
            />
          </div>
        </div>

        {selected.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 bg-brand-50/60 px-3 py-2 dark:border-white/10 dark:bg-white/[0.03]">
            <span className="mr-2 text-[12.5px] font-medium text-slate-700 dark:text-slate-200">{selected.length} selected</span>
            <Button size="small" loading={busy} icon={<EyeOutlined />} onClick={() => bulk(() => updateMany(col, selected, { read: true }))}>Mark read</Button>
            <Button size="small" loading={busy} icon={<EyeInvisibleOutlined />} onClick={() => bulk(() => updateMany(col, selected, { read: false }))}>Mark unread</Button>
            <Select
              size="small" placeholder="Set status" style={{ minWidth: 140 }} options={statusOptions} value={null} disabled={busy}
              onChange={(s) => bulk(() => updateMany(col, selected, { status: s }), `${selected.length} → ${s}`)}
            />
            <Popconfirm
              title={`Delete ${selected.length} records?`} okText="Delete" okButtonProps={{ danger: true }}
              onConfirm={() => bulk(() => removeRecords(col, selected), 'Deleted')}
            >
              <Button size="small" danger loading={busy} icon={<DeleteOutlined />}>Delete</Button>
            </Popconfirm>
          </div>
        )}

        <Table
          rowKey="id" size="small" columns={columns} dataSource={data} scroll={{ x: 760 }} loading={loading}
          rowSelection={{ selectedRowKeys: selected, onChange: setSelected }}
          pagination={{ pageSize: 15, hideOnSinglePage: true, showSizeChanger: false }}
          onRow={(r) => ({ onClick: () => setParams({ id: r.id }), className: `cursor-pointer ${r.read ? '' : 'bg-brand-50/30 dark:bg-white/[0.02]'}` })}
          locale={{ emptyText: <Empty description={rows.length ? 'Nothing matches these filters' : `No ${cfg.singular}s yet — they appear here as soon as someone submits the form`} /> }}
        />
      </Panel>

      <RecordDrawer col={col} cfg={cfg} record={openRec} onClose={() => setParams({})} />
    </>
  );
}
