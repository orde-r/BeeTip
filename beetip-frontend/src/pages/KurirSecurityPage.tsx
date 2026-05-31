import { type FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  GhostActionButton,
  PrimaryActionButton,
} from '../components/actions/ActionButton'
import { FormField } from '../components/auth/FormField'
import { PageShell } from '../components/layout/PageShell'
import { Notice } from '../components/layout/Notice'
import { SurfaceCard } from '../components/layout/SurfaceCard'
import { PriceBreakdown } from '../components/orders/PriceBreakdown'
import { RouteSummary } from '../components/orders/RouteSummary'
import { StatusChip } from '../components/orders/StatusChip'
import { routes } from '../app/routes'
import { ApiClientError } from '../services/apiClient'
import { completeOrder, getOrder } from '../services/ordersApi'
import { useParsedOrder } from '../hooks/useParsedOrder'
import { useAuth } from '../state/AuthContext'
import type { OrderDTO, UserDTO } from '../types/api'
import { formatRupiah } from '../utils/format'
import { getOrderActor } from '../utils/orderState'

export function KurirSecurityPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { refreshUser } = useAuth()
  const [order, setOrder] = useState<OrderDTO | null>(null)
  const [account, setAccount] = useState<UserDTO | null>(null)
  const [securityCode, setSecurityCode] = useState('')
  const [fieldError, setFieldError] = useState('')
  const [loadError, setLoadError] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loadSecurityOrder = useCallback(async () => {
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
      setLoadError(getErrorMessage(error, 'Unable to load security details.'))
    } finally {
      setIsLoading(false)
    }
  }, [id, refreshUser])

  useEffect(() => {
    void Promise.resolve().then(loadSecurityOrder)
  }, [loadSecurityOrder])

  const actor = useMemo(
    () => (order ? getOrderActor(order, account) : 'VIEWER'),
    [account, order],
  )
  const parsedOrder = useParsedOrder(order)
  const canComplete = Boolean(order) && actor === 'KURIR' && order?.status === 'PAID'

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!order || !canComplete) {
      return
    }

    const trimmedCode = securityCode.trim()

    if (!trimmedCode) {
      setFieldError('Security code is required.')
      return
    }

    setIsSubmitting(true)
    setFieldError('')
    setSubmitError('')

    try {
      const response = await completeOrder(order.id, {
        security_code: trimmedCode,
      })
      setOrder(response.order)
      await refreshUser()
      navigate(`/orders/${response.order.id}`)
    } catch (error) {
      setSubmitError(getErrorMessage(error, 'Unable to complete this order.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <PageShell
      title="Security code"
      description="Enter the buyer code after handoff."
      backTo={id ? `/orders/${id}` : routes.kurirHome}
      action={order ? <StatusChip status={order.status} /> : null}
    >
      {isLoading ? <Notice>Loading security check.</Notice> : null}

      {loadError ? (
        <Notice tone="error">
          <span>{loadError}</span>
          <button
            type="button"
            onClick={loadSecurityOrder}
            className="mt-3 block font-sans text-sm font-semibold leading-5 text-campus-primary"
          >
            Try again
          </button>
        </Notice>
      ) : null}

      {order ? (
        <>
          <RouteSummary
            origin={parsedOrder?.origin ?? undefined}
            destination={order.to_location}
            itemDescription={parsedOrder?.request ?? order.item_desc}
            deliveryFeeLabel={formatRupiah(order.delivery_fee)}
          />
          <PriceBreakdown order={order} />

          {actor !== 'KURIR' ? (
            <Notice tone="error">
              Only the assigned kurir can complete this order.
            </Notice>
          ) : null}

          {actor === 'KURIR' && order.status !== 'PAID' ? (
            <Notice>This order is not ready for security-code completion.</Notice>
          ) : null}

          {submitError ? <Notice tone="error">{submitError}</Notice> : null}

          <SurfaceCard>
            <form className="grid gap-4" onSubmit={handleSubmit} noValidate>
              <div>
                <p className="font-heading text-xl font-semibold leading-7 text-campus-text">
                  Confirm handoff
                </p>
                <p className="mt-1 font-sans text-sm leading-5 text-campus-muted">
                  Ask the buyer for the code after they receive the item.
                </p>
              </div>

              <FormField
                id="security_code"
                name="security_code"
                label="Security code"
                placeholder="123456"
                helperText="Enter the buyer's one-time handoff code."
                inputMode="numeric"
                maxLength={12}
                value={securityCode}
                onChange={(event) => {
                  setSecurityCode(event.target.value)
                  setFieldError('')
                }}
                error={fieldError}
                disabled={!canComplete || isSubmitting}
              />

              <PrimaryActionButton
                type="submit"
                disabled={!canComplete || isSubmitting}
              >
                {isSubmitting ? 'Completing...' : 'Complete delivery'}
              </PrimaryActionButton>
              <GhostActionButton to={id ? `/orders/${id}` : routes.kurirHome}>
                Back to order
              </GhostActionButton>
            </form>
          </SurfaceCard>
        </>
      ) : null}
    </PageShell>
  )
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof ApiClientError ? error.message : fallback
}
