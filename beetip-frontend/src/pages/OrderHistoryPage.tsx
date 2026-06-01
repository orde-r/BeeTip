import { useCallback, useState } from 'react'
import { GhostActionButton } from '../components/actions/ActionButton'
import { PageShell } from '../components/layout/PageShell'
import { VelocityBottomNav } from '../components/layout/VelocityBottomNav'
import { Notice } from '../components/layout/Notice'
import { OrderCard } from '../components/orders/OrderCard'
import { OrderListSection } from '../components/orders/OrderListSection'
import { getMyOrders } from '../services/ordersApi'
import { useAuth } from '../store'
import type { OrderDTO, UserDTO } from '../types/api'
import { useDashboardData } from '../hooks/useDashboardData'
import { cn } from '../utils/className'

type OrderHistoryMode = 'buyer' | 'kurir'

type OrderHistoryData = {
  user: UserDTO
  buyerOrders: OrderDTO[]
  kurirOrders: OrderDTO[]
}

const historyStatuses = new Set<OrderDTO['status']>([
  'COMPLETED',
  'CANCELLED',
])

export function OrderHistoryPage() {
  const { refreshUser } = useAuth()
  const [mode, setMode] = useState<OrderHistoryMode>('buyer')

  const loadHistory = useCallback(async (): Promise<OrderHistoryData> => {
    const currentUser = await refreshUser()

    if (!currentUser) {
      throw new Error('Unable to load current account.')
    }

    const ordersResponse = await getMyOrders()

    return {
      user: currentUser,
      buyerOrders: sortOrders(
        ordersResponse.orders.filter((order) => order.buyer_id === currentUser.id),
      ),
      kurirOrders: sortOrders(
        ordersResponse.orders.filter((order) => order.kurir_id === currentUser.id),
      ),
    }
  }, [refreshUser])

  const { data, error, isLoading, reload } = useDashboardData(loadHistory)
  const selectedOrders =
    mode === 'buyer' ? data?.buyerOrders ?? [] : data?.kurirOrders ?? []
  const historicalOrders = selectedOrders.filter((order) =>
    historyStatuses.has(order.status),
  )

  return (
    <PageShell
      title="Order history"
      description="Review completed orders, cancelled orders, and chat history."
      isTopBarSticky={false}
      action={null}
    >
      <OrderHistoryTabs mode={mode} onChange={setMode} />

      {isLoading ? <Notice>Loading order history.</Notice> : null}
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
        <OrderListSection
          title="History"
          caption="Completed and cancelled orders stay available here."
        >
          {historicalOrders.length > 0 ? (
            <OrderHistoryList orders={historicalOrders} user={data.user} />
          ) : (
            <Notice>No {mode} order history yet.</Notice>
          )}
        </OrderListSection>
      ) : null}

      <VelocityBottomNav />
    </PageShell>
  )
}

function OrderHistoryTabs({
  mode,
  onChange,
}: {
  mode: OrderHistoryMode
  onChange: (mode: OrderHistoryMode) => void
}) {
  return (
    <div
      aria-label="Order history role"
      className="grid grid-cols-2 rounded-2xl border border-campus-outline bg-campus-card p-1 shadow-card"
      role="tablist"
    >
      <OrderHistoryTab
        isSelected={mode === 'buyer'}
        label="Buyer"
        onClick={() => onChange('buyer')}
      />
      <OrderHistoryTab
        isSelected={mode === 'kurir'}
        label="Kurir"
        onClick={() => onChange('kurir')}
      />
    </div>
  )
}

function OrderHistoryTab({
  isSelected,
  label,
  onClick,
}: {
  isSelected: boolean
  label: string
  onClick: () => void
}) {
  return (
    <button
      aria-selected={isSelected}
      className={cn(
        'min-h-10 rounded-xl px-3 font-sans text-sm font-semibold leading-5 transition',
        isSelected
          ? 'bg-campus-primary-fixed text-campus-primary-fixed-text'
          : 'text-campus-muted',
      )}
      onClick={onClick}
      role="tab"
      type="button"
    >
      {label}
    </button>
  )
}

function OrderHistoryList({
  orders,
  user,
}: {
  orders: OrderDTO[]
  user: UserDTO
}) {
  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <div key={order.id} className="space-y-2">
          <OrderCard
            order={order}
            to={`/orders/${order.id}`}
            metaLabel={order.buyer_id === user.id ? 'Buyer' : 'Kurir'}
            muted
          />
          {hasChatContext(order) ? (
            <GhostActionButton
              to={`/orders/${order.id}/chat`}
              className="min-h-10 rounded-xl text-xs"
            >
              View chat history
            </GhostActionButton>
          ) : null}
        </div>
      ))}
    </div>
  )
}

function sortOrders(orders: OrderDTO[]) {
  return [...orders].sort(
    (firstOrder, secondOrder) =>
      new Date(secondOrder.createdAt).getTime() -
      new Date(firstOrder.createdAt).getTime(),
  )
}

function hasChatContext(order: OrderDTO) {
  const hasConnectedKurir = Boolean(order.kurir_id)

  return (
    hasConnectedKurir &&
    (order.status === 'ACCEPTED' ||
      order.status === 'PRICED' ||
      order.status === 'PAID' ||
      order.status === 'COMPLETED' ||
      order.status === 'CANCELLED')
  )
}
