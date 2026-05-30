import { formatCurrency } from "../../utils/formatters";
import "./HomeHeader.css";

interface HomeHeaderProps {
  balance: number;
  onRefresh: () => void;
}

export default function HomeHeader({
  balance,
  onRefresh,
}: HomeHeaderProps) {
  return (
    <div className="home-header-container">
      <div>
        <p className="home-eyebrow">Balance</p>
        <p className="home-balance">{formatCurrency(balance)}</p>
      </div>
      <div className="home-header-actions">
        <button type="button" className="home-refresh-btn" onClick={onRefresh}>
          <span className="material-symbols-outlined">refresh</span>
        </button>
      </div>
    </div>
  );
}
