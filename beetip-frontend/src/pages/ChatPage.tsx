import { useCallback, useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ChatComposer } from '../components/chat/ChatComposer'
import { ChatThread } from '../components/chat/ChatThread'
import { OrderContextHeader } from '../components/chat/OrderContextHeader'
import { Notice } from '../components/layout/Notice'
import { PageShell } from '../components/layout/PageShell'
import { StatusChip } from '../components/orders/StatusChip'
import { ApiClientError } from '../services/apiClient'
import { createChatSocketClient, type ChatSocketClient } from '../services/chatSocket'
import { getMessages, getOrder } from '../services/ordersApi'
import { useAuth } from '../state/AuthContext'
import type { MessageDTO, OrderDTO } from '../types/api'

export function ChatPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const socketClientRef = useRef<ChatSocketClient | null>(null)
  const [order, setOrder] = useState<OrderDTO | null>(null)
  const [messages, setMessages] = useState<MessageDTO[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isConnected, setIsConnected] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [socketError, setSocketError] = useState('')

  const loadChat = useCallback(async () => {
    if (!id) {
      setLoadError('Missing order ID.')
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setLoadError('')

    try {
      const [orderResponse, messagesResponse] = await Promise.all([
        getOrder(id),
        getMessages(id),
      ])
      setOrder(orderResponse.order)
      setMessages(messagesResponse.messages)
    } catch (error) {
      setLoadError(getErrorMessage(error, 'Unable to load this chat.'))
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    void Promise.resolve().then(loadChat)
  }, [loadChat])

  useEffect(() => {
    if (!id) {
      return
    }

    const orderId = id
    const client = createChatSocketClient()

    function handleConnect() {
      setIsConnected(true)
      setSocketError('')
      client.joinRoom(orderId)
    }

    function handleDisconnect() {
      setIsConnected(false)
    }

    client.socket.on('connect', handleConnect)
    client.socket.on('disconnect', handleDisconnect)

    const removeRoomJoinedListener = client.onRoomJoined(() => {
      setSocketError('')
    })
    const removeMessageListener = client.onReceiveMessage((message) => {
      setMessages((currentMessages) => appendMessage(currentMessages, message))
    })
    const removeOrderListener = client.onOrderStatusChanged((payload) => {
      setOrder(payload.order)
    })
    const removeSocketErrorListener = client.onError((payload) => {
      setSocketError(payload.message)
    })

    socketClientRef.current = client
    client.connect()

    return () => {
      removeRoomJoinedListener()
      removeMessageListener()
      removeOrderListener()
      removeSocketErrorListener()
      client.socket.off('connect', handleConnect)
      client.socket.off('disconnect', handleDisconnect)
      client.cleanup()
      socketClientRef.current = null
    }
  }, [id])

  function handleSend(content: string) {
    if (!id || !socketClientRef.current || !isConnected) {
      return
    }

    socketClientRef.current.sendMessage(id, content)
  }

  return (
    <PageShell
      title="Order chat"
      description={
        isConnected ? 'Connected to the order room.' : 'Connecting to chat.'
      }
      backTo={id ? `/orders/${id}` : '/home'}
      action={order ? <StatusChip status={order.status} /> : null}
    >
      {isLoading ? <Notice>Loading chat history.</Notice> : null}

      {loadError ? (
        <Notice tone="error">
          <span>{loadError}</span>
          <button
            type="button"
            onClick={loadChat}
            className="mt-3 block font-sans text-sm font-semibold leading-5 text-campus-primary"
          >
            Try again
          </button>
        </Notice>
      ) : null}

      {socketError ? <Notice tone="error">{socketError}</Notice> : null}

      {order ? <OrderContextHeader order={order} /> : null}

      {user ? (
        <ChatThread messages={messages} currentUserId={user.id} />
      ) : (
        <Notice tone="error">Unable to identify the current user.</Notice>
      )}

      <ChatComposer
        disabled={!isConnected || Boolean(loadError) || !user}
        onSend={handleSend}
        placeholder={isConnected ? 'Type a message' : 'Waiting for connection'}
      />
    </PageShell>
  )
}

function appendMessage(messages: MessageDTO[], incomingMessage: MessageDTO) {
  if (messages.some((message) => message.id === incomingMessage.id)) {
    return messages
  }

  return [...messages, incomingMessage]
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof ApiClientError ? error.message : fallback
}
