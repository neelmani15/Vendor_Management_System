import React, { useState, useEffect } from 'react';
import { WorkRequirement, RecommendationItem, AISummaryMeta } from '../types';
import { api } from '../services/api';
import {
  Sparkles,
  Award,
  CheckCircle,
  RotateCw,
  Cpu,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Info,
} from 'lucide-react';

interface RecommendationsViewProps {
  initialRequirementId?: string;
}

export const RecommendationsView: React.FC<RecommendationsViewProps> = ({
  initialRequirementId,
}) => {
  const [requirements, setRequirements] = useState<WorkRequirement[]>([]);
  const [selectedReqId, setSelectedReqId] = useState<string>(initialRequirementId || '');
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [aiSummary, setAiSummary] = useState<AISummaryMeta | null>(null);
  const [meta, setMeta] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showTieBreakInfo, setShowTieBreakInfo] = useState(false);

  useEffect(() => {
    const loadReqs = async () => {
      try {
        const res = await api.getWorkRequirements({ limit: 50 });
        const items = res.items || [];
        setRequirements(items);
        if (!selectedReqId && items.length > 0) {
          // Select benchmark Electrical requirement if available
          const preferred = items.find((r: WorkRequirement) => r.category === 'Electrical Engineering') || items[0];
          setSelectedReqId(preferred._id);
        }
      } catch (err) {
        console.error('Failed to load requirements', err);
      }
    };
    loadReqs();
  }, []);

  const runEngine = async (reqId: string) => {
    if (!reqId) return;
    try {
      setLoading(true);
      const res = await api.getRecommendations(reqId, {
        includeBreakdown: true,
        generateSummary: true,
      });
      setRecommendations(res.recommendations || []);
      setMeta(res.meta);
      setAiSummary(res.meta?.aiSummary || null);
    } catch (err: any) {
      alert(`Recommendation Engine Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedReqId) {
      runEngine(selectedReqId);
    }
  }, [selectedReqId]);

  const eligibleVendors = recommendations.filter((r) => r.eligibility === 'ELIGIBLE');
  const disqualifiedVendors = recommendations.filter((r) => r.eligibility === 'DISQUALIFIED');

  return (
    <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Top Header & Requirement Selector */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#FFFFFF' }}>
              Intelligent Recommendation Workbench
            </h1>
            <span className="badge badge-purple" style={{ fontSize: '11px' }}>
              Algorithm v1 • Deterministic
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            Pure mathematical ranking with multi-stage hard filters, explainability breakdowns, and factual AI summary.
          </p>
        </div>

        {/* Work Requirement Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <select
            className="form-select"
            style={{ minWidth: '320px', fontWeight: 600 }}
            value={selectedReqId}
            onChange={(e) => setSelectedReqId(e.target.value)}
          >
            {requirements.map((r) => (
              <option key={r._id} value={r._id}>
                {r.title} ({r.category} • {r.location.city})
              </option>
            ))}
          </select>

          <button
            className="btn btn-primary"
            disabled={loading}
            onClick={() => runEngine(selectedReqId)}
          >
            <RotateCw size={16} className={loading ? 'animate-spin' : ''} />
            <span>Re-evaluate</span>
          </button>
        </div>
      </div>

      {/* Algorithm Weights Banner */}
      <div className="glass-panel" style={{
        padding: '16px 20px',
        background: 'rgba(255, 255, 255, 0.02)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        fontSize: '12px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Cpu size={16} color="var(--primary)" />
          <strong style={{ color: '#FFFFFF' }}>Scoring Formula (v1):</strong>
          <span style={{ color: 'var(--text-secondary)' }}>
            Category (30%) + Location (20%) + Rating (15%) + Capabilities (15%) + Compliance (10%) + Experience (5%) + Availability (5%)
          </span>
        </div>

        <button
          onClick={() => setShowTieBreakInfo(!showTieBreakInfo)}
          style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}
        >
          <Info size={14} />
          <span>Tie-Breaking Rules</span>
          {showTieBreakInfo ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {/* Tie Break Info Collapsible */}
      {showTieBreakInfo && (
        <div className="glass-panel" style={{ padding: '16px 20px', background: 'rgba(15, 23, 42, 0.8)', fontSize: '13px', lineHeight: 1.6 }}>
          <h4 style={{ color: '#FFFFFF', marginBottom: '8px', fontWeight: 700 }}>Deterministic 6-Step Tie-Breaking Hierarchy (Section 29):</h4>
          <ol style={{ paddingLeft: '20px', color: 'var(--text-secondary)' }}>
            <li><strong>Higher Final Score</strong>: Computed weighted sum of 7 criteria.</li>
            <li><strong>Higher Rating</strong>: Star rating out of 5.0.</li>
            <li><strong>Higher Compliance Score</strong>: Verified active compliance documents.</li>
            <li><strong>More Completed Projects</strong>: Enterprise delivery track record.</li>
            <li><strong>Vendor Name Ascending</strong>: Alphabetical tie-break.</li>
            <li><strong>Vendor ID Ascending</strong>: Guaranteed reproducible fallback.</li>
          </ol>
        </div>
      )}

      {/* AI Recommendation Summary Box */}
      {aiSummary && (
        <div className="glass-panel" style={{
          padding: '24px',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(15, 23, 42, 0.9) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.35)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ background: 'var(--primary)', padding: '6px', borderRadius: '8px', color: '#FFFFFF' }}>
                <Sparkles size={18} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF' }}>
                AI Executive Recommendation Summary
              </h3>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className={`badge ${aiSummary.aiProvider === 'openai' ? 'badge-success' : 'badge-purple'}`} style={{ fontSize: '11px' }}>
                {aiSummary.aiProvider === 'openai'
                  ? `Provider: OpenAI (${aiSummary.model})`
                  : 'Provider: Deterministic Fallback Mode (Offline Ready)'}
              </span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Prompt Version: {aiSummary.promptVersion}
              </span>
            </div>
          </div>

          <div style={{
            fontSize: '14px',
            color: 'var(--text-primary)',
            lineHeight: 1.6,
            whiteSpace: 'pre-line',
            background: 'rgba(0, 0, 0, 0.25)',
            padding: '18px',
            borderRadius: '10px',
            border: '1px solid var(--border-color)',
          }}>
            {aiSummary.summary}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '12px', fontSize: '11px', color: 'var(--text-muted)' }}>
            <CheckCircle size={13} color="var(--success)" />
            <span>Architecture Constraint Enforced: AI receives only pre-calculated facts and scores. Generative AI does not determine vendor rankings or calculate scores.</span>
          </div>
        </div>
      )}

      {/* Eligible Ranked Candidates List */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#FFFFFF' }}>
            Ranked Eligible Vendors ({eligibleVendors.length})
          </h2>
          {meta && (
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Evaluated {meta.totalCandidates} candidates • Run ID: {meta.runId?.slice(-8)}
            </span>
          )}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
            Evaluating candidates across 7 weighted dimensions...
          </div>
        ) : eligibleVendors.length === 0 ? (
          <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No eligible vendors matched the mandatory requirements.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {eligibleVendors.map((item) => {
              const isWinner = item.rank === 1;
              const breakdown = item.explanation.scoreBreakdown;

              return (
                <div
                  key={item.vendorId}
                  className="glass-panel"
                  style={{
                    padding: '26px',
                    border: isWinner
                      ? '1px solid rgba(99, 102, 241, 0.5)'
                      : '1px solid var(--border-color)',
                    background: isWinner
                      ? 'linear-gradient(180deg, rgba(99, 102, 241, 0.08) 0%, rgba(18, 24, 38, 0.85) 100%)'
                      : 'var(--bg-card)',
                  }}
                >
                  {/* Card Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      {/* Rank Badge */}
                      <div style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '12px',
                        background: isWinner
                          ? 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)'
                          : 'rgba(255, 255, 255, 0.05)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '18px',
                        color: '#FFFFFF',
                        border: isWinner ? '1px solid #818cf8' : '1px solid var(--border-color)',
                        boxShadow: isWinner ? '0 0 15px rgba(99, 102, 241, 0.4)' : 'none',
                      }}>
                        #{item.rank}
                      </div>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <h3 style={{ fontSize: '19px', fontWeight: 800, color: '#FFFFFF' }}>
                            {item.vendorName}
                          </h3>
                          {isWinner && (
                            <span className="badge badge-success" style={{ fontSize: '11px' }}>
                              <Award size={12} /> TOP RECOMMENDATION
                            </span>
                          )}
                        </div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '3px' }}>
                          {item.explanation.summary}
                        </p>
                      </div>
                    </div>

                    {/* Overall Score Dial */}
                    <div style={{
                      textAlign: 'right',
                      background: 'rgba(0, 0, 0, 0.3)',
                      padding: '10px 18px',
                      borderRadius: '12px',
                      border: '1px solid var(--border-color)',
                    }}>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>COMPOSITE SCORE</div>
                      <div style={{ fontSize: '28px', fontWeight: 800, color: isWinner ? 'var(--primary)' : '#FFFFFF' }}>
                        {item.score.toFixed(2)} <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>/ 100</span>
                      </div>
                    </div>
                  </div>

                  {/* Strengths & Weaknesses */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                    <div style={{ background: 'rgba(16, 185, 129, 0.05)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--success)', marginBottom: '8px' }}>
                        KEY STRENGTHS
                      </div>
                      <ul style={{ paddingLeft: '18px', fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                        {item.explanation.strengths.map((s, i) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    </div>

                    <div style={{ background: 'rgba(245, 158, 11, 0.05)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--warning)', marginBottom: '8px' }}>
                        NOTABLE GAPS / WEAKNESSES
                      </div>
                      {item.explanation.weaknesses.length === 0 ? (
                        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No notable weaknesses detected.</span>
                      ) : (
                        <ul style={{ paddingLeft: '18px', fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                          {item.explanation.weaknesses.map((w, i) => (
                            <li key={i}>{w}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>

                  {/* Interactive Visual Score Breakdown Bars */}
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '12px', letterSpacing: '0.04em' }}>
                      SCORE BREAKDOWN (NORMALIZED 0–100)
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                      {/* Category */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                          <span style={{ color: 'var(--text-muted)' }}>Category (30%)</span>
                          <span style={{ fontWeight: 700, color: '#FFFFFF' }}>{breakdown.category}/100</span>
                        </div>
                        <div style={{ height: '6px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${breakdown.category}%`, height: '100%', background: 'var(--primary)' }} />
                        </div>
                      </div>

                      {/* Location */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                          <span style={{ color: 'var(--text-muted)' }}>Location (20%)</span>
                          <span style={{ fontWeight: 700, color: '#FFFFFF' }}>{breakdown.location}/100</span>
                        </div>
                        <div style={{ height: '6px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${breakdown.location}%`, height: '100%', background: 'var(--info)' }} />
                        </div>
                      </div>

                      {/* Rating */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                          <span style={{ color: 'var(--text-muted)' }}>Rating (15%)</span>
                          <span style={{ fontWeight: 700, color: '#FFFFFF' }}>{breakdown.rating}/100</span>
                        </div>
                        <div style={{ height: '6px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${breakdown.rating}%`, height: '100%', background: 'var(--warning)' }} />
                        </div>
                      </div>

                      {/* Capabilities */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                          <span style={{ color: 'var(--text-muted)' }}>Capabilities (15%)</span>
                          <span style={{ fontWeight: 700, color: '#FFFFFF' }}>{breakdown.capability}/100</span>
                        </div>
                        <div style={{ height: '6px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${breakdown.capability}%`, height: '100%', background: 'var(--primary)' }} />
                        </div>
                      </div>

                      {/* Compliance */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                          <span style={{ color: 'var(--text-muted)' }}>Compliance (10%)</span>
                          <span style={{ fontWeight: 700, color: '#FFFFFF' }}>{breakdown.compliance}/100</span>
                        </div>
                        <div style={{ height: '6px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${breakdown.compliance}%`, height: '100%', background: 'var(--success)' }} />
                        </div>
                      </div>

                      {/* Experience */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                          <span style={{ color: 'var(--text-muted)' }}>Experience (5%)</span>
                          <span style={{ fontWeight: 700, color: '#FFFFFF' }}>{breakdown.experience}/100</span>
                        </div>
                        <div style={{ height: '6px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${breakdown.experience}%`, height: '100%', background: '#94A3B8' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Disqualified Candidates Section */}
      {disqualifiedVendors.length > 0 && (
        <div className="glass-panel" style={{ padding: '24px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <ShieldAlert size={20} color="var(--danger)" />
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#FFFFFF' }}>
              Disqualified Candidates ({disqualifiedVendors.length})
            </h3>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            The following vendors violated mandatory hard criteria (such as expired compliance certifications, minimum rating thresholds, or inactive status) and were excluded from scoring.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {disqualifiedVendors.map((item) => (
              <div
                key={item.vendorId}
                style={{
                  background: 'rgba(239, 68, 68, 0.05)',
                  padding: '14px 18px',
                  borderRadius: '10px',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '10px',
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, color: '#FFFFFF', fontSize: '14px' }}>{item.vendorName}</div>
                  <div style={{ color: 'var(--danger)', fontSize: '12px', marginTop: '3px' }}>
                    Reason: {item.disqualificationReasons?.join('; ') || 'Mandatory criteria unmet'}
                  </div>
                </div>
                <span className="badge badge-danger">DISQUALIFIED (SCORE: 0.00)</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
