import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { ShieldCheck, Activity, LogOut } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

  const getRoleBadgeClass = (role?: UserRole) => {
    switch (role) {
      case 'ADMIN':
        return 'badge-purple';
      case 'PROCUREMENT_MANAGER':
        return 'badge-success';
      case 'PROCUREMENT_USER':
        return 'badge-primary';
      case 'VIEWER':
        return 'badge-warning';
      default:
        return 'badge-primary';
    }
  };

  return (
    <header style={{
      height: '70px',
      borderBottom: '1px solid var(--border-color)',
      background: 'rgba(11, 15, 25, 0.85)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 28px',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 15px rgba(99, 102, 241, 0.5)',
        }}>
          <ShieldCheck size={22} color="#FFFFFF" />
        </div>
        <div>
          <span style={{ fontSize: '18px', fontWeight: 700, fontFamily: 'var(--font-heading)', color: '#FFFFFF' }}>
            Field<span style={{ color: 'var(--primary)' }}>Nerve</span>
          </span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', letterSpacing: '0.05em' }}>
            VENDOR & WORK MANAGEMENT
          </span>
        </div>
      </div>

      {/* System Indicator & Authenticated User Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
          <Activity size={15} color="var(--success)" />
          <span>System: <strong style={{ color: 'var(--success)' }}>Active (Deterministic Engine v1)</strong></span>
        </div>

        {/* User Card & Logout */}
        {user && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            borderLeft: '1px solid var(--border-color)',
            paddingLeft: '18px',
          }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #4F46E5 0%, #06B6D4 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '14px',
              color: '#FFFFFF',
              boxShadow: '0 0 10px rgba(79, 70, 229, 0.3)',
            }}>
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#FFFFFF' }}>{user.name}</span>
                <span className={`badge ${getRoleBadgeClass(user.role)}`} style={{ fontSize: '10px', padding: '1px 7px' }}>
                  {user.role?.replace('_', ' ')}
                </span>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{user.email}</div>
            </div>

            <button
              onClick={() => logout()}
              className="btn btn-secondary"
              style={{
                padding: '7px 14px',
                fontSize: '12px',
                color: '#f87171',
                borderColor: 'rgba(239, 68, 68, 0.35)',
                background: 'rgba(239, 68, 68, 0.08)',
                marginLeft: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
              }}
              title="Sign out of your session"
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
