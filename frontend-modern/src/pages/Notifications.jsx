import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Badge, Button, Spinner, Form, Dropdown } from 'react-bootstrap';
import { Bell, BellFill, Check, CheckAll, Trash, Search, Filter, Envelope, ExclamationTriangle, Info } from 'react-bootstrap-icons';
import { notificationAPI } from '../services/api';
import { toast } from 'react-toastify';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationAPI.getAllNotifications();
      setNotifications(response.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch notifications');
      // Mock data for demonstration if backend doesn't have notifications yet
      setNotifications([
        {
          id: 1,
          title: 'New Complaint Assigned',
          message: 'A new street light complaint has been assigned to your department',
          type: 'info',
          is_read: false,
          created_at: '2024-03-14T10:30:00Z',
          user_id: 1,
        },
        {
          id: 2,
          title: 'Complaint Resolved',
          message: 'The garbage collection complaint has been marked as resolved',
          type: 'success',
          is_read: false,
          created_at: '2024-03-14T09:15:00Z',
          user_id: 1,
        },
        {
          id: 3,
          title: 'System Maintenance',
          message: 'Scheduled maintenance will occur tonight at 11:00 PM',
          type: 'warning',
          is_read: true,
          created_at: '2024-03-13T14:20:00Z',
          user_id: 1,
        },
        {
          id: 4,
          title: 'High Priority Alert',
          message: 'Multiple complaints pending in your department',
          type: 'danger',
          is_read: false,
          created_at: '2024-03-13T11:45:00Z',
          user_id: 1,
        },
        {
          id: 5,
          title: 'Weekly Report Available',
          message: 'Your weekly performance report is now available',
          type: 'info',
          is_read: true,
          created_at: '2024-03-12T08:30:00Z',
          user_id: 1,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type) => {
    const icons = {
      info: <Info className="text-info" />,
      success: <Check className="text-success" />,
      warning: <ExclamationTriangle className="text-warning" />,
      danger: <ExclamationTriangle className="text-danger" />,
    };
    return icons[type] || <Info className="text-info" />;
  };

  const getTypeBadge = (type) => {
    const variants = {
      info: 'info',
      success: 'success',
      warning: 'warning',
      danger: 'danger',
    };
    return variants[type] || 'secondary';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return 'Today';
    } else if (diffDays === 2) {
      return 'Yesterday';
    } else if (diffDays <= 7) {
      return `${diffDays - 1} days ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      });
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationAPI.markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId ? { ...notif, is_read: true } : notif
        )
      );
      toast.success('Notification marked as read');
    } catch (error) {
      toast.error('Failed to mark notification as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, is_read: true }))
      );
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all notifications as read');
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    if (window.confirm('Are you sure you want to delete this notification?')) {
      try {
        await notificationAPI.deleteNotification(notificationId);
        setNotifications(prev =>
          prev.filter(notif => notif.id !== notificationId)
        );
        toast.success('Notification deleted');
      } catch (error) {
        toast.error('Failed to delete notification');
      }
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = (notification.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (notification.message || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || 
                         (filter === 'unread' && !notification.is_read) ||
                         (filter === 'read' && notification.is_read) ||
                         (filter === notification.type);
    return matchesSearch && matchesFilter;
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const readCount = notifications.filter(n => n.is_read).length;

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading notifications...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <div className="fade-in">
      {/* Page Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Notifications</h2>
          <p className="text-muted mb-0">Manage your notifications and alerts</p>
        </div>
        <div className="d-flex gap-2">
          <Button variant="outline-success" onClick={handleMarkAllAsRead} disabled={unreadCount === 0}>
            <CheckAll className="me-2" />
            Mark All Read
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <Row className="g-4 mb-4">
        <Col xs={12} sm={6} lg={3}>
          <Card className="custom-card h-100">
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px' }}>
                  <Bell size={24} />
                </div>
                <Badge bg="primary">Total</Badge>
              </div>
              <h3 className="fw-bold mb-1">{notifications.length}</h3>
              <p className="text-muted mb-0">All Notifications</p>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <Card className="custom-card h-100">
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div className="rounded-circle bg-warning text-white d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px' }}>
                  <BellFill size={24} />
                </div>
                <Badge bg="warning">Unread</Badge>
              </div>
              <h3 className="fw-bold mb-1">{unreadCount}</h3>
              <p className="text-muted mb-0">Unread</p>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <Card className="custom-card h-100">
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px' }}>
                  <Check size={24} />
                </div>
                <Badge bg="success">Read</Badge>
              </div>
              <h3 className="fw-bold mb-1">{readCount}</h3>
              <p className="text-muted mb-0">Read</p>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <Card className="custom-card h-100">
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div className="rounded-circle bg-info text-white d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px' }}>
                  <Envelope size={24} />
                </div>
                <Badge bg="info">Active</Badge>
              </div>
              <h3 className="fw-bold mb-1">100%</h3>
              <p className="text-muted mb-0">Delivery Rate</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card className="custom-card mb-4">
        <Card.Body>
          <Row className="g-3">
            <Col md={4}>
              <div className="position-relative">
                <Search className="position-absolute start-0 top-50 translate-middle-y ms-3 text-muted" />
                <Form.Control
                  type="text"
                  placeholder="Search notifications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="ps-5"
                />
              </div>
            </Col>
            <Col md={3}>
              <Form.Select value={filter} onChange={(e) => setFilter(e.target.value)}>
                <option value="all">All Notifications</option>
                <option value="unread">Unread</option>
                <option value="read">Read</option>
                <option value="info">Info</option>
                <option value="success">Success</option>
                <option value="warning">Warning</option>
                <option value="danger">Alert</option>
              </Form.Select>
            </Col>
            <Col md={2}>
              <Button variant="outline-secondary" className="w-100">
                <Filter className="me-2" />
                More Filters
              </Button>
            </Col>
            <Col md={3}>
              <Button variant="outline-primary" className="w-100" onClick={fetchNotifications}>
                <Bell className="me-2" />
                Refresh
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Notifications List */}
      <Card className="custom-card">
        <Card.Header className="card-header-custom">
          <h5 className="mb-0">Notifications ({filteredNotifications.length})</h5>
        </Card.Header>
        <Card.Body className="p-0">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-5">
              <Bell className="text-muted mb-3" size={48} />
              <h5 className="text-muted">No notifications found</h5>
              <p className="text-muted">Try adjusting your filters or check back later</p>
            </div>
          ) : (
            <div className="notification-list">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`notification-item d-flex align-items-start p-3 border-bottom ${!notification.is_read ? 'bg-light' : ''}`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => !notification.is_read && handleMarkAsRead(notification.id)}
                >
                  <div className="me-3">
                    <div className="rounded-circle bg-light p-2">
                      {getTypeIcon(notification.type)}
                    </div>
                  </div>
                  <div className="flex-grow-1">
                    <div className="d-flex justify-content-between align-items-start mb-1">
                      <h6 className="mb-0 fw-semibold">{notification.title || 'Untitled Notification'}</h6>
                      <div className="d-flex align-items-center gap-2">
                        <Badge bg={getTypeBadge(notification.type)} className="text-capitalize">
                          {notification.type || 'info'}
                        </Badge>
                        {!notification.is_read && (
                          <Badge bg="primary" className="pulse">New</Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-muted mb-2">{notification.message || 'No message content'}</p>
                    <div className="d-flex justify-content-between align-items-center">
                      <small className="text-muted">
                        {notification.created_at ? `${formatDate(notification.created_at)} at ${formatTime(notification.created_at)}` : 'No timestamp'}
                      </small>
                      <Dropdown>
                        <Dropdown.Toggle variant="link" size="sm" className="p-0 text-decoration-none">
                          <span className="text-muted">⋯</span>
                        </Dropdown.Toggle>
                        <Dropdown.Menu align="end">
                          {!notification.is_read && (
                            <Dropdown.Item onClick={() => handleMarkAsRead(notification.id)}>
                              <Check className="me-2" size={14} />
                              Mark as Read
                            </Dropdown.Item>
                          )}
                          <Dropdown.Item 
                            onClick={() => handleDeleteNotification(notification.id)}
                            className="text-danger"
                          >
                            <Trash className="me-2" size={14} />
                            Delete
                          </Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card.Body>
      </Card>

      <style jsx>{`
        .notification-item:hover {
          background-color: rgba(52, 152, 219, 0.05);
        }
        .pulse {
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default Notifications;
