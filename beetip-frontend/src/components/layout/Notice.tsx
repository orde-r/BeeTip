import type { ReactNode } from 'react'
import { cn } from '../../utils/className'

type NoticeTone = 'info' | 'success' | 'error'

type NoticeProps = {
  tone?: NoticeTone
  children: ReactNode
}

const toneClassNames: Record<NoticeTone, string> = {
  info: 'border-campus-outline/60 bg-campus-card text-campus-muted',
  success:
    'border-campus-success-fixed bg-campus-success-fixed/20 text-campus-success-fixed-text',
  error:
    'border-campus-error-container bg-campus-error-container/60 text-campus-error-container-text',
}

export function Notice({ tone = 'info', children }: NoticeProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-4 font-sans text-sm leading-5",
        toneClassNames[tone],
      )}
    >
      {children}
    </div>
  )
}
