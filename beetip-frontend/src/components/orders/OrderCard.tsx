import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import { StatusChip } from './StatusChip'
import { SurfaceCard } from '../layout/SurfaceCard'
import type { OrderDTO } from '../../types/api'
import { formatDateTime, formatRupiah } from '../../utils/format'
import { parseOrderDescription } from '../../utils/orderDisplay'
import { getOrderTotal } from '../../utils/orderState'
import { cn } from '../../utils/className'

type OrderCardProps = {
  order: OrderDTO
  to?: string
  metaLabel?: string
  action?: ReactNode
  muted?: boolean
}

export function OrderCard({
  order,
  to,
  metaLabel,
  action,
  muted = false,
}: OrderCardProps) {
  const parsedOrder = parseOrderDescription(order.item_desc)
  const totalLabel = formatRupiah(
    order.item_price === null ? order.delivery_fee : getOrderTotal(order),
  )

  const cardContent = (
    <SurfaceCard
      className={cn(
        'overflow-hidden p-0 transition hover:-translate-y-0.5 hover:shadow-floating',
        muted && 'opacity-70 saturate-50',
      )}
    >

        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-sans text-xs font-semibold uppercase leading-4 tracking-wider text-campus-muted">
              Pick-up
            </p>
            <p className="mt-1 line-clamp-2 font-heading text-lg font-semibold leading-7 text-campus-text">
              {parsedOrder.title}
            </p>
            <p className="mt-1 line-clamp-2 font-sans text-xs leading-5 text-campus-muted">
              {parsedOrder.request}
            </p>
          </div>
          <StatusChip status={order.status} muted={muted} />
        </div>

        <div className="mt-3 mb-3 flex items-start gap-2 rounded-xl bg-campus-background px-3 py-2">
          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-campus-success" />
          <p className="min-w-0 flex-1 truncate font-sans text-sm font-semibold leading-5 text-campus-text">
            {order.to_location}
          </p>
        </div>


      <div className="grid grid-cols-2 ">
        <OrderMetric
          label={order.item_price === null ? 'Delivery fee' : 'Total'}
          value={totalLabel}
          className="border-r border-campus-outline/60"
        />
        <OrderMetric
          label={metaLabel ?? 'Created'}
          value={formatDateTime(order.createdAt)}
        />
      </div>

      {action ? <div className="px-4 pb-4">{action}</div> : null}
    </SurfaceCard>
  )

  if (!to) {
    return cardContent
  }

  return (
    <Link to={to} className="block">
      {cardContent}
    </Link>
  )
}

function OrderMetric({
  className,
  label,
  value,
}: {
  className?: string
  label: string
  value: string
}) {
  return (
    <div className={cn('min-w-0 px-4 py-1', className)}>
      <p className="font-sans text-[11px] font-semibold uppercase leading-4 tracking-wider text-campus-muted">
        {label}
      </p>
      <p className="mt-1 truncate font-sans text-[13px] font-semibold leading-5 text-campus-text">
        {value}
      </p>
    </div>
  )
}
