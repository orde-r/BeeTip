import { useEffect } from 'react'
import { create } from 'zustand'
import { useShallow } from 'zustand/react/shallow'
import { me as fetchMe } from '../services/authApi'
import { ApiClientError, setUnauthorizedHandler } from '../services/apiClient'
import type { UserDTO } from '../types/api'

type AuthStatus = 'bootstrapping' | 'authenticated' | 'unauthenticated'

type AuthState = {
  user: UserDTO | null
  status: AuthStatus
  isAuthenticated: boolean
  isBootstrapping: boolean
  setAuthSession: (user: UserDTO) => void
  updateUser: (updater: (user: UserDTO) => UserDTO) => void
  refreshUser: () => Promise<UserDTO | null>
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  status: 'bootstrapping',
  isAuthenticated: false,
  isBootstrapping: true,
  setAuthSession(nextUser) {
    set({
      user: nextUser,
      status: 'authenticated',
      isAuthenticated: true,
      isBootstrapping: false,
    })
  },
  updateUser(updater) {
    const currentUser = get().user
    if (!currentUser) {
      return
    }
    set({ user: updater(currentUser) })
  },
  async refreshUser() {
    try {
      const response = await fetchMe()
      set({
        user: response.user,
        status: 'authenticated',
        isAuthenticated: true,
        isBootstrapping: false,
      })
      return response.user
    } catch (error) {
      if (error instanceof ApiClientError && error.status === 401) {
        get().clearAuth()
      } else {
        set((currentState) => {
          if (currentState.status === 'authenticated') {
            return currentState
          }
          return {
            status: 'unauthenticated',
            isAuthenticated: false,
            isBootstrapping: false,
          }
        })
      }
      return null
    }
  },
  clearAuth() {
    set({
      user: null,
      status: 'unauthenticated',
      isAuthenticated: false,
      isBootstrapping: false,
    })
  },
}))

export function useAuth() {
  return useAuthStore(
    useShallow((state) => ({
      user: state.user,
      status: state.status,
      isAuthenticated: state.isAuthenticated,
      isBootstrapping: state.isBootstrapping,
      setAuthSession: state.setAuthSession,
      updateUser: state.updateUser,
      refreshUser: state.refreshUser,
      clearAuth: state.clearAuth,
    })),
  )
}

export function AuthBootstrap() {
  useEffect(() => {
    const { clearAuth } = useAuthStore.getState()
    setUnauthorizedHandler(clearAuth)

    let isCurrent = true

    async function bootstrap() {
      useAuthStore.setState((currentState) => {
        if (currentState.status === 'authenticated') {
          return currentState
        }
        return { status: 'bootstrapping', isBootstrapping: true }
      })

      try {
        const response = await fetchMe()
        if (!isCurrent) {
          return
        }
        useAuthStore.setState({
          user: response.user,
          status: 'authenticated',
          isAuthenticated: true,
          isBootstrapping: false,
        })
      } catch (error) {
        if (!isCurrent) {
          return
        }
        if (error instanceof ApiClientError && error.status === 401) {
          clearAuth()
        } else {
          useAuthStore.setState({
            user: null,
            status: 'unauthenticated',
            isAuthenticated: false,
            isBootstrapping: false,
          })
        }
      }
    }

    void bootstrap()

    return () => {
      isCurrent = false
      setUnauthorizedHandler(null)
    }
  }, [])

  return null
}
