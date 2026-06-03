import { SurfaceCard } from '../layout/SurfaceCard'

type OrderOutcomePanelProps = {
  tone: 'success' | 'muted'
  title: string
  description: string
  metaLabel?: string
  metaValue?: string
}

export function OrderOutcomePanel({
  tone,
  title,
  description,
  metaLabel,
  metaValue,
}: OrderOutcomePanelProps) {
  const isSuccess = tone === 'success'

  return (
    <SurfaceCard className="grid gap-4">
      <div className="flex items-center gap-3">
        <span
          className={
            isSuccess
              ? 'inline-flex size-11 shrink-0 items-center justify-center rounded-2xl bg-campus-success-fixed font-heading text-lg font-bold leading-none text-campus-success-fixed-strong-text'
              : 'inline-flex size-11 shrink-0 items-center justify-center rounded-2xl bg-campus-background font-heading text-lg font-bold leading-none text-campus-muted'
          }
        >
          {isSuccess ? 'OK' : '-'}
        </span>
        <div className="min-w-0">
          <p className="font-heading text-lg font-semibold leading-7 text-campus-text">
            {title}
          </p>
          <p className="font-sans text-xs leading-5 text-campus-muted">
            {description}
          </p>
        </div>
      </div>

      {metaLabel && metaValue ? (
        <div className="rounded-xl bg-campus-background p-3">
          <p className="font-sans text-xs font-semibold uppercase leading-4 tracking-wider text-campus-muted">
            {metaLabel}
          </p>
          <p className="mt-1 font-sans text-sm font-semibold leading-5 text-campus-text">
            {metaValue}
          </p>
        </div>
      ) : null}
    </SurfaceCard>
  )
}
