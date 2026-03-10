import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { complaintAPI, notificationAPI } from '../services/api';
import ComplaintForm from '../components/ComplaintForm';
import ComplaintList from '../components/ComplaintList';
import UserManagement from './UserManagement';
import DepartmentManagement from '../components/DepartmentManagement';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeTab, setActiveTab] = useState('complaints');
  const [loading, setLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    console.log('Dashboard useEffect - User:', user);
    if (user?.role === 'citizen') {
      console.log('Loading citizen complaints...');
      loadUserComplaints();
    } else if (user?.role === 'admin') {
      console.log('Loading admin complaints...');
      loadAdminComplaints();
    } else if (user?.role === 'department') {
      console.log('Loading department complaints for user:', user.name, 'department_id:', user.department_id);
      loadDepartmentComplaints();
    }
    loadNotifications();
  }, [user]);

  const loadAdminComplaints = async () => {
    try {
      const response = await complaintAPI.getAll();
      setComplaints(response.data.data);
    } catch (error) {
      console.error('Error loading complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDepartmentComplaints = async () => {
    try {
      console.log('Loading department complaints...');
      const response = await complaintAPI.getDepartmentComplaints();
      console.log('Department complaints response:', response);
      setComplaints(response.data.data);
    } catch (error) {
      console.error('Error loading department complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserComplaints = async () => {
    try {
      const response = await complaintAPI.getUserComplaints();
      setComplaints(response.data.data);
    } catch (error) {
      console.error('Error loading complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadNotifications = async () => {
    try {
      const [notificationsResponse, unreadResponse] = await Promise.all([
        notificationAPI.getAll(),
        notificationAPI.getUnreadCount(),
      ]);
      setNotifications(notificationsResponse.data.data);
      setUnreadCount(unreadResponse.data.data.count);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const handleComplaintCreated = () => {
    if (user?.role === 'citizen') {
      loadUserComplaints();
    }
  };

  const markNotificationAsRead = async (notificationId) => {
    try {
      await notificationAPI.markAsRead(notificationId);
      loadNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Submitted': 'bg-warning text-dark',
      'Assigned': 'bg-info text-white',
      'In Progress': 'bg-primary text-white',
      'Resolved': 'bg-success text-white',
      'Rejected': 'bg-danger text-white',
    };
    return colors[status] || 'bg-secondary text-white';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'Low': 'bg-secondary text-white',
      'Medium': 'bg-warning text-dark',
      'High': 'bg-danger text-white',
    };
    return colors[priority] || 'bg-secondary text-white';
  };

  return (
    <div className="min-vh-100 bg-light">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container-fluid px-4">
          <div className="d-flex justify-content-between align-items-center py-3">
            <div>
              <h1 className="h3 mb-0">City Connector</h1>
              <p className="text-muted mb-0">Welcome, {user?.name}</p>
            </div>
            <div className="d-flex align-items-center gap-3">
              <div className="position-relative">
                <button 
                  className="btn btn-outline-secondary p-2"
                  onClick={() => setShowNotifications(!showNotifications)}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.406-1.406A2.992 2.992 0 0111.594 2.992H6a2.992 2.992 0 00-2.594 2.992H3a2 2 0 00-2 2v12a2 2 0 002 2h6.586a2.992 2.992 0 011.594 2.992H17a2 2 0 002-2V7a2 2 0 00-2-2z" />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                      {unreadCount}
                    </span>
                  )}
                </button>
                
                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="position-absolute top-100 end-0 mt-2 bg-white border rounded shadow-lg" style={{ width: '300px', zIndex: 1000 }}>
                    <div className="p-3 border-bottom">
                      <h6 className="mb-0">Notifications</h6>
                    </div>
                    <div className="max-height-200 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-3 text-center text-muted">
                          No notifications
                        </div>
                      ) : (
                        notifications.map(notification => (
                          <div 
                            key={notification.id} 
                            className={`p-3 border-bottom ${notification.is_read ? 'bg-light' : ''}`}
                            onClick={() => markNotificationAsRead(notification.id)}
                            style={{ cursor: 'pointer' }}
                          >
                            <div className="small">
                              <strong>{notification.title}</strong>
                              <p className="mb-1 text-muted">{notification.message}</p>
                              <small className="text-muted">
                                {new Date(notification.created_at).toLocaleDateString()}
                              </small>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={logout}
                className="btn btn-danger"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-fluid px-4 py-4">
        {/* Role-based Navigation */}
        <div className="mb-4">
          <nav className="nav nav-pills">
            {user?.role === 'citizen' && (
              <>
                <button
                  onClick={() => setActiveTab('complaints')}
                  className={`nav-link ${activeTab === 'complaints' ? 'active' : ''}`}
                >
                  My Complaints
                </button>
                <button
                  onClick={() => setActiveTab('new')}
                  className={`nav-link ${activeTab === 'new' ? 'active' : ''}`}
                >
                  New Complaint
                </button>
              </>
            )}
            {user?.role === 'admin' && (
              <>
                <button
                  onClick={() => setActiveTab('all-complaints')}
                  className={`nav-link ${activeTab === 'all-complaints' ? 'active' : ''}`}
                >
                  All Complaints
                </button>
                <button
                  onClick={() => setActiveTab('departments')}
                  className={`nav-link ${activeTab === 'departments' ? 'active' : ''}`}
                >
                  Departments
                </button>
                <button
                  onClick={() => setActiveTab('users')}
                  className={`nav-link ${activeTab === 'users' ? 'active' : ''}`}
                >
                  User Management
                </button>
              </>
            )}
            {user?.role === 'department' && (
              <button
                onClick={() => setActiveTab('assigned')}
                className={`nav-link ${activeTab === 'assigned' ? 'active' : ''}`}
              >
                Assigned Complaints
              </button>
            )}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'complaints' && (
          <ComplaintList complaints={complaints} loading={loading} />
        )}
        {activeTab === 'new' && (
          <ComplaintForm onComplaintCreated={handleComplaintCreated} />
        )}
        {activeTab === 'all-complaints' && (
          <div>
            <h2 className="h4 mb-3">All Complaints</h2>
            <ComplaintList complaints={complaints} loading={loading} isAdmin={true} />
          </div>
        )}
        {activeTab === 'departments' && (
          <DepartmentManagement />
        )}
        {activeTab === 'users' && (
          <UserManagement />
        )}
        {activeTab === 'assigned' && (
          <div>
            <h2 className="h4 mb-3">Assigned Complaints</h2>
            <ComplaintList complaints={complaints} loading={loading} isDepartment={true} />
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
