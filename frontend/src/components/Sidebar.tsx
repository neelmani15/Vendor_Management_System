import React from 'react';
import {
  LayoutDashboard,
  Users,
  FileText,
  Sparkles,
  History,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export type NavTab = 'dashboard' | 'vendors' | 'requirements' | 'recommendations' | 'audit';

interface SidebarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const { user } = useAuth();

  const navItems: { id: NavTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'vendors', label: 'Vendor Directory', icon: <Users size={18} /> },
    { id: 'requirements', label: 'Work Requirements', icon: <FileText size={18} /> },
    {
      id: 'recommendations',
      label: 'Recommendation Engine',
      icon: <Sparkles size={18} />,
      badge: 'AI + v1',
    },
    { id: 'audit', label: 'Audit Trail', icon: <History size={18} /> },
  ];

  return (
    <aside style={{
      width: '260px',
      background: 'rgba(15, 23, 42, 0.6)',
      borderRight: '1px solid var(--border-color)',
      padding: '24px 16px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      minHeight: 'calc(100vh - 70px)',
    }}>
      <div>
        <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '14px', paddingLeft: '12px', fontWeight: 700 }}>
          PLATFORM MODULES
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '11px 14px',
                  borderRadius: '10px',
                  background: isActive ? 'linear-gradient(90deg, rgba(99, 102, 241, 0.2) 0%, rgba(99, 102, 241, 0.05) 100%)' : 'transparent',
                  border: isActive ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid transparent',
                  color: isActive ? '#FFFFFF' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: isActive ? 600 : 500,
                  transition: 'all 0.15s ease',
                  textAlign: 'left',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ color: isActive ? 'var(--primary)' : 'var(--text-muted)' }}>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    padding: '2px 7px',
                    borderRadius: '999px',
                    background: 'var(--primary-light)',
                    color: 'var(--primary)',
                    border: '1px solid rgba(99, 102, 241, 0.3)',
                  }}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Permissions / Active Role Card */}
      <div className="glass-panel" style={{ padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <CheckCircle2 size={16} color="var(--success)" />
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#FFFFFF' }}>Active Permissions</span>
        </div>
        <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
          Signed in as <strong>{user?.role}</strong>.
          {user?.role === 'ADMIN' && ' Full privileges: manage users, vendors, requirements, audit.'}
          {user?.role === 'PROCUREMENT_MANAGER' && ' Manage vendors, requirements, documents, runs.'}
          {user?.role === 'PROCUREMENT_USER' && ' Create requirements, view vendors and recommendations.'}
          {user?.role === 'VIEWER' && ' Read-only transparency view.'}
        </p>
      </div>
    </aside>
  );
};
