import { SecondaryActionButton } from '../actions/ActionButton'
import { SurfaceCard } from '../layout/SurfaceCard'

type ChatPreviewProps = {
  to: string
  title?: string
  description?: string
}

export function ChatPreview({
  to,
  title = 'Chat with your match',
  description = 'Coordinate timing, substitutions, and handoff details.',
}: ChatPreviewProps) {
  return (
    <SurfaceCard className="grid gap-3">
      <div>
        <p className="font-heading text-xl font-semibold leading-7 text-campus-text">
          {title}
        </p>
        <p className="mt-1 font-sans text-sm leading-5 text-campus-muted">
          {description}
        </p>
      </div>
      <SecondaryActionButton to={to}>Open chat</SecondaryActionButton>
    </SurfaceCard>
  )
}
