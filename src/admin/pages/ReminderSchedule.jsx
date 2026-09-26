// When renewal reminders go out: the default rule, send time, channels, upcoming calendar and delivery log.
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Alert, Button, Empty, Form, InputNumber, Radio, Segmented, Select, Skeleton, Switch, Table, Tag, TimePicker, Tooltip, message,
} from 'antd';
import { ReloadOutlined, SaveOutlined, SendOutlined, TeamOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import {
  useApi, getReminderSettings, saveReminderSettings, getReminderSchedule, listReminderLog, runRemindersNow,
} from '../api/store';
import Panel, { PageHeader } from '../components/Panel';
import { ChannelStatus } from './ReminderTeam';
import { fmtDateTime } from '../utils';
import { fmtYmd, daysText } from '../renewals/shared';

const fail = (err) => message.error(err?.message || 'Action failed');
const STATUS = { sent: 'green', failed: 'red', skipped: 'default' };

function SettingsForm({ data }) {
  const [form] = Form.useForm();
  const [busy, setBusy] = useState(false);
  const mode = Form.useWatch('mode', form);

  useEffect(() => {
    if (!data) return;
    form.setFieldsValue({ ...data.settings, sendTime: dayjs(data.settings.sendTime, 'HH:mm') });
  }, [data]); // eslint-disable-line react-hooks/exhaustive-deps

  const save = async (v) => {
    setBusy(true);
    try {
      await saveReminderSettings({
        ...v,
        sendTime: v.sendTime.format('HH:mm'),
        days: (v.days || []).map(Number).filter((n) => Number.isInteger(n) && n >= 0 && n <= 365),
      });
      message.success('Reminder schedule saved');
    } catch (e) { fail(e); } finally { setBusy(false); }
  };

  return (
    <Form form={form} layout="vertical" requiredMark={false} onFinish={save}>
      <Form.Item name="mode" label="Default rule for every renewal">
        <Radio.Group className="flex flex-col gap-2">
          <Radio value="daily">Every day, starting a set number of days before expiry</Radio>
          <Radio value="days">Only on specific days before expiry (e.g. 30, 15, 7, 1 days before)</Radio>
        </Radio.Group>
      </Form.Item>
      {mode === 'days' ? (
        <Form.Item
          name="days" label="Days before expiry (0 = on the expiry day)"
          rules={[{ required: true, type: 'array', min: 1, message: 'Add at least one number' }]}
          normalize={(v) => (v || []).map((x) => Number(x)).filter((n) => Number.isInteger(n) && n >= 0 && n <= 365)}
        >
          <Select mode="tags" tokenSeparators={[',', ' ']} options={[60, 45, 30, 15, 10, 7, 5, 3, 2, 1, 0].map((d) => ({ value: d, label: d === 0 ? 'On expiry day' : `${d} days before` }))} />
        </Form.Item>
      ) : (
        <Form.Item name="windowDays" label="Start reminding this many days before expiry" rules={[{ required: true, message: 'Required' }]}>
          <InputNumber min={0} max={365} addonAfter="days" className="!w-48" />
        </Form.Item>
      )}
      <div className="grid gap-x-4 sm:grid-cols-2">
        <Form.Item name="sendTime" label={`Send time (${data?.timezone || 'Asia/Kolkata'})`} rules={[{ required: true, message: 'Pick a time' }]}>
          <TimePicker format="HH:mm" minuteStep={5} className="!w-full" allowClear={false} needConfirm={false} />
        </Form.Item>
        <Form.Item name="afterExpiry" label="After expiry, keep reminding daily until Renewed / Not renewing" valuePropName="checked"><Switch /></Form.Item>
      </div>
      <div className="grid gap-x-4 sm:grid-cols-3">
        <Form.Item name="emailOn" label="Send email" valuePropName="checked"><Switch /></Form.Item>
        <Form.Item name="smsOn" label="Send SMS / WhatsApp" valuePropName="checked"><Switch /></Form.Item>
        <Form.Item name="notifyAdmin" label={<Tooltip title={data?.channels?.adminEmail || 'REMINDER_EMAIL_TO / ADMIN_EMAIL'}>Copy to admin email</Tooltip>} valuePropName="checked"><Switch /></Form.Item>
      </div>
      <p className="mt-0 text-[12px] text-slate-500">
        Individual renewals can override this rule with their own days or exact dates (Renewals → Edit → Reminder).
        Reminders also show daily in the admin panel (popup, bell and dashboard).
      </p>
      <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={busy}>Save schedule</Button>
    </Form>
  );
}

export default function ReminderSchedule() {
  const settings = useApi(getReminderSettings);
  const [range, setRange] = useState(30);
  const schedule = useApi(() => getReminderSchedule(range), [range]);
  const log = useApi(listReminderLog, [], { poll: 60000 });
  const [running, setRunning] = useState(false);

  const runNow = async () => {
    setRunning(true);
    try {
      const r = await runRemindersNow();
      if (r.sent) message.success(`${r.sent} message${r.sent === 1 ? '' : 's'} sent for ${r.due} renewal${r.due === 1 ? '' : 's'}`);
      else if (r.results?.length) message.warning(`Nothing delivered — ${r.results[0].error || 'check the delivery log'}`);
      else message.info(r.reason || 'Nothing to send today');
    } catch (e) { fail(e); } finally { setRunning(false); }
  };

  const days = schedule.data?.days || [];

  return (
    <>
      <PageHeader
        title="Reminder schedule"
        sub="Choose when renewal reminders go out and see exactly which reminder is sent on which date"
        extra={(
          <>
            <Tooltip title="Refresh"><Button icon={<ReloadOutlined />} onClick={() => { settings.reload(); schedule.reload(); log.reload(); }} /></Tooltip>
            <Link to="/admin/renewal-team"><Button icon={<TeamOutlined />}>Reminder team</Button></Link>
            <Button type="primary" icon={<SendOutlined />} loading={running} onClick={runNow}>Send today's reminders now</Button>
          </>
        )}
      />
      {settings.error && <Alert className="!mb-3" type="error" showIcon message={settings.error.message} />}
      <ChannelStatus channels={settings.data?.channels} />

      <div className="grid gap-4 xl:grid-cols-5">
        <Panel className="xl:col-span-2" title="Default reminder rule">
          {settings.data ? <SettingsForm data={settings.data} /> : <Skeleton active paragraph={{ rows: 8 }} />}
        </Panel>

        <Panel
          className="xl:col-span-3" title="Upcoming reminders" bodyClass="p-0"
          extra={<Segmented size="small" value={range} onChange={setRange} options={[{ value: 30, label: '30 days' }, { value: 60, label: '60 days' }, { value: 90, label: '90 days' }]} />}
        >
          {schedule.loading && !schedule.data ? <div className="p-4"><Skeleton active /></div> : days.length === 0 ? (
            <Empty className="!py-10" image={Empty.PRESENTED_IMAGE_SIMPLE} description={`No reminders in the next ${range} days`} />
          ) : (
            <ul className="m-0 max-h-[560px] list-none overflow-y-auto p-0">
              {days.map((d) => (
                <li key={d.date} className="flex gap-3 border-b border-slate-100 px-4 py-2.5 last:border-0 dark:border-white/5">
                  <span className="grid w-12 shrink-0 place-items-center self-start rounded-md border border-slate-200 py-0.5 text-center dark:border-white/10">
                    <span className="text-[15px] font-semibold leading-tight text-brand-600 dark:text-brand-300">{dayjs(d.date).date()}</span>
                    <span className="font-mono text-[9.5px] uppercase text-slate-400">{dayjs(d.date).format('MMM')}</span>
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="m-0 text-[12px] text-slate-500">
                      {d.date === schedule.data.today ? <Tag color="orange" className="!me-1">Today</Tag> : dayjs(d.date).format('dddd')} at {schedule.data.sendTime}
                    </p>
                    <ul className="m-0 list-none space-y-1 p-0">
                      {d.items.map((r) => (
                        <li key={r.id} className="text-[13px]">
                          <Link to={`/admin/renewals?view=all&id=${r.id}`} className="font-medium text-slate-900 hover:underline dark:text-white">{r.customer}</Link>
                          <span className="text-slate-500"> · {r.description} · {daysText(r.daysLeft)} (ends {fmtYmd(r.endDate)})</span>
                          {r.custom && <Tag className="!ms-1">custom</Tag>}
                          <span className="block text-[11.5px] text-slate-400">To: {r.recipients.length ? r.recipients.join(', ') : 'no active team members (admin email only)'}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <Panel className="mt-4" title="Delivery log" bodyClass="p-0" extra={<span className="text-[12px] text-slate-400">Last 200 emails / SMS</span>}>
        <Table
          rowKey="id" size="small" loading={log.loading} dataSource={log.data?.items || []} scroll={{ x: 820 }}
          pagination={{ pageSize: 10, hideOnSinglePage: true, showSizeChanger: false }}
          locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Nothing sent yet" /> }}
          columns={[
            { title: 'When', dataIndex: 'createdAt', width: 170, render: fmtDateTime },
            { title: 'Channel', dataIndex: 'channel', width: 80, render: (v) => (v === 'sms' ? 'SMS' : 'Email') },
            { title: 'To', dataIndex: 'name', render: (v, r) => <span><span className="block font-medium">{v}</span><span className="block text-[11.5px] text-slate-500">{r.to}</span></span> },
            { title: 'Renewals', dataIndex: 'customers', render: (v, r) => (r.kind === 'test' ? <Tag>test message</Tag> : <span className="text-[12.5px]">{(v || []).join(', ')}</span>) },
            { title: 'Status', dataIndex: 'status', width: 230, render: (v, r) => <span><Tag color={STATUS[v]} className="!m-0">{v}</Tag> {r.error && <span className="text-[11.5px] text-slate-500">{r.error}</span>}</span> },
          ]}
        />
      </Panel>
    </>
  );
}
