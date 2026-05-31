import { useCallback } from "react";
import { PrimaryActionButton } from "../components/actions/ActionButton";
import { PageShell } from "../components/layout/PageShell";
import { VelocityBottomNav } from "../components/layout/VelocityBottomNav";
import { Notice } from "../components/layout/Notice";
import { OrderCard } from "../components/orders/OrderCard";
import { OrderListSection } from "../components/orders/OrderListSection";
import { routes } from "../app/routes";
import { getMyOrders } from "../services/ordersApi";
import { useAuth } from "../state/AuthContext";
import type { OrderDTO } from "../types/api";
import { useDashboardData } from "../hooks/useDashboardData";

const activeBuyerStatuses = new Set<OrderDTO["status"]>([
  "PENDING",
  "ACCEPTED",
  "PRICED",
  "PAID",
]);

type BuyerDashboardData = {
  orders: OrderDTO[];
  activeOrder: OrderDTO | null;
  recentOrders: OrderDTO[];
};

export function BuyerHomePage() {
  const { refreshUser } = useAuth();

  const loadDashboard = useCallback(async (): Promise<BuyerDashboardData> => {
    const refreshedUser = await refreshUser();

    if (!refreshedUser) {
      throw new Error("Unable to load current account.");
    }

    const ordersResponse = await getMyOrders();
    const buyerOrders = ordersResponse.orders.filter(
      (order) => order.buyer_id === refreshedUser.id,
    );
    const activeOrder =
      buyerOrders.find((order) => activeBuyerStatuses.has(order.status)) ??
      null;
    const recentOrders = activeOrder
      ? buyerOrders.filter((order) => order.id !== activeOrder.id)
      : buyerOrders;

    return {
      orders: buyerOrders,
      activeOrder,
      recentOrders,
    };
  }, [refreshUser]);

  const { data, error, isLoading, reload } = useDashboardData(loadDashboard);

  return (
    <PageShell
      title="Create Order"
      description="Create requests and track your campus deliveries."
      action={null}
    >
      {isLoading ? <Notice>Loading your dashboard.</Notice> : null}
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

      {data ? (
        <>
          <OrderListSection
            title="Active order"
            caption="Track your current buyer request."
          >
            {data.activeOrder ? (
              <OrderCard
                order={data.activeOrder}
                to={`/orders/${data.activeOrder.id}`}
              />
            ) : (
              <Notice>
                No active order. Create a request when you need help on campus.
              </Notice>
            )}
          </OrderListSection>

          <PrimaryActionButton
            to={routes.createOrder}
            className="min-h-16 rounded-2xl px-5 py-4 text-left text-base shadow-floating"
          >
            <div className="flex w-full items-center justify-between gap-4">
              <span className="min-w-0 flex-1 text-md">Create new order</span>
              <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-campus-on-primary/20 text-xl leading-none">
                +
              </span>
            </div>
          </PrimaryActionButton>

          <OrderListSection
            title="Order history"
            caption="Newest buyer orders appear first."
          >
            {data.recentOrders.length > 0 ? (
              <div className="space-y-3">
                {data.recentOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    to={`/orders/${order.id}`}
                  />
                ))}
              </div>
            ) : (
              <Notice>
                {data.orders.length > 0
                  ? "No older orders yet."
                  : "No orders yet. Create your first request when you need help on campus."}
              </Notice>
            )}
          </OrderListSection>
        </>
      ) : null}

      <VelocityBottomNav />
    </PageShell>
  );
}
