import "./OrdersHeader.css";

interface OrdersHeaderProps {
  onRefresh: () => void;
}

export default function OrdersHeader({ onRefresh }: OrdersHeaderProps) {
  return (
    <div className="orders-header">
      <div>
        <p className="orders-title">Available Orders</p>
        <p className="orders-subtitle">Accept pending campus errands as kurir.</p>
      </div>
      <button type="button" className="orders-icon-btn" onClick={onRefresh}>
        <span className="material-symbols-outlined">refresh</span>
      </button>
    </div>
  );
}
