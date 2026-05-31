import type { ReactNode } from 'react'

type OrderActionBarProps = {
  children: ReactNode
}

export function OrderActionBar({ children }: OrderActionBarProps) {
  return <div className="grid gap-3">{children}</div>
}
