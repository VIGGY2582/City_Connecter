import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showError, setShowError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (showError) {
      setShowError(false);
      setError('');
    }
    if (showSuccess) {
      setShowSuccess(false);
      setSuccess('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setShowError(false);
    setShowSuccess(false);
    
    if (!formData.email || !formData.password) {
      setError('❌ Please enter both email and password.');
      setShowError(true);
      return;
    }
    
    console.log('Submitting login with:', { email: formData.email, password: '***' });
    
    const result = await login(formData);
    console.log('Login result:', result);
    
    if (result.success) {
      setSuccess('✅ Login successful! Redirecting to dashboard...');
      setShowSuccess(true);
      
      // Redirect after 1.5 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } else {
      setError(result.error);
      setShowError(true);
    }
  };

  return (
    <div className="min-h-screen d-flex align-items-center justify-content-center bg-light py-4">
      <div className="w-100" style={{ maxWidth: '400px' }}>
        <div>
          <h2 className="text-center mb-4 h3">Sign in to City Connector</h2>
          <p className="text-center text-muted small">
            Or{' '}
            <Link
              to="/register"
              className="text-primary text-decoration-none"
            >
              create a new account
            </Link>
          </p>
        </div>
        
        {/* Success Alert Popup */}
        {showSuccess && success && (
          <div className="alert alert-success alert-dismissible fade show" role="alert">
            <div className="d-flex align-items-center">
              <i className="bi bi-check-circle-fill me-2"></i>
              <div>{success}</div>
            </div>
            <button 
              type="button" 
              className="btn-close" 
              onClick={() => setShowSuccess(false)}
              aria-label="Close"
            ></button>
          </div>
        )}
        
        {/* Error Alert Popup */}
        {showError && error && (
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
            <div className="d-flex align-items-center">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              <div>{error}</div>
            </div>
            <button 
              type="button" 
              className="btn-close" 
              onClick={() => setShowError(false)}
              aria-label="Close"
            ></button>
          </div>
        )}
        
        <form className="mt-4" onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className={`form-control ${showError ? 'is-invalid' : ''} ${showSuccess ? 'is-valid' : ''}`}
              placeholder="Email address"
              value={formData.email}
              onChange={handleChange}
            />
            <div className="form-text">
              Try: electricity@cityconnector.com
            </div>
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className={`form-control ${showError ? 'is-invalid' : ''} ${showSuccess ? 'is-valid' : ''}`}
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
            />
            <div className="form-text">
              Default password: <strong>password</strong>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-100"
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </div>
        </form>
        
        {/* Department Login Help */}
        <div className="mt-4 p-3 bg-light rounded">
          <h6 className="mb-2">🔌 Department Login:</h6>
          <div className="small text-muted">
            <div><strong>Electricity:</strong> electricity@cityconnector.com</div>
            <div><strong>Public Works:</strong> publicworks@cityconnector.com</div>
            <div><strong>Sanitation:</strong> sanitation@cityconnector.com</div>
            <div><strong>Traffic:</strong> traffic@cityconnector.com</div>
            <div><strong>Water:</strong> water@cityconnector.com</div>
            <div className="mt-2"><strong>Password:</strong> password</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
