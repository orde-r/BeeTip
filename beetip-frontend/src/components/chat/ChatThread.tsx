import { ChatBubble } from './ChatBubble'
import type { MessageDTO } from '../../types/api'

type ChatThreadProps = {
  messages: MessageDTO[]
  currentUserId: string
}

export function ChatThread({ messages, currentUserId }: ChatThreadProps) {
  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-6 text-center">
        <p className="font-sans text-sm leading-5 text-campus-muted">
          No messages yet.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-3">
      {messages.map((message) => (
        <ChatBubble
          key={message.id}
          message={message}
          isOwnMessage={message.sender_id === currentUserId}
        />
      ))}
    </div>
  )
}
