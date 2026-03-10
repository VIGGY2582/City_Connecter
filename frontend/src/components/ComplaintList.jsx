import React, { useState, useEffect } from 'react';
import { complaintAPI, departmentAPI, feedbackAPI } from '../services/api';

const ComplaintList = ({ complaints: initialComplaints, loading: initialLoading, isAdmin = false, isDepartment = false }) => {
  const [complaints, setComplaints] = useState(initialComplaints || []);
  const [loading, setLoading] = useState(initialLoading || false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackData, setFeedbackData] = useState({ rating: 5, comments: '' });
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    if (isAdmin || isDepartment) {
      loadComplaints();
      if (isAdmin) {
        loadDepartments();
      }
    }
  }, [isAdmin, isDepartment]);

  const loadComplaints = async () => {
    try {
      setLoading(true);
      let response;
      
      if (isDepartment) {
        response = await complaintAPI.getDepartmentComplaints();
      } else {
        response = await complaintAPI.getAll();
      }
      
      setComplaints(response.data.data);
    } catch (error) {
      console.error('Error loading complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDepartments = async () => {
    try {
      const response = await departmentAPI.getAll();
      setDepartments(response.data.data);
    } catch (error) {
      console.error('Error loading departments:', error);
    }
  };

  const handleStatusUpdate = async (complaintId, newStatus) => {
    try {
      await complaintAPI.updateStatus(complaintId, newStatus);
      setComplaints(complaints.map(c => 
        c.id === complaintId ? { ...c, status: newStatus } : c
      ));
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleDepartmentAssign = async (complaintId, departmentId) => {
    try {
      await complaintAPI.assignDepartment(complaintId, departmentId);
      setComplaints(complaints.map(c => 
        c.id === complaintId ? { ...c, department_id: departmentId } : c
      ));
    } catch (error) {
      console.error('Error assigning department:', error);
    }
  };

  const handleFeedbackSubmit = async () => {
    try {
      await feedbackAPI.create({
        complaint_id: selectedComplaint.id,
        rating: feedbackData.rating,
        comments: feedbackData.comments,
      });
      setShowFeedback(false);
      setFeedbackData({ rating: 5, comments: '' });
      alert('Feedback submitted successfully!');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Failed to submit feedback');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Submitted': 'bg-warning text-dark',
      'Assigned': 'bg-info text-white',
      'In Progress': 'bg-primary text-white',
      'Resolved': 'bg-success text-white',
      'Rejected': 'bg-danger text-white',
    };
    return colors[status] || 'bg-secondary text-white';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'Low': 'bg-secondary text-white',
      'Medium': 'bg-warning text-dark',
      'High': 'bg-danger text-white',
    };
    return colors[priority] || 'bg-secondary text-white';
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (complaints.length === 0) {
    return (
      <div className="text-center py-5 bg-white rounded shadow">
        <p className="text-muted">No complaints found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {complaints.map((complaint) => (
        <div key={complaint.id} className="card shadow mb-3">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div className="flex-grow-1">
                <h5 className="card-title h6">{complaint.title}</h5>
                <p className="text-muted mt-1">{complaint.description}</p>
                <div className="d-flex flex-wrap gap-2 mt-2">
                  <span className={`badge ${getStatusColor(complaint.status)}`}>
                    {complaint.status}
                  </span>
                  <span className={`badge ${getPriorityColor(complaint.priority)}`}>
                    {complaint.priority} Priority
                  </span>
                  <span className="badge bg-secondary">
                    {complaint.category}
                  </span>
                </div>
                <div className="small text-muted mt-2">
                  <p>Location: {complaint.location}</p>
                  <p>Submitted: {new Date(complaint.created_at).toLocaleDateString()}</p>
                  {complaint.user_name && <p>Submitted by: {complaint.user_name}</p>}
                  {complaint.department_name && <p>Department: {complaint.department_name}</p>}
                </div>
              </div>
              <div className="d-flex gap-2 ms-3">
                <button
                  onClick={() => {
                    setSelectedComplaint(complaint);
                    setShowDetails(true);
                  }}
                  className="btn btn-outline-primary btn-sm"
                >
                  View Details
                </button>
                {complaint.status === 'Resolved' && (
                  <button
                    onClick={() => {
                      setSelectedComplaint(complaint);
                      setShowFeedback(true);
                    }}
                    className="btn btn-outline-success btn-sm"
                  >
                    Give Feedback
                  </button>
                )}
              </div>
            </div>

            {isAdmin && (
              <div className="mt-4 pt-4 border-top border-gray-200 flex flex-wrap gap-2">
                <select
                  value={complaint.status}
                  onChange={(e) => handleStatusUpdate(complaint.id, e.target.value)}
                  className="form-select form-select-sm me-2"
                >
                  <option value="Submitted">Submitted</option>
                  <option value="Assigned">Assigned</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Rejected">Rejected</option>
                </select>
                <select
                  value={complaint.department_id || ''}
                  onChange={(e) => handleDepartmentAssign(complaint.id, e.target.value)}
                  className="form-select form-select-sm me-2"
                >
                  <option value="">Assign Department</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.department_name}</option>
                  ))}
                </select>
              </div>
            )}

            {isDepartment && complaint.status !== 'Resolved' && (
              <div className="mt-4 pt-4 border-top border-gray-200">
                <select
                  value={complaint.status}
                  onChange={(e) => handleStatusUpdate(complaint.id, e.target.value)}
                  className="form-select form-select-sm"
                >
                  <option value="Assigned">Assigned</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Details Modal */}
      {showDetails && selectedComplaint && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Complaint Details</h5>
                <button type="button" className="btn-close" onClick={() => setShowDetails(false)}>
                  <span>&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <div>
                  <strong>Title:</strong> {selectedComplaint.title}
                </div>
                <div>
                  <strong>Description:</strong> {selectedComplaint.description}
                </div>
                <div>
                  <strong>Category:</strong> {selectedComplaint.category}
                </div>
                <div>
                  <strong>Priority:</strong> {selectedComplaint.priority}
                </div>
                <div>
                  <strong>Location:</strong> {selectedComplaint.location}
                </div>
                <div>
                  <strong>Status:</strong> {selectedComplaint.status}
                </div>
                <div>
                  <strong>Submitted:</strong> {new Date(selectedComplaint.created_at).toLocaleDateString()}
                </div>
                {selectedComplaint.image_url && (
                  <div>
                    <strong>Image:</strong>
                    <img 
                      src={`http://localhost:5000${selectedComplaint.image_url}`} 
                      alt="Complaint" 
                      className="mt-2 max-w-full h-auto rounded"
                    />
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  onClick={() => setShowDetails(false)}
                  className="btn btn-primary"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedback && selectedComplaint && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Provide Feedback</h5>
                <button type="button" className="btn-close" onClick={() => setShowFeedback(false)}>
                  <span>&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <div className="space-y-4">
                  <div>
                    <label className="form-label">Rating</label>
                    <select
                      value={feedbackData.rating}
                      onChange={(e) => setFeedbackData({...feedbackData, rating: parseInt(e.target.value)})}
                      className="form-select"
                    >
                      {[1, 2, 3, 4, 5].map(rating => (
                        <option key={rating} value={rating}>{rating} Star{rating > 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Comments</label>
                    <textarea
                      value={feedbackData.comments}
                      onChange={(e) => setFeedbackData({...feedbackData, comments: e.target.value})}
                      rows={4}
                      className="form-control"
                      placeholder="Share your experience..."
                    />
                  </div>
                </div>
                <div className="modal-footer d-flex justify-content-end gap-2">
                  <button
                    onClick={() => setShowFeedback(false)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleFeedbackSubmit}
                    className="btn btn-primary"
                  >
                    Submit Feedback
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplaintList;
