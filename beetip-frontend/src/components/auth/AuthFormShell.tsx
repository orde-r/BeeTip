import type { ReactNode } from 'react'
import { SurfaceCard } from '../layout/SurfaceCard'
import { cn } from '../../utils/className'

type AuthFormShellProps = {
  title: string
  caption: string
  mode: 'login' | 'register'
  onModeChange: (mode: 'login' | 'register') => void
  children: ReactNode
}

export function AuthFormShell({
  title,
  caption,
  mode,
  onModeChange,
  children,
}: AuthFormShellProps) {
  return (
    <SurfaceCard className="space-y-5">
      <div className="space-y-2">
        <p className="font-sans text-xs font-semibold uppercase leading-4 tracking-wider text-campus-primary">
          Account
        </p>
        <h2 className="font-heading text-xl font-semibold leading-7 text-campus-text">
          {title}
        </h2>
        <p className="font-sans text-sm leading-5 text-campus-muted">
          {caption}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-1 rounded-2xl bg-campus-background p-1">
        {(['login', 'register'] as const).map((nextMode) => (
          <button
            key={nextMode}
            type="button"
            onClick={() => onModeChange(nextMode)}
            className={cn(
              "h-10 rounded-xl font-sans text-sm font-semibold leading-5 transition",
              mode === nextMode
                ? 'bg-campus-card text-campus-primary shadow-card'
                : 'text-campus-muted',
            )}
          >
            {nextMode === 'login' ? 'Login' : 'Register'}
          </button>
        ))}
      </div>

      {children}
    </SurfaceCard>
  )
}
