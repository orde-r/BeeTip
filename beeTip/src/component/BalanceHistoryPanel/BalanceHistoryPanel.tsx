import type { Transaction } from "../../types/payment";
import { formatCurrency, formatDate } from "../../utils/formatters";
import "./BalanceHistoryPanel.css";

interface BalanceHistoryPanelProps {
  transactions: Transaction[];
  isLoading: boolean;
  error: string;
  onClose: () => void;
}

const getTransactionSign = (type: Transaction["type"]) => {
  return type === "PAYMENT" ? "-" : "+";
};

export default function BalanceHistoryPanel({
  transactions,
  isLoading,
  error,
  onClose,
}: BalanceHistoryPanelProps) {
  return (
    <div className="balance-history-panel">
      <div className="balance-history-header">
        <p>Balance History</p>
        <button type="button" onClick={onClose}>
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>

      {error && <p className="page-error">{error}</p>}

      {isLoading ? (
        <p className="empty-state">Loading history...</p>
      ) : transactions.length > 0 ? (
        <div className="balance-history-list">
          {transactions.map((transaction) => (
            <div className="balance-history-item" key={transaction.id}>
              <div>
                <p>{transaction.type}</p>
                <span>{formatDate(transaction.createdAt)}</span>
              </div>
              <strong>
                {getTransactionSign(transaction.type)}
                {formatCurrency(transaction.amount)}
              </strong>
            </div>
          ))}
        </div>
      ) : (
        <p className="empty-state">No balance history yet.</p>
      )}
    </div>
  );
}
