import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { routes } from '../app/routes'
import { PageShell } from '../components/layout/PageShell'
import { Notice } from '../components/layout/Notice'
import { RouteSummary } from '../components/orders/RouteSummary'
import { StatusChip } from '../components/orders/StatusChip'
import { OrderStateRenderer } from '../components/orders/OrderStateRenderer'
import { ApiClientError } from '../services/apiClient'
import {
  cancelOrder,
  getOrder,
  priceOrder,
} from '../services/ordersApi'
import {
  createChatSocketClient,
} from '../services/chatSocket'
import { useParsedOrder } from '../hooks/useParsedOrder'
import { useAuth } from '../state/AuthContext'
import { useSecurityCodes } from '../state/SecurityCodeContext'
import type { OrderDTO } from '../types/api'
import { formatDateTime, formatRupiah } from '../utils/format'
import { getOrderActor, getOrderTotal } from '../utils/orderState'

export function OrderDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const { getSecurityCode } = useSecurityCodes()
  const [order, setOrder] = useState<OrderDTO | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [actionError, setActionError] = useState('')
  const [socketError, setSocketError] = useState('')
  const [isMutating, setIsMutating] = useState(false)
  const [releasedOrderId, setReleasedOrderId] = useState<string | null>(null)

  const loadOrder = useCallback(async () => {
    if (!id) {
      setLoadError('Missing order ID.')
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setLoadError('')

    try {
      const response = await getOrder(id)
      setOrder(response.order)
      setReleasedOrderId(null)
    } catch (error) {
      setLoadError(getErrorMessage(error, 'Unable to load this order.'))
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    void Promise.resolve().then(loadOrder)
  }, [loadOrder])

  useEffect(() => {
    if (!id || loadError) {
      return
    }

    const orderId = id
    const client = createChatSocketClient()

    function handleConnect() {
      setSocketError('')
      client.joinRoom(orderId)
    }

    client.socket.on('connect', handleConnect)

    const removeRoomJoinedListener = client.onRoomJoined(() => {
      setSocketError('')
    })
    const removeOrderListener = client.onOrderStatusChanged((payload) => {
      if (payload.order.id === orderId) {
        setOrder(payload.order)
      }
    })
    const removeSocketErrorListener = client.onError((payload) => {
      setSocketError(payload.message)
    })

    client.connect()

    return () => {
      removeRoomJoinedListener()
      removeOrderListener()
      removeSocketErrorListener()
      client.socket.off('connect', handleConnect)
      client.cleanup()
    }
  }, [id, loadError])

  const actor = useMemo(() => {
    if (!order) {
      return 'VIEWER'
    }

    if (
      user &&
      order.status === 'PENDING' &&
      order.id === releasedOrderId &&
      order.buyer_id !== user.id
    ) {
      return 'KURIR'
    }

    return getOrderActor(order, user)
  }, [order, releasedOrderId, user])
  const backTo = actor === 'KURIR' ? routes.kurirHome : routes.buyerHome
  const securityCode = order ? getSecurityCode(order.id) : null
  const parsedOrder = useParsedOrder(order)

  async function mutateOrder(
    mutation: () => Promise<{ order: OrderDTO }>,
    fallbackMessage: string,
  ) {
    setIsMutating(true)
    setActionError('')

    try {
      const response = await mutation()
      setOrder(response.order)
      return response.order
    } catch (error) {
      setActionError(getErrorMessage(error, fallbackMessage))
      return null
    } finally {
      setIsMutating(false)
    }
  }

  function handleCancel() {
    if (!order) {
      return
    }

    mutateOrder(() => cancelOrder(order.id), 'Unable to cancel this order.')
  }

  async function handleRelease() {
    if (!order) {
      return
    }

    const releasedOrder = await mutateOrder(
      () => cancelOrder(order.id),
      'Unable to release this order.',
    )

    if (releasedOrder?.status === 'PENDING') {
      setReleasedOrderId(releasedOrder.id)
    }
  }

  async function handlePrice(payload: {
    item_price: number
    receipt_image_url?: string
  }) {
    if (!order) {
      return
    }

    await mutateOrder(
      () => priceOrder(order.id, payload),
      'Unable to submit this price.',
    )
  }

  return (
    <PageShell
      title="Order detail"
      description={order ? `Created ${formatDateTime(order.createdAt)}` : undefined}
      backTo={backTo}
      action={order ? <StatusChip status={order.status} /> : null}
    >
      {isLoading ? <Notice>Loading order details.</Notice> : null}

      {loadError ? (
        <Notice tone="error">
          <span>{loadError}</span>
          <button
            type="button"
            onClick={loadOrder}
            className="mt-3 block font-sans text-sm font-semibold leading-5 text-campus-primary"
          >
            Try again
          </button>
        </Notice>
      ) : null}

      {socketError && !loadError ? (
        <Notice tone="error">{socketError}</Notice>
      ) : null}

      {order ? (
        <>
          <RouteSummary
            origin={parsedOrder?.origin ?? undefined}
            destination={order.to_location}
            itemDescription={parsedOrder?.request ?? order.item_desc}
            deliveryFeeLabel={formatRupiah(order.delivery_fee)}
          />

          <OrderMetaGrid
            buyerEmail={order.buyer_email}
            kurirEmail={order.kurir_email}
            totalLabel={
              order.item_price === null
                ? 'Pending'
                : formatRupiah(getOrderTotal(order))
            }
          />

          <OrderStateRenderer
            order={order}
            actor={actor}
            securityCode={securityCode}
            isMutating={isMutating}
            actionError={actionError}
            onCancel={handleCancel}
            onRelease={handleRelease}
            onPrice={handlePrice}
          />
        </>
      ) : null}
    </PageShell>
  )
}

function OrderMetaGrid({
  buyerEmail,
  kurirEmail,
  totalLabel,
}: {
  buyerEmail: string | null
  kurirEmail: string | null
  totalLabel: string
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <MetaTile label="Buyer" value={buyerEmail ?? 'Unknown'} />
      <MetaTile label="Kurir" value={kurirEmail ?? 'Not assigned'} />
      <MetaTile label="Total" value={totalLabel} />
      <MetaTile label="Delivery" value="Fixed fee" />
    </div>
  )
}

function MetaTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-campus-outline/60 bg-campus-card p-3 shadow-card">
      <p className="font-sans text-xs font-semibold uppercase leading-4 tracking-wider text-campus-muted">
        {label}
      </p>
      <p className="mt-1 truncate font-sans text-xs font-semibold leading-5 text-campus-text">
        {value}
      </p>
    </div>
  )
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof ApiClientError ? error.message : fallback
}
