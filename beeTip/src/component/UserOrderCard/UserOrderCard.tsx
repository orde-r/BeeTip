import type { Order } from "../../types/order";
import "./UserOrderCard.css";

interface UserOrderCardProps {
  data: Order;
}

const COURIER_ICONS = {
  waiting:
    "https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsoutlined/hourglass_empty/default/24px.svg",
  courier:
    "https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsoutlined/two_wheeler/default/24px.svg",
  delivered:
    "https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsoutlined/check_circle/default/24px.svg",
};

const formatDate = (date: string): string => {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
};

type Variant = "waiting" | "courier" | "delivered";

interface CardDisplay {
  variant: Variant;
  icon: string;
  statusLabel: string;
  infoLabel: string;
  infoValue: string;
}

const getCardDisplay = (data: Order): CardDisplay => {
  if (data.status === "DELIVERED") {
    return {
      variant: "delivered",
      icon: COURIER_ICONS.delivered,
      statusLabel: "Delivered",
      infoLabel: "Delivered By",
      infoValue: data.courier?.name ?? "—",
    };
  }
  if (data.status === "DELIVERING") {
    return {
      variant: "courier",
      icon: COURIER_ICONS.courier,
      statusLabel: "Picked Up",
      infoLabel: "Courier",
      infoValue: data.courier?.name ?? "—",
    };
  }
  if (data.courier) {
    return {
      variant: "courier",
      icon: COURIER_ICONS.courier,
      statusLabel: "In Progress",
      infoLabel: "Courier",
      infoValue: data.courier.name,
    };
  }
  return {
    variant: "waiting",
    icon: COURIER_ICONS.waiting,
    statusLabel: "Pending",
    infoLabel: "Status",
    infoValue: "Waiting...",
  };
};

export default function UserOrderCard({ data }: UserOrderCardProps) {
  const display = getCardDisplay(data);

  return (
    <div className="userorder-card">
      <div className="userorder-card-header">
        <span className="userorder-date">{formatDate(data.createdAt)}</span>
        <span
          className={`userorder-status userorder-status--${display.variant}`}
        >
          {display.statusLabel}
        </span>
      </div>

      <div className="userorder-divider" />

      <div className="userorder-info-container">
        <div className="userorder-courierinfo-container">
          <div
            className={`userorder-courier-icon-container userorder-courier-icon-container--${display.variant}`}
          >
            <span
              className="userorder-courier-icon"
              style={{
                maskImage: `url(${display.icon})`,
                WebkitMaskImage: `url(${display.icon})`,
              }}
              aria-hidden="true"
            />
          </div>
          <div className="userorder-courier-text">
            <p className="userorder-courier-label">{display.infoLabel}</p>
            <p className="userorder-courier-value">{display.infoValue}</p>
          </div>
        </div>

        <button className="userorder-details-btn primary-btn">Details</button>
      </div>
    </div>
  );
}
