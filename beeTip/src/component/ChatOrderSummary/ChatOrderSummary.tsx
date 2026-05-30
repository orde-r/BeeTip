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
      <p>{order.item_desc}</p>
      <span>
        {order.item_price
          ? formatCurrency(order.item_price + order.delivery_fee)
          : `${formatCurrency(order.delivery_fee)} delivery fee`}
      </span>
      {order.receipt_image_url && (
        <a href={order.receipt_image_url} target="_blank" rel="noreferrer">
          <img src={order.receipt_image_url} alt="Receipt" />
        </a>
      )}
      <OrderParticipantMeta order={order} viewerId={currentUserId} />
    </div>
  );
}
