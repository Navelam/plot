import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', securityCode: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL ?? ''}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email.trim(),
          password: form.password,
          securityCode: form.securityCode.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        sessionStorage.setItem('adminToken', data.token);
        navigate('/admin');
      } else {
        setError(data.message || 'Invalid credentials');
      }
    } catch {
      setError('Cannot connect to server. Make sure the server is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      fontFamily: 'Inter, sans-serif', overflow: 'hidden'
    }}>
      {/* Left Panel — Aerial image */}
      <div style={{
        flex: '1 1 55%', position: 'relative', overflow: 'hidden',
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
      }}>
        <img
          src="/login-bg.jpg"
          alt="Madurai Plot Aerial"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(10,22,15,0.25)' }} />
      </div>

      {/* Right Panel — Login form */}
      <div style={{
        flex: '0 0 420px', background: '#0c1a12',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '3rem 2.5rem', position: 'relative', overflow: 'hidden'
      }}>
        {/* subtle glow blobs */}
        <div style={{ position: 'absolute', top: -80, right: -80, width: 260, height: 260, background: 'radial-gradient(circle, rgba(13,148,136,0.12) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -60, left: -60, width: 200, height: 200, background: 'radial-gradient(circle, rgba(5,150,105,0.1) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Logo mark */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{
              width: 48, height: 48, borderRadius: '14px',
              background: 'linear-gradient(135deg, #0d9488 0%, #059669 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(13,148,136,0.35)', marginBottom: '1rem'
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
            <h1 style={{ color: '#fff', fontWeight: 800, fontSize: '1.5rem', margin: '0 0 0.25rem' }}>Admin Portal</h1>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.82rem' }}>Plot Booking Management · Madurai</p>
          </div>

          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
              color: '#fca5a5', borderRadius: '0.65rem', padding: '0.7rem 0.9rem',
              fontSize: '0.8rem', marginBottom: '1.25rem', display: 'flex', gap: '0.5rem', alignItems: 'flex-start'
            }}>
              <svg style={{ flexShrink: 0, marginTop: 1 }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem', fontWeight: 700, display: 'block', marginBottom: '0.4rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Email Address</label>
              <input
                type="email" required value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="admin@example.com"
                style={{
                  width: '100%', padding: '0.75rem 1rem', borderRadius: '0.6rem',
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  color: '#fff', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box',
                  transition: 'border-color 0.2s'
                }}
                onFocus={e => e.target.style.borderColor = 'rgba(13,148,136,0.6)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>

            <div>
              <label style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem', fontWeight: 700, display: 'block', marginBottom: '0.4rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'} required value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="Enter password"
                  style={{
                    width: '100%', padding: '0.75rem 3rem 0.75rem 1rem', borderRadius: '0.6rem',
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                    color: '#fff', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={e => e.target.style.borderColor = 'rgba(13,148,136,0.6)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
                <button type="button" onClick={() => setShowPass(s => !s)} style={{
                  position: 'absolute', right: '0.85rem', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)',
                  cursor: 'pointer', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.05em'
                }}>
                  {showPass ? 'HIDE' : 'SHOW'}
                </button>
              </div>
            </div>

            <div>
              <label style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem', fontWeight: 700, display: 'block', marginBottom: '0.4rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Security Code</label>
              <input
                type="password" required value={form.securityCode} maxLength={6}
                onChange={e => setForm(f => ({ ...f, securityCode: e.target.value }))}
                placeholder="• • • • • •"
                style={{
                  width: '100%', padding: '0.75rem 1rem', borderRadius: '0.6rem',
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  color: '#fff', fontSize: '1rem', outline: 'none', boxSizing: 'border-box',
                  letterSpacing: '0.3em', transition: 'border-color 0.2s'
                }}
                onFocus={e => e.target.style.borderColor = 'rgba(13,148,136,0.6)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>

            <button type="submit" disabled={loading} style={{
              marginTop: '0.5rem', padding: '0.875rem', borderRadius: '0.65rem', border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              background: loading ? 'rgba(13,148,136,0.35)' : 'linear-gradient(135deg, #0d9488 0%, #059669 100%)',
              color: '#fff', fontWeight: 700, fontSize: '0.9rem',
              boxShadow: loading ? 'none' : '0 4px 20px rgba(13,148,136,0.3)',
              transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
            }}>
              {loading ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'spin 0.8s linear infinite' }}><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
                  Authenticating...
                </>
              ) : (
                <>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  Sign In to Dashboard
                </>
              )}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '1.75rem', color: 'rgba(255,255,255,0.15)', fontSize: '0.7rem' }}>
            Restricted access · Authorized personnel only
          </p>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};
