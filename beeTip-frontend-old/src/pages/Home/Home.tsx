import { useCallback, useEffect, useMemo, useState } from "react";
import Navbar from "../../component/Navbar/Navbar";
import UserOrderCard from "../../component/UserOrderCard/UserOrderCard";
import { useAuth } from "../../context/AuthContext/AuthContext";
import { orderApi } from "../../services/api";
import type { Order } from "../../types/order";
import { getErrorMessage } from "../../utils/errors";
import CreateOrderForm from "../../component/CreateOrderForm/CreateOrderForm";
import HomeHeader from "../../component/HomeHeader/HomeHeader";
import OrderStatusFilter, {
  type OrderStatusFilterValue,
} from "../../component/OrderStatusFilter/OrderStatusFilter";
import { filterOrdersByStatusGroup } from "../../utils/orderFilters";
import "./Home.css";

export default function Home() {
  const { accessToken, currentUser } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [toLocation, setToLocation] = useState("");
  const [itemDesc, setItemDesc] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatusFilterValue>("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const loadOrders = useCallback(async () => {
    if (!accessToken) return;

    setError("");
    setIsLoading(true);

    try {
      const response = await orderApi.myOrders(accessToken);
      setOrders(response.orders);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load your orders"));
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (!accessToken) return;

    let isActive = true;

    orderApi
      .myOrders(accessToken)
      .then((response) => {
        if (!isActive) return;
        setOrders(response.orders);
      })
      .catch((err) => {
        if (!isActive) return;
        setError(getErrorMessage(err, "Failed to load your orders"));
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

  const handleCreateOrder = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!accessToken) return;

    setError("");
    setIsSubmitting(true);

    try {
      const response = await orderApi.create(accessToken, toLocation, itemDesc);
      setOrders((prev) => [response.order, ...prev]);
      setToLocation("");
      setItemDesc("");
    } catch (err) {
      setError(getErrorMessage(err, "Failed to create order"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredOrders = useMemo(() => {
    return filterOrdersByStatusGroup(orders, statusFilter);
  }, [orders, statusFilter]);

  return (
    <>
      <section className="home navbar-section">
        <HomeHeader
          balance={currentUser?.balance ?? 0}
          onRefresh={loadOrders}
        />

        <CreateOrderForm
          toLocation={toLocation}
          itemDesc={itemDesc}
          isSubmitting={isSubmitting}
          onToLocationChange={setToLocation}
          onItemDescChange={setItemDesc}
          onSubmit={handleCreateOrder}
        />

        {error && <p className="page-error">{error}</p>}

        <div className="home-orders-header">
          <p className="home-section-title">My Orders</p>
          <span>{filteredOrders.length}</span>
        </div>

        <OrderStatusFilter value={statusFilter} onChange={setStatusFilter} />

        <div className="userorders-container">
          {isLoading ? (
            <p className="empty-state">Loading orders...</p>
          ) : filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
              <UserOrderCard
                key={order.id}
                data={order}
                viewerId={currentUser?.id}
              />
            ))
          ) : (
            <p className="empty-state">No orders found.</p>
          )}
        </div>
      </section>
      <Navbar />
    </>
  );
}
