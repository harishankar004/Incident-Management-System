import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { notifAPI } from '../../api';
import { Avatar, Bell } from '../common';

function NavItem({ to, icon, label, badge, end }) {
  return (
    <NavLink to={to} end={end}
      className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
      <span style={{ fontSize:16, width:20, textAlign:'center', flexShrink:0 }}>{icon}</span>
      <span style={{ flex:1 }}>{label}</span>
      {badge > 0 && <span className="nav-badge">{badge > 99 ? '99+' : badge}</span>}
    </NavLink>
  );
}

export default function AppLayout() {
  const { user, logout, isAdmin, isReporter, isResolver, isManager } = useAuth();
  const navigate = useNavigate();
  const [unread,    setUnread]    = useState(0);
  const [notifs,    setNotifs]    = useState([]);
  const [showNotif, setShowNotif] = useState(false);

  useEffect(() => {
    const poll = () => notifAPI.unreadCount().then(r => setUnread(r.data.data || 0)).catch(() => {});
    poll();
    const id = setInterval(poll, 30000);
    return () => clearInterval(id);
  }, []);

  const handleBell = async () => {
    if (!showNotif) {
      try {
        const r = await notifAPI.list();
        setNotifs(r.data.data || []);
        if (unread > 0) { await notifAPI.markAllRead(); setUnread(0); }
      } catch {}
    }
    setShowNotif(v => !v);
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  const roleLabel = {
    ADMIN: 'Administrator',
    REPORTER: 'End User',
    RESOLVER: 'Support Engineer',
    INC_MANAGER: 'Incident Manager',
  };

  return (
    <div className="app-shell">
      {}
      <aside className="sidebar">
        <div className="sb-logo">
          <div className="sb-logo-mark">IMS</div>
          <div className="sb-logo-text">
            <div className="title">IMS Portal</div>
            <div className="sub">Incident Mgmt System</div>
          </div>
        </div>

        <div className="sb-role">{roleLabel[user?.roleCode] || user?.roleCode}</div>

        {}
        {isAdmin && <>
          <div className="nav-group">
            <div className="nav-group-label">Overview</div>
            <NavItem to="/app/dashboard" icon="📊" label="Dashboard" end />
          </div>
          <div className="nav-group">
            <div className="nav-group-label">Governance</div>
            <NavItem to="/app/admin/users" icon="👥" label="User Management" />
            <NavItem to="/app/admin/slas"  icon="⏱️" label="SLA Configuration" />
            <NavItem to="/app/admin/audit" icon="📋" label="Audit Logs" />
          </div>
        </>}

        {}
        {isReporter && <>
          <div className="nav-group">
            <div className="nav-group-label">My Work</div>
            <NavItem to="/app/dashboard"     icon="🏠" label="Dashboard" end />
            <NavItem to="/app/incidents/my"  icon="📋" label="My Incidents" />
            <NavItem to="/app/incidents/new" icon="➕" label="Raise Incident" />
          </div>
        </>}

        {}
        {isResolver && <>
          <div className="nav-group">
            <div className="nav-group-label">My Work</div>
            <NavItem to="/app/dashboard"    icon="🏠" label="Dashboard" end />
            <NavItem to="/app/incidents"    icon="📋" label="All Incidents" />
            <NavItem to="/app/incidents/my" icon="🔧" label="Assigned to Me" />
          </div>
        </>}

        {}
        {isManager && <>
          <div className="nav-group">
            <div className="nav-group-label">Operations</div>
            <NavItem to="/app/dashboard"  icon="🏠" label="Dashboard" end />
            <NavItem to="/app/incidents"  icon="📋" label="Incident Queue" />
            {}
          </div>
          <div className="nav-group">
            <div className="nav-group-label">Monitoring</div>
            <NavItem to="/app/manager/sla"         icon="⏱️" label="SLA Monitor" />
            <NavItem to="/app/manager/escalations" icon="🔺" label="Escalations" />
          </div>
        </>}

        {}
        <div className="nav-group">
          <NavItem to="/app/notifications" icon="🔔" label="Notifications" badge={unread} />
        </div>

        <div className="sb-footer">
          <div className="sb-user" onClick={handleLogout} title="Logout">
            <Avatar name={user?.fullName || user?.username} size="avatar-sm" />
            <div style={{ overflow:'hidden', flex:1 }}>
              <div className="sb-user-name">{user?.fullName || user?.username}</div>
              <div className="sb-user-role">Click to logout →</div>
            </div>
          </div>
        </div>
      </aside>

      {}
      <div className="main-area">
        <header className="topbar">
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <Avatar name={user?.fullName || user?.username} size="avatar-sm" />
            <div style={{ lineHeight:1.3 }}>
              <div style={{ fontSize:13, fontWeight:700, color:'var(--text)' }}>
                {user?.fullName || user?.username}
              </div>
              <div style={{ fontSize:11, color:'var(--text-m)' }}>{user?.email}</div>
            </div>
          </div>
          <div className="topbar-right">
            <Bell count={unread} onClick={handleBell} />
            <button className="btn btn-secondary btn-sm" onClick={handleLogout}>Logout</button>
          </div>
        </header>

        {}
        {showNotif && (
          <div className="notif-dropdown">
            <div style={{ padding:'12px 16px', borderBottom:'1px solid var(--border-subtle)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <span style={{ fontWeight:700, fontSize:14 }}>🔔 Notifications</span>
              <button className="btn-icon" onClick={() => setShowNotif(false)}>✕</button>
            </div>
            <div style={{ overflowY:'auto', flex:1 }}>
              {notifs.length === 0
                ? <p style={{ padding:28, textAlign:'center', color:'var(--text-m)', fontSize:13 }}>All caught up! 🎉</p>
                : notifs.slice(0, 25).map(n => (
                    <div key={n.notificationId}
                      className={`notif-item ${!n.isRead ? 'unread' : ''}`}
                      onClick={() => {
                        if (n.incidentId) {
                          navigate(`/app/incidents/${n.incidentId}`);
                          setShowNotif(false);
                        }
                      }}>
                      <div style={{ fontWeight:600, fontSize:13, color:'var(--text)' }}>{n.title}</div>
                      <div style={{ fontSize:12, color:'var(--text-m)', marginTop:2, lineHeight:1.5 }}>{n.message}</div>
                    </div>
                  ))
              }
            </div>
          </div>
        )}

        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
