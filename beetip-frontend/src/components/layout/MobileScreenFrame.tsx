import type { ReactNode } from 'react'
import { cn } from '../../utils/className'

type MobileScreenFrameProps = {
  children: ReactNode
  className?: string
  contentClassName?: string
}

export function MobileScreenFrame({
  children,
  className,
  contentClassName,
}: MobileScreenFrameProps) {
  return (
    <main
      className={cn(
        "min-h-screen bg-campus-background font-sans text-campus-text",
        className,
      )}
    >
      <section
        className={cn(
          'mx-auto flex min-h-screen w-full max-w-mobile flex-col bg-campus-surface px-5 pb-[calc(24px+env(safe-area-inset-bottom))] pt-6',
          contentClassName,
        )}
      >
        {children}
      </section>
    </main>
  )
}
