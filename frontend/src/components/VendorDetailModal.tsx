import React, { useState, useEffect } from 'react';
import { Vendor, VendorDocument } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  X,
  FileCheck,
  CheckCircle,
  XCircle,
  Plus,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  RotateCw,
  AlertTriangle,
  FileWarning,
} from 'lucide-react';

interface VendorDetailModalProps {
  vendor: Vendor;
  onClose: () => void;
  onRefresh: () => void;
}

export const VendorDetailModal: React.FC<VendorDetailModalProps> = ({
  vendor,
  onClose,
  onRefresh,
}) => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<VendorDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDoc, setShowAddDoc] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [auditResult, setAuditResult] = useState<any>(null);
  const [isAuditing, setIsAuditing] = useState(false);

  // New doc form state
  const [newDocType, setNewDocType] = useState('INSURANCE');
  const [newDocNumber, setNewDocNumber] = useState('');
  const [newIssuedAt, setNewIssuedAt] = useState(new Date().toISOString().split('T')[0]);
  const [newExpiresAt, setNewExpiresAt] = useState(
    new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().split('T')[0]
  );
  const [newFileName, setNewFileName] = useState('');
  const [newInitialStatus, setNewInitialStatus] = useState('VALID');

  const canManageDocs = user?.role === 'ADMIN' || user?.role === 'PROCUREMENT_MANAGER';

  const fetchDocs = async () => {
    try {
      setLoading(true);
      const docs = await api.getVendorDocuments(vendor._id);
      setDocuments(docs || []);
    } catch (err) {
      console.error('Failed to fetch documents', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, [vendor._id]);

  const handleUpdateStatus = async (docId: string, status: string) => {
    try {
      await api.updateDocumentStatus(docId, status);
      await fetchDocs();
      onRefresh();
    } catch (err: any) {
      alert(`Error updating document status: ${err.message}`);
    }
  };

  const handleTriggerComplianceAudit = async () => {
    try {
      setIsAuditing(true);
      const res = await api.reviewCompliance(vendor._id, reviewNotes || 'Compliance reviewed by Procurement Manager');
      setAuditResult(res);
      await fetchDocs();
      onRefresh();
    } catch (err: any) {
      alert(`Error executing compliance audit: ${err.message}`);
    } finally {
      setIsAuditing(false);
    }
  };

  const handleBatchVerifyAll = async () => {
    try {
      setIsAuditing(true);
      const res = await api.verifyAllDocuments(vendor._id);
      setAuditResult(res);
      await fetchDocs();
      onRefresh();
    } catch (err: any) {
      alert(`Error batch verifying documents: ${err.message}`);
    } finally {
      setIsAuditing(false);
    }
  };

  const handleCreateDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocNumber || !newFileName) {
      alert('Please fill out document number and file name');
      return;
    }

    try {
      await api.createDocument({
        vendorId: vendor._id,
        documentType: newDocType,
        documentNumber: newDocNumber,
        issuedAt: new Date(newIssuedAt).toISOString(),
        expiresAt: new Date(newExpiresAt).toISOString(),
        fileName: newFileName,
        status: newInitialStatus,
      });
      setShowAddDoc(false);
      setNewDocNumber('');
      setNewFileName('');
      await fetchDocs();
      onRefresh();
    } catch (err: any) {
      alert(`Error adding document: ${err.message}`);
    }
  };

  // Compute live breakdown stats
  const now = new Date();
  const validDocs = documents.filter((d) => d.status === 'VALID' && new Date(d.expiresAt) > now);
  const expiringSoonDocs = documents.filter((d) => {
    const days = Math.ceil((new Date(d.expiresAt).getTime() - now.getTime()) / (1000 * 3600 * 24));
    return (d.status === 'EXPIRING_SOON' || (days > 0 && days <= 30)) && d.status !== 'EXPIRED' && d.status !== 'REJECTED';
  });
  const expiredDocs = documents.filter((d) => d.status === 'EXPIRED' || new Date(d.expiresAt) <= now);
  const pendingDocs = documents.filter((d) => d.status === 'PENDING_VERIFICATION');

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '850px' }}>
        {/* Modal Header */}
        <div style={{
          padding: '24px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#FFFFFF' }}>{vendor.name}</h2>
              <span className={`badge ${
                vendor.complianceStatus === 'COMPLIANT'
                  ? 'badge-success'
                  : vendor.complianceStatus === 'EXPIRING_SOON'
                  ? 'badge-warning'
                  : 'badge-danger'
              }`}>
                {vendor.complianceStatus.replace('_', ' ')}
              </span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
              {vendor.description || 'Enterprise Vendor Profile'}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Key Facts Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '12px',
            background: 'rgba(255, 255, 255, 0.02)',
            padding: '16px',
            borderRadius: '12px',
            border: '1px solid var(--border-color)',
          }}>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>RATING</div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--warning)' }}>★ {vendor.rating.toFixed(1)} / 5.0</div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>EXPERIENCE</div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#FFFFFF' }}>{vendor.yearsOfExperience} Years</div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>PROJECTS</div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#FFFFFF' }}>{vendor.completedProjects} Completed</div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>AVG VALUE</div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--success)' }}>${(vendor.averageProjectValue || 0).toLocaleString()}</div>
            </div>
          </div>

          {/* Contact & Locations */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ padding: '14px', borderRadius: '10px', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#FFFFFF', marginBottom: '8px' }}>CONTACT PERSON</div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#FFFFFF', marginBottom: '4px' }}>{vendor.contact.primaryContactName}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '2px' }}>
                <Mail size={13} /> {vendor.contact.email}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                <Phone size={13} /> {vendor.contact.phone}
              </div>
            </div>

            <div style={{ padding: '14px', borderRadius: '10px', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#FFFFFF', marginBottom: '8px' }}>OPERATING LOCATIONS</div>
              {vendor.operatingLocations.map((loc, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  <MapPin size={13} color="var(--primary)" />
                  <span>{loc.city ? `${loc.city}, ` : ''}{loc.state}, {loc.country}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Dedicated Compliance Review & Verification Hub */}
          <div className="glass-panel" style={{
            padding: '20px',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(15, 23, 42, 0.9) 100%)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShieldCheck size={22} color="var(--success)" />
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#FFFFFF' }}>
                    Compliance Audit & Review Workflow
                  </h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    Evaluate compliance health, review pending documents, and certify vendor status.
                  </p>
                </div>
              </div>

              {canManageDocs && (
                <div style={{ display: 'flex', gap: '8px' }}>
                  {pendingDocs.length > 0 && (
                    <button
                      className="btn btn-secondary"
                      style={{ fontSize: '12px', padding: '6px 12px', color: 'var(--success)' }}
                      onClick={handleBatchVerifyAll}
                      disabled={isAuditing}
                    >
                      <CheckCircle size={14} /> Batch Verify ({pendingDocs.length})
                    </button>
                  )}
                  <button
                    className="btn btn-primary"
                    style={{ fontSize: '12px', padding: '6px 14px' }}
                    onClick={handleTriggerComplianceAudit}
                    disabled={isAuditing}
                  >
                    <RotateCw size={14} className={isAuditing ? 'animate-spin' : ''} />
                    Run Compliance Audit
                  </button>
                </div>
              )}
            </div>

            {/* Document Health Metrics Chips */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '10px',
              marginBottom: '14px',
            }}>
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
                <div style={{ fontSize: '11px', color: 'var(--success)', fontWeight: 600 }}>VALID DOCUMENTS</div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF' }}>{validDocs.length}</div>
              </div>
              <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.25)' }}>
                <div style={{ fontSize: '11px', color: 'var(--warning)', fontWeight: 600 }}>EXPIRING SOON (&le;30d)</div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF' }}>{expiringSoonDocs.length}</div>
              </div>
              <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.25)' }}>
                <div style={{ fontSize: '11px', color: 'var(--danger)', fontWeight: 600 }}>EXPIRED / REJECTED</div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF' }}>{expiredDocs.length}</div>
              </div>
              <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(99, 102, 241, 0.25)' }}>
                <div style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 600 }}>PENDING REVIEW</div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF' }}>{pendingDocs.length}</div>
              </div>
            </div>

            {/* Explanatory callout for vendors under review with 0 documents */}
            {documents.length === 0 && !loading && (
              <div style={{
                background: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: '8px',
                padding: '12px 14px',
                fontSize: '13px',
                color: '#fbbf24',
                marginBottom: '14px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                lineHeight: 1.5,
              }}>
                <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong>Why is this vendor currently UNDER REVIEW?</strong>
                  <div style={{ marginTop: '2px', color: 'rgba(255, 255, 255, 0.85)', fontSize: '12px' }}>
                    Vendors start <em>UNDER REVIEW</em> until valid compliance records (Insurance, OSHA safety, or Trade Licenses) are registered and verified. Uploading a valid certificate automatically elevates their status to <strong>COMPLIANT</strong>.
                  </div>
                </div>
              </div>
            )}

            {/* Optional Auditor Review Notes */}
            {canManageDocs && (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  className="form-input"
                  style={{ fontSize: '12px', padding: '6px 12px' }}
                  placeholder="Auditor notes (e.g. Annual insurance certificate verified via registry)..."
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                />
              </div>
            )}

            {/* Audit Result Findings Display */}
            {auditResult && (
              <div style={{
                marginTop: '12px',
                background: 'rgba(0, 0, 0, 0.3)',
                padding: '12px 16px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                fontSize: '12px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontWeight: 600, color: '#FFFFFF' }}>
                  <span>Audit Result: {auditResult.previousStatus} &rarr; <strong style={{ color: 'var(--success)' }}>{auditResult.newStatus}</strong></span>
                  <span style={{ color: 'var(--text-muted)' }}>Reviewed by {auditResult.reviewedBy}</span>
                </div>
                <ul style={{ paddingLeft: '16px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {auditResult.findings?.map((f: string, i: number) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Capabilities */}
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#FFFFFF', marginBottom: '8px' }}>CAPABILITIES & SKILLS</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {vendor.capabilities.map((cap, i) => (
                <span key={i} className="badge badge-purple">{cap}</span>
              ))}
            </div>
          </div>

          {/* Compliance Documents Section */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileCheck size={18} color="var(--primary)" />
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#FFFFFF' }}>Compliance Document Registry</h3>
              </div>
              {canManageDocs && (
                <button
                  className="btn btn-secondary"
                  style={{ fontSize: '12px', padding: '6px 12px' }}
                  onClick={() => setShowAddDoc(true)}
                >
                  <Plus size={14} /> Add Document Metadata
                </button>
              )}
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>Loading documents...</div>
            ) : documents.length === 0 ? (
              <div style={{
                padding: '24px',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px dashed var(--border-color)',
                borderRadius: '10px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px'
              }}>
                <FileWarning size={28} color="var(--warning)" />
                <div style={{ color: '#FFFFFF', fontWeight: 600, fontSize: '14px' }}>
                  No Compliance Documents on File
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '13px', maxWidth: '480px' }}>
                  Organizations require verified compliance credentials (e.g. Insurance or Trade Licenses) before a vendor is cleared for work recommendations.
                </div>
                {canManageDocs && (
                  <button
                    className="btn btn-primary"
                    style={{ marginTop: '6px', fontSize: '12px' }}
                    onClick={() => setShowAddDoc(true)}
                  >
                    <Plus size={14} /> Register First Document
                  </button>
                )}
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>TYPE</th>
                    <th>DOC NUMBER</th>
                    <th>EXPIRES AT</th>
                    <th>STATUS</th>
                    {canManageDocs && <th>REVIEW ACTIONS</th>}
                  </tr>
                </thead>
                <tbody>
                  {documents.map((doc) => {
                    const isExpired = new Date(doc.expiresAt) < new Date();
                    return (
                      <tr key={doc._id}>
                        <td style={{ fontWeight: 600, color: '#FFFFFF' }}>{doc.documentType.replace('_', ' ')}</td>
                        <td style={{ color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{doc.documentNumber}</td>
                        <td style={{ color: isExpired ? 'var(--danger)' : 'var(--text-secondary)' }}>
                          {new Date(doc.expiresAt).toLocaleDateString()}
                        </td>
                        <td>
                          <span className={`badge ${
                            doc.status === 'VALID'
                              ? 'badge-success'
                              : doc.status === 'EXPIRING_SOON'
                              ? 'badge-warning'
                              : 'badge-danger'
                          }`}>
                            {doc.status.replace('_', ' ')}
                          </span>
                        </td>
                        {canManageDocs && (
                          <td>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              {doc.status !== 'VALID' && (
                                <button
                                  className="btn btn-secondary"
                                  style={{ padding: '3px 8px', fontSize: '11px', color: 'var(--success)' }}
                                  title="Approve / Mark Valid"
                                  onClick={() => handleUpdateStatus(doc._id, 'VALID')}
                                >
                                  <CheckCircle size={13} /> Approve
                                </button>
                              )}
                              {doc.status !== 'REJECTED' && (
                                <button
                                  className="btn btn-secondary"
                                  style={{ padding: '3px 8px', fontSize: '11px', color: 'var(--danger)' }}
                                  title="Reject Document"
                                  onClick={() => handleUpdateStatus(doc._id, 'REJECTED')}
                                >
                                  <XCircle size={13} /> Reject
                                </button>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Add Document Metadata Modal View */}
          {showAddDoc && (
            <div style={{
              background: 'rgba(15, 23, 42, 0.9)',
              padding: '20px',
              borderRadius: '12px',
              border: '1px solid var(--primary)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
                <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#FFFFFF' }}>Register New Document Metadata</h4>
                <button onClick={() => setShowAddDoc(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleCreateDocument} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Document Type</label>
                  <select
                    className="form-select"
                    value={newDocType}
                    onChange={(e) => setNewDocType(e.target.value)}
                  >
                    <option value="INSURANCE">Insurance</option>
                    <option value="SAFETY_CERTIFICATE">Safety Certificate (OSHA)</option>
                    <option value="TRADE_LICENSE">Trade License</option>
                    <option value="TAX_REGISTRATION">Tax Registration</option>
                    <option value="AGREEMENT">Agreement</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Document Number</label>
                  <input
                    className="form-input"
                    placeholder="e.g. POL-GL-8921"
                    value={newDocNumber}
                    onChange={(e) => setNewDocNumber(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Initial Verification Status</label>
                  <select
                    className="form-select"
                    value={newInitialStatus}
                    onChange={(e) => setNewInitialStatus(e.target.value)}
                  >
                    <option value="VALID">VALID (Pre-verified)</option>
                    <option value="PENDING_VERIFICATION">PENDING_VERIFICATION (Needs Auditor Review)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Issued Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={newIssuedAt}
                    onChange={(e) => setNewIssuedAt(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Expiration Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={newExpiresAt}
                    onChange={(e) => setNewExpiresAt(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>File Reference (Simulated S3 Key)</label>
                  <input
                    className="form-input"
                    placeholder="e.g. general-liability-2026.pdf"
                    value={newFileName}
                    onChange={(e) => setNewFileName(e.target.value)}
                    required
                  />
                </div>

                <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowAddDoc(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Save Metadata & Audit
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
