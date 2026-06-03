import { cn } from '../../utils/className'
import { SurfaceCard } from '../layout/SurfaceCard'

type ReceiptPreviewProps = {
  framed?: boolean
  receiptImageUrl: string
}

export function ReceiptPreview({
  framed = true,
  receiptImageUrl,
}: ReceiptPreviewProps) {
  const trimmedUrl = receiptImageUrl.trim()

  if (!trimmedUrl) {
    return null
  }

  const canRenderImage =
    trimmedUrl.startsWith('data:image/') ||
    trimmedUrl.startsWith('http://') ||
    trimmedUrl.startsWith('https://')

  const content = (
    <div className={cn('grid gap-3', !framed && 'rounded-xl bg-campus-background p-3')}>
      <div>
        <p className="font-heading text-lg font-semibold leading-7 text-campus-text">
          Receipt
        </p>
        <p className="font-sans text-xs leading-5 text-campus-muted">
          Proof uploaded by the kurir.
        </p>
      </div>

      {canRenderImage ? (
        <img
          alt="Order receipt"
          className="max-h-80 w-full rounded-xl border border-campus-outline/60 object-contain"
          src={trimmedUrl}
        />
      ) : (
        <p className="wrap-break-words rounded-xl bg-campus-background p-3 font-sans text-sm leading-5 text-campus-text">
          {trimmedUrl}
        </p>
      )}
    </div>
  )

  return framed ? (
    <SurfaceCard className="grid gap-3">{content}</SurfaceCard>
  ) : (
    content
  )
}
