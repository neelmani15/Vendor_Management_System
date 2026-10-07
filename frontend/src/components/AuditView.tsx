import React, { useState, useEffect } from 'react';
import { AuditLog } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Lock } from 'lucide-react';

export const AuditView: React.FC = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    if (!isAdmin) return;
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const res = await api.getAuditLogs({ limit: 50 });
        setLogs(res.items || []);
      } catch (err) {
        console.error('Failed to load audit logs', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div style={{ padding: '60px', textAlign: 'center' }}>
        <div className="glass-panel" style={{ maxWidth: '500px', margin: '0 auto', padding: '40px' }}>
          <Lock size={40} color="var(--warning)" style={{ marginBottom: '16px' }} />
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#FFFFFF', marginBottom: '8px' }}>
            Restricted Audit Trail Access
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.5 }}>
            Access to immutable audit logs is restricted to <strong>ADMIN</strong> roles. Use the role switcher in the top navigation to switch to Eleanor Vance (Admin).
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#FFFFFF', marginBottom: '6px' }}>
          System Audit Trail & Compliance Log
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          Chronological immutable record of operational mutations (vendors, compliance verifications, recommendation runs, AI generation).
        </p>
      </div>

      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>TIMESTAMP</th>
              <th>ACTION</th>
              <th>ACTOR</th>
              <th>ENTITY TYPE</th>
              <th>DETAILS / METADATA</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  Loading audit logs...
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  No audit logs recorded yet.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log._id}>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '13px', whiteSpace: 'nowrap' }}>
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td>
                    <span className="badge badge-purple" style={{ fontSize: '11px' }}>
                      {log.action}
                    </span>
                  </td>
                  <td style={{ color: '#FFFFFF', fontWeight: 500 }}>
                    {log.actorEmail || 'System Process'}
                  </td>
                  <td>
                    <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{log.entityType}</span>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '12px', fontFamily: 'monospace' }}>
                    {JSON.stringify(log.metadata || {})}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
