import { Link } from "react-router-dom";
import { ROUTES } from "../../constants/routes";
import type { Order } from "../../types/order";
import { formatDate } from "../../utils/formatters";
import "./ChatDetailHeader.css";

interface ChatDetailHeaderProps {
  order: Order;
}

export default function ChatDetailHeader({ order }: ChatDetailHeaderProps) {
  return (
    <div className="chat-detail-header">
      <Link to={ROUTES.CHAT} className="chat-back-btn">
        <span className="material-symbols-outlined">arrow_back</span>
      </Link>
      <div>
        <p className="chat-detail-title">{order.toLocation}</p>
        <p className="chat-detail-subtitle">
          {order.status} - {formatDate(order.createdAt)}
        </p>
      </div>
    </div>
  );
}
