import React, { useState } from 'react';
import { complaintAPI, departmentAPI } from '../services/api';

const ComplaintForm = ({ onComplaintCreated }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Public Works',
    location: '',
    priority: 'Medium',
  });
  const [imageFile, setImageFile] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const categories = [
    'Public Works',
    'Sanitation',
    'Traffic',
    'Water Supply',
    'Electricity',
    'Street Lighting',
    'Garbage Collection',
    'Road Maintenance',
    'Parks and Recreation',
    'Other',
  ];

  const priorities = ['Low', 'Medium', 'High'];

  React.useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      const response = await departmentAPI.getAll();
      setDepartments(response.data.data);
    } catch (error) {
      console.error('Error loading departments:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const formDataToSend = new FormData();
    Object.keys(formData).forEach(key => {
      formDataToSend.append(key, formData[key]);
    });
    
    if (imageFile) {
      formDataToSend.append('image', imageFile);
    }

    try {
      await complaintAPI.create(formDataToSend);
      setSuccess('Complaint submitted successfully!');
      setFormData({
        title: '',
        description: '',
        category: 'Public Works',
        location: '',
        priority: 'Medium',
      });
      setImageFile(null);
      
      if (onComplaintCreated) {
        onComplaintCreated();
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to submit complaint');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow">
            <div className="card-body">
              <h2 className="card-title h4">Submit New Complaint</h2>
              
              {error && (
                <div className="alert alert-danger">
                  {error}
                </div>
              )}
              
              {success && (
                <div className="alert alert-success">
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="title" className="form-label">
                    Complaint Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    required
                    className="form-control"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Brief title of your complaint"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="form-label">
                    Detailed Description *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    required
                    rows={4}
                    className="form-control"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Provide detailed information about your complaint"
                  />
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <label htmlFor="category" className="form-label">
                      Category *
                    </label>
                    <select
                      id="category"
                      name="category"
                      required
                      className="form-select"
                      value={formData.category}
                      onChange={handleChange}
                    >
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="priority" className="form-label">
                      Priority *
                    </label>
                    <select
                      id="priority"
                      name="priority"
                      required
                      className="form-select"
                      value={formData.priority}
                      onChange={handleChange}
                    >
                      {priorities.map(priority => (
                        <option key={priority} value={priority}>{priority}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="location" className="form-label">
                    Location *
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    required
                    className="form-control"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Specific address or location of issue"
                  />
                </div>

                <div>
                  <label htmlFor="image" className="form-label">
                    Upload Image (Optional)
                  </label>
                  <input
                    type="file"
                    id="image"
                    name="image"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="form-control"
                  />
                  {imageFile && (
                    <p className="form-text text-muted">
                      Selected file: {imageFile.name}
                    </p>
                  )}
                </div>

                <div className="d-flex justify-content-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary"
                  >
                    {loading ? 'Submitting...' : 'Submit Complaint'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplaintForm;
