import type { ReactNode } from 'react'
import { cn } from '../../utils/className'

type SurfaceCardProps = {
  children: ReactNode
  className?: string
}

export function SurfaceCard({ children, className }: SurfaceCardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-campus-outline/60 bg-campus-card p-4 shadow-card',
        className,
      )}
    >
      {children}
    </div>
  )
}
