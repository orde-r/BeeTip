import { useCallback, useEffect, useState } from 'react'
import { ApiClientError } from '../services/apiClient'

type AsyncState<T> = {
  data: T | null
  error: string | null
  isLoading: boolean
}

export function useDashboardData<T>(loader: () => Promise<T>) {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    error: null,
    isLoading: true,
  })

  const load = useCallback(async () => {
    setState((currentState) => ({
      ...currentState,
      error: null,
      isLoading: true,
    }))

    try {
      const data = await loader()
      setState({ data, error: null, isLoading: false })
    } catch (error) {
      setState({
        data: null,
        error:
          error instanceof ApiClientError
            ? error.message
            : 'Unable to load dashboard data.',
        isLoading: false,
      })
    }
  }, [loader])

  useEffect(() => {
    let isCurrent = true

    async function loadCurrent() {
      setState((currentState) => ({
        ...currentState,
        error: null,
        isLoading: true,
      }))

      try {
        const data = await loader()

        if (isCurrent) {
          setState({ data, error: null, isLoading: false })
        }
      } catch (error) {
        if (isCurrent) {
          setState({
            data: null,
            error:
              error instanceof ApiClientError
                ? error.message
                : 'Unable to load dashboard data.',
            isLoading: false,
          })
        }
      }
    }

    loadCurrent()

    return () => {
      isCurrent = false
    }
  }, [loader])

  return { ...state, reload: load }
}
