import { Navigate } from 'react-router-dom'
import { MobileScreenFrame } from '../components/layout/MobileScreenFrame'
import { useAuth } from '../store'
import { getAuthenticatedEntryPath, routes } from './routes'

export function AuthRedirect() {
  const { isAuthenticated, isBootstrapping } = useAuth()

  if (isBootstrapping) {
    return <RouteLoadingState />
  }

  return (
    <Navigate
      to={isAuthenticated ? getAuthenticatedEntryPath() : routes.onboarding}
      replace
    />
  )
}

export function RouteLoadingState() {
  return (
    <MobileScreenFrame>
      <div className="flex flex-1 items-center justify-center">
        <p className="font-sans text-sm leading-5 text-campus-muted">
          Loading account
        </p>
      </div>
    </MobileScreenFrame>
  )
}
