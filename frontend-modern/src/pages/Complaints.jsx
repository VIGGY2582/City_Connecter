import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Badge, Button, Spinner, Modal, Form } from 'react-bootstrap';
import { FileText, Plus, Pencil, Eye, Search, Filter, CheckCircle, Clock, XCircle } from 'react-bootstrap-icons';
import { complaintAPI } from '../services/api';
import { toast } from 'react-toastify';

const Complaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [editingComplaint, setEditingComplaint] = useState(null);
  const [complaintForm, setComplaintForm] = useState({
    title: '',
    description: '',
    category: 'sanitation',
    priority: 'medium',
    location: '',
    status: 'pending',
  });
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const response = await complaintAPI.getAllComplaints();
      setComplaints(response.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch complaints');
      setComplaints([]); // Set empty array if error
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
    const icons = {
      pending: <Clock size={12} />,
      'in-progress': <Spinner size={12} animation="border" />,
      resolved: <CheckCircle size={12} />,
      rejected: <XCircle size={12} />,
    };
    return { variant: variants[status] || 'secondary', icon: icons[status] };
  };

  const getPriorityBadge = (priority) => {
    const variants = {
      low: 'secondary',
      medium: 'primary',
      high: 'danger',
    };
    return variants[priority] || 'secondary';
  };

  const getCategoryBadge = (category) => {
    const colors = {
      sanitation: 'success',
      'water-supply': 'info',
      electricity: 'warning',
      'public-works': 'primary',
      traffic: 'danger',
    };
    return colors[category] || 'secondary';
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

  const handleShowComplaintModal = (complaint = null) => {
    setEditingComplaint(complaint);
    if (complaint) {
      setComplaintForm({
        title: complaint.title,
        description: complaint.description,
        category: complaint.category,
        priority: complaint.priority,
        location: complaint.location,
        status: complaint.status,
      });
    } else {
      setComplaintForm({
        title: '',
        description: '',
        category: 'sanitation',
        priority: 'medium',
        location: '',
        status: 'pending',
      });
    }
    setShowComplaintModal(true);
  };

  const handleCloseComplaintModal = () => {
    setShowComplaintModal(false);
    setEditingComplaint(null);
    setComplaintForm({
      title: '',
      description: '',
      category: 'sanitation',
      priority: 'medium',
      location: '',
      status: 'pending',
    });
  };

  const handleShowDetailModal = (complaint) => {
    setSelectedComplaint(complaint);
    setShowDetailModal(true);
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedComplaint(null);
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

    setSubmitting(true);
    
    try {
      if (editingComplaint) {
        await complaintAPI.updateComplaint(editingComplaint.id, complaintForm);
        toast.success('Complaint updated successfully!');
      } else {
        await complaintAPI.createComplaint(complaintForm);
        toast.success('Complaint created successfully!');
      }
      handleCloseComplaintModal();
      fetchComplaints();
    } catch (error) {
      toast.error(`Failed to ${editingComplaint ? 'update' : 'create'} complaint`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (complaintId, newStatus) => {
    try {
      await complaintAPI.updateComplaintStatus(complaintId, { status: newStatus });
      toast.success('Complaint status updated successfully!');
      fetchComplaints();
    } catch (error) {
      toast.error('Failed to update complaint status');
    }
  };

  const filteredComplaints = complaints.filter(complaint => {
    const matchesSearch = complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         complaint.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         complaint.citizen_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || complaint.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || complaint.category === filterCategory;
    return matchesSearch && matchesStatus && matchesCategory;
  });

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
          <h2 className="fw-bold mb-1">Complaint Management</h2>
          <p className="text-muted mb-0">Manage and track all complaints</p>
        </div>
        <Button variant="primary" className="btn-primary-custom" onClick={() => handleShowComplaintModal()}>
          <Plus className="me-2" />
          New Complaint
        </Button>
      </div>

      {/* Statistics Cards */}
      <Row className="g-4 mb-4">
        <Col xs={12} sm={6} lg={3}>
          <Card className="custom-card h-100">
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="rounded-circle bg-warning text-white d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px' }}>
                  <Clock size={24} />
                </div>
                <div className="text-warning fw-semibold">+12%</div>
              </div>
              <h3 className="fw-bold mb-1">{complaints.filter(c => c.status === 'pending').length}</h3>
              <p className="text-muted mb-0">Pending</p>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <Card className="custom-card h-100">
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="rounded-circle bg-info text-white d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px' }}>
                  <Spinner size={24} animation="border" />
                </div>
                <div className="text-info fw-semibold">-3%</div>
              </div>
              <h3 className="fw-bold mb-1">{complaints.filter(c => c.status === 'in-progress').length}</h3>
              <p className="text-muted mb-0">In Progress</p>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <Card className="custom-card h-100">
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px' }}>
                  <CheckCircle size={24} />
                </div>
                <div className="text-success fw-semibold">+18%</div>
              </div>
              <h3 className="fw-bold mb-1">{complaints.filter(c => c.status === 'resolved').length}</h3>
              <p className="text-muted mb-0">Resolved</p>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <Card className="custom-card h-100">
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="rounded-circle bg-danger text-white d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px' }}>
                  <FileText size={24} />
                </div>
                <div className="text-danger fw-semibold">+25%</div>
              </div>
              <h3 className="fw-bold mb-1">{complaints.length}</h3>
              <p className="text-muted mb-0">Total</p>
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
                  placeholder="Search complaints..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="ps-5"
                />
              </div>
            </Col>
            <Col md={3}>
              <Form.Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="rejected">Rejected</option>
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                <option value="all">All Categories</option>
                <option value="sanitation">Sanitation</option>
                <option value="water-supply">Water Supply</option>
                <option value="electricity">Electricity</option>
                <option value="public-works">Public Works</option>
                <option value="traffic">Traffic</option>
              </Form.Select>
            </Col>
            <Col md={2}>
              <Button variant="outline-secondary" className="w-100">
                <Filter className="me-2" />
                More Filters
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Complaints Table */}
      <Card className="custom-card">
        <Card.Header className="card-header-custom">
          <h5 className="mb-0">Complaints ({filteredComplaints.length})</h5>
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
                  <th>Citizen</th>
                  <th>Department</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredComplaints.map((complaint) => {
                  const statusInfo = getStatusBadge(complaint.status);
                  return (
                    <tr key={complaint.id}>
                      <td>
                        <div>
                          <div className="fw-semibold">{complaint.title}</div>
                          <small className="text-muted">{complaint.location}</small>
                        </div>
                      </td>
                      <td>
                        <Badge bg={getCategoryBadge(complaint.category)} className="text-capitalize">
                          {complaint.category.replace('-', ' ')}
                        </Badge>
                      </td>
                      <td>
                        <Badge bg={statusInfo.variant} className="text-capitalize d-flex align-items-center gap-1">
                          {statusInfo.icon}
                          {complaint.status.replace('-', ' ')}
                        </Badge>
                      </td>
                      <td>
                        <Badge bg={getPriorityBadge(complaint.priority)} className="text-capitalize">
                          {complaint.priority}
                        </Badge>
                      </td>
                      <td>{complaint.citizen_name}</td>
                      <td>{complaint.department_name}</td>
                      <td>
                        <small className="text-muted">
                          {formatDate(complaint.created_at)}
                        </small>
                      </td>
                      <td>
                        <div className="d-flex gap-1">
                          <Button
                            variant="link"
                            size="sm"
                            className="p-0 text-decoration-none"
                            onClick={() => handleShowDetailModal(complaint)}
                          >
                            <Eye size={16} />
                          </Button>
                          <Button
                            variant="link"
                            size="sm"
                            className="p-0 text-decoration-none"
                            onClick={() => handleShowComplaintModal(complaint)}
                          >
                            <Pencil size={16} />
                          </Button>
                          {complaint.status === 'pending' && (
                            <Button
                              variant="link"
                              size="sm"
                              className="p-0 text-decoration-none text-success"
                              onClick={() => handleUpdateStatus(complaint.id, 'in-progress')}
                            >
                              <CheckCircle size={16} />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Complaint Modal */}
      <Modal show={showComplaintModal} onHide={handleCloseComplaintModal} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title className="d-flex align-items-center gap-2">
            <FileText size={20} />
            {editingComplaint ? 'Edit Complaint' : 'New Complaint'}
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
              <Col md={4}>
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
              <Col md={4}>
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
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    name="status"
                    value={complaintForm.status}
                    onChange={handleComplaintFormChange}
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="rejected">Rejected</option>
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
                placeholder="Enter location"
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseComplaintModal}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  {editingComplaint ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  {editingComplaint ? 'Update Complaint' : 'Create Complaint'}
                </>
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Detail Modal */}
      <Modal show={showDetailModal} onHide={handleCloseDetailModal} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title className="d-flex align-items-center gap-2">
            <Eye size={20} />
            Complaint Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedComplaint && (
            <div>
              <Row className="mb-3">
                <Col md={6}>
                  <h6 className="text-muted">Title</h6>
                  <p className="fw-semibold">{selectedComplaint.title}</p>
                </Col>
                <Col md={6}>
                  <h6 className="text-muted">Status</h6>
                  <Badge bg={getStatusBadge(selectedComplaint.status).variant} className="text-capitalize">
                    {selectedComplaint.status.replace('-', ' ')}
                  </Badge>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <h6 className="text-muted">Category</h6>
                  <Badge bg={getCategoryBadge(selectedComplaint.category)} className="text-capitalize">
                    {selectedComplaint.category.replace('-', ' ')}
                  </Badge>
                </Col>
                <Col md={6}>
                  <h6 className="text-muted">Priority</h6>
                  <Badge bg={getPriorityBadge(selectedComplaint.priority)} className="text-capitalize">
                    {selectedComplaint.priority}
                  </Badge>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <h6 className="text-muted">Citizen</h6>
                  <p>{selectedComplaint.citizen_name}</p>
                </Col>
                <Col md={6}>
                  <h6 className="text-muted">Department</h6>
                  <p>{selectedComplaint.department_name}</p>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={12}>
                  <h6 className="text-muted">Location</h6>
                  <p>{selectedComplaint.location}</p>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={12}>
                  <h6 className="text-muted">Description</h6>
                  <p>{selectedComplaint.description}</p>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <h6 className="text-muted">Created</h6>
                  <p>{formatDate(selectedComplaint.created_at)}</p>
                </Col>
                <Col md={6}>
                  <h6 className="text-muted">Last Updated</h6>
                  <p>{formatDate(selectedComplaint.updated_at)}</p>
                </Col>
              </Row>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDetailModal}>
            Close
          </Button>
          <Button variant="primary" onClick={() => {
            handleCloseDetailModal();
            handleShowComplaintModal(selectedComplaint);
          }}>
            <Pencil className="me-2" />
            Edit
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Complaints;
