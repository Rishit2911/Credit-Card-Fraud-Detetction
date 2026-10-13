import React from 'react';
import { Search, Trash2, Eye, ChevronLeft, ChevronRight, Download } from 'lucide-react';
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

  // Export current list to CSV
  const handleExportCSV = () => {
    if (!transactions || transactions.length === 0) return;

    const headers = [
      'Transaction ID',
      'Date Time',
      'Merchant',
      'Category',
      'Card Last 4',
      'Location',
      'Amount ($)',
      'Prediction',
      'Is Fraud',
      'Risk Score (%)',
      'Risk Level',
      'Notes',
    ];

    const rows = transactions.map((t) => [
      `"${t.transaction_id}"`,
      `"${t.timestamp}"`,
      `"${t.merchant.replace(/"/g, '""')}"`,
      `"${t.category}"`,
      `"${t.card_last_four}"`,
      `"${t.location.replace(/"/g, '""')}"`,
      t.amount.toFixed(2),
      `"${t.prediction}"`,
      t.is_fraud ? 'TRUE' : 'FALSE',
      t.fraud_probability,
      `"${t.risk_level}"`,
      `"${(t.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `cardwatch_audit_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="glass-panel table-panel" id="transaction-history-section">
      <div className="panel-header">
        <div className="panel-title-group">
          <h2>Transaction Audit Ledger</h2>
          <p>Settled and reviewed transaction records with search, filter, and drill-down inspection</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            className="btn-export"
            onClick={handleExportCSV}
            disabled={transactions.length === 0}
            title="Download CSV audit report"
          >
            <Download size={14} /> Export CSV
          </button>
          <div className="status-pill" style={{ fontSize: '0.78rem' }}>
            {total} total records
          </div>
        </div>
      </div>

      {/* Controls Bar: Search & Filter */}
      <div className="table-controls">
        <div className="search-box">
          <Search size={16} />
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
            <option value="legit">Cleared Only</option>
            <option value="fraud">Flagged Only</option>
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
              <th>Reference ID</th>
              <th>Date & Time</th>
              <th>Merchant & Category</th>
              <th>Card / Location</th>
              <th>Amount</th>
              <th>Risk Status</th>
              <th>Risk Score</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '36px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Loading audit records...</span>
                </td>
              </tr>
            ) : transactions.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                  No matching transactions found. Try adjusting your search query or filters.
                </td>
              </tr>
            ) : (
              transactions.map((txn) => {
                const isFraud = txn.is_fraud;
                const isVisa = txn.card_last_four.startsWith('4');

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
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{txn.merchant}</div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{txn.category}</div>
                      </div>
                    </td>
                    <td>
                      <div>
                        <div style={{ fontSize: '0.8rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <span style={{ fontSize: '0.66rem', fontWeight: 700, padding: '1px 4px', background: '#e2e8f0', borderRadius: '3px', color: '#475569' }}>
                            {isVisa ? 'VISA' : 'MC'}
                          </span>
                          <span>•• {txn.card_last_four}</span>
                        </div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{txn.location}</div>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: '#0f172a', fontVariantNumeric: 'tabular-nums' }}>
                        ${txn.amount.toFixed(2)}
                      </span>
                    </td>
                    <td>
                      <span className={`badge-status ${isFraud ? 'fraud' : 'legit'}`}>
                        {isFraud ? 'Flagged' : 'Cleared'}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: isFraud ? 'var(--rose-text)' : 'var(--emerald-text)', fontVariantNumeric: 'tabular-nums' }}>
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
                          style={{ padding: '5px 8px', color: 'var(--rose-main)' }}
                          title="Delete record"
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
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
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
            <ChevronLeft size={15} style={{ display: 'inline', verticalAlign: 'middle' }} /> Previous
          </button>
          <button
            type="button"
            className="page-btn"
            id="btn-next-page"
            disabled={page >= totalPages || loading}
            onClick={() => onPageChange(page + 1)}
          >
            Next <ChevronRight size={15} style={{ display: 'inline', verticalAlign: 'middle' }} />
          </button>
        </div>
      </div>
    </div>
  );
};
