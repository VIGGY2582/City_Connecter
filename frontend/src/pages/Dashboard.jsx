import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { complaintAPI, notificationAPI } from '../services/api';
import ComplaintForm from '../components/ComplaintForm';
import ComplaintList from '../components/ComplaintList';
import UserManagement from './UserManagement';
import DepartmentManagement from '../components/DepartmentManagement';
import Analytics from '../components/Analytics';

// ─── Toast System ──────────────────────────────────────────────
let toastIdCounter = 0;
let toastSetterRef = null;

export const showToast = (message, type = 'info') => {
  if (toastSetterRef) {
    const id = ++toastIdCounter;
    toastSetterRef(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      toastSetterRef(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }
};

// ─── Stats Cards ────────────────────────────────────────────────
const StatsGrid = ({ complaints, role }) => {
  const counts = {
    total:      complaints.length,
    submitted:  complaints.filter(c => c.status === 'Submitted').length,
    inprogress: complaints.filter(c => c.status === 'In Progress').length,
    resolved:   complaints.filter(c => c.status === 'Resolved').length,
    rejected:   complaints.filter(c => c.status === 'Rejected').length,
  };

  const cards = role === 'citizen'
    ? [
        { label: 'My Complaints', num: counts.total,      icon: '📋', color: 'purple' },
        { label: 'Submitted',     num: counts.submitted,  icon: '📤', color: 'yellow' },
        { label: 'In Progress',   num: counts.inprogress, icon: '⚙️', color: 'cyan'   },
        { label: 'Resolved',      num: counts.resolved,   icon: '✅', color: 'green'  },
      ]
    : [
        { label: 'Total',       num: counts.total,      icon: '📊', color: 'purple' },
        { label: 'Pending',     num: counts.submitted,  icon: '⏳', color: 'yellow' },
        { label: 'In Progress', num: counts.inprogress, icon: '⚙️', color: 'cyan'   },
        { label: 'Resolved',    num: counts.resolved,   icon: '✅', color: 'green'  },
        { label: 'Rejected',    num: counts.rejected,   icon: '❌', color: 'red'    },
      ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cards.length}, 1fr)`, gap: 16, marginBottom: 28 }}>
      {cards.map(c => (
        <div key={c.label} className={`stat-card ${c.color}`}>
          <div className={`stat-icon ${c.color}`}>{c.icon}</div>
          <div className="stat-num">{c.num}</div>
          <div className="stat-label">{c.label}</div>
        </div>
      ))}
    </div>
  );
};

// ─── Notification Panel ─────────────────────────────────────────
const NotificationPanel = ({ notifications, onClose, onMarkRead, onMarkAll }) => (
  <div className="notif-panel" style={{ position: 'absolute', top: '100%', right: 0, marginTop: 8 }}>
    <div className="notif-panel-header">
      <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--clr-text)' }}>
        🔔 Notifications
      </span>
      <button className="btn-glass" style={{ fontSize: '0.75rem', padding: '4px 10px' }} onClick={onMarkAll}>
        Mark all read
      </button>
    </div>
    <div style={{ maxHeight: 320, overflowY: 'auto' }}>
      {notifications.length === 0 ? (
        <div className="text-center p-4" style={{ color: 'var(--clr-text-2)', fontSize: '0.85rem' }}>
          🎉 All caught up!
        </div>
      ) : notifications.map(n => (
        <div key={n.id} className={`notif-item ${!n.is_read ? 'unread' : ''}`}
          onClick={() => { onMarkRead(n.id); onClose(); }}>
          <div style={{ fontSize: '0.82rem', fontWeight: !n.is_read ? 600 : 400, color: 'var(--clr-text)' }}>
            {n.message || n.title}
          </div>
          <div style={{ fontSize: '0.73rem', color: 'var(--clr-text-3)', marginTop: 3 }}>
            {new Date(n.created_at).toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ─── Main Dashboard ─────────────────────────────────────────────
const Dashboard = () => {
  const { user, logout } = useAuth();
  const [complaints, setComplaints]         = useState([]);
  const [notifications, setNotifications]   = useState([]);
  const [unreadCount, setUnreadCount]       = useState(0);
  const [activeTab, setActiveTab]           = useState('');
  const [loading, setLoading]               = useState(true);
  const [showNotif, setShowNotif]           = useState(false);
  const [toasts, setToasts]                 = useState([]);
  const notifRef = useRef(null);

  // Wire toast setter
  toastSetterRef = setToasts;

  // Set default tab based on role
  useEffect(() => {
    if (!user) return;
    if (user.role === 'citizen')    setActiveTab('complaints');
    if (user.role === 'admin')      setActiveTab('all-complaints');
    if (user.role === 'department') setActiveTab('assigned');
  }, [user?.role]);

  useEffect(() => {
    if (!user || !activeTab) return;
    if (activeTab === 'complaints' && user.role === 'citizen') loadUserComplaints();
    if (activeTab === 'all-complaints' && user.role === 'admin') loadAdminComplaints();
    if (activeTab === 'assigned' && user.role === 'department') loadDepartmentComplaints();
    
    // Only load notifications once, or when user changes
    if (notifications.length === 0) {
      loadNotifications();
    }
  }, [user, activeTab]);

  // Close notif panel on outside click
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotif(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const loadAdminComplaints = async () => {
    try {
      const res = await complaintAPI.getAll();
      setComplaints(res.data.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const loadDepartmentComplaints = async () => {
    try {
      const res = await complaintAPI.getDepartmentComplaints();
      setComplaints(res.data.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const loadUserComplaints = async () => {
    try {
      const res = await complaintAPI.getUserComplaints();
      setComplaints(res.data.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const loadNotifications = async () => {
    try {
      const [nr, ur] = await Promise.all([
        notificationAPI.getAll(),
        notificationAPI.getUnreadCount(),
      ]);
      setNotifications(nr.data.data);
      setUnreadCount(ur.data.data.count);
    } catch (e) { console.error(e); }
  };

  const markNotifRead = async (id) => {
    try {
      await notificationAPI.markAsRead(id);
      loadNotifications();
    } catch (e) { console.error(e); }
  };

  const markAllRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      loadNotifications();
    } catch (e) { console.error(e); }
  };

  const handleComplaintCreated = () => {
    if (user?.role === 'citizen') loadUserComplaints();
  };

  // Build nav items per role
  const navItems = user?.role === 'citizen' ? [
    { id: 'complaints', label: 'My Complaints', icon: '📋' },
    { id: 'new',        label: 'New Complaint',  icon: '➕' },
  ] : user?.role === 'admin' ? [
    { id: 'all-complaints', label: 'All Complaints',   icon: '📊' },
    { id: 'departments',    label: 'Departments',       icon: '🏛️' },
    { id: 'users',          label: 'User Management',  icon: '👥' },
    { id: 'analytics',      label: 'Analytics',         icon: '📈' },
  ] : [
    { id: 'assigned', label: 'Assigned Complaints', icon: '📋' },
  ];

  const tabTitles = {
    'complaints':     'My Complaints',
    'new':            'Submit New Complaint',
    'all-complaints': 'All Complaints',
    'departments':    'Department Management',
    'users':          'User Management',
    'analytics':      'System Analytics',
    'assigned':       'Assigned Complaints',
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  return (
    <div>
      {/* Toast Container */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.type}`}>
            <span>{t.type === 'success' ? '✅' : t.type === 'error' ? '❌' : 'ℹ️'}</span>
            {t.message}
          </div>
        ))}
      </div>

      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">🏙️</div>
          <div className="sidebar-logo-text">City Connector</div>
        </div>

        <nav className="sidebar-nav">
          {/* Role badge */}
          <div style={{ padding: '8px 14px 14px' }}>
            <span className={`badge badge-${user?.role}`} style={{ fontSize: '0.72rem' }}>
              {user?.role === 'admin' ? '🛡️' : user?.role === 'department' ? '🏛️' : '👤'} {user?.role}
            </span>
          </div>

          {navItems.map(item => (
            <button
              key={item.id}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="btn-danger-glow w-full" onClick={logout}>
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* ── Topbar ── */}
      <header className="topbar">
        <div>
          <div className="topbar-title">{tabTitles[activeTab] || 'Dashboard'}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--clr-text-3)', marginTop: 2 }}>
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]}!
          </div>
        </div>

        <div className="topbar-right">
          {/* Notification Bell */}
          <div style={{ position: 'relative' }} ref={notifRef}>
            <button className="notif-btn" onClick={() => setShowNotif(!showNotif)}>
              🔔
              {unreadCount > 0 && (
                <span className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
              )}
            </button>
            {showNotif && (
              <NotificationPanel
                notifications={notifications}
                onClose={() => setShowNotif(false)}
                onMarkRead={markNotifRead}
                onMarkAll={markAllRead}
              />
            )}
          </div>

          {/* User Chip */}
          <div className="user-chip">
            <div className="user-avatar">{initials}</div>
            <span className="user-name">{user?.name}</span>
          </div>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="main-content">
        <div className="page-content">

          {/* Stats (citizen + admin + department views that show complaints) */}
          {['complaints','all-complaints','assigned'].includes(activeTab) && !loading && (
            <StatsGrid complaints={complaints} role={user?.role} />
          )}

          {/* Loading */}
          {loading && ['complaints','all-complaints','assigned'].includes(activeTab) ? (
            <div className="text-center" style={{ padding: 80 }}>
              <div className="spinner spinner-lg" style={{ margin: '0 auto' }} />
              <p style={{ color: 'var(--clr-text-2)', marginTop: 16 }}>Loading...</p>
            </div>
          ) : (
            <>
              {activeTab === 'complaints' && (
                <ComplaintList complaints={complaints} loading={loading} onRefresh={loadUserComplaints} />
              )}
              {activeTab === 'new' && (
                <ComplaintForm onComplaintCreated={() => { handleComplaintCreated(); setActiveTab('complaints'); }} />
              )}
              {activeTab === 'all-complaints' && (
                <ComplaintList complaints={complaints} loading={loading} isAdmin onRefresh={loadAdminComplaints} />
              )}
              {activeTab === 'departments' && <DepartmentManagement />}
              {activeTab === 'users'       && <UserManagement />}
              {activeTab === 'analytics'   && <Analytics />}
              {activeTab === 'assigned'    && (
                <ComplaintList complaints={complaints} loading={loading} isDepartment onRefresh={loadDepartmentComplaints} />
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
