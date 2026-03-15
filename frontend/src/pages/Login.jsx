import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.email || !formData.password) {
      setError('Please enter both email and password.');
      return;
    }
    const result = await login(formData);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="auth-bg">
      <div className="auth-card">
        {/* Logo */}
        <div className="text-center mb-6">
          <div style={{
            width: 60, height: 60,
            background: 'var(--grad-primary)',
            borderRadius: 'var(--radius-lg)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
            fontSize: '1.8rem',
            boxShadow: 'var(--shadow-glow-p)',
          }}>🏙️</div>
          <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800 }}>
            <span className="grad-text">City Connector</span>
          </h1>
          <p style={{ margin: '6px 0 0', color: 'var(--clr-text-2)', fontSize: '0.9rem' }}>
            Welcome back! Sign in to continue.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="toast error" style={{ position: 'static', minWidth: 0, marginBottom: 16, animation: 'none' }}>
            <span>⚠️</span> {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="inp-label">Email Address</label>
            <div className="inp-icon-wrap">
              <span className="inp-icon">✉️</span>
              <input
                className="inp"
                type="email"
                name="email"
                autoComplete="email"
                placeholder="you@email.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="inp-label">Password</label>
            <div className="inp-icon-wrap" style={{ position: 'relative' }}>
              <span className="inp-icon">🔒</span>
              <input
                className="inp"
                type={showPass ? 'text' : 'password'}
                name="password"
                autoComplete="current-password"
                placeholder="Your password"
                value={formData.password}
                onChange={handleChange}
                style={{ paddingRight: 44 }}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem',
                  color: 'var(--clr-text-3)',
                }}
              >{showPass ? '🙈' : '👁️'}</button>
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary-glow w-full"
            style={{ marginTop: 8, padding: '13px', fontSize: '0.95rem' }}
            disabled={loading}
          >
            {loading ? <><span className="spinner" /> &nbsp;Signing in...</> : '🚀 Sign In'}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center mt-6" style={{ borderTop: '1px solid var(--clr-border)', paddingTop: 20 }}>
          <p style={{ margin: 0, color: 'var(--clr-text-2)', fontSize: '0.88rem' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--clr-primary-l)', fontWeight: 600, textDecoration: 'none' }}>
              Create one free →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
