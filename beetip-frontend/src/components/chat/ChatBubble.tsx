import type { MessageDTO } from '../../types/api'
import { cn } from '../../utils/className'
import { formatDateTime } from '../../utils/format'

type ChatBubbleProps = {
  message: MessageDTO
  isOwnMessage: boolean
}

export function ChatBubble({ message, isOwnMessage }: ChatBubbleProps) {
  return (
    <div
      className={cn(
        'flex',
        isOwnMessage ? 'justify-end' : 'justify-start',
      )}
    >
      <div
        className={cn(
          'max-w-xs rounded-2xl px-4 py-3 shadow-card',
          isOwnMessage
            ? 'bg-campus-primary text-campus-on-primary'
            : 'border border-campus-outline/60 bg-campus-card text-campus-text',
        )}
      >
        <p className="wrap-break-words font-sans text-sm leading-5">
          {message.content}
        </p>
        <p
          className={cn(
            'mt-2 font-sans text-xs leading-4',
            isOwnMessage ? 'text-campus-on-primary/80' : 'text-campus-muted',
          )}
        >
          {formatDateTime(message.timestamp)}
        </p>
      </div>
    </div>
  )
}
