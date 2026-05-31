import { apiRequest } from './apiClient'
import type {
  CompleteOrderRequest,
  CreateOrderRequest,
  MessagesResponse,
  OrderListResponse,
  OrderResponse,
  PayOrderResponse,
  PriceOrderRequest,
} from '../types/api'

export function getMyOrders() {
  return apiRequest<OrderListResponse>('/orders/my')
}

export function createOrder(payload: CreateOrderRequest) {
  return apiRequest<OrderResponse>('/orders', {
    method: 'POST',
    body: payload,
  })
}

export function getAvailableOrders() {
  return apiRequest<OrderListResponse>('/orders/available')
}

export function getOrder(orderId: string) {
  return apiRequest<OrderResponse>(`/orders/${orderId}`)
}

export function acceptOrder(orderId: string) {
  return apiRequest<OrderResponse>(`/orders/${orderId}/accept`, {
    method: 'POST',
  })
}

export function priceOrder(orderId: string, payload: PriceOrderRequest) {
  return apiRequest<OrderResponse>(`/orders/${orderId}/price`, {
    method: 'POST',
    body: payload,
  })
}

export function payOrder(orderId: string) {
  return apiRequest<PayOrderResponse>(`/orders/${orderId}/pay`, {
    method: 'POST',
  })
}

export function completeOrder(orderId: string, payload: CompleteOrderRequest) {
  return apiRequest<OrderResponse>(`/orders/${orderId}/complete`, {
    method: 'POST',
    body: payload,
  })
}

export function cancelOrder(orderId: string) {
  return apiRequest<OrderResponse>(`/orders/${orderId}/cancel`, {
    method: 'POST',
  })
}

export function getMessages(orderId: string) {
  return apiRequest<MessagesResponse>(`/orders/${orderId}/messages`)
}
