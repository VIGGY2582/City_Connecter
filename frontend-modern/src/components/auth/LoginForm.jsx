import React, { useState } from 'react';
import { Form, Button, Card, Alert, Spinner } from 'react-bootstrap';
import { Eye, EyeSlash, Envelope, Lock, Building } from 'react-bootstrap-icons';
import { useAuth } from '../../context/AuthContext';

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const { login, loading, error } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    await login(formData);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="w-100" style={{ maxWidth: '450px' }}>
        <Card className="shadow-lg border-0">
          <Card.Body className="p-5">
            {/* Header */}
            <div className="text-center mb-4">
              <div className="d-inline-flex align-items-center justify-content-center rounded-circle bg-primary text-white mb-3"
                style={{ width: '60px', height: '60px' }}>
                <Building size={30} />
              </div>
              <h2 className="fw-bold text-gradient mb-2">Welcome Back</h2>
              <p className="text-muted">Sign in to your City Connect account</p>
            </div>

            {/* Error Alert */}
            {error && (
              <Alert variant="danger" className="d-flex align-items-center">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                {error}
              </Alert>
            )}

            {/* Login Form */}
            <Form onSubmit={handleSubmit}>
              {/* Email Field */}
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">
                  <Envelope className="me-2" />
                  Email Address
                </Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  isInvalid={!!errors.email}
                  className="py-2"
                  disabled={loading}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.email}
                </Form.Control.Feedback>
              </Form.Group>

              {/* Password Field */}
              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold">
                  <Lock className="me-2" />
                  Password
                </Form.Label>
                <div className="position-relative">
                  <Form.Control
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    isInvalid={!!errors.password}
                    className="py-2 pe-5"
                    disabled={loading}
                  />
                  <Button
                    variant="link"
                    className="position-absolute end-0 top-50 translate-middle-y border-0 text-muted p-2"
                    onClick={togglePasswordVisibility}
                    disabled={loading}
                  >
                    {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
                  </Button>
                  <Form.Control.Feedback type="invalid">
                    {errors.password}
                  </Form.Control.Feedback>
                </div>
              </Form.Group>

              {/* Remember Me & Forgot Password */}
              <div className="d-flex justify-content-between align-items-center mb-4">
                <Form.Check
                  type="checkbox"
                  id="remember-me"
                  label="Remember me"
                  className="text-muted"
                />
                <Button variant="link" className="text-decoration-none p-0">
                  Forgot password?
                </Button>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                className="w-100 btn-primary-custom py-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="me-2"
                    />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </Form>

            {/* Register Link */}
            <div className="text-center mt-4">
              <p className="text-muted mb-0">
                Don't have an account?{' '}
                <Button variant="link" className="text-decoration-none p-0">
                  Sign up
                </Button>
              </p>
            </div>
          </Card.Body>
        </Card>

        {/* Footer */}
        <div className="text-center mt-4">
          <p className="text-muted small">
            © 2024 City Connect. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
