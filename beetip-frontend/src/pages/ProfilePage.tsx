import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Notice } from '../components/layout/Notice'
import { PageShell } from '../components/layout/PageShell'
import { SurfaceCard } from '../components/layout/SurfaceCard'
import { VelocityBottomNav } from '../components/layout/VelocityBottomNav'
import { BalanceSummary } from '../components/wallet/BalanceSummary'
import { routes } from '../app/routes'
import { logout } from '../services/authApi'
import { useAuth, useSecurityCodes } from '../store'
import { getNameFromEmail } from '../utils/orderDisplay'

export function ProfilePage() {
  const navigate = useNavigate()
  const { clearAuth, refreshUser, user } = useAuth()
  const { clearAllSecurityCodes } = useSecurityCodes()
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const loadProfile = useCallback(async () => {
    setIsLoading(true)
    setLoadError('')

    const currentUser = await refreshUser()

    if (!currentUser) {
      setLoadError('Unable to load account details.')
    }

    setIsLoading(false)
  }, [refreshUser])

  useEffect(() => {
    void Promise.resolve().then(loadProfile)
  }, [loadProfile])

  async function handleLogout() {
    try {
      await logout()
    } catch {
      // Local session state must be cleared even when the server logout fails.
    } finally {
      clearAllSecurityCodes()
      clearAuth()
      navigate(routes.auth, { replace: true })
    }
  }

  return (
    <PageShell
      title="Profile"
      description="Account details for your BeeTip session."
      isTopBarSticky={false}
      action={null}
    >
      {isLoading ? <Notice>Loading profile.</Notice> : null}

      {loadError ? (
        <Notice tone="error">
          <span>{loadError}</span>
          <button
            type="button"
            onClick={loadProfile}
            className="mt-3 block font-sans text-sm font-semibold leading-5 text-campus-primary"
          >
            Try again
          </button>
        </Notice>
      ) : null}

      {user ? (
        <>
          <BalanceSummary
            balance={user.balance}
            label="Wallet balance"
            caption="Available for buyer payments and kurir earnings."
          />

          <SurfaceCard className="grid gap-4 p-1">
            <ProfileRow label="Name" value={getNameFromEmail(user.email)} />
            <ProfileRow label="Email" value={user.email} />
          </SurfaceCard>
        </>
      ) : (
        <Notice tone="error">Account details are not loaded.</Notice>
      )}

      <button
        type="button"
        onClick={handleLogout}
        className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-campus-error bg-campus-card px-4 font-sans text-sm font-semibold leading-5 text-campus-error transition focus:outline-none focus:ring-2 focus:ring-campus-primary focus:ring-offset-2"
      >
        Logout
      </button>
      <VelocityBottomNav />
    </PageShell>
  )
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-campus-background p-3">
      <p className="font-sans text-xs font-semibold uppercase leading-4 tracking-wider text-campus-muted">
        {label}
      </p>
      <p className="mt-1 truncate font-sans text-sm font-semibold leading-5 text-campus-text">
        {value}
      </p>
    </div>
  )
}
