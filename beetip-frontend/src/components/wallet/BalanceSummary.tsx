import { formatRupiah } from '../../utils/format'

type BalanceSummaryProps = {
  balance: number
  label?: string
  caption?: string
}

export function BalanceSummary({
  balance,
  label = 'Available balance',
  caption = 'Ready for your next campus request',
}: BalanceSummaryProps) {
  return (
    <section className="rounded-2xl border border-campus-outline/60 bg-campus-card p-4 shadow-card">
      <p className="font-sans text-xs font-semibold uppercase leading-4 tracking-wider text-campus-muted">
        {label}
      </p>
      <p className="mt-2 font-heading text-headline-mobile font-bold text-campus-text">
        {formatRupiah(balance)}
      </p>
      <p className="mt-1 font-sans text-sm leading-5 text-campus-muted">
        {caption}
      </p>
    </section>
  )
}
