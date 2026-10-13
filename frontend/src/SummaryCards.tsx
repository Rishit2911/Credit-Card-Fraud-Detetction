import React from 'react';
import { CreditCard, AlertTriangle, TrendingUp, ShieldCheck, ArrowUpRight } from 'lucide-react';
import type { DashboardStats } from './types';

interface SummaryCardsProps {
  stats: DashboardStats | null;
  loading: boolean;
  currentFilter?: string;
  onSelectFilter?: (filter: string) => void;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  stats,
  loading,
  currentFilter = 'all',
  onSelectFilter,
}) => {
  return (
    <div className="stats-grid" id="dashboard-summary-cards">
      {/* Total Transactions Card */}
      <div
        className={`stat-card clickable ${currentFilter === 'all' ? 'active-filter' : ''}`}
        onClick={() => onSelectFilter?.('all')}
        title="Filter table: Show all transactions"
      >
        <div className="stat-info">
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span className="stat-label">Total Transactions</span>
            <span className="stat-trend trend-neutral">
              All <ArrowUpRight size={11} />
            </span>
          </div>
          <span className="stat-value">
            {loading ? '—' : stats?.total_transactions.toLocaleString() ?? '0'}
          </span>
          <span className="stat-subtext">
            Total volume: ${stats ? stats.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
          </span>
        </div>
        <div className="stat-icon-box icon-blue">
          <CreditCard size={20} />
        </div>
      </div>

      {/* Flagged Fraud Card */}
      <div
        className={`stat-card clickable ${currentFilter === 'fraud' ? 'active-filter' : ''}`}
        onClick={() => onSelectFilter?.('fraud')}
        title="Filter table: Show suspicious flagged transactions"
      >
        <div className="stat-info">
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span className="stat-label">Flagged Suspicious</span>
            <span className="stat-trend trend-down">
              Flagged <ArrowUpRight size={11} />
            </span>
          </div>
          <span className="stat-value" style={{ color: 'var(--rose-main)' }}>
            {loading ? '—' : stats?.flagged_transactions.toLocaleString() ?? '0'}
          </span>
          <span className="stat-subtext">
            Flagged volume: ${stats ? stats.flagged_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
          </span>
        </div>
        <div className="stat-icon-box icon-red">
          <AlertTriangle size={20} />
        </div>
      </div>

      {/* Fraud Rate Card */}
      <div className="stat-card">
        <div className="stat-info">
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span className="stat-label">Risk Incident Rate</span>
            <span className="stat-trend trend-neutral">Target &lt;2.5%</span>
          </div>
          <span className="stat-value" style={{ color: stats && stats.fraud_rate > 20 ? 'var(--rose-main)' : stats && stats.fraud_rate > 10 ? 'var(--amber-main)' : 'var(--emerald-main)' }}>
            {loading ? '—' : `${stats?.fraud_rate ?? 0}%`}
          </span>
          <span className="stat-subtext">
            Avg risk index: {stats ? `${stats.avg_fraud_probability}%` : '0%'}
          </span>
        </div>
        <div className="stat-icon-box icon-amber">
          <TrendingUp size={20} />
        </div>
      </div>

      {/* Verified Legitimate Card */}
      <div
        className={`stat-card clickable ${currentFilter === 'legit' ? 'active-filter' : ''}`}
        onClick={() => onSelectFilter?.('legit')}
        title="Filter table: Show approved transactions"
      >
        <div className="stat-info">
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span className="stat-label">Approved & Cleared</span>
            <span className="stat-trend trend-up">
              Cleared <ArrowUpRight size={11} />
            </span>
          </div>
          <span className="stat-value" style={{ color: 'var(--emerald-main)' }}>
            {loading ? '—' : stats?.legitimate_transactions.toLocaleString() ?? '0'}
          </span>
          <span className="stat-subtext">
            Settled securely in ledger
          </span>
        </div>
        <div className="stat-icon-box icon-emerald">
          <ShieldCheck size={20} />
        </div>
      </div>
    </div>
  );
};
