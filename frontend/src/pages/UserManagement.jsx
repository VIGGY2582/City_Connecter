import React, { useState, useEffect } from 'react';
import { adminAPI, departmentAPI } from '../services/api';
import { showToast } from './Dashboard';

// ─── Custom Confirm Modal ─────────────────────────────────────────
const ConfirmModal = ({ message, onConfirm, onCancel }) => (
  <div className="modal-overlay" onClick={onCancel}>
    <div className="modal-box" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
      <div className="modal-header"><h3>⚠️ Confirm Action</h3></div>
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

const UserManagement = () => {
  const [users, setUsers]               = useState([]);
  const [departments, setDepartments]   = useState([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState('');
  const [editingUser, setEditingUser]   = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [formData, setFormData]         = useState({ name:'', email:'', password:'', role:'citizen', department_id:'' });

  useEffect(() => {
    loadUsers();
    loadDepartments();
  }, []);

  const loadUsers = async () => {
    try {
      const res = await adminAPI.getAllUsers();
      setUsers(res.data.data);
    } catch (e) { showToast('Failed to load users.', 'error'); }
    finally { setLoading(false); }
  };

  const loadDepartments = async () => {
    try {
      const res = await departmentAPI.getAll();
      setDepartments(res.data.data);
    } catch (e) { console.error(e); }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({ name: user.name, email: user.email, password: '', role: user.role, department_id: user.department_id || '' });
  };

  const handleUpdate = async () => {
    try {
      await adminAPI.updateUser(editingUser.id, formData);
      showToast('User updated successfully!', 'success');
      setEditingUser(null);
      loadUsers();
    } catch (e) {
      showToast(e.response?.data?.message || 'Failed to update user.', 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await adminAPI.deleteUser(id);
      showToast('User deleted.', 'success');
      setDeleteTarget(null);
      loadUsers();
    } catch (e) {
      showToast('Failed to delete user.', 'error');
    }
  };

  const roleBadge = (r) => ({ admin: 'badge-admin', department: 'badge-department', citizen: 'badge-citizen' }[r] || 'badge-citizen');
  const roleIcon  = (r) => ({ admin: '🛡️', department: '🏛️', citizen: '👤' }[r] || '👤');

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="text-center" style={{ padding: 60 }}>
      <div className="spinner spinner-lg" style={{ margin: '0 auto' }} />
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 style={{ margin: 0, fontWeight: 800, fontSize: '1.2rem' }}>👥 User Management</h2>
          <p style={{ margin: '4px 0 0', color: 'var(--clr-text-2)', fontSize: '0.83rem' }}>
            {users.length} total users
          </p>
        </div>
        <div className="inp-icon-wrap" style={{ width: 260 }}>
          <span className="inp-icon">🔍</span>
          <input className="inp" placeholder="Search users..." value={search}
            onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Table */}
      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th><th>Email</th><th>Role</th><th>Department</th><th>Joined</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(u => (
                <tr key={u.id}>
                  <td>
                    <div className="flex items-center gap-2">
                      <div style={{
                        width: 34, height: 34, borderRadius: '50%',
                        background: 'var(--grad-primary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.8rem', fontWeight: 700, color: '#fff', flexShrink: 0,
                      }}>
                        {u.name?.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{u.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--clr-text-3)' }}>ID #{u.id}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ color: 'var(--clr-text-2)', fontSize: '0.85rem' }}>{u.email}</td>
                  <td>
                    <span className={`badge ${roleBadge(u.role)}`}>{roleIcon(u.role)} {u.role}</span>
                  </td>
                  <td style={{ color: 'var(--clr-text-2)', fontSize: '0.85rem' }}>
                    {u.department_name || <span style={{ color: 'var(--clr-text-3)', fontStyle: 'italic' }}>None</span>}
                  </td>
                  <td style={{ color: 'var(--clr-text-3)', fontSize: '0.82rem' }}>
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button className="btn-glass" style={{ fontSize: '0.78rem', padding: '6px 12px' }}
                        onClick={() => handleEdit(u)}>✏️ Edit</button>
                      <button className="btn-danger-glow" style={{ fontSize: '0.78rem', padding: '6px 12px' }}
                        onClick={() => setDeleteTarget(u)} disabled={u.id === 1}>
                        🗑️ Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredUsers.length === 0 && (
            <div className="text-center" style={{ padding: 40, color: 'var(--clr-text-2)' }}>No users found.</div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editingUser && (
        <div className="modal-overlay" onClick={() => setEditingUser(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>✏️ Edit User</h3>
              <button className="btn-icon" onClick={() => setEditingUser(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="inp-label">Full Name</label>
                <input className="inp" value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="inp-label">Email</label>
                <input className="inp" type="email" value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="inp-label">New Password (leave blank to keep)</label>
                <input className="inp" type="password" placeholder="Enter new password..."
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})} />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="inp-label">Role</label>
                  <select className="form-select-dark" value={formData.role}
                    onChange={e => setFormData({...formData, role: e.target.value})}>
                    <option value="citizen">👤 Citizen</option>
                    <option value="department">🏛️ Department</option>
                    <option value="admin">🛡️ Admin</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="inp-label">Department</label>
                  <select className="form-select-dark" value={formData.department_id}
                    onChange={e => setFormData({...formData, department_id: e.target.value})}>
                    <option value="">None</option>
                    {departments.map(d => <option key={d.id} value={d.id}>{d.department_name}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-glass" onClick={() => setEditingUser(null)}>Cancel</button>
              <button className="btn-primary-glow" onClick={handleUpdate}>💾 Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteTarget && (
        <ConfirmModal
          message={`Are you sure you want to delete "${deleteTarget.name}"? This cannot be undone.`}
          onConfirm={() => handleDelete(deleteTarget.id)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};

export default UserManagement;
