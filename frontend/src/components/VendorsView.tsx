import React, { useState, useEffect } from 'react';
import { Vendor } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { VendorDetailModal } from './VendorDetailModal';
import {
  Search,
  Plus,
  Filter,
  Star,
  MapPin,
  Eye,
  Trash2,
  X,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';

export const VendorsView: React.FC = () => {
  const { user } = useAuth();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [complianceFilter, setComplianceFilter] = useState('');
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New vendor form state
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState('COMPANY');
  const [newCategory, setNewCategory] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newState, setNewState] = useState('');
  const [newContactName, setNewContactName] = useState('');
  const [newContactEmail, setNewContactEmail] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newRating, setNewRating] = useState('4.5');
  const [newCapabilities, setNewCapabilities] = useState('');

  const canCreate = user?.role === 'ADMIN' || user?.role === 'PROCUREMENT_MANAGER';
  const canDelete = user?.role === 'ADMIN';

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const res = await api.getVendors({
        search,
        category: categoryFilter,
        status: statusFilter,
        complianceStatus: complianceFilter,
        limit: 50,
      });
      setVendors(res.items || []);
    } catch (err) {
      console.error('Failed to load vendors', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, [search, categoryFilter, statusFilter, complianceFilter]);

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete vendor "${name}"?`)) return;
    try {
      await api.deleteVendor(id);
      await fetchVendors();
    } catch (err: any) {
      alert(`Error deleting vendor: ${err.message}`);
    }
  };

  const handleCreateVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createVendor({
        name: newName,
        vendorType: newType,
        categories: [newCategory],
        description: `Registered contractor for ${newCategory}`,
        contact: {
          primaryContactName: newContactName,
          email: newContactEmail,
          phone: newContactPhone,
        },
        operatingLocations: [
          { country: 'USA', state: newState, city: newCity },
        ],
        rating: parseFloat(newRating),
        capabilities: newCapabilities.split(',').map((c) => c.trim()).filter(Boolean),
        status: 'ACTIVE',
        onboardingStatus: 'VERIFIED',
      });
      setShowCreateModal(false);
      await fetchVendors();
    } catch (err: any) {
      alert(`Error creating vendor: ${err.message}`);
    }
  };

  return (
    <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* View Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#FFFFFF', marginBottom: '6px' }}>
            Enterprise Vendor Directory
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            Browse and filter verified vendor profiles, capabilities, and document compliance records.
          </p>
        </div>

        {canCreate && (
          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
            <Plus size={16} /> Register New Vendor
          </button>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1', minWidth: '220px' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '13px' }} />
          <input
            className="form-input"
            style={{ paddingLeft: '38px' }}
            placeholder="Search vendor name, capability, description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={15} color="var(--text-muted)" />
          <select
            className="form-select"
            style={{ width: '190px' }}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">All Categories</option>
            <option value="Electrical Engineering">Electrical Engineering</option>
            <option value="Civil Engineering">Civil Engineering</option>
            <option value="IT & Cloud Infrastructure">IT & Cloud Infrastructure</option>
            <option value="Facility Management">Facility Management</option>
            <option value="Logistics & Heavy Transport">Logistics & Heavy Transport</option>
          </select>
        </div>

        <select
          className="form-select"
          style={{ width: '150px' }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="INACTIVE">INACTIVE</option>
          <option value="BLACKLISTED">BLACKLISTED</option>
        </select>

        <select
          className="form-select"
          style={{ width: '170px' }}
          value={complianceFilter}
          onChange={(e) => setComplianceFilter(e.target.value)}
        >
          <option value="">All Compliance</option>
          <option value="UNDER_REVIEW">UNDER REVIEW</option>
          <option value="COMPLIANT">COMPLIANT</option>
          <option value="EXPIRING_SOON">EXPIRING SOON</option>
          <option value="NON_COMPLIANT">NON COMPLIANT</option>
        </select>
      </div>

      {/* Vendors Table */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>VENDOR NAME</th>
              <th>PRIMARY CATEGORY</th>
              <th>OPERATING LOCATION</th>
              <th>RATING</th>
              <th>COMPLETED PROJECTS</th>
              <th>COMPLIANCE STATUS</th>
              <th>STATUS</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  Loading vendors...
                </td>
              </tr>
            ) : vendors.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  No vendors found matching criteria.
                </td>
              </tr>
            ) : (
              vendors.map((vendor) => {
                const primaryLoc = vendor.operatingLocations[0];
                const isUnderReview = vendor.complianceStatus === 'UNDER_REVIEW';
                const isNonCompliant = vendor.complianceStatus === 'NON_COMPLIANT';

                return (
                  <tr key={vendor._id}>
                    <td>
                      <div style={{ fontWeight: 600, color: '#FFFFFF', fontSize: '14px' }}>{vendor.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{vendor.vendorType}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {vendor.categories.map((c, idx) => (
                          <span key={idx} className="badge badge-purple" style={{ fontSize: '11px' }}>
                            {c}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                        <MapPin size={13} color="var(--primary)" />
                        <span>{primaryLoc ? `${primaryLoc.city || ''}, ${primaryLoc.state}` : 'Global'}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--warning)', fontWeight: 700 }}>
                        <Star size={14} fill="currentColor" />
                        <span>{vendor.rating.toFixed(1)}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{vendor.completedProjects} projects</td>
                    <td>
                      <span
                        className={`badge ${
                          vendor.complianceStatus === 'COMPLIANT'
                            ? 'badge-success'
                            : vendor.complianceStatus === 'EXPIRING_SOON'
                            ? 'badge-warning'
                            : 'badge-danger'
                        }`}
                        style={{
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          boxShadow: isUnderReview ? '0 0 10px rgba(245, 158, 11, 0.2)' : undefined,
                        }}
                        title="Click to inspect & audit compliance"
                        onClick={() => setSelectedVendor(vendor)}
                      >
                        {vendor.complianceStatus === 'COMPLIANT' ? (
                          <ShieldCheck size={12} />
                        ) : (
                          <ShieldAlert size={12} />
                        )}
                        {vendor.complianceStatus.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${
                        vendor.status === 'ACTIVE'
                          ? 'badge-success'
                          : vendor.status === 'BLACKLISTED'
                          ? 'badge-danger'
                          : 'badge-warning'
                      }`}>
                        {vendor.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <button
                          className="btn btn-secondary"
                          style={{
                            padding: '6px 10px',
                            fontSize: '12px',
                            color: isUnderReview ? '#fbbf24' : isNonCompliant ? '#f87171' : 'var(--text-primary)',
                            borderColor: isUnderReview ? 'rgba(245, 158, 11, 0.4)' : undefined,
                            background: isUnderReview ? 'rgba(245, 158, 11, 0.08)' : undefined,
                          }}
                          title="Open Compliance & Audit Hub"
                          onClick={() => setSelectedVendor(vendor)}
                        >
                          <ShieldCheck size={13} /> Review
                        </button>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '6px 9px', fontSize: '12px' }}
                          title="View Profile & Documents"
                          onClick={() => setSelectedVendor(vendor)}
                        >
                          <Eye size={13} /> Profile
                        </button>
                        {canDelete && (
                          <button
                            className="btn btn-secondary"
                            style={{ padding: '6px 8px', color: 'var(--danger)' }}
                            title="Delete Vendor"
                            onClick={() => handleDelete(vendor._id, vendor.name)}
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Vendor Profile & Document Lifecycle Modal */}
      {selectedVendor && (
        <VendorDetailModal
          vendor={selectedVendor}
          onClose={() => setSelectedVendor(null)}
          onRefresh={fetchVendors}
        />
      )}

      {/* Create Vendor Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#FFFFFF' }}>Register New Vendor</h3>
              <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateVendor} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Vendor Business Name</label>
                <input className="form-input" placeholder="e.g. Apex High Voltage Ltd" value={newName} onChange={(e) => setNewName(e.target.value)} required />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Vendor Type</label>
                  <select className="form-select" value={newType} onChange={(e) => setNewType(e.target.value)}>
                    <option value="COMPANY">Company</option>
                    <option value="CONTRACTOR">Contractor</option>
                    <option value="AGENCY">Agency</option>
                    <option value="SUPPLIER">Supplier</option>
                    <option value="SERVICE_PROVIDER">Service Provider</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Primary Category</label>
                  <input className="form-input" placeholder="e.g. Electrical Engineering" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} required />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Operating City</label>
                  <input className="form-input" placeholder="e.g. Austin" value={newCity} onChange={(e) => setNewCity(e.target.value)} required />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Operating State</label>
                  <input className="form-input" placeholder="e.g. TX" value={newState} onChange={(e) => setNewState(e.target.value)} required />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Contact Name</label>
                  <input className="form-input" placeholder="Contact Person" value={newContactName} onChange={(e) => setNewContactName(e.target.value)} required />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Contact Email</label>
                  <input type="email" className="form-input" placeholder="email@vendor.com" value={newContactEmail} onChange={(e) => setNewContactEmail(e.target.value)} required />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Contact Phone</label>
                  <input className="form-input" placeholder="+1-512-555-0100" value={newContactPhone} onChange={(e) => setNewContactPhone(e.target.value)} required />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Initial Rating (0-5)</label>
                  <input type="number" step="0.1" min="0" max="5" className="form-input" value={newRating} onChange={(e) => setNewRating(e.target.value)} required />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Capabilities (Comma-separated)</label>
                  <input className="form-input" placeholder="High Voltage, Switchgear, Safety" value={newCapabilities} onChange={(e) => setNewCapabilities(e.target.value)} />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Vendor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
