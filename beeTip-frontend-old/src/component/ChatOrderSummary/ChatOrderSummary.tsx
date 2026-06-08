import type { Order } from "../../types/order";
import { formatCurrency } from "../../utils/formatters";
import OrderParticipantMeta from "../OrderParticipantMeta/OrderParticipantMeta";
import "./ChatOrderSummary.css";

interface ChatOrderSummaryProps {
  order: Order;
  currentUserId?: string;
}

export default function ChatOrderSummary({
  order,
  currentUserId,
}: ChatOrderSummaryProps) {
  return (
    <div className="chat-order-summary">
      <p>{order.itemDesc}</p>
      <span>
        {order.itemPrice
          ? formatCurrency(order.itemPrice + order.deliveryFee)
          : `${formatCurrency(order.deliveryFee)} delivery fee`}
      </span>
      {order.receiptImageUrl && (
        <a href={order.receiptImageUrl} target="_blank" rel="noreferrer">
          <img src={order.receiptImageUrl} alt="Receipt" />
        </a>
      )}
      <OrderParticipantMeta order={order} viewerId={currentUserId} />
    </div>
  );
}
