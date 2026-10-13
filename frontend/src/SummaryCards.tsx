import React from 'react';
import { CreditCard, AlertTriangle, TrendingUp, ShieldCheck } from 'lucide-react';
import type { DashboardStats } from './types';

interface SummaryCardsProps {
  stats: DashboardStats | null;
  loading: boolean;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ stats, loading }) => {
  return (
    <div className="stats-grid" id="dashboard-summary-cards">
      {/* Total Transactions Card */}
      <div className="stat-card">
        <div className="stat-info">
          <span className="stat-label">Total Transactions</span>
          <span className="stat-value">
            {loading ? '...' : stats?.total_transactions.toLocaleString() ?? '0'}
          </span>
          <span className="stat-subtext">
            Volume: ${stats ? stats.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '0.00'}
          </span>
        </div>
        <div className="stat-icon-box icon-blue">
          <CreditCard size={24} />
        </div>
      </div>

      {/* Flagged Fraud Card */}
      <div className="stat-card">
        <div className="stat-info">
          <span className="stat-label">Flagged Fraud</span>
          <span className="stat-value" style={{ color: '#f43f5e' }}>
            {loading ? '...' : stats?.flagged_transactions.toLocaleString() ?? '0'}
          </span>
          <span className="stat-subtext">
            Flagged: ${stats ? stats.flagged_amount.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '0.00'}
          </span>
        </div>
        <div className="stat-icon-box icon-red">
          <AlertTriangle size={24} />
        </div>
      </div>

      {/* Fraud Rate Card */}
      <div className="stat-card">
        <div className="stat-info">
          <span className="stat-label">Fraud Rate</span>
          <span className="stat-value" style={{ color: stats && stats.fraud_rate > 20 ? '#f43f5e' : stats && stats.fraud_rate > 10 ? '#f59e0b' : '#10b981' }}>
            {loading ? '...' : `${stats?.fraud_rate ?? 0}%`}
          </span>
          <span className="stat-subtext">
            Avg Risk: {stats ? `${stats.avg_fraud_probability}%` : '0%'}
          </span>
        </div>
        <div className="stat-icon-box icon-amber">
          <TrendingUp size={24} />
        </div>
      </div>

      {/* Verified Legitimate Card */}
      <div className="stat-card">
        <div className="stat-info">
          <span className="stat-label">Verified Safe</span>
          <span className="stat-value" style={{ color: '#10b981' }}>
            {loading ? '...' : stats?.legitimate_transactions.toLocaleString() ?? '0'}
          </span>
          <span className="stat-subtext">
            Stored in PostgreSQL DB
          </span>
        </div>
        <div className="stat-icon-box icon-emerald">
          <ShieldCheck size={24} />
        </div>
      </div>
    </div>
  );
};
