import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { getSession } from './api/auth';
import AdminLayout from './layout/AdminLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Leads from './pages/Leads';
import Assessments from './pages/Assessments';
import Tickets from './pages/Tickets';
import Chats from './pages/Chats';
import Downloads from './pages/Downloads';
import ToolReports from './pages/ToolReports';
import Subscribers from './pages/Subscribers';
import Applications from './pages/Applications';
import ProcurementRequests from './pages/ProcurementRequests';
import Settings from './pages/Settings';
import Clients from './pages/Clients';
import { AssetsPage, LicencesPage, DocumentsPage } from './pages/PortalItems';

function RequireAuth({ children }) {
  const loc = useLocation();
  if (!getSession()) return <Navigate to="/admin/login" replace state={{ from: loc.pathname + loc.search }} />;
  return children;
}

// Compact, app-style sizing for the admin panel (the website keeps its larger marketing scale)
const adminTheme = {
  token: {
    fontSize: 13, fontSizeSM: 12, fontSizeLG: 14,
    controlHeight: 32, controlHeightSM: 26, controlHeightLG: 36,
    borderRadius: 8, borderRadiusLG: 10, lineHeight: 1.5,
  },
  components: {
    Button: { fontWeight: 500, primaryShadow: 'none', defaultShadow: 'none', paddingInline: 12 },
    Input: { paddingBlock: 4, paddingInline: 10 },
    Select: { optionHeight: 30 },
    Table: { cellPaddingBlock: 9, cellPaddingInline: 12, cellPaddingBlockSM: 8, cellPaddingInlineSM: 10, cellFontSize: 13 },
    Descriptions: { itemPaddingBottom: 8 },
    Card: { paddingLG: 16 },
    Form: { itemMarginBottom: 16, verticalLabelPadding: '0 0 4px' },
    Alert: { withDescriptionPadding: '12px 14px' },
  },
};

/** Everything under /admin — mounted from App.jsx outside the website layout. */
export default function AdminApp() {
  return (
    <ConfigProvider theme={adminTheme}>
    <Routes>
      <Route path="/admin/login" element={<Login />} />
      <Route path="/admin" element={<RequireAuth><AdminLayout /></RequireAuth>}>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="leads" element={<Leads />} />
        <Route path="assessments" element={<Assessments />} />
        <Route path="tickets" element={<Tickets />} />
        <Route path="chats" element={<Chats />} />
        <Route path="downloads" element={<Downloads />} />
        <Route path="tool-reports" element={<ToolReports />} />
        <Route path="subscribers" element={<Subscribers />} />
        <Route path="applications" element={<Applications />} />
        <Route path="procurement" element={<ProcurementRequests />} />
        <Route path="clients" element={<Clients />} />
        <Route path="client-assets" element={<AssetsPage />} />
        <Route path="client-licences" element={<LicencesPage />} />
        <Route path="client-documents" element={<DocumentsPage />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Route>
    </Routes>
    </ConfigProvider>
  );
}
