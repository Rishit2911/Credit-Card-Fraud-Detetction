import React from 'react';
import { AlertOctagon, CheckCircle2, Database, Shield, Activity } from 'lucide-react';
import type { Transaction } from './types';

interface PredictionResultProps {
  result: Transaction | null;
  loading: boolean;
}

export const PredictionResult: React.FC<PredictionResultProps> = ({ result, loading }) => {
  if (loading) {
    return (
      <div className="glass-panel" id="prediction-result-panel" style={{ minHeight: '380px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div className="pulse-dot" style={{ width: '20px', height: '20px' }}></div>
          <p style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>Executing ML Classification & PostgreSQL Insertion...</p>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-subtle)' }}>Running 30-feature scaling and logistic inference</span>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="glass-panel" id="prediction-result-panel" style={{ minHeight: '380px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', maxWidth: '300px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(56, 189, 248, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-cyan)' }}>
            <Activity size={28} />
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Awaiting Transaction</h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Submit the form on the left or click a demo preset to generate a real-time ML risk verdict.
          </p>
        </div>
      </div>
    );
  }

  const isFraud = result.is_fraud;
  const prob = result.fraud_probability;

  return (
    <div className={`glass-panel verdict-card ${isFraud ? 'fraud' : 'legit'}`} id="prediction-result-panel">
      <div className="verdict-header">
        <div className="panel-title-group">
          <h2>Risk Verdict</h2>
          <span className="brand-badge" style={{ marginTop: '2px' }}>
            ID: {result.transaction_id}
          </span>
        </div>

        <div className={`verdict-badge ${isFraud ? 'badge-fraud' : 'badge-legit'}`}>
          {isFraud ? <AlertOctagon size={20} /> : <CheckCircle2 size={20} />}
          {isFraud ? 'FRAUD FLAGGED' : 'LEGITIMATE'}
        </div>
      </div>

      {/* Probability Gauge / Progress bar */}
      <div className="risk-meter">
        <div className="meter-header">
          <span style={{ color: 'var(--text-muted)' }}>Calculated Risk Score</span>
          <span style={{ color: isFraud ? 'var(--accent-ruby)' : 'var(--accent-emerald)', fontWeight: 800 }}>
            {prob}%
          </span>
        </div>
        <div className="progress-track">
          <div
            className={`progress-fill ${isFraud ? 'fraud' : 'legit'}`}
            style={{ width: `${Math.max(prob, 5)}%` }}
          ></div>
        </div>
      </div>

      {/* Summary grid */}
      <div className="key-value-list" style={{ margin: '8px 0' }}>
        <div className="kv-item">
          <div className="kv-label">Analyzed Amount</div>
          <div className="kv-value">${result.amount.toFixed(2)}</div>
        </div>
        <div className="kv-item">
          <div className="kv-label">Risk Category</div>
          <div className="kv-value" style={{ color: isFraud ? 'var(--accent-ruby)' : 'var(--accent-emerald)' }}>
            {result.risk_level} RISK
          </div>
        </div>
        <div className="kv-item">
          <div className="kv-label">Merchant Terminal</div>
          <div className="kv-value">{result.merchant}</div>
        </div>
        <div className="kv-item">
          <div className="kv-label">Location / Card</div>
          <div className="kv-value">{result.location} •• {result.card_last_four}</div>
        </div>
      </div>

      {/* Advisory Note */}
      <div style={{
        background: isFraud ? 'rgba(244, 63, 94, 0.08)' : 'rgba(16, 185, 129, 0.08)',
        border: `1px solid ${isFraud ? 'rgba(244, 63, 94, 0.25)' : 'rgba(16, 185, 129, 0.25)'}`,
        padding: '12px 16px',
        borderRadius: '8px',
        fontSize: '0.82rem',
        color: isFraud ? '#fca5a5' : '#a7f3d0',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        <Shield size={18} style={{ flexShrink: 0 }} />
        <span>{result.notes || (isFraud ? 'Critical anomaly detected in feature vector.' : 'Transaction matched safe spending pattern.')}</span>
      </div>

      {/* Database Persistence Tag */}
      <div className="audit-tag">
        <Database size={14} style={{ color: 'var(--accent-cyan)' }} />
        <span>Stored in PostgreSQL Database (ID: #{result.id}) at {new Date(result.timestamp).toLocaleTimeString()}</span>
      </div>
    </div>
  );
};
