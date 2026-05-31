import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react'
import { cn } from '../../utils/className'

type SharedFieldProps = {
  label: string
  helperText?: string
  error?: string
  trailing?: ReactNode
  inputTrailing?: ReactNode
}

type InputFieldProps = SharedFieldProps &
  InputHTMLAttributes<HTMLInputElement> & {
    multiline?: false
  }

type TextareaFieldProps = SharedFieldProps &
  TextareaHTMLAttributes<HTMLTextAreaElement> & {
    multiline: true
  }

type FormFieldProps = InputFieldProps | TextareaFieldProps

export function FormField({
  label,
  helperText,
  error,
  trailing,
  inputTrailing,
  className,
  multiline,
  ...fieldProps
}: FormFieldProps) {
  const describedBy =
    helperText || error ? `${fieldProps.id ?? fieldProps.name}-field-note` : undefined

  return (
    <label className="grid gap-2">
      <span className="flex items-center justify-between gap-2">
        <span className="font-sans text-sm font-semibold leading-5 text-campus-text">
          {label}
        </span>
        {trailing}
      </span>

      {multiline ? (
        <textarea
          className={cn(
            'min-h-28 rounded-xl border border-campus-outline bg-campus-field px-4 py-3 font-sans text-sm leading-5 text-campus-text outline-none focus:border-campus-primary',
            error && 'border-campus-error',
            className,
          )}
          aria-describedby={describedBy}
          {...(fieldProps as TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      ) : (
        <span className="relative block">
          <input
            className={cn(
              'h-12 w-full rounded-xl border border-campus-outline bg-campus-field px-4 font-sans text-sm leading-5 text-campus-text outline-none focus:border-campus-primary',
              Boolean(inputTrailing) && 'pr-12',
              error && 'border-campus-error',
              className,
            )}
            aria-describedby={describedBy}
            {...(fieldProps as InputHTMLAttributes<HTMLInputElement>)}
          />
          {inputTrailing ? (
            <span className="absolute inset-y-0 right-3 flex items-center">
              {inputTrailing}
            </span>
          ) : null}
        </span>
      )}

      {error || helperText ? (
        <span
          id={describedBy}
          className={cn(
            'font-sans text-xs leading-4',
            error ? 'text-campus-error' : 'text-campus-muted',
          )}
        >
          {error ?? helperText}
        </span>
      ) : null}
    </label>
  )
}
