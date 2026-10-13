import React, { useState } from 'react';
import { Send, RotateCcw, Wifi } from 'lucide-react';
import type { TransactionFormData } from './types';

interface TransactionFormProps {
  onSubmit: (data: TransactionFormData) => Promise<void>;
  loading: boolean;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({ onSubmit, loading }) => {
  const initialData: TransactionFormData = {
    amount: '149.50',
    merchant: 'Amazon Retail',
    card_last_four: '4242',
    location: 'Mumbai, IN',
    category: 'E-Commerce',
    is_foreign: false,
    distance_km: 12,
    pin_used: true,
  };

  const [formData, setFormData] = useState<TransactionFormData>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    const amt = parseFloat(formData.amount);
    if (!formData.amount || isNaN(amt) || amt <= 0) {
      errs.amount = 'Amount must be greater than 0';
    }
    if (!formData.merchant.trim()) {
      errs.merchant = 'Merchant name is required';
    }
    if (!/^\d{4}$/.test(formData.card_last_four)) {
      errs.card_last_four = 'Must be exactly 4 digits';
    }
    if (!formData.location.trim()) {
      errs.location = 'Location is required';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  const handleReset = () => {
    setFormData(initialData);
    setErrors({});
  };

  const setQuickAmount = (val: string) => {
    setFormData({ ...formData, amount: val });
    if (errors.amount) {
      setErrors({ ...errors, amount: '' });
    }
  };

  const applyPreset = (preset: 'normal' | 'luxury' | 'crypto') => {
    if (preset === 'normal') {
      setFormData({
        amount: '15.20',
        merchant: 'Starbucks Coffee',
        card_last_four: '4242',
        location: 'Bengaluru, IN',
        category: 'Dining',
        is_foreign: false,
        distance_km: 5,
        pin_used: true,
      });
    } else if (preset === 'luxury') {
      setFormData({
        amount: '1450.00',
        merchant: 'Swiss Watchmaker Geneva',
        card_last_four: '9128',
        location: 'Zurich, CH',
        category: 'Luxury Goods',
        is_foreign: true,
        distance_km: 6800,
        pin_used: false,
      });
    } else if (preset === 'crypto') {
      setFormData({
        amount: '3890.00',
        merchant: 'Crypto P2P OTC Exchange',
        card_last_four: '6011',
        location: 'Lagos, NG',
        category: 'Cryptocurrency',
        is_foreign: true,
        distance_km: 7400,
        pin_used: false,
      });
    }
    setErrors({});
  };

  const formattedAmount = isNaN(parseFloat(formData.amount))
    ? '0.00'
    : parseFloat(formData.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="glass-panel" id="transaction-input-panel">
      <div className="panel-header">
        <div className="panel-title-group">
          <h2>Evaluate Transaction</h2>
          <p>Assess transaction variables against behavioral risk models and log to the audit ledger</p>
        </div>
      </div>

      {/* Interactive Virtual Debit/Credit Card HUD */}
      <div className="credit-card-preview" aria-label="Interactive Virtual Payment Card">
        <div className="card-top-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="emv-chip" title="EMV Smart Chip"></div>
            <Wifi size={16} color="#94a3b8" style={{ transform: 'rotate(90deg)' }} />
          </div>
          <span className="card-badge">{formData.category || 'RETAIL'}</span>
        </div>

        <div className="card-number-display">
          •••• &nbsp; •••• &nbsp; •••• &nbsp; {formData.card_last_four || '4242'}
        </div>

        <div className="card-bottom-row">
          <div>
            <div className="card-meta-label">Merchant Terminal</div>
            <div className="card-meta-val">{formData.merchant || 'Merchant Terminal'}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="card-meta-label">Pending Total</div>
            <div className="card-meta-val" style={{ fontSize: '0.95rem', fontVariantNumeric: 'tabular-nums' }}>
              ${formattedAmount}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Test Scenarios Bar */}
      <div className="preset-bar">
        <span className="preset-title">Test Scenarios:</span>
        <button
          type="button"
          className="preset-btn"
          onClick={() => applyPreset('normal')}
        >
          Coffee Shop ($15.20 - Domestic)
        </button>
        <button
          type="button"
          className="preset-btn"
          onClick={() => applyPreset('luxury')}
        >
          Luxury Goods ($1,450.00 - Foreign)
        </button>
        <button
          type="button"
          className="preset-btn"
          onClick={() => applyPreset('crypto')}
        >
          Overseas Transfer ($3,890.00 - High Risk)
        </button>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-grid">
          {/* Amount Field */}
          <div className="form-group">
            <label className="form-label" htmlFor="amount-input">
              Transaction Amount ($) *
            </label>
            <input
              id="amount-input"
              type="number"
              step="0.01"
              min="0.01"
              className={`form-input ${errors.amount ? 'error' : ''}`}
              placeholder="e.g. 149.50"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            />
            {/* Quick Amount Chips */}
            <div className="amount-presets">
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Quick:</span>
              <button type="button" className="amount-chip" onClick={() => setQuickAmount('25.00')}>$25</button>
              <button type="button" className="amount-chip" onClick={() => setQuickAmount('150.00')}>$150</button>
              <button type="button" className="amount-chip" onClick={() => setQuickAmount('1200.00')}>$1,200</button>
              <button type="button" className="amount-chip" onClick={() => setQuickAmount('3500.00')}>$3,500</button>
            </div>
            {errors.amount && <span className="input-error-msg">{errors.amount}</span>}
          </div>

          {/* Card Last 4 Digits */}
          <div className="form-group">
            <label className="form-label" htmlFor="card-digits-input">
              Card Last 4 Digits *
            </label>
            <input
              id="card-digits-input"
              type="text"
              maxLength={4}
              className={`form-input ${errors.card_last_four ? 'error' : ''}`}
              placeholder="e.g. 4242"
              value={formData.card_last_four}
              onChange={(e) => setFormData({ ...formData, card_last_four: e.target.value.replace(/\D/g, '') })}
            />
            {errors.card_last_four && <span className="input-error-msg">{errors.card_last_four}</span>}
          </div>

          {/* Merchant Name */}
          <div className="form-group">
            <label className="form-label" htmlFor="merchant-input">
              Merchant Name *
            </label>
            <input
              id="merchant-input"
              type="text"
              className={`form-input ${errors.merchant ? 'error' : ''}`}
              placeholder="e.g. Amazon Retail"
              value={formData.merchant}
              onChange={(e) => setFormData({ ...formData, merchant: e.target.value })}
            />
            {errors.merchant && <span className="input-error-msg">{errors.merchant}</span>}
          </div>

          {/* Category Dropdown */}
          <div className="form-group">
            <label className="form-label" htmlFor="category-select">
              Category
            </label>
            <select
              id="category-select"
              className="form-select"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              <option value="E-Commerce">E-Commerce</option>
              <option value="Dining">Dining & Food</option>
              <option value="Travel">Travel & Airlines</option>
              <option value="Luxury Goods">Luxury Goods</option>
              <option value="Electronics">Electronics</option>
              <option value="Cryptocurrency">Cryptocurrency</option>
              <option value="Wire Transfer">Wire Transfer</option>
              <option value="Subscription">Subscription</option>
            </select>
          </div>

          {/* Location Field */}
          <div className="form-group full-width">
            <label className="form-label" htmlFor="location-input">
              Transaction Location / Terminal *
            </label>
            <input
              id="location-input"
              type="text"
              className={`form-input ${errors.location ? 'error' : ''}`}
              placeholder="e.g. Mumbai, IN or Zurich, CH"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
            {errors.location && <span className="input-error-msg">{errors.location}</span>}
          </div>

          {/* Behavioral Signals: Foreign toggle */}
          <div className="form-group">
            <div className="toggle-row">
              <div className="toggle-label-group">
                <span className="toggle-name">Cross-Border / Foreign</span>
                <span className="toggle-desc">Terminal located abroad</span>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={formData.is_foreign}
                  onChange={(e) => setFormData({ ...formData, is_foreign: e.target.checked })}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>

          {/* Behavioral Signals: 3DS / PIN toggle */}
          <div className="form-group">
            <div className="toggle-row">
              <div className="toggle-label-group">
                <span className="toggle-name">3D-Secure / PIN Verified</span>
                <span className="toggle-desc">Strong customer auth</span>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={formData.pin_used}
                  onChange={(e) => setFormData({ ...formData, pin_used: e.target.checked })}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
          <button
            type="submit"
            id="btn-analyze-transaction"
            className="submit-btn"
            disabled={loading}
            style={{ flex: 1 }}
          >
            <Send size={16} />
            {loading ? 'Processing Assessment...' : 'Evaluate & Record Transaction'}
          </button>

          <button
            type="button"
            className="page-btn"
            onClick={handleReset}
            title="Reset form"
            style={{ padding: '0 16px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <RotateCcw size={15} /> Reset
          </button>
        </div>
      </form>
    </div>
  );
};
