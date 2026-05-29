import "./OrdersSearch.css";

interface OrdersSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export default function OrdersSearch({ value, onChange }: OrdersSearchProps) {
  return (
    <label className="orders-search">
      <span className="orders-search-label">Search orders</span>
      <div className="orders-search-input">
        <span className="material-symbols-outlined">search</span>
        <input
          type="text"
          placeholder="Canteen, room, item..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </label>
  );
}
