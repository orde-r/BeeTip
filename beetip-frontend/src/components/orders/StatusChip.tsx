import type { OrderStatus } from '../../types/api'
import { cn } from '../../utils/className'

type StatusChipProps = {
  status: OrderStatus | 'AVAILABLE' | 'EARNING'
  className?: string
  muted?: boolean
}

const statusClassNames: Record<StatusChipProps['status'], string> = {
  PENDING: 'bg-campus-orange-fixed text-campus-orange-fixed-text',
  ACCEPTED: 'bg-campus-primary-fixed text-campus-primary-fixed-text',
  PRICED: 'bg-campus-primary-fixed text-campus-primary-fixed-text',
  PAID: 'bg-campus-success-fixed text-campus-success-fixed-strong-text',
  COMPLETED: 'bg-campus-success-fixed text-campus-success-fixed-strong-text',
  CANCELLED: 'bg-campus-error-container text-campus-error-container-text',
  AVAILABLE: 'bg-campus-primary-fixed text-campus-primary-fixed-text',
  EARNING: 'bg-campus-success-fixed text-campus-success-fixed-strong-text',
}

const statusLabels: Record<StatusChipProps['status'], string> = {
  PENDING: 'Pending',
  ACCEPTED: 'Accepted',
  PRICED: 'Priced',
  PAID: 'Paid',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  AVAILABLE: 'Available',
  EARNING: 'Earning',
}

export function StatusChip({ status, className, muted = false }: StatusChipProps) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-0.5 font-sans text-[11px] font-semibold uppercase leading-4 tracking-wide",
        muted
          ? 'bg-campus-background text-campus-muted ring-1 ring-campus-outline/70'
          : statusClassNames[status],
        className,
      )}
    >
      {statusLabels[status]}
    </span>
  )
}
