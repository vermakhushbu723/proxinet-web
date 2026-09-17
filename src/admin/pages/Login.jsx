import React, { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Alert, Button, Form, Input } from 'antd';
import { LockOutlined, MailOutlined, CheckCircleFilled } from '@ant-design/icons';
import Logo from '../../components/Logo';
import { img, photos } from '../../data/images';
import { login, getSession } from '../api/auth';

export default function Login() {
  const nav = useNavigate();
  const loc = useLocation();
  const [form] = Form.useForm();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const next = new URLSearchParams(loc.search).get('next') || loc.state?.from || '/admin/dashboard';
  const safeNext = next.startsWith('/admin') ? next : '/admin/dashboard';

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

  return (
    <div className="grid min-h-screen bg-white dark:bg-ink-900 lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-ink-900 p-12 lg:flex lg:flex-col lg:justify-between">
        <img src={img(photos.nocDesk, 1400)} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-ink-900/95 via-ink-900/85 to-brand-900/80" aria-hidden="true" />
        <div className="relative">
          <span className="rounded-md bg-white/10 px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider text-white/80">Admin panel</span>
          <h2 className="mt-5 max-w-md text-[26px] font-semibold leading-tight text-white">Every enquiry, booking and ticket in one inbox</h2>
          <ul className="m-0 mt-8 list-none space-y-3 p-0">
            {['Leads and assessment bookings from the website', 'Client portal support tickets', 'Chat conversations, downloads and tool reports', 'Job applications with resumes and procurement requests'].map((t) => (
              <li key={t} className="flex items-center gap-2.5 text-[13.5px] text-white/90">
                <CheckCircleFilled className="text-emerald-300" /> {t}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative m-0 font-mono text-[11px] uppercase tracking-wider text-white/50">ProXinet Technologies · internal</p>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-[340px]">
          <Logo />
          <h1 className="m-0 mt-6 text-[20px] font-semibold text-slate-900 dark:text-white">Sign in to admin</h1>
          <p className="m-0 mt-1 text-[13px] text-slate-500">Authorised staff only.</p>

          {error && <Alert className="!mt-4" type="error" showIcon message={error} />}

          <Form form={form} layout="vertical" requiredMark={false} onFinish={submit} onValuesChange={() => setError('')} className="!mt-5">
            <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Enter a valid email' }]}>
              <Input prefix={<MailOutlined className="text-slate-400" />} placeholder="you@proxinet.in" autoComplete="username" />
            </Form.Item>
            <Form.Item name="password" label="Password" rules={[{ required: true, message: 'Enter your password' }]}>
              <Input.Password prefix={<LockOutlined className="text-slate-400" />} autoComplete="current-password" />
            </Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>Sign in</Button>
          </Form>
        </div>
      </div>
    </div>
  );
}
