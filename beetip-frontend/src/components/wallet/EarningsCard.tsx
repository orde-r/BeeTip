import { SurfaceCard } from '../layout/SurfaceCard'
import { formatRupiah } from '../../utils/format'

type EarningsCardProps = {
  activeDeliveries: number
  completedDeliveries: number
  earningTotal: number
}

export function EarningsCard({
  activeDeliveries,
  completedDeliveries,
  earningTotal,
}: EarningsCardProps) {
  return (
    <SurfaceCard className="space-y-2">
      <div>
        <p className="font-sans text-xs font-semibold uppercase leading-4 tracking-wider text-campus-success-dark">
          Kurir earnings
        </p>
        <p className="mt-2 text-headline-mobile font-semibold text-campus-text">
          {formatRupiah(earningTotal)}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-campus-success-fixed/20 py-2 px-3">
          <p className="font-sans text-xs font-semibold uppercase leading-4 tracking-wider text-campus-success-fixed-text">
            Active
          </p>
          <p className="mt-1 font-sans text-sm font-semibold leading-5 text-campus-text">
            {activeDeliveries} deliveries
          </p>
        </div>
        <div className="rounded-xl bg-campus-primary-fixed py-2 px-3">
          <p className="font-sans text-xs font-semibold uppercase leading-4 tracking-wider text-campus-primary-fixed-text">
            Completed
          </p>
          <p className="mt-1 font-sans text-sm font-semibold leading-5 text-campus-text">
            {completedDeliveries} deliveries
          </p>
        </div>
      </div>
    </SurfaceCard>
  )
}
