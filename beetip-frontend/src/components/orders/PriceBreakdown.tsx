import { SurfaceCard } from '../layout/SurfaceCard'
import type { OrderDTO } from '../../types/api'
import { formatRupiah } from '../../utils/format'
import { getOrderTotal } from '../../utils/orderState'

type PriceBreakdownProps = {
  order: OrderDTO
}

export function PriceBreakdown({ order }: PriceBreakdownProps) {
  return (
    <SurfaceCard className="grid gap-3 mb-2">
      <div>
        <p className="font-heading text-lg font-semibold leading-7 text-campus-text">
          Price breakdown
        </p>
        <p className="font-sans text-xs leading-5 text-campus-muted">
          Delivery fee is fixed. Item price is provided by the kurir.
        </p>
      </div>

      <PriceRow
        label="Item price"
        value={
          order.item_price === null ? 'Waiting' : formatRupiah(order.item_price)
        }
      />
      <PriceRow label="Delivery fee" value={formatRupiah(order.delivery_fee)} />

      <div className="h-px bg-campus-outline/60" />

      <PriceRow
        label="Total"
        value={
          order.item_price === null ? 'Pending' : formatRupiah(getOrderTotal(order))
        }
        strong
      />
    </SurfaceCard>
  )
}

function PriceRow({
  label,
  value,
  strong,
}: {
  label: string
  value: string
  strong?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="font-sans text-sm leading-5 text-campus-muted">
        {label}
      </span>
      <span className="text-right font-sans text-sm font-semibold leading-5 text-campus-text">
        {value}
      </span>
      {strong ? <span className="sr-only">total</span> : null}
    </div>
  )
}
