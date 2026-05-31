import type { ApiErrorShape } from '../types/api'

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000'
).replace(/\/$/, '')

let unauthorizedHandler: (() => void) | null = null

export class ApiClientError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiClientError'
    this.status = status
  }
}

export type ApiRequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown
  skipUnauthorizedHandler?: boolean
}

export function setUnauthorizedHandler(handler: (() => void) | null) {
  unauthorizedHandler = handler
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const headers = new Headers(options.headers)

  if (options.body !== undefined && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  headers.set('Accept', 'application/json')

  let response: Response
  const { body, skipUnauthorizedHandler, ...requestOptions } = options

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...requestOptions,
      credentials: requestOptions.credentials ?? 'include',
      headers,
      body:
        body === undefined || body instanceof FormData
          ? body
          : JSON.stringify(body),
    })
  } catch {
    throw new ApiClientError('Unable to reach the server', 0)
  }

  if (!response.ok) {
    const error = await createApiError(response)

    if (response.status === 401 && !skipUnauthorizedHandler) {
      unauthorizedHandler?.()
    }

    throw error
  }

  if (response.status === 204) {
    return undefined as T
  }

  try {
    return (await response.json()) as T
  } catch {
    return undefined as T
  }
}

async function createApiError(response: Response) {
  let message = response.statusText || 'Request failed'

  try {
    const payload = (await response.json()) as Partial<ApiErrorShape>
    const parsedMessage = normalizeErrorMessage(payload.message)

    if (parsedMessage) {
      message = parsedMessage
    }
  } catch {
    // Keep the status text fallback when the response is not JSON.
  }

  return new ApiClientError(message, response.status)
}

function normalizeErrorMessage(message: unknown) {
  if (typeof message === 'string') {
    return message
  }

  if (Array.isArray(message)) {
    return message.filter((item) => typeof item === 'string').join(', ')
  }

  return null
}
