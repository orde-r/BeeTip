import { Navigate, Outlet, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '../state/AuthContext'
import { routes } from './routes'
import { RouteLoadingState } from './AuthRedirect'

type ProtectedRouteProps = {
  children?: ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isBootstrapping } = useAuth()
  const location = useLocation()

  if (isBootstrapping) {
    return <RouteLoadingState />
  }

  if (!isAuthenticated) {
    return <Navigate to={routes.auth} replace state={{ from: location }} />
  }

  return children ?? <Outlet />
}
