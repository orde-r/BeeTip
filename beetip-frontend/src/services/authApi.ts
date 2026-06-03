import { apiRequest } from './apiClient'
import type {
  LoginRequest,
  LoginResponse,
  LogoutResponse,
  MeResponse,
  RegisterRequest,
  RegisterResponse,
} from '../types/api'

export function register(payload: RegisterRequest) {
  return apiRequest<RegisterResponse>('/auth/register', {
    method: 'POST',
    body: payload,
  })
}

export function login(payload: LoginRequest) {
  return apiRequest<LoginResponse>('/auth/login', {
    method: 'POST',
    body: payload,
    skipUnauthorizedHandler: true,
  })
}

export function me() {
  return apiRequest<MeResponse>('/auth/me')
}

export function logout() {
  return apiRequest<LogoutResponse>('/auth/logout', {
    method: 'POST',
    skipUnauthorizedHandler: true,
  })
}
