import { SurfaceCard } from '../layout/SurfaceCard'
import { cn } from '../../utils/className'

type RouteSummaryProps = {
  origin?: string
  destination: string
  itemDescription: string
  deliveryFeeLabel: string
}

export function RouteSummary({
  origin,
  destination,
  itemDescription,
  deliveryFeeLabel,
}: RouteSummaryProps) {
  const originLabel = origin || 'Pick-up location will appear here'
  const destinationLabel = destination || 'Destination will appear here'
  const itemLabel = itemDescription || 'Item details will appear here'

  return (
    <SurfaceCard className="grid gap-5">
      {origin !== undefined ? (
        <>
          <SummaryPoint
            colorClassName="bg-campus-primary"
            label="Pick-up"
            value={originLabel}
            strong
          />
        </>
      ) : null}

      <SummaryPoint
        colorClassName={
          origin === undefined ? 'bg-campus-primary' : 'bg-campus-success'
        }
        label="Drop-off"
        value={destinationLabel}
        strong
      />

      <SummaryPoint
        colorClassName="bg-campus-orange"
        label="Request"
        value={itemLabel}
      />

      <div className="rounded-xl bg-campus-background p-3">
        <div className="flex items-center justify-between gap-3">
          <span className="font-sans text-sm leading-5 text-campus-muted">
            Delivery fee
          </span>
          <span className="font-sans text-sm font-semibold leading-5 text-campus-success">
            {deliveryFeeLabel}
          </span>
        </div>
      </div>
    </SurfaceCard>
  )
}

function SummaryPoint({
  colorClassName,
  label,
  strong,
  value,
}: {
  colorClassName: string
  label: string
  strong?: boolean
  value: string
}) {
  return (
    <div className="flex items-start gap-3">
      <span className={cn('mt-1 h-3 w-3 rounded-full', colorClassName)} />
      <div className="min-w-0 flex-1">
        <p className="font-sans text-xs font-semibold uppercase leading-4 tracking-wider text-campus-muted">
          {label}
        </p>
        <p
          className={cn(
            'mt-1 wrap-break-words font-sans text-sm leading-5 text-campus-text',
            strong && 'font-semibold',
          )}
        >
          {value}
        </p>
      </div>
    </div>
  )
}
