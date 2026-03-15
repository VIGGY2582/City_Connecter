import React, { useState, useRef } from 'react';
import { complaintAPI, departmentAPI } from '../services/api';
import { showToast } from '../pages/Dashboard';

const CATEGORIES = [
  'Public Works','Sanitation','Traffic','Water Supply','Electricity',
  'Street Lighting','Garbage Collection','Road Maintenance','Parks and Recreation','Other',
];
const PRIORITIES = ['Low', 'Medium', 'High'];

const ComplaintForm = ({ onComplaintCreated }) => {
  const [formData, setFormData] = useState({
    title: '', description: '', category: 'Public Works', location: '', priority: 'Medium',
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const fileRef = useRef();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim() || !formData.location.trim()) {
      showToast('Please fill in all required fields.', 'error');
      return;
    }
    setLoading(true);
    const fd = new FormData();
    Object.keys(formData).forEach(k => fd.append(k, formData[k]));
    if (imageFile) fd.append('image', imageFile);
    try {
      await complaintAPI.create(fd);
      setSuccess(true);
      showToast('Complaint submitted successfully! 🎉', 'success');
      setTimeout(() => {
        setSuccess(false);
        setFormData({ title: '', description: '', category: 'Public Works', location: '', priority: 'Medium' });
        setImageFile(null); setImagePreview(null);
        if (onComplaintCreated) onComplaintCreated();
      }, 2000);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to submit complaint.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center" style={{ padding: 80 }}>
        <div style={{ fontSize: '4rem', marginBottom: 16 }}>🎉</div>
        <h2 className="grad-text" style={{ fontSize: '1.6rem', fontWeight: 800 }}>Complaint Submitted!</h2>
        <p style={{ color: 'var(--clr-text-2)' }}>Your complaint has been received. You'll be redirected shortly.</p>
        <div className="spinner spinner-lg" style={{ margin: '24px auto 0' }} />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <div className="glass-card p-6">
        <h2 style={{ margin: '0 0 6px', fontWeight: 800, fontSize: '1.3rem' }}>
          📝 Submit a Complaint
        </h2>
        <p style={{ margin: '0 0 28px', color: 'var(--clr-text-2)', fontSize: '0.875rem' }}>
          Describe the issue in detail so we can address it quickly.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="inp-label">Complaint Title *</label>
            <input className="inp" type="text" name="title" value={formData.title}
              onChange={handleChange} placeholder="Brief title of your complaint" required />
          </div>

          <div className="form-group">
            <label className="inp-label">Detailed Description *</label>
            <textarea className="inp" name="description" rows={4} value={formData.description}
              onChange={handleChange} placeholder="Provide as much detail as possible..."
              style={{ resize: 'vertical' }} required />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="inp-label">Category *</label>
              <select className="form-select-dark" name="category" value={formData.category} onChange={handleChange}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="inp-label">Priority *</label>
              <select className="form-select-dark" name="priority" value={formData.priority} onChange={handleChange}>
                {PRIORITIES.map(p => (
                  <option key={p} value={p}>
                    {p === 'Low' ? '🟢 Low' : p === 'Medium' ? '🟡 Medium' : '🔴 High'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="inp-label">Location *</label>
            <div className="inp-icon-wrap">
              <span className="inp-icon">📍</span>
              <input className="inp" type="text" name="location" value={formData.location}
                onChange={handleChange} placeholder="Specific address or location of issue" required />
            </div>
          </div>

          {/* Drop Zone */}
          <div className="form-group">
            <label className="inp-label">Photo Evidence (Optional)</label>
            <div
              className={`drop-zone ${dragOver ? 'drag-over' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
            >
              {imagePreview ? (
                <div>
                  <img src={imagePreview} alt="Preview"
                    style={{ maxHeight: 160, borderRadius: 'var(--radius-md)', marginBottom: 10 }} />
                  <p style={{ color: 'var(--clr-text-2)', fontSize: '0.82rem', margin: 0 }}>
                    {imageFile?.name} — Click to change
                  </p>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: '2.5rem', marginBottom: 10 }}>📸</div>
                  <p style={{ color: 'var(--clr-text-2)', margin: 0, fontSize: '0.9rem' }}>
                    Drag & drop an image here, or <span style={{ color: 'var(--clr-primary-l)', fontWeight: 600 }}>click to browse</span>
                  </p>
                  <p style={{ color: 'var(--clr-text-3)', margin: '4px 0 0', fontSize: '0.78rem' }}>
                    Supports: JPG, PNG, GIF, WEBP
                  </p>
                </div>
              )}
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
                onChange={(e) => handleFile(e.target.files[0])} />
            </div>
          </div>

          <div className="flex" style={{ justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
            <button type="button" className="btn-glass" onClick={() => {
              setFormData({ title: '', description: '', category: 'Public Works', location: '', priority: 'Medium' });
              setImageFile(null); setImagePreview(null);
            }}>
              Reset
            </button>
            <button type="submit" className="btn-primary-glow" disabled={loading} style={{ minWidth: 160 }}>
              {loading ? <><span className="spinner" /> &nbsp;Submitting...</> : '📤 Submit Complaint'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ComplaintForm;
