import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SecondaryActionButton } from "../components/actions/ActionButton";
import { Notice } from "../components/layout/Notice";
import { PageShell } from "../components/layout/PageShell";
import { OrderCard } from "../components/orders/OrderCard";
import { OrderListSection } from "../components/orders/OrderListSection";
import { routes } from "../app/routes";
import { ApiClientError } from "../services/apiClient";
import { acceptOrder, getAvailableOrders } from "../services/ordersApi";
import { useAuth } from "../store";
import type { OrderDTO, UserDTO } from "../types/api";
import { useDashboardData } from "../hooks/useDashboardData";

type KurirOrderListData = {
  user: UserDTO;
  availableOrders: OrderDTO[];
};

export function KurirOrderListPage() {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [acceptingOrderId, setAcceptingOrderId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const loadOrders = useCallback(async (): Promise<KurirOrderListData> => {
    const currentUser = await refreshUser();

    if (!currentUser) {
      throw new Error("Unable to load current account.");
    }

    const availableResponse = await getAvailableOrders();

    return {
      user: currentUser,
      availableOrders: availableResponse.orders.filter(
        (order) =>
          order.status === "PENDING" && order.buyer_id !== currentUser.id,
      ),
    };
  }, [refreshUser]);

  const { data, error, isLoading, reload } = useDashboardData(loadOrders);

  async function handleAccept(orderId: string) {
    setActionError(null);
    setAcceptingOrderId(orderId);

    try {
      const response = await acceptOrder(orderId);
      navigate(`/orders/${response.order.id}`);
    } catch (error) {
      setActionError(
        error instanceof ApiClientError
          ? error.message
          : "Unable to accept this order.",
      );
    } finally {
      setAcceptingOrderId(null);
    }
  }

  return (
    <PageShell
      title="Order list"
      description="Choose an available campus request to accept."
      backTo={routes.kurirHome}
      action={null}
    >
      {isLoading ? <Notice>Loading available orders.</Notice> : null}
      {error ? (
        <Notice tone="error">
          <span>{error}</span>
          <button
            type="button"
            onClick={reload}
            className="mt-3 block font-sans text-sm font-semibold leading-5 text-campus-primary"
          >
            Try again
          </button>
        </Notice>
      ) : null}
      {actionError ? <Notice tone="error">{actionError}</Notice> : null}

      {data ? (
        <>
          <OrderListSection
            title="Available requests"
            caption="Self-owned requests are hidden from this pool."
          >
            {data.availableOrders.length > 0 ? (
              <div className="space-y-3">
                {data.availableOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    metaLabel="Requested"
                    action={
                      <SecondaryActionButton
                        type="button"
                        onClick={() => handleAccept(order.id)}
                        disabled={acceptingOrderId === order.id}
                        className="mt-3"
                      >
                        {acceptingOrderId === order.id
                          ? "Accepting"
                          : "Accept order"}
                      </SecondaryActionButton>
                    }
                  />
                ))}
              </div>
            ) : (
              <Notice>No available requests right now.</Notice>
            )}
          </OrderListSection>
        </>
      ) : null}
    </PageShell>
  );
}
