import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Badge, Button, Spinner, Modal, Form } from 'react-bootstrap';
import { Person, Plus, Pencil, Trash, Search, Filter } from 'react-bootstrap-icons';
import { userAPI } from '../services/api';
import { toast } from 'react-toastify';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    role: 'citizen',
    department_id: '',
    phone: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getAllUsers();
      setUsers(response.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch users');
      setUsers([]); // Set empty array if error
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadge = (role) => {
    const variants = {
      admin: 'danger',
      department: 'primary',
      citizen: 'success',
    };
    return variants[role] || 'secondary';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleShowUserModal = (user = null) => {
    setEditingUser(user);
    if (user) {
      setUserForm({
        name: user.name,
        email: user.email,
        role: user.role,
        department_id: user.department_id || '',
        phone: user.phone || '',
      });
    } else {
      setUserForm({
        name: '',
        email: '',
        role: 'citizen',
        department_id: '',
        phone: '',
      });
    }
    setShowUserModal(true);
  };

  const handleCloseUserModal = () => {
    setShowUserModal(false);
    setEditingUser(null);
    setUserForm({
      name: '',
      email: '',
      role: 'citizen',
      department_id: '',
      phone: '',
    });
  };

  const handleUserFormChange = (e) => {
    const { name, value } = e.target;
    setUserForm(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmitUser = async (e) => {
    e.preventDefault();
    
    if (!userForm.name.trim() || !userForm.email.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    
    try {
      if (editingUser) {
        await userAPI.updateUser(editingUser.id, userForm);
        toast.success('User updated successfully!');
      } else {
        await userAPI.createUser(userForm);
        toast.success('User created successfully!');
      }
      handleCloseUserModal();
      fetchUsers();
    } catch (error) {
      toast.error(`Failed to ${editingUser ? 'update' : 'create'} user`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await userAPI.deleteUser(userId);
        toast.success('User deleted successfully!');
        fetchUsers();
      } catch (error) {
        toast.error('Failed to delete user');
      }
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
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
          <h2 className="fw-bold mb-1">User Management</h2>
          <p className="text-muted mb-0">Manage system users and permissions</p>
        </div>
        <Button variant="primary" className="btn-primary-custom" onClick={() => handleShowUserModal()}>
          <Plus className="me-2" />
          Add User
        </Button>
      </div>

      {/* Filters */}
      <Card className="custom-card mb-4">
        <Card.Body>
          <Row className="g-3">
            <Col md={6}>
              <div className="position-relative">
                <Search className="position-absolute start-0 top-50 translate-middle-y ms-3 text-muted" />
                <Form.Control
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="ps-5"
                />
              </div>
            </Col>
            <Col md={3}>
              <Form.Select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="department">Department</option>
                <option value="citizen">Citizen</option>
              </Form.Select>
            </Col>
            <Col md={3}>
              <Button variant="outline-secondary" className="w-100">
                <Filter className="me-2" />
                More Filters
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Users Table */}
      <Card className="custom-card">
        <Card.Header className="card-header-custom">
          <h5 className="mb-0">Users ({filteredUsers.length})</h5>
        </Card.Header>
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="custom-table mb-0">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Department</th>
                  <th>Phone</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <div
                          className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-2"
                          style={{ width: '35px', height: '35px', fontSize: '0.8rem' }}
                        >
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="fw-semibold">{user.name}</div>
                          <small className="text-muted">ID: #{user.id}</small>
                        </div>
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>
                      <Badge bg={getRoleBadge(user.role)} className="text-capitalize">
                        {user.role}
                      </Badge>
                    </td>
                    <td>
                      {user.department_id ? (
                        <Badge bg="light" text="dark">
                          Dept #{user.department_id}
                        </Badge>
                      ) : (
                        <span className="text-muted">N/A</span>
                      )}
                    </td>
                    <td>{user.phone || 'N/A'}</td>
                    <td>
                      <small className="text-muted">
                        {formatDate(user.created_at)}
                      </small>
                    </td>
                    <td>
                      <div className="d-flex gap-1">
                        <Button
                          variant="link"
                          size="sm"
                          className="p-0 text-decoration-none"
                          onClick={() => handleShowUserModal(user)}
                        >
                          <Pencil size={16} />
                        </Button>
                        <Button
                          variant="link"
                          size="sm"
                          className="p-0 text-decoration-none text-danger"
                          onClick={() => handleDeleteUser(user.id)}
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

      {/* User Modal */}
      <Modal show={showUserModal} onHide={handleCloseUserModal} centered>
        <Modal.Header closeButton>
          <Modal.Title className="d-flex align-items-center gap-2">
            <Person size={20} />
            {editingUser ? 'Edit User' : 'Add New User'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmitUser}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Name *</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={userForm.name}
                onChange={handleUserFormChange}
                placeholder="Enter user name"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email *</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={userForm.email}
                onChange={handleUserFormChange}
                placeholder="Enter email address"
                required
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Role</Form.Label>
                  <Form.Select
                    name="role"
                    value={userForm.role}
                    onChange={handleUserFormChange}
                  >
                    <option value="citizen">Citizen</option>
                    <option value="department">Department</option>
                    <option value="admin">Admin</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Department ID</Form.Label>
                  <Form.Control
                    type="number"
                    name="department_id"
                    value={userForm.department_id}
                    onChange={handleUserFormChange}
                    placeholder="Department ID"
                    disabled={userForm.role !== 'department'}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Phone</Form.Label>
              <Form.Control
                type="tel"
                name="phone"
                value={userForm.phone}
                onChange={handleUserFormChange}
                placeholder="Enter phone number"
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseUserModal}>
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
                  {editingUser ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  {editingUser ? 'Update User' : 'Create User'}
                </>
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default Users;
