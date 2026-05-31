import { useCallback } from 'react'
import { PageShell } from '../components/layout/PageShell'
import { VelocityBottomNav } from '../components/layout/VelocityBottomNav'
import { Notice } from '../components/layout/Notice'
import { OrderCard } from '../components/orders/OrderCard'
import { OrderListSection } from '../components/orders/OrderListSection'
import { getMyOrders } from '../services/ordersApi'
import { useAuth } from '../state/AuthContext'
import type { OrderDTO, UserDTO } from '../types/api'
import { useDashboardData } from '../hooks/useDashboardData'

type ChatInboxData = {
  user: UserDTO
  chatOrders: OrderDTO[]
}

export function ChatInboxPage() {
  const { refreshUser } = useAuth()

  const loadInbox = useCallback(async (): Promise<ChatInboxData> => {
    const currentUser = await refreshUser()

    if (!currentUser) {
      throw new Error('Unable to load current account.')
    }

    const ordersResponse = await getMyOrders()

    return {
      user: currentUser,
      chatOrders: deriveChatOrders(ordersResponse.orders, currentUser),
    }
  }, [refreshUser])

  const { data, error, isLoading, reload } = useDashboardData(loadInbox)

  return (
    <PageShell
      title="Chats"
      description="Conversations from your order history."
      action={null}
    >
      {isLoading ? <Notice>Loading chats.</Notice> : null}
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
          title="Order chats"
          caption="Active conversations appear first; completed and cancelled orders stay available as history."
        >
          {data.chatOrders.length > 0 ? (
            <div className="space-y-3">
              {data.chatOrders.map((order) => {
                const isInactive = !isActiveChatOrder(order)

                return (
                  <OrderCard
                    key={order.id}
                    order={order}
                    to={`/orders/${order.id}/chat`}
                    metaLabel={order.buyer_id === data.user.id ? 'Buyer' : 'Kurir'}
                    muted={isInactive}
                  />
                )
              })}
            </div>
          ) : (
            <Notice>No chat history.</Notice>
          )}
        </OrderListSection>
      ) : null}

      <VelocityBottomNav />
    </PageShell>
  )
}

function deriveChatOrders(orders: OrderDTO[], user: UserDTO) {
  return orders
    .filter((order) => hasChatContext(order, user))
    .sort((firstOrder, secondOrder) => {
      const firstActiveScore = isActiveChatOrder(firstOrder) ? 0 : 1
      const secondActiveScore = isActiveChatOrder(secondOrder) ? 0 : 1

      if (firstActiveScore !== secondActiveScore) {
        return firstActiveScore - secondActiveScore
      }

      return (
        new Date(secondOrder.createdAt).getTime() -
        new Date(firstOrder.createdAt).getTime()
      )
    })
}

function hasChatContext(order: OrderDTO, user: UserDTO) {
  const userIsParticipant =
    order.buyer_id === user.id || order.kurir_id === user.id
  const hasConnectedKurir = Boolean(order.kurir_id)
  const hasActiveChat = isActiveChatOrder(order)
  const hasHistoricalChat =
    order.status === 'COMPLETED' || order.status === 'CANCELLED'

  return (
    userIsParticipant &&
    hasConnectedKurir &&
    (hasActiveChat || hasHistoricalChat)
  )
}

function isActiveChatOrder(order: OrderDTO) {
  return (
    order.status === 'ACCEPTED' ||
    order.status === 'PRICED' ||
    order.status === 'PAID'
  )
}
