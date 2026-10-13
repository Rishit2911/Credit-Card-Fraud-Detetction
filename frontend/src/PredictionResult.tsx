import React, { useState } from 'react';
import { AlertOctagon, CheckCircle2, Database, Shield, Activity, Copy, Check, Info } from 'lucide-react';
import type { Transaction } from './types';

interface PredictionResultProps {
  result: Transaction | null;
  loading: boolean;
}

export const PredictionResult: React.FC<PredictionResultProps> = ({ result, loading }) => {
  const [copied, setCopied] = useState<boolean>(false);

  const copyTxnId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="glass-panel" id="prediction-result-panel" style={{ minHeight: '380px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
          <div className="pulse-dot" style={{ width: '12px', height: '12px', backgroundColor: 'var(--accent-primary)' }}></div>
          <p style={{ color: '#0f172a', fontWeight: 600, fontSize: '0.95rem' }}>Screening Transaction Risk...</p>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Evaluating velocity, merchant category, and authorization signals</span>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="glass-panel" id="prediction-result-panel" style={{ minHeight: '380px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', maxWidth: '320px' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
            <Activity size={24} />
          </div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>Awaiting Assessment</h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            Submit a transaction on the left or select a test scenario to generate a real-time risk evaluation.
          </p>
        </div>
      </div>
    );
  }

  const isFraud = result.is_fraud;
  const prob = result.fraud_probability;

  // Determine recommended banking action
  let recommendation = {
    title: 'Auto-Approve',
    desc: 'Transaction meets legitimate criteria. Settled without step-up.',
    color: 'var(--emerald-text)',
    bg: 'var(--emerald-bg)',
    border: 'var(--emerald-border)',
  };
  if (prob >= 70) {
    recommendation = {
      title: 'Decline & Alert Cardholder',
      desc: 'Critical risk detected. Block authorization and notify customer.',
      color: 'var(--rose-text)',
      bg: 'var(--rose-bg)',
      border: 'var(--rose-border)',
    };
  } else if (prob >= 35) {
    recommendation = {
      title: 'Step-Up Verification (3DS / OTP)',
      desc: 'Elevated risk parameters. Prompt secondary authentication.',
      color: 'var(--amber-text)',
      bg: 'var(--amber-bg)',
      border: 'var(--amber-border)',
    };
  }

  return (
    <div className={`glass-panel verdict-card ${isFraud ? 'fraud' : 'legit'}`} id="prediction-result-panel">
      <div className="verdict-header">
        <div className="panel-title-group">
          <h2>Risk Assessment</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
            <span className="brand-badge" style={{ fontFamily: 'var(--font-mono)' }}>
              Ref: {result.transaction_id}
            </span>
            <button
              type="button"
              onClick={() => copyTxnId(result.transaction_id)}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center' }}
              title="Copy Reference ID"
            >
              {copied ? <Check size={12} color="var(--emerald-main)" /> : <Copy size={12} />}
            </button>
          </div>
        </div>

        <div className={`verdict-badge ${isFraud ? 'badge-fraud' : 'badge-legit'}`}>
          {isFraud ? <AlertOctagon size={18} /> : <CheckCircle2 size={18} />}
          {isFraud ? 'High Risk — Flagged' : 'Low Risk — Approved'}
        </div>
      </div>

      {/* Probability Gauge / Progress bar */}
      <div className="risk-meter">
        <div className="meter-header">
          <span style={{ color: 'var(--text-secondary)' }}>Calculated Risk Score</span>
          <span style={{ color: isFraud ? 'var(--rose-text)' : 'var(--emerald-text)', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
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

      {/* Action Recommendation Banner */}
      <div style={{
        padding: '12px 14px',
        borderRadius: '8px',
        background: recommendation.bg,
        border: `1px solid ${recommendation.border}`,
        color: recommendation.color,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '0.85rem' }}>
          <Info size={15} />
          <span>Recommended Action: {recommendation.title}</span>
        </div>
        <p style={{ fontSize: '0.78rem', marginTop: '3px', opacity: 0.9 }}>
          {recommendation.desc}
        </p>
      </div>

      {/* Risk Factors Checklist */}
      <div className="risk-breakdown-list">
        <div className="breakdown-item">
          <span className="breakdown-label">Transaction Volume</span>
          <span className="breakdown-badge" style={{
            background: result.amount > 1500 ? 'var(--rose-bg)' : 'var(--emerald-bg)',
            color: result.amount > 1500 ? 'var(--rose-text)' : 'var(--emerald-text)',
          }}>
            {result.amount > 1500 ? 'High Outlier' : 'Standard Range'}
          </span>
        </div>
        <div className="breakdown-item">
          <span className="breakdown-label">Terminal Location</span>
          <span className="breakdown-badge" style={{
            background: result.location.includes('CH') || result.location.includes('NG') ? 'var(--amber-bg)' : 'var(--emerald-bg)',
            color: result.location.includes('CH') || result.location.includes('NG') ? 'var(--amber-text)' : 'var(--emerald-text)',
          }}>
            {result.location.includes('CH') || result.location.includes('NG') ? 'Cross-Border' : 'Domestic'}
          </span>
        </div>
        <div className="breakdown-item">
          <span className="breakdown-label">Behavioral Anomaly Index</span>
          <span className="breakdown-badge" style={{
            background: isFraud ? 'var(--rose-bg)' : 'var(--emerald-bg)',
            color: isFraud ? 'var(--rose-text)' : 'var(--emerald-text)',
          }}>
            {result.risk_level} Risk Level
          </span>
        </div>
      </div>

      {/* Summary Key-Values */}
      <div className="key-value-list">
        <div className="kv-item">
          <div className="kv-label">Amount Evaluated</div>
          <div className="kv-value">${result.amount.toFixed(2)}</div>
        </div>
        <div className="kv-item">
          <div className="kv-label">Risk Category</div>
          <div className="kv-value" style={{ color: isFraud ? 'var(--rose-text)' : 'var(--emerald-text)' }}>
            {result.risk_level} RISK
          </div>
        </div>
        <div className="kv-item">
          <div className="kv-label">Merchant</div>
          <div className="kv-value">{result.merchant}</div>
        </div>
        <div className="kv-item">
          <div className="kv-label">Terminal / Card</div>
          <div className="kv-value">{result.location} •• {result.card_last_four}</div>
        </div>
      </div>

      {/* Advisory Note */}
      <div style={{
        background: isFraud ? 'var(--rose-bg)' : 'var(--emerald-bg)',
        border: `1px solid ${isFraud ? 'var(--rose-border)' : 'var(--emerald-border)'}`,
        padding: '11px 13px',
        borderRadius: '8px',
        fontSize: '0.81rem',
        color: isFraud ? 'var(--rose-text)' : 'var(--emerald-text)',
        display: 'flex',
        alignItems: 'center',
        gap: '9px'
      }}>
        <Shield size={16} style={{ flexShrink: 0 }} />
        <span>{result.notes || (isFraud ? 'High risk indicators detected. Verification recommended.' : 'Standard transaction pattern. Authorized.')}</span>
      </div>

      {/* Database Persistence Tag */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '0.78rem',
        color: 'var(--text-muted)',
      }}>
        <Database size={13} style={{ color: 'var(--text-muted)' }} />
        <span>Audit Record ID #{result.id} &bull; Recorded at {new Date(result.timestamp).toLocaleTimeString()}</span>
      </div>
    </div>
  );
};
