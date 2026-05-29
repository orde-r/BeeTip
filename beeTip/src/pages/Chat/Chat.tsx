import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { io, type Socket } from "socket.io-client";
import Navbar from "../../component/Navbar/Navbar";
import { useAuth } from "../../context/AuthContext/AuthContext";
import { orderApi } from "../../services/api";
import type { Message } from "../../types/chat";
import type { Order } from "../../types/order";
import { getErrorMessage } from "../../utils/errors";
import ChatComposer from "../../component/ChatComposer/ChatComposer";
import ChatDetailHeader from "../../component/ChatDetailHeader/ChatDetailHeader";
import ChatList from "../../component/ChatList/ChatList";
import ChatMessages from "../../component/ChatMessages/ChatMessages";
import ChatOrderSummary from "../../component/ChatOrderSummary/ChatOrderSummary";
import OrderStateAction from "../../component/OrderStateAction/OrderStateAction";
import OrderStatusFilter, {
  type OrderStatusFilterValue,
} from "../../component/OrderStatusFilter/OrderStatusFilter";
import { filterOrdersByStatusGroup } from "../../utils/orderFilters";
import "./Chat.css";

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ?? "http://localhost:3000/chat";
const SECURITY_CODES_KEY = "beetip_security_codes";

type ChatSocket = Socket<
  {
    receive_message: (message: Message) => void;
    order_status_changed: (payload: { order: Order }) => void;
    error: (payload: { message?: string }) => void;
  },
  {
    join_room: (payload: { order_id: string }) => void;
    send_message: (payload: { order_id: string; content: string }) => void;
  }
>;

const readSecurityCodes = (): Record<string, string> => {
  const storedCodes = localStorage.getItem(SECURITY_CODES_KEY);
  if (!storedCodes) return {};

  try {
    return JSON.parse(storedCodes) as Record<string, string>;
  } catch {
    localStorage.removeItem(SECURITY_CODES_KEY);
    return {};
  }
};

export default function Chat() {
  const { orderId } = useParams();
  const { accessToken, currentUser, refreshUser } = useAuth();
  const socketRef = useRef<ChatSocket | null>(null);

  const [orders, setOrders] = useState<Order[]>([]);
  const [order, setOrder] = useState<Order | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [securityCodes, setSecurityCodes] =
    useState<Record<string, string>>(readSecurityCodes);
  const [draftMessage, setDraftMessage] = useState("");
  const [price, setPrice] = useState("");
  const [receiptImageUrl, setReceiptImageUrl] = useState("");
  const [completionCode, setCompletionCode] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<OrderStatusFilterValue>("ACTIVE");
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!accessToken) return;

    let isActive = true;

    if (!orderId) {
      orderApi
        .myOrders(accessToken)
        .then((response) => {
          if (!isActive) return;
          setOrders(response.orders);
        })
        .catch((err) => {
          if (!isActive) return;
          setError(getErrorMessage(err, "Failed to load chats"));
        })
        .finally(() => {
          if (isActive) {
            setIsLoading(false);
          }
        });

      return () => {
        isActive = false;
      };
    }

    orderApi
      .getById(accessToken, orderId)
      .then(async (orderResponse) => {
        const messagesResponse = await orderApi.messages(accessToken, orderId);
        return {
          order: orderResponse.order,
          messages: messagesResponse.messages,
        };
      })
      .then((response) => {
        if (!isActive) return;
        setOrder(response.order);
        setMessages(response.messages);
      })
      .catch((err) => {
        if (!isActive) return;
        setError(getErrorMessage(err, "Failed to load order chat"));
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [accessToken, orderId]);

  useEffect(() => {
    if (!accessToken || !orderId) return;

    const socket: ChatSocket = io(SOCKET_URL, {
      auth: { token: accessToken },
    });

    socketRef.current = socket;
    socket.emit("join_room", { order_id: orderId });

    socket.on("receive_message", (message) => {
      setMessages((prev) => {
        if (prev.some((item) => item.id === message.id)) return prev;
        return [...prev, message];
      });
    });

    socket.on("order_status_changed", (payload) => {
      setOrder(payload.order);
    });

    socket.on("error", (payload) => {
      setError(payload.message ?? "Chat connection error");
    });

    return () => {
      socket.off("receive_message");
      socket.off("order_status_changed");
      socket.off("error");
      socket.disconnect();
      socketRef.current = null;
    };
  }, [accessToken, orderId]);

  const saveSecurityCode = (nextOrderId: string, code: string) => {
    const nextCodes = {
      ...securityCodes,
      [nextOrderId]: code,
    };

    setSecurityCodes(nextCodes);
    localStorage.setItem(SECURITY_CODES_KEY, JSON.stringify(nextCodes));
  };

  const handleUploadPrice = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!accessToken || !order) return;

    const itemPrice = Number(price);
    if (!Number.isFinite(itemPrice) || itemPrice <= 0) {
      setError("Enter a valid item price");
      return;
    }

    setError("");
    setIsActionLoading(true);

    try {
      const response = await orderApi.uploadPrice(
        accessToken,
        order.id,
        itemPrice,
        receiptImageUrl.trim() || undefined,
      );
      setOrder(response.order);
      setPrice("");
      setReceiptImageUrl("");
    } catch (err) {
      setError(getErrorMessage(err, "Failed to upload price"));
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleReceiptImageSelect = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Choose an image file for the receipt");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setReceiptImageUrl(reader.result);
      }
    };
    reader.onerror = () => {
      setError("Failed to read receipt image");
    };
    reader.readAsDataURL(file);
  };

  const handlePay = async () => {
    if (!accessToken || !order) return;

    setError("");
    setIsActionLoading(true);

    try {
      const response = await orderApi.pay(accessToken, order.id);
      setOrder(response.order);
      saveSecurityCode(response.order.id, response.security_code);
      await refreshUser();
    } catch (err) {
      setError(getErrorMessage(err, "Failed to pay order"));
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!accessToken || !order) return;

    setError("");
    setIsActionLoading(true);

    try {
      const response = await orderApi.cancel(accessToken, order.id);
      setOrder(response.order);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to cancel order"));
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleComplete = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!accessToken || !order) return;

    setError("");
    setIsActionLoading(true);

    try {
      const response = await orderApi.complete(
        accessToken,
        order.id,
        completionCode,
      );
      setOrder(response.order);
      setCompletionCode("");
      await refreshUser();
    } catch (err) {
      setError(getErrorMessage(err, "Failed to complete order"));
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleSendMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!order) return;

    const content = draftMessage.trim();
    if (!content) return;

    socketRef.current?.emit("send_message", {
      order_id: order.id,
      content,
    });
    setDraftMessage("");
  };

  const filteredOrders = useMemo(() => {
    return filterOrdersByStatusGroup(orders, statusFilter);
  }, [orders, statusFilter]);

  if (!orderId) {
    return (
      <>
        <section className="chat navbar-section">
          <div className="chat-header">
            <p className="chat-title">Chats</p>
            <p className="chat-subtitle">
              Open an order to see messages and status actions.
            </p>
          </div>

          {error && <p className="page-error">{error}</p>}

          <OrderStatusFilter value={statusFilter} onChange={setStatusFilter} />

          {isLoading ? (
            <p className="empty-state">Loading chats...</p>
          ) : (
            <ChatList orders={filteredOrders} currentUserId={currentUser?.id} />
          )}
        </section>
        <Navbar />
      </>
    );
  }

  return (
    <>
      <section className="chat navbar-section">
        {isLoading ? (
          <p className="empty-state">Loading chat...</p>
        ) : order ? (
          <>
            <ChatDetailHeader order={order} />
            <ChatOrderSummary order={order} currentUserId={currentUser?.id} />
            <OrderStateAction
              order={order}
              currentUserId={currentUser?.id}
              securityCode={securityCodes[order.id]}
              price={price}
              receiptImageUrl={receiptImageUrl}
              completionCode={completionCode}
              isActionLoading={isActionLoading}
              onPriceChange={setPrice}
              onReceiptImageSelect={handleReceiptImageSelect}
              onReceiptImageCapture={setReceiptImageUrl}
              onCompletionCodeChange={setCompletionCode}
              onUploadPrice={handleUploadPrice}
              onPay={handlePay}
              onComplete={handleComplete}
              onCancel={handleCancel}
            />
            {error && <p className="page-error">{error}</p>}

            <ChatMessages messages={messages} currentUserId={currentUser?.id} />

            {order.status !== "COMPLETED" && order.status !== "CANCELLED" && (
              <ChatComposer
                value={draftMessage}
                onChange={setDraftMessage}
                onSubmit={handleSendMessage}
              />
            )}
          </>
        ) : (
          <p className="empty-state">Order not found.</p>
        )}
      </section>
      <Navbar />
    </>
  );
}
