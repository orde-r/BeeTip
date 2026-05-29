import { formatCurrency } from "../../utils/formatters";
import "./WalletTopUpForm.css";

const DEPOSIT_PRESETS = [25000, 50000, 100000];

interface WalletTopUpFormProps {
  amount: string;
  isSubmitting: boolean;
  message: string;
  error: string;
  onAmountChange: (value: string) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export default function WalletTopUpForm({
  amount,
  isSubmitting,
  message,
  error,
  onAmountChange,
  onSubmit,
}: WalletTopUpFormProps) {
  return (
    <form className="profile-topup" onSubmit={onSubmit}>
      <p className="profile-section-title">Top Up Balance</p>
      <div className="profile-presets">
        {DEPOSIT_PRESETS.map((preset) => (
          <button
            type="button"
            key={preset}
            className="profile-preset-btn"
            onClick={() => onAmountChange(String(preset))}
          >
            {formatCurrency(preset)}
          </button>
        ))}
      </div>
      <label className="form-input-container">
        Amount
        <input
          type="number"
          min="1"
          value={amount}
          onChange={(e) => onAmountChange(e.target.value)}
          placeholder="100000"
          required
        />
      </label>
      {message && <p className="page-success">{message}</p>}
      {error && <p className="page-error">{error}</p>}
      <button
        type="submit"
        className="primary-btn profile-topup-btn"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Processing..." : "Top Up"}
      </button>
    </form>
  );
}
