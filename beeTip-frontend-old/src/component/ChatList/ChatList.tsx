import UserOrderCard from "../UserOrderCard/UserOrderCard";
import type { Order } from "../../types/order";
import "./ChatList.css";

interface ChatListProps {
  orders: Order[];
  currentUserId?: string;
}

export default function ChatList({ orders, currentUserId }: ChatListProps) {
  return (
    <div className="chat-list">
      {orders.length > 0 ? (
        orders.map((item) => (
          <UserOrderCard key={item.id} data={item} viewerId={currentUserId} />
        ))
      ) : (
        <p className="empty-state">No active chats yet.</p>
      )}
    </div>
  );
}
