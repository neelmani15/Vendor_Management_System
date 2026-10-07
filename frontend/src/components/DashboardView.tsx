import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Vendor, WorkRequirement } from '../types';
import {
  Users,
  AlertTriangle,
  FileCheck2,
  Sparkles,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { NavTab } from './Sidebar';

interface DashboardViewProps {
  onNavigate: (tab: NavTab, requirementId?: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [requirements, setRequirements] = useState<WorkRequirement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vData, rData] = await Promise.all([
          api.getVendors({ limit: 100 }),
          api.getWorkRequirements({ limit: 100 }),
        ]);
        setVendors(vData.items || []);
        setRequirements(rData.items || []);
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalVendors = vendors.length;
  const activeVendors = vendors.filter((v) => v.status === 'ACTIVE').length;
  const nonCompliant = vendors.filter((v) => v.complianceStatus === 'NON_COMPLIANT' || v.complianceStatus === 'EXPIRING_SOON').length;
  const openRequirements = requirements.filter((r) => r.status === 'OPEN').length;

  return (
    <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#FFFFFF', marginBottom: '8px' }}>
          Procurement Operations Dashboard
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
          Vendor compliance monitoring and deterministic recommendation intelligence platform.
        </p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
        {/* KPI 1 */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>TOTAL VENDORS</span>
            <div style={{ background: 'var(--primary-light)', padding: '8px', borderRadius: '8px', color: 'var(--primary)' }}>
              <Users size={20} />
            </div>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: '#FFFFFF' }}>{loading ? '...' : totalVendors}</div>
          <div style={{ fontSize: '12px', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <TrendingUp size={14} />
            <span>{activeVendors} active & operational</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>COMPLIANCE ALERTS</span>
            <div style={{ background: 'var(--warning-bg)', padding: '8px', borderRadius: '8px', color: 'var(--warning)' }}>
              <AlertTriangle size={20} />
            </div>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: '#FFFFFF' }}>{loading ? '...' : nonCompliant}</div>
          <div style={{ fontSize: '12px', color: 'var(--warning)' }}>
            Lapsed or expiring within 30 days
          </div>
        </div>

        {/* KPI 3 */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>OPEN REQUIREMENTS</span>
            <div style={{ background: 'var(--info-bg)', padding: '8px', borderRadius: '8px', color: 'var(--info)' }}>
              <FileCheck2 size={20} />
            </div>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: '#FFFFFF' }}>{loading ? '...' : openRequirements}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Across {requirements.length} total requisitions
          </div>
        </div>

        {/* KPI 4 */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px', border: '1px solid rgba(99, 102, 241, 0.4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--primary)' }}>RECOMMENDATION ENGINE</span>
            <div style={{ background: 'var(--primary-light)', padding: '8px', borderRadius: '8px', color: 'var(--primary)' }}>
              <Sparkles size={20} />
            </div>
          </div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#FFFFFF' }}>Algorithm v1</div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Deterministic weights + AI Explainer
          </div>
        </div>
      </div>

      {/* Showcase Benchmark Action Box */}
      <div className="glass-panel" style={{
        padding: '30px',
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(16, 24, 39, 0.8) 100%)',
        border: '1px solid rgba(99, 102, 241, 0.35)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px',
      }}>
        <div style={{ maxWidth: '650px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span className="badge badge-purple">LIVE EVALUATION SCENARIO</span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Demonstrating Disqualification, Tie-Breaking & AI Synthesis</span>
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#FFFFFF', marginBottom: '10px' }}>
            High-Voltage Substation Automation & Switchgear Upgrade
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.5 }}>
            Critical municipal project in Austin, TX. Test the engine against candidate vendors: watch how <strong>Apex Power</strong> emerges as the top choice, <strong>Voltaic Energy</strong> is disqualified due to expired OSHA safety documents, and <strong>Austin ElectroCorp</strong> wins the tie-breaker against <strong>Beacon Power</strong>!
          </p>
        </div>

        <button
          className="btn btn-primary"
          style={{ padding: '12px 24px', fontSize: '15px' }}
          onClick={() => {
            const req = requirements.find((r) => r.title.includes('High-Voltage') || r.category === 'Electrical Engineering') || requirements[0];
            onNavigate('recommendations', req?._id);
          }}
        >
          <span>Run Recommendation Engine</span>
          <ArrowRight size={18} />
        </button>
      </div>

      {/* Quick Navigation Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Card 1 */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#FFFFFF' }}>Recent Work Requirements</h3>
            <button
              onClick={() => onNavigate('requirements')}
              style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '13px', cursor: 'pointer', fontWeight: 600 }}
            >
              View All &rarr;
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {requirements.slice(0, 4).map((r) => (
              <div
                key={r._id}
                onClick={() => onNavigate('recommendations', r._id)}
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  border: '1px solid transparent',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.3)')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'transparent')}
              >
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF' }}>{r.title}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {r.category} • {r.location.city}, {r.location.state}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className={`badge ${r.priority === 'CRITICAL' ? 'badge-danger' : r.priority === 'HIGH' ? 'badge-warning' : 'badge-info'}`}>
                    {r.priority}
                  </span>
                  <Sparkles size={16} color="var(--primary)" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Card 2 */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#FFFFFF' }}>Vendor Compliance Watch</h3>
            <button
              onClick={() => onNavigate('vendors')}
              style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '13px', cursor: 'pointer', fontWeight: 600 }}
            >
              View All &rarr;
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {vendors.slice(0, 4).map((v) => (
              <div
                key={v._id}
                onClick={() => onNavigate('vendors')}
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                }}
              >
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF' }}>{v.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Rating: {v.rating.toFixed(1)}/5.0 • {v.completedProjects} projects
                  </div>
                </div>
                <span className={`badge ${
                  v.complianceStatus === 'COMPLIANT'
                    ? 'badge-success'
                    : v.complianceStatus === 'EXPIRING_SOON'
                    ? 'badge-warning'
                    : 'badge-danger'
                }`}>
                  {v.complianceStatus.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
