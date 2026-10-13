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
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Transaction Audit Record</h2>
            <span className="brand-badge">{transaction.transaction_id}</span>
          </div>
          <button className="close-btn" onClick={onClose} title="Close modal">
            <X size={20} />
          </button>
        </div>

        <div className="key-value-list">
          <div className="kv-item">
            <div className="kv-label"><DollarSign size={12} style={{ display: 'inline' }} /> Amount</div>
            <div className="kv-value">${transaction.amount.toFixed(2)}</div>
          </div>
          <div className="kv-item">
            <div className="kv-label"><Clock size={12} style={{ display: 'inline' }} /> Timestamp</div>
            <div className="kv-value" style={{ fontSize: '0.8rem' }}>
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
            <div className="kv-label">Verdict</div>
            <div className="kv-value" style={{ color: transaction.is_fraud ? 'var(--accent-ruby)' : 'var(--accent-emerald)' }}>
              {transaction.prediction}
            </div>
          </div>
          <div className="kv-item">
            <div className="kv-label">Risk Probability</div>
            <div className="kv-value">{transaction.fraud_probability}% ({transaction.risk_level})</div>
          </div>
        </div>

        <div style={{ background: 'var(--bg-input)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-subtle)', marginBottom: '20px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', textTransform: 'uppercase', marginBottom: '6px' }}>Audit Log & Reason</div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{transaction.notes || 'No extra notes recorded.'}</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--text-subtle)' }}>
            <Database size={14} color="var(--accent-cyan)" />
            <span>PostgreSQL Primary Key: ID #{transaction.id}</span>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              className="page-btn"
              style={{ color: 'var(--accent-ruby)', borderColor: 'rgba(244, 63, 94, 0.4)' }}
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
