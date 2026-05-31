import type { ReactNode } from 'react'

type OrderListSectionProps = {
  title: string
  caption?: string
  children: ReactNode
}

export function OrderListSection({
  title,
  caption,
  children,
}: OrderListSectionProps) {
  return (
    <section className="space-y-3">
      <div className="space-y-1">
        <h2 className="font-heading text-xl font-semibold leading-7 text-campus-text">
          {title}
        </h2>
        {caption ? (
          <p className="font-sans text-sm leading-5 text-campus-muted">
            {caption}
          </p>
        ) : null}
      </div>
      {children}
    </section>
  )
}
