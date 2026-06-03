import { Link } from 'react-router-dom'
import { StatusChip } from '../orders/StatusChip'
import type { OrderDTO } from '../../types/api'
import { formatRupiah } from '../../utils/format'
import { getOrderTotal } from '../../utils/orderState'

type OrderContextHeaderProps = {
  order: OrderDTO
}

export function OrderContextHeader({ order }: OrderContextHeaderProps) {
  const totalLabel =
    order.item_price === null ? 'Price pending' : formatRupiah(getOrderTotal(order))

  return (
    <Link
      to={`/orders/${order.id}`}
      className="block rounded-2xl border border-campus-outline/60 bg-campus-card p-4 shadow-card"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="line-clamp-1 font-heading text-xl font-semibold leading-7 text-campus-text">
            {order.item_desc}
          </p>
          <p className="mt-1 line-clamp-2 font-sans text-sm leading-5 text-campus-muted">
            {order.to_location}
          </p>
        </div>
        <StatusChip status={order.status} />
      </div>
      <div className="mt-3 flex items-center justify-between gap-3 rounded-xl bg-campus-background p-3">
        <span className="font-sans text-xs font-semibold uppercase leading-4 tracking-wider text-campus-muted">
          Total
        </span>
        <span className="font-sans text-sm font-semibold leading-5 text-campus-text">
          {totalLabel}
        </span>
      </div>
    </Link>
  )
}
