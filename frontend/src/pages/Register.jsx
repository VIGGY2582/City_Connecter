import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', role: 'citizen',
    password: '', confirmPassword: '',
  });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) { setError('Full name is required.'); return; }
    if (!formData.email.trim()) { setError('Email is required.'); return; }
    if (formData.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (formData.password !== formData.confirmPassword) { setError('Passwords do not match.'); return; }

    const { confirmPassword, ...registerData } = formData;
    const result = await register(registerData);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error || 'Registration failed.');
    }
  };

  return (
    <div className="auth-bg">
      <div className="auth-card" style={{ maxWidth: 500 }}>
        {/* Logo */}
        <div className="text-center mb-6">
          <div style={{
            width: 60, height: 60,
            background: 'var(--grad-primary)',
            borderRadius: 'var(--radius-lg)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px', fontSize: '1.8rem',
            boxShadow: 'var(--shadow-glow-p)',
          }}>🏙️</div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>
            <span className="grad-text">Create Your Account</span>
          </h1>
          <p style={{ margin: '6px 0 0', color: 'var(--clr-text-2)', fontSize: '0.88rem' }}>
            Join City Connector and make your city better
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="toast error" style={{ position: 'static', minWidth: 0, marginBottom: 16, animation: 'none' }}>
            <span>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Name & Email */}
          <div className="grid-2">
            <div className="form-group">
              <label className="inp-label">Full Name</label>
              <input className="inp" type="text" name="name" placeholder="John Doe"
                value={formData.name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="inp-label">Phone (optional)</label>
              <input className="inp" type="tel" name="phone" placeholder="+91 9876543210"
                value={formData.phone} onChange={handleChange} />
            </div>
          </div>

          <div className="form-group">
            <label className="inp-label">Email Address</label>
            <div className="inp-icon-wrap">
              <span className="inp-icon">✉️</span>
              <input className="inp" type="email" name="email" autoComplete="email"
                placeholder="you@email.com" value={formData.email} onChange={handleChange} required />
            </div>
          </div>

          {/* Role Picker */}
          <div className="form-group">
            <label className="inp-label">I am a…</label>
            <div className="flex gap-3">
              <div className={`role-card ${formData.role === 'citizen' ? 'selected' : ''}`}
                onClick={() => setFormData({ ...formData, role: 'citizen' })}>
                <div style={{ fontSize: '1.6rem', marginBottom: 6 }}>👤</div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--clr-text)' }}>Citizen</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--clr-text-2)', marginTop: 4 }}>Submit & track complaints</div>
              </div>
              <div className={`role-card ${formData.role === 'department' ? 'selected' : ''}`}
                onClick={() => setFormData({ ...formData, role: 'department' })}>
                <div style={{ fontSize: '1.6rem', marginBottom: 6 }}>🏛️</div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--clr-text)' }}>Department</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--clr-text-2)', marginTop: 4 }}>Manage assigned issues</div>
              </div>
            </div>
          </div>

          {/* Passwords */}
          <div className="grid-2">
            <div className="form-group">
              <label className="inp-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input className="inp" type={showPass ? 'text' : 'password'} name="password"
                  placeholder="Min. 6 characters" value={formData.password} onChange={handleChange}
                  required style={{ paddingRight: 44 }} />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: 'var(--clr-text-3)',
                }}>{showPass ? '🙈' : '👁️'}</button>
              </div>
            </div>
            <div className="form-group">
              <label className="inp-label">Confirm Password</label>
              <input className="inp" type="password" name="confirmPassword"
                placeholder="Repeat password" value={formData.confirmPassword} onChange={handleChange} required />
            </div>
          </div>

          <button type="submit" className="btn-primary-glow w-full"
            style={{ marginTop: 8, padding: '13px', fontSize: '0.95rem' }} disabled={loading}>
            {loading ? <><span className="spinner" /> &nbsp;Creating account...</> : '✨ Create Account'}
          </button>
        </form>

        <div className="text-center mt-6" style={{ borderTop: '1px solid var(--clr-border)', paddingTop: 20 }}>
          <p style={{ margin: 0, color: 'var(--clr-text-2)', fontSize: '0.88rem' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--clr-primary-l)', fontWeight: 600, textDecoration: 'none' }}>
              Sign in →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
