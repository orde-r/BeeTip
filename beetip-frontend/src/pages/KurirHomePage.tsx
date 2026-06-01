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
import { useAuth } from '../store'
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
  completedDeliveries: OrderDTO[]
  earningTotal: number
}

const earningPerCompletedDelivery = 5000

export function KurirHomeContent({
  showInlineAction = true,
}: {
  showInlineAction?: boolean
}) {
  const { refreshUser } = useAuth()

  const loadDashboard = useCallback(async (): Promise<KurirDashboardData> => {
    const currentUser = await refreshUser()

    if (!currentUser) {
      throw new Error('Unable to load current account.')
    }

    const myOrdersResponse = await getMyOrders()
    const kurirOrders = myOrdersResponse.orders.filter(
      (order) => order.kurir_id === currentUser.id,
    )
    const activeDeliveries = kurirOrders.filter(
      (order) => activeKurirStatuses.has(order.status),
    )
    const completedDeliveries = kurirOrders.filter(
      (order) => order.status === 'COMPLETED',
    )
    const earningTotal = completedDeliveries.length * earningPerCompletedDelivery

    return {
      user: currentUser,
      activeDeliveries,
      completedDeliveries,
      earningTotal,
    }
  }, [refreshUser])

  const { data, error, isLoading, reload } = useDashboardData(loadDashboard)

  return (
    <>
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
            title={
              data.activeDeliveries.length > 1
                ? 'Active deliveries'
                : 'Active delivery'
            }
            caption="Track kurir orders that still need action."
          >
            {data.activeDeliveries.length > 0 ? (
              <div className="space-y-3">
                {data.activeDeliveries.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    to={`/orders/${order.id}`}
                    metaLabel="Accepted"
                  />
                ))}
              </div>
            ) : (
              <Notice>
                No active kurir deliveries. Accept a request when you are ready
                to help.
              </Notice>
            )}
          </OrderListSection>

          {showInlineAction ? (
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
          ) : null}
        </>
      ) : null}
    </>
  )
}

export function KurirHomePage() {
  return (
    <PageShell
      title="Accept Orders"
      description="Find available requests and track active deliveries."
      action={null}
    >
      <KurirHomeContent />
      <VelocityBottomNav />
    </PageShell>
  )
}
