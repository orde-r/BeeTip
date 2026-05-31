import { useCallback } from 'react'
import { PrimaryActionButton } from '../components/actions/ActionButton'
import { PageShell } from '../components/layout/PageShell'
import { VelocityBottomNav } from '../components/layout/VelocityBottomNav'
import { Notice } from '../components/layout/Notice'
import { OrderCard } from '../components/orders/OrderCard'
import { OrderListSection } from '../components/orders/OrderListSection'
import { EarningsCard } from '../components/wallet/EarningsCard'
import { routes } from '../app/routes'
import { getMyOrders } from '../services/ordersApi'
import { getHistory } from '../services/transactionsApi'
import { useAuth } from '../state/AuthContext'
import type { OrderDTO, UserDTO } from '../types/api'
import { useDashboardData } from '../hooks/useDashboardData'

const activeKurirStatuses = new Set<OrderDTO['status']>([
  'ACCEPTED',
  'PRICED',
  'PAID',
])

type KurirDashboardData = {
  user: UserDTO
  activeDeliveries: OrderDTO[]
  activeDelivery: OrderDTO | null
  completedDeliveries: OrderDTO[]
  recentOrders: OrderDTO[]
  earningTotal: number
}

export function KurirHomePage() {
  const { refreshUser } = useAuth()

  const loadDashboard = useCallback(async (): Promise<KurirDashboardData> => {
    const currentUser = await refreshUser()

    if (!currentUser) {
      throw new Error('Unable to load current account.')
    }

    const [myOrdersResponse, historyResponse] = await Promise.all([
      getMyOrders(),
      getHistory().catch(() => null),
    ])
    const kurirOrders = myOrdersResponse.orders.filter(
      (order) => order.kurir_id === currentUser.id,
    )
    const activeDeliveries = kurirOrders.filter(
      (order) => activeKurirStatuses.has(order.status),
    )
    const activeDelivery = activeDeliveries[0] ?? null
    const completedDeliveries = kurirOrders.filter(
      (order) => order.status === 'COMPLETED',
    )
    const recentOrders = activeDelivery
      ? kurirOrders.filter((order) => order.id !== activeDelivery.id)
      : kurirOrders
    const earningTotal =
      historyResponse?.transactions
        .filter((transaction) => transaction.type === 'EARNING')
        .reduce((total, transaction) => total + transaction.amount, 0) ?? 0

    return {
      user: currentUser,
      activeDeliveries,
      activeDelivery,
      completedDeliveries,
      recentOrders,
      earningTotal,
    }
  }, [refreshUser])

  const { data, error, isLoading, reload } = useDashboardData(loadDashboard)

  return (
    <PageShell
      title="Accept Orders"
      description="Find available requests and track active deliveries."
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

      {data ? (
        <>
          <EarningsCard
            activeDeliveries={data.activeDeliveries.length}
            completedDeliveries={data.completedDeliveries.length}
            earningTotal={data.earningTotal}
          />

          <OrderListSection
            title="Active delivery"
            caption="Track the order you are currently handling."
          >
            {data.activeDelivery ? (
              <OrderCard
                order={data.activeDelivery}
                to={`/orders/${data.activeDelivery.id}`}
                metaLabel="Accepted"
              />
            ) : (
              <Notice>No active order.</Notice>
            )}
          </OrderListSection>

          <PrimaryActionButton
            to={routes.kurirOrders}
            className="min-h-16 rounded-2xl px-5 py-4 text-left text-base shadow-floating"
          >
            <div className="flex w-full items-center justify-between gap-4">
              <span className="min-w-0 flex-1 text-md">Accept new order</span>
              <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-campus-on-primary/20 text-xl leading-none">
                +
              </span>
            </div>
          </PrimaryActionButton>

          <OrderListSection
            title="Recent kurir orders"
            caption="Orders you accepted or completed appear here."
          >
            {data.recentOrders.length > 0 ? (
              <div className="space-y-3">
                {data.recentOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    to={`/orders/${order.id}`}
                    metaLabel="Updated"
                  />
                ))}
              </div>
            ) : (
              <Notice>No recent kurir orders yet.</Notice>
            )}
          </OrderListSection>
        </>
      ) : null}

      <VelocityBottomNav />
    </PageShell>
  )
}
