import { type FormEvent, useState } from 'react'
import { PrimaryActionButton } from '../actions/ActionButton'

type ChatComposerProps = {
  disabled?: boolean
  placeholder?: string
  onSend: (content: string) => void
}

export function ChatComposer({
  disabled,
  placeholder = 'Message about this order',
  onSend,
}: ChatComposerProps) {
  const [content, setContent] = useState('')
  const trimmedContent = content.trim()

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!trimmedContent || disabled) {
      return
    }

    onSend(trimmedContent)
    setContent('')
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="sticky bottom-4 mt-auto rounded-3xl bg-campus-card p-2 shadow-floating"
    >
      <div className="flex items-end gap-2">
        <label className="flex min-w-0 flex-1">
          <span className="sr-only">Message</span>
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder={placeholder}
            rows={1}
            disabled={disabled}
            className="block max-h-28 min-h-12 w-full resize-none rounded-2xl border border-campus-outline bg-campus-field px-4 py-3 font-sans text-sm leading-5 text-campus-text outline-none focus:border-campus-primary disabled:cursor-not-allowed disabled:opacity-60"
          />
        </label>
        <PrimaryActionButton
          type="submit"
          fullWidth={false}
          disabled={disabled || !trimmedContent}
          className="h-12 min-h-12 px-5"
        >
          Send
        </PrimaryActionButton>
      </div>
    </form>
  )
}
