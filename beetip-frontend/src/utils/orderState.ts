import type { OrderDTO, OrderStatus, UserDTO } from '../types/api'

export type OrderActor = 'BUYER' | 'KURIR' | 'VIEWER'

export function getOrderActor(order: OrderDTO, user: UserDTO | null): OrderActor {
  if (!user) {
    return 'VIEWER'
  }

  if (order.buyer_id === user.id) {
    return 'BUYER'
  }

  if (order.kurir_id === user.id) {
    return 'KURIR'
  }

  return 'VIEWER'
}

export function isTerminalStatus(status: OrderStatus) {
  return status === 'COMPLETED' || status === 'CANCELLED'
}

export function getOrderTotal(order: OrderDTO) {
  return (order.item_price ?? 0) + order.delivery_fee
}
