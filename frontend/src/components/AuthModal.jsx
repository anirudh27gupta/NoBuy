import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export const AuthModal = ({ isOpen, onClose, initialMode = 'login', onSuccess }) => {
  if (!isOpen) return null;

  const { login, register } = useAuth();
  const [mode, setMode] = useState(initialMode); // 'login' or 'register'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register({
          full_name: fullName,
          email,
          password,
          phone,
          address
        });
      }
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Authentication error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" id="auth-modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '440px' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 style={{ fontSize: '1.25rem' }}>
              {mode === 'login' ? 'Welcome Back to No-Buy' : 'Join No-Buy'}
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
              One unified account to rent and lend gear
            </p>
          </div>
          <button className="modal-close-btn" id="close-auth-modal" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {/* Mode Switcher */}
          <div style={{ display: 'flex', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', padding: '0.25rem', marginBottom: '1.5rem' }}>
            <button
              type="button"
              id="switch-to-login"
              className={`btn btn-sm ${mode === 'login' ? 'btn-secondary' : 'btn-outline'}`}
              style={{ flex: 1, border: 'none', background: mode === 'login' ? 'rgba(255, 255, 255, 0.12)' : 'transparent' }}
              onClick={() => { setMode('login'); setError(''); }}
            >
              Sign In
            </button>
            <button
              type="button"
              id="switch-to-register"
              className={`btn btn-sm ${mode === 'register' ? 'btn-secondary' : 'btn-outline'}`}
              style={{ flex: 1, border: 'none', background: mode === 'register' ? 'rgba(255, 255, 255, 0.12)' : 'transparent' }}
              onClick={() => { setMode('register'); setError(''); }}
            >
              Create Account
            </button>
          </div>

          {error && (
            <div style={{ background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.3)', color: '#fb7185', padding: '0.65rem 1rem', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} id="auth-form">
            {mode === 'register' && (
              <>
                <div className="form-group">
                  <label className="form-label" htmlFor="reg-name">Full Name</label>
                  <input
                    id="reg-name"
                    type="text"
                    className="form-input"
                    placeholder="e.g. Maya Lin"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="reg-phone">Phone Number (Optional)</label>
                  <input
                    id="reg-phone"
                    type="tel"
                    className="form-input"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="reg-address">City / Location</label>
                  <input
                    id="reg-address"
                    type="text"
                    className="form-input"
                    placeholder="e.g. Bengaluru, Karnataka"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                  />
                </div>
              </>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="auth-email">Email Address</label>
              <input
                id="auth-email"
                type="email"
                className="form-input"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="auth-password">Password</label>
              <input
                id="auth-password"
                type="password"
                className="form-input"
                placeholder="At least 6 characters"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              id="submit-auth-btn"
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: '0.5rem' }}
              disabled={loading}
            >
              {loading ? 'Please wait...' : mode === 'login' ? 'Sign In to Account' : 'Complete Registration'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
