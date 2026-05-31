import { NavLink } from 'react-router-dom'
import type { ReactNode } from 'react'
import { routes } from '../../app/routes'
import { cn } from '../../utils/className'

const navItems = [
  { label: 'Buyer', to: routes.buyerHome, icon: <BuyerIcon /> },
  { label: 'Kurir', to: routes.kurirHome, icon: <KurirIcon /> },
  { label: 'Wallet', to: routes.wallet, icon: <WalletIcon /> },
  { label: 'Chat', to: routes.chats, icon: <ChatIcon /> },
  { label: 'Profile', to: routes.profile, icon: <ProfileIcon /> },
]

export function VelocityBottomNav() {
  return (
    <nav className="sticky bottom-4 mt-auto rounded-3xl bg-campus-card p-2 shadow-floating">
      <div className="grid grid-cols-5 items-center gap-1">
        {navItems.map((item) => (
          <BottomNavLink key={item.to} {...item} />
        ))}
      </div>
    </nav>
  )
}

function BottomNavLink({
  icon,
  label,
  to,
}: {
  icon: ReactNode
  label: string
  to: string
}) {
  return (
    <NavLink
      aria-label={label}
      to={to}
      className={({ isActive }) =>
        cn(
          'inline-flex min-h-12 items-center justify-center rounded-2xl px-1 transition',
          isActive
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

function BuyerIcon() {
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
      <path d="M6 7h12l1 14H5L6 7Z" />
      <path d="M9 7a3 3 0 0 1 6 0" />
    </svg>
  )
}

function KurirIcon() {
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
      <path d="M4 17h2" />
      <path d="M18 17h2" />
      <path d="M6 17a3 3 0 0 0 6 0" />
      <path d="M14 17a3 3 0 0 0 6 0" />
      <path d="M5 14h13l-2-6H8l-3 6Z" />
      <path d="M8 8V5h5" />
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

function ChatIcon() {
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
      <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8Z" />
      <path d="M8 9h8" />
      <path d="M8 13h5" />
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
