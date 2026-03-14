import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Badge, Button, Spinner, Modal, Form } from 'react-bootstrap';
import { Building, Plus, X } from 'react-bootstrap-icons';
import DashboardCards from '../components/dashboard/DashboardCards';
import { complaintAPI, userAPI, departmentAPI } from '../services/api';
import { toast } from 'react-toastify';

const Dashboard = () => {
  const [stats, setStats] = useState({});
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [complaintForm, setComplaintForm] = useState({
    title: '',
    description: '',
    category: 'sanitation',
    priority: 'medium',
    location: '',
  });
  const [submittingComplaint, setSubmittingComplaint] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch dashboard statistics
      const statsData = {
        totalComplaints: 156,
        pendingComplaints: 23,
        inProgressComplaints: 45,
        resolvedComplaints: 88,
        totalUsers: 342,
        totalDepartments: 5,
        newComplaintsToday: 12,
        avgResolutionTime: '2.5 days',
      };
      
      setStats(statsData);

      // Fetch recent complaints (mock data for now)
      const mockComplaints = [
        {
          id: 1,
          title: 'Street Light Not Working',
          category: 'Electricity',
          status: 'pending',
          priority: 'high',
          created_at: '2024-01-15T10:30:00Z',
          citizen_name: 'John Doe',
          department_name: 'Electricity',
        },
        {
          id: 2,
          title: 'Garbage Collection Issue',
          category: 'Sanitation',
          status: 'in-progress',
          priority: 'medium',
          created_at: '2024-01-15T09:15:00Z',
          citizen_name: 'Jane Smith',
          department_name: 'Sanitation',
        },
        {
          id: 3,
          title: 'Water Supply Problem',
          category: 'Water Supply',
          status: 'resolved',
          priority: 'high',
          created_at: '2024-01-14T14:20:00Z',
          citizen_name: 'Mike Johnson',
          department_name: 'Water Supply',
        },
        {
          id: 4,
          title: 'Road Damage',
          category: 'Public Works',
          status: 'pending',
          priority: 'low',
          created_at: '2024-01-14T11:45:00Z',
          citizen_name: 'Sarah Wilson',
          department_name: 'Public Works',
        },
        {
          id: 5,
          title: 'Traffic Signal Malfunction',
          category: 'Traffic',
          status: 'in-progress',
          priority: 'high',
          created_at: '2024-01-14T08:30:00Z',
          citizen_name: 'Tom Brown',
          department_name: 'Traffic',
        },
      ];
      
      setRecentComplaints(mockComplaints);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: 'warning',
      'in-progress': 'info',
      resolved: 'success',
      rejected: 'danger',
    };
    return variants[status] || 'secondary';
  };

  const getPriorityBadge = (priority) => {
    const variants = {
      low: 'secondary',
      medium: 'primary',
      high: 'danger',
    };
    return variants[priority] || 'secondary';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Complaint modal handlers
  const handleShowComplaintModal = () => {
    setShowComplaintModal(true);
  };

  const handleCloseComplaintModal = () => {
    setShowComplaintModal(false);
    setComplaintForm({
      title: '',
      description: '',
      category: 'sanitation',
      priority: 'medium',
      location: '',
    });
  };

  const handleComplaintFormChange = (e) => {
    const { name, value } = e.target;
    setComplaintForm(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmitComplaint = async (e) => {
    e.preventDefault();
    
    if (!complaintForm.title.trim() || !complaintForm.description.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmittingComplaint(true);
    
    try {
      const response = await complaintAPI.createComplaint(complaintForm);
      toast.success('Complaint submitted successfully!');
      handleCloseComplaintModal();
      fetchDashboardData(); // Refresh dashboard data
    } catch (error) {
      toast.error('Failed to submit complaint');
    } finally {
      setSubmittingComplaint(false);
    }
  };

  // Quick action handlers
  const handleQuickAction = (action) => {
    switch (action) {
      case 'new-complaint':
        handleShowComplaintModal();
        break;
      case 'manage-users':
        toast.info('User management page coming soon!');
        break;
      case 'department-settings':
        toast.info('Department settings page coming soon!');
        break;
      case 'view-analytics':
        toast.info('Analytics page coming soon!');
        break;
      default:
        break;
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <div className="fade-in">
      {/* Page Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Dashboard Overview</h2>
          <p className="text-muted mb-0">Welcome to City Connect Dashboard</p>
        </div>
        <Button variant="primary" className="btn-primary-custom" onClick={handleShowComplaintModal}>
          <Building className="me-2" />
          New Complaint
        </Button>
      </div>

      {/* Dashboard Cards */}
      <DashboardCards stats={stats} />

      {/* Recent Complaints */}
      <Row className="g-4">
        <Col lg={8}>
          <Card className="custom-card">
            <Card.Header className="card-header-custom">
              <h5 className="mb-0">Recent Complaints</h5>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="table-responsive">
                <Table hover className="custom-table mb-0">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Category</th>
                      <th>Status</th>
                      <th>Priority</th>
                      <th>Submitted</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentComplaints.map((complaint) => (
                      <tr key={complaint.id}>
                        <td>
                          <div>
                            <div className="fw-semibold">{complaint.title}</div>
                            <small className="text-muted">
                              by {complaint.citizen_name}
                            </small>
                          </div>
                        </td>
                        <td>
                          <Badge bg="light" text="dark" className="text-capitalize">
                            {complaint.category}
                          </Badge>
                        </td>
                        <td>
                          <Badge bg={getStatusBadge(complaint.status)} className="text-capitalize">
                            {complaint.status.replace('-', ' ')}
                          </Badge>
                        </td>
                        <td>
                          <Badge bg={getPriorityBadge(complaint.priority)} className="text-capitalize">
                            {complaint.priority}
                          </Badge>
                        </td>
                        <td>
                          <small className="text-muted">
                            {formatDate(complaint.created_at)}
                          </small>
                        </td>
                        <td>
                          <Button 
                            variant="link" 
                            size="sm" 
                            className="p-0 text-decoration-none"
                            onClick={() => toast.info(`Viewing complaint #${complaint.id}: ${complaint.title}`)}
                          >
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Quick Actions */}
        <Col lg={4}>
          <Card className="custom-card">
            <Card.Header className="card-header-custom">
              <h5 className="mb-0">Quick Actions</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-grid gap-2">
                <Button variant="outline-primary" className="d-flex align-items-center justify-content-start gap-2" onClick={() => handleQuickAction('new-complaint')}>
                  <Building size={18} />
                  Create New Complaint
                </Button>
                <Button variant="outline-info" className="d-flex align-items-center justify-content-start gap-2" onClick={() => handleQuickAction('manage-users')}>
                  <i className="bi bi-people"></i>
                  Manage Users
                </Button>
                <Button variant="outline-success" className="d-flex align-items-center justify-content-start gap-2" onClick={() => handleQuickAction('department-settings')}>
                  <i className="bi bi-building"></i>
                  Department Settings
                </Button>
                <Button variant="outline-warning" className="d-flex align-items-center justify-content-start gap-2" onClick={() => handleQuickAction('view-analytics')}>
                  <i className="bi bi-graph-up"></i>
                  View Analytics
                </Button>
              </div>
            </Card.Body>
          </Card>

          {/* System Status */}
          <Card className="custom-card mt-4">
            <Card.Header className="card-header-custom">
              <h5 className="mb-0">System Status</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span>Database</span>
                <Badge bg="success">Online</Badge>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span>API Server</span>
                <Badge bg="success">Operational</Badge>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span>Email Service</span>
                <Badge bg="success">Active</Badge>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <span>Storage</span>
                <Badge bg="warning">78% Used</Badge>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* New Complaint Modal */}
      <Modal show={showComplaintModal} onHide={handleCloseComplaintModal} centered>
        <Modal.Header closeButton>
          <Modal.Title className="d-flex align-items-center gap-2">
            <Plus size={20} />
            Create New Complaint
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmitComplaint}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Title *</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={complaintForm.title}
                onChange={handleComplaintFormChange}
                placeholder="Enter complaint title"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description *</Form.Label>
              <Form.Control
                as="textarea"
                name="description"
                value={complaintForm.description}
                onChange={handleComplaintFormChange}
                placeholder="Describe your complaint in detail"
                rows={4}
                required
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Category</Form.Label>
                  <Form.Select
                    name="category"
                    value={complaintForm.category}
                    onChange={handleComplaintFormChange}
                  >
                    <option value="sanitation">Sanitation</option>
                    <option value="water-supply">Water Supply</option>
                    <option value="electricity">Electricity</option>
                    <option value="public-works">Public Works</option>
                    <option value="traffic">Traffic</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Priority</Form.Label>
                  <Form.Select
                    name="priority"
                    value={complaintForm.priority}
                    onChange={handleComplaintFormChange}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Location</Form.Label>
              <Form.Control
                type="text"
                name="location"
                value={complaintForm.location}
                onChange={handleComplaintFormChange}
                placeholder="Enter location (optional)"
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseComplaintModal}>
              <X className="me-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={submittingComplaint}
            >
              {submittingComplaint ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  Submitting...
                </>
              ) : (
                <>
                  <Plus className="me-2" />
                  Submit Complaint
                </>
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default Dashboard;
