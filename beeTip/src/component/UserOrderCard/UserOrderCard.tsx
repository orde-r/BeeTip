import { useState } from "react";
import { Link } from "react-router-dom";
import { getChatRoute } from "../../constants/routes";
import type { Order } from "../../types/order";
import { formatCurrency, formatDate } from "../../utils/formatters";
import OrderParticipantMeta from "../OrderParticipantMeta/OrderParticipantMeta";
import "./UserOrderCard.css";

interface UserOrderCardProps {
  data: Order;
  viewerId?: string;
}

type Variant = "waiting" | "courier" | "paid" | "delivered";

interface CardDisplay {
  variant: Variant;
  icon: string;
  statusLabel: string;
}

const getCardDisplay = (data: Order): CardDisplay => {
  switch (data.status) {
    case "PENDING":
      return {
        variant: "waiting",
        icon: "hourglass_empty",
        statusLabel: "Pending",
      };
    case "ACCEPTED":
      return {
        variant: "courier",
        icon: "two_wheeler",
        statusLabel: "Accepted",
      };
    case "PRICED":
      return {
        variant: "courier",
        icon: "payments",
        statusLabel: "Priced",
      };
    case "PAID":
      return {
        variant: "paid",
        icon: "verified",
        statusLabel: "Paid",
      };
    case "COMPLETED":
      return {
        variant: "delivered",
        icon: "check_circle",
        statusLabel: "Completed",
      };
    case "CANCELLED":
      return {
        variant: "waiting",
        icon: "cancel",
        statusLabel: "Cancelled",
      };
  }
};

const getRoleLabel = (data: Order, viewerId?: string): string => {
  if (!viewerId) return "Order";
  if (data.buyer_id === viewerId) return "Buyer";
  if (data.kurir_id === viewerId) return "Kurir";
  return "Available";
};

export default function UserOrderCard({ data, viewerId }: UserOrderCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const display = getCardDisplay(data);
  const total = (data.item_price ?? 0) + data.delivery_fee;

  return (
    <div className="userorder-card">
      <button
        type="button"
        className="userorder-card-summary"
        onClick={() => setIsExpanded((prev) => !prev)}
      >
        <span className="userorder-date">{formatDate(data.createdAt)}</span>
        <span className={`userorder-status userorder-status--${display.variant}`}>
          {display.statusLabel}
        </span>
        <span
          className={`material-symbols-outlined userorder-expand-icon ${
            isExpanded ? "userorder-expand-icon-open" : ""
          }`}
        >
          expand_more
        </span>
      </button>

      {isExpanded && (
        <>
          <div className="userorder-divider" />

          <div className="userorder-info-container">
            <div className="userorder-courierinfo-container">
              <div
                className={`userorder-courier-icon-container userorder-courier-icon-container--${display.variant}`}
              >
                <span className="material-symbols-outlined userorder-material-icon">
                  {display.icon}
                </span>
              </div>
              <div className="userorder-courier-text">
                <p className="userorder-courier-label">
                  {getRoleLabel(data, viewerId)}
                </p>
                <p className="userorder-courier-value">{data.to_location}</p>
              </div>
            </div>

            <Link
              to={getChatRoute(data.id)}
              className="userorder-details-btn primary-btn"
            >
              Details
            </Link>
          </div>

          <p className="userorder-detail">{data.item_desc}</p>
          <p className="userorder-total">
            {data.item_price ? formatCurrency(total) : "Waiting for price"}
          </p>
          <OrderParticipantMeta order={data} viewerId={viewerId} />
        </>
      )}
    </div>
  );
}
