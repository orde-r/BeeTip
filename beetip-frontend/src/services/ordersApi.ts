import { apiRequest } from './apiClient'
import type {
  CompleteOrderRequest,
  CreateOrderRequest,
  MessagesResponse,
  MessageDTO,
  OrderDTO,
  OrderListResponse,
  OrderResponse,
  PayOrderResponse,
  PriceOrderRequest,
} from '../types/api'

export function getMyOrders() {
  return apiRequest<OrderListResponse>('/orders/my').then(normalizeOrderList)
}

export function createOrder(payload: CreateOrderRequest) {
  return apiRequest<OrderResponse>('/orders', {
    method: 'POST',
    body: payload,
  }).then(normalizeOrderResponse)
}

export function getAvailableOrders() {
  return apiRequest<OrderListResponse>('/orders/available').then(
    normalizeOrderList,
  )
}

export function getOrder(orderId: string) {
  return apiRequest<OrderResponse>(`/orders/${orderId}`).then(
    normalizeOrderResponse,
  )
}

export function acceptOrder(orderId: string) {
  return apiRequest<OrderResponse>(`/orders/${orderId}/accept`, {
    method: 'POST',
  }).then(normalizeOrderResponse)
}

export function priceOrder(orderId: string, payload: PriceOrderRequest) {
  return apiRequest<OrderResponse>(`/orders/${orderId}/price`, {
    method: 'POST',
    body: {
      itemPrice: payload.item_price,
      receiptImageUrl: payload.receipt_image_url,
    },
  }).then(normalizeOrderResponse)
}

export function payOrder(orderId: string) {
  return apiRequest<PayOrderResponse>(`/orders/${orderId}/pay`, {
    method: 'POST',
  }).then((response) => ({
    ...normalizeOrderResponse(response),
    security_code: response.security_code ?? response.securityCode,
    message: response.message,
  }))
}

export function completeOrder(orderId: string, payload: CompleteOrderRequest) {
  return apiRequest<OrderResponse>(`/orders/${orderId}/complete`, {
    method: 'POST',
    body: {
      securityCode: payload.security_code,
    },
  }).then(normalizeOrderResponse)
}

export function cancelOrder(orderId: string) {
  return apiRequest<OrderResponse>(`/orders/${orderId}/cancel`, {
    method: 'POST',
  }).then(normalizeOrderResponse)
}

export function getMessages(orderId: string) {
  return apiRequest<MessagesResponse>(`/orders/${orderId}/messages`).then(
    normalizeMessagesResponse,
  )
}

type RawOrderDTO = Partial<OrderDTO> & {
  buyerId?: string
  buyerEmail?: string | null
  kurirId?: string | null
  kurirEmail?: string | null
  fromLocation?: string
  toLocation?: string
  itemDesc?: string
  itemPrice?: number | null
  receiptImageUrl?: string | null
  deliveryFee?: number
  created_at?: string
}

type RawMessageDTO = Partial<MessageDTO> & {
  orderId?: string
  senderId?: string
}

function normalizeOrderList(response: OrderListResponse): OrderListResponse {
  return {
    ...response,
    orders: response.orders.map(normalizeOrder),
  }
}

function normalizeOrderResponse<T extends OrderResponse>(response: T): T {
  return {
    ...response,
    order: normalizeOrder(response.order),
  }
}

function normalizeMessagesResponse(
  response: MessagesResponse,
): MessagesResponse {
  return {
    ...response,
    messages: response.messages.map(normalizeMessage),
  }
}

export function normalizeOrder(order: RawOrderDTO): OrderDTO {
  return {
    id: order.id ?? '',
    buyer_id: order.buyer_id ?? order.buyerId ?? '',
    buyer_email: order.buyer_email ?? order.buyerEmail ?? null,
    kurir_id: order.kurir_id ?? order.kurirId ?? null,
    kurir_email: order.kurir_email ?? order.kurirEmail ?? null,
    from_location: order.from_location ?? order.fromLocation ?? '',
    to_location: order.to_location ?? order.toLocation ?? '',
    item_desc: order.item_desc ?? order.itemDesc ?? '',
    item_price: order.item_price ?? order.itemPrice ?? null,
    receipt_image_url: order.receipt_image_url ?? order.receiptImageUrl ?? null,
    delivery_fee: order.delivery_fee ?? order.deliveryFee ?? 5000,
    status: order.status ?? 'PENDING',
    createdAt: order.createdAt ?? order.created_at ?? new Date().toISOString(),
    updatedAt: order.updatedAt ?? order.createdAt ?? order.created_at ?? new Date().toISOString(),
  }
}

export function normalizeMessage(message: RawMessageDTO): MessageDTO {
  return {
    id: message.id ?? '',
    order_id: message.order_id ?? message.orderId ?? '',
    sender_id: message.sender_id ?? message.senderId ?? '',
    content: message.content ?? '',
    timestamp: message.timestamp ?? new Date().toISOString(),
  }
}
