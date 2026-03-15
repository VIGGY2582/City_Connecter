import React, { useState, useEffect } from 'react';
import { departmentAPI } from '../services/api';
import { showToast } from '../pages/Dashboard';

// ─── Confirm Modal ──────────────────────────────────────────────
const ConfirmModal = ({ message, onConfirm, onCancel }) => (
  <div className="modal-overlay" onClick={onCancel}>
    <div className="modal-box" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
      <div className="modal-header"><h3>⚠️ Confirm Delete</h3></div>
      <div className="modal-body">
        <p style={{ color: 'var(--clr-text-2)', margin: 0 }}>{message}</p>
      </div>
      <div className="modal-footer">
        <button className="btn-glass" onClick={onCancel}>Cancel</button>
        <button className="btn-danger-glow" onClick={onConfirm}>Yes, Delete</button>
      </div>
    </div>
  </div>
);

const DepartmentManagement = () => {
  const [departments, setDepartments]   = useState([]);
  const [loading, setLoading]           = useState(true);
  const [showModal, setShowModal]       = useState(false);
  const [editingDept, setEditingDept]   = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [formData, setFormData]         = useState({ department_name: '', email: '' });

  useEffect(() => { loadDepartments(); }, []);

  const loadDepartments = async () => {
    try {
      const res = await departmentAPI.getAll();
      setDepartments(res.data.data);
    } catch (e) { showToast('Failed to load departments.', 'error'); }
    finally { setLoading(false); }
  };

  const handleAdd = () => {
    setFormData({ department_name: '', email: '' });
    setEditingDept(null);
    setShowModal(true);
  };

  const handleEdit = (dept) => {
    setFormData({ department_name: dept.department_name, email: dept.email });
    setEditingDept(dept);
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!formData.department_name.trim() || !formData.email.trim()) {
      showToast('Please fill in all fields.', 'error');
      return;
    }
    try {
      if (editingDept) {
        await departmentAPI.update(editingDept.id, formData);
        showToast('Department updated!', 'success');
      } else {
        await departmentAPI.create(formData);
        showToast('Department added!', 'success');
      }
      setShowModal(false);
      setEditingDept(null);
      loadDepartments();
    } catch (e) {
      showToast(e.response?.data?.message || 'Failed to save department.', 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await departmentAPI.remove(id);
      showToast('Department deleted.', 'success');
      setDeleteTarget(null);
      loadDepartments();
    } catch (e) {
      showToast('Failed to delete department.', 'error');
    }
  };

  if (loading) return (
    <div className="text-center" style={{ padding: 60 }}>
      <div className="spinner spinner-lg" style={{ margin: '0 auto' }} />
    </div>
  );

  // Generate a consistent color-icon per dept
  const deptColors = ['purple','cyan','green','red','orange','yellow'];
  const deptIcons  = ['🏛️','🔧','🚿','💡','🌳','🚦','🛣️','🗑️','🏗️'];

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 style={{ margin: 0, fontWeight: 800, fontSize: '1.2rem' }}>🏛️ Departments</h2>
          <p style={{ margin: '4px 0 0', color: 'var(--clr-text-2)', fontSize: '0.83rem' }}>
            {departments.length} department{departments.length !== 1 ? 's' : ''} configured
          </p>
        </div>
        <button className="btn-primary-glow" onClick={handleAdd}>
          ➕ Add Department
        </button>
      </div>

      {/* Cards Grid */}
      {departments.length === 0 ? (
        <div className="glass-card text-center" style={{ padding: 60 }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>🏛️</div>
          <p style={{ color: 'var(--clr-text-2)', margin: 0 }}>
            No departments yet. Click "Add Department" to create one.
          </p>
        </div>
      ) : (
        <div className="grid-auto">
          {departments.map((dept, i) => {
            const color = deptColors[i % deptColors.length];
            const icon  = deptIcons[i % deptIcons.length];
            return (
              <div key={dept.id} className={`stat-card ${color}`} style={{ cursor: 'default' }}>
                <div className={`stat-icon ${color}`} style={{ marginBottom: 12 }}>{icon}</div>
                <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--clr-text)', marginBottom: 4 }}>
                  {dept.department_name}
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--clr-text-2)', marginBottom: 4 }}>
                  ✉️ {dept.email}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--clr-text-3)', marginBottom: 16 }}>
                  Created {new Date(dept.created_at).toLocaleDateString()}
                </div>
                <div className="flex gap-2">
                  <button className="btn-glass" style={{ flex: 1, fontSize: '0.8rem', padding: '7px' }}
                    onClick={() => handleEdit(dept)}>✏️ Edit</button>
                  <button className="btn-danger-glow" style={{ flex: 1, fontSize: '0.8rem', padding: '7px' }}
                    onClick={() => setDeleteTarget(dept)}>🗑️ Delete</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" style={{ maxWidth: 440 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingDept ? '✏️ Edit Department' : '➕ New Department'}</h3>
              <button className="btn-icon" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="inp-label">Department Name</label>
                <input className="inp" value={formData.department_name}
                  onChange={e => setFormData({...formData, department_name: e.target.value})}
                  placeholder="e.g., Public Works Department" />
              </div>
              <div className="form-group">
                <label className="inp-label">Contact Email</label>
                <input className="inp" type="email" value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  placeholder="e.g., publicworks@city.gov" />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-glass" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn-primary-glow" onClick={handleSubmit}>
                {editingDept ? '💾 Update' : '➕ Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteTarget && (
        <ConfirmModal
          message={`Delete "${deleteTarget.department_name}"? This cannot be undone.`}
          onConfirm={() => handleDelete(deleteTarget.id)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};

export default DepartmentManagement;
