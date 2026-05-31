/* eslint-disable react-refresh/only-export-components */
import {
  useCallback,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import type { ReactNode } from 'react'
import { me as fetchMe } from '../services/authApi'
import { ApiClientError, setUnauthorizedHandler } from '../services/apiClient'
import type { UserDTO } from '../types/api'

type AuthStatus = 'bootstrapping' | 'authenticated' | 'unauthenticated'

type AuthContextValue = {
  user: UserDTO | null
  status: AuthStatus
  isAuthenticated: boolean
  isBootstrapping: boolean
  setAuthSession: (user: UserDTO) => void
  updateUser: (updater: (user: UserDTO) => UserDTO) => void
  refreshUser: () => Promise<UserDTO | null>
  clearAuth: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserDTO | null>(null)
  const [status, setStatus] = useState<AuthStatus>('bootstrapping')

  const clearAuth = useCallback(() => {
    setUser(null)
    setStatus('unauthenticated')
  }, [])

  useEffect(() => {
    setUnauthorizedHandler(clearAuth)

    return () => {
      setUnauthorizedHandler(null)
    }
  }, [clearAuth])

  const refreshUser = useCallback(async () => {
    try {
      const response = await fetchMe()
      setUser(response.user)
      setStatus('authenticated')
      return response.user
    } catch (error) {
      if (error instanceof ApiClientError && error.status === 401) {
        clearAuth()
      } else {
        setStatus((currentStatus) =>
          currentStatus === 'authenticated' ? currentStatus : 'unauthenticated',
        )
      }

      return null
    }
  }, [clearAuth])

  useEffect(() => {
    let isCurrent = true

    async function bootstrapUser() {
      setStatus((currentStatus) =>
        currentStatus === 'authenticated' ? currentStatus : 'bootstrapping',
      )

      try {
        const response = await fetchMe()

        if (!isCurrent) {
          return
        }

        setUser(response.user)
        setStatus('authenticated')
      } catch (error) {
        if (isCurrent) {
          if (error instanceof ApiClientError && error.status === 401) {
            clearAuth()
          } else {
            setUser(null)
            setStatus('unauthenticated')
          }
        }
      }
    }

    bootstrapUser()

    return () => {
      isCurrent = false
    }
  }, [clearAuth])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      status,
      isAuthenticated: status === 'authenticated',
      isBootstrapping: status === 'bootstrapping',
      setAuthSession(nextUser) {
        setUser(nextUser)
        setStatus('authenticated')
      },
      updateUser(updater) {
        setUser((currentUser) =>
          currentUser ? updater(currentUser) : currentUser,
        )
      },
      refreshUser,
      clearAuth,
    }),
    [clearAuth, refreshUser, status, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}
