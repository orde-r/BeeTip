import "./OrderStatusFilter.css";

export type OrderStatusFilterValue = "ALL" | "ACTIVE" | "DONE";

interface OrderStatusFilterProps {
  value: OrderStatusFilterValue;
  onChange: (value: OrderStatusFilterValue) => void;
}

const FILTERS: { value: OrderStatusFilterValue; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "ACTIVE", label: "Active" },
  { value: "DONE", label: "Done" },
];

export default function OrderStatusFilter({
  value,
  onChange,
}: OrderStatusFilterProps) {
  return (
    <div className="order-status-filter">
      {FILTERS.map((filter) => (
        <button
          type="button"
          key={filter.value}
          className={`order-status-filter-btn ${
            value === filter.value ? "order-status-filter-btn-active" : ""
          }`}
          onClick={() => onChange(filter.value)}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}
