import type { Order } from "../../types/order";
import { formatCurrency, formatDate } from "../../utils/formatters";
import OrderParticipantMeta from "../OrderParticipantMeta/OrderParticipantMeta";
import "./AvailableOrderCard.css";

interface AvailableOrderCardProps {
  order: Order;
  isOwnOrder: boolean;
  isAccepting: boolean;
  onAccept: (orderId: string) => void;
}

export default function AvailableOrderCard({
  order,
  isOwnOrder,
  isAccepting,
  onAccept,
}: AvailableOrderCardProps) {
  return (
    <div className="available-order-card">
      <div className="available-order-header">
        <span>{formatDate(order.createdAt)}</span>
        <span>{formatCurrency(order.deliveryFee)} fee</span>
      </div>
      <p className="available-order-location">{order.toLocation}</p>
      <p className="available-order-detail">{order.itemDesc}</p>
      <OrderParticipantMeta order={order} mode="orderedBy" />
      <button
        type="button"
        className="primary-btn available-order-btn"
        onClick={() => onAccept(order.id)}
        disabled={isOwnOrder || isAccepting}
      >
        {isOwnOrder
          ? "Your Order"
          : isAccepting
            ? "Accepting..."
            : "Accept Order"}
      </button>
    </div>
  );
}
