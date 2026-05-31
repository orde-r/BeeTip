import { SurfaceCard } from '../layout/SurfaceCard'

type SecurityCodePanelProps = {
  code: string | null
}

export function SecurityCodePanel({ code }: SecurityCodePanelProps) {
  return (
    <SurfaceCard className="grid gap-3">
      <div>
        <p className="font-heading text-xl font-semibold leading-7 text-campus-text">
          Security code
        </p>
        <p className="font-sans text-sm leading-5 text-campus-muted">
          Share this with the kurir only after receiving the item.
        </p>
      </div>

      {code ? (
        <div className="rounded-2xl bg-campus-primary-fixed p-4 text-center">
          <p className="font-sans text-xs font-semibold uppercase leading-4 tracking-wider text-campus-primary-fixed-text">
            Handoff code
          </p>
          <p className="mt-2 font-heading text-3xl font-bold leading-9 text-campus-text">
            {code}
          </p>
        </div>
      ) : (
        <div className="rounded-2xl bg-campus-background p-4">
          <p className="font-sans text-sm leading-5 text-campus-muted">
            This code was shown immediately after payment. If it is missing,
            keep this session open after paying from another screen.
          </p>
        </div>
      )}
    </SurfaceCard>
  )
}
