import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../component/Navbar/Navbar";
import { getChatRoute } from "../../constants/routes";
import { useAuth } from "../../context/AuthContext/AuthContext";
import { orderApi } from "../../services/api";
import type { Order } from "../../types/order";
import { getErrorMessage } from "../../utils/errors";
import AvailableOrderCard from "../../component/AvailableOrderCard/AvailableOrderCard";
import OrdersHeader from "../../component/OrdersHeader/OrdersHeader";
import OrdersSearch from "../../component/OrdersSearch/OrdersSearch";
import "./Orders.css";

export default function Orders() {
  const { accessToken, currentUser } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState("");
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAvailableOrders = useCallback(async () => {
    if (!accessToken) return;

    setError("");
    setIsLoading(true);

    try {
      const response = await orderApi.available(accessToken);
      setOrders(response.orders);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load available orders"));
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (!accessToken) return;

    let isActive = true;

    orderApi
      .available(accessToken)
      .then((response) => {
        if (!isActive) return;
        setOrders(response.orders);
      })
      .catch((err) => {
        if (!isActive) return;
        setError(getErrorMessage(err, "Failed to load available orders"));
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [accessToken]);

  const filteredOrders = useMemo(() => {
    const normalizedSearch = search.toLowerCase().trim();
    if (!normalizedSearch) return orders;

    return orders.filter((order) => {
      return (
        order.to_location.toLowerCase().includes(normalizedSearch) ||
        order.item_desc.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [orders, search]);

  const handleAccept = async (orderId: string) => {
    if (!accessToken) return;

    setError("");
    setActiveOrderId(orderId);

    try {
      const response = await orderApi.accept(accessToken, orderId);
      navigate(getChatRoute(response.order.id));
    } catch (err) {
      setError(getErrorMessage(err, "Failed to accept order"));
      void loadAvailableOrders();
    } finally {
      setActiveOrderId(null);
    }
  };

  return (
    <>
      <section className="orders navbar-section">
        <OrdersHeader onRefresh={loadAvailableOrders} />
        <OrdersSearch value={search} onChange={setSearch} />

        {error && <p className="page-error">{error}</p>}

        <div className="orders-grid">
          {isLoading ? (
            <p className="empty-state">Loading orders...</p>
          ) : filteredOrders.length > 0 ? (
            filteredOrders.map((order) => {
              const isOwnOrder = order.buyer_id === currentUser?.id;

              return (
                <AvailableOrderCard
                  key={order.id}
                  order={order}
                  isOwnOrder={isOwnOrder}
                  isAccepting={activeOrderId === order.id}
                  onAccept={(nextOrderId) => void handleAccept(nextOrderId)}
                />
              );
            })
          ) : (
            <p className="empty-state">No pending orders found.</p>
          )}
        </div>
      </section>
      <Navbar />
    </>
  );
}
