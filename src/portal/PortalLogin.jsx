import React, { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Button, Form, Input, Checkbox, Alert, Modal, message } from 'antd';
import { LockOutlined, UserOutlined, CheckCircleFilled, MailOutlined } from '@ant-design/icons';
import { company } from '../data/company';
import Logo from '../components/Logo';
import { img, photos } from '../data/images';
import { login, getSession, forgotPassword } from './api';

export default function PortalLogin() {
  const nav = useNavigate();
  const loc = useLocation();
  const [form] = Form.useForm();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotBusy, setForgotBusy] = useState(false);
  const [forgotForm] = Form.useForm();

  const next = new URLSearchParams(loc.search).get('next') || '/portal/dashboard';
  const safeNext = next.startsWith('/portal/dashboard') ? next : '/portal/dashboard';
  if (getSession()) return <Navigate to={safeNext} replace />;

  const submit = async ({ email, password }) => {
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      nav(safeNext, { replace: true });
    } catch (err) {
      setError(err.message || 'Sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  const sendReset = async ({ email }) => {
    setForgotBusy(true);
    try {
      await forgotPassword(email);
      setForgotOpen(false);
      forgotForm.resetFields();
      message.success('If this email has a portal account, our service desk will contact you to reset it.');
    } catch (err) {
      message.error(err.message);
    } finally {
      setForgotBusy(false);
    }
  };

  return (
    <div className="grid min-h-[calc(100vh-108px)] lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-ink-900 p-12 lg:flex lg:flex-col lg:justify-between">
        <img src={img(photos.dcEngineer, 1400)} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-brand-700/90 via-brand-800/80 to-ink-900/90" aria-hidden="true" />
        <div className="relative">
          <h2 className="m-0 max-w-md text-[26px] font-semibold leading-tight text-white">Your whole infrastructure on one screen</h2>
          <p className="m-0 mt-3 max-w-md text-[14px] leading-relaxed text-white/85">
            Tickets, assets, licence renewals, SLA reports and documents — without emailing anyone to find out.
          </p>
          <ul className="m-0 mt-7 list-none space-y-2.5 p-0">
            {['Raise a ticket — the SLA timer starts immediately', 'Track every update from our engineers', 'Asset warranty and licence renewal dates', 'Download SLA reports, invoices and documents'].map((t) => (
              <li key={t} className="flex items-center gap-2.5 text-[13.5px] text-white/90"><CheckCircleFilled className="text-emerald-300" /> {t}</li>
            ))}
          </ul>
        </div>
        <p className="relative m-0 font-mono text-[11px] uppercase tracking-wider text-white/60">24×7 NOC · {company.phones[0]}</p>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-[340px]">
          <Logo />
          <h1 className="m-0 mt-6 text-[20px] font-semibold text-slate-900 dark:text-white">Client Portal login</h1>
          <p className="m-0 mt-1 text-[13px] text-slate-500">For managed services clients. Your account manager shares your login.</p>

          {error && <Alert className="!mt-4" type="error" showIcon message={error} />}

          <Form form={form} layout="vertical" requiredMark={false} onFinish={submit} onValuesChange={() => setError('')} className="!mt-5">
            <Form.Item name="email" label="Work email" rules={[{ required: true, type: 'email', message: 'Enter a valid email address' }]}>
              <Input prefix={<UserOutlined className="text-slate-400" />} placeholder="you@company.com" autoComplete="username" />
            </Form.Item>
            <Form.Item name="password" label="Password" rules={[{ required: true, message: 'Enter your password' }]}>
              <Input.Password prefix={<LockOutlined className="text-slate-400" />} placeholder="••••••••" autoComplete="current-password" />
            </Form.Item>
            <div className="mb-4 flex items-center justify-between">
              <Checkbox defaultChecked>Remember me</Checkbox>
              <button type="button" onClick={() => setForgotOpen(true)} className="cursor-pointer border-0 bg-transparent p-0 text-[13px] font-medium text-brand-600 dark:text-brand-300">
                Forgot password?
              </button>
            </div>
            <Button type="primary" htmlType="submit" block loading={loading}>Sign in</Button>
          </Form>

          <p className="m-0 mt-5 text-center text-[13px] text-slate-500">
            Not a client yet? <Link to="/book-assessment" className="font-semibold text-brand-600 dark:text-brand-300">Book a free assessment</Link>
          </p>
        </div>
      </div>

      <Modal open={forgotOpen} onCancel={() => setForgotOpen(false)} footer={null} title="Reset your portal password" destroyOnClose width={400}>
        <p className="m-0 mb-4 text-[13px] text-slate-500">Enter your login email. Our service desk verifies the request and sends you a new password.</p>
        <Form form={forgotForm} layout="vertical" requiredMark={false} onFinish={sendReset}>
          <Form.Item name="email" label="Work email" rules={[{ required: true, type: 'email', message: 'Enter a valid email address' }]}>
            <Input prefix={<MailOutlined className="text-slate-400" />} placeholder="you@company.com" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block loading={forgotBusy}>Request reset</Button>
        </Form>
      </Modal>
    </div>
  );
}
