import { type FormEvent, useState } from 'react'
import { PrimaryActionButton } from '../actions/ActionButton'
import { FormField } from '../auth/FormField'
import { SurfaceCard } from '../layout/SurfaceCard'
import { formatRupiahInput, parseRupiahInput } from '../../utils/format'

type PriceInputPanelProps = {
  disabled?: boolean
  onSubmit: (payload: {
    item_price: number
    receipt_image_url?: string
  }) => Promise<void>
}

export function PriceInputPanel({ disabled, onSubmit }: PriceInputPanelProps) {
  const [itemPrice, setItemPrice] = useState('')
  const [receiptUrl, setReceiptUrl] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const parsedPrice = parseRupiahInput(itemPrice)

    if (parsedPrice === null || parsedPrice <= 0) {
      setError('Enter a positive item price.')
      return
    }

    setError('')

    await onSubmit({
      item_price: parsedPrice,
      receipt_image_url: receiptUrl.trim() || undefined,
    })
  }

  return (
    <SurfaceCard>
      <form className="grid gap-4" onSubmit={handleSubmit} noValidate>
        <div>
          <p className="font-heading text-xl font-semibold leading-7 text-campus-text">
            Upload price
          </p>
          <p className="mt-1 font-sans text-sm leading-5 text-campus-muted">
            Add the final item price before the buyer pays.
          </p>
        </div>

        <FormField
          id="item_price"
          name="item_price"
          label="Item price"
          inputMode="numeric"
          placeholder="Rp 25.000"
          value={itemPrice}
          onChange={(event) => {
            setItemPrice(formatRupiahInput(event.target.value))
            setError('')
          }}
          error={error}
          disabled={disabled}
        />

        <FormField
          id="receipt_image_url"
          name="receipt_image_url"
          label="Receipt URL"
          placeholder="Optional receipt image or data URL"
          value={receiptUrl}
          onChange={(event) => setReceiptUrl(event.target.value)}
          helperText="Optional until file upload support exists."
          disabled={disabled}
        />

        <PrimaryActionButton type="submit" disabled={disabled}>
          {disabled ? 'Uploading price...' : 'Submit price'}
        </PrimaryActionButton>
      </form>
    </SurfaceCard>
  )
}
