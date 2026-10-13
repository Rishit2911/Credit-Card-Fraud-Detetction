import React from 'react';
import { Search, Trash2, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Transaction } from './types';

interface TransactionHistoryTableProps {
  transactions: Transaction[];
  total: number;
  page: number;
  limit: number;
  loading: boolean;
  onPageChange: (newPage: number) => void;
  search: string;
  onSearchChange: (newSearch: string) => void;
  statusFilter: string;
  onStatusFilterChange: (newStatus: string) => void;
  sortBy: string;
  onSortByChange: (newSort: string) => void;
  onViewDetails: (txn: Transaction) => void;
  onDeleteTxn: (id: number) => Promise<void>;
}

export const TransactionHistoryTable: React.FC<TransactionHistoryTableProps> = ({
  transactions,
  total,
  page,
  limit,
  loading,
  onPageChange,
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  sortBy,
  onSortByChange,
  onViewDetails,
  onDeleteTxn,
}) => {
  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="glass-panel table-panel" id="transaction-history-section">
      <div className="panel-header">
        <div className="panel-title-group">
          <h2>Transaction History & SQL Audit Log</h2>
          <p>Historical transactions saved in PostgreSQL database with real-time search, filtering, and sorting</p>
        </div>
        <div className="brand-badge" style={{ fontSize: '0.82rem' }}>
          Total Stored: {total} records
        </div>
      </div>

      {/* Controls Bar: Search & Filter */}
      <div className="table-controls">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            className="search-input"
            id="table-search-input"
            placeholder="Search by ID, merchant, location, card, category..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <div className="filters-group">
          {/* Status Filter */}
          <select
            className="filter-select"
            id="status-filter-select"
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
          >
            <option value="all">Status: All</option>
            <option value="legit">Legitimate Only</option>
            <option value="fraud">Fraudulent Only</option>
          </select>

          {/* Sort By */}
          <select
            className="filter-select"
            id="sort-filter-select"
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value)}
          >
            <option value="timestamp">Sort: Newest First</option>
            <option value="amount">Sort: Amount ($)</option>
            <option value="fraud_probability">Sort: Risk Score</option>
          </select>
        </div>
      </div>

      {/* Responsive Table */}
      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>Transaction ID</th>
              <th>Date & Time</th>
              <th>Merchant & Category</th>
              <th>Card / Location</th>
              <th>Amount</th>
              <th>ML Status</th>
              <th>Risk Score</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '36px' }}>
                  <span style={{ color: 'var(--accent-cyan)' }}>Loading transactions from PostgreSQL...</span>
                </td>
              </tr>
            ) : transactions.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-subtle)' }}>
                  No matching transactions found. Try adjusting your search query or filters.
                </td>
              </tr>
            ) : (
              transactions.map((txn) => {
                const isFraud = txn.is_fraud;
                return (
                  <tr key={txn.id}>
                    <td>
                      <span className="txn-code">{txn.transaction_id}</span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {txn.timestamp ? new Date(txn.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'N/A'}
                      </span>
                    </td>
                    <td>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{txn.merchant}</div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-subtle)' }}>{txn.category}</div>
                      </div>
                    </td>
                    <td>
                      <div>
                        <div style={{ fontSize: '0.8rem' }}>•• {txn.card_last_four}</div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-subtle)' }}>{txn.location}</div>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                        ${txn.amount.toFixed(2)}
                      </span>
                    </td>
                    <td>
                      <span className={`badge-status ${isFraud ? 'fraud' : 'legit'}`}>
                        {isFraud ? '🚨 Suspicious' : '✓ Safe'}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: isFraud ? 'var(--accent-ruby)' : 'var(--accent-emerald)' }}>
                        {txn.fraud_probability}%
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          type="button"
                          className="page-btn"
                          style={{ padding: '5px 8px' }}
                          title="View Details"
                          onClick={() => onViewDetails(txn)}
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          type="button"
                          className="page-btn"
                          style={{ padding: '5px 8px', color: 'var(--accent-ruby)' }}
                          title="Delete from PostgreSQL"
                          onClick={() => onDeleteTxn(txn.id)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="pagination-bar">
        <span style={{ fontSize: '0.82rem', color: 'var(--text-subtle)' }}>
          Showing Page {page} of {totalPages} ({total} total records)
        </span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            className="page-btn"
            id="btn-prev-page"
            disabled={page <= 1 || loading}
            onClick={() => onPageChange(page - 1)}
          >
            <ChevronLeft size={16} style={{ display: 'inline', verticalAlign: 'middle' }} /> Previous
          </button>
          <button
            type="button"
            className="page-btn"
            id="btn-next-page"
            disabled={page >= totalPages || loading}
            onClick={() => onPageChange(page + 1)}
          >
            Next <ChevronRight size={16} style={{ display: 'inline', verticalAlign: 'middle' }} />
          </button>
        </div>
      </div>
    </div>
  );
};
