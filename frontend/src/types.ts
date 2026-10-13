export interface Transaction {
  id: number;
  transaction_id: string;
  timestamp: string;
  amount: number;
  merchant: string;
  card_last_four: string;
  location: string;
  category: string;
  prediction: string;
  is_fraud: boolean;
  fraud_probability: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
  notes?: string | null;
}

export interface DashboardStats {
  total_transactions: number;
  flagged_transactions: number;
  legitimate_transactions: number;
  fraud_rate: number;
  total_amount: number;
  flagged_amount: number;
  avg_fraud_probability: number;
}

export interface TransactionFormData {
  amount: string;
  merchant: string;
  card_last_four: string;
  location: string;
  category: string;
  is_foreign: boolean;
  distance_km: number;
  pin_used: boolean;
}
