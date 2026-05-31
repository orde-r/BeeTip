import { io } from 'socket.io-client'
import type { Socket } from 'socket.io-client'
import type { MessageDTO, OrderDTO } from '../types/api'

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000'
).replace(/\/$/, '')

export type RoomJoinedPayload = {
  order_id: string
  room: string
}

export type SocketErrorPayload = {
  message: string
}

export type OrderStatusChangedPayload = {
  order: OrderDTO
}

type ServerToClientEvents = {
  room_joined: (payload: RoomJoinedPayload) => void
  receive_message: (message: MessageDTO) => void
  order_status_changed: (payload: OrderStatusChangedPayload) => void
  error: (payload: SocketErrorPayload) => void
}

type ClientToServerEvents = {
  join_room: (payload: { order_id: string }) => void
  send_message: (payload: { order_id: string; content: string }) => void
}

export type ChatSocket = Socket<ServerToClientEvents, ClientToServerEvents>

export function createChatSocket(): ChatSocket {
  return io(`${API_BASE_URL}/chat`, {
    autoConnect: false,
    withCredentials: true,
  })
}

export type ChatSocketClient = {
  socket: ChatSocket
  connect: () => void
  disconnect: () => void
  joinRoom: (orderId: string) => void
  sendMessage: (orderId: string, content: string) => void
  onRoomJoined: (callback: (payload: RoomJoinedPayload) => void) => () => void
  onReceiveMessage: (callback: (message: MessageDTO) => void) => () => void
  onOrderStatusChanged: (
    callback: (payload: OrderStatusChangedPayload) => void,
  ) => () => void
  onError: (callback: (payload: SocketErrorPayload) => void) => () => void
  cleanup: () => void
}

export function createChatSocketClient(): ChatSocketClient {
  const socket = createChatSocket()

  return {
    socket,
    connect() {
      socket.connect()
    },
    disconnect() {
      socket.disconnect()
    },
    joinRoom(orderId) {
      socket.emit('join_room', { order_id: orderId })
    },
    sendMessage(orderId, content) {
      socket.emit('send_message', { order_id: orderId, content })
    },
    onRoomJoined(callback) {
      socket.on('room_joined', callback)

      return () => {
        socket.off('room_joined', callback)
      }
    },
    onReceiveMessage(callback) {
      socket.on('receive_message', callback)

      return () => {
        socket.off('receive_message', callback)
      }
    },
    onOrderStatusChanged(callback) {
      socket.on('order_status_changed', callback)

      return () => {
        socket.off('order_status_changed', callback)
      }
    },
    onError(callback) {
      socket.on('error', callback)

      return () => {
        socket.off('error', callback)
      }
    },
    cleanup() {
      socket.removeAllListeners()
      socket.disconnect()
    },
  }
}
