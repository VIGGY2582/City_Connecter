import React, { useState, useEffect } from 'react';
import { complaintAPI, departmentAPI, feedbackAPI } from '../services/api';
import { showToast } from '../pages/Dashboard';

// ─── Status & Priority helpers ───────────────────────────────────
const statusBadge = (s) => {
  const map = {
    'Submitted':   'badge-submitted',
    'Assigned':    'badge-assigned',
    'In Progress': 'badge-inprogress',
    'Resolved':    'badge-resolved',
    'Rejected':    'badge-rejected',
  };
  return map[s] || 'badge-submitted';
};

const priorityBadge = (p) => ({
  'Low': 'badge-low', 'Medium': 'badge-medium', 'High': 'badge-high',
}[p] || 'badge-low');

const priorityDot = { Low: '🟢', Medium: '🟡', High: '🔴' };
const statusIcon  = { Submitted: '📤', Assigned: '🔗', 'In Progress': '⚙️', Resolved: '✅', Rejected: '❌' };

// ─── Star Rating ─────────────────────────────────────────────────
const StarRating = ({ value, onChange }) => (
  <div className="star-rating">
    {[1,2,3,4,5].map(n => (
      <button key={n} type="button" className={`star-btn ${n <= value ? 'active' : ''}`}
        onClick={() => onChange(n)} style={{ color: n <= value ? '#f59e0b' : '#374151' }}>
        ★
      </button>
    ))}
  </div>
);

// ─── Details Modal ───────────────────────────────────────────────
const DetailsModal = ({ complaint, onClose }) => (
  <div className="modal-overlay" onClick={onClose}>
    <div className="modal-box" onClick={e => e.stopPropagation()}>
      <div className="modal-header">
        <h3>📋 Complaint Details</h3>
        <button className="btn-icon" onClick={onClose}>✕</button>
      </div>
      <div className="modal-body">
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
          <span className={`badge ${statusBadge(complaint.status)}`}>
            {statusIcon[complaint.status]} {complaint.status}
          </span>
          <span className={`badge ${priorityBadge(complaint.priority)}`}>
            {priorityDot[complaint.priority]} {complaint.priority} Priority
          </span>
          <span className="badge" style={{ background: 'rgba(255,255,255,0.08)', color: 'var(--clr-text-2)', border: '1px solid var(--clr-border)' }}>
            🏷️ {complaint.category}
          </span>
        </div>

        {[
          ['📌 Title', complaint.title],
          ['📝 Description', complaint.description],
          ['📍 Location', complaint.location],
          complaint.user_name && ['👤 Submitted by', complaint.user_name],
          complaint.department_name && ['🏛️ Department', complaint.department_name],
          ['📅 Submitted', new Date(complaint.created_at).toLocaleString()],
        ].filter(Boolean).map(([label, value]) => (
          <div key={label} style={{ marginBottom: 12 }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--clr-text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3 }}>{label}</div>
            <div style={{ fontSize: '0.9rem', color: 'var(--clr-text)' }}>{value}</div>
          </div>
        ))}

        {complaint.image_url && (
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--clr-text-3)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 8 }}>📸 Attached Photo</div>
            <img src={`http://localhost:5000${complaint.image_url}`} alt="Complaint"
              style={{ width: '100%', borderRadius: 'var(--radius-md)' }} />
          </div>
        )}
      </div>
      <div className="modal-footer">
        <button className="btn-glass" onClick={onClose}>Close</button>
      </div>
    </div>
  </div>
);

// ─── Feedback Modal ──────────────────────────────────────────────
const FeedbackModal = ({ complaint, onClose }) => {
  const [rating, setRating] = useState(5);
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    try {
      await feedbackAPI.create({ complaint_id: complaint.id, rating, comments });
      showToast('Feedback submitted! Thank you. 🌟', 'success');
      onClose();
    } catch (err) {
      showToast('Failed to submit feedback.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>⭐ Rate the Resolution</h3>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <p style={{ color: 'var(--clr-text-2)', marginBottom: 20, fontSize: '0.88rem' }}>
            How satisfied are you with how <strong style={{ color: 'var(--clr-text)' }}>{complaint.title}</strong> was resolved?
          </p>
          <div className="form-group">
            <label className="inp-label">Your Rating</label>
            <StarRating value={rating} onChange={setRating} />
            <div style={{ color: 'var(--clr-text-2)', fontSize: '0.8rem', marginTop: 6 }}>
              {['','😡 Very Poor','😞 Poor','😐 Okay','😊 Good','🤩 Excellent!'][rating]}
            </div>
          </div>
          <div className="form-group">
            <label className="inp-label">Comments (optional)</label>
            <textarea className="inp" rows={3} value={comments}
              onChange={e => setComments(e.target.value)}
              placeholder="Share your experience..." style={{ resize: 'vertical' }} />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-glass" onClick={onClose}>Cancel</button>
          <button className="btn-primary-glow" onClick={submit} disabled={loading}>
            {loading ? <><span className="spinner" /> Submitting...</> : '⭐ Submit Feedback'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Single Complaint Card ────────────────────────────────────────
const ComplaintCard = ({ complaint, isAdmin, isDepartment, departments, onStatusUpdate, onDeptAssign }) => {
  const [showDetails, setShowDetails]   = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  return (
    <>
      <div className="glass-card p-4" style={{ marginBottom: 12 }}>
        <div className="flex justify-between items-center">
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="flex items-center gap-2 mb-2" style={{ flexWrap: 'wrap' }}>
              <span className={`badge ${statusBadge(complaint.status)}`}>
                {statusIcon[complaint.status]} {complaint.status}
              </span>
              <span className={`badge ${priorityBadge(complaint.priority)}`}>
                {priorityDot[complaint.priority]} {complaint.priority}
              </span>
              <span className="badge" style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--clr-text-3)', border: '1px solid var(--clr-border)' }}>
                {complaint.category}
              </span>
            </div>
            <h3 style={{ margin: '0 0 4px', fontSize: '1rem', fontWeight: 700, color: 'var(--clr-text)' }}>
              {complaint.title}
            </h3>
            <p style={{ margin: '0 0 6px', color: 'var(--clr-text-2)', fontSize: '0.85rem',
              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {complaint.description}
            </p>
            <div className="flex gap-3" style={{ fontSize: '0.78rem', color: 'var(--clr-text-3)', flexWrap: 'wrap' }}>
              <span>📍 {complaint.location}</span>
              <span>📅 {new Date(complaint.created_at).toLocaleDateString()}</span>
              {complaint.user_name    && <span>👤 {complaint.user_name}</span>}
              {complaint.department_name && <span>🏛️ {complaint.department_name}</span>}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex-col gap-2 items-center" style={{ marginLeft: 16, flexShrink: 0 }}>
            <button className="btn-glass" style={{ fontSize: '0.8rem', padding: '7px 14px' }}
              onClick={() => setShowDetails(true)}>
              View
            </button>
            {complaint.status === 'Resolved' && (
              <button className="btn-success-glow" style={{ fontSize: '0.8rem', padding: '7px 14px' }}
                onClick={() => setShowFeedback(true)}>
                ⭐ Rate
              </button>
            )}
          </div>
        </div>

        {/* Admin controls */}
        {isAdmin && (
          <div className="flex gap-2 mt-3" style={{ paddingTop: 12, borderTop: '1px solid var(--clr-border)', flexWrap: 'wrap' }}>
            <div>
              <label style={{ fontSize: '0.72rem', color: 'var(--clr-text-3)', display: 'block', marginBottom: 4 }}>Update Status</label>
              <select className="form-select-dark" value={complaint.status}
                style={{ fontSize: '0.82rem', padding: '7px 12px' }}
                onChange={e => onStatusUpdate(complaint.id, e.target.value)}>
                {['Submitted','Assigned','In Progress','Resolved','Rejected'].map(s =>
                  <option key={s} value={s}>{s}</option>
                )}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.72rem', color: 'var(--clr-text-3)', display: 'block', marginBottom: 4 }}>Assign Department</label>
              <select className="form-select-dark" value={complaint.department_id || ''}
                style={{ fontSize: '0.82rem', padding: '7px 12px' }}
                onChange={e => onDeptAssign(complaint.id, e.target.value)}>
                <option value="">— Select Department —</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.department_name}</option>)}
              </select>
            </div>
          </div>
        )}

        {/* Department controls */}
        {isDepartment && complaint.status !== 'Resolved' && (
          <div style={{ paddingTop: 12, borderTop: '1px solid var(--clr-border)', marginTop: 12 }}>
            <label style={{ fontSize: '0.72rem', color: 'var(--clr-text-3)', display: 'block', marginBottom: 4 }}>Update Status</label>
            <select className="form-select-dark" value={complaint.status}
              style={{ fontSize: '0.82rem', padding: '7px 12px', maxWidth: 200 }}
              onChange={e => onStatusUpdate(complaint.id, e.target.value)}>
              {['Assigned','In Progress','Resolved'].map(s =>
                <option key={s} value={s}>{s}</option>
              )}
            </select>
          </div>
        )}
      </div>

      {showDetails  && <DetailsModal  complaint={complaint} onClose={() => setShowDetails(false)} />}
      {showFeedback && <FeedbackModal complaint={complaint} onClose={() => setShowFeedback(false)} />}
    </>
  );
};

// ─── ComplaintList ────────────────────────────────────────────────
const ComplaintList = ({ complaints: initial, loading: initLoading, isAdmin = false, isDepartment = false, onRefresh }) => {
  const [complaints, setComplaints]     = useState(initial || []);
  const [departments, setDepartments]   = useState([]);
  const [search, setSearch]             = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => { setComplaints(initial || []); }, [initial]);

  useEffect(() => {
    if (isAdmin) loadDepartments();
  }, [isAdmin]);

  const loadDepartments = async () => {
    try {
      const res = await departmentAPI.getAll();
      setDepartments(res.data.data);
    } catch (e) { console.error(e); }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await complaintAPI.updateStatus(id, status);
      setComplaints(cs => cs.map(c => c.id === id ? { ...c, status } : c));
      showToast(`Status updated to "${status}"`, 'success');
    } catch (e) {
      showToast('Failed to update status.', 'error');
    }
  };

  const handleDeptAssign = async (id, deptId) => {
    if (!deptId) return;
    try {
      await complaintAPI.assignDepartment(id, deptId);
      const dept = departments.find(d => d.id === parseInt(deptId));
      setComplaints(cs => cs.map(c => c.id === id ? { ...c, department_id: deptId, department_name: dept?.department_name } : c));
      showToast('Department assigned!', 'success');
    } catch (e) {
      showToast('Failed to assign department.', 'error');
    }
  };

  const filtered = complaints.filter(c => {
    const matchSearch = !search || c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.location.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !filterStatus || c.status === filterStatus;
    return matchSearch && matchStatus;
  });

  if (initLoading) {
    return (
      <div className="text-center" style={{ padding: 60 }}>
        <div className="spinner spinner-lg" style={{ margin: '0 auto' }} />
      </div>
    );
  }

  return (
    <div>
      {/* Filters */}
      <div className="flex gap-3 mb-4 items-center" style={{ flexWrap: 'wrap' }}>
        <div className="inp-icon-wrap" style={{ flex: 1, minWidth: 200 }}>
          <span className="inp-icon">🔍</span>
          <input className="inp" placeholder="Search complaints..." value={search}
            onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="form-select-dark" value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)} style={{ minWidth: 160 }}>
          <option value="">All Statuses</option>
          {['Submitted','Assigned','In Progress','Resolved','Rejected'].map(s =>
            <option key={s} value={s}>{s}</option>
          )}
        </select>
        {onRefresh && (
          <button className="btn-glass" onClick={onRefresh}>🔄 Refresh</button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="glass-card text-center p-6" style={{ padding: 48 }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>📭</div>
          <p style={{ color: 'var(--clr-text-2)', margin: 0, fontSize: '0.9rem' }}>
            {search || filterStatus ? 'No complaints match your filters.' : 'No complaints found.'}
          </p>
        </div>
      ) : filtered.map(c => (
        <ComplaintCard
          key={c.id}
          complaint={c}
          isAdmin={isAdmin}
          isDepartment={isDepartment}
          departments={departments}
          onStatusUpdate={handleStatusUpdate}
          onDeptAssign={handleDeptAssign}
        />
      ))}

      {filtered.length > 0 && (
        <div style={{ color: 'var(--clr-text-3)', fontSize: '0.78rem', textAlign: 'right', marginTop: 8 }}>
          Showing {filtered.length} of {complaints.length} complaints
        </div>
      )}
    </div>
  );
};

export default ComplaintList;
