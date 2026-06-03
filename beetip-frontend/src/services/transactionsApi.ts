import { apiRequest } from './apiClient'
import type {
  DepositRequest,
  DepositResponse,
  TransactionHistoryResponse,
} from '../types/api'

export function getHistory() {
  return apiRequest<TransactionHistoryResponse>('/transactions/history')
}

export function deposit(payload: DepositRequest) {
  return apiRequest<DepositResponse>('/transactions/deposit', {
    method: 'POST',
    body: payload,
  })
}
