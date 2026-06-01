import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { routes } from '../app/routes'
import {
  GhostActionButton,
  PrimaryActionButton,
} from '../components/actions/ActionButton'
import { FormField } from '../components/auth/FormField'
import { PageShell } from '../components/layout/PageShell'
import { Notice } from '../components/layout/Notice'
import { SurfaceCard } from '../components/layout/SurfaceCard'
import { RouteSummary } from '../components/orders/RouteSummary'
import { ReceiptPreview } from '../components/orders/ReceiptPreview'
import { SecurityCodePanel } from '../components/orders/SecurityCodePanel'
import { StatusChip } from '../components/orders/StatusChip'
import { OrderStateRenderer } from '../components/orders/OrderStateRenderer'
import { ApiClientError } from '../services/apiClient'
import {
  cancelOrder,
  completeOrder,
  getOrder,
  normalizeOrder,
  payOrder,
  priceOrder,
} from '../services/ordersApi'
import {
  createChatSocketClient,
} from '../services/chatSocket'
import { useAuth, useSecurityCodes } from '../store'
import type { OrderDTO } from '../types/api'
import { formatDateTime, formatRupiah } from '../utils/format'
import { getOrderActor, getOrderTotal } from '../utils/orderState'

export function OrderDetailPage() {
  const { id } = useParams()
  const { refreshUser, user } = useAuth()
  const { getSecurityCode, saveSecurityCode } = useSecurityCodes()
  const [order, setOrder] = useState<OrderDTO | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [actionError, setActionError] = useState('')
  const [paymentError, setPaymentError] = useState('')
  const [isPaymentOpen, setIsPaymentOpen] = useState(false)
  const [isPaying, setIsPaying] = useState(false)
  const [isSecurityOpen, setIsSecurityOpen] = useState(false)
  const [securityCodeInput, setSecurityCodeInput] = useState('')
  const [securityError, setSecurityError] = useState('')
  const [isCompleting, setIsCompleting] = useState(false)
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
      const [response] = await Promise.all([getOrder(id), refreshUser()])
      setOrder(response.order)
      setReleasedOrderId(null)
    } catch (error) {
      setLoadError(getErrorMessage(error, 'Unable to load this order.'))
    } finally {
      setIsLoading(false)
    }
  }, [id, refreshUser])

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
      const updatedOrder = normalizeOrder(payload.order)

      if (updatedOrder.id === orderId) {
        setOrder(updatedOrder)
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

  async function handlePay() {
    if (!order || isPaying) {
      return
    }

    setIsPaying(true)
    setPaymentError('')

    try {
      const response = await payOrder(order.id)
      saveSecurityCode(order.id, response.security_code)
      setOrder(response.order)
      setIsPaymentOpen(false)
      await refreshUser()
    } catch (error) {
      setPaymentError(getErrorMessage(error, 'Unable to complete payment.'))
    } finally {
      setIsPaying(false)
    }
  }

  function openSecurityModal() {
    setSecurityCodeInput('')
    setSecurityError('')
    setIsSecurityOpen(true)
  }

  function closeSecurityModal() {
    if (isCompleting) {
      return
    }
    setIsSecurityOpen(false)
    setSecurityCodeInput('')
    setSecurityError('')
  }

  async function handleComplete() {
    if (!order || isCompleting) {
      return
    }

    const trimmedCode = securityCodeInput.trim()
    if (!trimmedCode) {
      setSecurityError('Security code is required.')
      return
    }

    setIsCompleting(true)
    setSecurityError('')

    try {
      const response = await completeOrder(order.id, {
        security_code: trimmedCode,
      })
      setOrder(response.order)
      await refreshUser()
      setIsSecurityOpen(false)
      setSecurityCodeInput('')
    } catch (error) {
      setSecurityError(
        getErrorMessage(error, 'Unable to complete this order.'),
      )
    } finally {
      setIsCompleting(false)
    }
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
            origin={order.from_location || undefined}
            destination={order.to_location}
            itemDescription={order.item_desc}
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

          {order.receipt_image_url ? (
            <ReceiptPreview receiptImageUrl={order.receipt_image_url} />
          ) : null}

          <OrderStateRenderer
            order={order}
            actor={actor}
            securityCode={securityCode}
            isMutating={isMutating}
            actionError={actionError}
            onCancel={handleCancel}
            onRelease={handleRelease}
            onPay={() => {
              setPaymentError('')
              setIsPaymentOpen(true)
            }}
            onComplete={openSecurityModal}
            onPrice={handlePrice}
          />

          {isPaymentOpen ? (
            <PaymentConfirmationModal
              balance={user?.balance ?? 0}
              isPaying={isPaying}
              order={order}
              paymentError={paymentError}
              securityCode={getSecurityCode(order.id)}
              onClose={() => setIsPaymentOpen(false)}
              onConfirm={handlePay}
            />
          ) : null}

          {isSecurityOpen ? (
            <SecurityCodeModal
              isCompleting={isCompleting}
              securityCode={securityCodeInput}
              securityError={securityError}
              onClose={closeSecurityModal}
              onConfirm={handleComplete}
              onSecurityCodeChange={(next) => {
                setSecurityCodeInput(next)
                if (securityError) {
                  setSecurityError('')
                }
              }}
            />
          ) : null}
        </>
      ) : null}
    </PageShell>
  )
}

function PaymentConfirmationModal({
  balance,
  isPaying,
  order,
  paymentError,
  securityCode,
  onClose,
  onConfirm,
}: {
  balance: number
  isPaying: boolean
  order: OrderDTO
  paymentError: string
  securityCode: string | null
  onClose: () => void
  onConfirm: () => void
}) {
  const total = order.item_price === null ? 0 : getOrderTotal(order)
  const hasEnoughBalance = balance >= total
  const canPay = order.status === 'PRICED' && total > 0 && hasEnoughBalance

  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-campus-text/40 px-4 py-5">
      <SurfaceCard className="w-full max-w-mobile rounded-3xl shadow-floating">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="font-heading text-xl font-semibold leading-7 text-campus-text">
              Confirm payment
            </p>
            <p className="mt-1 font-sans text-sm leading-5 text-campus-muted">
              Review the total before releasing funds.
            </p>
          </div>
          <button
            aria-label="Close payment confirmation"
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-campus-outline bg-campus-card font-sans text-lg leading-none text-campus-primary"
            onClick={onClose}
            type="button"
          >
            x
          </button>
        </div>

        <div className="mt-4 grid gap-4">
          <div className="rounded-xl bg-campus-background p-3">
            <PaymentRow
              label="Item price"
              value={
                order.item_price === null
                  ? 'Waiting'
                  : formatRupiah(order.item_price)
              }
            />
            <PaymentRow
              label="Delivery fee"
              value={formatRupiah(order.delivery_fee)}
            />
            <PaymentRow label="Wallet balance" value={formatRupiah(balance)} />
            <PaymentRow
              label="Amount due"
              value={total > 0 ? formatRupiah(total) : 'Pending'}
            />
            {!hasEnoughBalance && total > 0 ? (
              <p className="mt-3 font-sans text-sm leading-5 text-campus-error">
                Balance is too low for this payment.
              </p>
            ) : null}
          </div>

          {securityCode ? <SecurityCodePanel code={securityCode} /> : null}
          {paymentError ? <Notice tone="error">{paymentError}</Notice> : null}

          <div className="grid gap-3">
            <PrimaryActionButton
              type="button"
              disabled={!canPay || isPaying}
              onClick={onConfirm}
            >
              {isPaying ? 'Paying...' : 'Confirm and pay'}
            </PrimaryActionButton>
            {!hasEnoughBalance && total > 0 ? (
              <GhostActionButton to={routes.wallet}>Top up wallet</GhostActionButton>
            ) : null}
            <GhostActionButton type="button" onClick={onClose}>
              Cancel
            </GhostActionButton>
          </div>
        </div>
      </SurfaceCard>
    </div>
  )
}

function PaymentRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1">
      <span className="font-sans text-sm leading-5 text-campus-muted">
        {label}
      </span>
      <span className="font-sans text-sm font-semibold leading-5 text-campus-text">
        {value}
      </span>
    </div>
  )
}

function SecurityCodeModal({
  isCompleting,
  securityCode,
  securityError,
  onClose,
  onConfirm,
  onSecurityCodeChange,
}: {
  isCompleting: boolean
  securityCode: string
  securityError: string
  onClose: () => void
  onConfirm: () => void
  onSecurityCodeChange: (next: string) => void
}) {
  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-campus-text/40 px-4 py-5">
      <SurfaceCard className="w-full max-w-mobile rounded-3xl shadow-floating">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="font-heading text-xl font-semibold leading-7 text-campus-text">
              Confirm handoff
            </p>
            <p className="mt-1 font-sans text-sm leading-5 text-campus-muted">
              Enter the buyer's code after they receive the item.
            </p>
          </div>
          <button
            aria-label="Close security code"
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-campus-outline bg-campus-card font-sans text-lg leading-none text-campus-primary"
            onClick={onClose}
            type="button"
            disabled={isCompleting}
          >
            x
          </button>
        </div>

        <div className="mt-4 grid gap-4">
          <FormField
            id="security_code_modal"
            name="security_code"
            label="Security code"
            placeholder="123456"
            helperText="Ask the buyer for the one-time handoff code."
            inputMode="numeric"
            maxLength={12}
            value={securityCode}
            onChange={(event) => onSecurityCodeChange(event.target.value)}
            disabled={isCompleting}
            autoFocus
          />

          {securityError ? <Notice tone="error">{securityError}</Notice> : null}

          <div className="grid gap-3">
            <PrimaryActionButton
              type="button"
              onClick={onConfirm}
              disabled={isCompleting || securityCode.trim().length === 0}
            >
              {isCompleting ? 'Completing...' : 'Complete delivery'}
            </PrimaryActionButton>
            <GhostActionButton
              type="button"
              onClick={onClose}
              disabled={isCompleting}
            >
              Cancel
            </GhostActionButton>
          </div>
        </div>
      </SurfaceCard>
    </div>
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
