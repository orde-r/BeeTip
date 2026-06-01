import { useCallback } from "react";
import { PrimaryActionButton } from "../components/actions/ActionButton";
import { PageShell } from "../components/layout/PageShell";
import { VelocityBottomNav } from "../components/layout/VelocityBottomNav";
import { Notice } from "../components/layout/Notice";
import { OrderCard } from "../components/orders/OrderCard";
import { OrderListSection } from "../components/orders/OrderListSection";
import { BalanceSummary } from "../components/wallet/BalanceSummary";
import { routes } from "../app/routes";
import { getMyOrders } from "../services/ordersApi";
import { useAuth } from "../store";
import type { OrderDTO, UserDTO } from "../types/api";
import { useDashboardData } from "../hooks/useDashboardData";

const activeBuyerStatuses = new Set<OrderDTO["status"]>([
  "PENDING",
  "ACCEPTED",
  "PRICED",
  "PAID",
]);

type BuyerDashboardData = {
  user: UserDTO;
  orders: OrderDTO[];
  activeOrders: OrderDTO[];
};

export function BuyerHomeContent({
  showInlineAction = true,
}: {
  showInlineAction?: boolean;
}) {
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
    const activeOrders = buyerOrders.filter((order) =>
      activeBuyerStatuses.has(order.status),
    );

    return {
      user: refreshedUser,
      orders: buyerOrders,
      activeOrders,
    };
  }, [refreshUser]);

  const { data, error, isLoading, reload } = useDashboardData(loadDashboard);

  return (
    <>
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
          <BalanceSummary
            balance={data.user.balance}
            label="Buyer wallet"
            caption="Available for current requests and payments."
            showStatus={false}
          />

          <OrderListSection
            title={
              data.activeOrders.length > 1 ? "Active orders" : "Active order"
            }
            caption="Track buyer requests that still need action."
          >
            {data.activeOrders.length > 0 ? (
              <div className="space-y-3">
                {data.activeOrders.map((order) => (
                  <OrderCard key={order.id} order={order} to={`/orders/${order.id}`} />
                ))}
              </div>
            ) : (
              <Notice>
                No active buyer orders. Create a request when you need help on campus.
              </Notice>
            )}
          </OrderListSection>

          {showInlineAction ? (
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
          ) : null}
        </>
      ) : null}
    </>
  );
}

export function BuyerHomePage() {
  return (
    <PageShell
      title="Create Order"
      description="Create requests and track your campus deliveries."
      action={null}
    >
      <BuyerHomeContent />
      <VelocityBottomNav />
    </PageShell>
  );
}
