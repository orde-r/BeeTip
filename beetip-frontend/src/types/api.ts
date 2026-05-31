export type ApiErrorShape = {
  message?: unknown
}

export type UserDTO = {
  id: string
  email: string
  balance: number
  current_role: string
  createdAt?: string
}

export type OrderStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'PRICED'
  | 'PAID'
  | 'COMPLETED'
  | 'CANCELLED'

export type OrderDTO = {
  id: string
  buyer_id: string
  buyer_email: string | null
  kurir_id: string | null
  kurir_email: string | null
  to_location: string
  item_desc: string
  item_price: number | null
  receipt_image_url: string | null
  delivery_fee: number
  status: OrderStatus
  createdAt: string
}

export type TransactionType = 'DEPOSIT' | 'PAYMENT' | 'EARNING' | string

export type TransactionDTO = {
  id: string
  type: TransactionType
  amount: number
  createdAt: string
}

export type MessageDTO = {
  id: string
  order_id: string
  sender_id: string
  content: string
  timestamp: string
}

export type RegisterRequest = {
  email: string
  password: string
}

export type LoginRequest = RegisterRequest

export type RegisterResponse = {
  message: string
  user: UserDTO
}

export type LoginResponse = {
  message: string
  user: UserDTO
}

export type MeResponse = {
  user: UserDTO
}

export type LogoutResponse = {
  message: string
}

export type OrderListResponse = {
  orders: OrderDTO[]
  total: number
}

export type OrderResponse = {
  message?: string
  order: OrderDTO
}

export type CreateOrderRequest = {
  to_location: string
  item_desc: string
}

export type PriceOrderRequest = {
  item_price: number
  receipt_image_url?: string
}

export type PayOrderResponse = OrderResponse & {
  message: string
  security_code: string
}

export type CompleteOrderRequest = {
  security_code: string
}

export type MessagesResponse = {
  messages: MessageDTO[]
}

export type TransactionHistoryResponse = {
  transactions: TransactionDTO[]
  total: number
}

export type DepositRequest = {
  amount: number
}

export type DepositResponse = {
  message: string
  transaction: TransactionDTO
  new_balance: number
}
