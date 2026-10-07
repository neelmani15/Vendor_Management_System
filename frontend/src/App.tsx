import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar, NavTab } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { VendorsView } from './components/VendorsView';
import { RequirementsView } from './components/RequirementsView';
import { RecommendationsView } from './components/RecommendationsView';
import { AuditView } from './components/AuditView';
import { AuthView } from './components/AuthView';
import { ShieldCheck, RotateCw } from 'lucide-react';

export const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [selectedRequirementId, setSelectedRequirementId] = useState<string | undefined>(undefined);

  const handleNavigate = (tab: NavTab, requirementId?: string) => {
    if (requirementId) {
      setSelectedRequirementId(requirementId);
    }
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Initial authentication loading state
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0B0F19',
        color: '#FFFFFF',
        gap: '16px',
      }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '14px',
          background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 30px rgba(99, 102, 241, 0.5)',
        }}>
          <ShieldCheck size={32} color="#FFFFFF" />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)', fontSize: '14px' }}>
          <RotateCw size={16} className="animate-spin" />
          <span>Initializing FieldNerve enterprise session...</span>
        </div>
      </div>
    );
  }

  // Not authenticated: present the login / registration portal
  if (!user) {
    return <AuthView />;
  }

  // Authenticated: full enterprise work management platform
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar activeTab={activeTab} onTabChange={handleNavigate} />
        <main style={{ flex: 1, minWidth: 0, overflowX: 'hidden' }}>
          {activeTab === 'dashboard' && <DashboardView onNavigate={handleNavigate} />}
          {activeTab === 'vendors' && <VendorsView />}
          {activeTab === 'requirements' && <RequirementsView onNavigate={handleNavigate} />}
          {activeTab === 'recommendations' && (
            <RecommendationsView initialRequirementId={selectedRequirementId} />
          )}
          {activeTab === 'audit' && <AuditView />}
        </main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
