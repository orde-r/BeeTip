import { type FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  GhostActionButton,
  PrimaryActionButton,
} from '../components/actions/ActionButton'
import { FormField } from '../components/auth/FormField'
import { Notice } from '../components/layout/Notice'
import { PageShell } from '../components/layout/PageShell'
import { SurfaceCard } from '../components/layout/SurfaceCard'
import { routes } from '../app/routes'
import { ApiClientError } from '../services/apiClient'
import { createOrder } from '../services/ordersApi'
import { formatRupiah } from '../utils/format'

const DELIVERY_FEE_LABEL = formatRupiah(5000)

type FormErrors = {
  fromLocation?: string
  toLocation?: string
  itemDesc?: string
}

export function CreateOrderPage() {
  const navigate = useNavigate()
  const [fromLocation, setFromLocation] = useState('')
  const [toLocation, setToLocation] = useState('')
  const [itemDesc, setItemDesc] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextErrors = validateForm(fromLocation, toLocation, itemDesc)
    setErrors(nextErrors)
    setSubmitError('')

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    setIsSubmitting(true)

    try {
      const response = await createOrder({
        to_location: toLocation.trim(),
        item_desc: buildBackendItemDescription(fromLocation, itemDesc),
      })

      navigate(`/orders/${response.order.id}`)
    } catch (error) {
      if (error instanceof ApiClientError) {
        setSubmitError(error.message)
      } else {
        setSubmitError('Unable to create the order right now.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <PageShell
      title="Create order"
      description="Tell a campus kurir where to go and what to pick up."
      backTo={routes.buyerHome}
      action={null}
    >
      <Notice>
        Delivery fee is fixed at{' '}
        <span className="font-semibold text-campus-text">
          {DELIVERY_FEE_LABEL}
        </span>
        . Your kurir will add the item price after accepting.
      </Notice>

      <form className="grid gap-4" onSubmit={handleSubmit} noValidate>
        <SurfaceCard className="grid gap-4">
          <FormField
            id="from_location"
            name="from_location"
            label="From location"
            placeholder="Shop, canteen, or pickup point"
            value={fromLocation}
            onChange={(event) => {
              setFromLocation(event.target.value)
              if (errors.fromLocation) {
                setErrors((current) => ({
                  ...current,
                  fromLocation: undefined,
                }))
              }
            }}
            error={errors.fromLocation}
          />

          <FormField
            id="to_location"
            name="to_location"
            label="To location"
            placeholder="Building, room, or campus landmark"
            value={toLocation}
            onChange={(event) => {
              setToLocation(event.target.value)
              if (errors.toLocation) {
                setErrors((current) => ({ ...current, toLocation: undefined }))
              }
            }}
            error={errors.toLocation}
            autoComplete="street-address"
          />

          <FormField
            id="item_desc"
            name="item_desc"
            label="Description"
            placeholder="What should the kurir buy or pick up?"
            value={itemDesc}
            onChange={(event) => {
              setItemDesc(event.target.value)
              if (errors.itemDesc) {
                setErrors((current) => ({ ...current, itemDesc: undefined }))
              }
            }}
            error={errors.itemDesc}
            multiline
          />
        </SurfaceCard>

        {submitError ? <Notice tone="error">{submitError}</Notice> : null}

        <div className="grid gap-3 mt-2">
          <PrimaryActionButton type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating order...' : 'Create request'}
          </PrimaryActionButton>
          <GhostActionButton to={routes.buyerHome}>Cancel</GhostActionButton>
        </div>
      </form>
    </PageShell>
  )
}

function validateForm(
  fromLocation: string,
  toLocation: string,
  itemDesc: string,
): FormErrors {
  const nextErrors: FormErrors = {}

  if (!fromLocation.trim()) {
    nextErrors.fromLocation = 'From location is required.'
  }

  if (!toLocation.trim()) {
    nextErrors.toLocation = 'To location is required.'
  }

  if (!itemDesc.trim()) {
    nextErrors.itemDesc = 'Item details are required.'
  }

  return nextErrors
}

function buildBackendItemDescription(fromLocation: string, itemDesc: string) {
  return `From: ${fromLocation.trim()}\nDescription: ${itemDesc.trim()}`
}
