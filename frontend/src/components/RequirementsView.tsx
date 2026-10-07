import React, { useState, useEffect } from 'react';
import { WorkRequirement } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { NavTab } from './Sidebar';
import {
  Plus,
  Sparkles,
  MapPin,
  X,
  ShieldCheck,
} from 'lucide-react';

interface RequirementsViewProps {
  onNavigate: (tab: NavTab, requirementId?: string) => void;
}

export const RequirementsView: React.FC<RequirementsViewProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [requirements, setRequirements] = useState<WorkRequirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Electrical Engineering');
  const [city, setCity] = useState('Austin');
  const [state, setState] = useState('TX');
  const [estimatedValue, setEstimatedValue] = useState('350000');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('HIGH');
  const [minimumRating, setMinimumRating] = useState('4.0');
  const [capabilities, setCapabilities] = useState('High Voltage Wiring, Switchgear Installation');
  const [complianceDocs, setComplianceDocs] = useState<string[]>(['INSURANCE', 'SAFETY_CERTIFICATE']);

  const canCreate = user?.role === 'ADMIN' || user?.role === 'PROCUREMENT_MANAGER' || user?.role === 'PROCUREMENT_USER';

  const fetchRequirements = async () => {
    try {
      setLoading(true);
      const res = await api.getWorkRequirements({ limit: 50 });
      setRequirements(res.items || []);
    } catch (err) {
      console.error('Failed to load work requirements', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequirements();
  }, []);

  const handleCreateRequirement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createWorkRequirement({
        title,
        description,
        category,
        location: { country: 'USA', state, city },
        estimatedValue: parseFloat(estimatedValue) || 0,
        currency: 'USD',
        priority,
        expectedStartDate: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
        requiredCapabilities: capabilities.split(',').map((c) => c.trim()).filter(Boolean),
        minimumRating: parseFloat(minimumRating) || 0,
        complianceRequirements: complianceDocs,
        status: 'OPEN',
      });
      setShowCreateModal(false);
      await fetchRequirements();
    } catch (err: any) {
      alert(`Error creating requirement: ${err.message}`);
    }
  };

  const toggleComplianceDoc = (docType: string) => {
    if (complianceDocs.includes(docType)) {
      setComplianceDocs(complianceDocs.filter((d) => d !== docType));
    } else {
      setComplianceDocs([...complianceDocs, docType]);
    }
  };

  return (
    <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#FFFFFF', marginBottom: '6px' }}>
            Work Requirements Registry
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            Define procurement specifications, compliance mandates, and run matching recommendation intelligence.
          </p>
        </div>

        {canCreate && (
          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
            <Plus size={16} /> New Work Requirement
          </button>
        )}
      </div>

      {/* Requirements List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            Loading requirements...
          </div>
        ) : requirements.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            No work requirements registered yet.
          </div>
        ) : (
          requirements.map((req) => (
            <div
              key={req._id}
              className="glass-panel"
              style={{
                padding: '24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '16px',
                border: '1px solid var(--border-color)',
              }}
            >
              <div style={{ maxWidth: '650px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span className={`badge ${
                    req.priority === 'CRITICAL'
                      ? 'badge-danger'
                      : req.priority === 'HIGH'
                      ? 'badge-warning'
                      : 'badge-info'
                  }`}>
                    {req.priority} PRIORITY
                  </span>
                  <span className="badge badge-purple">{req.category}</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Min Rating: {req.minimumRating.toFixed(1)} ★
                  </span>
                </div>

                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#FFFFFF', marginBottom: '6px' }}>
                  {req.title}
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px', lineHeight: 1.4 }}>
                  {req.description}
                </p>

                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '12px', color: 'var(--text-muted)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={13} color="var(--primary)" />
                    <span>{req.location.city}, {req.location.state}</span>
                  </div>
                  <div>
                    Budget: <strong style={{ color: '#FFFFFF' }}>${(req.estimatedValue || 0).toLocaleString()} {req.currency}</strong>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <ShieldCheck size={13} color="var(--success)" />
                    <span>Mandatory Docs: {req.complianceRequirements.length > 0 ? req.complianceRequirements.join(', ') : 'None'}</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div>
                <button
                  className="btn btn-primary"
                  style={{ padding: '10px 18px', fontSize: '13px' }}
                  onClick={() => onNavigate('recommendations', req._id)}
                >
                  <Sparkles size={16} />
                  <span>Run Recommendation Engine</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#FFFFFF' }}>Create Work Requirement</h3>
              <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateRequirement} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Title</label>
                <input className="form-input" placeholder="e.g. Substation Switchgear Replacement" value={title} onChange={(e) => setTitle(e.target.value)} required />
              </div>

              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Detailed Specification Description</label>
                <textarea className="form-input" rows={3} placeholder="Describe the scope of work and deliverables..." value={description} onChange={(e) => setDescription(e.target.value)} required />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Category</label>
                  <input className="form-input" value={category} onChange={(e) => setCategory(e.target.value)} required />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Priority</label>
                  <select className="form-select" value={priority} onChange={(e) => setPriority(e.target.value as any)}>
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>City</label>
                  <input className="form-input" value={city} onChange={(e) => setCity(e.target.value)} required />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>State</label>
                  <input className="form-input" value={state} onChange={(e) => setState(e.target.value)} required />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Estimated Value ($)</label>
                  <input type="number" className="form-input" value={estimatedValue} onChange={(e) => setEstimatedValue(e.target.value)} required />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Min Rating Filter</label>
                  <input type="number" step="0.1" min="0" max="5" className="form-input" value={minimumRating} onChange={(e) => setMinimumRating(e.target.value)} required />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Required Capabilities (Comma-separated)</label>
                  <input className="form-input" value={capabilities} onChange={(e) => setCapabilities(e.target.value)} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Mandatory Compliance Documents (Disqualification Criteria)
                </label>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  {['INSURANCE', 'SAFETY_CERTIFICATE', 'TRADE_LICENSE', 'TAX_REGISTRATION'].map((doc) => {
                    const isChecked = complianceDocs.includes(doc);
                    return (
                      <label key={doc} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#FFFFFF', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleComplianceDoc(doc)}
                        />
                        {doc.replace('_', ' ')}
                      </label>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Register Work Requirement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
