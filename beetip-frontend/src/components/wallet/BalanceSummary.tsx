import { SurfaceCard } from '../layout/SurfaceCard'
import { formatRupiah } from '../../utils/format'

type BalanceSummaryProps = {
  balance: number
  label?: string
  caption?: string
  showStatus?: boolean
}

export function BalanceSummary({
  balance,
  label = 'Available balance',
  caption = 'Ready for your next campus request',
  showStatus = true,
}: BalanceSummaryProps) {
  return (
    <SurfaceCard className="space-y-2">
      <div>
        <p className="font-sans text-xs font-semibold uppercase leading-4 tracking-wider text-campus-primary">
          {label}
        </p>
        <p className="mt-2 text-headline-mobile font-semibold text-campus-text">
          {formatRupiah(balance)}
        </p>
      </div>

      {showStatus ? (
        <div className="rounded-xl bg-campus-primary-fixed py-2 px-3">
          <p className="font-sans text-xs font-semibold uppercase leading-4 tracking-wider text-campus-primary-fixed-text">
            Available
          </p>
          <p className="mt-1 font-sans text-sm font-semibold leading-5 text-campus-text">
            {caption}
          </p>
        </div>
      ) : null}
    </SurfaceCard>
  )
}
