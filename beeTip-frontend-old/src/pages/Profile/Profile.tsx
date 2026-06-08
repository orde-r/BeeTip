import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../component/Navbar/Navbar";
import { ROUTES } from "../../constants/routes";
import { useAuth } from "../../context/AuthContext/AuthContext";
import { transactionApi } from "../../services/api";
import type { Transaction } from "../../types/payment";
import { getErrorMessage } from "../../utils/errors";
import { formatCurrency } from "../../utils/formatters";
import BalanceHistoryPanel from "../../component/BalanceHistoryPanel/BalanceHistoryPanel";
import ProfileHeader from "../../component/ProfileHeader/ProfileHeader";
import WalletTopUpForm from "../../component/WalletTopUpForm/WalletTopUpForm";
import "./Profile.css";

export default function Profile() {
  const { accessToken, currentUser, logout, updateBalance } = useAuth();
  const navigate = useNavigate();

  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleDeposit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!accessToken) return;

    const depositAmount = Number(amount);
    if (!Number.isFinite(depositAmount) || depositAmount <= 0) {
      setError("Enter a valid top up amount");
      return;
    }

    setError("");
    setMessage("");
    setIsSubmitting(true);

    try {
      const response = await transactionApi.deposit(accessToken, depositAmount);
      updateBalance(response.newBalance);
      setAmount("");
      setMessage("Balance updated");
    } catch (err) {
      setError(getErrorMessage(err, "Failed to top up balance"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.AUTH);
  };

  const handleToggleHistory = async () => {
    if (showHistory) {
      setShowHistory(false);
      return;
    }

    if (!accessToken) return;

    setShowHistory(true);
    setHistoryError("");
    setIsHistoryLoading(true);

    try {
      const response = await transactionApi.history(accessToken);
      setTransactions(response.transactions);
    } catch (err) {
      setHistoryError(getErrorMessage(err, "Failed to load balance history"));
    } finally {
      setIsHistoryLoading(false);
    }
  };

  return (
    <>
      <section className="profile navbar-section">
        <ProfileHeader email={currentUser?.email} />

        <div className="profile-wallet">
          <div>
            <p className="profile-wallet-label">Wallet Balance</p>
            <p className="profile-wallet-balance">
              {formatCurrency(currentUser?.balance ?? 0)}
            </p>
          </div>
          <button
            type="button"
            className={`profile-history-btn ${
              showHistory ? "profile-history-btn-active" : ""
            }`}
            onClick={handleToggleHistory}
          >
            <span className="material-symbols-outlined">history</span>
          </button>
        </div>

        {showHistory && (
          <BalanceHistoryPanel
            transactions={transactions}
            isLoading={isHistoryLoading}
            error={historyError}
            onClose={() => setShowHistory(false)}
          />
        )}

        <WalletTopUpForm
          amount={amount}
          isSubmitting={isSubmitting}
          message={message}
          error={error}
          onAmountChange={setAmount}
          onSubmit={handleDeposit}
        />

        <button
          type="button"
          className="outline-btn profile-logout-btn"
          onClick={handleLogout}
        >
          Logout
        </button>
      </section>
      <Navbar />
    </>
  );
}
