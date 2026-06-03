import type { ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '../../utils/className'

type BaseActionProps = {
  children: ReactNode
  className?: string
  fullWidth?: boolean
}

type ButtonActionProps = BaseActionProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    to?: never
  }

type LinkActionProps = BaseActionProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    to: string
  }

type ActionButtonProps = ButtonActionProps | LinkActionProps

const baseClassName =
  "inline-flex min-h-12 items-center justify-center rounded-2xl px-4 font-sans text-sm font-semibold leading-5 transition focus:outline-none focus:ring-2 focus:ring-campus-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"

function ActionButton({
  children,
  className,
  fullWidth = true,
  ...props
}: ActionButtonProps) {
  const composedClassName = cn(baseClassName, fullWidth && 'w-full', className)

  if ('to' in props && props.to) {
    const { to, ...linkProps } = props
    return (
      <Link to={to} className={composedClassName} {...linkProps}>
        {children}
      </Link>
    )
  }

  const buttonProps = props as ButtonHTMLAttributes<HTMLButtonElement>

  return (
    <button className={composedClassName} {...buttonProps}>
      {children}
    </button>
  )
}

export function PrimaryActionButton(props: ActionButtonProps) {
  return (
    <ActionButton
      {...props}
      className={cn(
        'bg-campus-orange text-campus-on-primary shadow-card hover:bg-campus-orange-hover',
        props.className,
      )}
    />
  )
}

export function SecondaryActionButton(props: ActionButtonProps) {
  return (
    <ActionButton
      {...props}
      className={cn(
        'bg-campus-primary text-campus-on-primary shadow-card',
        props.className,
      )}
    />
  )
}

export function GhostActionButton(props: ActionButtonProps) {
  return (
    <ActionButton
      {...props}
      className={cn(
        'border border-campus-primary bg-transparent text-campus-primary',
        props.className,
      )}
    />
  )
}
