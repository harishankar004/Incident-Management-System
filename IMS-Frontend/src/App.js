import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layout
import AppLayout from './components/layout/AppLayout';

// Pages
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';

// Incidents
import IncidentListPage from './pages/incidents/IncidentListPage';
import RaiseIncidentPage from './pages/incidents/RaiseIncidentPage';
import IncidentDetailPage from './pages/incidents/IncidentDetailPage';

// Admin
import UserManagementPage from './pages/admin/UserManagementPage';
import SlaConfigPage from './pages/admin/SlaConfigPage';
import AuditLogsPage from './pages/admin/AuditLogsPage';

// Manager
import SlaMonitorPage from './pages/manager/SlaMonitorPage';
import EscalationsPage from './pages/manager/EscalationsPage';

// Notifications
import NotificationsPage from './pages/notifications/NotificationsPage';

/* ── Protected Route ── */
function PrivateRoute({ children, roles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.roleCode)) return <Navigate to="/app/dashboard" replace />;
  return children;
}

/* ── Not Found ── */
function NotFound() {
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'60vh', gap:12, color:'var(--text-m)' }}>
      <div style={{ fontSize:56 }}>🔍</div>
      <h2 style={{ fontSize:22, fontWeight:700, color:'var(--text)' }}>Page not found</h2>
      <p style={{ fontSize:14 }}>The page you're looking for doesn't exist.</p>
      <a href="/app/dashboard" style={{ color:'var(--primary)', fontWeight:600 }}>← Back to Dashboard</a>
    </div>
  );
}

function RootRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to="/app/dashboard" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<RootRedirect />} />

      {/* Protected shell */}
      <Route path="/app" element={
        <PrivateRoute>
          <AppLayout />
        </PrivateRoute>
      }>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />

        {/* ── Incidents ──
            REPORTER : /incidents/my (own) + /incidents/new (raise)
            RESOLVER : /incidents (full queue) + /incidents/my (assigned to me)
            INC_MANAGER: /incidents (full queue) — NO create
            ADMIN: read-only view
        */}
        <Route path="incidents" element={
          <PrivateRoute roles={['RESOLVER', 'INC_MANAGER', 'ADMIN']}>
            <IncidentListPage />
          </PrivateRoute>
        } />
        <Route path="incidents/my" element={
          /* REPORTER sees their submitted incidents; RESOLVER sees assigned incidents */
          <IncidentListPage myOnly={true} />
        } />
        {/* REPORTER ONLY — raise a new incident */}
        <Route path="incidents/new" element={
          <PrivateRoute roles={['REPORTER']}>
            <RaiseIncidentPage />
          </PrivateRoute>
        } />
        <Route path="incidents/:id" element={<IncidentDetailPage />} />

        {/* ── Admin routes — ADMIN only ── */}
        <Route path="admin/users" element={
          <PrivateRoute roles={['ADMIN']}>
            <UserManagementPage />
          </PrivateRoute>
        } />
        <Route path="admin/slas" element={
          <PrivateRoute roles={['ADMIN']}>
            <SlaConfigPage />
          </PrivateRoute>
        } />
        <Route path="admin/audit" element={
          <PrivateRoute roles={['ADMIN']}>
            <AuditLogsPage />
          </PrivateRoute>
        } />

        {/* ── Manager routes ── */}
        <Route path="manager/sla" element={
          <PrivateRoute roles={['INC_MANAGER', 'ADMIN']}>
            <SlaMonitorPage />
          </PrivateRoute>
        } />
        <Route path="manager/escalations" element={
          <PrivateRoute roles={['INC_MANAGER', 'ADMIN']}>
            <EscalationsPage />
          </PrivateRoute>
        } />

        {/* ── Notifications — all roles ── */}
        <Route path="notifications" element={<NotificationsPage />} />

        <Route path="*" element={<NotFound />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
