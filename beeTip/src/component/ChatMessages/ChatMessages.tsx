import type { Message } from "../../types/chat";
import { formatDate } from "../../utils/formatters";
import "./ChatMessages.css";

interface ChatMessagesProps {
  messages: Message[];
  currentUserId?: string;
}

export default function ChatMessages({
  messages,
  currentUserId,
}: ChatMessagesProps) {
  return (
    <div className="chat-messages">
      {messages.length > 0 ? (
        messages.map((message) => {
          const isOwnMessage = message.sender_id === currentUserId;

          return (
            <div
              key={message.id}
              className={`chat-message ${isOwnMessage ? "chat-message-own" : ""}`}
            >
              <p>{message.content}</p>
              <span>{formatDate(message.timestamp)}</span>
            </div>
          );
        })
      ) : (
        <p className="empty-state">No messages yet.</p>
      )}
    </div>
  );
}
