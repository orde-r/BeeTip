import { NavLink, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { routes } from '../../app/routes'
import { cn } from '../../utils/className'

const navItems = [
  {
    label: 'Home',
    to: routes.buyerHome,
    icon: <HomeIcon />,
    activeWhen: [routes.buyerHome, routes.kurirHome],
  },
  { label: 'History', to: routes.orderHistory, icon: <HistoryIcon /> },
  { label: 'Wallet', to: routes.wallet, icon: <WalletIcon /> },
  { label: 'Profile', to: routes.profile, icon: <ProfileIcon /> },
]

export function VelocityBottomNav() {
  return (
    <>
      <div
        aria-hidden="true"
        className="h-[calc(88px+env(safe-area-inset-bottom))] shrink-0"
      />
      <nav className="fixed bottom-[calc(16px+env(safe-area-inset-bottom))] left-1/2 z-30 w-[calc(100%-40px)] max-w-[350px] -translate-x-1/2 rounded-3xl bg-campus-card p-2 shadow-floating">
        <div className="grid grid-cols-4 items-center gap-1">
          {navItems.map((item) => (
            <BottomNavLink key={item.to} {...item} />
          ))}
        </div>
      </nav>
    </>
  )
}

function BottomNavLink({
  icon,
  label,
  to,
  activeWhen,
}: {
  activeWhen?: string[]
  icon: ReactNode
  label: string
  to: string
}) {
  const location = useLocation()
  const isAliasActive = activeWhen?.includes(location.pathname) ?? false

  return (
    <NavLink
      aria-label={label}
      to={to}
      className={({ isActive }) =>
        cn(
          'inline-flex min-h-12 items-center justify-center rounded-2xl px-1 transition',
          isActive || isAliasActive
            ? 'bg-campus-primary-fixed text-campus-primary-fixed-text'
            : 'text-campus-muted',
        )
      }
    >
      <span className="inline-flex size-5 items-center justify-center">
        {icon}
      </span>
    </NavLink>
  )
}

function HomeIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="m3 11 9-8 9 8" />
      <path d="M5 10v10h14V10" />
      <path d="M9 20v-6h6v6" />
    </svg>
  )
}

function WalletIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M4 7h16v12H4a2 2 0 0 1-2-2V5a2 2 0 0 0 2 2Z" />
      <path d="M16 13h4" />
      <path d="M4 7a2 2 0 0 1 2-2h12" />
    </svg>
  )
}

function HistoryIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M4 5h16" />
      <path d="M4 12h16" />
      <path d="M4 19h16" />
      <path d="M7 8v4" />
      <path d="M17 15v4" />
    </svg>
  )
}

function ProfileIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </svg>
  )
}
