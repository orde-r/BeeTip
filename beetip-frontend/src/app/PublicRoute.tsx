import { Navigate, Outlet } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '../store'
import { getAuthenticatedEntryPath } from './routes'
import { RouteLoadingState } from './AuthRedirect'

type PublicRouteProps = {
  children?: ReactNode
  redirectAuthenticated?: boolean
}

export function PublicRoute({
  children,
  redirectAuthenticated = false,
}: PublicRouteProps) {
  const { isAuthenticated, isBootstrapping } = useAuth()

  if (isBootstrapping) {
    return <RouteLoadingState />
  }

  if (redirectAuthenticated && isAuthenticated) {
    return <Navigate to={getAuthenticatedEntryPath()} replace />
  }

  return children ?? <Outlet />
}
