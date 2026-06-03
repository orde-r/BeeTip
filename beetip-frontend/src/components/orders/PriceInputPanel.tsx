import { type FormEvent, useState } from 'react'
import { PrimaryActionButton } from '../actions/ActionButton'
import { FormField } from '../auth/FormField'
import { SurfaceCard } from '../layout/SurfaceCard'
import { ReceiptPreview } from './ReceiptPreview'
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
  const [receiptError, setReceiptError] = useState('')

  function handleReceiptFile(file: File | undefined) {
    setReceiptError('')

    if (!file) {
      setReceiptUrl('')
      return
    }

    if (!file.type.startsWith('image/')) {
      setReceiptUrl('')
      setReceiptError('Choose an image receipt.')
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      setReceiptUrl('')
      setReceiptError('Receipt image must be 2 MB or smaller.')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setReceiptUrl(reader.result)
      }
    }
    reader.onerror = () => {
      setReceiptError('Unable to read this receipt image.')
    }
    reader.readAsDataURL(file)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const parsedPrice = parseRupiahInput(itemPrice)

    if (parsedPrice === null || parsedPrice <= 0) {
      setError('Enter a positive item price.')
      return
    }

    if (receiptError) {
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

        <label className="grid gap-2">
          <span className="font-sans text-sm font-semibold leading-5 text-campus-text">
            Upload receipt (optional)
          </span>
          <input
            accept="image/*"
            className="block w-full rounded-2xl border border-campus-outline bg-campus-field px-4 py-3 font-sans text-sm leading-5 text-campus-text file:mr-3 file:rounded-xl file:border-0 file:bg-campus-primary-fixed file:px-3 file:py-2 file:font-sans file:text-xs file:font-semibold file:text-campus-primary-fixed-text disabled:cursor-not-allowed disabled:opacity-60"
            disabled={disabled}
            onChange={(event) => handleReceiptFile(event.target.files?.[0])}
            type="file"
          />
        </label>

        {receiptError ? (
          <p className="font-sans text-sm leading-5 text-campus-error">
            {receiptError}
          </p>
        ) : null}

        {receiptUrl.trim() ? (
          <ReceiptPreview framed={false} receiptImageUrl={receiptUrl} />
        ) : null}

        <PrimaryActionButton type="submit" disabled={disabled}>
          {disabled ? 'Uploading price...' : 'Submit price'}
        </PrimaryActionButton>
      </form>
    </SurfaceCard>
  )
}
