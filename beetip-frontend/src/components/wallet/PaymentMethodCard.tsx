import { SurfaceCard } from '../layout/SurfaceCard'

type PaymentMethodCardProps = {
  balanceLabel: string
}

export function PaymentMethodCard({ balanceLabel }: PaymentMethodCardProps) {
  return (
    <SurfaceCard className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-2xl bg-campus-primary-fixed font-heading text-lg font-bold leading-none text-campus-primary-fixed-text">
          B
        </span>
        <div className="min-w-0">
          <p className="font-sans text-sm font-semibold leading-5 text-campus-text">
            BeeTip Wallet
          </p>
          <p className="truncate font-sans text-sm leading-5 text-campus-muted">
            Balance {balanceLabel}
          </p>
        </div>
      </div>
      <span className="rounded-full bg-campus-success-fixed px-3 py-1 font-sans text-xs font-semibold uppercase leading-4 tracking-wider text-campus-success-fixed-strong-text">
        Active
      </span>
    </SurfaceCard>
  )
}
