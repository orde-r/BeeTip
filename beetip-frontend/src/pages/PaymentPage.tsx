import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  GhostActionButton,
  PrimaryActionButton,
} from '../components/actions/ActionButton'
import { PageShell } from '../components/layout/PageShell'
import { Notice } from '../components/layout/Notice'
import { SurfaceCard } from '../components/layout/SurfaceCard'
import { PriceBreakdown } from '../components/orders/PriceBreakdown'
import { RouteSummary } from '../components/orders/RouteSummary'
import { SecurityCodePanel } from '../components/orders/SecurityCodePanel'
import { StatusChip } from '../components/orders/StatusChip'
import { PaymentMethodCard } from '../components/wallet/PaymentMethodCard'
import { routes } from '../app/routes'
import { ApiClientError } from '../services/apiClient'
import { getOrder, payOrder } from '../services/ordersApi'
import { useAuth, useSecurityCodes } from '../store'
import type { OrderDTO, UserDTO } from '../types/api'
import { formatRupiah } from '../utils/format'
import { getOrderActor, getOrderTotal } from '../utils/orderState'

export function PaymentPage() {
  const { id } = useParams()
  const { refreshUser } = useAuth()
  const { getSecurityCode, saveSecurityCode } = useSecurityCodes()
  const [order, setOrder] = useState<OrderDTO | null>(null)
  const [account, setAccount] = useState<UserDTO | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isPaying, setIsPaying] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [payError, setPayError] = useState('')

  const loadPayment = useCallback(async () => {
    if (!id) {
      setLoadError('Missing order ID.')
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setLoadError('')

    try {
      const [orderResponse, refreshedUser] = await Promise.all([
        getOrder(id),
        refreshUser(),
      ])
      setOrder(orderResponse.order)
      setAccount(refreshedUser)
    } catch (error) {
      setLoadError(getErrorMessage(error, 'Unable to load payment details.'))
    } finally {
      setIsLoading(false)
    }
  }, [id, refreshUser])

  useEffect(() => {
    void Promise.resolve().then(loadPayment)
  }, [loadPayment])

  const actor = useMemo(
    () => (order ? getOrderActor(order, account) : 'VIEWER'),
    [account, order],
  )
  const securityCode = order ? getSecurityCode(order.id) : null
  const total = order && order.item_price !== null ? getOrderTotal(order) : 0
  const hasEnoughBalance = account ? account.balance >= total : false
  const canShowTopUpPath =
    actor === 'BUYER' &&
    order?.status === 'PRICED' &&
    order.item_price !== null &&
    !hasEnoughBalance
  const canPay =
    Boolean(order) &&
    actor === 'BUYER' &&
    order?.status === 'PRICED' &&
    order.item_price !== null &&
    hasEnoughBalance

  async function handlePay() {
    if (!order || !canPay) {
      return
    }

    setIsPaying(true)
    setPayError('')

    try {
      const response = await payOrder(order.id)
      saveSecurityCode(order.id, response.security_code)
      setOrder(response.order)
      const refreshedUser = await refreshUser()
      setAccount(refreshedUser ?? account)
    } catch (error) {
      setPayError(getErrorMessage(error, 'Unable to complete payment.'))
    } finally {
      setIsPaying(false)
    }
  }

  return (
    <PageShell
      title="Payment"
      description="Review the final price before releasing funds."
      backTo={id ? `/orders/${id}` : routes.buyerHome}
      action={order ? <StatusChip status={order.status} /> : null}
    >
      {isLoading ? <Notice>Loading payment details.</Notice> : null}

      {loadError ? (
        <Notice tone="error">
          <span>{loadError}</span>
          <button
            type="button"
            onClick={loadPayment}
            className="mt-3 block font-sans text-sm font-semibold leading-5 text-campus-primary"
          >
            Try again
          </button>
        </Notice>
      ) : null}

      {order ? (
        <>
          <RouteSummary
            origin={order.from_location || undefined}
          destination={order.to_location}
          itemDescription={order.item_desc}
            deliveryFeeLabel={formatRupiah(order.delivery_fee)}
          />
          
          <PaymentMethodCard balanceLabel={formatRupiah(account?.balance ?? 0)} />
          <PriceBreakdown order={order} />

          <BalanceCheck
            balance={account?.balance ?? 0}
            total={total}
            hasEnoughBalance={hasEnoughBalance}
          />

          {actor !== 'BUYER' ? (
            <Notice tone="error">
              Only the buyer assigned to this order can pay.
            </Notice>
          ) : null}

          {actor === 'BUYER' && order.status !== 'PRICED' && order.status !== 'PAID' ? (
            <Notice>This order is not ready for payment yet.</Notice>
          ) : null}

          {payError ? <Notice tone="error">{payError}</Notice> : null}

          {order.status === 'PAID' ? (
            <SecurityCodePanel code={securityCode} />
          ) : (
            <div className="grid gap-3">
              <PrimaryActionButton
                type="button"
                onClick={handlePay}
                disabled={!canPay || isPaying}
              >
                {isPaying ? 'Paying...' : 'Pay and reveal code'}
              </PrimaryActionButton>
              {canShowTopUpPath ? (
                <GhostActionButton to={routes.wallet}>Top up wallet</GhostActionButton>
              ) : null}
            </div>
          )}
        </>
      ) : null}
    </PageShell>
  )
}

function BalanceCheck({
  balance,
  total,
  hasEnoughBalance,
}: {
  balance: number
  total: number
  hasEnoughBalance: boolean
}) {
  return (
    <SurfaceCard className="grid gap-3">
      <div className="flex items-center justify-between gap-3">
        <span className="font-sans text-sm leading-5 text-campus-muted">
          Wallet balance
        </span>
        <span className="font-sans text-sm font-semibold leading-5 text-campus-text">
          {formatRupiah(balance)}
        </span>
      </div>
      <div className="flex items-center justify-between gap-3">
        <span className="font-sans text-sm leading-5 text-campus-muted">
          Amount due
        </span>
        <span className="font-sans text-sm font-semibold leading-5 text-campus-text">
          {total > 0 ? formatRupiah(total) : 'Pending'}
        </span>
      </div>
      {!hasEnoughBalance && total > 0 ? (
        <p className="font-sans text-sm leading-5 text-campus-error">
          Balance is too low for this payment.
        </p>
      ) : null}
    </SurfaceCard>
  )
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof ApiClientError ? error.message : fallback
}
