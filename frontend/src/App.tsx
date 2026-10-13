import React, { useState, useEffect, useCallback } from 'react';
import { Shield, RefreshCw, Cpu, CheckCircle, AlertCircle } from 'lucide-react';
import { SummaryCards } from './SummaryCards';
import { TransactionForm } from './TransactionForm';
import { PredictionResult } from './PredictionResult';
import { TransactionHistoryTable } from './TransactionHistoryTable';
import { TransactionModal } from './TransactionModal';
import type { Transaction, DashboardStats, TransactionFormData } from './types';

export const App: React.FC = () => {
  // State
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState<boolean>(true);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalTransactions, setTotalTransactions] = useState<number>(0);
  const [tableLoading, setTableLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('timestamp');

  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [latestVerdict, setLatestVerdict] = useState<Transaction | null>(null);
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);

  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [backendStatus, setBackendStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');

  // API Base URL (uses relative /api which proxies to http://127.0.0.1:8000 via Vite)
  const API_URL = '/api';

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Fetch Dashboard Stats
  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const res = await fetch(`${API_URL}/stats`);
      if (!res.ok) throw new Error('Failed to load stats');
      const data: DashboardStats = await res.json();
      setStats(data);
      setBackendStatus('connected');
    } catch (err) {
      console.error('Error fetching stats:', err);
      setBackendStatus('disconnected');
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // Fetch Transactions List
  const fetchTransactions = useCallback(async () => {
    try {
      setTableLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '8',
        sort_by: sortBy,
        order: 'desc',
      });
      if (search.trim()) params.append('search', search.trim());
      if (statusFilter !== 'all') params.append('status', statusFilter);

      const res = await fetch(`${API_URL}/transactions?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to load transaction history');
      const data = await res.json();
      setTransactions(data.items);
      setTotalTransactions(data.total);
      setBackendStatus('connected');
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setBackendStatus('disconnected');
    } finally {
      setTableLoading(false);
    }
  }, [page, search, statusFilter, sortBy]);

  // Initial load
  useEffect(() => {
    fetchStats();
    fetchTransactions();
  }, [fetchStats, fetchTransactions]);

  // Refresh All
  const refreshAll = () => {
    fetchStats();
    fetchTransactions();
    showToast('success', 'Dashboard synced with PostgreSQL database.');
  };

  // Submit New Transaction
  const handleAnalyzeTransaction = async (formData: TransactionFormData) => {
    try {
      setAnalyzing(true);
      const payload = {
        amount: parseFloat(formData.amount),
        merchant: formData.merchant,
        card_last_four: formData.card_last_four,
        location: formData.location,
        category: formData.category,
        is_foreign: formData.is_foreign,
        distance_km: formData.distance_km,
        pin_used: formData.pin_used,
      };

      const res = await fetch(`${API_URL}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || 'Prediction failed');
      }

      const createdTxn: Transaction = await res.json();
      setLatestVerdict(createdTxn);

      showToast(
        'success',
        `Transaction ${createdTxn.transaction_id} evaluated and logged into PostgreSQL!`
      );

      // Refresh table and stats
      fetchStats();
      fetchTransactions();
    } catch (err: any) {
      console.error('Transaction analysis error:', err);
      showToast('error', err.message || 'Could not connect to FastAPI server');
    } finally {
      setAnalyzing(false);
    }
  };

  // Delete Transaction
  const handleDeleteTransaction = async (id: number) => {
    try {
      const res = await fetch(`${API_URL}/transactions/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete transaction');

      showToast('success', `Record #${id} successfully removed from PostgreSQL.`);
      setSelectedTxn(null);
      fetchStats();
      fetchTransactions();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to delete record');
    }
  };

  return (
    <div className="app-layout">
      {/* Sticky Header */}
      <header className="app-header">
        <div className="container header-inner">
          <div className="brand-wrapper">
            <div className="brand-icon">
              <Shield size={24} />
            </div>
            <div className="brand-title-group">
              <h1>FraudShield Enterprise</h1>
              <div className="brand-badge">
                <Cpu size={12} style={{ color: 'var(--accent-cyan)' }} />
                <span>AI Scikit-Learn Model &bull; PostgreSQL 18</span>
              </div>
            </div>
          </div>

          <div className="header-status-group">
            <div className="status-pill">
              <div
                className="pulse-dot"
                style={{
                  backgroundColor:
                    backendStatus === 'connected' ? 'var(--accent-emerald)' : 'var(--accent-ruby)',
                  boxShadow:
                    backendStatus === 'connected'
                      ? '0 0 10px var(--accent-emerald)'
                      : '0 0 10px var(--accent-ruby)',
                }}
              ></div>
              <span>
                {backendStatus === 'connected'
                  ? 'FastAPI & PostgreSQL Online'
                  : backendStatus === 'checking'
                  ? 'Connecting...'
                  : 'Backend Offline'}
              </span>
            </div>

            <button
              type="button"
              className="page-btn"
              onClick={refreshAll}
              title="Sync with database"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <RefreshCw size={14} /> Sync
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="container dashboard-content">
        {/* Toast alert */}
        {toastMessage && (
          <div
            style={{
              padding: '12px 18px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '0.86rem',
              fontWeight: 500,
              backgroundColor:
                toastMessage.type === 'success'
                  ? 'rgba(16, 185, 129, 0.15)'
                  : 'rgba(244, 63, 94, 0.15)',
              border: `1px solid ${
                toastMessage.type === 'success'
                  ? 'rgba(16, 185, 129, 0.4)'
                  : 'rgba(244, 63, 94, 0.4)'
              }`,
              color: toastMessage.type === 'success' ? '#a7f3d0' : '#fecdd3',
              boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
            }}
          >
            {toastMessage.type === 'success' ? (
              <CheckCircle size={18} color="#10b981" />
            ) : (
              <AlertCircle size={18} color="#f43f5e" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        )}

        {/* 1. Summary Cards */}
        <section aria-label="Dashboard Overview">
          <SummaryCards stats={stats} loading={statsLoading} />
        </section>

        {/* 2. Main Two-Column Row: Input Form & Prediction Result */}
        <section className="main-grid" aria-label="Transaction Evaluation">
          <TransactionForm onSubmit={handleAnalyzeTransaction} loading={analyzing} />
          <PredictionResult result={latestVerdict} loading={analyzing} />
        </section>

        {/* 3. Transaction History & PostgreSQL Audit Table */}
        <section aria-label="Transaction Audit Records">
          <TransactionHistoryTable
            transactions={transactions}
            total={totalTransactions}
            page={page}
            limit={8}
            loading={tableLoading}
            onPageChange={(newPage) => setPage(newPage)}
            search={search}
            onSearchChange={(newSearch) => {
              setSearch(newSearch);
              setPage(1);
            }}
            statusFilter={statusFilter}
            onStatusFilterChange={(newStatus) => {
              setStatusFilter(newStatus);
              setPage(1);
            }}
            sortBy={sortBy}
            onSortByChange={(newSort) => setSortBy(newSort)}
            onViewDetails={(txn) => setSelectedTxn(txn)}
            onDeleteTxn={handleDeleteTransaction}
          />
        </section>
      </main>

      {/* Audit Detail Modal */}
      <TransactionModal
        transaction={selectedTxn}
        onClose={() => setSelectedTxn(null)}
        onDelete={handleDeleteTransaction}
      />
    </div>
  );
};

export default App;
