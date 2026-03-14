import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Badge, Button, Spinner, Modal, Form } from 'react-bootstrap';
import { Building, Plus, Pencil, Trash, Search, Filter } from 'react-bootstrap-icons';
import { departmentAPI } from '../services/api';
import { toast } from 'react-toastify';

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDepartmentModal, setShowDepartmentModal] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [departmentForm, setDepartmentForm] = useState({
    department_name: '',
    email: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await departmentAPI.getAllDepartments();
      setDepartments(response.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch departments');
      setDepartments([]); // Set empty array if error
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleShowDepartmentModal = (department = null) => {
    setEditingDepartment(department);
    if (department) {
      setDepartmentForm({
        department_name: department.department_name,
        email: department.email,
      });
    } else {
      setDepartmentForm({
        department_name: '',
        email: '',
      });
    }
    setShowDepartmentModal(true);
  };

  const handleCloseDepartmentModal = () => {
    setShowDepartmentModal(false);
    setEditingDepartment(null);
    setDepartmentForm({
      department_name: '',
      email: '',
    });
  };

  const handleDepartmentFormChange = (e) => {
    const { name, value } = e.target;
    setDepartmentForm(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmitDepartment = async (e) => {
    e.preventDefault();
    
    if (!departmentForm.department_name.trim() || !departmentForm.email.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Basic email validation
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(departmentForm.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setSubmitting(true);
    
    try {
      if (editingDepartment) {
        await departmentAPI.updateDepartment(editingDepartment.id, departmentForm);
        toast.success('Department updated successfully!');
      } else {
        await departmentAPI.createDepartment(departmentForm);
        toast.success('Department created successfully!');
      }
      handleCloseDepartmentModal();
      fetchDepartments();
    } catch (error) {
      toast.error(`Failed to ${editingDepartment ? 'update' : 'create'} department`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteDepartment = async (departmentId) => {
    if (window.confirm('Are you sure you want to delete this department? This action cannot be undone.')) {
      try {
        await departmentAPI.deleteDepartment(departmentId);
        toast.success('Department deleted successfully!');
        fetchDepartments();
      } catch (error) {
        toast.error('Failed to delete department');
      }
    }
  };

  const filteredDepartments = departments.filter(department =>
    department.department_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    department.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <h2 className="fw-bold mb-1">Department Management</h2>
          <p className="text-muted mb-0">Manage municipal departments</p>
        </div>
        <Button variant="primary" className="btn-primary-custom" onClick={() => handleShowDepartmentModal()}>
          <Plus className="me-2" />
          Add Department
        </Button>
      </div>

      {/* Statistics Cards */}
      <Row className="g-4 mb-4">
        <Col xs={12} sm={6} lg={3}>
          <Card className="custom-card h-100">
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px' }}>
                  <Building size={24} />
                </div>
                <div className="text-primary fw-semibold">Total</div>
              </div>
              <h3 className="fw-bold mb-1">{departments.length}</h3>
              <p className="text-muted mb-0">Departments</p>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <Card className="custom-card h-100">
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px' }}>
                  <i className="bi bi-envelope-fill"></i>
                </div>
                <div className="text-success fw-semibold">Active</div>
              </div>
              <h3 className="fw-bold mb-1">{departments.length}</h3>
              <p className="text-muted mb-0">Emails</p>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <Card className="custom-card h-100">
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="rounded-circle bg-info text-white d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px' }}>
                  <i className="bi bi-people-fill"></i>
                </div>
                <div className="text-info fw-semibold">Staff</div>
              </div>
              <h3 className="fw-bold mb-1">--</h3>
              <p className="text-muted mb-0">Users</p>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <Card className="custom-card h-100">
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="rounded-circle bg-warning text-white d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px' }}>
                  <i className="bi bi-graph-up"></i>
                </div>
                <div className="text-warning fw-semibold">Active</div>
              </div>
              <h3 className="fw-bold mb-1">100%</h3>
              <p className="text-muted mb-0">Status</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Search */}
      <Card className="custom-card mb-4">
        <Card.Body>
          <Row className="g-3">
            <Col md={8}>
              <div className="position-relative">
                <Search className="position-absolute start-0 top-50 translate-middle-y ms-3 text-muted" />
                <Form.Control
                  type="text"
                  placeholder="Search departments by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="ps-5"
                />
              </div>
            </Col>
            <Col md={4}>
              <Button variant="outline-secondary" className="w-100">
                <Filter className="me-2" />
                More Filters
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Departments Table */}
      <Card className="custom-card">
        <Card.Header className="card-header-custom">
          <h5 className="mb-0">Departments ({filteredDepartments.length})</h5>
        </Card.Header>
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="custom-table mb-0">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Department Name</th>
                  <th>Email</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDepartments.map((department) => (
                  <tr key={department.id}>
                    <td>
                      <Badge bg="primary" className="text-white">
                        #{department.id}
                      </Badge>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <div
                          className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-2"
                          style={{ width: '35px', height: '35px', fontSize: '0.8rem' }}
                        >
                          {department.department_name.charAt(0).toUpperCase()}
                        </div>
                        <div className="fw-semibold">{department.department_name}</div>
                      </div>
                    </td>
                    <td>
                      <div>
                        <div>{department.email}</div>
                        <small className="text-muted">Department Email</small>
                      </div>
                    </td>
                    <td>
                      <small className="text-muted">
                        {formatDate(department.created_at)}
                      </small>
                    </td>
                    <td>
                      <div className="d-flex gap-1">
                        <Button
                          variant="link"
                          size="sm"
                          className="p-0 text-decoration-none"
                          onClick={() => handleShowDepartmentModal(department)}
                        >
                          <Pencil size={16} />
                        </Button>
                        <Button
                          variant="link"
                          size="sm"
                          className="p-0 text-decoration-none text-danger"
                          onClick={() => handleDeleteDepartment(department.id)}
                        >
                          <Trash size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Department Modal */}
      <Modal show={showDepartmentModal} onHide={handleCloseDepartmentModal} centered>
        <Modal.Header closeButton>
          <Modal.Title className="d-flex align-items-center gap-2">
            <Building size={20} />
            {editingDepartment ? 'Edit Department' : 'Add New Department'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmitDepartment}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Department Name *</Form.Label>
              <Form.Control
                type="text"
                name="department_name"
                value={departmentForm.department_name}
                onChange={handleDepartmentFormChange}
                placeholder="Enter department name"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email Address *</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={departmentForm.email}
                onChange={handleDepartmentFormChange}
                placeholder="Enter department email"
                required
              />
              <Form.Text className="text-muted">
                This email will be used for department communications
              </Form.Text>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseDepartmentModal}>
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
                  {editingDepartment ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  {editingDepartment ? 'Update Department' : 'Create Department'}
                </>
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default Departments;
