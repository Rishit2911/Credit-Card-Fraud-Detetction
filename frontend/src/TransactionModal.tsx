import React from 'react';
import { X, Database, Clock, DollarSign, MapPin, Tag } from 'lucide-react';
import type { Transaction } from './types';

interface TransactionModalProps {
  transaction: Transaction | null;
  onClose: () => void;
  onDelete: (id: number) => Promise<void>;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  transaction,
  onClose,
  onDelete,
}) => {
  if (!transaction) return null;

  return (
    <div className="modal-overlay" onClick={onClose} id="transaction-detail-modal">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>Transaction Details</h2>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              Ref: {transaction.transaction_id}
            </span>
          </div>
          <button className="close-btn" onClick={onClose} title="Close modal">
            <X size={18} />
          </button>
        </div>

        <div className="key-value-list" style={{ marginBottom: '18px' }}>
          <div className="kv-item">
            <div className="kv-label"><DollarSign size={12} style={{ display: 'inline' }} /> Amount</div>
            <div className="kv-value">${transaction.amount.toFixed(2)}</div>
          </div>
          <div className="kv-item">
            <div className="kv-label"><Clock size={12} style={{ display: 'inline' }} /> Date & Time</div>
            <div className="kv-value" style={{ fontSize: '0.82rem' }}>
              {new Date(transaction.timestamp).toLocaleString()}
            </div>
          </div>
          <div className="kv-item">
            <div className="kv-label"><MapPin size={12} style={{ display: 'inline' }} /> Merchant & Location</div>
            <div className="kv-value">{transaction.merchant} ({transaction.location})</div>
          </div>
          <div className="kv-item">
            <div className="kv-label"><Tag size={12} style={{ display: 'inline' }} /> Category & Card</div>
            <div className="kv-value">{transaction.category} •• {transaction.card_last_four}</div>
          </div>
          <div className="kv-item">
            <div className="kv-label">Assessment Status</div>
            <div className="kv-value" style={{ color: transaction.is_fraud ? 'var(--rose-text)' : 'var(--emerald-text)' }}>
              {transaction.prediction}
            </div>
          </div>
          <div className="kv-item">
            <div className="kv-label">Risk Probability</div>
            <div className="kv-value">{transaction.fraud_probability}% ({transaction.risk_level})</div>
          </div>
        </div>

        <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-subtle)', marginBottom: '20px' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>
            Audit Log & Assessment Notes
          </div>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>{transaction.notes || 'No extra notes recorded.'}</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
            <Database size={13} color="#64748b" />
            <span>Database Record ID #{transaction.id}</span>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              className="page-btn"
              style={{ color: 'var(--rose-main)', borderColor: 'var(--rose-border)', background: 'var(--rose-bg)' }}
              onClick={() => onDelete(transaction.id)}
            >
              Delete Record
            </button>
            <button type="button" className="page-btn" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
