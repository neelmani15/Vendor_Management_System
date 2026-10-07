import React, { useState } from 'react';
import { useAuth, ROLE_ACCOUNTS } from '../context/AuthContext';
import { UserRole } from '../types';
import {
  ShieldCheck,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  UserPlus,
  LogIn,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

export const AuthView: React.FC = () => {
  const { login, register, switchRole, loading } = useAuth();

  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('admin@fieldnerve.com');
  const [loginPassword, setLoginPassword] = useState('Password123!');
  const [showPassword, setShowPassword] = useState(false);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('PROCUREMENT_MANAGER');

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login(loginEmail.trim(), loginPassword);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (regPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);
    try {
      await register({
        name: regName.trim(),
        email: regEmail.trim().toLowerCase(),
        password: regPassword,
        role: regRole,
      });
    } catch (err: any) {
      setError(err.message || 'Registration failed. A user with this email may already exist.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemo = async (role: UserRole) => {
    setError(null);
    setIsSubmitting(true);
    try {
      await switchRole(role);
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      position: 'relative',
      background: 'radial-gradient(ellipse at top, #131B2E 0%, #080D1A 60%, #030712 100%)',
      overflow: 'hidden',
    }}>
      {/* Decorative gradient glow backgrounds */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        left: '20%',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, rgba(99, 102, 241, 0) 70%)',
        filter: 'blur(60px)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-10%',
        right: '20%',
        width: '450px',
        height: '450px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(16, 185, 129, 0.12) 0%, rgba(16, 185, 129, 0) 70%)',
        filter: 'blur(60px)',
        pointerEvents: 'none',
      }} />

      {/* Main Auth Card */}
      <div style={{
        width: '100%',
        maxWidth: '520px',
        zIndex: 1,
        background: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '20px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 30px rgba(99, 102, 241, 0.15)',
        overflow: 'hidden',
      }}>
        {/* Header Branding */}
        <div style={{
          padding: '36px 36px 24px',
          textAlign: 'center',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        }}>
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 0 25px rgba(99, 102, 241, 0.5)',
          }}>
            <ShieldCheck size={32} color="#FFFFFF" />
          </div>

          <h1 style={{
            fontSize: '24px',
            fontWeight: 800,
            fontFamily: 'var(--font-heading)',
            color: '#FFFFFF',
            marginBottom: '6px',
            letterSpacing: '-0.02em',
          }}>
            Field<span style={{ color: 'var(--primary)' }}>Nerve</span>
          </h1>
          <p style={{
            fontSize: '13px',
            color: 'var(--text-secondary)',
            maxWidth: '380px',
            margin: '0 auto',
            lineHeight: 1.5,
          }}>
            Enterprise Vendor & Work Management Platform
          </p>

          {/* Mode Switcher Tabs */}
          <div style={{
            display: 'flex',
            marginTop: '24px',
            background: 'rgba(0, 0, 0, 0.35)',
            padding: '4px',
            borderRadius: '10px',
            border: '1px solid var(--border-color)',
          }}>
            <button
              type="button"
              onClick={() => { setMode('LOGIN'); setError(null); }}
              style={{
                flex: 1,
                padding: '9px 16px',
                borderRadius: '8px',
                border: 'none',
                background: mode === 'LOGIN' ? 'var(--primary)' : 'transparent',
                color: mode === 'LOGIN' ? '#FFFFFF' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s ease',
              }}
            >
              <LogIn size={15} /> Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('REGISTER'); setError(null); }}
              style={{
                flex: 1,
                padding: '9px 16px',
                borderRadius: '8px',
                border: 'none',
                background: mode === 'REGISTER' ? 'var(--primary)' : 'transparent',
                color: mode === 'REGISTER' ? '#FFFFFF' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s ease',
              }}
            >
              <UserPlus size={15} /> Create Account
            </button>
          </div>
        </div>

        {/* Error Alert Box */}
        {error && (
          <div style={{
            margin: '20px 36px 0',
            padding: '12px 16px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: '#f87171',
            fontSize: '13px',
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Form Body */}
        <div style={{ padding: '28px 36px 36px' }}>
          {mode === 'LOGIN' ? (
            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Enterprise Email
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '13px' }} />
                  <input
                    type="email"
                    className="form-input"
                    style={{ paddingLeft: '38px' }}
                    placeholder="e.g. admin@fieldnerve.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    Password
                  </label>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Default: Password123!</span>
                </div>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '13px' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-input"
                    style={{ paddingLeft: '38px', paddingRight: '40px' }}
                    placeholder="Enter password..."
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '12px',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting || loading}
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '14px',
                  fontWeight: 600,
                  marginTop: '6px',
                  justifyContent: 'center',
                }}
              >
                {isSubmitting ? 'Authenticating...' : (
                  <>
                    Sign In to Console <ArrowRight size={16} />
                  </>
                )}
              </button>

              {/* Quick Demo Logins Section */}
              <div style={{ marginTop: '14px', paddingTop: '18px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: 'var(--text-muted)',
                  letterSpacing: '0.05em',
                  marginBottom: '12px',
                  textTransform: 'uppercase',
                }}>
                  <Sparkles size={13} color="var(--primary)" />
                  <span>Instant Demo Roles (1-Click Login)</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {(['ADMIN', 'PROCUREMENT_MANAGER', 'PROCUREMENT_USER', 'VIEWER'] as UserRole[]).map((r) => {
                    const acc = ROLE_ACCOUNTS[r];
                    return (
                      <button
                        key={r}
                        type="button"
                        onClick={() => handleQuickDemo(r)}
                        disabled={isSubmitting || loading}
                        style={{
                          background: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '8px',
                          padding: '8px 10px',
                          textAlign: 'left',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = 'var(--primary)';
                          e.currentTarget.style.background = 'rgba(99, 102, 241, 0.08)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = 'var(--border-color)';
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                        }}
                      >
                        <div style={{ fontSize: '11px', fontWeight: 700, color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            background: r === 'ADMIN' ? 'var(--primary)' : r === 'PROCUREMENT_MANAGER' ? 'var(--success)' : 'var(--warning)',
                            display: 'inline-block',
                          }} />
                          {acc.label}
                        </div>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {acc.name}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Full Name
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '13px' }} />
                  <input
                    type="text"
                    className="form-input"
                    style={{ paddingLeft: '38px' }}
                    placeholder="e.g. Neelmani Kumar"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Business Email
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '13px' }} />
                  <input
                    type="email"
                    className="form-input"
                    style={{ paddingLeft: '38px' }}
                    placeholder="e.g. neelmani@fieldnerve.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Password (Min 6 Characters)
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '13px' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-input"
                    style={{ paddingLeft: '38px', paddingRight: '40px' }}
                    placeholder="Choose a strong password..."
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '12px',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Enterprise Role & Permissions
                </label>
                <select
                  className="form-select"
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value as UserRole)}
                >
                  <option value="ADMIN">ADMIN (Full platform configuration & deletion rights)</option>
                  <option value="PROCUREMENT_MANAGER">PROCUREMENT MANAGER (Vendor onboarding & compliance approval)</option>
                  <option value="PROCUREMENT_USER">PROCUREMENT BUYER (Create work requirements & AI recommendation)</option>
                  <option value="VIEWER">VIEWER (Read-only auditor view)</option>
                </select>

                <div style={{
                  marginTop: '8px',
                  padding: '10px 12px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  fontSize: '11px',
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}>
                  <CheckCircle2 size={14} color="var(--success)" style={{ flexShrink: 0 }} />
                  <span>{ROLE_ACCOUNTS[regRole].desc}</span>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting || loading}
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '14px',
                  fontWeight: 600,
                  marginTop: '8px',
                  justifyContent: 'center',
                }}
              >
                {isSubmitting ? 'Registering Account...' : (
                  <>
                    Complete Registration <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
