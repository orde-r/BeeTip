import { useState } from 'react'
import type { KeyboardEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  GhostActionButton,
  PrimaryActionButton,
} from '../components/actions/ActionButton'
import { AuthFormShell } from '../components/auth/AuthFormShell'
import { FormField } from '../components/auth/FormField'
import { Notice } from '../components/layout/Notice'
import { PageShell } from '../components/layout/PageShell'
import { getAuthenticatedEntryPath } from '../app/routes'
import { ApiClientError } from '../services/apiClient'
import { login, register } from '../services/authApi'
import { useAuth } from '../store'

type AuthMode = 'login' | 'register'

type AuthFormState = {
  email: string
  password: string
  confirmPassword: string
}

type AuthFieldErrors = Partial<Record<keyof AuthFormState, string>>

const initialFormState: AuthFormState = {
  email: '',
  password: '',
  confirmPassword: '',
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function AuthPage() {
  const navigate = useNavigate()
  const { setAuthSession } = useAuth()
  const [mode, setMode] = useState<AuthMode>('login')
  const [formState, setFormState] = useState<AuthFormState>(initialFormState)
  const [fieldErrors, setFieldErrors] = useState<AuthFieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const isRegistering = mode === 'register'

  function updateFormField(field: keyof AuthFormState, value: string) {
    setFormState((currentState) => ({
      ...currentState,
      [field]: value,
    }))
    setFieldErrors((currentErrors) => ({
      ...currentErrors,
      [field]: undefined,
    }))
    setFormError(null)
  }

  function switchMode(nextMode: AuthMode) {
    setMode(nextMode)
    setFieldErrors({})
    setFormError(null)
    setSuccessMessage(null)
    setFormState(initialFormState)
    setShowPassword(false)
    setShowConfirmPassword(false)
  }

  async function handleSubmit() {
    setFormError(null)
    setSuccessMessage(null)

    const email = formState.email.trim()
    const password = formState.password
    const nextFieldErrors = validateAuthFields({
      ...formState,
      email,
    })

    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors)
      return
    }

    setFieldErrors({})

    setIsSubmitting(true)

    try {
      if (isRegistering) {
        await register({ email, password })
        const response = await login({ email, password })

        if (!response.user) {
          throw new ApiClientError('Unable to load account after registration.', 0)
        }

        setAuthSession(response.user)
        navigate(getAuthenticatedEntryPath(), { replace: true })
        return
      }

      const response = await login({ email, password })

      if (!response.user) {
        throw new ApiClientError('Unable to load account after login.', 0)
      }

      setAuthSession(response.user)
      navigate(getAuthenticatedEntryPath(), { replace: true })
    } catch (error) {
      setFormError(getErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleFieldBlur(field: keyof AuthFormState) {
    const value =
      field === 'email' ? formState.email.trim() : formState[field]
    const error = validateAuthField(field, value)

    setFieldErrors((currentErrors) => ({
      ...currentErrors,
      [field]: error,
    }))
  }

  function handleAuthKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== 'Enter' || isSubmitting) {
      return
    }

    event.preventDefault()
    void handleSubmit()
  }

  function validateAuthFields(values: AuthFormState) {
    const errors: AuthFieldErrors = {}
    const emailError = validateAuthField('email', values.email)
    const passwordError = validateAuthField('password', values.password)

    if (emailError) {
      errors.email = emailError
    }

    if (passwordError) {
      errors.password = passwordError
    }

    if (isRegistering) {
      const confirmPasswordError = validateAuthField(
        'confirmPassword',
        values.confirmPassword,
      )

      if (confirmPasswordError) {
        errors.confirmPassword = confirmPasswordError
      } else if (values.password !== values.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match.'
      }
    }

    return errors
  }

  function validateAuthField(field: keyof AuthFormState, value: string) {
    if (field === 'email') {
      if (!value) {
        return 'Email is required.'
      }

      if (!emailPattern.test(value)) {
        return 'Enter a valid email address.'
      }

      return undefined
    }

    if (field === 'password') {
      if (!value) {
        return 'Password is required.'
      }

      if (value.length < 8) {
        return 'Password must be at least 8 characters.'
      }

      return undefined
    }

    if (isRegistering && !value) {
      return 'Confirm your password.'
    }

    return undefined
  }

  function getErrorMessage(error: unknown) {
    if (error instanceof ApiClientError) {
      return error.message
    }

    return 'Something went wrong. Please try again.'
  }

  return (
    <PageShell
      title={isRegistering ? 'Create account' : 'Welcome back'}
      description="Use your campus email to continue into BeeTip."
      action={null}
    >
      <AuthFormShell
        title={isRegistering ? 'Register for BeeTip' : 'Login to BeeTip'}
        caption={
          isRegistering
            ? 'Create a student account to use buyer and kurir tools.'
            : 'Access orders, chats, and wallet details.'
        }
        mode={mode}
        onModeChange={switchMode}
      >
        <div className="space-y-4" onKeyDown={handleAuthKeyDown}>
          {successMessage ? (
            <Notice tone="success">{successMessage}</Notice>
          ) : null}
          {formError ? <Notice tone="error">{formError}</Notice> : null}

          <FormField
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="student@binus.ac.id"
            value={formState.email}
            error={fieldErrors.email}
            onChange={(event) => updateFormField('email', event.target.value)}
            onBlur={() => handleFieldBlur('email')}
          />
          <FormField
            label="Password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete={
              isRegistering ? 'new-password' : 'current-password'
            }
            placeholder="At least 8 characters"
            value={formState.password}
            error={fieldErrors.password}
            inputTrailing={
              <PasswordVisibilityButton
                isVisible={showPassword}
                onToggle={() => setShowPassword((currentValue) => !currentValue)}
              />
            }
            onChange={(event) =>
              updateFormField('password', event.target.value)
            }
            onBlur={() => handleFieldBlur('password')}
          />
          {isRegistering ? (
            <FormField
              label="Confirm password"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Repeat your password"
              value={formState.confirmPassword}
              error={fieldErrors.confirmPassword}
              inputTrailing={
                <PasswordVisibilityButton
                  isVisible={showConfirmPassword}
                  onToggle={() =>
                    setShowConfirmPassword((currentValue) => !currentValue)
                  }
                />
              }
              onChange={(event) =>
                updateFormField('confirmPassword', event.target.value)
              }
              onBlur={() => handleFieldBlur('confirmPassword')}
            />
          ) : null}

          <PrimaryActionButton
            type="button"
            onClick={() => void handleSubmit()}
            disabled={isSubmitting}
          >
            {isSubmitting
              ? 'Please wait'
              : isRegistering
                ? 'Create account'
                : 'Login'}
          </PrimaryActionButton>
          <GhostActionButton
            type="button"
            onClick={() => switchMode(isRegistering ? 'login' : 'register')}
            disabled={isSubmitting}
          >
            {isRegistering ? 'I already have an account' : 'Create new account'}
          </GhostActionButton>
        </div>
      </AuthFormShell>
    </PageShell>
  )
}

function PasswordVisibilityButton({
  isVisible,
  onToggle,
}: {
  isVisible: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={isVisible ? 'Hide password' : 'Show password'}
      className="inline-flex size-8 items-center justify-center rounded-full text-campus-muted transition hover:text-campus-primary focus:outline-none focus:ring-2 focus:ring-campus-primary"
    >
      {isVisible ? <EyeOffIcon /> : <EyeIcon />}
    </button>
  )
}

function EyeIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="m3 3 18 18" />
      <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
      <path d="M9.9 4.2A10.8 10.8 0 0 1 12 4.1c6.5 0 10 7.9 10 7.9a18.2 18.2 0 0 1-2.6 3.8" />
      <path d="M6.6 6.8A17.7 17.7 0 0 0 2 12s3.5 7.9 10 7.9a9.8 9.8 0 0 0 4.3-1" />
    </svg>
  )
}
