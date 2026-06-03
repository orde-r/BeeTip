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
          'mx-auto flex min-h-screen w-full flex-col bg-campus-surface px-5 pb-[calc(24px+env(safe-area-inset-bottom))] pt-6 sm:max-w-mobile',
          contentClassName,
        )}
      >
        {children}
      </section>
    </main>
  )
}
