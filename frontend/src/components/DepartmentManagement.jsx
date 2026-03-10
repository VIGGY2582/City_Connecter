import React, { useState, useEffect } from 'react';

const DepartmentManagement = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [formData, setFormData] = useState({
    department_name: '',
    email: ''
  });

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/departments', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setDepartments(data.data);
      }
    } catch (error) {
      console.error('Error loading departments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setFormData({ department_name: '', email: '' });
    setEditingDept(null);
    setShowAddModal(true);
  };

  const handleEdit = (dept) => {
    setFormData({
      department_name: dept.department_name,
      email: dept.email
    });
    setEditingDept(dept);
    setShowAddModal(true);
  };

  const handleSubmit = async () => {
    try {
      const url = editingDept 
        ? `http://localhost:5000/api/departments/${editingDept.id}`
        : `http://localhost:5000/api/departments`;
      
      const method = editingDept ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (data.success) {
        loadDepartments();
        setShowAddModal(false);
        setFormData({ department_name: '', email: '' });
        setEditingDept(null);
        alert(editingDept ? 'Department updated successfully!' : 'Department added successfully!');
      } else {
        alert('Failed to save department');
      }
    } catch (error) {
      console.error('Error saving department:', error);
      alert('Error saving department');
    }
  };

  const handleDelete = async (deptId) => {
    if (window.confirm('Are you sure you want to delete this department? This action cannot be undone.')) {
      try {
        const response = await fetch(`http://localhost:5000/api/departments/${deptId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        const data = await response.json();
        if (data.success) {
          loadDepartments();
          alert('Department deleted successfully!');
        } else {
          alert('Failed to delete department');
        }
      } catch (error) {
        console.error('Error deleting department:', error);
        alert('Error deleting department');
      }
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="h4 mb-0">Department Management</h2>
        <button
          className="btn btn-primary"
          onClick={handleAdd}
        >
          <i className="bi bi-plus-circle me-2"></i>
          Add Department
        </button>
      </div>

      <div className="table-responsive">
        <table className="table table-striped table-hover">
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Department Name</th>
              <th>Email</th>
              <th>Created Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {departments.map(dept => (
              <tr key={dept.id}>
                <td>{dept.id}</td>
                <td>
                  <strong>{dept.department_name}</strong>
                </td>
                <td>{dept.email}</td>
                <td>{new Date(dept.created_at).toLocaleDateString()}</td>
                <td>
                  <div className="btn-group" role="group">
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => handleEdit(dept)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDelete(dept.id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {departments.length === 0 && (
          <div className="text-center py-5">
            <p className="text-muted">No departments found. Click "Add Department" to create one.</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingDept ? 'Edit Department' : 'Add New Department'}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowAddModal(false)}>
                  <span>&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <form>
                  <div className="mb-3">
                    <label className="form-label">Department Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.department_name}
                      onChange={(e) => setFormData({...formData, department_name: e.target.value})}
                      placeholder="e.g., Public Works Department"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="e.g., publicworks@cityconnector.com"
                      required
                    />
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSubmit}
                >
                  {editingDept ? 'Update Department' : 'Add Department'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentManagement;
